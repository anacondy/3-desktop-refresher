const { app, BrowserWindow, ipcMain, shell, session } = require('electron');
const path = require('path');
const koffi = require('koffi');

// --- 1. THE WINDOWS MAGIC (Backend) ---
// We load the system DLL to talk to the Desktop
const shell32 = koffi.load('shell32.dll');

// FIXED SIGNATURE: Using 'void *' instead of 'ptr' to prevent errors
const SHChangeNotify = shell32.func('void SHChangeNotify(long wEventId, unsigned int uFlags, void *dwItem1, void *dwItem2)');

// Constants for the "Refresh" command
const SHCNE_ASSOCCHANGED = 0x08000000;
const SHCNF_IDLIST = 0x0000;

function refreshDesktop() {
    console.log("SYSTEM: Executing SHChangeNotify...");
    // The nulls represent pointers to nothing, which is what the command expects
    SHChangeNotify(SHCNE_ASSOCCHANGED, SHCNF_IDLIST, null, null);
}

// --- 2. THE APP WINDOW (Frontend) ---
// High Performance & FPS Tweaks (60hz to 144hz+)
app.commandLine.appendSwitch('ignore-gpu-blocklist');
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('disable-software-rasterizer');
app.commandLine.appendSwitch('enable-hardware-overlays');

function createWindow() {
    const win = new BrowserWindow({
        width: 980,
        height: 620,
        minWidth: 420,
        minHeight: 250,
        // FRAMELESS & TRANSPARENT: Crucial for rounded corners!
        frame: false,
        transparent: true,
        backgroundColor: '#00000000', // Completely transparent hex code
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            // PHASE 1 (C1): run the renderer in the Chromium sandbox.
            sandbox: true
        }
    });

    win.loadFile('index.html');

    // PHASE 2 (H2): never let the renderer open an in-app popup window.
    // External http(s) links are handed to the user's real browser.
    win.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('http://') || url.startsWith('https://')) {
            shell.openExternal(url);
        }
        return { action: 'deny' };
    });

    // PHASE 2 (H2): prevent the main page from navigating away from the local file.
    win.webContents.on('will-navigate', (event, url) => {
        const parsed = new URL(url);
        if (parsed.protocol !== 'file:') {
            event.preventDefault();
        }
    });

    // Notify renderer for maximization UI states and keep fullscreen fully opaque
    win.on('maximize', () => {
        win.setBackgroundColor('#0a0800');
        win.webContents.send('window-maximized');
    });
    win.on('unmaximize', () => {
        win.setBackgroundColor('#00000000');
        win.webContents.send('window-unmaximized');
    });
    win.on('restore', () => win.webContents.send('window-restored'));
}

// PHASE 2 (H2): global guard - block new windows / <webview> for ALL web contents.
app.on('web-contents-created', (_event, contents) => {
    contents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('http://') || url.startsWith('https://')) {
            shell.openExternal(url);
        }
        return { action: 'deny' };
    });
    contents.on('will-attach-webview', (event) => event.preventDefault());
});

// --- 3. THE BRIDGE (Connecting UI to Backend) ---
// Listen for the signal from your Retro UI
ipcMain.handle('perform-refresh', () => {
    refreshDesktop();
    return "SUCCESS";
});

ipcMain.handle('minimize-app', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) win.minimize();
});

ipcMain.handle('maximize-app', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
        if (win.isMaximized()) win.unmaximize();
        else win.maximize();
    }
});

ipcMain.handle('close-app', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) win.close();
});

// --- 4. APP LIFECYCLE ---
app.whenReady().then(() => {
    // PHASE 2 (M4): deny all permission requests (camera/mic/geolocation/etc.)
    // by default. This app needs none of them.
    session.defaultSession.setPermissionRequestHandler((_wc, _permission, callback) => callback(false));
    session.defaultSession.setPermissionCheckHandler(() => false);

    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
