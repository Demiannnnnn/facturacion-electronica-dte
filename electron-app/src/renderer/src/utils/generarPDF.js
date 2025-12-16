import jsPDF from 'jspdf';
import { formatearRut } from './validaciones';
import { numeroAPalabras } from './numeroAPalabras';

/**
 * Genera un PDF de factura electrónica chilena
 * @param {Object} factura - Datos de la factura
 * @param {Object} emisor - Datos del emisor (empresa)
 */
export async function generarPDFFactura(factura, emisor) {
  // Importar autoTable dinámicamente
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 15;

  let yPos = margin;

  // ==================== ENCABEZADO ====================

  // Rectángulo del encabezado
  doc.setFillColor(0, 123, 255);
  doc.rect(0, 0, pageWidth, 40, 'F');

  // Título
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('FACTURA ELECTRÓNICA', pageWidth / 2, yPos + 10, { align: 'center' });

  // Folio
  doc.setFontSize(16);
  doc.text(`N° ${factura.folio}`, pageWidth / 2, yPos + 20, { align: 'center' });

  yPos = 50;

  // ==================== DATOS DEL EMISOR ====================
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('EMISOR', margin, yPos);

  yPos += 7;
  doc.setFontSize(10);
  doc.text(emisor?.razon_social || 'Sin configurar', margin, yPos);

  yPos += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`RUT: ${formatearRut(emisor?.rut || '')}`, margin, yPos);

  yPos += 5;
  doc.text(`Giro: ${emisor?.giro || ''}`, margin, yPos);

  yPos += 5;
  doc.text(`Dirección: ${emisor?.direccion || ''}`, margin, yPos);

  yPos += 5;
  doc.text(`${emisor?.comuna || ''}, ${emisor?.ciudad || ''}`, margin, yPos);

  if (emisor?.telefono) {
    yPos += 5;
    doc.text(`Tel: ${emisor.telefono}`, margin, yPos);
  }

  if (emisor?.email) {
    yPos += 5;
    doc.text(`Email: ${emisor.email}`, margin, yPos);
  }

  // ==================== DATOS DEL RECEPTOR ====================
  yPos += 12;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('RECEPTOR', margin, yPos);

  yPos += 7;
  doc.setFontSize(10);
  doc.text(factura.cliente_razon_social || '', margin, yPos);

  yPos += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`RUT: ${formatearRut(factura.cliente_rut)}`, margin, yPos);

  if (factura.cliente_giro) {
    yPos += 5;
    doc.text(`Giro: ${factura.cliente_giro}`, margin, yPos);
  }

  if (factura.cliente_direccion) {
    yPos += 5;
    doc.text(`Dirección: ${factura.cliente_direccion}`, margin, yPos);
  }

  // ==================== FECHA Y FORMA DE PAGO ====================
  const infoYPos = 50;
  const infoX = pageWidth - margin - 60;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Fecha:', infoX, infoYPos);
  doc.setFont('helvetica', 'normal');
  doc.text(formatearFecha(factura.fecha), infoX + 20, infoYPos);

  doc.setFont('helvetica', 'bold');
  doc.text('Forma de Pago:', infoX, infoYPos + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(factura.forma_pago === 'contado' ? 'Contado' : 'Crédito', infoX + 25, infoYPos + 5);

  let detailYOffset = 10;

  if (factura.forma_pago_detalle) {
    const formaPagoDetalle = {
      'efectivo': 'Efectivo',
      'transferencia': 'Transferencia',
      'cheque': 'Cheque',
      'tarjeta_debito': 'T. Débito',
      'tarjeta_credito': 'T. Crédito'
    };
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`(${formaPagoDetalle[factura.forma_pago_detalle] || factura.forma_pago_detalle})`, infoX, infoYPos + 9);
    doc.setFontSize(9);
    detailYOffset += 5;
  }

  if (factura.forma_pago === 'credito' && factura.fecha_vencimiento) {
    doc.setFont('helvetica', 'bold');
    doc.text('Vencimiento:', infoX, infoYPos + detailYOffset);
    doc.setFont('helvetica', 'normal');
    doc.text(formatearFecha(factura.fecha_vencimiento), infoX + 25, infoYPos + detailYOffset);
    detailYOffset += 5;
  }

  if (factura.orden_compra) {
    doc.setFont('helvetica', 'bold');
    doc.text('O/C:', infoX, infoYPos + detailYOffset);
    doc.setFont('helvetica', 'normal');
    doc.text(factura.orden_compra, infoX + 12, infoYPos + detailYOffset);
  }

  yPos += 15;

  // ==================== DETALLE DE ITEMS ====================
  const tableData = factura.items.map((item, index) => [
    index + 1,
    item.descripcion,
    `${item.cantidad} ${item.unidad}`,
    formatearMoneda(item.precio_unitario),
    `${item.descuento}%`,
    formatearMoneda(item.monto_item)
  ]);

  // Usar autoTable como función, no como método
  autoTable(doc, {
    startY: yPos,
    head: [['#', 'Descripción', 'Cantidad', 'P. Unitario', 'Desc.', 'Total']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [0, 123, 255],
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [0, 0, 0]
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 80 },
      2: { cellWidth: 25, halign: 'center' },
      3: { cellWidth: 25, halign: 'right' },
      4: { cellWidth: 15, halign: 'center' },
      5: { cellWidth: 30, halign: 'right' }
    },
    margin: { left: margin, right: margin }
  });

  yPos = doc.lastAutoTable.finalY + 10;

  // ==================== OBSERVACIONES ====================
  if (factura.observaciones) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Observaciones:', margin, yPos);
    yPos += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    const obsLines = doc.splitTextToSize(factura.observaciones, pageWidth - 2 * margin - 80);
    doc.text(obsLines, margin, yPos);
    yPos += obsLines.length * 5 + 5;
  }

  // ==================== TOTALES ====================
  const totalesX = pageWidth - margin - 65;
  yPos = Math.max(yPos, pageHeight - 80);

  // Cuadro de totales
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.rect(totalesX - 5, yPos - 5, 70, 40);

  // Subtotal
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Neto:', totalesX, yPos);
  doc.text(formatearMoneda(factura.subtotal), pageWidth - margin, yPos, { align: 'right' });

  yPos += 7;

  // IVA
  doc.text('IVA (19%):', totalesX, yPos);
  doc.text(formatearMoneda(factura.iva), pageWidth - margin, yPos, { align: 'right' });

  yPos += 2;
  doc.line(totalesX, yPos, pageWidth - margin, yPos);
  yPos += 7;

  // Total
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(0, 123, 255);
  doc.text('TOTAL:', totalesX, yPos);
  doc.text(formatearMoneda(factura.total), pageWidth - margin, yPos, { align: 'right' });

  // ==================== MONTO EN PALABRAS ====================
  yPos += 12;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('SON: ', margin, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(numeroAPalabras(factura.total), margin + 12, yPos);

  // ==================== PIE DE PÁGINA ====================
  yPos = pageHeight - 20;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.text('TIMBRE ELECTRÓNICO SII - (Documento electrónico pendiente de certificación)', pageWidth / 2, yPos, { align: 'center' });

  yPos += 5;
  doc.setFontSize(7);
  doc.text(`Documento generado el ${new Date().toLocaleString('es-CL')}`, pageWidth / 2, yPos, { align: 'center' });

  // Retornar el PDF
  return doc;
}

