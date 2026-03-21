# 🌳 ÁRBOL DE CARPETAS - PROYECTO FRONTEND

## Estructura Completa del Proyecto (electron-app)

```
electron-app/
│
├── 📄 package.json
├── 📄 vite.config.js
├── 📄 jest.config.js
├── 📄 electron-builder.yml
│
├── 📁 src/
│
│   ├── 🖥️  MAIN (Backend - Electron/Node.js)
│   │   ├── 📄 main.js ⭐ PUNTO DE ENTRADA
│   │   │   └── Importa y registra todos los IPC handlers
│   │   │       • registerVendedoresHandlers()
│   │   │       • registerUsuariosHandlers()
│   │   │       • registerFacturasHandlers()
│   │   │       • etc.
│   │   │
│   │   ├── 📄 menu.js
│   │   │   └── Configuración del menú de aplicación
│   │   │
│   │   ├── 📊 database/
│   │   │   └── 📄 connection.js ⭐ ESQUEMA DE BD
│   │   │       ├── initDatabase()
│   │   │       ├── getDatabase()
│   │   │       └── createTables()
│   │   │           ├── users (con roles/permisos)
│   │   │           ├── vendedores ⭐
│   │   │           ├── facturas
│   │   │           ├── clientes
│   │   │           ├── productos
│   │   │           ├── roles
│   │   │           ├── audit_usuarios
│   │   │           └── [otras tablas...]
│   │   │
│   │   ├── 📡 ipc/ ⭐ IPC HANDLERS (Comunicación Main ↔ Renderer)
│   │   │   ├── 📄 vendedores.js ⭐⭐⭐
│   │   │   │   ├── vendedores:create
│   │   │   │   ├── vendedores:getAll
│   │   │   │   ├── vendedores:getActivos
│   │   │   │   ├── vendedores:getById
│   │   │   │   ├── vendedores:update
│   │   │   │   └── vendedores:delete
│   │   │   │
│   │   │   ├── 📄 usuarios.js ⭐⭐⭐
│   │   │   │   ├── usuarios:getAll
│   │   │   │   ├── usuarios:create
│   │   │   │   ├── usuarios:update
│   │   │   │   ├── usuarios:delete
│   │   │   │   ├── usuarios:toggleActive
│   │   │   │   ├── usuarios:changePassword
│   │   │   │   ├── usuarios:getPermisos
│   │   │   │   ├── usuarios:syncTrabajadoresPendientes
│   │   │   │   └── usuarios:getAuditLog
│   │   │   │
│   │   │   ├── 📄 auth.js
│   │   │   │   ├── auth:login
│   │   │   │   ├── auth:register
│   │   │   │   └── auth:logout
│   │   │   │
│   │   │   ├── 📄 facturas.js
│   │   │   ├── 📄 clientes.js
│   │   │   ├── 📄 productos.js
│   │   │   ├── 📄 reportes.js
│   │   │   ├── 📄 pagos.js
│   │   │   ├── 📄 guias.js
│   │   │   ├── 📄 boletas.js
│   │   │   ├── 📄 empresas.js
│   │   │   ├── 📄 folios.js
│   │   │   ├── 📄 caja.js
│   │   │   ├── 📄 config.js
│   │   │   ├── 📄 export.js
│   │   │   ├── 📄 import.js
│   │   │   ├── 📄 sync.js
│   │   │   └── [otros handlers...]
│   │   │
│   │   ├── 🔧 services/
│   │   │   ├── 📁 api/
│   │   │   │   ├── 📄 sync-service.js
│   │   │   │   ├── 📄 auth-service.js
│   │   │   │   └── [servicios de API]
│   │   │   └── [otros servicios]
│   │   │
│   │   └── 🔨 utils/
│   │       ├── 📄 validaciones.js
│   │       ├── 📄 formateo.js
│   │       └── [utilidades backend]
│   │
│   │
│   ├── 🎨 RENDERER (Frontend - React) ⭐⭐⭐
│   │   ├── 📄 index.html
│   │   │
│   │   └── 📁 src/
│   │       │
│   │       ├── 📄 main.jsx ← Punto entrada React
│   │       │   └── Monta App.jsx en #app
│   │       │
│   │       ├── 📄 App.jsx ⭐ ROUTER PRINCIPAL
│   │       │   ├── BrowserRouter
│   │       │   ├── AuthProvider
│   │       │   └── Routes:
│   │       │       ├── /login
│   │       │       ├── /register
│   │       │       ├── /cliente
│   │       │       ├── /cliente/vendedores ⭐⭐
│   │       │       ├── /cliente/configuracion/usuarios ⭐⭐
│   │       │       └── [otras rutas...]
│   │       │
│   │       ├── 📁 pages/ ⭐ COMPONENTES DE PÁGINA
│   │       │   ├── 📁 Vendedores/ ⭐⭐⭐
│   │       │   │   └── 📄 index.jsx
│   │       │   │       ├── State: view, vendedores, editingVendedor, formData
│   │       │   │       ├── loadVendedores() - Carga lista
│   │       │   │       ├── handleSubmit() - Guardar/actualizar
│   │       │   │       ├── handleEdit() - Editar
│   │       │   │       ├── handleDelete() - Eliminar
│   │       │   │       └── Renderiza: Tabla + Formulario
│   │       │   │
│   │       │   ├── 📁 Usuarios/ ⭐⭐⭐
│   │       │   │   └── 📄 index.jsx
│   │       │   │       ├── State: view, usuarios, roles, editingUsuario, formData
│   │       │   │       ├── loadData() - Carga usuarios y roles
│   │       │   │       ├── handleSubmit() - Crear/actualizar
│   │       │   │       ├── handleToggleActive() - Activar/desactivar
│   │       │   │       ├── handleDelete() - Eliminar
│   │       │   │       └── Renderiza: Tabla + Formulario
│   │       │   │
│   │       │   ├── 📁 Facturas/
│   │       │   │   └── 📄 index.jsx
│   │       │   │       ├── Carga facturas, clientes
│   │       │   │       ├── Filtros por estado, fecha, cliente
│   │       │   │       ├── Generación de PDF
│   │       │   │       └── Integración con sistema de pagos
│   │       │   │
│   │       │   ├── 📁 Clientes/
│   │       │   ├── 📁 Productos/
│   │       │   ├── 📁 Reportes/
│   │       │   ├── 📁 Caja/
│   │       │   ├── 📁 PuntoVenta/
│   │       │   ├── 📁 Guias/
│   │       │   ├── 📁 Boletas/
│   │       │   ├── 📁 Compras/
│   │       │   ├── 📁 Documentos/
│   │       │   │
│   │       │   ├── 📁 Auth/
│   │       │   │   ├── 📄 LoginPage.jsx
│   │       │   │   ├── 📄 RegisterPage.jsx
│   │       │   │   ├── 📄 RoleSelectionPage.jsx
│   │       │   │   └── 📄 SubscriptionPage.jsx
│   │       │   │
│   │       │   ├── 📁 Configuracion/
│   │       │   │   ├── 📄 EmisorConfig.jsx
│   │       │   │   ├── 📄 ChangePassword.jsx
│   │       │   │   ├── 📄 Folios.jsx
│   │       │   │   ├── 📄 MiContador.jsx
│   │       │   │   └── 📄 UserManual.jsx
│   │       │   │
│   │       │   ├── 📁 Contador/
│   │       │   ├── 📁 Cliente/
│   │       │   ├── 📁 Dashboard/
│   │       │   ├── 📁 Facturacion/
│   │       │   └── 📁 DesignSystem/
│   │       │
│   │       ├── 🧠 context/ ⭐ CONTEXT API
│   │       │   └── 📄 AuthContext.jsx ⭐⭐⭐
│   │       │       ├── createContext()
│   │       │       ├── useAuth() hook
│   │       │       ├── user state
│   │       │       ├── permisos state
│   │       │       ├── login(email, password)
│   │       │       ├── register(email, password, nombre, rut)
│   │       │       ├── logout()
│   │       │       ├── changePassword()
│   │       │       └── Permisos helpers:
│   │       │           ├── hasPermission(recurso, accion)
│   │       │           ├── canAccessVendedores()
│   │       │           ├── canAccessUsuarios()
│   │       │           ├── isOwner()
│   │       │           └── isAdmin()
│   │       │
│   │       ├── 🧩 components/ ⭐ COMPONENTES REUTILIZABLES
│   │       │   ├── 📁 layout/
│   │       │   │   ├── 📄 ClienteLayout.jsx ⭐
│   │       │   │   │   ├── Renderiza navegación principal
│   │       │   │   │   ├── useAuth() - Carga permisos
│   │       │   │   │   ├── enabledModules[] - Modules habilitados
│   │       │   │   │   ├── menuConfig - Items del menú
│   │       │   │   │   ├── Renderiza: Header + Nav + Content
│   │       │   │   │   └── Items con canAccessVendedores, etc.
│   │       │   │   ├── 📄 ContadorLayout.jsx
│   │       │   │   └── [otros layouts]
│   │       │   │
│   │       │   ├── 📁 auth/
│   │       │   │   ├── 📄 ProtectedRoute.jsx
│   │       │   │   │   └── Verifica requiredRole
│   │       │   │   └── 📄 PermissionRoute.jsx
│   │       │   │       └── Verifica requiredPermission
│   │       │   │
│   │       │   ├── 📁 facturas/
│   │       │   │   ├── 📄 FormularioFactura.jsx
│   │       │   │   │   ├── Carga clientes
│   │       │   │   │   ├── Carga productos
│   │       │   │   │   ├── Tabla de items editable
│   │       │   │   │   └── Cálculo de totales
│   │       │   │   └── [otros componentes facturas]
│   │       │   │
│   │       │   ├── 📁 permissions/
│   │       │   │   └── Componentes de permiso
│   │       │   │
│   │       │   └── [otros componentes...]
│   │       │
│   │       ├── 🛠️  utils/
│   │       │   ├── 📄 validaciones.js
│   │       │   │   ├── formatearRut(rut)
│   │       │   │   └── [validaciones]
│   │       │   ├── 📄 generarPDF.js
│   │       │   ├── 📄 formateo.js
│   │       │   └── [utilidades frontend]
│   │       │
│   │       ├── 🎨 styles/
│   │       │   └── [archivos CSS/SCSS]
│   │       │
│   │       └── 💾 data/
│   │           └── [datos estáticos/constantes]
│   │
│   │
│   └── 🔐 preload/ ⭐ IPC BRIDGE
│       └── 📄 preload.js ⭐⭐⭐
│           └── Expone window.api:
│               ├── api.auth
│               │   ├── login()
│               │   ├── register()
│               │   ├── logout()
│               │   └── ...
│               │
│               ├── api.vendedores ⭐
│               │   ├── create(data)
│               │   ├── getAll()
│               │   ├── getActivos()
│               │   ├── getById(id)
│               │   ├── update({id, vendedor})
│               │   └── delete(id)
│               │
│               ├── api.usuarios ⭐
│               │   ├── getAll()
│               │   ├── create(data)
│               │   ├── update({id, ...})
│               │   ├── toggleActive(data)
│               │   ├── delete(data)
│               │   ├── changePassword(data)
│               │   ├── getPermisos(userId)
│               │   ├── checkPermission(data)
│               │   ├── getAuditLog(userId)
│               │   ├── updateLastAccess(userId)
│               │   └── syncTrabajadoresPendientes()
│               │
│               ├── api.facturas
│               ├── api.clientes
│               ├── api.productos
│               ├── api.reportes
│               ├── api.caja
│               ├── api.roles
│               ├── api.folios
│               ├── api.export
│               ├── api.import
│               └── [otros...]
│
│
├── 📁 dist-renderer/
│   ├── 📄 index.html
│   └── 📁 assets/ [archivos compilados]
│
├── 📁 XMLs/
│
├── 📁 scripts/
│   ├── 📄 check-api.js
│   └── [scripts de desarrollo]
│
├── 📁 img/
│   └── [imágenes de la app]
│
└── 📁 __tests__/
    ├── 📄 setup.js
    ├── 📄 helpers.js
    ├── 📄 auth-helper.js
    ├── 📁 api/
    ├── 📁 integration/
    ├── 📁 reporters/
    └── [tests...]

```

