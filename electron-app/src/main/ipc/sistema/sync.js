import { ipcMain } from 'electron';
import { 
  syncFacturaToServer, 
  syncFacturaXML,
  syncVentaToServer,
  syncProductosToServer,
  syncClientesToServer,
  checkServerConnection,
  getSyncQueueSize,
  processSyncQueue
} from '../../services/api/sistema/sync-service.js';

/**
 * Handlers IPC para sincronización con el servidor central
 * 
 * NOTA: Estas funciones están preparadas para la arquitectura v2.0
 * pero por ahora operan en modo simulación hasta que el servidor esté implementado.
 */
export function registerSyncHandlers() {
  
  // Verificar conexión con servidor
  ipcMain.handle('sync:checkConnection', async () => {
    try {
      const isConnected = await checkServerConnection();
      return { 
        success: true, 
        connected: isConnected,
        queueSize: getSyncQueueSize()
      };
    } catch (error) {
      console.error('Error checking connection:', error);
      return { 
        success: false, 
        connected: false, 
        error: error.message 
      };
    }
  });

  // Sincronizar factura individual
  ipcMain.handle('sync:factura', async (event, facturaData) => {
    try {
      const result = await syncFacturaToServer(facturaData);
      return result;
    } catch (error) {
      console.error('Error syncing factura:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  });

  // Sincronizar XML de factura
  ipcMain.handle('sync:facturaXML', async (event, { facturaId, xmlContent }) => {
    try {
      const result = await syncFacturaXML(facturaId, xmlContent);
      return result;
    } catch (error) {
      console.error('Error syncing factura XML:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  });

  // Sincronizar datos de venta
  ipcMain.handle('sync:venta', async (event, ventaData) => {
    try {
      const result = await syncVentaToServer(ventaData);
      return result;
    } catch (error) {
      console.error('Error syncing venta:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  });

  // Sincronizar productos
  ipcMain.handle('sync:productos', async (event, productos) => {
    try {
      const result = await syncProductosToServer(productos);
      return result;
    } catch (error) {
      console.error('Error syncing productos:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  });

  // Sincronizar clientes
  ipcMain.handle('sync:clientes', async (event, clientes) => {
    try {
      const result = await syncClientesToServer(clientes);
      return result;
    } catch (error) {
      console.error('Error syncing clientes:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  });

  // Obtener estado de la cola de sincronización
  ipcMain.handle('sync:getQueueStatus', async () => {
    try {
      const queueSize = getSyncQueueSize();
      return { 
        success: true, 
        queueSize,
        hasItemsToSync: queueSize > 0
      };
    } catch (error) {
      console.error('Error getting queue status:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  });

  // Procesar cola de sincronización
  ipcMain.handle('sync:processQueue', async () => {
    try {
      const result = await processSyncQueue();
      return result;
    } catch (error) {
      console.error('Error processing queue:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  });

  console.log('✅ Sync handlers registered (simulation mode)');
}
