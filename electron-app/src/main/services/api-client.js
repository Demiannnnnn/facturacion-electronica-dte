
/**
 * API Client - Abstracción para comunicación con backend
 * Comunicación con backend (solo producción)
 */
class APIClient {
    constructor() {
        this.apiUrl = process.env.API_URL || 'http://localhost:3000';
        console.log(`[API Client] URL: ${this.apiUrl}`);
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
        // ...existing code...

        // Producción: llamada real a Railway → ChileAPI
        try {
            const response = await fetch(`${this.apiUrl}/api/sii/enviar-dte`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
            const response = await fetch(`${this.apiUrl}/api/sii/estado/${trackId}`);
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
            const response = await fetch(`${this.apiUrl}/api/sii/pdf/${folio}`);
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