/**
 * Guarda el PDF en disco y retorna la ruta
 * @param {jsPDF} doc - Documento PDF
 * @param {number} folio - Número de folio de la factura
 * @returns {Promise<string>} Ruta relativa al PDF guardado
 */
export async function guardarPDFEnDisco(doc, folio) {
  try {
    // Generar nombre de archivo
    const fileName = `factura-${folio}.pdf`;

    // Obtener el blob del PDF
    const pdfBlob = doc.output('blob');

    // Convertir blob a array buffer
    const arrayBuffer = await pdfBlob.arrayBuffer();

    // Convertir ArrayBuffer a Array (sin usar Buffer que no existe en el navegador)
    const uint8Array = new Uint8Array(arrayBuffer);
    const byteArray = Array.from(uint8Array);

    // Solicitar al proceso principal que guarde el archivo
    const result = await window.api.facturas.savePDF({
      fileName: fileName,
      buffer: byteArray
    });

    if (result.success) {
      return result.path;
    } else {
      throw new Error(result.error || 'Error al guardar PDF');
    }
  } catch (error) {
    console.error('Error al guardar PDF en disco:', error);
    throw error;
  }
}

/**
 * Abre el PDF guardado en disco
 * @param {string} pdfPath - Ruta al archivo PDF
 */
export async function abrirPDFGuardado(pdfPath) {
  try {
    const result = await window.api.facturas.openPDF(pdfPath);
    if (!result.success) {
      throw new Error(result.error || 'Error al abrir PDF');
    }
  } catch (error) {
    console.error('Error al abrir PDF:', error);
    alert('Error al abrir el PDF. El archivo puede no existir.');
  }
}

/**
 * Abre el PDF en una nueva ventana (versión anterior - mantener para compatibilidad)
 */
export function abrirPDF(doc) {
  try {
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
  } catch (error) {
    console.error('Error al abrir PDF:', error);
    alert('Error al abrir el PDF. Por favor intente nuevamente.');
  }
}

/**
 * Descarga el PDF
 */
export function descargarPDF(doc, nombreArchivo) {
  try {
    doc.save(nombreArchivo);
  } catch (error) {
    console.error('Error al descargar PDF:', error);
    alert('Error al descargar el PDF. Por favor intente nuevamente.');
  }
}

/**
 * Formatea una fecha ISO a formato chileno
 */
function formatearFecha(fechaISO) {
  if (!fechaISO) return '';

  try {
    const fecha = new Date(fechaISO + 'T00:00:00');
    return fecha.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return fechaISO;
  }
}

/**
 * Formatea un número a moneda chilena
 */
function formatearMoneda(valor) {
  if (!valor && valor !== 0) return '$0';

  try {
    const numero = parseFloat(valor);
    return '$' + numero.toLocaleString('es-CL', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  } catch (error) {
    console.error('Error al formatear moneda:', error);
    return '$0';
  }
}
