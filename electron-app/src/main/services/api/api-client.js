
import tokenStore from '../../utils/tokenStore.js';

/**
 * API Client - Abstracción para comunicación con backend
 * Comunicación con backend (solo producción)
 */
class APIClient {
    constructor() {
        this.apiUrl = process.env.API_URL || 'http://localhost:3000';
        console.log(`[API Client] URL: ${this.apiUrl}`);
    }

    getAuthHeaders() {
        const token = tokenStore.getAccessToken();
        const headers = { 'Content-Type': 'application/json' };

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        return headers;
    }

    /**
     * Valida licencia
     */
    async validateLicense(licenseKey, machineId) {
        // ...existing code...

        // Producción: llamada real a Railway
        try {
            const response = await fetch(`${this.apiUrl}/api/licenses/validate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ licenseKey, machineId })
            });

            return await response.json();
        } catch (error) {
            console.error('Error validating license:', error);
            return {
                valid: false,
                error: 'Error de conexión con el servidor',
                code: 'CONNECTION_ERROR'
            };
        }
    }

    /**
     * Envía DTE al SII vía ChileAPI
     */
    async enviarDTE(dte) {

        try {
            const response = await fetch(`${this.apiUrl}/api/documentos/enviar-dte`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(dte)
            });

            return await response.json();
        } catch (error) {
            console.error('Error sending DTE:', error);
            return {
                success: false,
                error: 'Error de conexión con el servidor',
                code: 'CONNECTION_ERROR'
            };
        }
    }

    /**
     * Consulta estado de DTE
     */
    async consultarEstadoDTE(trackId) {
        // ...existing code...

        // Producción
        try {
            const response = await fetch(`${this.apiUrl}/api/documentos/estado/${trackId}`, {
                headers: this.getAuthHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error('Error querying DTE status:', error);
            return {
                success: false,
                error: 'Error de conexión con el servidor',
                code: 'CONNECTION_ERROR'
            };
        }
    }

    /**
     * Genera PDF timbrado del SII
     */
    async generarPDFTimbrado(folio) {
        // ...existing code...

        // Producción
        try {
            const response = await fetch(`${this.apiUrl}/api/documentos/pdf/${folio}`, {
                headers: this.getAuthHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error('Error generating PDF:', error);
            return {
                success: false,
                error: 'Error de conexión con el servidor',
                code: 'CONNECTION_ERROR'
            };
        }
    }
}

// Singleton
let instance = null;

function getAPIClient() {
    if (!instance) {
        instance = new APIClient();
    }
    return instance;
}

export { getAPIClient };
