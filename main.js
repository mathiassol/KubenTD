const { app, BrowserWindow, Menu, ipcMain, screen } = require('electron')
const path = require('path')
const fs = require('fs')
const ini = require('ini')

let win
let displayMode = 'window'
const settingsPath = path.join(__dirname, 'settings.ini')

function loadSettings() {
    try {
        if (fs.existsSync(settingsPath)) {
            const config = ini.parse(fs.readFileSync(settingsPath, 'utf-8'));

            if (config.display) {
                if (config.display.mode) {
                    displayMode = config.display.mode;
                }
                if (config.display.vsync !== undefined) {
                    config.display.vsync = config.display.vsync === 'true';
                }
            }
            return config;
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
    
    return { display: { mode: 'window', vsync: false } };
}

function saveSettings(settings) {
    try {
        const config = settings || { display: {} };

        config.display = config.display || {};
        config.display.mode = displayMode;
        
        // Add this line to save vsync if you have it
        if (settings && settings.display && settings.display.vsync !== undefined) {
            config.display.vsync = settings.display.vsync;
        }

        fs.writeFileSync(settingsPath, ini.stringify(config));
    } catch (error) {
        console.error('Error saving settings:', error);
    }
}

function createWindow () {
    const settings = loadSettings()
    
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
            nodeIntegration: false,
            vsync: false
        },
        frame: true,
    })
    if (process.platform === 'win32') {
        app.commandLine.appendSwitch('disable-frame-rate-limit');
        app.commandLine.appendSwitch('disable-gpu-vsync');
    }

    Menu.setApplicationMenu(null)
    win.loadFile('mainMenu.html')

    if (displayMode === 'fullscreen') {
        win.setFullScreen(true)
    }
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

ipcMain.on('change-display-mode', (event, newMode) => {
    const primaryDisplay = screen.getPrimaryDisplay()
    const { width, height } = primaryDisplay.workAreaSize

    if (newMode === 'window') {
        win.setFullScreen(false)
        win.setResizable(true)
        win.setBounds({ 
            width: 1280, 
            height: 720, 
            x: Math.floor((width - 1280) / 2), 
            y: Math.floor((height - 720) / 2) 
        })
        displayMode = 'window'
    } else if (newMode === 'fullscreen') {
        win.setFullScreen(true)
        win.setBounds({ x: primaryDisplay.bounds.x, y: primaryDisplay.bounds.y, width, height })
        displayMode = 'fullscreen'
    }

    saveSettings()
})

ipcMain.handle('get-current-settings', () => {
    try {
        const config = loadSettings();
        return {
            displayMode: displayMode,
            vsync: config.display && config.display.vsync !== undefined ? config.display.vsync : false
        };
    } catch (error) {
        console.error('Error getting current settings:', error);
        return {
            displayMode: 'window',
            vsync: false
        };
    }
});

ipcMain.on('save-settings', (event, settings) => {
    saveSettings(settings);
});

ipcMain.on('move-to-display', (event, displayIndex) => {
    const displays = screen.getAllDisplays()

    if (displays[displayIndex]) {
        const { x, y, width, height } = displays[displayIndex].bounds

        win.setBounds({ x, y, width, height })
    }
})

ipcMain.on('quitApp', () => {
    app.quit();
})

ipcMain.handle('updateGameSettings', async (event, { mapId, difficulty }) => {
    try {
        const config = ini.parse(fs.readFileSync('./settings.ini', 'utf-8'));

        if (!config.game) config.game = {};
        config.game.map = mapId;
        config.game.difficulty = difficulty;

        fs.writeFileSync('./settings.ini', ini.stringify(config));
        return true;
    } catch (error) {
        console.error('Error updating settings:', error);
        return false;
    }
});

ipcMain.handle('update-game-settings', async (event, { mapId, difficulty }) => {
    try {
        const settingsPath = path.join(__dirname, 'settings.ini');
        const config = fs.existsSync(settingsPath)
            ? ini.parse(fs.readFileSync(settingsPath, 'utf-8'))
            : {};

        // Ensure game section exists
        config.game = config.game || {};

        // Update settings
        config.game.map = mapId;
        config.game.difficulty = difficulty;

        // Save settings
        fs.writeFileSync(settingsPath, ini.stringify(config));
        return { success: true };
    } catch (error) {
        console.error('Error updating settings:', error);
        return { success: false, error: error.message };
    }
});