# 🗺️ MAPA DEL PROYECTO FRONTEND - GESTIÓN DE VENDEDORES Y USUARIOS

## 📋 RESUMEN EJECUTIVO

Este documento proporciona un mapa completo de la estructura del frontend (React + Electron) enfocado en cómo se relacionan **Vendedores**, **Usuarios** y **Ventas** (Facturas) en el sistema.

---

## 📁 ESTRUCTURA GENERAL DEL PROYECTO

```
electron-app/src/
├── main/                    # Backend Electron (Node.js)
│   ├── main.js             # Punto de entrada principal
│   ├── ipc/                # Manejadores de eventos IPC
│   ├── database/           # Conexión y esquema DB
│   ├── services/           # Lógica de negocio
│   └── menu.js             # Configuración del menú
│
├── renderer/               # Frontend React
│   └── src/
│       ├── App.jsx         # Configuración de rutas
│       ├── pages/          # Componentes de página
│       ├── components/     # Componentes reutilizables
│       ├── context/        # Context API (AuthContext)
│       ├── utils/          # Funciones auxiliares
│       ├── styles/         # Estilos
│       └── data/           # Datos estáticos
│
└── preload/
    └── preload.js          # API expuesta del main al renderer
```

---

## 🔑 COMPONENTES PRINCIPALES DEL FRONTEND

### 1️⃣ PÁGINA: VENDEDORES
**Ubicación:** [electron-app/src/renderer/src/pages/Vendedores/index.jsx](../../electron-app/src/renderer/src/pages/Vendedores/index.jsx)

#### Características:
- ✅ CRUD completo de vendedores
- ✅ Campos: nombre, apellido, email, teléfono, comisión, estado (activo/inactivo)
- ✅ Vistas: Lista y Formulario
- ✅ Soporte para cálculo de comisiones

#### Estructura del Estado:
```javascript
{
  view: 'list' | 'form',
  vendedores: Array<Vendedor>,
  editingVendedor: Vendedor | null,
  formData: {
    nombre: String,
    apellido: String,
    email: String,
    telefono: String,
    comision: Number,
    activo: 0 | 1
  }
}
```

#### Funciones Principales:
| Función | Descripción |
|---------|-------------|
| `loadVendedores()` | Carga todos los vendedores (`window.api.vendedores.getAll()`) |
| `handleSubmit()` | Guarda o actualiza vendedor |
| `handleEdit()` | Inicia edición de un vendedor |
| `handleDelete()` | Elimina/desactiva un vendedor |

#### Ruta de Acceso:
```
/cliente/vendedores
```

#### Permisos Requeridos:
```
- vendedores.ver (para listar)
- vendedores.crear (para crear)
- vendedores.editar (para editar)
- vendedores.eliminar (para eliminar)
```

---

### 2️⃣ PÁGINA: USUARIOS
**Ubicación:** [electron-app/src/renderer/src/pages/Usuarios/index.jsx](../../electron-app/src/renderer/src/pages/Usuarios/index.jsx)

#### Características:
- ✅ CRUD completo de usuarios del sistema
- ✅ Campos: email, contraseña, nombre, RUT, rol, estado (activo/inactivo)
- ✅ Gestión de roles (dueño, administrador, vendedor, cajero, contador)
- ✅ Gestión de permisos por rol
- ✅ Vistas: Lista y Formulario
- ✅ Soporte para sincronización de trabajadores

#### Estructura del Estado:
```javascript
{
  view: 'list' | 'form',
  usuarios: Array<Usuario>,
  roles: Array<Rol>,
  editingUsuario: Usuario | null,
  formData: {
    email: String,
    password: String,
    nombre: String,
    rut: String (formateado),
    rol: String,
    activo: 0 | 1
  }
}
```

#### Funciones Principales:
| Función | Descripción |
|---------|-------------|
| `loadData()` | Carga usuarios y roles disponibles |
| `handleSubmit()` | Crea o actualiza usuario |
| `handleToggleActive()` | Activa/desactiva usuario |
| `handleDelete()` | Elimina usuario |

#### Ruta de Acceso:
```
/cliente/configuracion/usuarios
```

#### Permisos Requeridos:
```
- configuracion.usuarios (para acceder)
```

