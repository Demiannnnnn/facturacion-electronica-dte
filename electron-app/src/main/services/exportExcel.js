import XLSX from 'xlsx';
import { app, dialog, shell } from 'electron';
import path from 'path';
import fs from 'fs';

/**
 * Servicio de exportación a Excel
 * Genera archivos Excel (.xlsx) con datos de la aplicación
 */

/**
 * Exporta clientes a Excel
 * @param {Array} clientes - Array de objetos cliente
 * @returns {Promise<string>} - Ruta del archivo generado
 */
export async function exportarClientes(clientes) {
    try {
        // Formatear datos para Excel
        const datosExcel = clientes.map(cliente => ({
            'RUT': cliente.rut,
            'Razón Social': cliente.razon_social,
            'Giro': cliente.giro || '',
            'Dirección': cliente.direccion || '',
            'Región': cliente.region || '',
            'Comuna': cliente.comuna || '',
            'Ciudad': cliente.ciudad || '',
            'Teléfono': cliente.telefono || '',
            'Email': cliente.email || '',
            'Fecha Creación': formatearFecha(cliente.created_at)
        }));

        // Crear libro de trabajo
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(datosExcel);

        // Ajustar anchos de columna
        ws['!cols'] = [
            { wch: 15 }, // RUT
            { wch: 30 }, // Razón Social
            { wch: 25 }, // Giro
            { wch: 35 }, // Dirección
            { wch: 20 }, // Región
            { wch: 20 }, // Comuna
            { wch: 15 }, // Ciudad
            { wch: 15 }, // Teléfono
            { wch: 25 }, // Email
            { wch: 18 }  // Fecha Creación
        ];

        XLSX.utils.book_append_sheet(wb, ws, 'Clientes');

        // Generar nombre de archivo con fecha
        const fecha = new Date().toISOString().split('T')[0];
        const nombreArchivo = `Clientes_${fecha}.xlsx`;

        // Mostrar diálogo para guardar
        const { filePath, canceled } = await dialog.showSaveDialog({
            title: 'Exportar Clientes a Excel',
            defaultPath: path.join(app.getPath('documents'), nombreArchivo),
            filters: [
                { name: 'Excel', extensions: ['xlsx'] }
            ]
        });

        if (canceled || !filePath) {
            return null;
        }

        // Escribir archivo
        XLSX.writeFile(wb, filePath);

        return filePath;
    } catch (error) {
        console.error('Error al exportar clientes:', error);
        throw error;
    }
}

/**
 * Exporta productos a Excel
 * @param {Array} productos - Array de objetos producto
 * @returns {Promise<string>} - Ruta del archivo generado
 */
export async function exportarProductos(productos) {
    try {
        // Formatear datos para Excel
        const datosExcel = productos.map(producto => ({
            'Código': producto.codigo || '',
            'Nombre': producto.nombre,
            'Descripción': producto.descripcion || '',
            'Precio': producto.precio,
            'Stock': producto.stock,
            'Fecha Creación': formatearFecha(producto.created_at)
        }));

        // Crear libro de trabajo
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(datosExcel);

        // Ajustar anchos de columna
        ws['!cols'] = [
            { wch: 15 }, // Código
            { wch: 30 }, // Nombre
            { wch: 40 }, // Descripción
            { wch: 12 }, // Precio
            { wch: 10 }, // Stock
            { wch: 18 }  // Fecha Creación
        ];

        XLSX.utils.book_append_sheet(wb, ws, 'Productos');

        // Generar nombre de archivo con fecha
        const fecha = new Date().toISOString().split('T')[0];
        const nombreArchivo = `Productos_${fecha}.xlsx`;

        // Mostrar diálogo para guardar
        const { filePath, canceled } = await dialog.showSaveDialog({
            title: 'Exportar Productos a Excel',
            defaultPath: path.join(app.getPath('documents'), nombreArchivo),
            filters: [
                { name: 'Excel', extensions: ['xlsx'] }
            ]
        });

        if (canceled || !filePath) {
            return null;
        }

        // Escribir archivo
        XLSX.writeFile(wb, filePath);

        return filePath;
    } catch (error) {
        console.error('Error al exportar productos:', error);
        throw error;
    }
}

/**
 * Exporta facturas a Excel
 * @param {Array} facturas - Array de objetos factura con datos del cliente
 * @returns {Promise<string>} - Ruta del archivo generado
 */
export async function exportarFacturas(facturas) {
    try {
        // Formatear datos para Excel
        const datosExcel = facturas.map(factura => ({
            'Folio': factura.folio,
            'Tipo Documento': factura.tipo_documento || 33,
            'Cliente RUT': factura.cliente_rut,
            'Cliente': factura.cliente_razon_social,
            'Fecha Emisión': formatearFecha(factura.fecha),
            'Fecha Vencimiento': factura.fecha_vencimiento ? formatearFecha(factura.fecha_vencimiento) : '',
            'Forma Pago': factura.forma_pago || 'contado',
            'Subtotal': factura.subtotal,
            'IVA': factura.iva,
            'Total': factura.total,
            'Estado': factura.estado,
            'Observaciones': factura.observaciones || ''
        }));

        // Crear libro de trabajo
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(datosExcel);

        // Ajustar anchos de columna
        ws['!cols'] = [
            { wch: 10 }, // Folio
            { wch: 15 }, // Tipo Documento
            { wch: 15 }, // Cliente RUT
            { wch: 30 }, // Cliente
            { wch: 15 }, // Fecha Emisión
            { wch: 18 }, // Fecha Vencimiento
            { wch: 12 }, // Forma Pago
            { wch: 12 }, // Subtotal
            { wch: 12 }, // IVA
            { wch: 12 }, // Total
            { wch: 12 }, // Estado
            { wch: 30 }  // Observaciones
        ];

        XLSX.utils.book_append_sheet(wb, ws, 'Facturas');

        // Generar nombre de archivo con fecha
        const fecha = new Date().toISOString().split('T')[0];
        const nombreArchivo = `Facturas_${fecha}.xlsx`;

        // Mostrar diálogo para guardar
        const { filePath, canceled } = await dialog.showSaveDialog({
            title: 'Exportar Facturas a Excel',
            defaultPath: path.join(app.getPath('documents'), nombreArchivo),
            filters: [
                { name: 'Excel', extensions: ['xlsx'] }
            ]
        });

        if (canceled || !filePath) {
            return null;
        }

        // Escribir archivo
        XLSX.writeFile(wb, filePath);

        return filePath;
    } catch (error) {
        console.error('Error al exportar facturas:', error);
        throw error;
    }
}

/**
 * Formatea una fecha ISO a formato legible
 * @param {string} fechaISO - Fecha en formato ISO
 * @returns {string} - Fecha formateada (DD/MM/YYYY)
 */
function formatearFecha(fechaISO) {
    if (!fechaISO) return '';

    const fecha = new Date(fechaISO);
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();

    return `${dia}/${mes}/${anio}`;
}

/**
 * Abre el archivo en el explorador de archivos
 * @param {string} filePath - Ruta del archivo
 */
export async function abrirArchivo(filePath) {
    if (filePath && fs.existsSync(filePath)) {
        await shell.openPath(filePath);
    }
}
