import { ipcMain } from 'electron';
import { getDatabase } from '../../database/connection.js';

export function registerPagosHandlers() {
  // Registrar pago de una factura
  ipcMain.handle('pagos:create', async (event, pago) => {
    const db = getDatabase();

    try {
      db.prepare('BEGIN TRANSACTION').run();

      const now = new Date().toISOString();

      // Insertar pago
      const stmt = db.prepare(`
        INSERT INTO pagos (
          factura_id, monto, fecha_pago, forma_pago, referencia, observaciones,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        pago.factura_id,
        pago.monto,
        pago.fecha_pago,
        pago.forma_pago,
        pago.referencia || null,
        pago.observaciones || null,
        now,
        now
      );

      // Obtener total pagado de la factura
      const totalPagado = db.prepare(`
        SELECT COALESCE(SUM(monto), 0) as total
        FROM pagos
        WHERE factura_id = ?
      `).get(pago.factura_id).total;

      // Obtener total de la factura
      const factura = db.prepare('SELECT total FROM facturas WHERE id = ?').get(pago.factura_id);

      // Actualizar estado de la factura
      let nuevoEstado = 'pendiente';
      if (totalPagado >= factura.total) {
        nuevoEstado = 'pagada';
      } else if (totalPagado > 0) {
        nuevoEstado = 'parcial';
      }

      db.prepare('UPDATE facturas SET estado = ? WHERE id = ?').run(nuevoEstado, pago.factura_id);

      db.prepare('COMMIT').run();

      console.log('Pago registrado:', result.lastInsertRowid);

      return {
        success: true,
        data: {
          id: result.lastInsertRowid,
          ...pago,
          nuevo_estado: nuevoEstado
        }
      };
    } catch (error) {
      db.prepare('ROLLBACK').run();
      console.error('Error creating pago:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Obtener pagos de una factura
  ipcMain.handle('pagos:getByFactura', async (event, facturaId) => {
    try {
      const db = getDatabase();
      const stmt = db.prepare(`
        SELECT * FROM pagos
        WHERE factura_id = ?
        ORDER BY fecha_pago DESC
      `);
      const pagos = stmt.all(facturaId);

      return {
        success: true,
        data: pagos
      };
    } catch (error) {
      console.error('Error getting pagos:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Obtener estado de cuenta de un cliente
  ipcMain.handle('pagos:getEstadoCuenta', async (event, clienteId) => {
    try {
      const db = getDatabase();

      // Obtener datos del cliente
      const cliente = db.prepare(`
        SELECT * FROM clientes WHERE id = ?
      `).get(clienteId);

      if (!cliente) {
        return {
          success: false,
          error: 'Cliente no encontrado'
        };
      }

      // Obtener facturas del cliente con su saldo
      const facturas = db.prepare(`
        SELECT
          f.*,
          COALESCE(SUM(p.monto), 0) as monto_pagado,
          (f.total - COALESCE(SUM(p.monto), 0)) as saldo_pendiente
        FROM facturas f
        LEFT JOIN pagos p ON f.id = p.factura_id
        WHERE f.cliente_id = ?
        GROUP BY f.id
        ORDER BY f.fecha DESC
      `).all(clienteId);

      // Calcular totales (resumen en lugar de totales para coincidir con el frontend)
      const resumen = {
        total_facturado: facturas.reduce((sum, f) => sum + f.total, 0),
        total_pagado: facturas.reduce((sum, f) => sum + (f.monto_pagado || 0), 0),
        saldo_pendiente: facturas.reduce((sum, f) => sum + (f.saldo_pendiente || 0), 0),
        facturas_pendientes: facturas.filter(f => (f.saldo_pendiente || 0) > 0).length
      };

      return {
        success: true,
        data: {
          cliente,
          facturas,
          resumen
        }
      };
    } catch (error) {
      console.error('Error getting estado cuenta:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Obtener reporte de cuentas por cobrar
  ipcMain.handle('pagos:getReporteCobrar', async () => {
    try {
      const db = getDatabase();

      const clientes = db.prepare(`
        SELECT
          c.*,
          COUNT(DISTINCT f.id) as total_facturas,
          COALESCE(SUM(f.total), 0) as total_facturado,
          COALESCE(SUM(p.monto), 0) as total_pagado,
          (COALESCE(SUM(f.total), 0) - COALESCE(SUM(p.monto), 0)) as saldo_pendiente
        FROM clientes c
        LEFT JOIN facturas f ON c.id = f.cliente_id AND f.forma_pago = 'credito'
        LEFT JOIN pagos p ON f.id = p.factura_id
        GROUP BY c.id
        HAVING saldo_pendiente > 0
        ORDER BY saldo_pendiente DESC
      `).all();

      const totales = {
        clientes_con_deuda: clientes.length,
        total_por_cobrar: clientes.reduce((sum, c) => sum + c.saldo_pendiente, 0)
      };

      return {
        success: true,
        data: {
          clientes,
          totales
        }
      };
    } catch (error) {
      console.error('Error getting reporte cobrar:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Eliminar pago
  ipcMain.handle('pagos:delete', async (event, id) => {
    const db = getDatabase();

    try {
      db.prepare('BEGIN TRANSACTION').run();

      // Obtener factura_id antes de eliminar
      const pago = db.prepare('SELECT factura_id FROM pagos WHERE id = ?').get(id);

      if (!pago) {
        return {
          success: false,
          error: 'Pago no encontrado'
        };
      }

      // Eliminar pago
      db.prepare('DELETE FROM pagos WHERE id = ?').run(id);

      // Recalcular estado de la factura
      const totalPagado = db.prepare(`
        SELECT COALESCE(SUM(monto), 0) as total
        FROM pagos
        WHERE factura_id = ?
      `).get(pago.factura_id).total;

      const factura = db.prepare('SELECT total FROM facturas WHERE id = ?').get(pago.factura_id);

      let nuevoEstado = 'pendiente';
      if (totalPagado >= factura.total) {
        nuevoEstado = 'pagada';
      } else if (totalPagado > 0) {
        nuevoEstado = 'parcial';
      }

      db.prepare('UPDATE facturas SET estado = ? WHERE id = ?').run(nuevoEstado, pago.factura_id);

      db.prepare('COMMIT').run();

      return {
        success: true
      };
    } catch (error) {
      db.prepare('ROLLBACK').run();
      console.error('Error deleting pago:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  console.log('Pagos IPC handlers registered');
}
