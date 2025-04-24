const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    changeDisplayMode: (mode) => ipcRenderer.send('change-display-mode', mode),
    getCurrentSettings: () => ipcRenderer.invoke('get-current-settings'),
    saveSettings: (settings) => ipcRenderer.send('save-settings', settings),
    quitApp: () => ipcRenderer.send('quitApp')
});