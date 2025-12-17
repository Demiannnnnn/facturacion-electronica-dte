import { ipcMain, shell, app } from 'electron';
import path from 'path';
import fs from 'fs';

export function registerHelpHandlers() {
    // Abrir manual de usuario
    ipcMain.handle('help:openUserManual', async () => {
        try {
            // Obtener la ruta base de la aplicación
            const appPath = app.getAppPath();

            // En desarrollo, la ruta es desde electron-app/src/main
            // En producción, será desde el directorio de la app empaquetada
            let manualPath;

            if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
                // Desarrollo: subir desde electron-app/src/main hasta la raíz del proyecto
                manualPath = path.join(appPath, '../../docs/08-MANUAL_USUARIO.md');
            } else {
                // Producción: buscar en resources
                manualPath = path.join(process.resourcesPath, 'docs/08-MANUAL_USUARIO.md');
            }

            // Verificar que el archivo existe
            if (!fs.existsSync(manualPath)) {
                console.error('Manual not found at:', manualPath);
                return {
                    success: false,
                    error: 'Manual de usuario no encontrado. Ruta: ' + manualPath
                };
            }

            console.log('Opening user manual at:', manualPath);

            // Abrir con la aplicación predeterminada del sistema
            const result = await shell.openPath(manualPath);

            if (result) {
                // Si openPath retorna un string, hubo un error
                console.error('Error opening file:', result);
                return { success: false, error: result };
            }

            return { success: true };
        } catch (error) {
            console.error('Error opening user manual:', error);
            return { success: false, error: error.message };
        }
    });

    console.log('Help IPC handlers registered');
}
