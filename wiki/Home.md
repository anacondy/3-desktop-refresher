# Retro Desktop Refresher

Welcome to the **Retro Desktop Refresher**! This is a simple, easy-to-use desktop application that helps you quickly refresh your Windows desktop. We made it work across modern and older Windows versions, and it even supports Linux!

It is built for speed and will run smoothly even on low-end computers. For higher-end screens, it can handle 60 fps, 90 fps, 120 fps, and up to 144 fps to ensure you get a glassy, fast experience.

## Download Now
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

## Why uses this app?
1. **Low Size:** We pack and compress everything so it doesn't take up space.
2. **Speed:** Super fast hardware acceleration means less technical debt and more FPS.
3. **Old Windows Supported:** Yes, it will work on older 32-bit (ia32) Windows systems.
4. **Secure:** Fully isolated backend contexts.

Have fun smoothing out your desktop!
