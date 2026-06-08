# Retro Desktop Refresher

Welcome to the **Retro Desktop Refresher**! This is a simple, easy-to-use desktop application that helps you quickly refresh your Windows desktop. We made it work across modern and older Windows versions, and it even supports Linux!

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

*(Note: Requires Git and Node.js installed on your PC)*

---

## Specs & Device Support
This application is heavily optimized to run on virtually any device:
*   **Space Required**: ~50 MB to download (Highly compressed), ~150 MB when extracted/installed.
*   **RAM Usage**: Super lightweight (~50-80 MB while running).
*   **Supported Systems**: 
    *   Modern Windows (10, 11) - 64-bit
    *   Older Windows - 32-bit (`ia32`) Supported!
    *   Linux (.AppImage)
*   **Performance (FPS & Displays)**: Hardware Accelerated! Syncs organically to your monitor's refresh rate (60Hz, 90Hz, 120Hz, 144Hz+).

## Download Ready-to-use Builds
The latest built versions are always ready to download. Go to the [Actions tab](https://github.com/anacondy/3-desktop-refresher/actions), select the latest run, and download the `windows-latest-build` (for Windows) or `ubuntu-latest-build` (for Linux).

## Easy Installation
### Windows (.exe)
1. Download the executable file from the Actions tab.
2. Double-click the file to install. The installer handles everything for you.
3. Open "Retro Desktop Refresher".

### Linux (.AppImage)
1. Download the AppImage file.
2. Make it executable:
   ```bash
   chmod +x Retro*.AppImage
   ```
3. Run the file by double-clicking it.

## For Developers (Build it yourself)
Do you want to see how it works or make changes? Great!

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

Have fun smoothing out your desktop!