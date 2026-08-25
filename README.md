# Retro Desktop Refresher

Welcome to the **Retro Desktop Refresher**! This is a simple, easy-to-use desktop application that helps you quickly refresh your Windows desktop — made for fun. It draws a retro CRT-style console and makes your desktop icons blink by nudging the Windows shell.

## Run instantly with a Single Command (Windows)
Don't want to install anything right away? You can run the app directly from GitHub with **just one command**!
Open your **PowerShell** and paste one of the following:

### Latest (smart) version

```powershell
irm https://raw.githubusercontent.com/anacondy/3-desktop-refresher/main/start.ps1 | iex
```

### Stable (last verified) version
```powershell
irm https://raw.githubusercontent.com/anacondy/3-desktop-refresher/main/start-stable.ps1 | iex
```

The stable command pins to the commit listed in `stable-version.txt`.

**Prerequisites:** Requires Git and Node.js (with npm) installed on your PC.

The script will automatically:
- ✓ Check if Git and Node.js are installed
- ✓ Download the pinned version of the app
- ✓ Install all required npm packages
- ✓ Launch the application

---

## Download and Run (no installation tools required)

Prefer a ready-to-use program? Download a **release build** from the [GitHub Releases page](https://github.com/anacondy/3-desktop-refresher/releases).
Every asset below is **self-contained**: it runs standalone — you do **not** need Git, Node.js, or any other development tooling.

Pick the asset that matches your system:

| Your system | Download | How to run it |
|---|---|---|
| Windows 10 / 11 — 64-bit | `Retro-Desktop-Refresher-Windows-x64-setup.exe` | Run the installer, then launch "Retro Desktop Refresher" |
| Windows 10 / 11 — 32-bit | `Retro-Desktop-Refresher-Windows-ia32-setup.exe` | Run the installer, then launch "Retro Desktop Refresher" |
| macOS — Apple Silicon (M1/M2/M3/M4) | `Retro-Desktop-Refresher-macOS-arm64.zip` | Unzip, drag **Retro Desktop Refresher.app** into *Applications* |
| macOS — Intel | `Retro-Desktop-Refresher-macOS-x64.zip` | Unzip, drag **Retro Desktop Refresher.app** into *Applications* |
| Linux — x64 (64-bit) | `Retro-Desktop-Refresher-Linux-x64.AppImage` | `chmod +x` it, then double-click (or run from a terminal) |

> Latest builds of the current `main` branch (between releases) can also be found as artifacts on the [Actions tab](https://github.com/anacondy/3-desktop-refresher/actions).

### First-run notes (important)

- **Windows (SmartScreen):** the release builds are open-source but **not code-signed**. Windows may show *"Windows protected your PC"*. Click **More info** → **Run anyway** to continue. This is expected for an unsigned app.
- **macOS (Gatekeeper):** the release builds are **not code-signed/notarized**. If macOS says the app can't be opened, **right-click the app → Open** (confirm once in the dialog), or go to *System Settings → Privacy & Security* and click **Open Anyway**. You only do this once.
- **Linux (FUSE):** AppImages normally need FUSE support (standard on most desktop distros). If you get a FUSE error, run it with the extract flag instead:
  ```bash
  chmod +x Retro-Desktop-Refresher-Linux-x64.AppImage
  ./Retro-Desktop-Refresher-Linux-x64.AppImage --appimage-extract-and-run
  ```

### Supported systems (honest status)

- **Windows 10 / 11 (64-bit)** — fully supported, including the desktop refresh feature.
- **Windows 10 / 11 (32-bit)** — supported via the `ia32` installer.
- **Windows 7 / 8 / 8.1** — **not supported.** The app runs on Electron 42, whose engine requires Windows 10 or newer.
- **macOS (Apple Silicon + Intel)** — the app runs normally, but see the note below: the refresh feature itself is a Windows API.
- **Linux x64** — the app runs normally (AppImage), same note as macOS.
- **Other Linux architectures (ARM, i686, ...)** — not provided.

> **What "refresh" does, per platform:** the desktop blink is implemented with the Windows `SHChangeNotify` API. On **Windows** it actually refreshes the desktop (icons blink). On **macOS and Linux** that API does not exist, so the app is fully usable (retro console, particles, counter, auto-cycle) and the refresh action is intentionally a no-op there.

### Specs
*   **Download size:** ~100–130 MB per platform asset (highly compressed; the Electron runtime is bundled inside).
*   **RAM usage:** ~150–200 MB while running — normal for an Electron app (the window runs as a few small Electron processes, see Task Manager). CPU stays near idle between the 10-second refresh cycles; each refresh briefly spikes the CPU while Windows redraws the desktop icons.
*   **Performance:** hardware-accelerated UI, syncs to your monitor's refresh rate (60 Hz, 90 Hz, 120 Hz, 144 Hz+).

## Easy Installation (summary)

### Windows (.exe installer)
1. Download the installer for your architecture from the [Releases page](https://github.com/anacondy/3-desktop-refresher/releases).
2. Double-click it to install (you can choose the install folder).
3. Open **Retro Desktop Refresher** from the Start menu / desktop shortcut.

### macOS (.zip)
1. Download the `.zip` for your CPU (Apple Silicon → `arm64`, Intel → `x64`).
2. Unzip it and drag **Retro Desktop Refresher.app** into *Applications*.
3. First launch: right-click → **Open** (unsigned build, see above).

### Linux (.AppImage)
1. Download the AppImage.
2. Make it executable:
   ```bash
   chmod +x Retro-Desktop-Refresher-Linux-x64.AppImage
   ```
3. Run it by double-clicking or from a terminal.

## For Developers (Build it yourself)
Do you want to see how it works or make changes? Great!

### Quick Start
1. Clone this code to your computer:
   ```bash
   git clone https://github.com/anacondy/3-desktop-refresher.git
   cd 3-desktop-refresher
   ```
2. Install the necessary tools:
   ```bash
   npm install
   ```
3. Start the app:
   ```bash
   npm start
   ```
4. Build the executable yourself:
   ```bash
   npm run build
   ```
   (per platform: `npm run build:win`, `npm run build:mac`, `npm run build:linux` — each must run on its own operating system)

### Requirements
- **Git**: v2.20.0 or higher
- **Node.js**: v22.12.0 or higher (includes npm) — required by `electron@42`

Have fun smoothing out your desktop!
