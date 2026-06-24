# 🔒 Security & Diagnostics Report — Retro Desktop Refresher

**Project:** `com.anacondy.retro-refresher` (Electron desktop app, Windows-focused)
**Bundle analyzed:** `main.js`, `preload.js`, `index.html`, `package.json`, `package-lock.json`, `start.ps1`, `.github/workflows/*.yml`, `docs/`, `wiki/`, `README.md`
**Date of audit:** 2026-06-24
**Auditor:** Security review (expert, direct)

> Bottom line: the app is **small and well-architected** (proper `contextIsolation: true`, `nodeIntegration: false`, a tight `contextBridge` preload). The real exposure is **one critical dependency problem (EOL Electron)** plus **a dangerous remote-install script** and **missing standard Electron hardening (CSP, sandbox, navigation guards)**. Everything is fixable in a phased way — see the roadmap at the bottom.

---

## 📊 Severity Summary

| Severity | Count | Items |
|----------|-------|-------|
| 🔴 Critical | 2 | C1 (EOL Electron), C2 (Remote-code-install script) |
| 🟠 High | 3 | H1 (No CSP), H2 (No navigation/new-window guards), H3 (Vulnerable transitive deps) |
| 🟡 Medium | 4 | M1 (DLL by bare name), M2 (No renderer sandbox), M3 (Unhardened CI workflows), M4 (No permission hardening) |
| 🔵 Low / Info | 6 | L1 (External fonts/privacy), L2 (IPC listener leak), L3 (Broken Linux support claim), L4 (Unsigned builds), L5 (Docs/CI mismatch), L6 (Transparency compositing) |

---

## 🔴 CRITICAL

### C1 — Outdated, unsupported Electron (28.3.3)
- **File:** `package.json` → `"electron": "^28.0.0"` (resolved `28.3.3`)
- **Evidence:** Electron 28 ships **Chromium 120 + Node.js 18**. Electron 28 reached **End-of-Life on 2024-06-11** — unsupported for ~2 years. The current supported line is **Electron 42 (Chromium 148)**. ~28 Chromium majors (hundreds of CVEs across Blink/V8/networking/sandbox) have **no backport path** for an EOL line.
- **Impact:** Renderer-process memory-safety bugs, V8 type confusions, and sandbox escapes are all unpatched. In any future scenario where the renderer touches untrusted/remote content (or a dep is compromised), these become **Remote Code Execution**. Even fully-local, the Chromium stack carries known high-severity bugs that remain exploitable.
- **Fix:** Upgrade to the newest supported major (**Electron 42.x**), set `sandbox: true`, bump `electron-builder` to a current release, and rebuild. Keep Electron on a supported line going forward (8-week cadence).

### C2 — Remote code-execution install pattern (`irm | iex` + mutable clone + npm install)
- **Files:** `README.md`, `wiki/Home.md`, `start.ps1`
- **Evidence:**
  ```powershell
  irm https://raw.githubusercontent.com/anacondy/3-desktop-refresher/main/start.ps1 | iex
  ```
  `start.ps1` then: clones the **mutable `main` branch** (no commit pin, **no checksum verification**), runs `npm install` (**which executes arbitrary `postinstall` scripts from every dependency**), and `npm start`.
- **Impact:** Classic **supply-chain RCE**. If the repo's `main` branch is compromised (credential theft, malicious PR merged, compromised maintainer) **or any dependency** is hijacked, the next `irm | iex` runs attacker code on every user's machine with their privileges. Users are also trained to pipe remote scripts into `iex`, which is unsafe by habit.
- **Fix:** Recommend the **signed installer** as the primary path. If keeping a script: pin to a **specific commit/tag**, **verify a SHA-256 checksum** before running, clone at that pinned ref, and install with `npm ci --ignore-scripts`. Remove the blanket `irm | iex` from the README.

---

## 🟠 HIGH

