import { ipcMain } from 'electron';
import { getDatabase } from '../database/connection.js';
import { exportarClientes, exportarProductos, exportarFacturas, abrirArchivo } from '../services/exportExcel.js';

/**
 * Registra los handlers IPC para exportación a Excel
 */
export function registerExportHandlers() {
    /**
     * Exporta todos los clientes a Excel
     */
    ipcMain.handle('export:clientes', async () => {
        try {
            const db = getDatabase();

            // Obtener todos los clientes
            const clientes = db.prepare('SELECT * FROM clientes ORDER BY razon_social').all();

            if (clientes.length === 0) {
                return {
                    success: false,
                    message: 'No hay clientes para exportar'
                };
            }

            // Exportar a Excel
            const filePath = await exportarClientes(clientes);

            if (!filePath) {
                return {
                    success: false,
                    message: 'Exportación cancelada'
                };
            }

            // Abrir archivo
            await abrirArchivo(filePath);

            return {
                success: true,
                message: `${clientes.length} clientes exportados exitosamente`,
                filePath
            };
        } catch (error) {
            console.error('Error al exportar clientes:', error);
            return {
                success: false,
                message: `Error al exportar: ${error.message}`
            };
        }
    });

    /**
     * Exporta todos los productos a Excel
     */
    ipcMain.handle('export:productos', async () => {
        try {
            const db = getDatabase();

            // Obtener todos los productos
            const productos = db.prepare('SELECT * FROM productos ORDER BY nombre').all();

            if (productos.length === 0) {
                return {
                    success: false,
                    message: 'No hay productos para exportar'
                };
            }

            // Exportar a Excel
            const filePath = await exportarProductos(productos);

            if (!filePath) {
                return {
                    success: false,
                    message: 'Exportación cancelada'
                };
            }

            // Abrir archivo
            await abrirArchivo(filePath);

            return {
                success: true,
                message: `${productos.length} productos exportados exitosamente`,
                filePath
            };
        } catch (error) {
            console.error('Error al exportar productos:', error);
            return {
                success: false,
                message: `Error al exportar: ${error.message}`
            };
        }
    });

    /**
     * Exporta todas las facturas a Excel
     */
    ipcMain.handle('export:facturas', async () => {
        try {
            const db = getDatabase();

            // Obtener todas las facturas con datos del cliente
            const facturas = db.prepare(`
        SELECT 
          f.*,
          c.rut as cliente_rut,
          c.razon_social as cliente_razon_social
        FROM facturas f
        INNER JOIN clientes c ON f.cliente_id = c.id
        ORDER BY f.folio DESC
      `).all();

            if (facturas.length === 0) {
                return {
                    success: false,
                    message: 'No hay facturas para exportar'
                };
            }

            // Exportar a Excel
            const filePath = await exportarFacturas(facturas);

            if (!filePath) {
                return {
                    success: false,
                    message: 'Exportación cancelada'
                };
            }

            // Abrir archivo
            await abrirArchivo(filePath);

            return {
                success: true,
                message: `${facturas.length} facturas exportadas exitosamente`,
                filePath
            };
        } catch (error) {
            console.error('Error al exportar facturas:', error);
            return {
                success: false,
                message: `Error al exportar: ${error.message}`
            };
        }
    });

    console.log('Export handlers registered');
}
