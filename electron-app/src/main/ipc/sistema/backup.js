import { ipcMain, app, dialog } from 'electron';
import { getDatabase } from '../../database/connection.js';
import fs from 'fs';
import path from 'path';

export function registerBackupHandlers() {
  // Crear backup manual
  ipcMain.handle('backup:create', async () => {
    try {
      const userDataPath = app.getPath('userData');
      const isDevelopment = process.env.NODE_ENV === 'development' || !app.isPackaged;
      const dbName = isDevelopment ? 'facturacion.dev.db' : 'facturacion.db';
      const dbPath = path.join(userDataPath, dbName);

      // Verificar que existe la base de datos
      if (!fs.existsSync(dbPath)) {
        return {
          success: false,
          error: 'No se encontró la base de datos'
        };
      }

      // Crear carpeta de backups si no existe
      const backupsPath = path.join(userDataPath, 'backups');
      if (!fs.existsSync(backupsPath)) {
        fs.mkdirSync(backupsPath, { recursive: true });
      }

      // Generar nombre del backup con timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' +
                        new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
      const backupName = `backup_${timestamp}.db`;
      const backupPath = path.join(backupsPath, backupName);

      // Copiar la base de datos
      fs.copyFileSync(dbPath, backupPath);

      // Limpiar backups antiguos (mantener solo los últimos 30)
      cleanOldBackups(backupsPath, 30);

      console.log('Backup creado exitosamente:', backupPath);

      return {
        success: true,
        path: backupPath,
        name: backupName
      };
    } catch (error) {
      console.error('Error creating backup:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Listar backups disponibles
  ipcMain.handle('backup:list', async () => {
    try {
      const userDataPath = app.getPath('userData');
      const backupsPath = path.join(userDataPath, 'backups');

      if (!fs.existsSync(backupsPath)) {
        return {
          success: true,
          data: []
        };
      }

      // Leer archivos de backup
      const files = fs.readdirSync(backupsPath)
        .filter(file => file.endsWith('.db'))
        .map(file => {
          const filePath = path.join(backupsPath, file);
          const stats = fs.statSync(filePath);
          return {
            name: file,
            path: filePath,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime
          };
        })
        .sort((a, b) => b.created - a.created); // Más recientes primero

      return {
        success: true,
        data: files
      };
    } catch (error) {
      console.error('Error listing backups:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Restaurar desde backup
  ipcMain.handle('backup:restore', async (event, backupPath) => {
    try {
      if (!fs.existsSync(backupPath)) {
        return {
          success: false,
          error: 'El archivo de backup no existe'
        };
      }

      const userDataPath = app.getPath('userData');
      const isDevelopment = process.env.NODE_ENV === 'development' || !app.isPackaged;
      const dbName = isDevelopment ? 'facturacion.dev.db' : 'facturacion.db';
      const dbPath = path.join(userDataPath, dbName);

      // Crear backup de seguridad de la BD actual antes de restaurar
      const securityBackupPath = path.join(userDataPath, 'backups', `pre_restore_${Date.now()}.db`);
      if (fs.existsSync(dbPath)) {
        fs.copyFileSync(dbPath, securityBackupPath);
      }

      // Restaurar el backup
      fs.copyFileSync(backupPath, dbPath);

      console.log('Backup restaurado exitosamente desde:', backupPath);

      return {
        success: true,
        message: 'Backup restaurado exitosamente. La aplicación se reiniciará.'
      };
    } catch (error) {
      console.error('Error restoring backup:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Exportar backup a ubicación personalizada
  ipcMain.handle('backup:export', async () => {
    try {
      // Mostrar diálogo para seleccionar ubicación
      const result = await dialog.showSaveDialog({
        title: 'Exportar Backup',
        defaultPath: `backup_${new Date().toISOString().split('T')[0]}.db`,
        filters: [
          { name: 'Base de Datos', extensions: ['db'] },
          { name: 'Todos los archivos', extensions: ['*'] }
        ]
      });

      if (result.canceled) {
        return {
          success: false,
          canceled: true
        };
      }

      const userDataPath = app.getPath('userData');
      const isDevelopment = process.env.NODE_ENV === 'development' || !app.isPackaged;
      const dbName = isDevelopment ? 'facturacion.dev.db' : 'facturacion.db';
      const dbPath = path.join(userDataPath, dbName);

      // Copiar base de datos a la ubicación seleccionada
      fs.copyFileSync(dbPath, result.filePath);

      console.log('Backup exportado exitosamente a:', result.filePath);

      return {
        success: true,
        path: result.filePath
      };
    } catch (error) {
      console.error('Error exporting backup:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Importar backup desde ubicación personalizada
  ipcMain.handle('backup:import', async () => {
    try {
      // Mostrar diálogo para seleccionar archivo
      const result = await dialog.showOpenDialog({
        title: 'Importar Backup',
        filters: [
          { name: 'Base de Datos', extensions: ['db'] },
          { name: 'Todos los archivos', extensions: ['*'] }
        ],
        properties: ['openFile']
      });

      if (result.canceled || result.filePaths.length === 0) {
        return {
          success: false,
          canceled: true
        };
      }

      const importPath = result.filePaths[0];

      if (!fs.existsSync(importPath)) {
        return {
          success: false,
          error: 'El archivo seleccionado no existe'
        };
      }

      const userDataPath = app.getPath('userData');
      const isDevelopment = process.env.NODE_ENV === 'development' || !app.isPackaged;
      const dbName = isDevelopment ? 'facturacion.dev.db' : 'facturacion.db';
      const dbPath = path.join(userDataPath, dbName);

      // Crear backup de seguridad antes de importar
      const securityBackupPath = path.join(userDataPath, 'backups', `pre_import_${Date.now()}.db`);
      if (fs.existsSync(dbPath)) {
        fs.copyFileSync(dbPath, securityBackupPath);
      }

      // Importar el backup
      fs.copyFileSync(importPath, dbPath);

      console.log('Backup importado exitosamente desde:', importPath);

      return {
        success: true,
        message: 'Backup importado exitosamente. La aplicación se reiniciará.'
      };
    } catch (error) {
      console.error('Error importing backup:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Eliminar backup
  ipcMain.handle('backup:delete', async (event, backupPath) => {
    try {
      if (!fs.existsSync(backupPath)) {
        return {
          success: false,
          error: 'El archivo de backup no existe'
        };
      }

      fs.unlinkSync(backupPath);

      console.log('Backup eliminado:', backupPath);

      return {
        success: true
      };
    } catch (error) {
      console.error('Error deleting backup:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  console.log('Backup IPC handlers registered');
}

// Función auxiliar para limpiar backups antiguos
function cleanOldBackups(backupsPath, maxBackups = 30) {
  try {
    const files = fs.readdirSync(backupsPath)
      .filter(file => file.endsWith('.db') && file.startsWith('backup_'))
      .map(file => ({
        name: file,
        path: path.join(backupsPath, file),
        time: fs.statSync(path.join(backupsPath, file)).birthtime
      }))
      .sort((a, b) => b.time - a.time);

    // Eliminar los backups que excedan el límite
    if (files.length > maxBackups) {
      const toDelete = files.slice(maxBackups);
      toDelete.forEach(file => {
        fs.unlinkSync(file.path);
        console.log('Backup antiguo eliminado:', file.name);
      });
    }
  } catch (error) {
    console.error('Error cleaning old backups:', error);
  }
}

// Crear backup automático al cerrar la aplicación
export function createAutomaticBackup() {
  try {
    const userDataPath = app.getPath('userData');
    const isDevelopment = process.env.NODE_ENV === 'development' || !app.isPackaged;
    const dbName = isDevelopment ? 'facturacion.dev.db' : 'facturacion.db';
    const dbPath = path.join(userDataPath, dbName);

    if (!fs.existsSync(dbPath)) {
      console.log('No database found for automatic backup');
      return;
    }

    const backupsPath = path.join(userDataPath, 'backups');
    if (!fs.existsSync(backupsPath)) {
      fs.mkdirSync(backupsPath, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const backupName = `auto_backup_${timestamp}.db`;
    const backupPath = path.join(backupsPath, backupName);

    // Solo crear backup automático si no existe uno del mismo día
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(dbPath, backupPath);
      console.log('Automatic backup created:', backupPath);

      // Limpiar backups automáticos antiguos (mantener últimos 7 días)
      cleanOldBackups(backupsPath, 7);
    }
  } catch (error) {
    console.error('Error creating automatic backup:', error);
  }
}