### H1 — No Content Security Policy (CSP)
- **File:** `index.html`, `main.js`
- **Evidence:** No CSP header and no `<meta http-equiv="Content-Security-Policy">`. The page uses **inline `<script>` and `<style>`** and **inline `onclick="..."` handlers**, so adding a strict CSP later would currently require `unsafe-inline` (which defeats most of its value).
- **Impact:** The renderer has no defense against script injection. The app is local-only today (`loadFile`), so immediate impact is limited, but any injected/remote content later gets a free hand — and combined with C1's unpatched engine, the blast radius grows.
- **Fix:** (1) Move all inline JS/CSS into **external files** (`app.js`, `app.css`); replace `onclick=` with `addEventListener`. (2) Add a strict CSP:
  ```
  default-src 'self';
  script-src 'self';
  style-src 'self';
  img-src 'self' data:;
  font-src 'self';
  connect-src 'self';
  object-src 'none'; base-uri 'none'; frame-ancestors 'none';
  ```

### H2 — No navigation / new-window containment
- **File:** `main.js`
- **Evidence:** No `app.on('web-contents-created', ...)` handler, no `win.webContents.setWindowOpenHandler(...)`, no `will-navigate` restriction.
- **Impact:** A compromised or tricked renderer could open arbitrary external windows or navigate to remote URLs, which can bypass the (good) `contextIsolation`/`nodeIntegration` assumptions.
- **Fix:**
  ```js
  win.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url); // or { action: 'deny' }
      return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e, url) => {
      if (url !== win.webContents.getURL()) e.preventDefault();
  });
  app.on('web-contents-created', (_e, contents) => {
      contents.setWindowOpenHandler(({ action: 'deny' }));
      contents.on('will-attach-webview', (e) => e.preventDefault());
  });
  ```

### H3 — Vulnerable / deprecated transitive dependencies
- **File:** `package-lock.json`
- **Evidence (spot-checked in tree):**
  - `inflight@1.0.6` — **deprecated**, known memory leak.
  - `glob@7.2.3` — **deprecated**.
  - `tar@6.2.1` — affected by known tar issues; patched in `6.2.2+`.
  - `@xmldom/xmldom@0.8.11` — carry historical XXE/path issues; pin to latest patch.
- **Note:** Most are **devDependencies** (build-time only, pulled in by `electron-builder`), so *runtime* exposure is low — but **build-time** compromise (malicious build artifact) is still real, and scanners will flag them.
- **Fix:** Run `npm audit`, `npm audit fix`, and (carefully) `npm audit fix --force`; bump `electron-builder` to current; regenerate the lockfile with a clean `npm install`. Re-audit after.

---

## 🟡 MEDIUM

### M1 — DLL loaded by bare name (DLL planting / search-order risk)
- **File:** `main.js` → `koffi.load('shell32.dll')`
- **Evidence:** Loads `shell32.dll` by filename only, so the OS uses the **default search order** (app directory is searched **before** `System32`). `shell32` is a *KnownDLL* so practical risk is reduced, but for a portable/installer app this is not best practice.
- **Impact:** Defense-in-depth gap; low real-world likelihood for a system DLL, but it's a flagged pattern.
- **Fix:** Resolve the full path and load explicitly:
  ```js
  const sysRoot = process.env.SystemRoot || 'C:\\Windows';
  const shell32Path = path.join(sysRoot, 'System32', 'shell32.dll');
  const shell32 = koffi.load(shell32Path);
  ```

### M2 — Renderer not sandboxed
- **File:** `main.js` (`webPreferences`)
- **Evidence:** No `sandbox: true`. For a minimal local app the renderer should run sandboxed.
- **Fix:** Add `sandbox: true` to `webPreferences` (pairs naturally with the C1 Electron upgrade).

