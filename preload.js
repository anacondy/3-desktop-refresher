const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('sys', {
    triggerRefresh: () => ipcRenderer.invoke('perform-refresh')
});
