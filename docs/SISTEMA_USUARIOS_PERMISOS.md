# Sistema de Usuarios, Roles y Permisos - Documentación Completa

## 📋 Tabla de Contenidos
1. [Visión General](#visión-general)
2. [Arquitectura](#arquitectura)
3. [Base de Datos](#base-de-datos)
4. [Roles Predefinidos](#roles-predefinidos) 
5. [Sistema de Permisos](#sistema-de-permisos)
6. [Backend (IPC Handlers)](#backend-ipc-handlers)
7. [Frontend](#frontend)
8. [Guía de Uso](#guía-de-uso)
9. [Ejemplos de Código](#ejemplos-de-código)

---

## 🎯 Visión General

Se implementó un **sistema híbrido** de gestión de usuarios que combina:
- **Roles predefinidos**: Facilitan la administración inicial
- **Permisos granulares**: Permiten personalización avanzada por usuario

### Características Principales
✅ 5 roles predefinidos (Dueño, Administrador, Vendedor, Cajero, Contador)  
✅ Permisos personalizables por usuario  
✅ Sistema de auditoría completo  
✅ Validación de permisos en backend y frontend  
✅ Interfaz de administración completa  

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ AuthContext  │  │PermissionGuard│  │  Usuarios    │  │
│  │ + permisos   │  │  Component    │  │   Page       │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↕ IPC
┌─────────────────────────────────────────────────────────┐
│                  BACKEND (Electron Main)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  IPC         │  │  Permissions │  │  Database    │  │
│  │  Handlers    │  │  Middleware  │  │  Connection  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────┐
│              BASE DE DATOS (SQLite)                      │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────┐    │
│  │  users   │  │  roles   │  │  audit_usuarios    │    │
│  └──────────┘  └──────────┘  └────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

---

## 🗄️ Base de Datos

### Tabla `users` (Actualizada)

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  rut TEXT,
  nombre TEXT,
  rol TEXT DEFAULT 'vendedor',
  permisos TEXT DEFAULT '{}',               -- JSON con permisos personalizados
  activo INTEGER DEFAULT 1,
  requiere_autorizacion INTEGER DEFAULT 0,
  ultimo_acceso TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

### Tabla `roles` (Nueva)

```sql
CREATE TABLE roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT UNIQUE NOT NULL,
  descripcion TEXT,
  permisos TEXT NOT NULL,                   -- JSON con permisos del rol
  es_modificable INTEGER DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### Tabla `audit_usuarios` (Nueva)

```sql
CREATE TABLE audit_usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  usuario_responsable_id INTEGER,
  accion TEXT NOT NULL,                     -- CREATE, UPDATE, DELETE, etc.
  datos_anteriores TEXT,                    -- JSON
  datos_nuevos TEXT,                        -- JSON
  ip_address TEXT,
  detalles TEXT,
  timestamp TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (usuario_id) REFERENCES users(id),
  FOREIGN KEY (usuario_responsable_id) REFERENCES users(id)
);
```

---

## 👥 Roles Predefinidos

### 1. **DUEÑO** 🔴
- Acceso **total** al sistema
- Puede gestionar usuarios y configuración crítica
- Puede eliminar ventas y documentos
- No requiere validación de permisos (bypass automático)

**Permisos:**
```json
{
  "facturas": { "crear": true, "ver": true, "editar": true, "eliminar": true, "emitir": true, "anular": true },
  "boletas": { "crear": true, "ver": true, "editar": true, "eliminar": true, "emitir": true, "anular": true },
  "clientes": { "crear": true, "ver": true, "editar": true, "eliminar": true },
  "productos": { "crear": true, "ver": true, "editar": true, "eliminar": true },
  "vendedores": { "crear": true, "ver": true, "editar": true, "eliminar": true },
  "caja": { "acceder": true, "abrir": true, "cerrar": true, "ver_movimientos": true },
  "reportes": { "ver": true, "exportar": true, "financieros": true },
  "configuracion": { "acceder": true, "empresa": true, "folios": true, "usuarios": true },
  "documentos": { "ver": true, "anular": true, "reenviar": true }
}
```

---

### 2. **ADMINISTRADOR** 🟠
- Gestión completa excepto:
  - ❌ Eliminación de ventas
  - ❌ Gestión de usuarios
  - ❌ Configuración crítica

**Permisos:**
```json
{
  "facturas": { "crear": true, "ver": true, "editar": true, "eliminar": false, "emitir": true, "anular": false },
  "boletas": { "crear": true, "ver": true, "editar": true, "eliminar": false, "emitir": true, "anular": false },
  "clientes": { "crear": true, "ver": true, "editar": true, "eliminar": true },
  "productos": { "crear": true, "ver": true, "editar": true, "eliminar": true },
  "vendedores": { "crear": true, "ver": true, "editar": true, "eliminar": false },
  "caja": { "acceder": true, "abrir": true, "cerrar": true, "ver_movimientos": true },
  "reportes": { "ver": true, "exportar": true, "financieros": true },
  "configuracion": { "acceder": true, "empresa": true, "folios": true, "usuarios": false },
  "documentos": { "ver": true, "anular": false, "reenviar": true }
}
```

---

### 3. **VENDEDOR** 🔵
- Crear ventas y gestionar clientes
- **NO** puede eliminar ni modificar facturas emitidas

**Permisos:**
```json
{
  "facturas": { "crear": true, "ver": true, "editar": false, "eliminar": false, "emitir": true, "anular": false },
  "boletas": { "crear": true, "ver": true, "editar": false, "eliminar": false, "emitir": true, "anular": false },
  "clientes": { "crear": true, "ver": true, "editar": true, "eliminar": false },
  "productos": { "crear": false, "ver": true, "editar": false, "eliminar": false },
  "vendedores": { "crear": false, "ver": true, "editar": false, "eliminar": false },
  "caja": { "acceder": true, "abrir": false, "cerrar": false, "ver_movimientos": true },
  "reportes": { "ver": true, "exportar": false, "financieros": false },
  "configuracion": { "acceder": false, "empresa": false, "folios": false, "usuarios": false },
  "documentos": { "ver": true, "anular": false, "reenviar": false }
}
```

---

### 4. **CAJERO** 🟢
- Solo gestión de caja y registro de pagos

**Permisos:**
```json
{
  "facturas": { "crear": false, "ver": true, "editar": false, "eliminar": false, "emitir": false, "anular": false },
  "boletas": { "crear": true, "ver": true, "editar": false, "eliminar": false, "emitir": true, "anular": false },
  "clientes": { "crear": false, "ver": true, "editar": false, "eliminar": false },
  "productos": { "crear": false, "ver": true, "editar": false, "eliminar": false },
  "vendedores": { "crear": false, "ver": true, "editar": false, "eliminar": false },
  "caja": { "acceder": true, "abrir": true, "cerrar": true, "ver_movimientos": true },
  "reportes": { "ver": false, "exportar": false, "financieros": false },
  "configuracion": { "acceder": false, "empresa": false, "folios": false, "usuarios": false },
  "documentos": { "ver": true, "anular": false, "reenviar": false }
}
```

---

### 5. **CONTADOR** 🟣
- Solo lectura y generación de reportes

**Permisos:**
```json
{
  "facturas": { "crear": false, "ver": true, "editar": false, "eliminar": false, "emitir": false, "anular": false },
  "boletas": { "crear": false, "ver": true, "editar": false, "eliminar": false, "emitir": false, "anular": false },
  "clientes": { "crear": false, "ver": true, "editar": false, "eliminar": false },
  "productos": { "crear": false, "ver": true, "editar": false, "eliminar": false },
  "vendedores": { "crear": false, "ver": true, "editar": false, "eliminar": false },
  "caja": { "acceder": true, "abrir": false, "cerrar": false, "ver_movimientos": true },
  "reportes": { "ver": true, "exportar": true, "financieros": true },
  "configuracion": { "acceder": false, "empresa": false, "folios": false, "usuarios": false },
  "documentos": { "ver": true, "anular": false, "reenviar": false }
}
```

---

## 🔐 Sistema de Permisos

### Estructura de Permisos

Los permisos se organizan por **recurso** y **acción**:

```javascript
{
  "recurso": {
    "accion": boolean
  }
}
```

### Recursos Disponibles

| Recurso          | Descripción             |
|-----------------|-------------------------|
| `facturas`       | Facturas electrónicas   |
| `boletas`        | Boletas                 |
| `clientes`       | Clientes                |
| `productos`      | Productos/Servicios     |
| `vendedores`     | Vendedores              |
| `caja`           | Caja/Pagos              |
| `reportes`       | Reportes                |
| `configuracion`  | Configuración general   |
| `documentos`     | Documentos tributarios  |

### Acciones por Recurso

**Facturas/Boletas:**
- `crear`: Crear nuevos documentos
- `ver`: Ver documentos existentes
- `editar`: Modificar documentos
- `eliminar`: Eliminar documentos
- `emitir`: Emitir al SII
- `anular`: Anular documentos emitidos

**Caja:**
- `acceder`: Acceder al módulo de caja
- `abrir`: Abrir caja
- `cerrar`: Cerrar caja
- `ver_movimientos`: Ver movimientos de caja

**Configuración:**
- `acceder`: Acceder a configuración
- `empresa`: Configurar datos de empresa
- `folios`: Gestionar folios
- `usuarios`: Gestionar usuarios

---

## 🔧 Backend (IPC Handlers)

### Archivo: `src/main/ipc/usuarios.js`

Proporciona handlers para:

#### Gestión de Usuarios
- `usuarios:getAll` - Obtener todos los usuarios
- `usuarios:getById` - Obtener un usuario por ID
- `usuarios:create` - Crear nuevo usuario
- `usuarios:update` - Actualizar usuario
- `usuarios:changePassword` - Cambiar contraseña
- `usuarios:toggleActive` - Activar/desactivar usuario
- `usuarios:delete` - Eliminar usuario

#### Gestión de Roles
- `roles:getAll` - Obtener todos los roles
- `roles:getPermisos` - Obtener permisos de un rol
- `roles:updatePermisos` - Actualizar permisos de un rol

#### Validación de Permisos
- `usuarios:checkPermission` - Verificar un permiso específico
- `usuarios:getPermisos` - Obtener todos los permisos de un usuario

#### Auditoría
- `usuarios:getAuditLog` - Obtener historial de auditoría
- `usuarios:updateLastAccess` - Actualizar último acceso

### Archivo: `src/main/utils/permissions.js`

Proporciona funciones auxiliares:

```javascript
// Verificar si un usuario tiene un permiso
hasPermission(userId, recurso, accion)

// Middleware de validación
requirePermission(userId, recurso, accion)

// Verificar roles
isAdminOrOwner(userId)
isOwner(userId)

// Obtener estructura de permisos
getPermisosEstructura()
```

---

## 💻 Frontend

### AuthContext Extendido

**Archivo:** `src/renderer/src/context/AuthContext.jsx`

```javascript
const {
  user,              // Usuario actual
  permisos,          // Permisos del usuario
  hasPermission,     // Función para verificar permisos
  isOwner,           // Es dueño
  isAdmin,           // Es admin o dueño
  canAccessUsuarios  // Puede acceder a gestión de usuarios
} = useAuth();
```

### PermissionGuard Component

**Archivo:** `src/renderer/src/components/permissions/PermissionGuard.jsx`

```jsx
import PermissionGuard from '../components/permissions/PermissionGuard';

<PermissionGuard recurso="facturas" accion="eliminar">
  <Button onClick={handleDelete}>Eliminar</Button>
</PermissionGuard>
```

### Hook usePermissions

```javascript
import { usePermissions } from '../components/permissions/PermissionGuard';

const {
  canCreate,     // canCreate('facturas')
  canEdit,       // canEdit('facturas')
  canDelete,     // canDelete('facturas')
  canView,       // canView('facturas')
  isOwner,       // boolean
  isAdmin        // boolean
} = usePermissions();
```

### Página de Administración

**Archivo:** `src/renderer/src/pages/Usuarios/index.jsx`

Interfaz completa para:
- ✅ Listar usuarios
- ✅ Crear/editar usuarios
- ✅ Asignar roles
- ✅ Personalizar permisos
- ✅ Activar/desactivar usuarios
- ✅ Cambiar contraseñas
- ✅ Ver historial de auditoría
- ✅ Eliminar usuarios (solo dueño)

**Ruta:** `/cliente/configuracion/usuarios`

---

## 📖 Guía de Uso

### 1. Acceder a Gestión de Usuarios

Solo usuarios con permiso `configuracion.usuarios` pueden acceder:

1. Iniciar sesión con usuario **DUEÑO**
2. Click en botón **"👥 Usuarios"** en el header
3. O navegar a: `/cliente/configuracion/usuarios`

### 2. Crear Nuevo Usuario

1. Click en **"Nuevo Usuario"**
2. Completar formulario:
   - Email (requerido)
   - Contraseña (mínimo 8 caracteres)
   - Nombre completo
   - RUT
   - **Seleccionar Rol**
3. Click en **"Crear"**

El usuario heredará automáticamente los permisos de su rol.

### 3. Personalizar Permisos

1. En la lista de usuarios, click en icono **🔑 (Permisos)**
2. Se abre dialog con permisos agrupados por recurso
3. Activar/desactivar permisos individuales
4. Click en **"Guardar Permisos"**

⚠️ **Nota:** Los permisos personalizados sobrescriben los del rol.

### 4. Cambiar Contraseña de Usuario

1. Click en icono **🔒 (Cambiar contraseña)**
2. Ingresar nueva contraseña (mínimo 8 caracteres)
3. Confirmar contraseña
4. Click en **"Cambiar Contraseña"**

### 5. Desactivar Usuario

1. Click en icono **🔓 (Desactivar)**
2. El usuario ya no podrá iniciar sesión
3. Para reactivar, click nuevamente en el icono

### 6. Ver Historial de Auditoría

1. Click en icono **📅 (Historial)**
2. Se muestra registro completo de:
   - Creación del usuario
   - Modificaciones
   - Cambios de contraseña
   - Activaciones/desactivaciones
   - Usuario responsable de cada acción

---

## 💡 Ejemplos de Código

### Ejemplo 1: Verificar Permisos en Componente

```jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';

function FacturasPage() {
  const { hasPermission } = useAuth();

  return (
    <div>
      <h1>Facturas</h1>
      
      {hasPermission('facturas', 'crear') && (
        <button onClick={handleCreate}>Crear Factura</button>
      )}
      
      {hasPermission('facturas', 'eliminar') && (
        <button onClick={handleDelete}>Eliminar</button>
      )}
    </div>
  );
}
```

### Ejemplo 2: Usar PermissionGuard

```jsx
import PermissionGuard from '../components/permissions/PermissionGuard';

<PermissionGuard 
  recurso="productos" 
  accion="eliminar"
  fallback={<span>Sin permisos</span>}
>
  <IconButton onClick={handleDelete}>
    <DeleteIcon />
  </IconButton>
</PermissionGuard>
```

### Ejemplo 3: Validar en Backend

```javascript
import { requirePermission } from '../utils/permissions.js';

ipcMain.handle('productos:delete', async (event, { id, userId }) => {
  // Validar permiso
  const permissionCheck = requirePermission(userId, 'productos', 'eliminar');
  
  if (!permissionCheck.autorizado) {
    return {
      success: false,
      error: permissionCheck.error
    };
  }

  // Continuar con la eliminación
  const db = getDatabase();
  db.prepare('DELETE FROM productos WHERE id = ?').run(id);
  
  return { success: true };
});
```

### Ejemplo 4: Hook Personalizado

```jsx
import { usePermissions } from '../components/permissions/PermissionGuard';

function ClientesPage() {
  const { canCreate, canDelete, isOwner } = usePermissions();

  return (
    <div>
      {canCreate('clientes') && <button>Crear Cliente</button>}
      {canDelete('clientes') && <button>Eliminar Cliente</button>}
      {isOwner && <button>Configuración Avanzada</button>}
    </div>
  );
}
```

### Ejemplo 5: Actualizar Último Acceso

```jsx
// En AuthContext.jsx, función login:
const login = async (email, password) => {
  const result = await window.api.auth.login({ email, password });
  
  if (result.success) {
    setUser(result.user);
    
    // Cargar permisos
    const permisosResult = await window.api.usuarios.getPermisos(result.user.id);
    setPermisos(permisosResult);
    
    // Actualizar último acceso
    await window.api.usuarios.updateLastAccess(result.user.id);
  }
  
  return result;
};
```

---

## 🔒 Seguridad

### Mejores Prácticas Implementadas

1. **Doble Validación**: 
   - Frontend: Ocultar UI no autorizada
   - Backend: Validar permisos antes de ejecutar

2. **Auditoría Completa**:
   - Todas las acciones críticas se registran
   - Se almacena usuario responsable
   - Datos antes/después del cambio

3. **Contraseñas Seguras**:
   - Hash con bcrypt (10 salt rounds)
   - Mínimo 8 caracteres
   - No se almacenan en texto plano

4. **Protección del Dueño**:
   - No se puede eliminar el único dueño del sistema
   - Acceso especial a configuración crítica

5. **Principio de Mínimo Privilegio**:
   - Usuarios inician con rol "vendedor"
   - Se otorgan permisos según necesidad

---

## 🚀 Próximos Pasos (Opcionales)

Para mejorar aún más el sistema:

- [ ] Agregar autenticación de dos factores (2FA)
- [ ] Implementar sesiones con JWT
- [ ] Agregar límite de intentos de login
- [ ] Logs de acceso detallados
- [ ] Notificaciones por email de cambios importantes
- [ ] Roles personalizados (crear roles nuevos)
- [ ] Permisos por horario
- [ ] Aprobación de acciones sensibles (requiere 2 usuarios)

---

## 📞 Soporte

Para dudas o problemas:
1. Revisar esta documentación
2. Consultar código de ejemplo
3. Verificar permisos en base de datos

---

**Fecha de Implementación:** Marzo 6, 2026  
**Versión:** 1.0.0  
**Sistema:** Sistema de Facturación Electrónica B2B
