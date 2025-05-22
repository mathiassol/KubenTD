const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    quitApp: () => ipcRenderer.send('quitApp'),
    reloadApp: () => ipcRenderer.send('reloadApp'),
});