import { ipcMain, dialog, shell } from 'electron';
import fs from 'fs';
import path from 'path';
import { getDatabase } from '../../database/connection.js';

export function registerGuiasHandlers() {

    // Obtener próximo folio para guías de despacho (tipo 52)
    ipcMain.handle('guias:getNextFolio', async () => {
        try {
            const db = getDatabase();
            const folio = db.prepare(`
        SELECT actual FROM folios WHERE tipo_documento = 52
      `).get();

            if (!folio) {
                // Inicializar folios para guías si no existen
                db.prepare(`
          INSERT INTO folios (tipo_documento, desde, hasta, actual, created_at)
          VALUES (52, 1, 10000, 1, datetime('now'))
        `).run();
                return { success: true, folio: 1 };
            }

            return { success: true, folio: folio.actual };
        } catch (error) {
            console.error('Error getting next folio:', error);
            return { success: false, message: error.message };
        }
    });

    // Crear guía de despacho
    ipcMain.handle('guias:create', async (event, data) => {
        const db = getDatabase();
        const transaction = db.transaction(() => {
            try {
                // 1. Obtener y reservar folio
                const folioRow = db.prepare(`
          SELECT actual, hasta FROM folios WHERE tipo_documento = 52
        `).get();

                if (!folioRow) {
                    throw new Error('No hay folios disponibles para guías de despacho');
                }

                if (folioRow.actual > folioRow.hasta) {
                    throw new Error('Se agotaron los folios disponibles');
                }

                const folio = folioRow.actual;

                // 2. Incrementar folio
                db.prepare(`
          UPDATE folios SET actual = actual + 1 WHERE tipo_documento = 52
        `).run();

                // 3. Insertar guía
                const now = new Date().toISOString();
                const result = db.prepare(`
          INSERT INTO guias_despacho (
            folio, factura_id, cliente_id, fecha, direccion_despacho,
            fecha_despacho, transportista, patente, observaciones,
            estado, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'emitida', ?, ?)
        `).run(
                    folio,
                    data.factura_id || null,
                    data.cliente_id,
                    data.fecha || new Date().toISOString().split('T')[0],
                    data.direccion_despacho,
                    data.fecha_despacho || null,
                    data.transportista || null,
                    data.patente || null,
                    data.observaciones || null,
                    now,
                    now
                );

                const guiaId = result.lastInsertRowid;

                // 4. Insertar items
                const insertItem = db.prepare(`
          INSERT INTO guia_items (
            guia_id, numero_linea, producto_id, descripcion, cantidad, unidad
          ) VALUES (?, ?, ?, ?, ?, ?)
        `);

                data.items.forEach((item, index) => {
                    insertItem.run(
                        guiaId,
                        index + 1,
                        item.producto_id || null,
                        item.descripcion,
                        item.cantidad,
                        item.unidad || 'UN'
                    );
                });

                // 5. Obtener guía completa
                const guia = db.prepare(`
          SELECT g.*, c.razon_social as cliente_razon_social, c.rut as cliente_rut
          FROM guias_despacho g
          JOIN clientes c ON g.cliente_id = c.id
          WHERE g.id = ?
        `).get(guiaId);

                const items = db.prepare(`
          SELECT * FROM guia_items WHERE guia_id = ? ORDER BY numero_linea
        `).all(guiaId);

                return {
                    success: true,
                    data: { ...guia, items }
                };
            } catch (error) {
                throw error;
            }
        });

        try {
            const result = transaction();
            return result;
        } catch (error) {
            console.error('Error creating guia:', error);
            return { success: false, message: error.message };
        }
    });

    // Obtener todas las guías
    ipcMain.handle('guias:getAll', async () => {
        try {
            const db = getDatabase();
            const guias = db.prepare(`
        SELECT g.*, c.razon_social as cliente_razon_social, c.rut as cliente_rut
        FROM guias_despacho g
        JOIN clientes c ON g.cliente_id = c.id
        ORDER BY g.folio DESC
      `).all();

            return { success: true, data: guias };
        } catch (error) {
            console.error('Error getting guias:', error);
            return { success: false, message: error.message };
        }
    });

    // Obtener guía por ID
    ipcMain.handle('guias:getById', async (event, id) => {
        try {
            const db = getDatabase();
            const guia = db.prepare(`
        SELECT g.*, c.razon_social as cliente_razon_social, c.rut as cliente_rut,
               c.direccion as cliente_direccion, c.comuna as cliente_comuna,
               c.ciudad as cliente_ciudad, c.region as cliente_region
        FROM guias_despacho g
        JOIN clientes c ON g.cliente_id = c.id
        WHERE g.id = ?
      `).get(id);


            if (!guia) {
                return { success: false, message: 'Guía no encontrada' };
            }

            const items = db.prepare(`
        SELECT gi.*, p.codigo as producto_codigo
        FROM guia_items gi
        LEFT JOIN productos p ON gi.producto_id = p.id
        WHERE gi.guia_id = ?
        ORDER BY gi.numero_linea
      `).all(id);

            return {
                success: true,
                data: { ...guia, items }
            };
        } catch (error) {
            console.error('Error getting guia:', error);
            return { success: false, message: error.message };
        }
    });

    // Buscar guías
    ipcMain.handle('guias:search', async (event, filters) => {
        try {
            const db = getDatabase();
            let query = `
        SELECT g.*, c.razon_social as cliente_razon_social, c.rut as cliente_rut
        FROM guias_despacho g
        JOIN clientes c ON g.cliente_id = c.id
        WHERE 1=1
      `;
            const params = [];

            if (filters.folio) {
                query += ` AND g.folio = ?`;
                params.push(filters.folio);
            }

            if (filters.cliente_id) {
                query += ` AND g.cliente_id = ?`;
                params.push(filters.cliente_id);
            }

            if (filters.fecha_desde) {
                query += ` AND g.fecha >= ?`;
                params.push(filters.fecha_desde);
            }

            if (filters.fecha_hasta) {
                query += ` AND g.fecha <= ?`;
                params.push(filters.fecha_hasta);
            }

            if (filters.estado) {
                query += ` AND g.estado = ?`;
                params.push(filters.estado);
            }

            query += ` ORDER BY g.folio DESC`;

            const guias = db.prepare(query).all(...params);

            return { success: true, data: guias };
        } catch (error) {
            console.error('Error searching guias:', error);
            return { success: false, message: error.message };
        }
    });

    // Guardar PDF
    ipcMain.handle('guias:savePDF', async (event, data) => {
        try {
            const result = await dialog.showSaveDialog({
                title: 'Guardar Guía de Despacho',
                defaultPath: data.fileName || `Guia_${data.folio}.pdf`,
                filters: [
                    { name: 'PDF', extensions: ['pdf'] }
                ]
            });

            if (result.canceled) {
                return { success: false, message: 'Guardado cancelado' };
            }

            // Guardar PDF desde buffer
            const buffer = Buffer.from(data.buffer);
            fs.writeFileSync(result.filePath, buffer);

            // Actualizar ruta en BD si se proporciona guiaId
            if (data.guiaId) {
                const db = getDatabase();
                db.prepare(`
          UPDATE guias_despacho SET pdf_path = ?, updated_at = datetime('now')
          WHERE id = ?
        `).run(result.filePath, data.guiaId);
            }

            return {
                success: true,
                message: 'Guía guardada exitosamente',
                path: result.filePath
            };
        } catch (error) {
            console.error('Error saving PDF:', error);
            return { success: false, message: error.message };
        }
    });

    // Abrir PDF
    ipcMain.handle('guias:openPDF', async (event, pdfPath) => {

        try {
            await shell.openPath(pdfPath);
            return { success: true };
        } catch (error) {
            console.error('Error opening PDF:', error);
            return { success: false, message: error.message };
        }
    });

    console.log('Guias handlers registered');
}
