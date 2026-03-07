// TODO: Implementar según documentación
// Ver documentacion/latex.pdf página 21-22

import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';
import { initDatabase } from './database/connection.js';
import { registerAuthHandlers } from './ipc/auth.js';
import { registerUsuariosHandlers } from './ipc/usuarios.js';
import { registerClientesHandlers } from './ipc/clientes.js';
import { registerProductosHandlers } from './ipc/productos.js';
import { registerFacturasHandlers } from './ipc/facturas.js';
import { registerVendedoresHandlers } from './ipc/vendedores.js';
import { registerPagosHandlers } from './ipc/pagos.js';
import { registerGuiasHandlers } from './ipc/guias.js';
import { registerFoliosHandlers } from './ipc/folios.js';
import { registerBackupHandlers, createAutomaticBackup } from './ipc/backup.js';
import { registerExportHandlers } from './ipc/export.js';
import { registerImportHandlers } from './ipc/import.js';
import { registerConfigHandlers } from './ipc/config.js';
import { registerSyncHandlers } from './ipc/sync.js';
import { registerSeedHandlers } from './ipc/seed.js';
import { registerEmpresasHandlers } from './ipc/empresas.js';
import { createMenu } from './menu.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;

// Configurar perfiles de desarrollo separados
if (process.env.NODE_ENV === 'development' && process.env.DEV_PROFILE) {
  const originalUserData = app.getPath('userData');
  const profilePath = path.join(
    path.dirname(originalUserData),
    `${path.basename(originalUserData)}-${process.env.DEV_PROFILE}`
  );
  app.setPath('userData', profilePath);
  console.log(`[DEV_PROFILE] Using profile: ${process.env.DEV_PROFILE}`);
  console.log(`[DEV_PROFILE] userData path: ${profilePath}`);
}

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
  registerUsuariosHandlers();
  registerClientesHandlers();
  registerProductosHandlers();
  registerFacturasHandlers();
  registerVendedoresHandlers();
  registerPagosHandlers();
  registerGuiasHandlers();
  registerFoliosHandlers();
  registerBackupHandlers();
  registerExportHandlers();
  registerImportHandlers();
  registerConfigHandlers();
  registerSyncHandlers();
  // registerSeedHandlers(); // Desactivado temporalmente para pruebas de registro desde cero
  registerEmpresasHandlers();

  // Crear menú en español
  createMenu();

  // Crear ventana
  createWindow();

  // Handlers genéricos para PDFs
  ipcMain.handle('savePDF', async (event, { filename, data }) => {
    try {
      // Obtener la ruta del proyecto
      const projectRoot = app.getAppPath().includes('app.asar')
        ? path.join(process.resourcesPath, '..')
        : path.join(app.getAppPath(), '../..');

      const pdfsDir = path.join(projectRoot, 'PDFs');

      // Crear directorio PDFs si no existe
      try {
        await fs.access(pdfsDir);
      } catch {
        await fs.mkdir(pdfsDir, { recursive: true });
      }

      const filePath = path.join(pdfsDir, filename);

      // Convertir array a Buffer y guardar
      const bufferData = Buffer.from(data);
      await fs.writeFile(filePath, bufferData);

      return { success: true, path: filePath };
    } catch (error) {
      console.error('Error saving PDF:', error);
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('openPDF', async (event, filePath) => {
    try {
      await shell.openPath(filePath);
      return { success: true };
    } catch (error) {
      console.error('Error opening PDF:', error);
      return { success: false, message: error.message };
    }
  });
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
