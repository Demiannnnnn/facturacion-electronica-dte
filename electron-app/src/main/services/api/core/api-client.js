/**
 * API Client - Abstracción para comunicación con backend
 * Comunicación legacy con backend.
 *
 * Nota:
 * - Documentos tributarios (facturas/boletas) se envían en JSON desde services/api/facturacion/documentos.js
 * - Este cliente queda para licencia y compatibilidad.
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
