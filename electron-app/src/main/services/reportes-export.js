import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { app } from 'electron';

/**
 * Exporta datos a Excel
 */
export async function exportarExcel(datos, nombreArchivo, opciones = {}) {
  try {
    const { hojas = [] } = opciones;

    // Crear un nuevo workbook
    const wb = XLSX.utils.book_new();

    if (hojas.length > 0) {
      // Múltiples hojas
      hojas.forEach(hoja => {
        const ws = XLSX.utils.json_to_sheet(hoja.datos);
        XLSX.utils.book_append_sheet(wb, ws, hoja.nombre);
      });
    } else {
      // Una sola hoja con los datos
      const ws = XLSX.utils.json_to_sheet(datos);
      XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
    }

    // Obtener directorio para guardar
    const projectRoot = app.getAppPath().includes('app.asar')
      ? path.join(process.resourcesPath, '..')
      : path.join(app.getAppPath(), '../..');

    const excelDir = path.join(projectRoot, 'Reportes', 'Excel');

    // Crear directorio si no existe
    if (!fs.existsSync(excelDir)) {
      fs.mkdirSync(excelDir, { recursive: true });
    }

    // Generar nombre de archivo único
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const fileName = `${nombreArchivo}_${timestamp}.xlsx`;
    const filePath = path.join(excelDir, fileName);

    // Escribir archivo
    XLSX.writeFile(wb, filePath);

    return {
      success: true,
      path: filePath,
      fileName
    };
  } catch (error) {
    console.error('Error exportando Excel:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Genera un reporte simple en formato de texto
 * Para usar con jsPDF (se implementará en el renderer)
 */
export function generarDatosReportePDF(tipo, datos, opciones = {}) {
  const { periodo } = opciones;
  const fecha = new Date().toLocaleDateString('es-CL');

  let contenido = {
    titulo: '',
    subtitulo: `Generado: ${fecha}`,
    periodo: periodo ? `Período: ${periodo.inicio} - ${periodo.fin}` : '',
    secciones: []
  };

  switch (tipo) {
    case 'ventas':
      contenido.titulo = 'Reporte de Ventas';
      contenido.secciones = [
        {
          titulo: 'Resumen',
          datos: [
            ['Total Facturas', datos.resumen.total_facturas],
            ['Total Neto', formatCurrency(datos.resumen.total_neto)],
            ['Total IVA', formatCurrency(datos.resumen.total_iva)],
            ['Total Bruto', formatCurrency(datos.resumen.total_ventas)]
          ]
        },
        {
          titulo: 'Ventas por Forma de Pago',
          tabla: {
            headers: ['Forma de Pago', 'Cantidad', 'Total'],
            rows: datos.ventasPorFormaPago.map(v => [
              v.forma_pago,
              v.cantidad,
              formatCurrency(v.total)
            ])
          }
        }
      ];
      break;

    case 'facturas':
      contenido.titulo = 'Reporte de Facturas Emitidas';
      contenido.secciones = [
        {
          titulo: 'Estadísticas',
          datos: datos.estadisticas.map(e => [
            e.estado.toUpperCase(),
            `${e.cantidad} facturas - ${formatCurrency(e.total)}`
          ])
        }
      ];
      break;

    case 'clientes':
      contenido.titulo = 'Reporte de Clientes';
      contenido.secciones = [
        {
          titulo: 'Resumen',
          datos: [
            ['Total Clientes', datos.estadisticas.totalClientes],
            ['Total Facturado', formatCurrency(datos.estadisticas.totalFacturado)],
            ['Promedio por Cliente', formatCurrency(datos.estadisticas.promedioCompra)]
          ]
        },
        {
          titulo: 'Top 10 Clientes',
          tabla: {
            headers: ['RUT', 'Razón Social', 'Facturas', 'Total Comprado'],
            rows: datos.topClientes.map(c => [
              c.rut,
              c.razon_social,
              c.total_facturas,
              formatCurrency(c.total_comprado)
            ])
          }
        }
      ];
      break;

    case 'productos':
      contenido.titulo = 'Reporte de Productos';
      contenido.secciones = [
        {
          titulo: 'Resumen',
          datos: [
            ['Productos Vendidos', datos.estadisticas.totalProductosVendidos],
            ['Cantidad Total Vendida', datos.estadisticas.cantidadTotalVendida],
            ['Ingresos Totales', formatCurrency(datos.estadisticas.ingresosTotales)],
            ['Productos Stock Bajo', datos.estadisticas.productosStockBajo]
          ]
        },
        {
          titulo: 'Top 10 Productos Más Vendidos',
          tabla: {
            headers: ['Código', 'Nombre', 'Cantidad Vendida', 'Total'],
            rows: datos.topProductos.map(p => [
              p.codigo || 'N/A',
              p.nombre,
              p.cantidad_vendida,
              formatCurrency(p.total_vendido)
            ])
          }
        }
      ];
      break;

    case 'pagos':
      contenido.titulo = 'Reporte de Pagos y Cobranzas';
      contenido.secciones = [
        {
          titulo: 'Resumen',
          datos: [
            ['Facturas Pendientes', `${datos.estadisticas.cantidadPendientes} - ${formatCurrency(datos.estadisticas.totalPendiente)}`],
            ['Facturas Pagadas', `${datos.estadisticas.cantidadPagadas} - ${formatCurrency(datos.estadisticas.totalPagado)}`],
            ['Facturas Vencidas', `${datos.estadisticas.cantidadVencidas} - ${formatCurrency(datos.estadisticas.totalVencido)}`]
          ]
        }
      ];
      break;

    case 'tributario':
      contenido.titulo = 'Resumen Tributario';
      contenido.secciones = [
        {
          titulo: 'Totales',
          datos: [
            ['Total Documentos', datos.totales.totalDocumentos],
            ['Total Neto', formatCurrency(datos.totales.totalNeto)],
            ['Total IVA', formatCurrency(datos.totales.totalIVA)],
            ['Total Bruto', formatCurrency(datos.totales.totalBruto)],
            ['Total Exento', formatCurrency(datos.totales.totalExento)]
          ]
        },
        {
          titulo: 'Por Tipo de Documento',
          tabla: {
            headers: ['Tipo', 'Cantidad', 'Neto', 'IVA', 'Total'],
            rows: datos.resumen.map(r => [
              r.tipo_documento === 33 ? 'Factura Electrónica' : `Tipo ${r.tipo_documento}`,
              r.cantidad_documentos,
              formatCurrency(r.total_neto),
              formatCurrency(r.total_iva),
              formatCurrency(r.total_bruto)
            ])
          }
        }
      ];
      break;

    default:
      contenido.titulo = 'Reporte';
  }

  return contenido;
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP'
  }).format(amount || 0);
}
