import { ipcMain } from 'electron';
import { getDatabase } from '../../database/connection.js';
import { safeLog, safeError } from '../../utils/logger.js';

export function registerReportesHandlers() {
  // Obtener estadísticas rápidas del dashboard
  ipcMain.handle('reportes:getQuickStats', async (event, periodo = 'mes') => {
    try {
      const db = getDatabase();
      const { fechaInicio, fechaFin } = calcularRangoPeriodo(periodo);

      // Ventas del período
      const ventasResult = db.prepare(`
        SELECT
          COUNT(*) as total_facturas,
          COALESCE(SUM(total), 0) as total_ventas,
          COALESCE(SUM(iva), 0) as total_iva,
          COALESCE(SUM(subtotal), 0) as total_neto
        FROM facturas
        WHERE fecha >= ? AND fecha <= ?
        AND estado != 'anulada'
      `).get(fechaInicio, fechaFin);

      // Clientes activos (que han comprado en el período)
      const clientesActivos = db.prepare(`
        SELECT COUNT(DISTINCT cliente_id) as count
        FROM facturas
        WHERE fecha >= ? AND fecha <= ?
        AND estado != 'anulada'
      `).get(fechaInicio, fechaFin);

      // Productos más vendidos (top 5)
      const productosMasVendidos = db.prepare(`
        SELECT COUNT(DISTINCT fi.producto_id) as count
        FROM factura_items fi
        JOIN facturas f ON fi.factura_id = f.id
        WHERE f.fecha >= ? AND f.fecha <= ?
        AND f.estado != 'anulada'
        AND fi.producto_id IS NOT NULL
      `).get(fechaInicio, fechaFin);

      return {
        success: true,
        data: {
          ventasMes: ventasResult.total_ventas,
          facturasMes: ventasResult.total_facturas,
          clientesActivos: clientesActivos.count,
          productosMasVendidos: productosMasVendidos.count,
          ivaTotal: ventasResult.total_iva,
          netoTotal: ventasResult.total_neto
        }
      };
    } catch (error) {
      safeError('Error getting quick stats:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Reporte de ventas por período
  ipcMain.handle('reportes:ventasPorPeriodo', async (event, { periodo, fechaInicio, fechaFin }) => {
    try {
      const db = getDatabase();
      const rango = periodo === 'personalizado'
        ? { fechaInicio, fechaFin }
        : calcularRangoPeriodo(periodo);

      // Resumen de ventas
      const resumen = db.prepare(`
        SELECT
          COUNT(*) as total_facturas,
          COALESCE(SUM(total), 0) as total_ventas,
          COALESCE(SUM(iva), 0) as total_iva,
          COALESCE(SUM(subtotal), 0) as total_neto,
          COALESCE(SUM(descuento_global), 0) as total_descuentos,
          COALESCE(SUM(monto_exento), 0) as total_exento
        FROM facturas
        WHERE fecha >= ? AND fecha <= ?
        AND estado != 'anulada'
      `).get(rango.fechaInicio, rango.fechaFin);

      // Ventas por día
      const ventasPorDia = db.prepare(`
        SELECT
          DATE(fecha) as dia,
          COUNT(*) as cantidad_facturas,
          SUM(total) as total
        FROM facturas
        WHERE fecha >= ? AND fecha <= ?
        AND estado != 'anulada'
        GROUP BY DATE(fecha)
        ORDER BY dia
      `).all(rango.fechaInicio, rango.fechaFin);

      // Ventas por forma de pago
      const ventasPorFormaPago = db.prepare(`
        SELECT
          forma_pago,
          COUNT(*) as cantidad,
          SUM(total) as total
        FROM facturas
        WHERE fecha >= ? AND fecha <= ?
        AND estado != 'anulada'
        GROUP BY forma_pago
      `).all(rango.fechaInicio, rango.fechaFin);

      return {
        success: true,
        data: {
          periodo: {
            inicio: rango.fechaInicio,
            fin: rango.fechaFin
          },
          resumen,
          ventasPorDia,
          ventasPorFormaPago
        }
      };
    } catch (error) {
      safeError('Error generating ventas report:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Reporte de facturas emitidas
  ipcMain.handle('reportes:facturasEmitidas', async (event, { periodo, fechaInicio, fechaFin, estado }) => {
    try {
      const db = getDatabase();
      const rango = periodo === 'personalizado'
        ? { fechaInicio, fechaFin }
        : calcularRangoPeriodo(periodo);

      let query = `
        SELECT
          f.*,
          c.razon_social as cliente_nombre,
          c.rut as cliente_rut
        FROM facturas f
        JOIN clientes c ON f.cliente_id = c.id
        WHERE f.fecha >= ? AND f.fecha <= ?
      `;

      const params = [rango.fechaInicio, rango.fechaFin];

      if (estado && estado !== 'todos') {
        query += ' AND f.estado = ?';
        params.push(estado);
      }

      query += ' ORDER BY f.folio DESC';

      const facturas = db.prepare(query).all(...params);

      // Estadísticas por estado
      const estadisticas = db.prepare(`
        SELECT
          estado,
          COUNT(*) as cantidad,
          SUM(total) as total
        FROM facturas
        WHERE fecha >= ? AND fecha <= ?
        GROUP BY estado
      `).all(rango.fechaInicio, rango.fechaFin);

      return {
        success: true,
        data: {
          periodo: {
            inicio: rango.fechaInicio,
            fin: rango.fechaFin
          },
          facturas,
          estadisticas
        }
      };
    } catch (error) {
      safeError('Error generating facturas report:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Reporte de clientes
  ipcMain.handle('reportes:clientes', async (event, { periodo, fechaInicio, fechaFin }) => {
    try {
      const db = getDatabase();
      const rango = periodo === 'personalizado'
        ? { fechaInicio, fechaFin }
        : calcularRangoPeriodo(periodo);

      // Clientes con sus compras
      const clientes = db.prepare(`
        SELECT
          c.id,
          c.rut,
          c.razon_social,
          c.email,
          c.telefono,
          COUNT(f.id) as total_facturas,
          COALESCE(SUM(f.total), 0) as total_comprado,
          MAX(f.fecha) as ultima_compra
        FROM clientes c
        LEFT JOIN facturas f ON c.id = f.cliente_id
          AND f.fecha >= ? AND f.fecha <= ?
          AND f.estado != 'anulada'
        GROUP BY c.id
        HAVING total_facturas > 0
        ORDER BY total_comprado DESC
      `).all(rango.fechaInicio, rango.fechaFin);

      // Top 10 clientes
      const topClientes = clientes.slice(0, 10);

      // Estadísticas generales
      const stats = {
        totalClientes: clientes.length,
        totalFacturado: clientes.reduce((sum, c) => sum + c.total_comprado, 0),
        promedioCompra: clientes.length > 0
          ? clientes.reduce((sum, c) => sum + c.total_comprado, 0) / clientes.length
          : 0
      };

      return {
        success: true,
        data: {
          periodo: {
            inicio: rango.fechaInicio,
            fin: rango.fechaFin
          },
          clientes,
          topClientes,
          estadisticas: stats
        }
      };
    } catch (error) {
      safeError('Error generating clientes report:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Reporte de productos
  ipcMain.handle('reportes:productos', async (event, { periodo, fechaInicio, fechaFin }) => {
    try {
      const db = getDatabase();
      const rango = periodo === 'personalizado'
        ? { fechaInicio, fechaFin }
        : calcularRangoPeriodo(periodo);

      // Productos vendidos
      const productosVendidos = db.prepare(`
        SELECT
          p.id,
          p.codigo,
          p.nombre,
          p.precio,
          p.stock,
          COUNT(fi.id) as veces_vendido,
          SUM(fi.cantidad) as cantidad_vendida,
          SUM(fi.monto_item) as total_vendido
        FROM productos p
        LEFT JOIN factura_items fi ON p.id = fi.producto_id
        LEFT JOIN facturas f ON fi.factura_id = f.id
          AND f.fecha >= ? AND f.fecha <= ?
          AND f.estado != 'anulada'
        GROUP BY p.id
        HAVING cantidad_vendida > 0
        ORDER BY cantidad_vendida DESC
      `).all(rango.fechaInicio, rango.fechaFin);

      // Top 10 productos más vendidos
      const topProductos = productosVendidos.slice(0, 10);

      // Productos con bajo stock
      const stockBajo = db.prepare(`
        SELECT *
        FROM productos
        WHERE stock < 10
        ORDER BY stock ASC
      `).all();

      // Estadísticas
      const stats = {
        totalProductosVendidos: productosVendidos.length,
        cantidadTotalVendida: productosVendidos.reduce((sum, p) => sum + p.cantidad_vendida, 0),
        ingresosTotales: productosVendidos.reduce((sum, p) => sum + p.total_vendido, 0),
        productosStockBajo: stockBajo.length
      };

      return {
        success: true,
        data: {
          periodo: {
            inicio: rango.fechaInicio,
            fin: rango.fechaFin
          },
          productos: productosVendidos,
          topProductos,
          stockBajo,
          estadisticas: stats
        }
      };
    } catch (error) {
      safeError('Error generating productos report:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Reporte de pagos y cobranzas
  ipcMain.handle('reportes:pagosCobranzas', async (event, { periodo, fechaInicio, fechaFin }) => {
    try {
      const db = getDatabase();
      const rango = periodo === 'personalizado'
        ? { fechaInicio, fechaFin }
        : calcularRangoPeriodo(periodo);

      // Facturas pendientes de pago
      const facturasPendientes = db.prepare(`
        SELECT
          f.*,
          c.razon_social as cliente_nombre,
          c.rut as cliente_rut,
          c.telefono as cliente_telefono,
          c.email as cliente_email
        FROM facturas f
        JOIN clientes c ON f.cliente_id = c.id
        WHERE f.estado = 'pendiente'
        AND f.fecha >= ? AND f.fecha <= ?
        ORDER BY f.fecha_vencimiento ASC
      `).all(rango.fechaInicio, rango.fechaFin);

      // Facturas pagadas
      const facturasPagadas = db.prepare(`
        SELECT
          f.*,
          c.razon_social as cliente_nombre
        FROM facturas f
        JOIN clientes c ON f.cliente_id = c.id
        WHERE f.estado = 'pagada'
        AND f.fecha >= ? AND f.fecha <= ?
        ORDER BY f.fecha DESC
      `).all(rango.fechaInicio, rango.fechaFin);

      // Facturas vencidas
      const hoy = new Date().toISOString().split('T')[0];
      const facturasVencidas = db.prepare(`
        SELECT
          f.*,
          c.razon_social as cliente_nombre,
          c.rut as cliente_rut
        FROM facturas f
        JOIN clientes c ON f.cliente_id = c.id
        WHERE f.estado = 'pendiente'
        AND f.fecha_vencimiento < ?
        AND f.fecha >= ? AND f.fecha <= ?
        ORDER BY f.fecha_vencimiento ASC
      `).all(hoy, rango.fechaInicio, rango.fechaFin);

      // Estadísticas
      const stats = {
        totalPendiente: facturasPendientes.reduce((sum, f) => sum + f.total, 0),
        totalPagado: facturasPagadas.reduce((sum, f) => sum + f.total, 0),
        totalVencido: facturasVencidas.reduce((sum, f) => sum + f.total, 0),
        cantidadPendientes: facturasPendientes.length,
        cantidadPagadas: facturasPagadas.length,
        cantidadVencidas: facturasVencidas.length
      };

      return {
        success: true,
        data: {
          periodo: {
            inicio: rango.fechaInicio,
            fin: rango.fechaFin
          },
          facturasPendientes,
          facturasPagadas,
          facturasVencidas,
          estadisticas: stats
        }
      };
    } catch (error) {
      safeError('Error generating pagos report:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Reporte tributario (resumen para declaración de impuestos)
  ipcMain.handle('reportes:resumenTributario', async (event, { periodo, fechaInicio, fechaFin }) => {
    try {
      const db = getDatabase();
      const rango = periodo === 'personalizado'
        ? { fechaInicio, fechaFin }
        : calcularRangoPeriodo(periodo);

      // Resumen tributario
      const resumen = db.prepare(`
        SELECT
          tipo_documento,
          COUNT(*) as cantidad_documentos,
          SUM(subtotal) as total_neto,
          SUM(iva) as total_iva,
          SUM(total) as total_bruto,
          SUM(monto_exento) as total_exento
        FROM facturas
        WHERE fecha >= ? AND fecha <= ?
        AND estado != 'anulada'
        GROUP BY tipo_documento
      `).all(rango.fechaInicio, rango.fechaFin);

      // Ventas por mes (para gráfico)
      const ventasPorMes = db.prepare(`
        SELECT
          strftime('%Y-%m', fecha) as mes,
          COUNT(*) as cantidad,
          SUM(subtotal) as neto,
          SUM(iva) as iva,
          SUM(total) as total
        FROM facturas
        WHERE fecha >= ? AND fecha <= ?
        AND estado != 'anulada'
        GROUP BY strftime('%Y-%m', fecha)
        ORDER BY mes
      `).all(rango.fechaInicio, rango.fechaFin);

      // Totales generales
      const totales = {
        totalDocumentos: resumen.reduce((sum, r) => sum + r.cantidad_documentos, 0),
        totalNeto: resumen.reduce((sum, r) => sum + r.total_neto, 0),
        totalIVA: resumen.reduce((sum, r) => sum + r.total_iva, 0),
        totalBruto: resumen.reduce((sum, r) => sum + r.total_bruto, 0),
        totalExento: resumen.reduce((sum, r) => sum + r.total_exento, 0)
      };

      return {
        success: true,
        data: {
          periodo: {
            inicio: rango.fechaInicio,
            fin: rango.fechaFin
          },
          resumen,
          ventasPorMes,
          totales
        }
      };
    } catch (error) {
      safeError('Error generating resumen tributario:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Obtener datos para gráfico de ventas por mes
  ipcMain.handle('reportes:ventasPorMes', async (event, anio) => {
    try {
      const db = getDatabase();
      const anioActual = anio || new Date().getFullYear();

      const ventasPorMes = db.prepare(`
        SELECT
          CAST(strftime('%m', fecha) AS INTEGER) as mes,
          COUNT(*) as cantidad,
          COALESCE(SUM(total), 0) as total
        FROM facturas
        WHERE strftime('%Y', fecha) = ?
        AND estado != 'anulada'
        GROUP BY mes
        ORDER BY mes
      `).all(anioActual.toString());

      // Llenar meses sin ventas con 0
      const mesesCompletos = [];
      for (let i = 1; i <= 12; i++) {
        const mesData = ventasPorMes.find(v => v.mes === i);
        mesesCompletos.push({
          mes: i,
          cantidad: mesData ? mesData.cantidad : 0,
          total: mesData ? mesData.total : 0
        });
      }

      return {
        success: true,
        data: mesesCompletos
      };
    } catch (error) {
      safeError('Error getting ventas por mes:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  safeLog('Reportes IPC handlers registered');
}

// Función auxiliar para calcular rangos de fechas
function calcularRangoPeriodo(periodo) {
  const hoy = new Date();
  let fechaInicio, fechaFin;

  switch (periodo) {
    case 'hoy':
      fechaInicio = fechaFin = hoy.toISOString().split('T')[0];
      break;

    case 'semana':
      const inicioSemana = new Date(hoy);
      inicioSemana.setDate(hoy.getDate() - hoy.getDay());
      fechaInicio = inicioSemana.toISOString().split('T')[0];
      fechaFin = hoy.toISOString().split('T')[0];
      break;

    case 'mes':
      fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
      fechaFin = hoy.toISOString().split('T')[0];
      break;

    case 'trimestre':
      const mesActual = hoy.getMonth();
      const inicioTrimestre = new Date(hoy.getFullYear(), Math.floor(mesActual / 3) * 3, 1);
      fechaInicio = inicioTrimestre.toISOString().split('T')[0];
      fechaFin = hoy.toISOString().split('T')[0];
      break;

    case 'anio':
      fechaInicio = new Date(hoy.getFullYear(), 0, 1).toISOString().split('T')[0];
      fechaFin = hoy.toISOString().split('T')[0];
      break;

    default:
      // Por defecto, mes actual
      fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
      fechaFin = hoy.toISOString().split('T')[0];
  }

  return { fechaInicio, fechaFin };
}
