# 🎯 RESUMEN VISUAL - VENDEDORES Y USUARIOS

## 📊 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                    APLICACIÓN ELECTRON (Escritorio)             │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ RENDERER (React Frontend)                                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  App.jsx (React Router)                                          │
│  ├── /login → LoginPage                                          │
│  ├── /register → RegisterPage                                    │
│  ├── /cliente → ClienteDashboard (con ClienteLayout)             │
│  ├── /cliente/vendedores → Vendedores ← ⭐ VENDEDORES            │
│  ├── /cliente/configuracion/usuarios → Usuarios ← ⭐ USUARIOS    │
│  ├── /cliente/facturas → Facturas                                │
│  └── [otras rutas...]                                            │
│                                                                   │
│  AuthContext.jsx (Gestión de Auth y Permisos)                   │
│  ├── user: {id, email, nombre, rol}                              │
│  ├── permisos: {vendedores, configuracion, etc.}                │
│  └── canAccessVendedores() → true/false                          │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
           ↕ IPC Communication (Preload API)
       window.api.vendedores.*
       window.api.usuarios.*
┌──────────────────────────────────────────────────────────────────┐
│ MAIN (Node.js Backend)                                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  main.js (Inicializador)                                         │
│  ├── registerVendedoresHandlers() [line 14, 85]                 │
│  └── registerUsuariosHandlers()                                  │
│                                                                   │
│  ipc/vendedores.js ← ⭐ HANDLERS DE VENDEDORES                  │
│  ├── vendedores:create                                           │
│  ├── vendedores:getAll                                           │
│  ├── vendedores:getById                                          │
│  ├── vendedores:update                                           │
│  └── vendedores:delete                                           │
│                                                                   │
│  ipc/usuarios.js ← ⭐ HANDLERS DE USUARIOS                      │
│  ├── usuarios:getAll                                             │
│  ├── usuarios:create                                             │
│  ├── usuarios:update                                             │
│  ├── usuarios:delete                                             │
│  └── usuarios:syncTrabajadoresPendientes                         │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
           ↕ Database Queries
┌──────────────────────────────────────────────────────────────────┐
│ DATABASE (SQLite3) - facturacion.db                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  users ← ⭐ USUARIOS DEL SISTEMA                                │
│  ├── id, email, password_hash                                    │
│  ├── rol (dueño, admin, vendedor, cajero, contador)             │
│  ├── permisos {JSON}                                             │
│  └── nombre, rut, activo, created_at                            │
│                                                                   │
│  vendedores ← ⭐ VENDEDORES                                     │
│  ├── id, nombre, apellido                                        │
│  ├── email, telefono                                             │
│  ├── comision (%)                                                │
│  └── activo, created_at                                          │
│                                                                   │
│  roles                                                            │
│  ├── dueño → todos los permisos                                 │
│  ├── administrador → casi todos                                 │
│  ├── vendedor → crear facturas, gestionar clientes              │
│  ├── contador → solo lectura                                    │
│  └── cajero → solo caja                                         │
│                                                                   │
│  facturas [PENDIENTE: agregar vendedor_id]                      │
│  ├── id, folio, cliente_id                                       │
│  ├── fecha, total, estado                                        │
│  └── ❌ vendedor_id (TODO)                                       │
│                                                                   │
│  clientes [PENDIENTE: agregar vendedor_id]                      │
│  ├── id, rut, razon_social                                       │
│  └── ❌ vendedor_id (TODO)                                       │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔀 Relaciones Entre Tablas (Actual vs. Futuro)

### Estado ACTUAL
```
users (USUARIOS DEL SISTEMA)
├── rol: dueño, admin, vendedor, etc.
└── ❌ NO tiene referencia a tabla vendedores

vendedores (VENDEDORES/COMISIONISTAS)
├── nombre, apellido, email, comision
└── ❌ NO tiene referencia a tabla users

facturas
├── cliente_id → clientes
├── ❌ NO tiene vendedor_id
└── ❌ NO sabe quién lo creó (revisión: podría estar en audit)

clientes
└── ❌ NO tiene vendedor_id
```

