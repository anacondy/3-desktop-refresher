const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('sys', {
    triggerRefresh: () => ipcRenderer.invoke('perform-refresh'),
    minApp: () => ipcRenderer.invoke('minimize-app'),
    maxApp: () => ipcRenderer.invoke('maximize-app'),
    closeApp: () => ipcRenderer.invoke('close-app'),

    onMaximized: (callback) => ipcRenderer.on('window-maximized', callback),
    onUnmaximized: (callback) => ipcRenderer.on('window-unmaximized', callback),
    onRestored: (callback) => ipcRenderer.on('window-restored', callback)
});