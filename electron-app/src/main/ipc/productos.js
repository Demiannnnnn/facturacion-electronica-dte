import { ipcMain } from 'electron';
import { getDatabase } from '../database/connection.js';
import { safeLog, safeError } from '../utils/logger.js';

export function registerProductosHandlers() {
  // Crear producto
  ipcMain.handle('productos:create', async (event, producto) => {
    try {
      const db = getDatabase();
      const now = new Date().toISOString();

      const stmt = db.prepare(`
        INSERT INTO productos (
          codigo, nombre, descripcion, precio, stock,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        producto.codigo || null,
        producto.nombre,
        producto.descripcion || null,
        producto.precio,
        producto.stock || 0,
        now,
        now
      );

      safeLog('Producto creado:', result.lastInsertRowid);

      return {
        success: true,
        data: {
          id: result.lastInsertRowid,
          ...producto
        }
      };
    } catch (error) {
      safeError('Error creating producto:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Obtener todos los productos
  ipcMain.handle('productos:getAll', async () => {
    try {
      const db = getDatabase();
      const stmt = db.prepare('SELECT * FROM productos ORDER BY nombre');
      const productos = stmt.all();

      return {
        success: true,
        data: productos
      };
    } catch (error) {
      safeError('Error getting productos:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Obtener producto por ID
  ipcMain.handle('productos:getById', async (event, id) => {
    try {
      const db = getDatabase();
      const stmt = db.prepare('SELECT * FROM productos WHERE id = ?');
      const producto = stmt.get(id);

      if (!producto) {
        return {
          success: false,
          error: 'Producto no encontrado'
        };
      }

      return {
        success: true,
        data: producto
      };
    } catch (error) {
      safeError('Error getting producto:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Buscar productos
  ipcMain.handle('productos:search', async (event, term) => {
    try {
      const db = getDatabase();
      const searchTerm = `%${term}%`;

      const stmt = db.prepare(`
        SELECT * FROM productos
        WHERE codigo LIKE ? OR nombre LIKE ? OR descripcion LIKE ?
        ORDER BY nombre
      `);

      const productos = stmt.all(searchTerm, searchTerm, searchTerm);

      return {
        success: true,
        data: productos
      };
    } catch (error) {
      safeError('Error searching productos:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Actualizar producto
  ipcMain.handle('productos:update', async (event, { id, producto }) => {
    try {
      const db = getDatabase();
      const now = new Date().toISOString();

      const stmt = db.prepare(`
        UPDATE productos
        SET codigo = ?, nombre = ?, descripcion = ?, precio = ?, stock = ?, updated_at = ?
        WHERE id = ?
      `);

      const result = stmt.run(
        producto.codigo || null,
        producto.nombre,
        producto.descripcion || null,
        producto.precio,
        producto.stock || 0,
        now,
        id
      );

      if (result.changes === 0) {
        return {
          success: false,
          error: 'Producto no encontrado'
        };
      }

      safeLog('Producto actualizado:', id);

      return {
        success: true,
        data: { id, ...producto }
      };
    } catch (error) {
      safeError('Error updating producto:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Eliminar producto
  ipcMain.handle('productos:delete', async (event, id) => {
    try {
      const db = getDatabase();

      // Verificar si el producto está en alguna factura
      const checkStmt = db.prepare('SELECT COUNT(*) as count FROM factura_items WHERE producto_id = ?');
      const check = checkStmt.get(id);

      if (check.count > 0) {
        return {
          success: false,
          error: `No se puede eliminar el producto porque está en ${check.count} factura(s)`
        };
      }

      const stmt = db.prepare('DELETE FROM productos WHERE id = ?');
      const result = stmt.run(id);

      if (result.changes === 0) {
        return {
          success: false,
          error: 'Producto no encontrado'
        };
      }

      safeLog('Producto eliminado:', id);

      return {
        success: true
      };
    } catch (error) {
      safeError('Error deleting producto:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Actualizar stock
  ipcMain.handle('productos:updateStock', async (event, { id, cantidad }) => {
    try {
      const db = getDatabase();
      const now = new Date().toISOString();

      const stmt = db.prepare(`
        UPDATE productos
        SET stock = stock + ?, updated_at = ?
        WHERE id = ?
      `);

      const result = stmt.run(cantidad, now, id);

      if (result.changes === 0) {
        return {
          success: false,
          error: 'Producto no encontrado'
        };
      }

      // Obtener stock actualizado
      const getStmt = db.prepare('SELECT stock FROM productos WHERE id = ?');
      const producto = getStmt.get(id);

      safeLog('Stock actualizado:', id, 'nuevo stock:', producto.stock);

      return {
        success: true,
        data: { id, stock: producto.stock }
      };
    } catch (error) {
      safeError('Error updating stock:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  safeLog('Productos IPC handlers registered');
}
