const { app, BrowserWindow, Menu, shell, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');

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
    if (isMainFrame) win.loadURL(ERP_URL).catch(() => {});
  });

  const menu = Menu.buildFromTemplate([
    {
      label: 'CHOIX ERP',
      submenu: [
        { label: 'Reload ERP', click: () => win.loadURL(ERP_URL) },
        { label: 'Check for Updates', click: () => checkForUpdates(true) },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    { role: 'viewMenu' }
  ]);
  Menu.setApplicationMenu(menu);
}

async function checkForUpdates(manual = false) {
  if (!app.isPackaged) return;
  try {
    const result = await autoUpdater.checkForUpdates();
    if (manual && !result?.updateInfo) {
      await dialog.showMessageBox({ type: 'info', title: 'CHOIX ERP', message: 'You are already using the latest version.' });
    }
  } catch (err) {
    if (manual) {
      await dialog.showMessageBox({ type: 'warning', title: 'Update check failed', message: 'Could not check for an update right now.' });
    }
  }
}

autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;
autoUpdater.on('update-available', () => {
  dialog.showMessageBox({ type: 'info', title: 'CHOIX ERP Update', message: 'A new version is available. It will download automatically in the background.' });
});
autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox({
    type: 'info',
    title: 'CHOIX ERP Update Ready',
    message: 'The update has been downloaded. CHOIX ERP will install it when you close the app.',
    buttons: ['Restart & Update', 'Later']
  }).then(({ response }) => {
    if (response === 0) autoUpdater.quitAndInstall();
  });
});

app.whenReady().then(() => {
  createWindow();
  setTimeout(() => checkForUpdates(false), 5000);
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