---

## 🎯 Rutas Importantes (Resumen)

### Para Editar: Página Vendedores
```
electron-app/src/renderer/src/pages/Vendedores/index.jsx
```

### Para Editar: Página Usuarios
```
electron-app/src/renderer/src/pages/Usuarios/index.jsx
```

### Para Agregar Ruta
```
electron-app/src/renderer/src/App.jsx
```

### Para Cambiar Backend de Vendedores
```
electron-app/src/main/ipc/vendedores.js
```

### Para Cambiar Backend de Usuarios
```
electron-app/src/main/ipc/usuarios.js
```

### Para Ver Base de Datos
```
electron-app/src/main/database/connection.js
```

### Para Cambiar Permisos
```
electron-app/src/renderer/src/context/AuthContext.jsx
electron-app/src/main/database/connection.js (roles definition)
```

### Para Cambiar API Expuesta
```
electron-app/src/preload/preload.js
```

### Para Cambiar Layout/Menú
```
electron-app/src/renderer/src/components/layout/ClienteLayout.jsx
```

---

## 📊 Mapa de Dependencias

### Vendedores.jsx depende de:
```
pages/Vendedores/index.jsx
├── context/AuthContext.jsx (useAuth hook)
├── preload.js (window.api.vendedores)
│   └── main/ipc/vendedores.js (backend handlers)
│       └── database/connection.js (tabla vendedores)
├── components/layout/ClienteLayout.jsx (layout)
└── utils/validaciones.js (formateo, validación)
```

