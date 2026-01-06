import { ipcMain } from 'electron';
import { getDatabase } from '../database/connection.js';

export function registerConfigHandlers() {
  // Obtener configuración
  ipcMain.handle('config:get', async (event, key) => {
    try {
      const db = getDatabase();
      const stmt = db.prepare('SELECT value FROM config WHERE key = ?');
      const result = stmt.get(key);
      
      return { 
        success: true, 
        value: result ? result.value : null 
      };
    } catch (error) {
      console.error('Error getting config:', error);
      return { success: false, error: error.message };
    }
  });

  // Guardar configuración
  ipcMain.handle('config:set', async (event, key, value) => {
    try {
      const db = getDatabase();
      const now = new Date().toISOString();
      
      const stmt = db.prepare(`
        INSERT INTO config (key, value, updated_at) 
        VALUES (?, ?, ?)
        ON CONFLICT(key) DO UPDATE SET 
          value = excluded.value,
          updated_at = excluded.updated_at
      `);
      
      stmt.run(key, value, now);
      
      return { success: true };
    } catch (error) {
      console.error('Error setting config:', error);
      return { success: false, error: error.message };
    }
  });

  // Obtener todas las configuraciones
  ipcMain.handle('config:getAll', async () => {
    try {
      const db = getDatabase();
      const stmt = db.prepare('SELECT key, value FROM config');
      const configs = stmt.all();
      
      const configObj = {};
      configs.forEach(({ key, value }) => {
        configObj[key] = value;
      });
      
      return { success: true, configs: configObj };
    } catch (error) {
      console.error('Error getting all configs:', error);
      return { success: false, error: error.message };
    }
  });

  // Eliminar configuración
  ipcMain.handle('config:delete', async (event, key) => {
    try {
      const db = getDatabase();
      const stmt = db.prepare('DELETE FROM config WHERE key = ?');
      stmt.run(key);
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting config:', error);
      return { success: false, error: error.message };
    }
  });
}
