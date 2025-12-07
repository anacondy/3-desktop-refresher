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
function createWindow() {
    const win = new BrowserWindow({
        width: 1000,
        height: 700,
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
}

// --- 3. THE BRIDGE (Connecting UI to Backend) ---
// Listen for the signal from your Retro UI
ipcMain.handle('perform-refresh', () => {
    refreshDesktop();
    return "SUCCESS";
});

// --- 4. APP LIFECYCLE ---
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