### Usuarios.jsx depende de:
```
pages/Usuarios/index.jsx
├── context/AuthContext.jsx (useAuth hook con permisos)
├── preload.js (window.api.usuarios, window.api.roles)
│   └── main/ipc/usuarios.js (backend handlers)
│       └── database/connection.js (tabla users, roles)
├── components/layout/ClienteLayout.jsx (layout)
└── utils/validaciones.js (formateoRut, etc.)
```

### ClienteLayout.jsx depende de:
```
components/layout/ClienteLayout.jsx
├── context/AuthContext.jsx (canAccessVendedores, canAccessUsuarios, etc.)
├── components/auth/ProtectedRoute.jsx
├── components/auth/PermissionRoute.jsx
└── utils/
```

---

## 🔄 Flujo de Datos - Resumen

```
Usuario en UI
    ↓
Vendedores.jsx / Usuarios.jsx
    ↓
window.api.vendedores.* / window.api.usuarios.*
    ↓
preload.js (puente IPC)
    ↓
main/ipc/vendedores.js / usuarios.js
    ↓
database/connection.js (SQLite query)
    ↓
Respuesta → preload → React Component
    ↓
setState() → Re-render UI
```

---

## 📝 Convenciones de Nomenclatura

### Archivos
- Componentes: `NombreComponente.jsx` (PascalCase)
- Utilidades: `nombre-funcion.js` (kebab-case)
- Base datos: `connection.js` (minúsculas)

### Variables/Funciones
- React: `camelCase` - `handleClick`, `setData`
- IPC handlers: `recurso:accion` - `vendedores:create`
- Estado: `camelCase` - `editingVendedor`, `formData`

### Estructura
- Handlers IPC → `ipcMain.handle('recurso:accion')`
- API Preload → `api.recurso = { accion }`
- Componentes → `path/to/Componente/index.jsx`

---

**Última actualización:** 2026-03-19 ✅
**Documento:** Árbol de Carpetas - Proyecto Frontend

