import { ipcMain } from 'electron';
import documentosApi from '../../services/api/facturacion/documentos.js';

/**
 * Handlers IPC para integración con SII
 */
function registerSIIHandlers() {
    // Enviar DTE al SII
    ipcMain.handle('sii:enviarDTE', async (event, dte) => {
        try {
            const result = await documentosApi.enviarDocumento(dte);
            return result;
        } catch (error) {
            console.error('Error sending DTE:', error);
            return {
                success: false,
                error: error.message
            };
        }
    });

    // Consultar estado de DTE
    ipcMain.handle('sii:consultarEstado', async (event, trackId) => {
        try {
            const result = await documentosApi.consultarEstado(trackId);
            return result;
        } catch (error) {
            console.error('Error querying DTE status:', error);
            return {
                success: false,
                error: error.message
            };
        }
    });

    // Generar PDF timbrado
    ipcMain.handle('sii:generarPDFTimbrado', async (event, folio) => {
        try {
            const result = await documentosApi.generarPDFTimbrado(folio);
            return result;
        } catch (error) {
            console.error('Error generating PDF:', error);
            return {
                success: false,
                error: error.message
            };
        }
    });

    console.log('SII IPC handlers registered');
}

export { registerSIIHandlers };
