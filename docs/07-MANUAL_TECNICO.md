# 07 - MANUAL TÉCNICO
## Sistema de Facturación Electrónica B2B

**Versión:** 1.0.0  
**Última actualización:** 17 de Diciembre, 2025  
**Audiencia:** Desarrolladores

---

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Arquitectura General](#arquitectura-general)
3. [Setup del Entorno](#setup-del-entorno)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Base de Datos](#base-de-datos)
6. [Sistema IPC](#sistema-ipc)
7. [Frontend (React)](#frontend-react)
8. [Backend (Electron Main)](#backend-electron-main)
9. [Servicios](#servicios)
10. [Agregar Nuevas Funcionalidades](#agregar-nuevas-funcionalidades)
11. [Testing](#testing)
12. [Build y Distribución](#build-y-distribución)
13. [Debugging](#debugging)
14. [Convenciones de Código](#convenciones-de-código)
15. [Troubleshooting](#troubleshooting)

---

## 🎯 Introducción

Este manual está diseñado para desarrolladores que necesitan:
- Configurar el entorno de desarrollo
- Entender la arquitectura del sistema
- Agregar nuevas funcionalidades
- Mantener y extender el código existente
- Hacer debugging y resolver problemas

### Stack Tecnológico

```
Frontend:  React 18.2.0 + React Router 7.10.1 + Vite 5.0.8
Backend:   Electron 28.1.0 + Node.js
Database:  SQLite (better-sqlite3 9.2.2)
Build:     electron-builder 24.9.1
```

---

## 🏗️ Arquitectura General

### Patrón: Multi-Proceso (Electron)

```
┌─────────────────────────────────────────────────────────┐
│                 RENDERER PROCESS                         │
│  ┌────────────────────────────────────────────────────┐ │
│  │              React Application                     │ │
│  │  - Components (Pages, Shared)                      │ │
│  │  - React Router (Navigation)                       │ │
│  │  - Context API (Auth, State)                       │ │
│  │  - Chart.js (Visualizations)                       │ │
│  └────────────────────────────────────────────────────┘ │
│                         │                                │
│                         │ window.api.*                   │
│                         ▼                                │
│  ┌────────────────────────────────────────────────────┐ │
│  │         Preload Script (contextBridge)             │ │
│  │  - Exposes safe IPC API to renderer                │ │
│  │  - Security: contextIsolation = true               │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                         │
                         │ IPC (ipcRenderer.invoke)
                         │
┌─────────────────────────────────────────────────────────┐
│                   MAIN PROCESS                           │
│  ┌────────────────────────────────────────────────────┐ │
│  │              IPC Handlers                          │ │
│  │  - auth.js      - clientes.js   - productos.js    │ │
│  │  - facturas.js  - vendedores.js - pagos.js        │ │
│  │  - reportes.js  - backup.js     - export.js       │ │
│  └────────────────────────────────────────────────────┘ │
│                         │                                │
│                         ▼                                │
│  ┌────────────────────────────────────────────────────┐ │
│  │              Services Layer                        │ │
│  │  - dte-generator.js (XML generation)               │ │
│  │  - api-client.js (SII integration)                 │ │
│  │  - generarPDF.js (PDF generation)                  │ │
│  └────────────────────────────────────────────────────┘ │
│                         │                                │
│                         ▼                                │
│  ┌────────────────────────────────────────────────────┐ │
│  │         Database Layer (better-sqlite3)            │ │
│  │  - connection.js (DB initialization)               │ │
│  │  - facturacion.db (SQLite file)                    │ │
│  │  - 11 tables with relationships                    │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Flujo de Datos Típico

1. **Usuario** interactúa con componente React (ej: clic en "Guardar Cliente")
2. **React** llama `window.api.clientes.create(data)`
3. **Preload** invoca `ipcRenderer.invoke('clientes:create', data)`
4. **Main Process** recibe en `ipcMain.handle('clientes:create', handler)`
5. **Handler** valida datos y ejecuta query SQL
6. **SQLite** retorna resultado
7. **Handler** retorna `{success: true, data: {...}}`
8. **React** actualiza estado y UI

---

## 💻 Setup del Entorno

### Requisitos

- **Node.js:** 18.x o superior
- **npm:** 9.x o superior
- **Git:** Para control de versiones
- **Editor:** VS Code recomendado

### Instalación

```bash
# 1. Clonar repositorio
git clone <repository-url>
cd Sistema-facturaje-inventario

# 2. Instalar dependencias del proyecto Electron
cd electron-app
npm install

# 3. Rebuild módulos nativos para Electron
npm run rebuild

# 4. (Opcional) Instalar dependencias del servidor
cd ../server
npm install
```

### Ejecutar en Desarrollo

```bash
# En electron-app/
npm run dev
```

Esto ejecuta:
1. Vite dev server (puerto 5173) para hot reload del frontend
2. Electron main process
3. Abre DevTools automáticamente

### Scripts Disponibles

```json
{
  "dev": "concurrently \"npm run dev:vite\" \"npm run dev:electron\"",
  "dev:vite": "vite",
  "dev:electron": "cross-env NODE_ENV=development electron .",
  "build": "vite build",
  "build:electron": "electron-builder",
  "rebuild": "electron-rebuild -f -w better-sqlite3"
}
```

---

## 📁 Estructura del Proyecto

```
Sistema-facturaje-inventario/
├── electron-app/                    # Aplicación Electron principal
│   ├── src/
│   │   ├── main/                    # Main Process (Node.js)
│   │   │   ├── main.js              # Entry point
│   │   │   ├── menu.js              # Application menu
│   │   │   ├── database/
│   │   │   │   └── connection.js    # SQLite setup
│   │   │   ├── ipc/                 # IPC Handlers
│   │   │   │   ├── auth.js          # Authentication
│   │   │   │   ├── clientes.js      # Clients CRUD
│   │   │   │   ├── productos.js     # Products CRUD
│   │   │   │   ├── facturas.js      # Invoices
│   │   │   │   ├── vendedores.js    # Salespeople
│   │   │   │   ├── pagos.js         # Payments
│   │   │   │   ├── reportes.js      # Reports
│   │   │   │   ├── backup.js        # Backup/Restore
│   │   │   │   ├── export.js        # Excel export
│   │   │   │   ├── sii.js           # SII integration
│   │   │   │   └── licenses.js      # License validation
│   │   │   ├── services/
│   │   │   │   ├── dte-generator.js # XML DTE generation
│   │   │   │   ├── api-client.js    # HTTP client for SII
│   │   │   │   └── generarPDF.js    # PDF generation
│   │   │   └── utils/
│   │   │       └── session.js       # Session management
│   │   ├── preload/
│   │   │   └── preload.js           # Context bridge
│   │   └── renderer/                # Renderer Process (React)
│   │       └── src/
│   │           ├── main.jsx         # React entry point
│   │           ├── App.jsx          # Main app component
│   │           ├── pages/           # Page components
│   │           │   ├── Auth/
│   │           │   │   ├── Login.jsx
│   │           │   │   └── Register.jsx
│   │           │   ├── Dashboard/
│   │           │   ├── Clientes/
│   │           │   ├── Productos/
│   │           │   ├── Facturas/
│   │           │   ├── Vendedores/
│   │           │   ├── Reportes/
│   │           │   └── Configuracion/
│   │           ├── components/      # Shared components
│   │           │   ├── Layout.jsx
│   │           │   └── Sidebar.jsx
│   │           └── context/
│   │               └── AuthContext.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── electron-builder.yml         # Build configuration
├── server/                          # Backend server (futuro)
│   ├── src/
│   │   └── index.js
│   └── package.json
├── docs/                            # Documentación
│   ├── 00-INDICE.md
│   ├── 01-VISION_GENERAL.md
│   ├── 02-ARQUITECTURA.md
│   ├── 03-BASE_DE_DATOS.md
│   ├── 04-API_IPC.md
│   ├── 05-FLUJOS.md
│   ├── 06-FUNCIONALIDADES.md
│   ├── 07-MANUAL_TECNICO.md         # Este archivo
│   ├── 08-MANUAL_USUARIO.md
│   ├── 09-ROADMAP.md
│   └── 10-SERVIDOR.md
└── README.md
```

---

## 🗄️ Base de Datos

### Ubicación

```
Windows: C:\Users\<user>\AppData\Roaming\sistema-facturacion\facturacion.db
macOS:   ~/Library/Application Support/sistema-facturacion/facturacion.db
Linux:   ~/.config/sistema-facturacion/facturacion.db
```

### Inicialización

**Archivo:** `electron-app/src/main/database/connection.js`

```javascript
import Database from 'better-sqlite3';
import { app } from 'electron';
import path from 'path';
import fs from 'fs';

const userDataPath = app.getPath('userData');
const dbPath = path.join(userDataPath, 'facturacion.db');

let db = null;

export function initDatabase() {
  // Crear directorio si no existe
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
  }

  // Abrir/crear base de datos
  db = new Database(dbPath);
  db.pragma('foreign_keys = ON');
  
  // Crear tablas
  createTables();
  
  // Aplicar migraciones
  applyMigrations();
  
  return db;
}

export function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}
```

### Schema

Ver [03-BASE_DE_DATOS.md](./03-BASE_DE_DATOS.md) para el schema completo.

**Tablas principales:**
- `users` - Usuarios del sistema
- `clientes` - Clientes
- `productos` - Catálogo de productos
- `vendedores` - Vendedores
- `facturas` - Facturas emitidas
- `factura_items` - Líneas de factura
- `pagos` - Pagos recibidos
- `emisor` - Datos de la empresa
- `folios` - Control de numeración
- `config` - Configuración key-value

### Queries Preparados

**Siempre usa prepared statements:**

```javascript
// ✅ CORRECTO
const stmt = db.prepare('SELECT * FROM clientes WHERE rut = ?');
const cliente = stmt.get(rut);

// ❌ INCORRECTO (SQL Injection)
const query = `SELECT * FROM clientes WHERE rut = '${rut}'`;
const cliente = db.prepare(query).get();
```

### Transacciones

Para operaciones múltiples, usa transacciones:

```javascript
const createFactura = db.transaction((facturaData, items) => {
  // 1. Insertar factura
  const stmtFactura = db.prepare('INSERT INTO facturas (...) VALUES (...)');
  const result = stmtFactura.run(...);
  const facturaId = result.lastInsertRowid;
  
  // 2. Insertar items
  const stmtItem = db.prepare('INSERT INTO factura_items (...) VALUES (...)');
  items.forEach(item => {
    stmtItem.run(facturaId, ...);
  });
  
  // 3. Actualizar stock
  const stmtStock = db.prepare('UPDATE productos SET stock = stock - ? WHERE id = ?');
  items.forEach(item => {
    stmtStock.run(item.cantidad, item.producto_id);
  });
  
  return facturaId;
});

// Uso
try {
  const facturaId = createFactura(facturaData, items);
  // Todo se commitea automáticamente si no hay error
} catch (error) {
  // Rollback automático en caso de error
  console.error(error);
}
```

---

## 🔌 Sistema IPC

### Estructura de un Handler

**Archivo:** `electron-app/src/main/ipc/ejemplo.js`

```javascript
import { ipcMain } from 'electron';
import { getDatabase } from '../database/connection.js';

export function registerEjemploHandlers() {
  // Handler básico
  ipcMain.handle('ejemplo:accion', async (event, params) => {
    try {
      const db = getDatabase();
      
      // Validaciones
      if (!params.campo) {
        return { success: false, error: 'Campo requerido' };
      }
      
      // Lógica de negocio
      const stmt = db.prepare('SELECT * FROM tabla WHERE campo = ?');
      const resultado = stmt.get(params.campo);
      
      // Retornar resultado
      return {
        success: true,
        data: resultado
      };
    } catch (error) {
      console.error('Error en ejemplo:accion:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });
  
  console.log('Ejemplo IPC handlers registered');
}
```

### Registrar Handler

**Archivo:** `electron-app/src/main/main.js`

```javascript
import { registerEjemploHandlers } from './ipc/ejemplo.js';

app.whenReady().then(() => {
  initDatabase();
  
  // Registrar handlers
  registerEjemploHandlers();
  
  createWindow();
});
```

### Exponer en Preload

**Archivo:** `electron-app/src/preload/preload.js`

```javascript
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  ejemplo: {
    accion: (params) => ipcRenderer.invoke('ejemplo:accion', params)
  }
});
```

### Usar en React

```javascript
// En componente React
const handleAccion = async () => {
  const result = await window.api.ejemplo.accion({ campo: 'valor' });
  
  if (result.success) {
    console.log('Éxito:', result.data);
  } else {
    console.error('Error:', result.error);
  }
};
```

### Convención de Nombres

```
Patrón: <módulo>:<acción>

Ejemplos:
- auth:login
- auth:logout
- clientes:create
- clientes:getAll
- clientes:getById
- clientes:update
- clientes:delete
- facturas:create
- facturas:getReporteVentas
```

---

## ⚛️ Frontend (React)

### Estructura de Componentes

```
pages/                    # Páginas completas
  Dashboard/
    index.jsx             # Componente principal
  Clientes/
    index.jsx
  
components/               # Componentes reutilizables
  Layout.jsx
  Sidebar.jsx
```

### Routing

**Archivo:** `electron-app/src/renderer/src/App.jsx`

```javascript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Auth/Login';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="clientes" element={<Clientes />} />
            <Route path="productos" element={<Productos />} />
            <Route path="facturas" element={<Facturas />} />
            {/* ... más rutas */}
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
```

### Context API (Autenticación)

**Archivo:** `electron-app/src/renderer/src/context/AuthContext.jsx`

```javascript
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const result = await window.api.auth.getCurrentUser();
    if (result.success && result.user) {
      setUser(result.user);
    }
    setLoading(false);
  };

  const login = async (username, password) => {
    const result = await window.api.auth.login({ username, password });
    if (result.success) {
      setUser(result.user);
    }
    return result;
  };

  const logout = async () => {
    await window.api.auth.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
```

### Estilos

Actualmente se usan **inline styles** con objetos JavaScript:

```javascript
const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#f5f5f5'
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  }
};

return (
  <div style={styles.container}>
    <button style={styles.button}>Click</button>
  </div>
);
```

**Alternativa futura:** Migrar a CSS Modules o styled-components.

---

## 🔧 Backend (Electron Main)

### Main Process

**Archivo:** `electron-app/src/main/main.js`

Responsabilidades:
- Crear ventana de Electron
- Inicializar base de datos
- Registrar handlers IPC
- Crear menú de aplicación
- Manejar eventos del ciclo de vida

### Servicios

#### 1. Generador de DTE

**Archivo:** `electron-app/src/main/services/dte-generator.js`

```javascript
function generarDTE(factura, emisor, cliente, items) {
  const xml = `<?xml version="1.0" encoding="ISO-8859-1"?>
<DTE version="1.0">
  <Documento ID="F${factura.folio}T${factura.tipo_documento}">
    <Encabezado>
      <IdDoc>
        <TipoDTE>${factura.tipo_documento}</TipoDTE>
        <Folio>${factura.folio}</Folio>
        <FchEmis>${factura.fecha}</FchEmis>
      </IdDoc>
      <Emisor>
        <RUTEmisor>${formatRUT(emisor.rut)}</RUTEmisor>
        <RznSoc>${emisor.razon_social}</RznSoc>
        <!-- ... más campos -->
      </Emisor>
      <Receptor>
        <RUTRecep>${formatRUT(cliente.rut)}</RUTRecep>
        <RznSocRecep>${cliente.razon_social}</RznSocRecep>
        <!-- ... más campos -->
      </Receptor>
      <Totales>
        <MntNeto>${factura.subtotal}</MntNeto>
        <IVA>${factura.iva}</IVA>
        <MntTotal>${factura.total}</MntTotal>
      </Totales>
    </Encabezado>
    <Detalle>
      ${items.map((item, idx) => `
      <Detalle>
        <NroLinDet>${idx + 1}</NroLinDet>
        <NmbItem>${item.descripcion}</NmbItem>
        <QtyItem>${item.cantidad}</QtyItem>
        <PrcItem>${item.precio_unitario}</PrcItem>
        <MontoItem>${item.monto_item}</MontoItem>
      </Detalle>
      `).join('')}
    </Detalle>
  </Documento>
</DTE>`;
  
  return xml;
}
```

#### 2. Generador de PDF

**Archivo:** `electron-app/src/main/services/generarPDF.js`

Usa `jsPDF` y `jspdf-autotable` para crear PDFs profesionales.

#### 3. Cliente API

**Archivo:** `electron-app/src/main/services/api-client.js`

Cliente HTTP para comunicación con servidor backend y SII.

---

## ➕ Agregar Nuevas Funcionalidades

### Ejemplo: Agregar Módulo de "Cotizaciones"

#### 1. Base de Datos

```sql
-- En connection.js, agregar tabla
CREATE TABLE IF NOT EXISTS cotizaciones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  numero INTEGER UNIQUE NOT NULL,
  cliente_id INTEGER NOT NULL,
  fecha TEXT NOT NULL,
  validez_dias INTEGER DEFAULT 30,
  subtotal REAL NOT NULL,
  iva REAL NOT NULL,
  total REAL NOT NULL,
  estado TEXT DEFAULT 'pendiente',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

CREATE TABLE IF NOT EXISTS cotizacion_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cotizacion_id INTEGER NOT NULL,
  producto_id INTEGER,
  descripcion TEXT NOT NULL,
  cantidad REAL NOT NULL,
  precio_unitario REAL NOT NULL,
  monto_item REAL NOT NULL,
  FOREIGN KEY (cotizacion_id) REFERENCES cotizaciones(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id)
);
```

#### 2. IPC Handlers

**Crear:** `electron-app/src/main/ipc/cotizaciones.js`

```javascript
import { ipcMain } from 'electron';
import { getDatabase } from '../database/connection.js';

export function registerCotizacionesHandlers() {
  // Crear cotización
  ipcMain.handle('cotizaciones:create', async (event, data) => {
    try {
      const db = getDatabase();
      
      const createCotizacion = db.transaction((cotizacionData, items) => {
        // Insertar cotización
        const stmt = db.prepare(`
          INSERT INTO cotizaciones (numero, cliente_id, fecha, subtotal, iva, total)
          VALUES (?, ?, ?, ?, ?, ?)
        `);
        const result = stmt.run(
          cotizacionData.numero,
          cotizacionData.cliente_id,
          cotizacionData.fecha,
          cotizacionData.subtotal,
          cotizacionData.iva,
          cotizacionData.total
        );
        
        const cotizacionId = result.lastInsertRowid;
        
        // Insertar items
        const stmtItem = db.prepare(`
          INSERT INTO cotizacion_items (cotizacion_id, producto_id, descripcion, cantidad, precio_unitario, monto_item)
          VALUES (?, ?, ?, ?, ?, ?)
        `);
        
        items.forEach(item => {
          stmtItem.run(
            cotizacionId,
            item.producto_id,
            item.descripcion,
            item.cantidad,
            item.precio_unitario,
            item.monto_item
          );
        });
        
        return cotizacionId;
      });
      
      const cotizacionId = createCotizacion(data, data.items);
      
      return { success: true, data: { id: cotizacionId } };
    } catch (error) {
      console.error('Error creating cotizacion:', error);
      return { success: false, error: error.message };
    }
  });
  
  // Listar cotizaciones
  ipcMain.handle('cotizaciones:getAll', async () => {
    try {
      const db = getDatabase();
      const stmt = db.prepare(`
        SELECT c.*, cl.razon_social as cliente_nombre
        FROM cotizaciones c
        LEFT JOIN clientes cl ON c.cliente_id = cl.id
        ORDER BY c.fecha DESC
      `);
      const cotizaciones = stmt.all();
      
      return { success: true, data: cotizaciones };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  
  console.log('Cotizaciones IPC handlers registered');
}
```

#### 3. Registrar en Main

**En:** `electron-app/src/main/main.js`

```javascript
import { registerCotizacionesHandlers } from './ipc/cotizaciones.js';

app.whenReady().then(() => {
  // ...
  registerCotizacionesHandlers();
  // ...
});
```

#### 4. Exponer en Preload

**En:** `electron-app/src/preload/preload.js`

```javascript
contextBridge.exposeInMainWorld('api', {
  // ... otros módulos
  cotizaciones: {
    create: (data) => ipcRenderer.invoke('cotizaciones:create', data),
    getAll: () => ipcRenderer.invoke('cotizaciones:getAll'),
    getById: (id) => ipcRenderer.invoke('cotizaciones:getById', id),
    update: (id, data) => ipcRenderer.invoke('cotizaciones:update', { id, data }),
    delete: (id) => ipcRenderer.invoke('cotizaciones:delete', id)
  }
});
```

#### 5. Crear Componente React

**Crear:** `electron-app/src/renderer/src/pages/Cotizaciones/index.jsx`

```javascript
import { useState, useEffect } from 'react';

function Cotizaciones() {
  const [cotizaciones, setCotizaciones] = useState([]);
  
  useEffect(() => {
    loadCotizaciones();
  }, []);
  
  const loadCotizaciones = async () => {
    const result = await window.api.cotizaciones.getAll();
    if (result.success) {
      setCotizaciones(result.data);
    }
  };
  
  return (
    <div>
      <h1>Cotizaciones</h1>
      {/* UI aquí */}
    </div>
  );
}

export default Cotizaciones;
```

#### 6. Agregar Ruta

**En:** `electron-app/src/renderer/src/App.jsx`

```javascript
import Cotizaciones from './pages/Cotizaciones';

// En Routes
<Route path="cotizaciones" element={<Cotizaciones />} />
```

#### 7. Agregar al Menú

**En:** `electron-app/src/main/menu.js`

```javascript
{
  label: 'Cotizaciones',
  click: () => {
    mainWindow.webContents.send('navigate', '/cotizaciones');
  }
}
```

---

## 🧪 Testing

### Unit Tests (Pendiente)

Configurar Jest para testing:

```bash
npm install --save-dev jest @testing-library/react
```

### Integration Tests (Pendiente)

Usar Spectron para testing de Electron.

### Manual Testing

1. Probar en desarrollo: `npm run dev`
2. Probar build: `npm run build:electron`
3. Instalar y probar en máquina limpia

---

## 📦 Build y Distribución

### Configuración

**Archivo:** `electron-app/electron-builder.yml`

```yaml
appId: com.tuempresa.facturacion
productName: Sistema Facturación
directories:
  output: dist
  buildResources: build
files:
  - dist-main/**/*
  - dist-renderer/**/*
  - node_modules/**/*
  - package.json
win:
  target:
    - nsis
  icon: build/icon.ico
mac:
  target:
    - dmg
  icon: build/icon.icns
linux:
  target:
    - deb
    - rpm
  icon: build/icon.png
```

### Build

```bash
# 1. Build frontend
npm run build

# 2. Build Electron app
npm run build:electron
```

Salida en `electron-app/dist/`

---

## 🐛 Debugging

### DevTools

En desarrollo, DevTools se abren automáticamente.

### Logs

```javascript
// Main process
console.log('Main:', data);

// Renderer process
console.log('Renderer:', data);
```

### Inspeccionar Base de Datos

```bash
# Abrir con SQLite CLI
sqlite3 "C:\Users\<user>\AppData\Roaming\sistema-facturacion\facturacion.db"

# O usar DB Browser for SQLite (GUI)
```

### Debugging Main Process

En VS Code, crear `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Main Process",
      "type": "node",
      "request": "launch",
      "cwd": "${workspaceFolder}/electron-app",
      "runtimeExecutable": "${workspaceFolder}/electron-app/node_modules/.bin/electron",
      "windows": {
        "runtimeExecutable": "${workspaceFolder}/electron-app/node_modules/.bin/electron.cmd"
      },
      "args": ["."],
      "outputCapture": "std"
    }
  ]
}
```

---

## 📝 Convenciones de Código

### JavaScript

- **ES6+:** Usar import/export, arrow functions, destructuring
- **Async/Await:** Preferir sobre callbacks
- **Naming:**
  - Variables: `camelCase`
  - Constantes: `UPPER_SNAKE_CASE`
  - Funciones: `camelCase`
  - Componentes React: `PascalCase`

### SQL

- Nombres de tablas: `snake_case` (plural)
- Nombres de columnas: `snake_case`
- Siempre usar prepared statements

### Comentarios

```javascript
// Comentarios de una línea para explicaciones breves

/**
 * Comentarios de múltiples líneas para funciones
 * @param {Object} data - Datos de entrada
 * @returns {Promise<Object>} Resultado de la operación
 */
```

---

## 🔧 Troubleshooting

### Error: "Database is locked"

**Causa:** Múltiples procesos accediendo a SQLite.  
**Solución:** Cerrar todas las instancias de la app.

### Error al rebuild módulos nativos

```bash
npm run rebuild
# o
npm rebuild better-sqlite3 --build-from-source
```

### Vite dev server no inicia

Verificar que el puerto 5173 esté libre:

```bash
# Windows
netstat -ano | findstr :5173

# Linux/Mac
lsof -i :5173
```

### Build falla

1. Limpiar cache: `rm -rf node_modules dist dist-*`
2. Reinstalar: `npm install`
3. Rebuild: `npm run rebuild`
4. Build: `npm run build:electron`

---

## 📚 Recursos

- [Electron Docs](https://www.electronjs.org/docs)
- [React Docs](https://react.dev/)
- [better-sqlite3 Docs](https://github.com/WiseLibs/better-sqlite3/wiki)
- [Vite Docs](https://vitejs.dev/)

---

**Última actualización:** 17 de Diciembre, 2025  
**Versión del manual:** 1.0
