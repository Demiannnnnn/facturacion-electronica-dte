# 02 - ARQUITECTURA DEL SISTEMA
## Sistema de Facturación Electrónica B2B

**Versión:** 1.0.0  
**Última actualización:** 17 de Diciembre, 2025

---

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Arquitectura de Alto Nivel](#arquitectura-de-alto-nivel)
3. [Procesos de Electron](#procesos-de-electron)
4. [Capas del Sistema](#capas-del-sistema)
5. [Flujo de Datos](#flujo-de-datos)
6. [Seguridad](#seguridad)
7. [Almacenamiento](#almacenamiento)
8. [Patrones de Diseño](#patrones-de-diseño)
9. [Escalabilidad](#escalabilidad)
10. [Integración Externa](#integración-externa)

---

## 🎯 Visión General

El Sistema de Facturación Electrónica B2B es una aplicación de escritorio multiplataforma construida con **Electron**, que combina tecnologías web modernas (React) con capacidades nativas del sistema operativo.

### Características Arquitectónicas Clave

- **Offline-First:** Funciona sin conexión a internet
- **Multi-Proceso:** Separación entre UI y lógica de negocio
- **Base de Datos Local:** SQLite embebida
- **Seguridad:** Aislamiento de contexto y comunicación IPC segura
- **Multiplataforma:** Windows, macOS, Linux

---

## 🏗️ Arquitectura de Alto Nivel

```
┌─────────────────────────────────────────────────────────────────┐
│                        USUARIO FINAL                             │
│                     (PyME - Operador)                            │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   ELECTRON APPLICATION                           │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              RENDERER PROCESS (Chromium)                  │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │           React Application (UI)                   │  │  │
│  │  │  - Components (Dashboard, Facturas, Clientes...)  │  │  │
│  │  │  - React Router (SPA Navigation)                  │  │  │
│  │  │  - Context API (State Management)                 │  │  │
│  │  │  - Chart.js (Data Visualization)                  │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                         │                                 │  │
│  │                         │ window.api.*                    │  │
│  │                         ▼                                 │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │         Preload Script (Bridge)                    │  │  │
│  │  │  - contextBridge.exposeInMainWorld()              │  │  │
│  │  │  - Security: contextIsolation = true              │  │  │
│  │  │  - Exposes safe IPC API                           │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                         │                                       │
│                         │ IPC Communication                     │
│                         │ (ipcRenderer.invoke)                  │
│                         ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              MAIN PROCESS (Node.js)                       │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │           IPC Handlers Layer                       │  │  │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐          │  │  │
│  │  │  │   Auth   │ │ Clientes │ │Productos │          │  │  │
│  │  │  └──────────┘ └──────────┘ └──────────┘          │  │  │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐          │  │  │
│  │  │  │ Facturas │ │  Pagos   │ │ Reportes │          │  │  │
│  │  │  └──────────┘ └──────────┘ └──────────┘          │  │  │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐          │  │  │
│  │  │  │  Backup  │ │  Export  │ │   SII    │          │  │  │
│  │  │  └──────────┘ └──────────┘ └──────────┘          │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                         │                                 │  │
│  │                         ▼                                 │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │           Business Logic Layer                     │  │  │
│  │  │  - Validation                                      │  │  │
│  │  │  - Business Rules                                  │  │  │
│  │  │  - Calculations (IVA, totals, stock)              │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                         │                                 │  │
│  │                         ▼                                 │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │           Services Layer                           │  │  │
│  │  │  ┌──────────────┐  ┌──────────────┐               │  │  │
│  │  │  │ DTE Generator│  │ PDF Generator│               │  │  │
│  │  │  │ (XML for SII)│  │  (jsPDF)     │               │  │  │
│  │  │  └──────────────┘  └──────────────┘               │  │  │
│  │  │  ┌──────────────┐  ┌──────────────┐               │  │  │
│  │  │  │  API Client  │  │Excel Exporter│               │  │  │
│  │  │  │ (HTTP/HTTPS) │  │   (xlsx)     │               │  │  │
│  │  │  └──────────────┘  └──────────────┘               │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                         │                                 │  │
│  │                         ▼                                 │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │           Data Access Layer                        │  │  │
│  │  │  - better-sqlite3 (Synchronous API)               │  │  │
│  │  │  - Prepared Statements                            │  │  │
│  │  │  - Transactions (ACID)                            │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                         │                                 │  │
│  │                         ▼                                 │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │         SQLite Database (facturacion.db)           │  │  │
│  │  │  - 11 Tables                                       │  │  │
│  │  │  - Foreign Keys Enabled                            │  │  │
│  │  │  - Indexes for Performance                         │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              File System Access                           │  │
│  │  - PDFs: %APPDATA%/sistema-facturacion/facturas/        │  │
│  │  - Backups: %APPDATA%/sistema-facturacion/backups/      │  │
│  │  - Database: %APPDATA%/sistema-facturacion/             │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                         │
                         │ (Futuro - Fase 4)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND SERVER (Railway)                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Express.js REST API                          │  │
│  │  - /api/licenses/validate                                │  │
│  │  - /api/sii/enviar-dte                                   │  │
│  │  - /api/sii/estado/:trackId                              │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         PostgreSQL Database                               │  │
│  │  - licenses                                               │  │
│  │  - dte_logs                                               │  │
│  │  - companies                                              │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         ChileAPI Integration                              │  │
│  │  - Envío de DTE al SII                                   │  │
│  │  - Consulta de estado                                    │  │
│  │  - Descarga de PDF timbrado                              │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## ⚙️ Procesos de Electron

### Main Process (Node.js)

**Responsabilidades:**
- Crear y gestionar ventanas de la aplicación
- Acceso al sistema de archivos
- Acceso a la base de datos SQLite
- Comunicación con APIs externas
- Gestión del ciclo de vida de la aplicación
- Menú de aplicación
- Backups automáticos

**Tecnologías:**
- Node.js (incluido en Electron)
- better-sqlite3 (acceso a SQLite)
- bcrypt (hash de contraseñas)
- jsPDF (generación de PDFs)
- xlsx (exportación a Excel)

**Archivos Clave:**
```
electron-app/src/main/
├── main.js              # Entry point
├── menu.js              # Application menu
├── database/
│   └── connection.js    # DB initialization
├── ipc/                 # IPC handlers (11 archivos)
├── services/            # Business services
└── utils/               # Utilities
```

---

### Renderer Process (Chromium)

**Responsabilidades:**
- Renderizar la interfaz de usuario
- Manejar interacciones del usuario
- Gestión de estado local (React)
- Visualización de datos (gráficos)
- Navegación (SPA)

**Tecnologías:**
- React 18.2.0
- React Router 7.10.1
- Chart.js 4.5.1
- React Select 5.10.2

**Archivos Clave:**
```
electron-app/src/renderer/src/
├── main.jsx             # Entry point
├── App.jsx              # Main component
├── pages/               # Page components (9 páginas)
├── components/          # Shared components
└── context/             # React Context (Auth)
```

---

### Preload Script (Bridge)

**Responsabilidades:**
- Exponer API segura al renderer
- Actuar como puente entre procesos
- Prevenir acceso directo a Node.js desde renderer

**Seguridad:**
```javascript
// Configuración en main.js
webPreferences: {
  preload: path.join(__dirname, '../preload/preload.js'),
  nodeIntegration: false,        // ✅ Deshabilitado
  contextIsolation: true         // ✅ Habilitado
}
```

**API Expuesta:**
```javascript
// preload.js
contextBridge.exposeInMainWorld('api', {
  auth: { login, logout, register, ... },
  clientes: { create, getAll, update, delete, ... },
  productos: { ... },
  facturas: { ... },
  // ... más módulos
});
```

---

## 📊 Capas del Sistema

### 1. Presentation Layer (React)

**Componentes:**
- **Pages:** Vistas completas (Dashboard, Clientes, Facturas, etc.)
- **Components:** Componentes reutilizables (Layout, Sidebar)
- **Context:** Estado global (AuthContext)

**Responsabilidades:**
- Renderizar UI
- Capturar input del usuario
- Validación básica de formularios
- Navegación

**Patrón:** Component-Based Architecture

---

### 2. Communication Layer (IPC)

**Componentes:**
- **Preload Script:** Expone API segura
- **IPC Channels:** Canales de comunicación

**Responsabilidades:**
- Comunicación segura entre procesos
- Serialización/deserialización de datos
- Manejo de errores de comunicación

**Patrón:** Request-Response (async)

---

### 3. Application Layer (IPC Handlers)

**Componentes:**
- **Auth Handlers:** Autenticación y sesión
- **CRUD Handlers:** Clientes, Productos, Vendedores
- **Business Handlers:** Facturas, Pagos, Reportes
- **Utility Handlers:** Backup, Export, SII

**Responsabilidades:**
- Validación de entrada
- Aplicación de reglas de negocio
- Orquestación de servicios
- Manejo de errores

**Patrón:** Handler Pattern (similar a Controllers)

---

### 4. Business Logic Layer

**Componentes:**
- **Validators:** Validación de RUT, email, etc.
- **Calculators:** Cálculo de IVA, totales, descuentos
- **Formatters:** Formateo de montos, fechas

**Responsabilidades:**
- Lógica de negocio pura
- Cálculos complejos
- Validaciones avanzadas

**Patrón:** Service Layer

---

### 5. Services Layer

**Componentes:**
- **DTE Generator:** Generación de XML para SII
- **PDF Generator:** Generación de PDFs con jsPDF
- **Excel Exporter:** Exportación a Excel con xlsx
- **API Client:** Cliente HTTP para servidor backend

**Responsabilidades:**
- Integración con librerías externas
- Generación de documentos
- Comunicación con APIs

**Patrón:** Service Pattern

---

### 6. Data Access Layer

**Componentes:**
- **Database Connection:** Inicialización y gestión de SQLite
- **Query Builders:** Prepared statements
- **Transactions:** Manejo de transacciones ACID

**Responsabilidades:**
- Acceso a base de datos
- Ejecución de queries
- Manejo de transacciones
- Migraciones

**Patrón:** Repository Pattern (implícito)

---

### 7. Data Layer (SQLite)

**Componentes:**
- **facturacion.db:** Archivo de base de datos
- **11 Tablas:** users, clientes, productos, facturas, etc.

**Responsabilidades:**
- Persistencia de datos
- Integridad referencial
- Indexación para performance

**Tecnología:** SQLite 3 (better-sqlite3)

---

## 🔄 Flujo de Datos

### Flujo Típico: Crear Factura

```
1. Usuario completa formulario en React
   ↓
2. React valida datos básicos (campos requeridos)
   ↓
3. React llama: window.api.facturas.create(data)
   ↓
4. Preload invoca: ipcRenderer.invoke('facturas:create', data)
   ↓
5. Main Process recibe en handler 'facturas:create'
   ↓
6. Handler valida datos (cliente existe, productos tienen stock)
   ↓
7. Handler inicia transacción:
   a. Obtiene próximo folio
   b. Inserta factura
   c. Inserta items
   d. Actualiza stock de productos
   e. Commit transacción
   ↓
8. Servicio DTE Generator crea XML
   ↓
9. Servicio PDF Generator crea PDF
   ↓
10. PDF se guarda en filesystem
    ↓
11. Handler retorna: {success: true, data: {id, folio, ...}}
    ↓
12. React recibe respuesta
    ↓
13. React actualiza UI (muestra factura creada)
    ↓
14. React navega a lista de facturas
```

### Flujo de Autenticación

```
1. Usuario ingresa credenciales
   ↓
2. React llama: window.api.auth.login({username, password})
   ↓
3. Handler auth:login recibe request
   ↓
4. Handler busca usuario en BD
   ↓
5. Handler compara hash con bcrypt.compare()
   ↓
6. Si match:
   a. Guarda usuario en sesión (memoria)
   b. Retorna {success: true, user: {...}}
   ↓
7. React actualiza AuthContext
   ↓
8. React redirige a Dashboard
```

---

## 🔒 Seguridad

### Context Isolation

```javascript
// main.js
webPreferences: {
  contextIsolation: true,  // ✅ Renderer no puede acceder a Node.js
  nodeIntegration: false   // ✅ Deshabilitado
}
```

**Beneficio:** Previene que código malicioso en renderer acceda a APIs de Node.js.

---

### Preload Script Seguro

```javascript
// preload.js
const { contextBridge, ipcRenderer } = require('electron');

// ✅ CORRECTO: Exponer solo funciones específicas
contextBridge.exposeInMainWorld('api', {
  clientes: {
    create: (data) => ipcRenderer.invoke('clientes:create', data)
  }
});

// ❌ INCORRECTO: Exponer ipcRenderer directamente
// contextBridge.exposeInMainWorld('ipcRenderer', ipcRenderer);
```

---

### Validación de Entrada

**En Renderer (React):**
```javascript
// Validación básica
if (!formData.razon_social) {
  setError('Razón social es requerida');
  return;
}
```

**En Main (Handler):**
```javascript
// Validación completa
if (!data.razon_social || data.razon_social.length < 3) {
  return { success: false, error: 'Razón social inválida' };
}
```

**Principio:** Never trust client input

---

### SQL Injection Prevention

```javascript
// ✅ CORRECTO: Prepared statements
const stmt = db.prepare('SELECT * FROM clientes WHERE rut = ?');
const cliente = stmt.get(rut);

// ❌ INCORRECTO: String concatenation
const query = `SELECT * FROM clientes WHERE rut = '${rut}'`;
```

---

### Password Hashing

```javascript
// Registro
const hash = await bcrypt.hash(password, 10);  // 10 salt rounds

// Login
const match = await bcrypt.compare(password, hash);
```

**Algoritmo:** bcrypt (resistente a rainbow tables y brute force)

---

## 💾 Almacenamiento

### Ubicaciones

**Windows:**
```
Database:  C:\Users\<user>\AppData\Roaming\sistema-facturacion\facturacion.db
PDFs:      C:\Users\<user>\AppData\Roaming\sistema-facturacion\facturas\
Backups:   C:\Users\<user>\AppData\Roaming\sistema-facturacion\backups\
```

**macOS:**
```
Database:  ~/Library/Application Support/sistema-facturacion/facturacion.db
PDFs:      ~/Library/Application Support/sistema-facturacion/facturas/
Backups:   ~/Library/Application Support/sistema-facturacion/backups/
```

**Linux:**
```
Database:  ~/.config/sistema-facturacion/facturacion.db
PDFs:      ~/.config/sistema-facturacion/facturas/
Backups:   ~/.config/sistema-facturacion/backups/
```

---

### Estrategia de Backup

**Automático:**
- **Trigger:** Al cerrar aplicación
- **Frecuencia:** Cada cierre
- **Retención:** Últimos 30 backups
- **Formato:** `backup_YYYY-MM-DD_HH-MM-SS.db`

**Manual:**
- Disponible desde menú (en desarrollo UI)
- Permite elegir ubicación

**Restauración:**
- Copiar backup sobre facturacion.db
- Requiere reinicio de aplicación

---

## 🎨 Patrones de Diseño

### 1. Multi-Process Architecture (Electron)

Separación entre UI (renderer) y lógica (main).

**Beneficios:**
- Seguridad
- Estabilidad (crash en renderer no afecta main)
- Performance (procesos independientes)

---

### 2. Handler Pattern

Cada acción IPC tiene un handler dedicado.

```javascript
ipcMain.handle('clientes:create', async (event, data) => {
  // Handler logic
});
```

**Beneficios:**
- Separación de responsabilidades
- Fácil testing
- Mantenibilidad

---

### 3. Transaction Script

Lógica de negocio organizada en transacciones.

```javascript
const createFactura = db.transaction((data, items) => {
  // Multiple operations in single transaction
});
```

**Beneficios:**
- ACID compliance
- Consistencia de datos
- Rollback automático en errores

---

### 4. Context API (React)

Estado global compartido entre componentes.

```javascript
<AuthProvider>
  <App />
</AuthProvider>
```

**Beneficios:**
- Evita prop drilling
- Estado centralizado
- Fácil acceso desde cualquier componente

---

### 5. Service Layer

Servicios reutilizables para funcionalidades específicas.

```javascript
// services/dte-generator.js
export function generarDTE(factura, emisor, cliente, items) {
  // Generate XML
}
```

**Beneficios:**
- Reutilización
- Testabilidad
- Separación de concerns

---

## 📈 Escalabilidad

### Limitaciones Actuales

**SQLite:**
- Concurrencia limitada (single writer)
- Tamaño máximo recomendado: ~100GB (suficiente para PyMEs)

**Electron:**
- Memoria: ~100-200MB en uso normal
- CPU: Bajo consumo (operaciones síncronas)

---

### Estrategias de Optimización

**1. Índices en Base de Datos**
```sql
CREATE INDEX idx_facturas_fecha ON facturas(fecha);
CREATE INDEX idx_facturas_cliente ON facturas(cliente_id);
```

**2. Paginación**
```javascript
// Futuro: Implementar paginación en listas grandes
const ITEMS_PER_PAGE = 50;
```

**3. Lazy Loading**
```javascript
// Cargar datos solo cuando se necesitan
useEffect(() => {
  loadData();
}, []);
```

**4. Debouncing en Búsquedas**
```javascript
// Evitar búsquedas en cada keystroke
const debouncedSearch = debounce(search, 300);
```

---

### Migración Futura (Fase 4)

**Opción 1: Sincronización con Servidor**
- SQLite local + PostgreSQL remoto
- Sincronización bidireccional
- Offline-first con sync cuando hay internet

**Opción 2: Modo Híbrido**
- Datos críticos en local (SQLite)
- Datos históricos en servidor (PostgreSQL)
- API para consultas complejas

---

## 🌐 Integración Externa

### ChileAPI (SII) - En Desarrollo

**Flujo:**
```
Electron App → Servidor Backend → ChileAPI → SII
```

**Endpoints:**
- `POST /api/sii/enviar-dte` - Enviar DTE
- `GET /api/sii/estado/:trackId` - Consultar estado
- `GET /api/sii/pdf/:folio` - Descargar PDF timbrado

**Autenticación:**
- API Key en headers
- JWT para sesiones

---

### Sistema de Licencias - Futuro

**Flujo:**
```
Electron App → Servidor Backend → Validación → Respuesta
```

**Validación:**
- License key + Machine ID
- Verificación de expiración
- Límite de dispositivos

---

## 📚 Referencias

- [Electron Security](https://www.electronjs.org/docs/latest/tutorial/security)
- [React Best Practices](https://react.dev/learn)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [better-sqlite3 Wiki](https://github.com/WiseLibs/better-sqlite3/wiki)

---

**Última actualización:** 17 de Diciembre, 2025  
**Versión:** 1.0
