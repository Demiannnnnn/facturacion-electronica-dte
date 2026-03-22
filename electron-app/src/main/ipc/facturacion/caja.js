import { ipcMain } from 'electron';
import { getDatabase } from '../../database/connection.js';

function obtenerCajaAbierta(db) {
  return db
    .prepare(`
      SELECT *
      FROM cajas
      WHERE estado = 'abierta'
      ORDER BY id DESC
      LIMIT 1
    `)
    .get();
}

function obtenerResumenCaja(db, cajaId) {
  const caja = db.prepare('SELECT * FROM cajas WHERE id = ?').get(cajaId);
  if (!caja) {
    return null;
  }

  const ingresosManuales =
    db
      .prepare(`
        SELECT COALESCE(SUM(monto), 0) AS total
        FROM caja_movimientos
        WHERE caja_id = ? AND tipo = 'ingreso'
      `)
      .get(cajaId)?.total || 0;

  const egresosManuales =
    db
      .prepare(`
        SELECT COALESCE(SUM(monto), 0) AS total
        FROM caja_movimientos
        WHERE caja_id = ? AND tipo = 'egreso'
      `)
      .get(cajaId)?.total || 0;

  const ventasEfectivo =
    db
      .prepare(`
        SELECT COALESCE(SUM(total), 0) AS total
        FROM ventas_pos
        WHERE caja_id = ? AND metodo_pago = 'efectivo'
      `)
      .get(cajaId)?.total || 0;

  const saldoSistema = caja.monto_inicial + ingresosManuales + ventasEfectivo - egresosManuales;

  return {
    montoInicial: caja.monto_inicial,
    ingresosManuales,
    egresosManuales,
    ventasEfectivo,
    saldoSistema
  };
}

function obtenerMovimientosCaja(db, cajaId, limit = 200) {
  return db
    .prepare(`
      SELECT *
      FROM caja_movimientos
      WHERE caja_id = ?
      ORDER BY id DESC
      LIMIT ?
    `)
    .all(cajaId, limit);
}

export function registerCajaHandlers() {
  ipcMain.handle('caja:getEstadoActual', async () => {
    try {
      const db = getDatabase();
      const caja = obtenerCajaAbierta(db);

      if (!caja) {
        return {
          success: true,
          data: {
            abierta: false,
            caja: null,
            movimientos: [],
            resumen: null
          }
        };
      }

      return {
        success: true,
        data: {
          abierta: true,
          caja,
          movimientos: obtenerMovimientosCaja(db, caja.id),
          resumen: obtenerResumenCaja(db, caja.id)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  });

  ipcMain.handle('caja:abrir', async (event, payload = {}) => {
    try {
      const db = getDatabase();
      const cajaAbierta = obtenerCajaAbierta(db);

      if (cajaAbierta) {
        return {
          success: false,
          error: 'Ya existe una caja abierta'
        };
      }

      const montoInicial = Number(payload.montoInicial);
      if (!Number.isFinite(montoInicial) || montoInicial < 0) {
        return {
          success: false,
          error: 'Monto inicial inválido'
        };
      }

      const now = new Date().toISOString();
      const insertCaja = db.prepare(`
        INSERT INTO cajas (
          estado, fecha_apertura, monto_inicial,
          observaciones_apertura, user_apertura_id,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      const resultCaja = insertCaja.run(
        'abierta',
        now,
        montoInicial,
        payload.observaciones || null,
        payload.userId || null,
        now,
        now
      );

      const cajaId = resultCaja.lastInsertRowid;

      db.prepare(`
        INSERT INTO caja_movimientos (
          caja_id, tipo, monto, metodo_pago, descripcion,
          referencia_id, user_id, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        cajaId,
        'apertura',
        montoInicial,
        'efectivo',
        'Apertura de caja',
        null,
        payload.userId || null,
        now
      );

      return {
        success: true,
        data: {
          caja: db.prepare('SELECT * FROM cajas WHERE id = ?').get(cajaId),
          movimientos: obtenerMovimientosCaja(db, cajaId),
          resumen: obtenerResumenCaja(db, cajaId)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  });

  ipcMain.handle('caja:registrarMovimiento', async (event, payload = {}) => {
    try {
      const db = getDatabase();
      const caja = obtenerCajaAbierta(db);

      if (!caja) {
        return {
          success: false,
          error: 'No hay una caja abierta'
        };
      }

      const tipo = payload.tipo;
      if (tipo !== 'ingreso' && tipo !== 'egreso') {
        return {
          success: false,
          error: 'Tipo de movimiento inválido'
        };
      }

      const monto = Number(payload.monto);
      if (!Number.isFinite(monto) || monto <= 0) {
        return {
          success: false,
          error: 'Monto inválido'
        };
      }

      if (!payload.concepto || !String(payload.concepto).trim()) {
        return {
          success: false,
          error: 'Concepto requerido'
        };
      }

      const now = new Date().toISOString();

      const result = db.prepare(`
        INSERT INTO caja_movimientos (
          caja_id, tipo, monto, metodo_pago, descripcion,
          referencia_id, user_id, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        caja.id,
        tipo,
        monto,
        payload.metodoPago || 'efectivo',
        String(payload.concepto).trim(),
        null,
        payload.userId || null,
        now
      );

      return {
        success: true,
        data: {
          movimiento: db.prepare('SELECT * FROM caja_movimientos WHERE id = ?').get(result.lastInsertRowid),
          movimientos: obtenerMovimientosCaja(db, caja.id),
          resumen: obtenerResumenCaja(db, caja.id)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  });

  ipcMain.handle('caja:cerrar', async (event, payload = {}) => {
    try {
      const db = getDatabase();
      const caja = obtenerCajaAbierta(db);

      if (!caja) {
        return {
          success: false,
          error: 'No hay una caja abierta'
        };
      }

      const arqueoTotal = Number(payload.arqueoTotal);
      if (!Number.isFinite(arqueoTotal) || arqueoTotal < 0) {
        return {
          success: false,
          error: 'Arqueo de efectivo inválido'
        };
      }

      const resumen = obtenerResumenCaja(db, caja.id);
      const diferencia = arqueoTotal - resumen.saldoSistema;
      const now = new Date().toISOString();

      db.prepare(`
        UPDATE cajas
        SET
          estado = 'cerrada',
          fecha_cierre = ?,
          monto_cierre_sistema = ?,
          monto_cierre_fisico = ?,
          diferencia_cierre = ?,
          observaciones_cierre = ?,
          user_cierre_id = ?,
          updated_at = ?
        WHERE id = ?
      `).run(
        now,
        resumen.saldoSistema,
        arqueoTotal,
        diferencia,
        payload.observaciones || null,
        payload.userId || null,
        now,
        caja.id
      );

      db.prepare(`
        INSERT INTO caja_movimientos (
          caja_id, tipo, monto, metodo_pago, descripcion,
          referencia_id, user_id, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        caja.id,
        'cierre',
        arqueoTotal,
        'efectivo',
        'Cierre de caja',
        null,
        payload.userId || null,
        now
      );

      return {
        success: true,
        data: {
          caja: db.prepare('SELECT * FROM cajas WHERE id = ?').get(caja.id),
          resumen: {
            ...resumen,
            arqueoTotal,
            diferencia
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  });
}
