# 📋 ÍNDICE RÁPIDO - VENDEDORES Y USUARIOS

## 🎯 Respuestas a Tu Consulta

### 1️⃣ ¿Dónde está el componente "Vendedores"?
```
📁 electron-app/src/renderer/src/pages/Vendedores/
   └── index.jsx ← Componente principal

🔗 Ruta web: /cliente/vendedores
📱 Acceso: Menú Principal → Vendedores
```

**Campos disponibles:**
- Nombre, Apellido, Email, Teléfono
- % Comisión, Estado (Activo/Inactivo)

**Operaciones:** CRUD (Crear, Leer, Actualizar, Eliminar)

---

### 2️⃣ Estructura actual de cómo se muestran

| Componente | Ubicación | Responsabilidad |
|-----------|-----------|-----------------|
| **Vendedores/index.jsx** | `pages/Vendedores/` | UI + lógica de formularios |
| **ClienteLayout** | `components/layout/` | Menú y navegación |
| **AuthContext** | `context/` | Permisos y acceso |
| **ipc/vendedores.js** | `main/ipc/` | Backend handlers |

**Flujo de carga:**
1. Usuario presiona menú "Vendedores" 
2. React Router va a `/cliente/vendedores`
3. `Vendedores.jsx` usa `useEffect` para cargar
4. Llamada IPC: `window.api.vendedores.getAll()`
5. Backend consulta tabla `vendedores`
6. Renderiza tabla con datos

---

### 3️⃣ ¿Dónde están los componentes de usuarios?

```
📁 electron-app/src/renderer/src/pages/Usuarios/
   └── index.jsx ← Componente principal

🔗 Ruta web: /cliente/configuracion/usuarios
📱 Acceso: Configuración → Gestión de Usuarios
🔐 Requiere permiso: configuracion.usuarios
```

**Campos disponibles:**
- Email, Contraseña (al crear)
- Nombre, RUT (formateado)
- Rol (dueño/admin/vendedor/contador/cajero)
- Estado (Activo/Inactivo)

---

### 4️⃣ ¿Cómo se relacionan las ventas con usuarios?

#### Estado ACTUAL (Débil)
```
❌ SIN conexión directa:
   - facturas NO tiene vendedor_id
   - facturas NO tiene usuario_id
   - Tabla vendedores es INDEPENDIENTE de users
```

#### Auditoría/Tracking
```
✅ Sí existe:
   - Tabla audit_usuarios → quién hizo qué
   - created_at/updated_at en facturas
   - Pero NO asigna vendedor específico
```

#### Estado FUTURO (Planificado)
```
✅ PRÓXIMO:
   - facturas.vendedor_id → vendedores.id
   - clientes.vendedor_id → vendedores.id
   - Reportes de comisiones por vendedor
```

