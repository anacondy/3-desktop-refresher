# GitHub Actions Workflow Documentation

## Overview

The build workflow produces ready-to-use release packages for the Retro Desktop
Refresher application. On every version tag it also creates a **draft** GitHub
release with all assets attached — the draft is reviewed and published manually.

## Workflow File

**Staged in this PR:** `release-pipeline/build-and-release.yml`
(The session bot lacks the GitHub "workflows" permission, so the pipeline
ships as a plain file. **At merge time, move it to
`.github/workflows/build-and-release.yml`**, replacing the existing file,
and delete the `release-pipeline/` folder.)

Location after merge: `.github/workflows/build-and-release.yml`

## Triggers

1. **Push to `main`** — builds all platforms, uploads artifacts (no release).
2. **Pull request to `main`** — builds all platforms to verify the PR.
3. **Version tag (`v*`)** — builds all platforms and, once **every** build
   succeeds, creates a **draft** GitHub release with all assets.
4. **Manual dispatch** — "Run workflow" button on the GitHub Actions tab.

## Build Matrix

Each OS is built on its own native runner (electron-builder cannot
cross-compile across operating systems):

| Platform | Runner | Outputs |
|----------|--------|---------|
| Windows | `windows-latest` | `Retro-Desktop-Refresher-Windows-x64-setup.exe`, `Retro-Desktop-Refresher-Windows-ia32-setup.exe` (NSIS installers) |
| macOS | `macos-latest` | `Retro-Desktop-Refresher-macOS-arm64.zip`, `Retro-Desktop-Refresher-macOS-x64.zip` (portable zips containing the `.app`) |
| Linux | `ubuntu-latest` | `Retro-Desktop-Refresher-Linux-x64.AppImage` |

Notes:
- macOS ships as **portable `.zip`** (not `.dmg`) because the builds are not
  code-signed; a zip is the more robust unsigned distribution format.
- Windows **ia32** is kept because Electron 42 still ships a 32-bit Windows
  build and `koffi` ships a `win32_ia32` prebuilt native binary.
- Windows NSIS uses `buildUniversalInstaller: false` so the release gets
  exactly one installer per architecture. (electron-builder's default for
  multi-arch NSIS is a *universal* combined x64+ia32 installer, ~200 MB,
  whose name omits the architecture — unwanted for clean release assets.)
- `koffi` ships prebuilt native binaries for all target platforms, so no
  C/C++ toolchain is required on any runner.

## Workflow Steps

### Build job (runs once per platform)

1. **Checkout code** — `actions/checkout` pinned to commit
   `11d5960a326750d5838078e36cf38b85af677262` (v4.4.0)
2. **Setup Node.js** — `actions/setup-node` pinned to commit
   `49933ea5288caeca8642d1e84afbd3f7d6820020` (v4.4.0), Node 22 LTS
   (`electron@42` declares `node >= 22.12.0`), npm cache enabled
3. **Install dependencies** — `npm ci` (reproducible from `package-lock.json`)
4. **Build** — `npm run build:win` / `npm run build:mac` / `npm run build:linux`
5. **Upload artifacts** — `actions/upload-artifact` pinned to commit
   `ea165f8d65b6e75b540449e92b4886f43607fa02` (v4.6.2), one artifact per
   platform: `retro-refresher-Windows`, `retro-refresher-macOS`,
   `retro-refresher-Linux`

### Release job (only on version tags, after all builds succeed)

1. **Download** all three build artifacts (`actions/download-artifact` pinned
   to commit `d3f86a106a0bac45b974a628896c90dbdf5c8093`, v4.3.0)
2. **Collect** the distribution files (`.exe`, `.zip`, `.AppImage`) and
   verify the set is **exactly** the 5 expected asset names — the job fails
   on any missing or unexpected file, so a partial or duplicated release can
   never be created
3. **Create a draft release** with the `gh` CLI (preinstalled on the runner,
   `GH_TOKEN` with `contents: write`) — `gh release create <tag> --draft`.
   The release is **never auto-published**.

## How to Publish a Release

```bash
# 1. Make sure main is merged and green.
# 2. Tag the release commit (version must match package.json):
git tag v1.3.1
git push origin v1.3.1
# 3. The workflow builds all platforms and creates a DRAFT release.
# 4. Review the draft on the Releases page, then click "Publish release".
```

Result: `https://github.com/anacondy/3-desktop-refresher/releases/tag/v1.3.1`

## Build Artifacts (between releases)

When the workflow runs on `main` or a PR, build artifacts are:
- Available on the GitHub Actions run page
- Retained for the repository's artifact retention period
- Can be downloaded for testing

## Security

- All third-party actions are pinned to **full commit SHAs**.
- `npm ci` installs the exact dependency tree from `package-lock.json`.
- The workflow token is `contents: read` by default; only the release job
  additionally gets `contents: write` (to create the draft release).
- No secrets are required and none are used.
- No signing keys/certificates are involved (builds are unsigned — see the
  first-run notes in the README).

## Troubleshooting

### Build fails on a specific platform
- Check the GitHub Actions logs for that platform's job.
- Verify the build works locally with `npm run build:<platform>` on the
  matching OS.
- Ensure `koffi` still ships a prebuilt for the target platform.

### Release not created
- Verify you pushed a tag starting with `v` (e.g. `v1.3.1`).
- All three build jobs must be green; the release job is skipped otherwise.
- If the tag already has a release, delete the (draft) release and push a new
  tag, or upload assets manually with `gh release upload`.

### Artifacts not uploaded
- Check the artifact paths in the workflow match the build output (`dist/`).
- `if-no-files-found: error` makes the job fail loudly if `dist/` is empty.

---

Last Updated: August 24, 2026
