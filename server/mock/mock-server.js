import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Mock Server - Simula respuestas de Railway + ChileAPI
 * NO requiere estar corriendo, las respuestas son síncronas desde archivos
 */
class MockServer {
    constructor() {
        this.dataPath = path.join(__dirname, 'data');
        this.licensesPath = path.join(this.dataPath, 'licenses.json');
        this.siiResponsesPath = path.join(this.dataPath, 'sii-responses.json');
    }

    /**
     * Simula delay de red
     */
    async simulateNetworkDelay(min = 200, max = 800) {
        const delay = Math.floor(Math.random() * (max - min + 1)) + min;
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    /**
     * Reemplaza placeholders en respuestas
     */
    replacePlaceholders(obj, values) {
        const str = JSON.stringify(obj);
        let result = str;

        Object.entries(values).forEach(([key, value]) => {
            result = result.replace(new RegExp(`{${key}}`, 'g'), value);
        });

        return JSON.parse(result);
    }

    /**
     * Valida licencia (mock)
     */
    async validateLicense(licenseKey, machineId) {
        await this.simulateNetworkDelay();

        try {
            const data = await fs.readFile(this.licensesPath, 'utf8');
            const { licenses, validations } = JSON.parse(data);

            const license = licenses.find(l => l.key === licenseKey);

            if (!license) {
                return {
                    valid: false,
                    error: 'Licencia no encontrada',
                    code: 'LICENSE_NOT_FOUND'
                };
            }

            if (!license.isActive) {
                return {
                    valid: false,
                    error: 'Licencia desactivada',
                    code: 'LICENSE_INACTIVE'
                };
            }

            // Verificar expiración
            const now = new Date();
            const expiresAt = new Date(license.expiresAt);

            if (now > expiresAt) {
                return {
                    valid: false,
                    error: 'Licencia expirada',
                    code: 'LICENSE_EXPIRED',
                    expiresAt: license.expiresAt
                };
            }

            // Verificar machine ID (si no es wildcard)
            if (license.machineId !== '*' && license.machineId !== machineId) {
                return {
                    valid: false,
                    error: 'Licencia registrada en otro equipo',
                    code: 'MACHINE_MISMATCH',
                    registeredMachine: license.machineId
                };
            }

            // Registrar validación
            validations.push({
                licenseKey,
                machineId,
                timestamp: new Date().toISOString(),
                success: true
            });

            // Guardar validaciones (opcional, para debugging)
            await fs.writeFile(
                this.licensesPath,
                JSON.stringify({ licenses, validations }, null, 2)
            );

            return {
                valid: true,
                license: {
                    clientName: license.clientName,
                    expiresAt: license.expiresAt,
                    maxDevices: license.maxDevices
                }
            };
        } catch (error) {
            console.error('Error validating license:', error);
            return {
                valid: false,
                error: 'Error interno del servidor',
                code: 'SERVER_ERROR'
            };
        }
    }

    /**
     * Envía DTE al SII (mock)
     */
    async enviarDTE(dte) {
        await this.simulateNetworkDelay(500, 1500);

        try {
            const data = await fs.readFile(this.siiResponsesPath, 'utf8');
            const responses = JSON.parse(data);

            // 70% éxito, 20% reparos, 10% rechazo
            const random = Math.random();
            let responseType;

            if (random < 0.7) {
                responseType = 'success';
            } else if (random < 0.9) {
                responseType = 'reparos';
            } else {
                responseType = 'rechazado';
            }

            const response = responses.siiResponses[responseType];

            // Reemplazar placeholders
            const result = this.replacePlaceholders(response, {
                timestamp: new Date().toISOString(),
                folio: dte.folio || '0000',
                trackId: 'MOCK-' + Date.now()
            });

            console.log(`[MOCK SII] DTE ${dte.folio} - ${responseType.toUpperCase()}`);

            return result;
        } catch (error) {
            console.error('Error sending DTE:', error);
            return {
                success: false,
                error: 'Error al enviar DTE',
                code: 'SEND_ERROR'
            };
        }
    }

    /**
     * Consulta estado de DTE (mock)
     */
    async consultarEstadoDTE(trackId) {
        await this.simulateNetworkDelay(300, 600);

        try {
            const data = await fs.readFile(this.siiResponsesPath, 'utf8');
            const responses = JSON.parse(data);

            // 90% aceptado, 10% pendiente
            const responseType = Math.random() < 0.9 ? 'aceptado' : 'pendiente';
            const response = responses.estadoConsulta[responseType];

            const result = this.replacePlaceholders(response, {
                trackId,
                timestamp: new Date().toISOString()
            });

            console.log(`[MOCK SII] Consulta ${trackId} - ${responseType.toUpperCase()}`);

            return result;
        } catch (error) {
            console.error('Error querying DTE status:', error);
            return {
                success: false,
                error: 'Error al consultar estado',
                code: 'QUERY_ERROR'
            };
        }
    }

    /**
     * Genera PDF timbrado (mock)
     */
    async generarPDFTimbrado(folio) {
        await this.simulateNetworkDelay(400, 800);

        return {
            success: true,
            pdfUrl: `mock://pdf-timbrado-${folio}.pdf`,
            message: 'PDF generado (simulado)'
        };
    }
}

const mockServer = new MockServer();
export default mockServer;
