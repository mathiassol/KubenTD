const { app, BrowserWindow, Menu, ipcMain, screen } = require('electron')
const path = require('path')
const fs = require('fs')
const ini = require('ini')

let win

function createWindow () {
    
    const { width, height } = screen.getPrimaryDisplay().workAreaSize

    let windowWidth = 1280
    let windowHeight = 720
    
    win = new BrowserWindow({
        width: windowWidth,
        height: windowHeight,
        x: Math.floor((width - windowWidth) / 2),
        y: Math.floor((height - windowHeight) / 2),
        resizable: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
        },
        frame: true,
    })

    win.webContents.on('console-message', (event, level, message, line, sourceId) => {
        console.log(`[Console ${level === 0 ? 'log' : level === 1 ? 'warn' : 'error'}] ${message} (Source: ${sourceId}, Line: ${line})`);
    });

    Menu.setApplicationMenu(null)
    win.loadFile('index.html')
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

ipcMain.on('reloadApp', () => {
    win.reload();
});
