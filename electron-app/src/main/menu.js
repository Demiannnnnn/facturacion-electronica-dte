import { Menu, app } from 'electron';

export function createMenu() {
  const template = [
    {
      label: 'Archivo',
      submenu: [
        {
          label: 'Exportar',
          submenu: [
            {
              label: 'Exportar Clientes a Excel',
              accelerator: 'CmdOrCtrl+Shift+C',
              click: async (menuItem, browserWindow) => {
                if (browserWindow) {
                  browserWindow.webContents.send('menu:export-clientes');
                }
              }
            },
            {
              label: 'Exportar Productos a Excel',
              accelerator: 'CmdOrCtrl+Shift+P',
              click: async (menuItem, browserWindow) => {
                if (browserWindow) {
                  browserWindow.webContents.send('menu:export-productos');
                }
              }
            },
            {
              label: 'Exportar Facturas a Excel',
              accelerator: 'CmdOrCtrl+Shift+F',
              click: async (menuItem, browserWindow) => {
                if (browserWindow) {
                  browserWindow.webContents.send('menu:export-facturas');
                }
              }
            }
          ]
        },
        { type: 'separator' },
        {
          label: 'Salir',
          accelerator: 'Alt+F4',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Editar',
      submenu: [
        { label: 'Deshacer', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'Rehacer', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
        { type: 'separator' },
        { label: 'Cortar', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'Copiar', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'Pegar', accelerator: 'CmdOrCtrl+V', role: 'paste' },
        { label: 'Seleccionar todo', accelerator: 'CmdOrCtrl+A', role: 'selectAll' }
      ]
    },
    {
      label: 'Ver',
      submenu: [
        { label: 'Recargar', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        { label: 'Forzar recarga', accelerator: 'CmdOrCtrl+Shift+R', role: 'forceReload' },
        { type: 'separator' },
        { label: 'Pantalla completa', accelerator: 'F11', role: 'togglefullscreen' }
      ]
    }
  ];

  // En desarrollo, agregar opciones de desarrollador
  const isDevelopment = process.env.NODE_ENV === 'development' || !app.isPackaged;

  if (isDevelopment) {
    template.push({
      label: 'Desarrollo',
      submenu: [
        { label: 'Herramientas de desarrollo', accelerator: 'F12', role: 'toggleDevTools' },
        { type: 'separator' },
        { label: 'Recargar aplicación', accelerator: 'CmdOrCtrl+R', role: 'reload' }
      ]
    });
  }

  template.push({
    label: 'Ayuda',
    submenu: [
      {
        label: 'Acerca de',
        click: async () => {
          const { dialog } = await import('electron');
          dialog.showMessageBox({
            type: 'info',
            title: 'Acerca de',
            message: 'Sistema de Facturación Electrónica B2B',
            detail: `Versión: 1.0.0\nDesarrollado por: Demian Maturana\n\nSistema para gestión de facturación electrónica.`
          });
        }
      }
    ]
  });

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
