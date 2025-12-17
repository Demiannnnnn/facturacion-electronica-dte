import jsPDF from 'jspdf';
import { formatearRut } from './validaciones';

/**
 * Genera un PDF de guía de despacho
 * @param {Object} guia - Datos de la guía de despacho
 * @param {Object} emisor - Datos del emisor (empresa)
 */
export async function generarPDFGuia(guia, emisor) {
    // Importar autoTable dinámicamente
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15;

    let yPos = margin;

    // ==================== ENCABEZADO ====================

    // Rectángulo del encabezado
    doc.setFillColor(40, 167, 69); // Verde para guías
    doc.rect(0, 0, pageWidth, 40, 'F');

    // Título
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('GUÍA DE DESPACHO ELECTRÓNICA', pageWidth / 2, yPos + 10, { align: 'center' });

    // Folio
    doc.setFontSize(16);
    doc.text(`N° ${guia.folio}`, pageWidth / 2, yPos + 20, { align: 'center' });

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
    doc.text(guia.cliente_razon_social || '', margin, yPos);

    yPos += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`RUT: ${formatearRut(guia.cliente_rut)}`, margin, yPos);

    if (guia.cliente_giro) {
        yPos += 5;
        doc.text(`Giro: ${guia.cliente_giro}`, margin, yPos);
    }

    if (guia.cliente_direccion) {
        yPos += 5;
        doc.text(`Dirección: ${guia.cliente_direccion}`, margin, yPos);
    }

    // ==================== DATOS DE TRANSPORTE ====================
    yPos += 12;
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPos - 3, pageWidth - 2 * margin, 35, 'F');

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 167, 69);
    doc.text('DATOS DE TRANSPORTE', margin + 3, yPos + 2);

    yPos += 8;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Dirección de Despacho:', margin + 3, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(guia.direccion_despacho || '', margin + 45, yPos);

    yPos += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Fecha de Traslado:', margin + 3, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(guia.fecha_despacho ? formatearFecha(guia.fecha_despacho) : 'No especificada', margin + 40, yPos);

    if (guia.transportista) {
        yPos += 5;
        doc.setFont('helvetica', 'bold');
        doc.text('Transportista:', margin + 3, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(guia.transportista, margin + 30, yPos);
    }

    if (guia.patente) {
        yPos += 5;
        doc.setFont('helvetica', 'bold');
        doc.text('Patente:', margin + 3, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(guia.patente, margin + 20, yPos);
    }

    // ==================== FECHA Y REFERENCIA ====================
    const infoYPos = 50;
    const infoX = pageWidth - margin - 60;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Fecha Emisión:', infoX, infoYPos);
    doc.setFont('helvetica', 'normal');
    doc.text(formatearFecha(guia.fecha), infoX + 30, infoYPos);

    if (guia.factura_id) {
        doc.setFont('helvetica', 'bold');
        doc.text('Ref. Factura:', infoX, infoYPos + 5);
        doc.setFont('helvetica', 'normal');
        doc.text(`#${guia.factura_id}`, infoX + 25, infoYPos + 5);
    }

    yPos += 15;

    // ==================== DETALLE DE ITEMS ====================
    const tableData = guia.items.map((item, index) => [
        index + 1,
        item.producto_codigo || '-',
        item.descripcion,
        `${item.cantidad} ${item.unidad || 'UN'}`
    ]);

    // Usar autoTable como función
    autoTable(doc, {
        startY: yPos,
        head: [['#', 'Código', 'Descripción', 'Cantidad']],
        body: tableData,
        theme: 'striped',
        headStyles: {
            fillColor: [40, 167, 69],
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
            1: { cellWidth: 25, halign: 'center' },
            2: { cellWidth: 110 },
            3: { cellWidth: 30, halign: 'center' }
        },
        margin: { left: margin, right: margin }
    });

    yPos = doc.lastAutoTable.finalY + 10;

    // ==================== OBSERVACIONES ====================
    if (guia.observaciones) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Observaciones:', margin, yPos);
        yPos += 5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);

        const obsLines = doc.splitTextToSize(guia.observaciones, pageWidth - 2 * margin);
        doc.text(obsLines, margin, yPos);
        yPos += obsLines.length * 5 + 10;
    }

    // ==================== NOTA IMPORTANTE ====================
    yPos = Math.max(yPos, pageHeight - 60);

    doc.setFillColor(255, 243, 205);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 25, 'F');
    doc.setDrawColor(255, 193, 7);
    doc.setLineWidth(1);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 25);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(133, 100, 4);
    doc.text('IMPORTANTE:', margin + 3, yPos + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Esta guía de despacho ampara el traslado de mercaderías.', margin + 3, yPos + 12);
    doc.text('No constituye documento tributario de venta.', margin + 3, yPos + 18);

    // ==================== PIE DE PÁGINA ====================
    yPos = pageHeight - 20;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text('GUÍA DE DESPACHO ELECTRÓNICA - Documento Tributario Electrónico', pageWidth / 2, yPos, { align: 'center' });

    yPos += 5;
    doc.setFontSize(7);
    doc.text(`Documento generado el ${new Date().toLocaleString('es-CL')}`, pageWidth / 2, yPos, { align: 'center' });

    // Retornar el PDF
    return doc;
}

/**
 * Guarda el PDF de guía en disco y retorna la ruta
 * @param {jsPDF} doc - Documento PDF
 * @param {number} folio - Número de folio de la guía
 * @returns {Promise<string>} Ruta relativa al PDF guardado
 */
export async function guardarPDFGuiaEnDisco(doc, folio) {
    try {
        // Generar nombre de archivo
        const fileName = `guia-despacho-${folio}.pdf`;

        // Obtener el blob del PDF
        const pdfBlob = doc.output('blob');

        // Convertir blob a array buffer
        const arrayBuffer = await pdfBlob.arrayBuffer();

        // Convertir ArrayBuffer a Array
        const uint8Array = new Uint8Array(arrayBuffer);
        const byteArray = Array.from(uint8Array);

        // Solicitar al proceso principal que guarde el archivo
        const result = await window.api.guias.savePDF({
            fileName: fileName,
            buffer: byteArray,
            folio: folio
        });

        if (result.success) {
            return result.path;
        } else {
            throw new Error(result.error || 'Error al guardar PDF');
        }
    } catch (error) {
        console.error('Error al guardar PDF de guía en disco:', error);
        throw error;
    }
}

/**
 * Abre el PDF de guía guardado en disco
 * @param {string} pdfPath - Ruta al archivo PDF
 */
export async function abrirPDFGuiaGuardado(pdfPath) {
    try {
        const result = await window.api.guias.openPDF(pdfPath);
        if (!result.success) {
            throw new Error(result.error || 'Error al abrir PDF');
        }
    } catch (error) {
        console.error('Error al abrir PDF de guía:', error);
        alert('Error al abrir el PDF. El archivo puede no existir.');
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
