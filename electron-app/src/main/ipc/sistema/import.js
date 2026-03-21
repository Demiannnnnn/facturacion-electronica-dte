import { ipcMain } from 'electron';
import { getDatabase } from '../../database/connection.js';
import {
    importarClientes,
    importarProductos,
    generarTemplateClientes,
    generarTemplateProductos
} from '../../services/importExcel.js';
import { abrirArchivo } from '../../services/exportExcel.js';

/**
 * Registra los handlers IPC para importación desde Excel
 */
export function registerImportHandlers() {

    /**
     * Importa clientes desde Excel
     */
    ipcMain.handle('import:clientes', async (event, options = {}) => {
        try {
            // Leer y validar archivo
            const resultado = await importarClientes();

            if (!resultado.success) {
                return resultado;
            }

            if (resultado.canceled) {
                return resultado;
            }

            const { data: clientesValidos, errores } = resultado;

            if (clientesValidos.length === 0) {
                return {
                    success: false,
                    message: 'No hay clientes válidos para importar',
                    errores: errores
                };
            }

            const db = getDatabase();
            const insertStmt = db.prepare(`
                INSERT INTO clientes (
                    rut, razon_social, giro, direccion, region, comuna, ciudad,
                    telefono, email, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
            `);

            const updateStmt = db.prepare(`
                UPDATE clientes SET
                    razon_social = ?,
                    giro = ?,
                    direccion = ?,
                    region = ?,
                    comuna = ?,
                    ciudad = ?,
                    telefono = ?,
                    email = ?,
                    updated_at = datetime('now')
                WHERE rut = ?
            `);

            const checkStmt = db.prepare('SELECT id FROM clientes WHERE rut = ?');

            let insertados = 0;
            let actualizados = 0;
            const erroresImportacion = [];

            // Procesar cada cliente
            for (const cliente of clientesValidos) {
                try {
                    // Verificar si el cliente ya existe
                    const existente = checkStmt.get(cliente.rut);

                    if (existente) {
                        // Actualizar si existe
                        if (options.updateExisting !== false) {
                            updateStmt.run(
                                cliente.razon_social,
                                cliente.giro,
                                cliente.direccion,
                                cliente.region,
                                cliente.comuna,
                                cliente.ciudad,
                                cliente.telefono,
                                cliente.email,
                                cliente.rut
                            );
                            actualizados++;
                        }
                    } else {
                        // Insertar si no existe
                        insertStmt.run(
                            cliente.rut,
                            cliente.razon_social,
                            cliente.giro,
                            cliente.direccion,
                            cliente.region,
                            cliente.comuna,
                            cliente.ciudad,
                            cliente.telefono,
                            cliente.email
                        );
                        insertados++;
                    }
                } catch (error) {
                    erroresImportacion.push({
                        rut: cliente.rut,
                        razonSocial: cliente.razon_social,
                        error: error.message
                    });
                }
            }

            return {
                success: true,
                message: `Importación completada: ${insertados} nuevos, ${actualizados} actualizados`,
                insertados,
                actualizados,
                totalProcesados: resultado.totalProcesados,
                erroresValidacion: errores,
                erroresImportacion: erroresImportacion
            };

        } catch (error) {
            console.error('Error al importar clientes:', error);
            return {
                success: false,
                message: `Error al importar: ${error.message}`
            };
        }
    });

    /**
     * Importa productos desde Excel
     */
    ipcMain.handle('import:productos', async (event, options = {}) => {
        try {
            // Leer y validar archivo
            const resultado = await importarProductos();

            if (!resultado.success) {
                return resultado;
            }

            if (resultado.canceled) {
                return resultado;
            }

            const { data: productosValidos, errores } = resultado;

            if (productosValidos.length === 0) {
                return {
                    success: false,
                    message: 'No hay productos válidos para importar',
                    errores: errores
                };
            }

            const db = getDatabase();
            const insertStmt = db.prepare(`
                INSERT INTO productos (
                    codigo, nombre, descripcion, precio, stock,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
            `);

            const updateStmt = db.prepare(`
                UPDATE productos SET
                    nombre = ?,
                    descripcion = ?,
                    precio = ?,
                    stock = ?,
                    updated_at = datetime('now')
                WHERE codigo = ?
            `);

            const checkByCodigoStmt = db.prepare('SELECT id FROM productos WHERE codigo = ? AND codigo IS NOT NULL');
            const checkByNombreStmt = db.prepare('SELECT id FROM productos WHERE nombre = ?');

            let insertados = 0;
            let actualizados = 0;
            const erroresImportacion = [];

            // Procesar cada producto
            for (const producto of productosValidos) {
                try {
                    let existente = null;

                    // Verificar si existe por código (si tiene código)
                    if (producto.codigo) {
                        existente = checkByCodigoStmt.get(producto.codigo);
                    }

                    // Si no existe por código, verificar por nombre
                    if (!existente && options.checkByName !== false) {
                        existente = checkByNombreStmt.get(producto.nombre);
                    }

                    if (existente) {
                        // Actualizar si existe
                        if (options.updateExisting !== false) {
                            if (producto.codigo) {
                                updateStmt.run(
                                    producto.nombre,
                                    producto.descripcion,
                                    producto.precio,
                                    producto.stock,
                                    producto.codigo
                                );
                            } else {
                                // Si no tiene código, actualizar por nombre
                                db.prepare(`
                                    UPDATE productos SET
                                        descripcion = ?,
                                        precio = ?,
                                        stock = ?,
                                        updated_at = datetime('now')
                                    WHERE nombre = ?
                                `).run(
                                    producto.descripcion,
                                    producto.precio,
                                    producto.stock,
                                    producto.nombre
                                );
                            }
                            actualizados++;
                        }
                    } else {
                        // Insertar si no existe
                        insertStmt.run(
                            producto.codigo,
                            producto.nombre,
                            producto.descripcion,
                            producto.precio,
                            producto.stock
                        );
                        insertados++;
                    }
                } catch (error) {
                    erroresImportacion.push({
                        codigo: producto.codigo || 'N/A',
                        nombre: producto.nombre,
                        error: error.message
                    });
                }
            }

            return {
                success: true,
                message: `Importación completada: ${insertados} nuevos, ${actualizados} actualizados`,
                insertados,
                actualizados,
                totalProcesados: resultado.totalProcesados,
                erroresValidacion: errores,
                erroresImportacion: erroresImportacion
            };

        } catch (error) {
            console.error('Error al importar productos:', error);
            return {
                success: false,
                message: `Error al importar: ${error.message}`
            };
        }
    });

    /**
     * Genera template de Excel para clientes
     */
    ipcMain.handle('import:templateClientes', async () => {
        try {
            const filePath = await generarTemplateClientes();

            if (!filePath) {
                return {
                    success: false,
                    message: 'Generación de template cancelada'
                };
            }

            // Abrir archivo
            await abrirArchivo(filePath);

            return {
                success: true,
                message: 'Template generado exitosamente',
                filePath
            };
        } catch (error) {
            console.error('Error al generar template de clientes:', error);
            return {
                success: false,
                message: `Error al generar template: ${error.message}`
            };
        }
    });

    /**
     * Genera template de Excel para productos
     */
    ipcMain.handle('import:templateProductos', async () => {
        try {
            const filePath = await generarTemplateProductos();

            if (!filePath) {
                return {
                    success: false,
                    message: 'Generación de template cancelada'
                };
            }

            // Abrir archivo
            await abrirArchivo(filePath);

            return {
                success: true,
                message: 'Template generado exitosamente',
                filePath
            };
        } catch (error) {
            console.error('Error al generar template de productos:', error);
            return {
                success: false,
                message: `Error al generar template: ${error.message}`
            };
        }
    });

    console.log('Import handlers registered');
}
