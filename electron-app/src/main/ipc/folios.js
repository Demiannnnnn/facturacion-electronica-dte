import { ipcMain } from 'electron';
import { getDatabase } from '../database/connection.js';

export function registerFoliosHandlers() {
    // Obtener todos los folios
    ipcMain.handle('folios:getAll', async () => {
        try {
            const db = getDatabase();

            const folios = db.prepare(`
        SELECT 
          id,
          tipo_documento,
          desde,
          hasta,
          actual,
          created_at,
          (hasta - actual + 1) as disponibles
        FROM folios
        ORDER BY tipo_documento
      `).all();

            // Agregar nombres descriptivos
            const foliosConNombres = folios.map(folio => ({
                ...folio,
                nombre: getTipoDocumentoNombre(folio.tipo_documento)
            }));

            return {
                success: true,
                data: foliosConNombres
            };
        } catch (error) {
            console.error('Error getting folios:', error);
            return {
                success: false,
                error: error.message
            };
        }
    });

    // Actualizar rango de folios
    ipcMain.handle('folios:update', async (event, { id, desde, hasta }) => {
        try {
            const db = getDatabase();

            // Obtener folio actual
            const folio = db.prepare('SELECT * FROM folios WHERE id = ?').get(id);

            if (!folio) {
                return {
                    success: false,
                    error: 'Folio no encontrado'
                };
            }

            // Validaciones
            if (desde < 1) {
                return {
                    success: false,
                    error: 'El folio inicial debe ser mayor a 0'
                };
            }

            if (hasta <= desde) {
                return {
                    success: false,
                    error: 'El folio final debe ser mayor al folio inicial'
                };
            }

            if (folio.actual < desde) {
                return {
                    success: false,
                    error: `El folio inicial no puede ser mayor al folio actual (${folio.actual})`
                };
            }

            if (folio.actual > hasta) {
                return {
                    success: false,
                    error: `El folio final no puede ser menor al folio actual (${folio.actual})`
                };
            }

            // Actualizar
            db.prepare(`
        UPDATE folios 
        SET desde = ?, hasta = ?
        WHERE id = ?
      `).run(desde, hasta, id);

            // Obtener folio actualizado
            const updatedFolio = db.prepare(`
        SELECT 
          id,
          tipo_documento,
          desde,
          hasta,
          actual,
          created_at,
          (hasta - actual + 1) as disponibles
        FROM folios
        WHERE id = ?
      `).get(id);

            return {
                success: true,
                data: {
                    ...updatedFolio,
                    nombre: getTipoDocumentoNombre(updatedFolio.tipo_documento)
                }
            };
        } catch (error) {
            console.error('Error updating folio:', error);
            return {
                success: false,
                error: error.message
            };
        }
    });

    // Obtener siguiente folio por tipo de documento
    ipcMain.handle('folios:getNext', async (event, tipoDocumento) => {
        try {
            const db = getDatabase();

            const folio = db.prepare(`
        SELECT * FROM folios WHERE tipo_documento = ?
      `).get(tipoDocumento);

            if (!folio) {
                return {
                    success: false,
                    error: `No hay folios configurados para el tipo de documento ${tipoDocumento}`
                };
            }

            if (folio.actual > folio.hasta) {
                return {
                    success: false,
                    error: `Se agotaron los folios para ${getTipoDocumentoNombre(tipoDocumento)}. Configure un nuevo rango.`
                };
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

    console.log('Folios IPC handlers registered');
}

// Helper function para obtener nombre del tipo de documento
function getTipoDocumentoNombre(tipo) {
    const tipos = {
        33: 'Factura Electrónica',
        52: 'Guía de Despacho',
        56: 'Nota de Débito',
        61: 'Nota de Crédito'
    };
    return tipos[tipo] || `Tipo ${tipo}`;
}
