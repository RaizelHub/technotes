const { app, BrowserWindow, Menu, globalShortcut, ipcMain } = require('electron');
const path = require('path');

let mainWindow = null;
let isAlwaysOnTop = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 980,
    height: 700,
    minWidth: 560,
    minHeight: 460,
    backgroundColor: '#ffffff',
    title: 'TechNotes — Technical Support & Cisco Learning Notes',
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Remove default menu for a clean distraction-free technical feel
  Menu.setApplicationMenu(null);

  const startUrl = process.env.VITE_DEV_SERVER_URL || 'http://127.0.0.1:5180';
  mainWindow.loadURL(startUrl);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Toggle Always on Top with Ctrl+Shift+T (Floats like a modal over Packet Tracer)
  globalShortcut.register('CommandOrControl+Shift+T', () => {
    if (mainWindow) {
      isAlwaysOnTop = !isAlwaysOnTop;
      mainWindow.setAlwaysOnTop(isAlwaysOnTop);
      mainWindow.setTitle(
        isAlwaysOnTop
          ? 'TechNotes [PINNED ON TOP]'
          : 'TechNotes — Technical Support & Cisco Learning Notes'
      );
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
