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
    delete: (id) => ipcRenderer.invoke('clientes:delete', id),
    getReporte: () => ipcRenderer.invoke('clientes:getReporte')
  },

  // Productos
  productos: {
    create: (producto) => ipcRenderer.invoke('productos:create', producto),
    getAll: () => ipcRenderer.invoke('productos:getAll'),
    getById: (id) => ipcRenderer.invoke('productos:getById', id),
    search: (term) => ipcRenderer.invoke('productos:search', term),
    update: (data) => ipcRenderer.invoke('productos:update', data),
    delete: (id) => ipcRenderer.invoke('productos:delete', id),
    updateStock: (data) => ipcRenderer.invoke('productos:updateStock', data),
    getReporte: () => ipcRenderer.invoke('productos:getReporte')
  },

  // Vendedores
  vendedores: {
    create: (vendedor) => ipcRenderer.invoke('vendedores:create', vendedor),
    getAll: () => ipcRenderer.invoke('vendedores:getAll'),
    getActivos: () => ipcRenderer.invoke('vendedores:getActivos'),
    getById: (id) => ipcRenderer.invoke('vendedores:getById', id),
    update: (data) => ipcRenderer.invoke('vendedores:update', data),
    delete: (id) => ipcRenderer.invoke('vendedores:delete', id)
  },

  // Facturas
  facturas: {
    getNextFolio: () => ipcRenderer.invoke('facturas:getNextFolio'),
    create: (data) => ipcRenderer.invoke('facturas:create', data),
    getAll: () => ipcRenderer.invoke('facturas:getAll'),
    getById: (id) => ipcRenderer.invoke('facturas:getById', id),
    updateEstado: (data) => ipcRenderer.invoke('facturas:updateEstado', data),
    search: (filters) => ipcRenderer.invoke('facturas:search', filters),
    savePDF: (data) => ipcRenderer.invoke('facturas:savePDF', data),
    openPDF: (path) => ipcRenderer.invoke('facturas:openPDF', path),
    updatePDFPath: (data) => ipcRenderer.invoke('facturas:updatePDFPath', data),
    getReporteVentas: (params) => ipcRenderer.invoke('facturas:getReporteVentas', params),
    getReportePagos: () => ipcRenderer.invoke('facturas:getReportePagos'),
    getReporteTributario: (params) => ipcRenderer.invoke('facturas:getReporteTributario', params)
  },

  // Emisor
  emisor: {
    get: () => ipcRenderer.invoke('emisor:get'),
    save: (data) => ipcRenderer.invoke('emisor:save', data)
  },

  // Backup
  backup: {
    create: () => ipcRenderer.invoke('backup:create'),
    list: () => ipcRenderer.invoke('backup:list'),
    restore: (backupPath) => ipcRenderer.invoke('backup:restore', backupPath),
    export: () => ipcRenderer.invoke('backup:export'),
    import: () => ipcRenderer.invoke('backup:import'),
    delete: (backupPath) => ipcRenderer.invoke('backup:delete', backupPath)
  },

  // Export to Excel
  export: {
    clientes: () => ipcRenderer.invoke('export:clientes'),
    productos: () => ipcRenderer.invoke('export:productos'),
    facturas: () => ipcRenderer.invoke('export:facturas')
  },

  // Pagos
  pagos: {
    create: (data) => ipcRenderer.invoke('pagos:create', data),
    getByFactura: (facturaId) => ipcRenderer.invoke('pagos:getByFactura', facturaId),
    delete: (id) => ipcRenderer.invoke('pagos:delete', id),
    getEstadoCuenta: (clienteId) => ipcRenderer.invoke('pagos:getEstadoCuenta', clienteId)
  },

  // Folios
  folios: {
    getAll: () => ipcRenderer.invoke('folios:getAll'),
    update: (data) => ipcRenderer.invoke('folios:update', data),
    getNext: (tipoDocumento) => ipcRenderer.invoke('folios:getNext', tipoDocumento)
  },

  // Menu events listener
  onMenuEvent: (callback) => {
    ipcRenderer.on('menu:export-clientes', () => callback('export-clientes'));
    ipcRenderer.on('menu:export-productos', () => callback('export-productos'));
    ipcRenderer.on('menu:export-facturas', () => callback('export-facturas'));
  }
});
