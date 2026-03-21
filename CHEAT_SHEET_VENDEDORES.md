# ⚡ CHEAT SHEET - VENDEDORES Y USUARIOS

## 🚀 Acciones Rápidas

### ✏️ Editar Página Vendedores

**Archivo:**
```
electron-app/src/renderer/src/pages/Vendedores/index.jsx
```

**Agregar campo a vendedor:**
```javascript
// En formData:
const [formData, setFormData] = useState({
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  comision: 0,
  activo: 1,
  // NUEVO CAMPO:
  rut: '',  // Agregar aquí
});

// En handleInputChange:
const handleInputChange = (e) => {
  const { name, value, type, checked } = e.target;
  setFormData({
    ...formData,
    [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
  });
};

// En render/formulario:
<input
  type="text"
  name="rut"
  value={formData.rut}
  onChange={handleInputChange}
  placeholder="RUT del vendedor"
/>
```

**Agregar botón de acción:**
```javascript
// En handleDelete lógica:
const handleActionCustom = async () => {
  const result = await window.api.vendedores.customAction(vendedor.id);
  if (result.success) {
    await loadVendedores();
  }
};

// En JSX:
<button onClick={() => handleActionCustom(vendedor)}>
  🎯 Acción Personalizada
</button>
```

---

### ✏️ Editar Página Usuarios

**Archivo:**
```
electron-app/src/renderer/src/pages/Usuarios/index.jsx
```

**Agregar nuevo rol a dropdown:**
```javascript
// El dropdown se renderiza dinámicamente desde roles cargados:
// loadData() → window.api.roles.getAll()

// Para agregar un nuevo rol en BD:
// Ver: database/connection.js línea 150+

// En el componente, los roles se cargan así:
const loadData = async () => {
  const rolesResult = await window.api.roles.getAll();
  if (Array.isArray(rolesResult)) {
    setRoles(rolesResult);  // Se usa en <select>
  }
};
```

**Agregar validación personalizada:**
```javascript
if (!formData.email || !formData.email.includes('@')) {
  setError('Email válido es requerido');
  return;
}

// AGREGAR:
if (formData.rut && formData.rut.length < 5) {
  setError('RUT debe ser válido');
  return;
}
```

---

## 🔗 API IPC - Ejemplos de Uso

### Vendedores API

```javascript
// Crear vendedor
const result = await window.api.vendedores.create({
  nombre: 'Juan',
  apellido: 'Pérez',
  email: 'juan@empresa.com',
  telefono: '+56912345678',
  comision: 5.5,
  activo: 1
});
if (result.success) {
  console.log('Vendedor creado, ID:', result.data.id);
}

// Obtener todos
const vendedores = await window.api.vendedores.getAll();
// Retorna: [{id: 1, nombre: 'Juan', ...}, ...]

// Obtener solo activos
const activos = await window.api.vendedores.getActivos();

// Obtener por ID
const vendedor = await window.api.vendedores.getById(1);
// Retorna: {id: 1, nombre: 'Juan', ...}

// Actualizar
const result = await window.api.vendedores.update({
  id: 1,
  vendedor: {
    nombre: 'Juan Carlos',
    comision: 7.5,
    // ... otros campos
  }
});

// Eliminar (soft delete - marca inactivo)
const result = await window.api.vendedores.delete(1);
if (result.success) {
  console.log(result.message);  // "Vendedor desactivado"
}
```

### Usuarios API

```javascript
// Obtener todos
const usuarios = await window.api.usuarios.getAll();
// Retorna: [{id: 1, email: 'admin@emp.com', rol: 'dueño', ...}, ...]

// Crear usuario
const result = await window.api.usuarios.create({
  email: 'newuser@empresa.com',
  password: 'Contraseña123',  // Min 8 chars
  nombre: 'Nuevo Usuario',
  rut: '12.345.678-9',
  rol: 'vendedor',
  activo: 1
});

// Actualizar usuario (SIN password)
const result = await window.api.usuarios.update({
  id: 5,
  email: 'updated@empresa.com',
  nombre: 'Nombre Actualizado',
  rut: '12.345.678-9',
  rol: 'administrador',
  activo: 1
});

// Cambiar contraseña
const result = await window.api.usuarios.changePassword({
  userId: 5,
  newPassword: 'NuevaContraseña123'
});

// Activar/Desactivar
const result = await window.api.usuarios.toggleActive({
  id: 5,
  activo: 0  // 0 = inactivo, 1 = activo
});

// Eliminar
const result = await window.api.usuarios.delete({
  id: 5
});

// Verificar permisos de usuario
const permisos = await window.api.usuarios.getPermisos(5);
// Retorna: {rol: 'vendedor', permisos: {...}}

// Auditoría
const log = await window.api.usuarios.getAuditLog(5);
// Retorna: [{accion: 'LOGIN', timestamp: '...', ...}, ...]

// Sincronizar trabajadores SII
const result = await window.api.usuarios.syncTrabajadoresPendientes();
```

