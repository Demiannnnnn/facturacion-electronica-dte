import { ipcMain } from 'electron';
import { getDatabase } from '../../database/connection.js';

export function registerEmpresasHandlers() {
  // Crear empresa
  ipcMain.handle('empresas:create', async (event, empresa) => {
    try {
      const db = getDatabase();
      const now = new Date().toISOString();

      const stmt = db.prepare(`
        INSERT INTO empresas_contador (
          contador_id, rut, razon_social, nombre_fantasia, giro, 
          direccion, comuna, ciudad, region, email, telefono, 
          estado, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        empresa.contadorId,
        empresa.rut,
        empresa.razonSocial,
        empresa.nombreFantasia || null,
        empresa.giro || null,
        empresa.direccion || null,
        empresa.comuna || null,
        empresa.ciudad || null,
        empresa.region || null,
        empresa.email || null,
        empresa.telefono || null,
        empresa.estado || 'activa',
        now,
        now
      );

      return {
        success: true,
        data: { id: result.lastInsertRowid },
        message: 'Empresa creada exitosamente'
      };
    } catch (error) {
      console.error('Error creando empresa:', error);
      return {
        success: false,
        message: error.message.includes('UNIQUE constraint')
          ? 'Ya existe una empresa con ese RUT'
          : 'Error al crear empresa'
      };
    }
  });

  // Obtener todas las empresas del contador
  ipcMain.handle('empresas:getAll', async (event, contadorId) => {
    try {
      const db = getDatabase();
      const stmt = db.prepare(`
        SELECT * FROM empresas_contador 
        WHERE contador_id = ?
        ORDER BY razon_social ASC
      `);

      const empresas = stmt.all(contadorId);

      return {
        success: true,
        data: empresas
      };
    } catch (error) {
      console.error('Error obteniendo empresas:', error);
      return {
        success: false,
        message: 'Error al obtener empresas'
      };
    }
  });

  // Obtener empresa por ID
  ipcMain.handle('empresas:getById', async (event, id) => {
    try {
      const db = getDatabase();
      const stmt = db.prepare('SELECT * FROM empresas_contador WHERE id = ?');
      const empresa = stmt.get(id);

      if (!empresa) {
        return {
          success: false,
          message: 'Empresa no encontrada'
        };
      }

      return {
        success: true,
        data: empresa
      };
    } catch (error) {
      console.error('Error obteniendo empresa:', error);
      return {
        success: false,
        message: 'Error al obtener empresa'
      };
    }
  });

  // Actualizar empresa
  ipcMain.handle('empresas:update', async (event, id, empresa) => {
    try {
      const db = getDatabase();
      const now = new Date().toISOString();

      const stmt = db.prepare(`
        UPDATE empresas_contador SET
          rut = ?,
          razon_social = ?,
          nombre_fantasia = ?,
          giro = ?,
          direccion = ?,
          comuna = ?,
          ciudad = ?,
          region = ?,
          email = ?,
          telefono = ?,
          estado = ?,
          updated_at = ?
        WHERE id = ?
      `);

      const result = stmt.run(
        empresa.rut,
        empresa.razonSocial,
        empresa.nombreFantasia || null,
        empresa.giro || null,
        empresa.direccion || null,
        empresa.comuna || null,
        empresa.ciudad || null,
        empresa.region || null,
        empresa.email || null,
        empresa.telefono || null,
        empresa.estado || 'activa',
        now,
        id
      );

      if (result.changes === 0) {
        return {
          success: false,
          message: 'Empresa no encontrada'
        };
      }

      return {
        success: true,
        message: 'Empresa actualizada exitosamente'
      };
    } catch (error) {
      console.error('Error actualizando empresa:', error);
      return {
        success: false,
        message: error.message.includes('UNIQUE constraint')
          ? 'Ya existe una empresa con ese RUT'
          : 'Error al actualizar empresa'
      };
    }
  });

  // Eliminar empresa
  ipcMain.handle('empresas:delete', async (event, id) => {
    try {
      const db = getDatabase();
      
      // Verificar si la empresa tiene datos asociados
      const checkStmt = db.prepare(`
        SELECT 
          (SELECT COUNT(*) FROM clientes WHERE empresa_id = ?) as clientes_count,
          (SELECT COUNT(*) FROM facturas WHERE empresa_id = ?) as facturas_count
      `);
      
      const counts = checkStmt.get(id, id);
      
      if (counts.clientes_count > 0 || counts.facturas_count > 0) {
        return {
          success: false,
          message: `No se puede eliminar. La empresa tiene ${counts.clientes_count} clientes y ${counts.facturas_count} facturas asociadas.`,
          hasData: true
        };
      }

      const stmt = db.prepare('DELETE FROM empresas_contador WHERE id = ?');
      const result = stmt.run(id);

      if (result.changes === 0) {
        return {
          success: false,
          message: 'Empresa no encontrada'
        };
      }

      return {
        success: true,
        message: 'Empresa eliminada exitosamente'
      };
    } catch (error) {
      console.error('Error eliminando empresa:', error);
      return {
        success: false,
        message: 'Error al eliminar empresa'
      };
    }
  });

  // Cambiar estado de empresa (activar/desactivar)
  ipcMain.handle('empresas:changeStatus', async (event, id, estado) => {
    try {
      const db = getDatabase();
      const now = new Date().toISOString();

      const stmt = db.prepare(`
        UPDATE empresas_contador 
        SET estado = ?, updated_at = ?
        WHERE id = ?
      `);

      const result = stmt.run(estado, now, id);

      if (result.changes === 0) {
        return {
          success: false,
          message: 'Empresa no encontrada'
        };
      }

      return {
        success: true,
        message: `Empresa ${estado === 'activa' ? 'activada' : 'desactivada'} exitosamente`
      };
    } catch (error) {
      console.error('Error cambiando estado de empresa:', error);
      return {
        success: false,
        message: 'Error al cambiar estado de empresa'
      };
    }
  });

  // Buscar empresas
  ipcMain.handle('empresas:search', async (event, contadorId, searchTerm) => {
    try {
      const db = getDatabase();
      const stmt = db.prepare(`
        SELECT * FROM empresas_contador 
        WHERE contador_id = ? 
          AND (
            rut LIKE ? OR 
            razon_social LIKE ? OR 
            nombre_fantasia LIKE ? OR
            email LIKE ?
          )
        ORDER BY razon_social ASC
      `);

      const searchPattern = `%${searchTerm}%`;
      const empresas = stmt.all(contadorId, searchPattern, searchPattern, searchPattern, searchPattern);

      return {
        success: true,
        data: empresas
      };
    } catch (error) {
      console.error('Error buscando empresas:', error);
      return {
        success: false,
        message: 'Error al buscar empresas'
      };
    }
  });

  // Obtener estadísticas de empresas
  ipcMain.handle('empresas:getStats', async (event, contadorId) => {
    try {
      const db = getDatabase();
      const stmt = db.prepare(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN estado = 'activa' THEN 1 ELSE 0 END) as activas,
          SUM(CASE WHEN estado = 'inactiva' THEN 1 ELSE 0 END) as inactivas
        FROM empresas_contador
        WHERE contador_id = ?
      `);

      const stats = stmt.get(contadorId);

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return {
        success: false,
        message: 'Error al obtener estadísticas'
      };
    }
  });
}
