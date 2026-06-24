const { contextBridge, ipcRenderer } = require('electron');

// ============================================================
// PHASE 4 (L2): safe event forwarding.
// Each onX() now returns a DISPOSER function so the renderer can
// remove the listener (no unbounded listener accumulation / leak).
// Also validates that 'callback' is a real function before registering,
// which is the Electron-recommended preload hardening pattern.
// ============================================================
contextBridge.exposeInMainWorld('sys', {
    triggerRefresh: () => ipcRenderer.invoke('perform-refresh'),
    minApp: () => ipcRenderer.invoke('minimize-app'),
    maxApp: () => ipcRenderer.invoke('maximize-app'),
    closeApp: () => ipcRenderer.invoke('close-app'),

    onMaximized: (callback) => {
        if (typeof callback !== 'function') return () => {};
        const wrapped = (_event, ...args) => callback(...args);
        ipcRenderer.on('window-maximized', wrapped);
        return () => ipcRenderer.removeListener('window-maximized', wrapped);
    },
    onUnmaximized: (callback) => {
        if (typeof callback !== 'function') return () => {};
        const wrapped = (_event, ...args) => callback(...args);
        ipcRenderer.on('window-unmaximized', wrapped);
        return () => ipcRenderer.removeListener('window-unmaximized', wrapped);
    },
    onRestored: (callback) => {
        if (typeof callback !== 'function') return () => {};
        const wrapped = (_event, ...args) => callback(...args);
        ipcRenderer.on('window-restored', wrapped);
        return () => ipcRenderer.removeListener('window-restored', wrapped);
    }
});