---

## 🔐 Permisos - Cómo Usarlos

### En Componentes React

```javascript
import { useAuth } from '../../context/AuthContext';

function MiComponente() {
  const { user, hasPermission, canAccessVendedores } = useAuth();

  // Opción 1: Verificar permiso específico
  if (hasPermission('vendedores', 'crear')) {
    return <button>Crear Vendedor</button>;
  }

  // Opción 2: Usar función de acceso
  if (canAccessVendedores()) {
    return <Vendedores />;
  }

  // Opción 3: Verificar rol
  if (user?.rol === 'dueño' || user?.rol === 'administrador') {
    return <AdminPanel />;
  }

  return <AccessDenied />;
}
```

### Matrices de Permisos

```javascript
// Vendedores
vendedores: {
  crear: boolean,
  ver: boolean,
  editar: boolean,
  eliminar: boolean
}

// Usuarios (solo dueño/admin)
configuracion: {
  usuarios: boolean
}

// Facturas
facturas: {
  crear: boolean,
  ver: boolean,
  editar: boolean,
  eliminar: boolean,
  emitir: boolean,
  anular: boolean
}
```

---

## 🛂 Cambiar Rutas

### Agregar nueva ruta para Vendedores

**Archivo:** `electron-app/src/renderer/src/App.jsx`

```javascript
import Vendedores from './pages/Vendedores';

// En Routes:
<Route
  path="/cliente/vendedores/detalles/:id"  // ← NUEVA RUTA
  element={
    <ProtectedRoute requiredRole={['empresa', 'persona_natural']}>
      <PermissionRoute requiredPermission="vendedores">
        <ClienteLayout>
          <VendedorDetalles />  {/* Crear este componente */}
        </ClienteLayout>
      </PermissionRoute>
    </ProtectedRoute>
  }
/>
```

### Cambiar permiso requerido en ruta

```javascript
// De:
<PermissionRoute requiredPermission="vendedores">

// A:
<PermissionRoute requiredPermission="administracion">
```

---

## 🗄️ Cambiar Base de Datos

### Agregar campo a tabla vendedores

**Archivo:** `electron-app/src/main/database/connection.js`

```javascript
// Encontrar: CREATE TABLE IF NOT EXISTS vendedores
// (alrededor de línea 453)

// Actual:
CREATE TABLE IF NOT EXISTS vendedores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  email TEXT,
  telefono TEXT,
  comision REAL DEFAULT 0,
  activo INTEGER DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

// AGREGAR campo:
CREATE TABLE IF NOT EXISTS vendedores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  email TEXT,
  telefono TEXT,
  comision REAL DEFAULT 0,
  usuario_id INTEGER,  // ← NUEVO
  activo INTEGER DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (usuario_id) REFERENCES users(id)  // ← NUEVO
);

// NO OLVIDES: Agregar migración if NOT EXISTS para bases existentes:
try {
  db.exec(`ALTER TABLE vendedores ADD COLUMN usuario_id INTEGER`);
} catch (error) {
  if (!error.message.includes('duplicate column name')) {
    console.error('Error:', error);
  }
}
```

### Agregar campo a tabla facturas

```javascript
// Encontrar: CREATE TABLE IF NOT EXISTS facturas
// (alrededor de línea 400)

// AGREGAR a facturas:
ALTER TABLE facturas ADD COLUMN vendedor_id INTEGER;
ALTER TABLE facturas ADD CONSTRAINT fk_vendedor
  FOREIGN KEY (vendedor_id) REFERENCES vendedores(id);
```

---

## 🎯 Backend IPC - Agregar Handler

**Archivo:** `electron-app/src/main/ipc/vendedores.js`

```javascript
// Agregar nuevo handler:

export function registerVendedoresHandlers() {
  // ... handlers existentes ...

  // NUEVO HANDLER:
  ipcMain.handle('vendedores:getComisiones', async (event, vendedorId) => {
    try {
      const db = getDatabase();
      
      // Lógica para calcular comisiones
      const stmt = db.prepare(`
        SELECT 
          v.id, v.nombre, v.comision,
          COUNT(f.id) as num_ventas,
          SUM(f.total) as total_ventas
        FROM vendedores v
        LEFT JOIN facturas f ON f.vendedor_id = v.id
        WHERE v.id = ?
        GROUP BY v.id
      `);
      
      const resultado = stmt.get(vendedorId);
      
      return {
        success: true,
        data: resultado
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  });
}
```

