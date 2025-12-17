# Documentación Técnica - Sistema de Facturación Electrónica B2B

## 📋 Índice

1. [Visión General](#visión-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Tecnologías Utilizadas](#tecnologías-utilizadas)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Base de Datos](#base-de-datos)
6. [Sistema de Autenticación](#sistema-de-autenticación)
7. [IPC (Inter-Process Communication)](#ipc-inter-process-communication)
8. [Componentes Frontend](#componentes-frontend)
9. [Configuración de Entornos](#configuración-de-entornos)
10. [Comandos Útiles](#comandos-útiles)

---

## 🎯 Visión General

Sistema de escritorio para gestión de facturación electrónica B2B desarrollado con Electron y React.
Diseñado para distribuidores que operan con conexión limitada a internet, almacenando datos localmente
y conectándose solo para enviar documentos tributarios electrónicos al SII.

**Características Principales:**
- Gestión de clientes
- Catálogo de productos con control de stock
- Emisión de facturas electrónicas
- Reportes e informes
- Autenticación local
- Base de datos SQLite embebida
- Interfaz moderna y responsive

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────┐
│         RENDERER PROCESS (React)        │
│  ┌─────────────────────────────────┐   │
│  │  UI Components (React)          │   │
│  │  - Clientes, Productos, etc.    │   │
│  └──────────────┬──────────────────┘   │
│                 │                        │
│                 │ window.api.xxx()       │
│                 ▼                        │
│  ┌─────────────────────────────────┐   │
│  │  Preload Script (Bridge)        │   │
│  │  - contextBridge.exposeInMain   │   │
│  └──────────────┬──────────────────┘   │
└─────────────────┼────────────────────────┘
                  │ IPC
                  │
┌─────────────────▼────────────────────────┐
│         MAIN PROCESS (Node.js)           │
│  ┌─────────────────────────────────┐    │
│  │  IPC Handlers                   │    │
│  │  - auth.js                      │    │
│  │  - clientes.js                  │    │
│  │  - productos.js                 │    │
│  │  - facturas.js                  │    │
│  └──────────────┬──────────────────┘    │
│                 │                        │
│                 ▼                        │
│  ┌─────────────────────────────────┐    │
│  │  Database Layer                 │    │
│  │  - better-sqlite3               │    │
│  │  - facturacion.db               │    │
│  └─────────────────────────────────┘    │
└──────────────────────────────────────────┘
```

---

## 💻 Tecnologías Utilizadas

### Backend (Main Process)
- **Electron** v28.1.0 - Framework para aplicaciones de escritorio
- **Node.js** - Runtime de JavaScript
- **better-sqlite3** v9.2.2 - Base de datos SQLite sincrónica
- **bcrypt** v5.1.1 - Hash de contraseñas

### Frontend (Renderer Process)
- **React** v18.2.0 - Biblioteca UI
- **React Router DOM** v6.x - Navegación
- **Vite** v5.0.8 - Build tool y dev server

### Desarrollo
- **electron-rebuild** - Recompilación de módulos nativos
- **concurrently** - Ejecución paralela de scripts
- **cross-env** - Variables de entorno multiplataforma

---

## 📁 Estructura del Proyecto

```
Sistema-facturaje-inventario/
│
├── electron-app/                    # Aplicación principal
│   ├── src/
│   │   ├── main/                   # Proceso principal (Node.js)
│   │   │   ├── database/
│   │   │   │   └── connection.js   # Conexión y esquema DB
│   │   │   ├── ipc/
│   │   │   │   ├── auth.js         # Handlers de autenticación
│   │   │   │   ├── clientes.js     # Handlers de clientes
│   │   │   │   └── productos.js    # Handlers de productos
│   │   │   ├── utils/
│   │   │   │   └── session.js      # Gestión de sesión
│   │   │   ├── main.js             # Entry point principal
│   │   │   └── menu.js             # Menú de la app (español)
│   │   │
│   │   ├── preload/
│   │   │   └── preload.js          # Script de bridge (IPC)
│   │   │
│   │   └── renderer/               # Proceso renderer (React)
│   │       ├── index.html          # HTML base
│   │       └── src/
│   │           ├── components/
│   │           │   ├── auth/
│   │           │   │   └── ProtectedRoute.jsx
│   │           │   └── layout/
│   │           │       └── Layout.jsx
│   │           ├── context/
│   │           │   └── AuthContext.jsx
│   │           ├── pages/
│   │           │   ├── Auth/
│   │           │   │   ├── LoginPage.jsx
│   │           │   │   └── RegisterPage.jsx
│   │           │   ├── Clientes/
│   │           │   │   └── index.jsx
│   │           │   ├── Productos/
│   │           │   │   └── index.jsx
│   │           │   ├── Facturas/
│   │           │   │   └── index.jsx
│   │           │   ├── Reportes/
│   │           │   │   └── index.jsx
│   │           │   ├── Dashboard/
│   │           │   │   └── index.jsx
│   │           │   └── Configuracion/
│   │           │       └── ChangePassword.jsx
│   │           ├── App.jsx          # Router principal
│   │           └── main.jsx         # Entry point React
│   │
│   ├── package.json
│   ├── vite.config.js
│   └── electron-builder.yml
│
└── docs/
    ├── DOCUMENTACION_TECNICA.md    # Este archivo
    ├── ESTADO_PROYECTO.txt
    └── GUIA_IA.txt
```

---

## 🗄️ Base de Datos

### Ubicación
- **Desarrollo**: `%APPDATA%/sistema-facturacion/facturacion.dev.db`
- **Producción**: `%APPDATA%/sistema-facturacion/facturacion.db`

### Esquema de Tablas

#### users
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

#### clientes
```sql
CREATE TABLE clientes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rut TEXT UNIQUE NOT NULL,
  razon_social TEXT NOT NULL,
  giro TEXT,
  direccion TEXT,
  comuna TEXT,
  ciudad TEXT,
  telefono TEXT,
  email TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

#### productos
```sql
CREATE TABLE productos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo TEXT UNIQUE,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio REAL NOT NULL,
  stock INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

#### facturas
```sql
CREATE TABLE facturas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  folio INTEGER UNIQUE NOT NULL,
  cliente_id INTEGER NOT NULL,
  fecha TEXT NOT NULL,
  fecha_vencimiento TEXT,
  subtotal REAL NOT NULL,
  iva REAL NOT NULL,
  total REAL NOT NULL,
  estado TEXT DEFAULT 'pendiente',
  observaciones TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (cliente_id) REFERENCES clientes (id)
);
```

#### factura_items
```sql
CREATE TABLE factura_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  factura_id INTEGER NOT NULL,
  producto_id INTEGER,
  descripcion TEXT NOT NULL,
  cantidad REAL NOT NULL,
  precio_unitario REAL NOT NULL,
  subtotal REAL NOT NULL,
  FOREIGN KEY (factura_id) REFERENCES facturas (id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos (id)
);
```

#### config
```sql
CREATE TABLE config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

---

## 🔐 Sistema de Autenticación

### Flujo de Autenticación

1. **Primera ejecución**:
   - Se detecta que no hay usuarios (`isFirstRun()`)
   - Se muestra pantalla de registro
   - Usuario crea cuenta con contraseña hasheada (bcrypt)

2. **Login**:
   - Usuario ingresa credenciales
   - Se verifica hash de contraseña
   - Se establece sesión en memoria
   - Redirect a Dashboard

3. **Sesión**:
   - Almacenada en memoria (no persistente)
   - Se limpia al cerrar la aplicación
   - Requiere login en cada inicio

4. **Protección de rutas**:
   - `ProtectedRoute` wrapper verifica autenticación
   - Redirect a login si no hay sesión activa

### Archivos Clave
- `src/main/ipc/auth.js` - Handlers IPC
- `src/main/utils/session.js` - Gestión de sesión
- `src/renderer/src/context/AuthContext.jsx` - Estado global
- `src/renderer/src/components/auth/ProtectedRoute.jsx` - Guard

### Seguridad
- ✅ Contraseñas hasheadas con bcrypt (10 salt rounds)
- ✅ contextIsolation: true
- ✅ nodeIntegration: false
- ✅ Preload script como único bridge
- ✅ Prepared statements (SQL injection protection)

---

## 📡 IPC (Inter-Process Communication)

### Patrón de Comunicación

```javascript
// 1. Frontend (Renderer)
const result = await window.api.clientes.create(cliente);

// 2. Preload (Bridge)
contextBridge.exposeInMainWorld('api', {
  clientes: {
    create: (data) => ipcRenderer.invoke('clientes:create', data)
  }
});

// 3. Main Process (Handler)
ipcMain.handle('clientes:create', async (event, data) => {
  // Lógica de negocio
  return { success: true, data };
});
```

### Canales IPC Implementados

#### Autenticación (`auth:*`)
- `auth:checkFirstRun` - Verifica si es primera ejecución
- `auth:register` - Crea primer usuario
- `auth:login` - Valida credenciales
- `auth:logout` - Limpia sesión
- `auth:getCurrentUser` - Obtiene usuario actual
- `auth:changePassword` - Actualiza contraseña

#### Clientes (`clientes:*`)
- `clientes:create` - Crea cliente
- `clientes:getAll` - Lista todos
- `clientes:getById` - Obtiene por ID
- `clientes:search` - Busca por término
- `clientes:update` - Actualiza cliente
- `clientes:delete` - Elimina cliente

#### Productos (`productos:*`)
- `productos:create` - Crea producto
- `productos:getAll` - Lista todos
- `productos:search` - Busca por término
- `productos:update` - Actualiza producto
- `productos:delete` - Elimina producto

#### Facturas (`facturas:*`)
- `facturas:create` - Crea factura
- `facturas:getAll` - Lista todas
- `facturas:getById` - Obtiene por ID
- `facturas:updateEstado` - Actualiza estado

---

## 🎨 Componentes Frontend

### Layout Principal
- **Header fijo**: Logo, usuario, botones de acción
- **Sidebar colapsable**: Navegación lateral con iconos
- **Contenido principal**: Área de trabajo
- **Footer fijo**: Información de copyright

### Páginas Implementadas

#### Dashboard (`/`)
- Vista general del sistema
- Tarjetas de acceso rápido
- Estadísticas básicas

#### Clientes (`/clientes`)
- Tabla con listado de clientes
- Formulario de creación/edición
- Búsqueda por RUT o razón social
- Acciones: Editar, Eliminar

#### Productos (`/productos`)
- Vista en tarjetas (cards)
- Formulario de productos
- Visualización de precio y stock
- Acciones: Editar, Eliminar

#### Facturas (`/facturas`)
- Tarjetas de resumen por estado
- Tabla con filtros
- Badges de estado (Pagada, Pendiente, Vencida)
- Acciones: Ver, PDF, Email

#### Reportes (`/reportes`)
- Estadísticas rápidas
- 6 tipos de reportes predefinidos
- Selector de período
- Gráfico de ventas (placeholder)

#### Configuración
- Cambio de contraseña

### Estilos
- Diseño con estilos en línea (inline styles)
- Paleta de colores:
  - Primario: #007bff (azul)
  - Éxito: #28a745 (verde)
  - Peligro: #dc3545 (rojo)
  - Advertencia: #ffc107 (amarillo)
  - Gris: #6c757d
- Responsive con CSS Grid y Flexbox

---

## ⚙️ Configuración de Entornos

### Desarrollo vs Producción

```javascript
const isDevelopment = process.env.NODE_ENV === 'development' || !app.isPackaged;
```

**Diferencias:**

| Aspecto | Desarrollo | Producción |
|---------|-----------|------------|
| Base de datos | `facturacion.dev.db` | `facturacion.db` |
| DevTools | Abiertas automáticamente | Deshabilitadas |
| Menú | Incluye opciones de desarrollo | Menú básico |
| Hot reload | Sí (Vite HMR) | No |
| URL | http://localhost:5173 | file:// local |

### Variables de Entorno

```bash
# Desarrollo
NODE_ENV=development

# Producción (automático al empaquetar)
NODE_ENV=production
```

---

## 🚀 Comandos Útiles

### Desarrollo
```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Ejecutar solo Vite
npm run dev:vite

# Ejecutar solo Electron
npm run dev:electron

# Recompilar módulos nativos para Electron
npx electron-rebuild -f -w better-sqlite3
```

### Construcción
```bash
# Build del frontend (Vite)
npm run build:renderer

# Build completo (incluye empaquetado)
npm run build

# Ejecutar versión empaquetada
npm start
```

### Troubleshooting
```bash
# Error con better-sqlite3
npm install better-sqlite3
npx electron-rebuild -f -w better-sqlite3

# Limpiar y reinstalar
rm -rf node_modules package-lock.json
npm install
```

---

## 📝 Notas Importantes

### Módulos Nativos
- `better-sqlite3` y `bcrypt` son módulos nativos
- Deben recompilarse para Electron con `electron-rebuild`
- Usar `electron-rebuild` después de instalar/actualizar

### Menú en Español
- Implementado en `src/main/menu.js`
- Opciones: Archivo, Editar, Ver, Desarrollo, Ayuda
- Opciones de desarrollo solo en modo dev

### Preload Script
- DEBE usar CommonJS (`require`), no ES modules
- Es el único puente entre main y renderer
- Usa contextBridge para exponer API segura

### Base de Datos
- SQLite es sincrónica (no usar async/await)
- Foreign keys habilitadas
- Prepared statements por seguridad
- Timestamps en ISO 8601

---

## 🔄 Próximos Pasos

- [ ] Implementar validación de RUT chileno
- [ ] Conectar generación de PDF con jsPDF
- [ ] Implementar generación de XML DTE
- [ ] Agregar firma electrónica
- [ ] Integración con API del SII
- [ ] Sistema de respaldo automático
- [ ] Exportación de reportes a Excel
- [ ] Gráficos con Chart.js
- [ ] Sistema de notificaciones
- [ ] Logs de auditoría

---

## 📞 Contacto

**Desarrollador**: Demian Maturana
**Proyecto**: Sistema de Facturación Electrónica B2B
**Versión**: 1.0.0
**Fecha última actualización**: Diciembre 2025

---

## 📄 Licencia

UNLICENSED - Uso privado
