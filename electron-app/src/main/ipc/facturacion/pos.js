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

export function registerPosHandlers() {
  ipcMain.handle('pos:createVenta', async (event, payload = {}) => {
    try {
      const db = getDatabase();
      const caja = obtenerCajaAbierta(db);

      if (!caja) {
        return {
          success: false,
          error: 'Debes abrir la caja antes de registrar ventas'
        };
      }

      const items = Array.isArray(payload.items) ? payload.items : [];
      if (items.length === 0) {
        return {
          success: false,
          error: 'La venta no contiene items'
        };
      }

      const userId = payload.userId || null;
      const pago = payload.pago || {};
      const metodoPago = String(pago.metodo || 'efectivo');

      const crearVenta = db.transaction(() => {
        const now = new Date().toISOString();

        const lastFolio = db.prepare('SELECT COALESCE(MAX(folio), 0) AS lastFolio FROM ventas_pos').get();
        const folio = Number(lastFolio?.lastFolio || 0) + 1;

        let subtotal = 0;

        for (const item of items) {
          const productoId = Number(item.id);
          const cantidad = Number(item.cantidad);
          const precio = Number(item.precio);

          if (!Number.isFinite(productoId) || !Number.isFinite(cantidad) || cantidad <= 0 || !Number.isFinite(precio) || precio < 0) {
            throw new Error('Item de venta inválido');
          }

          const producto = db.prepare('SELECT id, nombre, codigo, stock FROM productos WHERE id = ?').get(productoId);
          if (!producto) {
            throw new Error(`Producto no encontrado (ID ${productoId})`);
          }

          if (Number(producto.stock || 0) < cantidad) {
            throw new Error(`Stock insuficiente para ${producto.nombre}`);
          }

          subtotal += precio * cantidad;
        }

        const iva = Math.round(subtotal * 0.19);
        const total = Math.round(subtotal + iva);
        const montoRecibido = metodoPago === 'efectivo' ? Number(pago.montoRecibido || total) : total;
        const vuelto = metodoPago === 'efectivo' ? Math.max(0, montoRecibido - total) : 0;

        if (metodoPago === 'efectivo' && montoRecibido < total) {
          throw new Error('Monto recibido insuficiente');
        }

        const ventaResult = db.prepare(`
          INSERT INTO ventas_pos (
            caja_id, folio, fecha, subtotal, iva, total,
            metodo_pago, monto_recibido, vuelto,
            rut_cliente, nombre_cliente, user_id,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          caja.id,
          folio,
          now,
          Math.round(subtotal),
          iva,
          total,
          metodoPago,
          montoRecibido,
          vuelto,
          pago.rutCliente || null,
          pago.nombreCliente || null,
          userId,
          now,
          now
        );

        const ventaId = ventaResult.lastInsertRowid;

        const insertItem = db.prepare(`
          INSERT INTO venta_pos_items (
            venta_id, producto_id, nombre_producto, codigo_producto,
            cantidad, precio_unitario, subtotal, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const updateStock = db.prepare(`
          UPDATE productos
          SET stock = stock - ?, updated_at = ?
          WHERE id = ? AND stock >= ?
        `);

        for (const item of items) {
          const productoId = Number(item.id);
          const cantidad = Number(item.cantidad);
          const precio = Number(item.precio);

          const producto = db.prepare('SELECT id, nombre, codigo FROM productos WHERE id = ?').get(productoId);

          insertItem.run(
            ventaId,
            productoId,
            producto.nombre,
            producto.codigo || null,
            cantidad,
            precio,
            Math.round(precio * cantidad),
            now
          );

          const stockResult = updateStock.run(cantidad, now, productoId, cantidad);
          if (stockResult.changes === 0) {
            throw new Error(`No se pudo descontar stock para ${producto.nombre}`);
          }
        }

        if (metodoPago === 'efectivo') {
          db.prepare(`
            INSERT INTO caja_movimientos (
              caja_id, tipo, monto, metodo_pago, descripcion,
              referencia_id, user_id, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            caja.id,
            'venta',
            total,
            'efectivo',
            `Venta POS folio #${folio}`,
            ventaId,
            userId,
            now
          );
        }

        const venta = db.prepare('SELECT * FROM ventas_pos WHERE id = ?').get(ventaId);
        const ventaItems = db.prepare('SELECT * FROM venta_pos_items WHERE venta_id = ? ORDER BY id ASC').all(ventaId);

        return {
          venta,
          items: ventaItems
        };
      });

      const data = crearVenta();

      return {
        success: true,
        data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  });

  ipcMain.handle('pos:getVentasDelDia', async () => {
    try {
      const db = getDatabase();
      const ventas = db
        .prepare(`
          SELECT *
          FROM ventas_pos
          WHERE date(fecha) = date('now', 'localtime')
          ORDER BY id DESC
        `)
        .all();

      const total = ventas.reduce((acc, venta) => acc + Number(venta.total || 0), 0);

      return {
        success: true,
        data: {
          cantidad: ventas.length,
          total,
          ventas
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