---

## 🎨 Preload - Exponer Nueva API

**Archivo:** `electron-app/src/preload/preload.js`

```javascript
// Agregar a window.api:

vendedores: {
  create: (vendedor) => ipcRenderer.invoke('vendedores:create', vendedor),
  getAll: () => ipcRenderer.invoke('vendedores:getAll'),
  getActivos: () => ipcRenderer.invoke('vendedores:getActivos'),
  getById: (id) => ipcRenderer.invoke('vendedores:getById', id),
  update: (data) => ipcRenderer.invoke('vendedores:update', data),
  delete: (id) => ipcRenderer.invoke('vendedores:delete', id),
  // NUEVA:
  getComisiones: (vendedorId) => ipcRenderer.invoke('vendedores:getComisiones', vendedorId)
},
```

---

## 🧪 Testing Rápido

### Probar en DevTools (Console)

```javascript
// Test Vendedores
window.api.vendedores.getAll().then(r => console.log(r));

// Test Usuarios
window.api.usuarios.getAll().then(r => console.log(r));

// Test Permisos (en componente)
const { canAccessVendedores } = useAuth();
console.log('Acceso vendedores:', canAccessVendedores());

// Test API expuesta
console.log('API disponibles:', Object.keys(window.api));
```

---

## 🚨 Debug Común

### "Permiso denegado para acceder a vendedores"
1. Verificar rol del usuario: `user?.rol`
2. Verificar permisos: `permisos?.permisos?.vendedores`
3. Check: `hasPermission('vendedores', 'ver')`

### "undefined is not a function window.api.vendedores"
1. Asegurar preload.js expone el método
2. Asegurar ipcMain.handle existe en backend
3. Reiniciar aplicación

### "Database error inserting vendedor"
1. Validar datos antes de enviar
2. Verificar schema en connection.js
3. Check permisos de BD

### "Token/Sesión expirada"
1. Login nuevamente
2. Verificar suscripción activa
3. Check modo offline

---

## 📊 Consultas SQL Útiles

```sql
-- Ver todos los vendedores
SELECT * FROM vendedores WHERE activo = 1;

-- Ver vendedor con ID específico
SELECT * FROM vendedores WHERE id = ?;

-- Contar vendedores por estado
SELECT activo, COUNT(*) as total
FROM vendedores
GROUP BY activo;

-- Ver usuarios por rol
SELECT COUNT(*) as total, rol
FROM users
GROUP BY rol;

-- Ver permisos de usuario específico
SELECT rol, permisos FROM users WHERE id = ?;

-- Ver facturas de vendedor (cuando esté implementado)
SELECT COUNT(*) as total_facturas, SUM(total) as total_ventas
FROM facturas
WHERE vendedor_id = ?;
```

---

## 🔄 Migración: Agregar Conexión Vendedores ↔ Facturas

### Paso 1: Modificar Schema BD
```javascript
// database/connection.js
ALTER TABLE facturas ADD COLUMN vendedor_id INTEGER;
ALTER TABLE facturas ADD FOREIGN KEY (vendedor_id) 
  REFERENCES vendedores(id);
```

### Paso 2: Actualizar Backend
```javascript
// ipc/facturas.js
// En facturas:create, agregar vendedor_id al INSERT
```

### Paso 3: Actualizar Frontend
```javascript
// FormularioFactura.jsx
// Cargar dropdown de vendedores
const vendedores = await window.api.vendedores.getActivos();

// Agregar campo al formulario
<select value={formData.vendedor_id} onChange={...}>
  {vendedores.map(v => (
    <option key={v.id} value={v.id}>
      {v.nombre} {v.apellido}
    </option>
  ))}
</select>
```

---

## 📚 Referencias Rápidas

| Necesito... | Archivo | Línea |
|-----------|---------|-------|
| Editar Vendedores UI | `pages/Vendedores/` | - |
| Editar Usuarios UI | `pages/Usuarios/` | - |
| IPC Vendedores | `ipc/vendedores.js` | - |
| IPC Usuarios | `ipc/usuarios.js` | - |
| DB Schema | `database/connection.js` | 453 |
| Permisos | `context/AuthContext.jsx` | - |
| Rutas | `App.jsx` | 297, 482 |
| Preload API | `preload/preload.js` | 64, 18 |
| Layout | `components/layout/ClienteLayout.jsx` | - |

---

**Última actualización:** 2026-03-19 ✅
**Tipo:** Cheat Sheet - Referencia Rápida

