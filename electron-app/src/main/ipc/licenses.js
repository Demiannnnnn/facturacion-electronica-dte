const { ipcMain } = require('electron');
const { getAPIClient } = require('../services/api-client');
const os = require('os');
const crypto = require('crypto');

/**
 * Genera un ID único de la máquina
 */
function getMachineId() {
    const hostname = os.hostname();
    const platform = os.platform();
    const arch = os.arch();

    const data = `${hostname}-${platform}-${arch}`;
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 32);
}

/**
 * Handlers IPC para sistema de licencias
 */
function registerLicenseHandlers() {
    const api = getAPIClient();

    // Validar licencia
    ipcMain.handle('license:validate', async (event, licenseKey) => {
        try {
            const machineId = getMachineId();
            const result = await api.validateLicense(licenseKey, machineId);
            return result;
        } catch (error) {
            console.error('Error validating license:', error);
            return {
                valid: false,
                error: error.message,
                code: 'VALIDATION_ERROR'
            };
        }
    });

    // Obtener Machine ID (para mostrar al usuario)
    ipcMain.handle('license:getMachineId', async () => {
        try {
            return {
                success: true,
                machineId: getMachineId()
            };
        } catch (error) {
            console.error('Error getting machine ID:', error);
            return {
                success: false,
                error: error.message
            };
        }
    });

    console.log('License IPC handlers registered');
}

module.exports = { registerLicenseHandlers };
