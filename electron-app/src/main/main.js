// TODO: Implementar según documentación
// Ver documentacion/latex.pdf página 21-22

import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase } from './database/connection.js';
import { registerAuthHandlers } from './ipc/auth.js';
import { registerClientesHandlers } from './ipc/clientes.js';
import { registerProductosHandlers } from './ipc/productos.js';
import { registerFacturasHandlers } from './ipc/facturas.js';
import { registerVendedoresHandlers } from './ipc/vendedores.js';
import { registerBackupHandlers, createAutomaticBackup } from './ipc/backup.js';
import { registerExportHandlers } from './ipc/export.js';
import { createMenu } from './menu.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Desarrollo: Vite dev server
  const isDevelopment = process.env.NODE_ENV === 'development' || !app.isPackaged;
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('isDevelopment:', isDevelopment);

  if (isDevelopment) {
    console.log('Loading development server: http://localhost:5173');
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // Producción: archivos compilados
    console.log('Loading production build');
    mainWindow.loadFile(
      path.join(__dirname, '../../dist-renderer/index.html')
    );
  }
}

app.whenReady().then(() => {
  // Inicializar base de datos
  initDatabase();

  // Registrar handlers IPC
  registerAuthHandlers();
  registerClientesHandlers();
  registerProductosHandlers();
  registerFacturasHandlers();
  registerVendedoresHandlers();
  registerBackupHandlers();
  registerExportHandlers();

  // Crear menú en español
  createMenu();

  // Crear ventana
  createWindow();
});

app.on('window-all-closed', () => {
  // Crear backup automático antes de cerrar
  createAutomaticBackup();

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
