const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');

const ERP_URL = 'https://mahadichoixbd-stack.github.io/choix-erp-frontend/';

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    title: 'CHOIX ERP',
    backgroundColor: '#ffffff',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  win.loadURL(ERP_URL);

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://')) shell.openExternal(url);
    return { action: 'deny' };
  });

  win.webContents.on('did-fail-load', (_event, _code, _description, _validatedURL, isMainFrame) => {
    if (isMainFrame) {
      win.loadURL(ERP_URL).catch(() => {});
    }
  });

  const menu = Menu.buildFromTemplate([
    {
      label: 'CHOIX ERP',
      submenu: [
        { label: 'Reload ERP', click: () => win.loadURL(ERP_URL) },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    { role: 'viewMenu' }
  ]);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