#### Roles Disponibles en el Sistema:
| Rol | Descripción | Permisos Principales |
|-----|-------------|-------------------|
| **dueño** | Acceso total al sistema | Todos los permisos (CRUD completo) |
| **administrador** | Gestión completa excepto eliminaciones | Nearly todos excepto eliminar ventas |
| **vendedor** | Crear ventas y gestionar clientes | Ver/Crear facturas, clientes; Sin eliminar |
| **contador** | Solo lectura y reportes | Ver facturas, reportes, exportar |
| **cajero** | Gestión de caja | Acceso a caja, pagar, registro de pagos |

---

## 🔗 RELACIÓN: VENDEDORES ↔ USUARIOS ↔ VENTAS

### Diagrama de Relaciones
```
USUARIOS (users tabla)
├── Todos tienen rol (dueño, admin, vendedor, etc.)
├── Un vendedor (usuario) puede estar asociado a ventas
└── Por ahora: NO hay FK directa vendedor_id en users

VENDEDORES (vendedores tabla)
├── Tabla independiente: nombre, apellido, email, telefono, comision
├── NO tiene usuario_id (aún)
└── Pendiente: Conectar con sistema de usuarios

FACTURAS (facturas tabla)
├── Tiene cliente_id → clientes(id)
├── PENDIENTE: vendedor_id → vendedores(id)  [en roadmap]
└── Actualmente: Sin conexión directa a vendedor atribuido
```

### ¿Cómo se Relacionan Actualmente?
**Relación Débil (sin FK):**
- Un vendedor en la tabla `vendedores` es un recurso independiente
- Las facturas pueden incluir información del vendedor que las creó (auditoria)
- Los usuarios tienen roles, pero no hay conexión directa a `vendedores`

**Conexiones Pendientes (TODO):**
```sql
-- Agregar en migration:
ALTER TABLE clientes ADD COLUMN vendedor_id INTEGER;
ALTER TABLE facturas ADD COLUMN vendedor_id INTEGER;
-- Luego agregar FOREIGN KEYs apropiadas
```