### Estado FUTURO (x implementar)
```
users
├── id
└── rol: vendedor

↓ (potencial) ↓

vendedores
├── id
├── usuario_id → users (FK)  ← AGREGAR
└── nombre, email, comision

facturas
├── id
├── cliente_id → clientes
└── vendedor_id → vendedores (FK)  ← AGREGAR

clientes
├── id
└── vendedor_id → vendedores (FK)  ← AGREGAR
```

**Referencia:** [connection.js líneas 615 y 634](../../electron-app/src/main/database/connection.js#L615)

---

## 👥 Flujos de Usuario - Vendedores

### Caso 1: Crear Vendedor
```
┌─────────────┐
│ Admin entra │
│ a sistema  │
└──────┬──────┘
       │
       ↓
┌─────────────────────────────────────┐
│ Va a: /cliente/vendedores           │
│ [Requiere permiso: vendedores.ver]  │
└──────┬──────────────────────────────┘
       │
       ↓
┌─────────────────────────────────────┐
│ Ve lista de vendedores             │
│ Presiona: "+ CREAR VENDEDOR"        │
│ [Requiere permiso: vendedores.crear]│
└──────┬──────────────────────────────┘
       │
       ↓
┌─────────────────────────────────────┐
│ Abre formulario                     │
│ Ingresa:                            │
│ • Nombre                            │
│ • Apellido                          │
│ • Email                             │
│ • Teléfono                          │
│ • % Comisión                        │
│ • Activo: ☑                         │
└──────┬──────────────────────────────┘
       │
       ↓ Presiona "GUARDAR"
┌─────────────────────────────────────┐
│ Llamada IPC:                        │
│ window.api.vendedores.create(data)  │
└──────┬──────────────────────────────┘
       │
       ↓ preload.js → main.js
┌─────────────────────────────────────┐
│ ipcMain.handle('vendedores:create') │
│ • Recibe datos                      │
│ • Valida                            │
│ • INSERT en vendedores              │
│ • Retorna {success: true, id: 123}  │
└──────┬──────────────────────────────┘
       │
       ↓ Respuesta al renderer
┌─────────────────────────────────────┐
│ Vendedores.jsx:                     │
│ • Recarga lista (loadVendedores)    │
│ • Vuelve a vista "list"             │
│ • Muestra nuevo vendedor en tabla   │
│ ✅ ÉXITO                             │
└─────────────────────────────────────┘
```

### Caso 2: Editar Vendedor
```
[Similar al anterior, pero]
↓
handleEdit(vendedor)
• Carga datos en formData
• Setea editingVendedor
• Abre formulario

[Modifica campos]
↓
window.api.vendedores.update({id: 123, vendedor: {...}})
↓
UPDATE vendedores SET ... WHERE id = 123
↓
✅ Actualización exitosa
```

### Caso 3: Eliminar Vendedor
```
[En tabla de vendedores]
↓
Presiona botón "🗑️ ELIMINAR" next to vendedor
↓
confirm(`¿Seguro de eliminar "${nombre} ${apellido}"?`)
↓
window.api.vendedores.delete(id)
↓
UPDATE vendedores SET activo = 0 WHERE id = 123
[Soft delete - marca como inactivo, no elimina]
↓
✅ Vendedor desactivado
```

---

## 👤 Flujos de Usuario - Usuarios

### Caso 1: Crear Usuario (Solo Dueño/Admin)
```
┌─────────────┐
│ Dueño entra │
│ a sistema  │
└──────┬──────┘
       │
       ↓
┌──────────────────────────────────────────┐
│ Va a: /cliente/configuracion/usuarios    │
│ [Verificación: canAccessUsuarios() = true│
│  Requiere rol dueño o admin + permiso]   │
└──────┬───────────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────────┐
│ Ve lista de usuarios                     │
│ Presiona: "+ CREAR USUARIO"              │
└──────┬───────────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────────┐
│ Abre formulario                          │
│ Ingresa:                                 │
│ • Email (ej: juan@empresa.com)           │
│ • Contraseña (min 8 caracteres)          │
│ • Nombre completo                        │
│ • RUT (formateado: XX.XXX.XXX-X)         │
│ • Rol: [Dropdown: dueño, admin,...]      │
│ • Activo: ☑                              │
└──────┬───────────────────────────────────┘
       │
       ↓ Validaciones:
    [✓ email válido]
    [✓ password >= 8 chars]
    [✓ RUT formateado]
    [✓ Rol seleccionado]
       │
       ↓ Presiona "GUARDAR"
┌──────────────────────────────────────────┐
│ window.api.usuarios.create(data)         │
│ • Hash password con bcrypt               │
│ • INSERT en tabla users                  │
│ • Asigna permisos según rol              │
└──────┬───────────────────────────────────┘
       │ Retorna {success: true, id: 45}
       ↓
┌──────────────────────────────────────────┐
│ Lista se recarga                         │
│ Nuevo usuario aparece en tabla           │
│ ✅ ÉXITO - usuario creado                 │
└──────────────────────────────────────────┘
```

### Roles y Permisos Predefinidos
```
DUEÑO
├── Vendedores: crear ✅ | ver ✅ | editar ✅ | eliminar ✅
├── Usuarios: crear ✅ | ver ✅ | editar ✅ | eliminar ✅
├── Facturas: crear ✅ | ver ✅ | editar ✅ | eliminar ✅
└── Todo acceso ✅

ADMINISTRADOR
├── Vendedores: crear ✅ | ver ✅ | editar ✅ | eliminar ❌
├── Usuarios: ver ✅ | editar ❌
├── Facturas: crear ✅ | ver ✅ | editar ✅ | eliminar ❌
└── Casi todo acceso ✅

VENDEDOR
├── Vendedores: ver ✅ | crear ❌ | editar ❌ | eliminar ❌
├── Usuarios: ver ✅ solo lista
├── Facturas: crear ✅ | ver ✅ propias | editar ❌ | eliminar ❌
└── Solo venta ✅

CONTADOR
├── Vendedores: ver ✅ solo
├── Usuarios: ❌
├── Facturas: ver ✅ solo lectura
├── Reportes: ver ✅ | exportar ✅
└── Solo análisis ✅

CAJERO
├── Caja: acceder ✅ | abrir ✅ | cerrar ✅
├── Boletas: crear ✅ | ver ✅
├── Otros: ver (solo lectura)
└── Solo pagos ✅
```

---

## 🗂️ Mapa de Archivos (Resumen)

### ⭐ ARCHIVOS CRÍTICOS - VENDEDORES
```
📄 electron-app/src/renderer/src/pages/Vendedores/index.jsx
   └─ Componente UI principal de vendedores

📄 electron-app/src/main/ipc/vendedores.js
   └─ Backend handlers: create, getAll, update, delete, etc.

📄 electron-app/src/preload/preload.js (líneas 64-71)
   └─ API expuesta: window.api.vendedores.*

📄 electron-app/src/renderer/src/App.jsx (líneas 297-302)
   └─ Ruta: /cliente/vendedores con PermissionRoute
```

### ⭐ ARCHIVOS CRÍTICOS - USUARIOS
```
📄 electron-app/src/renderer/src/pages/Usuarios/index.jsx
   └─ Componente UI principal de usuarios

📄 electron-app/src/main/ipc/usuarios.js
   └─ Backend handlers: create, getAll, update, etc.

📄 electron-app/src/preload/preload.js (líneas 18-31)
   └─ API expuesta: window.api.usuarios.*

📄 electron-app/src/renderer/src/App.jsx (líneas 482-489)
   └─ Ruta: /cliente/configuracion/usuarios

📄 electron-app/src/renderer/src/context/AuthContext.jsx
   └─ Autenticación, permisos, canAccessUsuarios()
```

### 🗄️ BD - ARCHIVOS CRÍTICOS
```
📄 electron-app/src/main/database/connection.js
   └─ Creación de tablas:
      • users (línea 50)
      • vendedores (línea 453)
      • roles (línea 150)
      • ⚠️ TODOs: líneas 615, 634
```

---

## 🔄 Flujo de Datos - API IPC

### Vendedores - Ciclo Completo

```javascript
// ============ RENDERER (React) ============
// pages/Vendedores/index.jsx
const cargarVendedores = async () => {
  // 1. Invoca API
  const result = await window.api.vendedores.getAll();
  // ↓ Va a preload → main
  setVendedores(result.data);
}

// ============ PRELOAD ============
// preload/preload.js
vendedores: {
  getAll: () => ipcRenderer.invoke('vendedores:getAll'),
  // ↓ Envía mensaje al main process
}

// ============ MAIN (Backend) ============
// main/ipc/vendedores.js
ipcMain.handle('vendedores:getAll', async () => {
  try {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT * FROM vendedores ORDER BY nombre
    `);
    const vendedores = stmt.all();
    // ↓ Consulta la BD
    return { success: true, data: vendedores };
    // ↓ Retorna al preload
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// ============ RENDERER (React) - Respuesta ============
if (result.success) {
  setVendedores(result.data);
} else {
  setError(result.error);
}
```

---

## 🔐 Sistema de Permisos - Árbol de Decisión

```
Admin intenta acceder a /cliente/vendedores
        ↓
