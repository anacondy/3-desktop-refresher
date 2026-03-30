const { app, BrowserWindow, ipcMain } = require('electron');
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
            contextIsolation: true
        }
    });

    win.loadFile('index.html');

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
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});