Ver: [connection.js línea 615 y 634](../../electron-app/src/main/database/connection.js#L615)

---

## 🛣️ ESTRUCTURA DE RUTAS DEL FRONTEND

### Layout Principal: `ClienteLayout`
**Ubicación:** [components/layout/ClienteLayout.jsx](../../electron-app/src/renderer/src/components/layout/ClienteLayout.jsx)

Proporciona la navegación principal y gestiona módulos habilitados.

#### Rutas Principales (Cliente):

| Ruta | Componente | Módulo | Permisos |
|------|-----------|--------|---------|
| `/login` | LoginPage | Auth | Público |
| `/register` | RegisterPage | Auth | Público |
| `/cliente` | ClienteDashboard | Dashboard | empresa, persona_natural |
| `/cliente/clientes` | Clientes | Clientes | clientes.ver |
| `/cliente/productos` | Productos | Productos | productos.ver |
| **`/cliente/vendedores`** | Vendedores | Vendedores | vendedores.ver |
| `/cliente/facturas` | Facturas | Facturas | facturas.ver |
| `/cliente/guias` | Guias | Guías | - |
| `/cliente/caja` | Caja | Caja | caja.acceder |
| `/cliente/pos` | PuntoVenta | POS | - |
| `/cliente/reportes` | Reportes | Reportes | reportes.ver |
| **`/cliente/configuracion/usuarios`** | Usuarios | Configuración | configuracion.usuarios |
| `/cliente/configuracion` | EmisorConfig | Configuración | - |

### Layout Contador: `ContadorLayout`
Para la vista del contador (solo lectura, consolidación de empresas).

---

## 📡 API IPC (Comunicación Main ↔ Renderer)

### Vendedores API
**Backend:** [main/ipc/vendedores.js](../../electron-app/src/main/ipc/vendedores.js)
**Preload:** [preload/preload.js (línea 64-71)](../../electron-app/src/preload/preload.js#L64)

```javascript
window.api.vendedores = {
  create(data)           // Crear nuevo vendedor
  getAll()               // Obtener todos los vendedores
  getActivos()           // Obtener solo activos
  getById(id)            // Obtener por ID
  update({id, vendedor}) // Actualizar vendedor
  delete(id)             // Eliminar/desactivar vendedor
}
```

#### Handlers IPC:
| Handler | Datos Entrada | Retorna | Descripción |
|---------|---------------|---------|-------------|
| `vendedores:create` | `{nombre, apellido, email, telefono, comision, activo}` | `{success, data \| error}` | Crea vendedor en BD |
| `vendedores:getAll` | - | `{success, data[]}` | Lista todos |
| `vendedores:getActivos` | - | `{success, data[]}` | Solo activos |
| `vendedores:getById` | `id` | `{success, data \| error}` | Por ID |
| `vendedores:update` | `{id, vendedor}` | `{success, data \| error}` | Actualiza |
| `vendedores:delete` | `id` | `{success, message \| error}` | Desactiva/Elimina |

---

### Usuarios API
**Backend:** [main/ipc/usuarios.js](../../electron-app/src/main/ipc/usuarios.js)
**Preload:** [preload/preload.js (línea 18-31)](../../electron-app/src/preload/preload.js#L18)

```javascript
window.api.usuarios = {
  getAll()                      // Obtener todos
  getById(id)                   // Por ID
  create(data)                  // Crear usuario
  update({id, ...data})         // Actualizar
  changePassword(data)          // Cambiar contraseña
  toggleActive(data)            // Activar/desactivar
  delete(data)                  // Eliminar
  checkPermission(data)         // Verificar permiso
  getPermisos(userId)           // Obtener permisos de usuario
  getAuditLog(userId)           // Auditoría del usuario
  updateLastAccess(userId)      // Actualizar último acceso
  syncTrabajadoresPendientes()  // Sincronizar trabajadores SII
}
```

#### Handlers IPC Principales:
| Handler | Descripción |
|---------|-------------|
| `usuarios:getAll` | Obtiene usuarios con campos: id, email, rut, nombre, rol, permisos, activo, created_at |
| `usuarios:create` | Crear nuevo usuario con hash de contraseña |
| `usuarios:update` | Actualizar usuario (email, nombre, rut, rol, activo) |
| `usuarios:delete` | Eliminar usuario de la BD |
| `usuarios:toggleActive` | Activar/desactivar usuario |
| `usuarios:syncTrabajadoresPendientes` | Sincronizar con SII trabajadores históricos |

---

## 🔐 SISTEMA DE PERMISOS (AuthContext)

**Ubicación:** [context/AuthContext.jsx](../../electron-app/src/renderer/src/context/AuthContext.jsx)

### Funciones de Verificación de Acceso:
```javascript
// En cualquier componente:
const { hasPermission, canAccessVendedores, user } = useAuth();

// Verificar permiso específico:
hasPermission('vendedores', 'crear')  // true/false

// Verificar módulo:
canAccessVendedores()   // true/false
```

### Permisos Relacionados a Vendedores:
```json
{
  "vendedores": {
    "crear": boolean,
    "ver": boolean,
    "editar": boolean,
    "eliminar": boolean
  },
  "configuracion": {
    "usuarios": boolean
  }
}
```

### Componentes de Protección:
- **ProtectedRoute**: Verifica rol requerido
- **PermissionRoute**: Verifica permiso específico

Ejemplo de uso:
```jsx
<Route path="/cliente/vendedores" element={
  <ProtectedRoute requiredRole={['empresa', 'persona_natural']}>
    <PermissionRoute requiredPermission="vendedores">
      <ClienteLayout>
        <Vendedores />
      </ClienteLayout>
    </PermissionRoute>
  </ProtectedRoute>
} />
```

---

## 📊 BASE DE DATOS - TABLAS RELACIONADAS

### Tabla: `users`
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  rut TEXT,
  nombre TEXT,
  rol TEXT DEFAULT 'vendedor',      -- dueño, administrador, vendedor, etc.
  permisos TEXT DEFAULT '{}',       -- JSON con permisos específicos
  activo INTEGER DEFAULT 1,
  requiere_autorizacion INTEGER DEFAULT 0,
  ultimo_acceso TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
)
```

### Tabla: `vendedores`
```sql
CREATE TABLE vendedores (
  id INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  email TEXT,
  telefono TEXT,
  comision REAL DEFAULT 0,
  activo INTEGER DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
)
```

### Tabla: `facturas`
```sql
CREATE TABLE facturas (
  id INTEGER PRIMARY KEY,
  folio INTEGER UNIQUE NOT NULL,
  tipo_documento INTEGER DEFAULT 33,
  cliente_id INTEGER NOT NULL,
  fecha TEXT NOT NULL,
  forma_pago TEXT DEFAULT 'contado',
  subtotal REAL NOT NULL,
  iva REAL NOT NULL,
  total REAL NOT NULL,
  estado TEXT DEFAULT 'pendiente',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  -- PENDIENTE (en roadmap):
  -- vendedor_id INTEGER,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id)
)
```

### Tabla: `roles`
```sql
CREATE TABLE roles (
  id INTEGER PRIMARY KEY,
  nombre TEXT UNIQUE NOT NULL,      -- dueño, administrador, vendedor, etc.
  descripcion TEXT,
  permisos TEXT NOT NULL,           -- JSON con permisos por rol
  es_modificable INTEGER DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
)
```

### ⚠️ CONEXIONES PENDIENTES (TODO):
Véase: [connection.js líneas 615-634](../../electron-app/src/main/database/connection.js#L615)
```
- clientes.vendedor_id (INTEGER) → referencia a vendedores.id
- facturas.vendedor_id (INTEGER) → referencia a vendedores.id
```

---

## 🎯 COMPONENTES Y SERVICIOS FRONTEND

### Estructura de Componentes
```
components/
├── layout/
│   ├── ClienteLayout.jsx       # Layout principal con nav
│   ├── ContadorLayout.jsx      # Layout para contador
│   └── [otros layouts]
├── auth/
│   ├── ProtectedRoute.jsx      # Protección por rol
│   └── PermissionRoute.jsx     # Protección por permiso
├── facturas/
│   ├── FormularioFactura.jsx   # Formulario para crear/editar
│   └── [componentes facturas]
├── permissions/                # Componentes de permisos
└── [otros componentes específicos]
```

### Páginas (Pages)
```
pages/
├── Vendedores/
│   └── index.jsx               # ← Gestión de vendedores
├── Usuarios/
│   └── index.jsx               # ← Gestión de usuarios
├── Facturas/
│   └── index.jsx               # Gestión de facturas
├── Clientes/
│   └── index.jsx               # Gestión de clientes
├── Productos/
│   └── index.jsx               # Gestión de productos
├── Reportes/
│   └── index.jsx               # Reportes
├── Configuracion/
│   ├── ChangePassword.jsx
│   ├── EmisorConfig.jsx
│   ├── Folios.jsx
│   ├── MiContador.jsx
│   ├── UserManual.jsx
│   └── [otras configs]
├── Auth/
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   └── RoleSelectionPage.jsx
├── Caja/
├── PuntoVenta/
├── Guias/
├── Boletas/
├── Compras/
└── [otras páginas]
```

---

## 📱 FLUJO DE DATOS: Crear Vendedor

### 1. Usuario interactúa con UI
```
Vendedores.jsx → setView('form') → muestra formulario
```

### 2. Usuario completa datos y envía
```javascript
handleSubmit() → validar → window.api.vendedores.create(formData)
```

### 3. IPC llama al main process
```javascript
preload.js: vendedores.create() 
→ ipcRenderer.invoke('vendedores:create', vendedor)
```

### 4. Backend procesa (main/ipc/vendedores.js)
```javascript
ipcMain.handle('vendedores:create', async (event, vendedor) => {
  // Validación
  // INSERT en tabla vendedores
  // Retorna {success: true, data: {id, ...}}
})
```

### 5. BD se actualiza
```sql
INSERT INTO vendedores (nombre, apellido, email, telefono, comision, activo, created_at, updated_at)
VALUES (?, ?, ?, ?, ?, ?, ?, ?)
```

### 6. Respuesta regresa a componente
```javascript
if (result.success) {
  loadVendedores()  // Recarga lista
  handleCancel()    // Vuelve a vista lista
}
```

---

## 🔄 FLUJO DE DATOS: Login Usuario

### 1. Usuario ingresa credenciales
```
LoginPage.jsx → handleLogin() → window.api.auth.login({email, password})
```

### 2. Backend valida credenciales
```javascript
// main/ipc/auth.js
ipcMain.handle('auth:login', async (event, { email, password }) => {
  // Buscar usuario por email
  // Verificar password_hash con bcrypt
  // Cargar permisos del rol
  // Retornar user + permisos
})
```

### 3. Frontend guarda estado
```javascript
// AuthContext.jsx
setUser(result.user)
setPermisos({rol: user.rol, permisos: user.permisos})
```

### 4. Componentes pueden usar
```javascript
const { user, hasPermission, canAccessVendedores } = useAuth()
```

---

## 🎨 VALIDACIONES Y FORMATEO

### Validaciones en Frontend (Usuarios)
```javascript
// email - debe tener @
// password - mínimo 8 caracteres (solo al crear)
// rut - se formatea con formatearRut()
// rol - selección de roles disponibles
```

### Validaciones en Frontend (Vendedores)
- nombre - requerido
- apellido - requerido
- email - opcional pero validado si se ingresa
- teléfono - opcional
- comisión - número, >= 0

---

## 🚀 ACCIONES PRÓXIMAS (TODO)

### 1. Conectar Vendedores ↔ Usuarios
- [ ] Agregar `usuario_id` a tabla `vendedores`
- [ ] O agregar FK `vendedor_id` a tabla `users`
- [ ] Definir relación: Un usuario puede ser múltiples vendedores? O 1:1 o N:1?

### 2. Conectar Vendedores ↔ Facturas
- [ ] Agregar `vendedor_id` a tabla `facturas`
- [ ] Agregar `vendedor_id` a tabla `clientes`
- [ ] UI para asignar vendedor al crear factura
- [ ] Reportes por vendedor (comisiones, ventas, etc.)

### 3. Comisiones
- [ ] Cálculo automático de comisiones por venta
- [ ] Estados de comisión (pendiente, pagada, etc.)
- [ ] Reporte de comisiones

### 4. Sincronización SII
- [ ] Conectar trabajadores SII con usuarios del sistema
- [ ] Ya existe método: `window.api.usuarios.syncTrabajadoresPendientes()`

---

## 📚 REFERENCIAS CLAVE

| Archivo | Línea | Descripción |
|---------|-------|-------------|
| [App.jsx](../../electron-app/src/renderer/src/App.jsx) | 297-302 | Ruta `/cliente/vendedores` |
| [App.jsx](../../electron-app/src/renderer/src/App.jsx) | 482-489 | Ruta `/cliente/configuracion/usuarios` |
| [Vendedores/index.jsx](../../electron-app/src/renderer/src/pages/Vendedores/index.jsx) | - | Componente principal de vendedores |
| [Usuarios/index.jsx](../../electron-app/src/renderer/src/pages/Usuarios/index.jsx) | - | Componente principal de usuarios |
| [AuthContext.jsx](../../electron-app/src/renderer/src/context/AuthContext.jsx) | 229-230 | Función `canAccessVendedores()` |
| [main.js](../../electron-app/src/main/main.js) | 14, 85 | Registro de handlers IPC |
| [vendedores.js](../../electron-app/src/main/ipc/vendedores.js) | - | Backend handlers vendedores |
| [usuarios.js](../../electron-app/src/main/ipc/usuarios.js) | - | Backend handlers usuarios |
| [connection.js](../../electron-app/src/main/database/connection.js) | 50-60 | Tabla `users` |
| [connection.js](../../electron-app/src/main/database/connection.js) | 453-460 | Tabla `vendedores` |
| [connection.js](../../electron-app/src/main/database/connection.js) | 615, 634 | TODOs para conexiones |
| [ClienteLayout.jsx](../../electron-app/src/renderer/src/components/layout/ClienteLayout.jsx) | 177, 202 | Menú con vendedores |

---

## 📞 CONTACTO Y DUDAS

**Última actualización:** 2026-03-19
**Responsable:** Sistema de Facturación y Inventario
**Estado:** Mapa completo ✅ - Conexiones a implementar ⏳

