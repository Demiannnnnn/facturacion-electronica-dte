import { ipcMain } from 'electron';
import { getDatabase } from '../database/connection.js';

export function registerClientesHandlers() {
  // Crear cliente
  ipcMain.handle('clientes:create', async (event, cliente) => {
    try {
      const db = getDatabase();
      const now = new Date().toISOString();

      const stmt = db.prepare(`
        INSERT INTO clientes (
          rut, razon_social, giro, direccion, comuna, ciudad, telefono, email,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        cliente.rut,
        cliente.razonSocial,
        cliente.giro || null,
        cliente.direccion || null,
        cliente.comuna || null,
        cliente.ciudad || null,
        cliente.telefono || null,
        cliente.email || null,
        now,
        now
      );

      console.log('Cliente creado:', result.lastInsertRowid);

      return {
        success: true,
        data: {
          id: result.lastInsertRowid,
          ...cliente
        }
      };
    } catch (error) {
      console.error('Error creating cliente:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Obtener todos los clientes
  ipcMain.handle('clientes:getAll', async () => {
    try {
      const db = getDatabase();
      const stmt = db.prepare('SELECT * FROM clientes ORDER BY razon_social');
      const clientes = stmt.all();

      return {
        success: true,
        data: clientes
      };
    } catch (error) {
      console.error('Error getting clientes:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Obtener cliente por ID
  ipcMain.handle('clientes:getById', async (event, id) => {
    try {
      const db = getDatabase();
      const stmt = db.prepare('SELECT * FROM clientes WHERE id = ?');
      const cliente = stmt.get(id);

      if (!cliente) {
        return {
          success: false,
          error: 'Cliente no encontrado'
        };
      }

      return {
        success: true,
        data: cliente
      };
    } catch (error) {
      console.error('Error getting cliente:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Buscar clientes
  ipcMain.handle('clientes:search', async (event, term) => {
    try {
      const db = getDatabase();
      const searchTerm = `%${term}%`;

      const stmt = db.prepare(`
        SELECT * FROM clientes
        WHERE rut LIKE ? OR razon_social LIKE ? OR email LIKE ?
        ORDER BY razon_social
      `);

      const clientes = stmt.all(searchTerm, searchTerm, searchTerm);

      return {
        success: true,
        data: clientes
      };
    } catch (error) {
      console.error('Error searching clientes:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Actualizar cliente
  ipcMain.handle('clientes:update', async (event, { id, cliente }) => {
    try {
      const db = getDatabase();
      const now = new Date().toISOString();

      const stmt = db.prepare(`
        UPDATE clientes
        SET rut = ?, razon_social = ?, giro = ?, direccion = ?,
            comuna = ?, ciudad = ?, telefono = ?, email = ?, updated_at = ?
        WHERE id = ?
      `);

      const result = stmt.run(
        cliente.rut,
        cliente.razonSocial,
        cliente.giro || null,
        cliente.direccion || null,
        cliente.comuna || null,
        cliente.ciudad || null,
        cliente.telefono || null,
        cliente.email || null,
        now,
        id
      );

      if (result.changes === 0) {
        return {
          success: false,
          error: 'Cliente no encontrado'
        };
      }

      console.log('Cliente actualizado:', id);

      return {
        success: true,
        data: { id, ...cliente }
      };
    } catch (error) {
      console.error('Error updating cliente:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Eliminar cliente
  ipcMain.handle('clientes:delete', async (event, id) => {
    try {
      const db = getDatabase();

      // Verificar si el cliente tiene facturas asociadas
      const checkStmt = db.prepare('SELECT COUNT(*) as count FROM facturas WHERE cliente_id = ?');
      const check = checkStmt.get(id);

      if (check.count > 0) {
        return {
          success: false,
          error: `No se puede eliminar el cliente porque tiene ${check.count} factura(s) asociada(s)`
        };
      }

      const stmt = db.prepare('DELETE FROM clientes WHERE id = ?');
      const result = stmt.run(id);

      if (result.changes === 0) {
        return {
          success: false,
          error: 'Cliente no encontrado'
        };
      }

      console.log('Cliente eliminado:', id);

      return {
        success: true
      };
    } catch (error) {
      console.error('Error deleting cliente:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  console.log('Clientes IPC handlers registered');
}
