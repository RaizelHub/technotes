const { app, BrowserWindow, Menu, globalShortcut } = require('electron');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');

let mainWindow = null;
let isAlwaysOnTop = false;
let spawnedServer = null;

// Ensure single instance lock so multiple clicks don't conflict
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
  process.exit(0);
}

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

function checkPort(port, testPath = '/') {
  return new Promise((resolve) => {
    const req = http.get(
      {
        hostname: '127.0.0.1',
        port: port,
        path: testPath,
        timeout: 600,
      },
      (res) => {
        resolve(res.statusCode < 500);
      }
    );
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

function startBackendServer() {
  const projectRoot = path.resolve(__dirname, '..');
  const tsxCli = path.join(projectRoot, 'node_modules', 'tsx', 'dist', 'cli.mjs');
  const serverScript = path.join(projectRoot, 'server', 'index.ts');

  // Spawn node with tsx to run Express server in the background without any console window
  spawnedServer = spawn('node', [tsxCli, serverScript], {
    cwd: projectRoot,
    stdio: 'ignore',
    windowsHide: true,
    detached: false,
    shell: true,
  });

  spawnedServer.on('error', (err) => {
    console.error('Failed to auto-spawn TechNotes backend server:', err);
  });
}

async function waitForServer(port, testPath = '/api/tracks/summary', maxTries = 30) {
  for (let i = 0; i < maxTries; i++) {
    const isUp = await checkPort(port, testPath);
    if (isUp) return true;
    await new Promise((r) => setTimeout(r, 200));
  }
  return false;
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1040,
    height: 740,
    minWidth: 600,
    minHeight: 480,
    backgroundColor: '#ffffff',
    title: 'TechNotes — Technical Career & Engineering Notebook',
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  Menu.setApplicationMenu(null);

  // 1. Determine target URL: check if Vite dev server is running on 5180
  const isViteUp = await checkPort(5180);
  let targetUrl = 'http://127.0.0.1:3100';

  if (isViteUp) {
    targetUrl = 'http://127.0.0.1:5180';
  } else {
    // If Vite is not running, check if Express server is running on 3100
    const isServerUp = await checkPort(3100, '/api/tracks/summary');
    if (!isServerUp) {
      console.log('Starting local TechNotes Express backend...');
      startBackendServer();
      await waitForServer(3100, '/api/tracks/summary', 40);
    }
  }

  // Load the target URL
  mainWindow.loadURL(targetUrl).catch((err) => {
    console.error('Failed to load URL:', targetUrl, err);
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Safety fallback: ensure window shows within 3 seconds
  setTimeout(() => {
    if (mainWindow && !mainWindow.isVisible()) {
      mainWindow.show();
    }
  }, 3000);

  // Toggle Always on Top with Ctrl+Shift+T (Floats over Cisco Packet Tracer / Labs)
  globalShortcut.register('CommandOrControl+Shift+T', () => {
    if (mainWindow) {
      isAlwaysOnTop = !isAlwaysOnTop;
      mainWindow.setAlwaysOnTop(isAlwaysOnTop);
      mainWindow.setTitle(
        isAlwaysOnTop
          ? 'TechNotes [PINNED ON TOP]'
          : 'TechNotes — Technical Career & Engineering Notebook'
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

function cleanupProcesses() {
  globalShortcut.unregisterAll();
  if (spawnedServer && spawnedServer.pid) {
    try {
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', spawnedServer.pid.toString(), '/f', '/t'], {
          windowsHide: true,
        });
      } else {
        spawnedServer.kill('SIGTERM');
      }
    } catch (e) {}
  }
}

app.on('will-quit', cleanupProcesses);

app.on('window-all-closed', () => {
  cleanupProcesses();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
