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
    changePassword: (data) => ipcRenderer.invoke('auth:changePassword', data),
    onSessionExpired: (callback) => {
      const handler = () => callback();
      ipcRenderer.on('auth:session-expired', handler);
      return () => ipcRenderer.removeListener('auth:session-expired', handler);
    }
  },

  // Usuarios (gestión de usuarios y permisos)
  usuarios: {
    getAll: () => ipcRenderer.invoke('usuarios:getAll'),
    getById: (id) => ipcRenderer.invoke('usuarios:getById', id),
    create: (data) => ipcRenderer.invoke('usuarios:create', data),
    syncTrabajadoresPendientes: () => ipcRenderer.invoke('usuarios:syncTrabajadoresPendientes'),
    update: (data) => ipcRenderer.invoke('usuarios:update', data),
    changePassword: (data) => ipcRenderer.invoke('usuarios:changePassword', data),
    toggleActive: (data) => ipcRenderer.invoke('usuarios:toggleActive', data),
    delete: (data) => ipcRenderer.invoke('usuarios:delete', data),
    checkPermission: (data) => ipcRenderer.invoke('usuarios:checkPermission', data),
    getPermisos: (userId) => ipcRenderer.invoke('usuarios:getPermisos', userId),
    getAuditLog: (userId) => ipcRenderer.invoke('usuarios:getAuditLog', userId),
    updateLastAccess: (userId) => ipcRenderer.invoke('usuarios:updateLastAccess', userId)
  },

  // Roles
  roles: {
    getAll: () => ipcRenderer.invoke('roles:getAll'),
    getPermisos: (nombreRol) => ipcRenderer.invoke('roles:getPermisos', nombreRol),
    updatePermisos: (data) => ipcRenderer.invoke('roles:updatePermisos', data)
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

  // Guías de Despacho
  guias: {
    getNextFolio: () => ipcRenderer.invoke('guias:getNextFolio'),
    create: (data) => ipcRenderer.invoke('guias:create', data),
    getAll: () => ipcRenderer.invoke('guias:getAll'),
    getById: (id) => ipcRenderer.invoke('guias:getById', id),
    updateEstado: (data) => ipcRenderer.invoke('guias:updateEstado', data),
    updatePDFPath: (data) => ipcRenderer.invoke('guias:updatePDFPath', data),
    delete: (id) => ipcRenderer.invoke('guias:delete', id)
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

  // Import from Excel
  import: {
    clientes: (options) => ipcRenderer.invoke('import:clientes', options),
    productos: (options) => ipcRenderer.invoke('import:productos', options),
    templateClientes: () => ipcRenderer.invoke('import:templateClientes'),
    templateProductos: () => ipcRenderer.invoke('import:templateProductos')
  },

  // Pagos
  pagos: {
    create: (data) => ipcRenderer.invoke('pagos:create', data),
    getByFactura: (facturaId) => ipcRenderer.invoke('pagos:getByFactura', facturaId),
    delete: (id) => ipcRenderer.invoke('pagos:delete', id),
    getEstadoCuenta: (clienteId) => ipcRenderer.invoke('pagos:getEstadoCuenta', clienteId)
  },

  // Configuración
  config: {
    get: (key) => ipcRenderer.invoke('config:get', key),
    set: (key, value) => ipcRenderer.invoke('config:set', key, value),
    getAll: () => ipcRenderer.invoke('config:getAll'),
    delete: (key) => ipcRenderer.invoke('config:delete', key)
  },

  // Folios
  folios: {
    getAll: () => ipcRenderer.invoke('folios:getAll'),
    update: (data) => ipcRenderer.invoke('folios:update', data),
    getNext: (tipoDocumento) => ipcRenderer.invoke('folios:getNext', tipoDocumento)
  },

  // Sincronización con servidor (v2.0)
  sync: {
    checkConnection: () => ipcRenderer.invoke('sync:checkConnection'),
    factura: (facturaData) => ipcRenderer.invoke('sync:factura', facturaData),
    venta: (ventaData) => ipcRenderer.invoke('sync:venta', ventaData),
    productos: (productos) => ipcRenderer.invoke('sync:productos', productos),
    clientes: (clientes) => ipcRenderer.invoke('sync:clientes', clientes),
    getQueueStatus: () => ipcRenderer.invoke('sync:getQueueStatus'),
    processQueue: () => ipcRenderer.invoke('sync:processQueue')
  },

  // Seed para desarrollo
  seed: {
    all: () => ipcRenderer.invoke('seed:all'),
    profile: (profileName) => ipcRenderer.invoke('seed:profile', profileName)
  },

  // Empresas (para Contador)
  empresas: {
    create: (empresa) => ipcRenderer.invoke('empresas:create', empresa),
    getAll: (contadorId) => ipcRenderer.invoke('empresas:getAll', contadorId),
    getById: (id) => ipcRenderer.invoke('empresas:getById', id),
    update: (id, empresa) => ipcRenderer.invoke('empresas:update', id, empresa),
    delete: (id) => ipcRenderer.invoke('empresas:delete', id),
    changeStatus: (id, estado) => ipcRenderer.invoke('empresas:changeStatus', id, estado),
    search: (contadorId, searchTerm) => ipcRenderer.invoke('empresas:search', contadorId, searchTerm),
    getStats: (contadorId) => ipcRenderer.invoke('empresas:getStats', contadorId)
  },

  // Vinculaciones (conexión cliente-contador)
  vinculaciones: {
    buscar: (query) => ipcRenderer.invoke('vinculaciones:buscar', query),
    enviarSolicitud: (targetUserId) => ipcRenderer.invoke('vinculaciones:enviarSolicitud', targetUserId),
    pendientes: () => ipcRenderer.invoke('vinculaciones:pendientes'),
    enviadas: () => ipcRenderer.invoke('vinculaciones:enviadas'),
    activas: () => ipcRenderer.invoke('vinculaciones:activas'),
    aceptar: (id) => ipcRenderer.invoke('vinculaciones:aceptar', id),
    rechazar: (id) => ipcRenderer.invoke('vinculaciones:rechazar', id),
    eliminar: (id) => ipcRenderer.invoke('vinculaciones:eliminar', id)
  },

  // Subscription (suscripciones y pagos)
  subscription: {
    getStatus: () => ipcRenderer.invoke('subscription:getStatus'),
    activateTrial: () => ipcRenderer.invoke('subscription:activateTrial'),
    initializePayment: (data) => ipcRenderer.invoke('subscription:initializePayment', data),
    verifyPayment: () => ipcRenderer.invoke('subscription:verifyPayment'),
    cancel: () => ipcRenderer.invoke('subscription:cancel'),
    renew: () => ipcRenderer.invoke('subscription:renew')
  },

  // Open external URL
  openExternal: (url) => ipcRenderer.invoke('openExternal', url),

  // PDF utilities (generic)
  savePDF: (data) => ipcRenderer.invoke('savePDF', data),
  openPDF: (path) => ipcRenderer.invoke('openPDF', path),

  // Menu events listener
  onMenuEvent: (callback) => {
    ipcRenderer.on('menu:export-clientes', () => callback('export-clientes'));
    ipcRenderer.on('menu:export-productos', () => callback('export-productos'));
    ipcRenderer.on('menu:export-facturas', () => callback('export-facturas'));
    ipcRenderer.on('menu:import-clientes', () => callback('import-clientes'));
    ipcRenderer.on('menu:import-productos', () => callback('import-productos'));
    ipcRenderer.on('menu:template-clientes', () => callback('template-clientes'));
    ipcRenderer.on('menu:template-productos', () => callback('template-productos'));
  }
});
