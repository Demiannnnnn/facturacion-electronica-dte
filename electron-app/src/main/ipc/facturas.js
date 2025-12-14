import { ipcMain } from 'electron';
import { getDatabase } from '../database/connection.js';
import dteGenerator from '../services/dte-generator.js';
import { getAPIClient } from '../services/api-client.js';
import fs from 'fs';
import path from 'path';

export function registerFacturasHandlers() {
  // Obtener siguiente folio disponible
  ipcMain.handle('facturas:getNextFolio', async () => {
    try {
      const db = getDatabase();
      const folio = db.prepare('SELECT actual FROM folios WHERE tipo_documento = 33').get();

      if (!folio) {
        throw new Error('No se encontró configuración de folios');
      }

      return {
        success: true,
        data: folio.actual
      };
    } catch (error) {
      console.error('Error getting next folio:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Crear factura con items
  ipcMain.handle('facturas:create', async (event, { factura, items }) => {
    const db = getDatabase();

    try {
      // Iniciar transacción
      db.prepare('BEGIN TRANSACTION').run();

      const now = new Date().toISOString();

      // Obtener y actualizar folio
      const folioInfo = db.prepare('SELECT actual, hasta FROM folios WHERE tipo_documento = 33').get();

      if (folioInfo.actual > folioInfo.hasta) {
        throw new Error('Se han agotado los folios disponibles');
      }

      const folio = folioInfo.actual;

      // Actualizar folio para el próximo
      db.prepare('UPDATE folios SET actual = actual + 1 WHERE tipo_documento = 33').run();

      // Insertar factura
      const stmtFactura = db.prepare(`
        INSERT INTO facturas (
          folio, tipo_documento, cliente_id, fecha, fecha_vencimiento,
          forma_pago, condiciones_pago, subtotal, monto_exento,
          descuento_global, iva, total, estado, observaciones,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const resultFactura = stmtFactura.run(
        folio,
        33, // Factura Electrónica
        factura.cliente_id,
        factura.fecha,
        factura.fecha_vencimiento || null,
        factura.forma_pago || 'contado',
        factura.condiciones_pago || null,
        factura.subtotal,
        factura.monto_exento || 0,
        factura.descuento_global || 0,
        factura.iva,
        factura.total,
        'pendiente',
        factura.observaciones || null,
        now,
        now
      );

      const facturaId = resultFactura.lastInsertRowid;

      // Insertar items
      const stmtItem = db.prepare(`
        INSERT INTO factura_items (
          factura_id, numero_linea, producto_id, codigo_item,
          descripcion, cantidad, unidad, precio_unitario,
          descuento, monto_item
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      items.forEach((item, index) => {
        stmtItem.run(
          facturaId,
          index + 1,
          item.producto_id || null,
          item.codigo_item || null,
          item.descripcion,
          item.cantidad,
          item.unidad || 'UN',
          item.precio_unitario,
          item.descuento || 0,
          item.monto_item
        );

        // Descontar stock si hay producto_id
        if (item.producto_id) {
          db.prepare('UPDATE productos SET stock = stock - ? WHERE id = ?')
            .run(item.cantidad, item.producto_id);
        }
      });

      // Commit transacción
      db.prepare('COMMIT').run();

      console.log('Factura creada:', facturaId, 'Folio:', folio);

      // Generar XML DTE y enviar al SII
      try {
        const api = getAPIClient();

        // Obtener datos del emisor
        const emisor = db.prepare('SELECT * FROM emisor WHERE id = 1').get();

        // Obtener factura completa con items para generar XML
        const facturaCompleta = db.prepare(`
          SELECT
            f.*,
            c.rut as cliente_rut,
            c.razon_social as cliente_razon_social,
            c.giro as cliente_giro,
            c.direccion as cliente_direccion,
            c.comuna as cliente_comuna,
            c.ciudad as cliente_ciudad
          FROM facturas f
          JOIN clientes c ON f.cliente_id = c.id
          WHERE f.id = ?
        `).get(facturaId);

        const itemsFactura = db.prepare('SELECT * FROM factura_items WHERE factura_id = ? ORDER BY numero_linea').all(facturaId);
        facturaCompleta.items = itemsFactura;

        // Generar XML DTE
        const xmlDTE = dteGenerator.generarFacturaElectronica(facturaCompleta, emisor);

        // Validar XML
        const validacion = dteGenerator.validarXML(xmlDTE);
        if (!validacion.valid) {
          console.error('XML inválido:', validacion.error);
          // No bloqueamos la factura, solo logueamos
        }

        // Guardar XML localmente (para debugging)
        const xmlDir = path.join(process.cwd(), 'XMLs');
        if (!fs.existsSync(xmlDir)) {
          fs.mkdirSync(xmlDir, { recursive: true });
        }
        const xmlPath = path.join(xmlDir, `factura-${folio}.xml`);
        fs.writeFileSync(xmlPath, xmlDTE, 'utf-8');

        // Enviar al SII (mock o producción según API_MODE)
        const dteResult = await api.enviarDTE({
          folio: folio,
          tipoDocumento: 33,
          xml: xmlDTE,
          emisor: {
            rut: emisor.rut,
            razonSocial: emisor.razon_social
          },
          receptor: {
            rut: facturaCompleta.cliente_rut,
            razonSocial: facturaCompleta.cliente_razon_social
          }
        });

        // Actualizar factura con resultado del SII
        if (dteResult.success) {
          db.prepare(`
            UPDATE facturas 
            SET sii_track_id = ?, sii_estado = ?, updated_at = ?
            WHERE id = ?
          `).run(dteResult.trackId, dteResult.estado, new Date().toISOString(), facturaId);

          console.log('DTE enviado al SII:', dteResult.trackId);
        } else {
          console.error('Error enviando DTE al SII:', dteResult.error);
          // No bloqueamos la factura, solo logueamos
        }

      } catch (error) {
        console.error('Error en proceso SII:', error);
        // No bloqueamos la creación de la factura si falla el SII
      }

      return {
        success: true,
        data: {
          id: facturaId,
          folio: folio
        }
      };
    } catch (error) {
      // Rollback en caso de error
      db.prepare('ROLLBACK').run();
      console.error('Error creating factura:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Obtener todas las facturas
  ipcMain.handle('facturas:getAll', async () => {
    try {
      const db = getDatabase();
      const stmt = db.prepare(`
        SELECT
          f.*,
          c.razon_social as cliente_nombre,
          c.rut as cliente_rut
        FROM facturas f
        JOIN clientes c ON f.cliente_id = c.id
        ORDER BY f.folio DESC
      `);
      const facturas = stmt.all();

      return {
        success: true,
        data: facturas
      };
    } catch (error) {
      console.error('Error getting facturas:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Obtener factura por ID con sus items
  ipcMain.handle('facturas:getById', async (event, id) => {
    try {
      const db = getDatabase();

      // Obtener factura con datos del cliente
      const factura = db.prepare(`
        SELECT
          f.*,
          c.rut as cliente_rut,
          c.razon_social as cliente_razon_social,
          c.giro as cliente_giro,
          c.direccion as cliente_direccion,
          c.comuna as cliente_comuna,
          c.ciudad as cliente_ciudad,
          c.region as cliente_region,
          c.telefono as cliente_telefono,
          c.email as cliente_email
        FROM facturas f
        JOIN clientes c ON f.cliente_id = c.id
        WHERE f.id = ?
      `).get(id);

      if (!factura) {
        return {
          success: false,
          error: 'Factura no encontrada'
        };
      }

      // Obtener items de la factura
      const items = db.prepare(`
        SELECT * FROM factura_items
        WHERE factura_id = ?
        ORDER BY numero_linea
      `).all(id);

      factura.items = items;

      return {
        success: true,
        data: factura
      };
    } catch (error) {
      console.error('Error getting factura:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Actualizar estado de factura
  ipcMain.handle('facturas:updateEstado', async (event, { id, estado }) => {
    try {
      const db = getDatabase();
      const now = new Date().toISOString();

      const stmt = db.prepare(`
        UPDATE facturas
        SET estado = ?, updated_at = ?
        WHERE id = ?
      `);

      const result = stmt.run(estado, now, id);

      if (result.changes === 0) {
        return {
          success: false,
          error: 'Factura no encontrada'
        };
      }

      console.log('Estado de factura actualizado:', id, 'Nuevo estado:', estado);

      return {
        success: true
      };
    } catch (error) {
      console.error('Error updating factura estado:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Buscar facturas con filtros
  ipcMain.handle('facturas:search', async (event, filters) => {
    try {
      const db = getDatabase();
      let query = `
        SELECT
          f.*,
          c.razon_social as cliente_nombre,
          c.rut as cliente_rut
        FROM facturas f
        JOIN clientes c ON f.cliente_id = c.id
        WHERE 1=1
      `;
      const params = [];

      if (filters.estado && filters.estado !== 'todos') {
        query += ' AND f.estado = ?';
        params.push(filters.estado);
      }

      if (filters.cliente_id) {
        query += ' AND f.cliente_id = ?';
        params.push(filters.cliente_id);
      }

      if (filters.fecha_desde) {
        query += ' AND f.fecha >= ?';
        params.push(filters.fecha_desde);
      }

      if (filters.fecha_hasta) {
        query += ' AND f.fecha <= ?';
        params.push(filters.fecha_hasta);
      }

      query += ' ORDER BY f.folio DESC';

      const stmt = db.prepare(query);
      const facturas = stmt.all(...params);

      return {
        success: true,
        data: facturas
      };
    } catch (error) {
      console.error('Error searching facturas:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Obtener/Crear datos del emisor
  ipcMain.handle('emisor:get', async () => {
    try {
      const db = getDatabase();
      const emisor = db.prepare('SELECT * FROM emisor WHERE id = 1').get();

      return {
        success: true,
        data: emisor || null
      };
    } catch (error) {
      console.error('Error getting emisor:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  ipcMain.handle('emisor:save', async (event, emisor) => {
    try {
      const db = getDatabase();
      const now = new Date().toISOString();

      const existing = db.prepare('SELECT id FROM emisor WHERE id = 1').get();

      if (existing) {
        // Actualizar
        const stmt = db.prepare(`
          UPDATE emisor
          SET rut = ?, razon_social = ?, nombre_fantasia = ?, giro = ?,
              direccion = ?, comuna = ?, ciudad = ?, region = ?,
              telefono = ?, email = ?, updated_at = ?
          WHERE id = 1
        `);

        stmt.run(
          emisor.rut,
          emisor.razon_social,
          emisor.nombre_fantasia || null,
          emisor.giro,
          emisor.direccion,
          emisor.comuna,
          emisor.ciudad,
          emisor.region || null,
          emisor.telefono || null,
          emisor.email || null,
          now
        );
      } else {
        // Crear
        const stmt = db.prepare(`
          INSERT INTO emisor (
            id, rut, razon_social, nombre_fantasia, giro,
            direccion, comuna, ciudad, region, telefono, email,
            created_at, updated_at
          ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(
          emisor.rut,
          emisor.razon_social,
          emisor.nombre_fantasia || null,
          emisor.giro,
          emisor.direccion,
          emisor.comuna,
          emisor.ciudad,
          emisor.region || null,
          emisor.telefono || null,
          emisor.email || null,
          now,
          now
        );
      }

      console.log('Datos de emisor guardados');

      return {
        success: true
      };
    } catch (error) {
      console.error('Error saving emisor:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Guardar PDF en disco
  ipcMain.handle('facturas:savePDF', async (event, { fileName, buffer }) => {
    try {
      const path = await import('path');
      const fs = await import('fs/promises');
      const { app } = await import('electron');

      // Obtener la ruta del proyecto (directorio donde está package.json)
      const projectRoot = app.getAppPath().includes('app.asar')
        ? path.join(process.resourcesPath, '..')
        : path.join(app.getAppPath(), '../..');

      const pdfsDir = path.join(projectRoot, 'PDFs');

      // Crear directorio PDFs si no existe
      try {
        await fs.access(pdfsDir);
      } catch {
        await fs.mkdir(pdfsDir, { recursive: true });
      }

      const filePath = path.join(pdfsDir, fileName);

      // Convertir array a Buffer y guardar
      const bufferData = Buffer.from(buffer);
      await fs.writeFile(filePath, bufferData);

      console.log('PDF saved to:', filePath);

      return {
        success: true,
        path: filePath
      };
    } catch (error) {
      console.error('Error saving PDF:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Abrir PDF guardado
  ipcMain.handle('facturas:openPDF', async (event, pdfPath) => {
    try {
      const { shell } = await import('electron');
      const fs = await import('fs/promises');

      // Verificar que el archivo existe
      try {
        await fs.access(pdfPath);
      } catch {
        return {
          success: false,
          error: 'El archivo PDF no existe'
        };
      }

      // Abrir con la aplicación predeterminada del sistema
      await shell.openPath(pdfPath);

      return {
        success: true
      };
    } catch (error) {
      console.error('Error opening PDF:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Actualizar ruta del PDF en la factura
  ipcMain.handle('facturas:updatePDFPath', async (event, { id, pdfPath }) => {
    try {
      const db = getDatabase();
      const now = new Date().toISOString();

      const stmt = db.prepare(`
        UPDATE facturas
        SET pdf_path = ?, updated_at = ?
        WHERE id = ?
      `);

      const result = stmt.run(pdfPath, now, id);

      if (result.changes === 0) {
        return {
          success: false,
          error: 'Factura no encontrada'
        };
      }

      console.log('PDF path updated for factura:', id);

      return {
        success: true
      };
    } catch (error) {
      console.error('Error updating PDF path:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Obtener reporte de ventas por período
  ipcMain.handle('facturas:getReporteVentas', async (event, { fecha_desde, fecha_hasta }) => {
    try {
      const db = getDatabase();

      // Obtener facturas del período
      const facturas = db.prepare(`
        SELECT
          f.*,
          c.razon_social as cliente_nombre,
          c.rut as cliente_rut
        FROM facturas f
        JOIN clientes c ON f.cliente_id = c.id
        WHERE f.fecha >= ? AND f.fecha <= ?
        ORDER BY f.fecha ASC, f.folio ASC
      `).all(fecha_desde, fecha_hasta);

      // Calcular totales
      const totales = {
        cantidad_facturas: facturas.length,
        subtotal: 0,
        monto_exento: 0,
        descuento_global: 0,
        iva: 0,
        total: 0,
        por_estado: {
          pendiente: 0,
          pagada: 0,
          vencida: 0,
          anulada: 0
        },
        por_forma_pago: {
          contado: 0,
          credito: 0
        }
      };

      facturas.forEach(factura => {
        totales.subtotal += factura.subtotal;
        totales.monto_exento += factura.monto_exento || 0;
        totales.descuento_global += factura.descuento_global || 0;
        totales.iva += factura.iva;
        totales.total += factura.total;

        // Contar por estado
        if (totales.por_estado[factura.estado] !== undefined) {
          totales.por_estado[factura.estado]++;
        }

        // Contar por forma de pago
        const formaPago = factura.forma_pago || 'contado';
        if (totales.por_forma_pago[formaPago] !== undefined) {
          totales.por_forma_pago[formaPago]++;
        }
      });

      // Obtener productos más vendidos del período
      const productosMasVendidos = db.prepare(`
        SELECT
          fi.descripcion,
          fi.producto_id,
          SUM(fi.cantidad) as cantidad_total,
          SUM(fi.monto_item) as monto_total,
          COUNT(DISTINCT fi.factura_id) as veces_vendido
        FROM factura_items fi
        JOIN facturas f ON fi.factura_id = f.id
        WHERE f.fecha >= ? AND f.fecha <= ?
        GROUP BY COALESCE(fi.producto_id, fi.descripcion)
        ORDER BY cantidad_total DESC
        LIMIT 10
      `).all(fecha_desde, fecha_hasta);

      // Obtener clientes con más compras
      const topClientes = db.prepare(`
        SELECT
          c.id,
          c.rut,
          c.razon_social,
          COUNT(f.id) as cantidad_facturas,
          SUM(f.total) as total_comprado
        FROM clientes c
        JOIN facturas f ON c.id = f.cliente_id
        WHERE f.fecha >= ? AND f.fecha <= ?
        GROUP BY c.id
        ORDER BY total_comprado DESC
        LIMIT 10
      `).all(fecha_desde, fecha_hasta);

      return {
        success: true,
        data: {
          fecha_desde,
          fecha_hasta,
          facturas,
          totales,
          productosMasVendidos,
          topClientes
        }
      };
    } catch (error) {
      console.error('Error getting reporte ventas:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Obtener reporte de productos
  ipcMain.handle('productos:getReporte', async () => {
    try {
      const db = getDatabase();

      // Obtener todos los productos con información de ventas
      const productos = db.prepare(`
        SELECT
          p.*,
          COALESCE(SUM(fi.cantidad), 0) as cantidad_vendida,
          COALESCE(SUM(fi.monto_item), 0) as monto_vendido,
          COALESCE(COUNT(DISTINCT fi.factura_id), 0) as veces_vendido
        FROM productos p
        LEFT JOIN factura_items fi ON p.id = fi.producto_id
        GROUP BY p.id
        ORDER BY cantidad_vendida DESC
      `).all();

      // Calcular totales y estadísticas
      const totales = {
        total_productos: productos.length,
        valor_inventario: 0,
        productos_bajo_stock: 0,
        productos_sin_stock: 0,
        productos_sin_movimiento: 0
      };

      const STOCK_MINIMO = 10; // Umbral para stock bajo

      productos.forEach(producto => {
        totales.valor_inventario += (producto.precio * producto.stock);

        if (producto.stock === 0) {
          totales.productos_sin_stock++;
        } else if (producto.stock < STOCK_MINIMO) {
          totales.productos_bajo_stock++;
        }

        if (producto.cantidad_vendida === 0) {
          totales.productos_sin_movimiento++;
        }
      });

      // Productos con bajo stock
      const productosBajoStock = productos
        .filter(p => p.stock > 0 && p.stock < STOCK_MINIMO)
        .sort((a, b) => a.stock - b.stock);

      // Productos sin stock
      const productosSinStock = productos
        .filter(p => p.stock === 0);

      // Productos más vendidos
      const productosMasVendidos = productos
        .filter(p => p.cantidad_vendida > 0)
        .sort((a, b) => b.cantidad_vendida - a.cantidad_vendida)
        .slice(0, 10);

      // Productos sin movimiento
      const productosSinMovimiento = productos
        .filter(p => p.cantidad_vendida === 0);

      // Productos por valor en inventario
      const productosPorValor = [...productos]
        .sort((a, b) => (b.precio * b.stock) - (a.precio * a.stock))
        .slice(0, 10);

      return {
        success: true,
        data: {
          productos,
          totales,
          productosBajoStock,
          productosSinStock,
          productosMasVendidos,
          productosSinMovimiento,
          productosPorValor
        }
      };
    } catch (error) {
      console.error('Error getting reporte productos:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Obtener reporte de pagos y cobranzas
  ipcMain.handle('facturas:getReportePagos', async () => {
    try {
      const db = getDatabase();
      const hoy = new Date().toISOString().split('T')[0];

      // Obtener todas las facturas con información de pagos
      const facturas = db.prepare(`
        SELECT
          f.*,
          c.razon_social as cliente_nombre,
          c.rut as cliente_rut,
          c.telefono as cliente_telefono,
          c.email as cliente_email
        FROM facturas f
        JOIN clientes c ON f.cliente_id = c.id
        ORDER BY f.fecha DESC
      `).all();

      // Clasificar facturas
      const facturasPagadas = facturas.filter(f => f.estado === 'pagada');
      const facturasPendientes = facturas.filter(f => f.estado === 'pendiente');
      const facturasVencidas = facturas.filter(f => {
        if (f.estado === 'vencida') return true;
        if (f.estado === 'pendiente' && f.fecha_vencimiento && f.fecha_vencimiento < hoy) return true;
        return false;
      });

      // Calcular totales
      const totales = {
        total_cobrado: facturasPagadas.reduce((sum, f) => sum + f.total, 0),
        total_por_cobrar: facturasPendientes.reduce((sum, f) => sum + f.total, 0),
        total_vencido: facturasVencidas.reduce((sum, f) => sum + f.total, 0),
        cantidad_pagadas: facturasPagadas.length,
        cantidad_pendientes: facturasPendientes.length,
        cantidad_vencidas: facturasVencidas.length
      };

      // Facturas por vencer (próximos 30 días)
      const fecha30Dias = new Date();
      fecha30Dias.setDate(fecha30Dias.getDate() + 30);
      const fecha30DiasStr = fecha30Dias.toISOString().split('T')[0];

      const facturasPorVencer = facturas.filter(f =>
        f.estado === 'pendiente' &&
        f.fecha_vencimiento &&
        f.fecha_vencimiento >= hoy &&
        f.fecha_vencimiento <= fecha30DiasStr
      );

      // Agrupar por vencimiento
      const proximos7Dias = facturas.filter(f => {
        if (f.estado !== 'pendiente' || !f.fecha_vencimiento) return false;
        const fecha7Dias = new Date();
        fecha7Dias.setDate(fecha7Dias.getDate() + 7);
        return f.fecha_vencimiento >= hoy && f.fecha_vencimiento <= fecha7Dias.toISOString().split('T')[0];
      });

      const proximos15Dias = facturas.filter(f => {
        if (f.estado !== 'pendiente' || !f.fecha_vencimiento) return false;
        const fecha15Dias = new Date();
        fecha15Dias.setDate(fecha15Dias.getDate() + 15);
        return f.fecha_vencimiento >= hoy && f.fecha_vencimiento <= fecha15Dias.toISOString().split('T')[0];
      });

      // Top clientes con deuda
      const deudaPorCliente = {};
      facturasPendientes.concat(facturasVencidas).forEach(f => {
        if (!deudaPorCliente[f.cliente_id]) {
          deudaPorCliente[f.cliente_id] = {
            cliente_id: f.cliente_id,
            cliente_nombre: f.cliente_nombre,
            cliente_rut: f.cliente_rut,
            cliente_telefono: f.cliente_telefono,
            cliente_email: f.cliente_email,
            total_deuda: 0,
            cantidad_facturas: 0,
            facturas_vencidas: 0
          };
        }
        deudaPorCliente[f.cliente_id].total_deuda += f.total;
        deudaPorCliente[f.cliente_id].cantidad_facturas++;
        if (facturasVencidas.some(fv => fv.id === f.id)) {
          deudaPorCliente[f.cliente_id].facturas_vencidas++;
        }
      });

      const topDeudores = Object.values(deudaPorCliente)
        .sort((a, b) => b.total_deuda - a.total_deuda)
        .slice(0, 10);

      // Flujo de caja proyectado (próximos 90 días)
      const proyeccion = [];
      for (let i = 0; i < 90; i += 7) {
        const fechaInicio = new Date();
        fechaInicio.setDate(fechaInicio.getDate() + i);
        const fechaFin = new Date();
        fechaFin.setDate(fechaFin.getDate() + i + 6);

        const facturasEnPeriodo = facturas.filter(f =>
          f.estado === 'pendiente' &&
          f.fecha_vencimiento &&
          f.fecha_vencimiento >= fechaInicio.toISOString().split('T')[0] &&
          f.fecha_vencimiento <= fechaFin.toISOString().split('T')[0]
        );

        proyeccion.push({
          periodo: `${fechaInicio.toLocaleDateString('es-CL')} - ${fechaFin.toLocaleDateString('es-CL')}`,
          monto_esperado: facturasEnPeriodo.reduce((sum, f) => sum + f.total, 0),
          cantidad_facturas: facturasEnPeriodo.length
        });
      }

      return {
        success: true,
        data: {
          totales,
          facturasPagadas: facturasPagadas.slice(0, 50), // Últimas 50
          facturasPendientes,
          facturasVencidas,
          facturasPorVencer,
          proximos7Dias,
          proximos15Dias,
          topDeudores,
          proyeccion
        }
      };
    } catch (error) {
      console.error('Error getting reporte pagos:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Obtener reporte tributario
  ipcMain.handle('facturas:getReporteTributario', async (event, { mes, anio }) => {
    try {
      const db = getDatabase();

      // Si no se especifica mes/año, usar el actual
      if (!mes || !anio) {
        const hoy = new Date();
        mes = hoy.getMonth() + 1;
        anio = hoy.getFullYear();
      }

      // Calcular rango de fechas del mes
      const fechaDesde = `${anio}-${String(mes).padStart(2, '0')}-01`;
      const ultimoDia = new Date(anio, mes, 0).getDate();
      const fechaHasta = `${anio}-${String(mes).padStart(2, '0')}-${ultimoDia}`;

      // Obtener facturas del mes
      const facturas = db.prepare(`
        SELECT
          f.*,
          c.razon_social as cliente_nombre,
          c.rut as cliente_rut
        FROM facturas f
        JOIN clientes c ON f.cliente_id = c.id
        WHERE f.fecha >= ? AND f.fecha <= ?
        ORDER BY f.fecha ASC
      `).all(fechaDesde, fechaHasta);

      // Totales del mes
      const totales = {
        cantidad_documentos: facturas.length,
        ventas_netas: 0,
        ventas_exentas: 0,
        total_iva: 0,
        total_facturado: 0,
        documentos_anulados: 0,
        monto_anulado: 0
      };

      const facturasPorDia = {};

      facturas.forEach(f => {
        if (f.estado === 'anulada') {
          totales.documentos_anulados++;
          totales.monto_anulado += f.total;
        } else {
          totales.ventas_netas += f.subtotal;
          totales.ventas_exentas += f.monto_exento || 0;
          totales.total_iva += f.iva;
          totales.total_facturado += f.total;
        }

        // Agrupar por día
        const dia = f.fecha;
        if (!facturasPorDia[dia]) {
          facturasPorDia[dia] = {
            fecha: dia,
            cantidad: 0,
            neto: 0,
            iva: 0,
            total: 0
          };
        }
        if (f.estado !== 'anulada') {
          facturasPorDia[dia].cantidad++;
          facturasPorDia[dia].neto += f.subtotal;
          facturasPorDia[dia].iva += f.iva;
          facturasPorDia[dia].total += f.total;
        }
      });

      // Convertir a array y ordenar
      const ventasPorDia = Object.values(facturasPorDia).sort((a, b) => a.fecha.localeCompare(b.fecha));

      // Resumen por tipo de documento (para este caso, solo facturas tipo 33)
      const porTipoDocumento = {
        33: {
          nombre: 'Factura Electrónica',
          cantidad: facturas.filter(f => f.estado !== 'anulada').length,
          neto: totales.ventas_netas,
          iva: totales.total_iva,
          total: totales.total_facturado
        }
      };

      // Información para formulario 29 (SII)
      const formulario29 = {
        periodo: `${mes}/${anio}`,
        codigo_100: totales.ventas_netas, // Ventas netas
        codigo_105: totales.total_iva, // IVA débito fiscal
        codigo_110: totales.ventas_exentas, // Ventas exentas
        // Nota: Otros códigos se calcularían con compras y otros datos
      };

      // Resumen anual hasta el mes actual
      const resumenAnual = db.prepare(`
        SELECT
          strftime('%m', f.fecha) as mes,
          COUNT(*) as cantidad,
          SUM(CASE WHEN f.estado != 'anulada' THEN f.subtotal ELSE 0 END) as neto,
          SUM(CASE WHEN f.estado != 'anulada' THEN f.iva ELSE 0 END) as iva,
          SUM(CASE WHEN f.estado != 'anulada' THEN f.total ELSE 0 END) as total
        FROM facturas f
        WHERE strftime('%Y', f.fecha) = ?
        GROUP BY strftime('%m', f.fecha)
        ORDER BY mes
      `).all(String(anio));

      const mesesNombre = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];

      const ventasPorMes = resumenAnual.map(m => ({
        mes: mesesNombre[parseInt(m.mes) - 1],
        mes_num: m.mes,
        cantidad: m.cantidad,
        neto: m.neto,
        iva: m.iva,
        total: m.total
      }));

      // Totales anuales
      const totalesAnuales = {
        cantidad_documentos: resumenAnual.reduce((sum, m) => sum + m.cantidad, 0),
        ventas_netas: resumenAnual.reduce((sum, m) => sum + m.neto, 0),
        total_iva: resumenAnual.reduce((sum, m) => sum + m.iva, 0),
        total_facturado: resumenAnual.reduce((sum, m) => sum + m.total, 0)
      };

      return {
        success: true,
        data: {
          mes,
          anio,
          fecha_desde: fechaDesde,
          fecha_hasta: fechaHasta,
          totales,
          facturas,
          ventasPorDia,
          porTipoDocumento,
          formulario29,
          ventasPorMes,
          totalesAnuales
        }
      };
    } catch (error) {
      console.error('Error getting reporte tributario:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  console.log('Facturas IPC handlers registered');
}

