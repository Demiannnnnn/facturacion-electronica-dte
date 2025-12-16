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
          rut, razon_social, giro, direccion, region, comuna, ciudad, telefono, email,
          tipo_documento, nombre_fantasia, contacto_nombre, contacto_cargo, contacto_email, contacto_telefono,
          condicion_pago, dias_credito, limite_credito, vendedor_id, zona, descuento_automatico, lista_precios,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        cliente.rut,
        cliente.razonSocial,
        cliente.giro || null,
        cliente.direccion || null,
        cliente.region || null,
        cliente.comuna || null,
        cliente.ciudad || null,
        cliente.telefono || null,
        cliente.email || null,
        cliente.tipoDocumento || 'rut_empresa',
        cliente.nombreFantasia || null,
        cliente.contactoNombre || null,
        cliente.contactoCargo || null,
        cliente.contactoEmail || null,
        cliente.contactoTelefono || null,
        cliente.condicionPago || 'contado',
        cliente.diasCredito || 0,
        cliente.limiteCredito || 0,
        cliente.vendedorId || null,
        cliente.zona || null,
        cliente.descuentoAutomatico || 0,
        cliente.listaPrecios || 'normal',
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
        SET rut = ?, razon_social = ?, giro = ?, direccion = ?, region = ?,
            comuna = ?, ciudad = ?, telefono = ?, email = ?,
            tipo_documento = ?, nombre_fantasia = ?, contacto_nombre = ?, contacto_cargo = ?,
            contacto_email = ?, contacto_telefono = ?,
            condicion_pago = ?, dias_credito = ?, limite_credito = ?, vendedor_id = ?,
            zona = ?, descuento_automatico = ?, lista_precios = ?, updated_at = ?
        WHERE id = ?
      `);

      const result = stmt.run(
        cliente.rut,
        cliente.razonSocial,
        cliente.giro || null,
        cliente.direccion || null,
        cliente.region || null,
        cliente.comuna || null,
        cliente.ciudad || null,
        cliente.telefono || null,
        cliente.email || null,
        cliente.tipoDocumento || 'rut_empresa',
        cliente.nombreFantasia || null,
        cliente.contactoNombre || null,
        cliente.contactoCargo || null,
        cliente.contactoEmail || null,
        cliente.contactoTelefono || null,
        cliente.condicionPago || 'contado',
        cliente.diasCredito || 0,
        cliente.limiteCredito || 0,
        cliente.vendedorId || null,
        cliente.zona || null,
        cliente.descuentoAutomatico || 0,
        cliente.listaPrecios || 'normal',
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

  // Obtener reporte de clientes
  ipcMain.handle('clientes:getReporte', async () => {
    try {
      const db = getDatabase();

      // Obtener todos los clientes con estadísticas de compras
      const clientes = db.prepare(`
        SELECT
          c.*,
          COUNT(f.id) as total_facturas,
          COALESCE(SUM(f.total), 0) as total_comprado,
          COALESCE(SUM(CASE WHEN f.estado = 'pendiente' THEN f.total ELSE 0 END), 0) as total_pendiente,
          COALESCE(SUM(CASE WHEN f.estado = 'pagada' THEN f.total ELSE 0 END), 0) as total_pagado,
          MAX(f.fecha) as ultima_compra
        FROM clientes c
        LEFT JOIN facturas f ON c.id = f.cliente_id
        GROUP BY c.id
        ORDER BY total_comprado DESC
      `).all();

      // Calcular totales generales
      const totales = {
        total_clientes: clientes.length,
        clientes_activos: clientes.filter(c => c.total_facturas > 0).length,
        clientes_sin_compras: clientes.filter(c => c.total_facturas === 0).length,
        total_facturado: clientes.reduce((sum, c) => sum + c.total_comprado, 0),
        total_pendiente: clientes.reduce((sum, c) => sum + c.total_pendiente, 0),
        promedio_compra: 0
      };

      if (totales.clientes_activos > 0) {
        totales.promedio_compra = totales.total_facturado / totales.clientes_activos;
      }

      // Top clientes por monto comprado
      const topClientes = clientes
        .filter(c => c.total_facturas > 0)
        .sort((a, b) => b.total_comprado - a.total_comprado)
        .slice(0, 10);

      // Clientes con facturas pendientes
      const clientesPendientes = clientes
        .filter(c => c.total_pendiente > 0)
        .sort((a, b) => b.total_pendiente - a.total_pendiente);

      // Clientes sin compras
      const clientesSinCompras = clientes
        .filter(c => c.total_facturas === 0);

      // Clientes por región (si tienen datos de región)
      const clientesPorRegion = {};
      clientes.forEach(cliente => {
        const region = cliente.region || 'Sin especificar';
        if (!clientesPorRegion[region]) {
          clientesPorRegion[region] = {
            cantidad: 0,
            total_comprado: 0
          };
        }
        clientesPorRegion[region].cantidad++;
        clientesPorRegion[region].total_comprado += cliente.total_comprado;
      });

      return {
        success: true,
        data: {
          clientes,
          totales,
          topClientes,
          clientesPendientes,
          clientesSinCompras,
          clientesPorRegion
        }
      };
    } catch (error) {
      console.error('Error getting reporte clientes:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  console.log('Clientes IPC handlers registered');
}
