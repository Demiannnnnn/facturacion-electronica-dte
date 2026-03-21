import { ipcMain } from 'electron';
import { getDatabase } from '../../database/connection.js';

export function registerVendedoresHandlers() {
  // Crear vendedor
  ipcMain.handle('vendedores:create', async (event, vendedor) => {
    try {
      const db = getDatabase();
      const now = new Date().toISOString();

      const stmt = db.prepare(`
        INSERT INTO vendedores (
          nombre, apellido, email, telefono, comision, activo,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        vendedor.nombre,
        vendedor.apellido,
        vendedor.email || null,
        vendedor.telefono || null,
        vendedor.comision || 0,
        vendedor.activo !== undefined ? vendedor.activo : 1,
        now,
        now
      );

      console.log('Vendedor creado:', result.lastInsertRowid);

      return {
        success: true,
        data: {
          id: result.lastInsertRowid,
          ...vendedor
        }
      };
    } catch (error) {
      console.error('Error creating vendedor:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Obtener todos los vendedores
  ipcMain.handle('vendedores:getAll', async () => {
    try {
      const db = getDatabase();
      const stmt = db.prepare('SELECT * FROM vendedores ORDER BY apellido, nombre');
      const vendedores = stmt.all();

      return {
        success: true,
        data: vendedores
      };
    } catch (error) {
      console.error('Error getting vendedores:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Obtener vendedores activos
  ipcMain.handle('vendedores:getActivos', async () => {
    try {
      const db = getDatabase();
      const stmt = db.prepare('SELECT * FROM vendedores WHERE activo = 1 ORDER BY apellido, nombre');
      const vendedores = stmt.all();

      return {
        success: true,
        data: vendedores
      };
    } catch (error) {
      console.error('Error getting vendedores activos:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Obtener vendedor por ID
  ipcMain.handle('vendedores:getById', async (event, id) => {
    try {
      const db = getDatabase();
      const stmt = db.prepare('SELECT * FROM vendedores WHERE id = ?');
      const vendedor = stmt.get(id);

      if (!vendedor) {
        return {
          success: false,
          error: 'Vendedor no encontrado'
        };
      }

      return {
        success: true,
        data: vendedor
      };
    } catch (error) {
      console.error('Error getting vendedor:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Actualizar vendedor
  ipcMain.handle('vendedores:update', async (event, { id, vendedor }) => {
    try {
      const db = getDatabase();
      const now = new Date().toISOString();

      const stmt = db.prepare(`
        UPDATE vendedores
        SET nombre = ?, apellido = ?, email = ?, telefono = ?,
            comision = ?, activo = ?, updated_at = ?
        WHERE id = ?
      `);

      const result = stmt.run(
        vendedor.nombre,
        vendedor.apellido,
        vendedor.email || null,
        vendedor.telefono || null,
        vendedor.comision || 0,
        vendedor.activo !== undefined ? vendedor.activo : 1,
        now,
        id
      );

      if (result.changes === 0) {
        return {
          success: false,
          error: 'Vendedor no encontrado'
        };
      }

      console.log('Vendedor actualizado:', id);

      return {
        success: true,
        data: { id, ...vendedor }
      };
    } catch (error) {
      console.error('Error updating vendedor:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Eliminar vendedor (o marcar como inactivo)
  ipcMain.handle('vendedores:delete', async (event, id) => {
    try {
      const db = getDatabase();

      // Verificar si el vendedor tiene clientes o facturas asociadas
      const checkClientes = db.prepare('SELECT COUNT(*) as count FROM clientes WHERE vendedor_id = ?').get(id);
      const checkFacturas = db.prepare('SELECT COUNT(*) as count FROM facturas WHERE vendedor_id = ?').get(id);

      if (checkClientes.count > 0 || checkFacturas.count > 0) {
        // No eliminar, solo marcar como inactivo
        const now = new Date().toISOString();
        const stmt = db.prepare('UPDATE vendedores SET activo = 0, updated_at = ? WHERE id = ?');
        const result = stmt.run(now, id);

        if (result.changes === 0) {
          return {
            success: false,
            error: 'Vendedor no encontrado'
          };
        }

        console.log('Vendedor marcado como inactivo:', id);

        return {
          success: true,
          message: `El vendedor tiene ${checkClientes.count} cliente(s) y ${checkFacturas.count} factura(s) asociadas. Se ha marcado como inactivo.`
        };
      } else {
        // Si no tiene registros asociados, eliminar físicamente
        const stmt = db.prepare('DELETE FROM vendedores WHERE id = ?');
        const result = stmt.run(id);

        if (result.changes === 0) {
          return {
            success: false,
            error: 'Vendedor no encontrado'
          };
        }

        console.log('Vendedor eliminado:', id);

        return {
          success: true
        };
      }
    } catch (error) {
      console.error('Error deleting vendedor:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  console.log('Vendedores IPC handlers registered');
}
