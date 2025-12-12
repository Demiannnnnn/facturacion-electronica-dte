// TODO: Implementar según documentación
// Ver documentacion/latex.pdf página 28

const { contextBridge, ipcRenderer } = require('electron');

// Exponer API segura al renderer
contextBridge.exposeInMainWorld('api', {
  // Auth
  auth: {
    checkFirstRun: () => ipcRenderer.invoke('auth:checkFirstRun'),
    register: (credentials) => ipcRenderer.invoke('auth:register', credentials),
    login: (credentials) => ipcRenderer.invoke('auth:login', credentials),
    logout: () => ipcRenderer.invoke('auth:logout'),
    getCurrentUser: () => ipcRenderer.invoke('auth:getCurrentUser'),
    changePassword: (data) => ipcRenderer.invoke('auth:changePassword', data)
  },

  // Clientes
  clientes: {
    create: (cliente) => ipcRenderer.invoke('clientes:create', cliente),
    getAll: () => ipcRenderer.invoke('clientes:getAll'),
    getById: (id) => ipcRenderer.invoke('clientes:getById', id),
    search: (term) => ipcRenderer.invoke('clientes:search', term),
    update: (data) => ipcRenderer.invoke('clientes:update', data),
    delete: (id) => ipcRenderer.invoke('clientes:delete', id)
  },

  // Productos
  productos: {
    create: (producto) => ipcRenderer.invoke('productos:create', producto),
    getAll: () => ipcRenderer.invoke('productos:getAll'),
    getById: (id) => ipcRenderer.invoke('productos:getById', id),
    search: (term) => ipcRenderer.invoke('productos:search', term),
    update: (data) => ipcRenderer.invoke('productos:update', data),
    delete: (id) => ipcRenderer.invoke('productos:delete', id),
    updateStock: (data) => ipcRenderer.invoke('productos:updateStock', data)
  },

  // Facturas
  facturas: {
    create: (factura) => ipcRenderer.invoke('facturas:create', factura),
    getAll: () => ipcRenderer.invoke('facturas:getAll')
  }
});