┌─────────────────────────────────────┐
│ <ProtectedRoute requiredRole={...}> │ ← Verifica rol
└────────┬────────────────────────────┘
         ↓ ¿Tiene rol 'empresa' o 'persona_natural'?
    ✅ Sí ↓ No
         ↓
┌──────────────────────────────────────────┐
│ <PermissionRoute requiredPermission>     │ ← Verifica permiso
│   requiredPermission="vendedores"        │
└────────┬─────────────────────────────────┘
         ↓ ¿Tiene permiso vendedores.ver?
    ✅ Sí ↓ No
         ↓                   ↓
    ↓                   Redirige
Renderiza              a /cliente
Componente
Vendedores
```

### Código Implementación
```javascript
// AuthContext.jsx
const canAccessVendedores = () => {
  return hasPermission('vendedores', 'ver') || 
         hasPermission('vendedores', 'crear');
};

// ClienteLayout.jsx
const moduleAccess = {
  vendedores: canAccessVendedores,
  // ...
};

// En renderizado condicional:
{moduleAccess.vendedores && (
  <MenuItem id="vendedores" label="Vendedores" />
)}
```

---

## ⚡ Acciones Rápidas - Checklist

### Para Agregar Vendedor a Factura
- [ ] Agregar `vendedor_id` INT a tabla `facturas`
- [ ] Agregar FK: `FOREIGN KEY (vendedor_id) REFERENCES vendedores(id)`
- [ ] Modificar `FormularioFactura.jsx` para mostrar dropdown de vendedores
- [ ] Cargar vendedores: `window.api.vendedores.getAll()`
- [ ] Guardar `vendedor_id` en payload de factura
- [ ] Actualizar IPC handler `facturas:create` para guardar `vendedor_id`

### Para Agregar Usuario a Vendedor
- [ ] Opción A: Agregar `usuario_id` a tabla `vendedores`
- [ ] Opción B: Agregar `vendedor_id` a tabla `users`
- [ ] Decidir relación: 1:1, 1:N, o N:1
- [ ] Actualizar UI de creación/edición
- [ ] Agregar validaciones de integridad

### Para Habilitar Reportes por Vendedor
- [ ] En `reportes/`, crear sección "Vendedores"
- [ ] Queries: `SELECT * FROM facturas WHERE vendedor_id = ?`
- [ ] Calcular: total ventas, comisiones, clientes asignados
- [ ] Visualización con gráficos

---

## 📖 Documentación de Referencia

| Concepto | Archivo | Línea |
|----------|---------|-------|
| **Ruta Vendedores** | App.jsx | 297-302 |
| **Ruta Usuarios** | App.jsx | 482-489 |
| **Component Vendedores** | pages/Vendedores/index.jsx | - |
| **Component Usuarios** | pages/Usuarios/index.jsx | - |
| **Backend Vendedores** | ipc/vendedores.js | - |
| **Backend Usuarios** | ipc/usuarios.js | - |
| **Permisos & Auth** | context/AuthContext.jsx | - |
| **Tabla users** | database/connection.js | 50 |
| **Tabla vendedores** | database/connection.js | 453 |
| **Tabla roles** | database/connection.js | 150 |
| **TODOs BD** | database/connection.js | 615, 634 |

---

**Última actualización:** 2026-03-19 ✅
**Documento:** Resumen Visual - Vendedores y Usuarios