**Referencia:** [connection.js líneas 615, 634](../../electron-app/src/main/database/connection.js#L615)

---

### 5️⃣ Estructura de rutas y componentes

#### Rutas Principales
```
/login                          → LoginPage
/register                       → RegisterPage
/cliente                        → ClienteDashboard
├── /cliente/vendedores         → Vendedores ⭐
├── /cliente/facturas           → Facturas
├── /cliente/clientes           → Clientes
├── /cliente/productos          → Productos
├── /cliente/caja               → Caja
├── /cliente/pos                → PuntoVenta
├── /cliente/reportes           → Reportes
├── /cliente/guias              → Guías
├── /cliente/configuracion      → EmisorConfig
│   ├── /usuarios               → Usuarios ⭐
│   ├── /cambiar-contrasena     → ChangePassword
│   └── /manual                 → UserManual
└── /cliente/mi-contador        → MiContador
```

#### Estructura General React
```
App.jsx
├── BrowserRouter + Routes
├── AuthProvider (Context)
└── Route definitions:
    ├── Public routes (auth)
    ├── Protected routes (ProtectedRoute + PermissionRoute)
    └── Layouts (ClienteLayout, ContadorLayout)
```

---

## 🔗 Tabla de Integración: APIs IPC

### API: vendedores
```javascript
window.api.vendedores = {
  create(data)           // Crear
  getAll()               // Listar todos
  getActivos()           // Solo activos
  getById(id)            // Por ID
  update({id, vendedor}) // Actualizar
  delete(id)             // Eliminar
}
```

**Handlers Backend:**
```
vendedores:create      → INSERT
vendedores:getAll      → SELECT * 
vendedores:getById     → SELECT WHERE
vendedores:update      → UPDATE
vendedores:delete      → UPDATE (activo=0)
```

### API: usuarios
```javascript
window.api.usuarios = {
  getAll()                         // Listar usuarios
  getById(id)                      // Por ID
  create(data)                     // Crear
  update({id, ...data})            // Actualizar
  changePassword(data)             // Cambiar contraseña
  toggleActive(data)               // Activar/desactivar
  delete(data)                     // Eliminar
  checkPermission(data)            // Verificar permiso
  getPermisos(userId)              // Obtener permisos
  getAuditLog(userId)              // Log de auditoría
  updateLastAccess(userId)         // Actualizar último acceso
  syncTrabajadoresPendientes()     // Sync SII
}
```

---

## 🗄️ Tablas Base de Datos Relevantes

### Tabla: users
```sql
id INTEGER PRIMARY KEY
email TEXT UNIQUE NOT NULL
password_hash TEXT NOT NULL
rut TEXT
nombre TEXT
rol TEXT DEFAULT 'vendedor'
permisos TEXT DEFAULT '{}' -- JSON
activo INTEGER DEFAULT 1
```

**Roles predefinidos:**
- `dueño` - Acceso total
- `administrador` - Casi total
- `vendedor` - Crear ventas
- `contador` - Solo lectura
- `cajero` - Solo caja

### Tabla: vendedores
```sql
id INTEGER PRIMARY KEY
nombre TEXT NOT NULL
apellido TEXT NOT NULL
email TEXT
telefono TEXT
comision REAL DEFAULT 0
activo INTEGER DEFAULT 1
```

### Tabla: facturas (ACTUAL)
```sql
id, folio, cliente_id
fecha, total, estado
created_at, updated_at
-- ❌ Sin vendedor_id
```

### Tabla: roles
```sql
id INTEGER PRIMARY KEY
nombre TEXT UNIQUE     -- dueño, admin, etc.
permisos TEXT         -- JSON con permisos
```

---

## 🔐 Permisos y Control de Acceso

### Función canAccessVendedores()
```javascript
// En: context/AuthContext.jsx
const canAccessVendedores = () => {
  return hasPermission('vendedores', 'ver') || 
         hasPermission('vendedores', 'crear');
};

// Uso en componentes:
const { canAccessVendedores } = useAuth();
if (!canAccessVendedores()) return <AccessDenied />;
```

### Función canAccessUsuarios()
```javascript
// Requiere:
hasPermission('configuracion', 'usuarios')

// Solo accesible si:
- Usuario es dueño O
- Usuario es administrador O
- Tiene permiso específico en el rol
```

### Permisos por Rol - Vendedores
| Rol | Ver | Crear | Editar | Eliminar |
|-----|-----|-------|--------|----------|
| dueño | ✅ | ✅ | ✅ | ✅ |
| administrador | ✅ | ✅ | ✅ | ❌ |
| vendedor | ✅ | ❌ | ❌ | ❌ |
| contador | ✅ | ❌ | ❌ | ❌ |
| cajero | ✅ | ❌ | ❌ | ❌ |

### Permisos por Rol - Usuarios
| Rol | Ver | Crear | Editar | Eliminar |
|-----|-----|-------|--------|----------|
| dueño | ✅ | ✅ | ✅ | ✅ |
| administrador | ✅ | ❌ | ❌ | ❌ |
| vendedor | ❌ | ❌ | ❌ | ❌ |
| contador | ❌ | ❌ | ❌ | ❌ |
| cajero | ❌ | ❌ | ❌ | ❌ |

---

## 📚 Archivos Clave - Línea de Referencia

| Concepto | Archivo | Línea | Descripción |
|----------|---------|-------|-------------|
| **UI Vendedores** | `pages/Vendedores/index.jsx` | - | Componente React |
| **UI Usuarios** | `pages/Usuarios/index.jsx` | - | Componente React |
| **Ruta Vendedores** | `App.jsx` | 297-302 | Definición de ruta |
| **Ruta Usuarios** | `App.jsx` | 482-489 | Definición de ruta |
| **IPC Vendedores Backend** | `ipc/vendedores.js` | - | Handlers del main |
| **IPC Usuarios Backend** | `ipc/usuarios.js` | - | Handlers del main |
| **Preload Vendedores** | `preload/preload.js` | 64-71 | API expuesta |
| **Preload Usuarios** | `preload/preload.js` | 18-31 | API expuesta |
| **Auth & Permisos** | `context/AuthContext.jsx` | - | Sistema de auth |
| **Tabla users** | `database/connection.js` | 50-60 | Estructura BD |
| **Tabla vendedores** | `database/connection.js` | 453-460 | Estructura BD |
| **Tabla roles** | `database/connection.js` | 150+ | Estructura BD |
| **TODO conexiones** | `database/connection.js` | 615, 634 | Improvements |

---

## 🎯 Quick Reference - Permisos

```javascript
// Verificar permiso en componente:
const { hasPermission, canAccessVendedores } = useAuth();

// Vendedores
if (canAccessVendedores()) {
  // Renderizar módulo vendedores
}

// Usuarios (más restrictivo)
const { canAccessUsuarios } = useAuth();
if (canAccessUsuarios?.()) {
  // Renderizar gestión de usuarios
}

// O verificar permisos específicos:
if (hasPermission('vendedores', 'crear')) {
  // Mostrar botón crear vendedor
}

if (hasPermission('configuracion', 'usuarios')) {
  // Mostrar sección usuarios
}
```

---

## 🚀 Checklist Para Próximas Mejoras

### Conectar Vendedores ↔ Facturas
- [ ] Agregar `vendedor_id` a tabla `facturas`
- [ ] FK: `FOREIGN KEY (vendedor_id) REFERENCES vendedores(id)`
- [ ] UI: Dropdown de vendedores en `FormularioFactura.jsx`
- [ ] Cargar con: `window.api.vendedores.getActivos()`
- [ ] Backend: Guardar `vendedor_id` en crear factura
- [ ] Test: Verificar que se guarda y recupera correctamente

### Conectar Vendedores ↔ Clientes
- [ ] Agregar `vendedor_id` a tabla `clientes`
- [ ] UI: Asignar vendedor al crear cliente
- [ ] Reportes: filtrar clientes por vendedor

### Comisiones Automáticas
- [ ] Cálculo: (total factura) × (comision % / 100)
- [ ] Tabla: `comisiones` con estado (pendiente, pagada)
- [ ] Reporte: Comisiones por vendedor por período
- [ ] Pago: Interfaz para registrar pago de comisiones

### Sincronización SII
- [ ] Ya existe: `window.api.usuarios.syncTrabajadoresPendientes()`
- [ ] Documentar: Cómo conecta trabajadores SII con usuarios
- [ ] Test: Verificar que sincronice correctamente

---

## 📞 Información de Contacto

**Documento:** Índice Rápido - Vendedores y Usuarios
**Fecha:** 2026-03-19
**Estado:** ✅ Completo

**Documentos relacionados:**
1. [MAPA_FRONTEND_VENDEDORES.md](MAPA_FRONTEND_VENDEDORES.md) - Mapa detallado
2. [RESUMEN_VISUAL_VENDEDORES.md](RESUMEN_VISUAL_VENDEDORES.md) - Resumen con diagramas

---

## 🔍 Búsqueda Rápida

| Necesito... | Ir a... |
|-----------|---------|
| Ver componente Vendedores | `pages/Vendedores/index.jsx` |
| Ver componente Usuarios | `pages/Usuarios/index.jsx` |
| Cambiar ruta /cliente/vendedores | `App.jsx` línea 297 |
| Cambiar permiso requerido | `App.jsx` + `AuthContext.jsx` |
| Agregar nuevo campo a vendedor | `ipc/vendedores.js` + DB schema |
| Cambiar permisos rol | `database/connection.js` línea 150+ |
| Ver API disponible | `preload/preload.js` |
| Entender flujo de auth | `context/AuthContext.jsx` |
| Ver estructura BD | `database/connection.js` |

