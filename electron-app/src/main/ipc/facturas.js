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

  console.log('Facturas IPC handlers registered');
}