### M3 — GitHub Actions workflows not hardened
- **Files:** `.github/workflows/build-and-release.yml`, `deploy.yml`, `pages.yml`, `wiki.yml`
- **Evidence:** (a) No explicit `permissions:` block (uses broad default `GITHUB_TOKEN`). (b) Actions pinned by **mutable tags** (`actions/checkout@v4`, `peaceiris/actions-gh-pages@v3`, etc.) instead of commit SHAs. (c) Third-party actions are **outdated** — `peaceiris/actions-gh-pages` is on `@v3` but `@v4` exists. (d) `npm install` used in CI instead of `npm ci` (less reproducible; the project's own `WORKFLOW.md` says it uses `npm ci`).
- **Impact:** Tag-swap / compromised-action risk and inconsistent builds.
- **Fix:** Add `permissions: contents: read` (and `write` only in the release job), pin third-party actions to **SHAs**, bump `peaceiris` to `@v4`+ (or official `actions/deploy-pages`), and switch to `npm ci`.

### M4 — No permission-request hardening
- **File:** `main.js`
- **Evidence:** No `setPermissionRequestHandler` / `setPermissionCheckHandler`.
- **Impact:** Low for this app, but expected hardening; a compromised renderer could request camera/mic/etc.
- **Fix:** Deny everything by default:
  ```js
  session.defaultSession.setPermissionRequestHandler((_wc, _perm, cb) => cb(false));
  ```

---

## 🔵 LOW / INFORMATIONAL

### L1 — External Google Fonts (privacy / fingerprinting / offline)
- **File:** `index.html` → `<link href="https://fonts.googleapis.com/css2?family=VT323&display=swap">`
- **Impact:** Outbound network request, leaks IP/usage to Google, enables font fingerprinting, **breaks offline use**, and must be CSP-whitelisted.
- **Fix:** Self-host `VT323.woff2` (bundle the file, `@font-face` with `src: url('fonts/VT323.woff2')`).

### L2 — IPC listener leak in preload
- **File:** `preload.js` → `ipcRenderer.on(...)`
- **Impact:** Listeners are registered but never removed; minor memory leak over a long-lived window.
- **Fix:** Return a disposer (`return () => ipcRenderer.removeListener(...)`) or use `ipcRenderer.once` where appropriate.

### L3 — Misleading cross-platform claim (functional bug, not just security)
- **File:** `main.js`, `README.md`, `wiki/Home.md`
- **Evidence:** `koffi.load('shell32.dll')` runs **unconditionally at module load** and will **throw on Linux/macOS** (no such library). Yet the README/docs claim Linux `.AppImage` support, and CI even builds a Linux AppImage that will crash at startup.
- **Fix:** Guard the native call: `if (process.platform !== 'win32') { /* graceful no-op / error UI */ return; }`. Either implement a Linux refresh mechanism or correct the docs.

### L4 — Unsigned builds (code-signing absent)
- **File:** `package.json` build config
- **Impact:** Windows SmartScreen warnings + no authenticity/integrity guarantee (already noted as a gap in `WORKFLOW.md`).
- **Fix:** Add Authenticode (Windows) / notarization (macOS) signing.

### L5 — Docs / CI mismatch
- **File:** `.github/WORKFLOW.md` vs `.github/workflows/build-and-release.yml`
- **Evidence:** Docs describe a **macOS matrix** and `npm ci`; the actual workflow builds only Windows + Linux and uses `npm install`. Misleading.
- **Fix:** Align docs with the real workflow (and apply M3).

### L6 — Frameless transparency compositing
- **File:** `main.js` (`transparent: true`, toggling `setBackgroundColor`)
- **Impact:** Mostly cosmetic; transparent + frameless windows can have edge artifacts on some GPUs. No code change required unless you see tearing.

---

## ✅ What's already done right
- `contextIsolation: true` + `nodeIntegration: false` ✅
- Tight, minimal `contextBridge` surface in `preload.js` ✅
- `log()` uses `textContent` (no HTML injection) ✅
- Local `loadFile` (no remote main page) ✅
- `.gitignore` excludes secrets/build output ✅

---

## 🛣️ Phased Remediation Roadmap (patches will be delivered per phase)

| Phase | Scope | Fixes |
|-------|-------|-------|
| **Phase 1 — Critical engine & supply chain** | Highest blast radius | C1 (Electron upgrade + sandbox), C2 (safe install script) |
| **Phase 2 — Renderer hardening** | Lock down the web layer | H1 (CSP + externalized scripts/styles), H2 (navigation/new-window guards), M2 (sandbox), M4 (permissions) |
| **Phase 3 — Native & CI** | Build-time + native | M1 (full-path DLL), M3 (hardened workflows), H3 (`npm audit fix` + lockfile) |
| **Phase 4 — Polish & correctness** | Quality/privacy | L1 (self-host font), L2 (listener cleanup), L3 (Linux guard / doc fix), L5 (docs), L4 (signing — needs certs) |

Each phase will be delivered as **standalone downloadable files** (you said downloads land in your **Downloads** folder, not the project — I'll keep paths relative and give exact copy instructions so there's no path confusion).

---

*End of report. Awaiting go-ahead to begin Phase 1.*
