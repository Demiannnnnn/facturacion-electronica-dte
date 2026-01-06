# 01 - VISIÓN GENERAL DEL PROYECTO
## Sistema de Facturación Electrónica B2B para Chile

**Versión:** 1.0.0
**Estado:** 75-80% Completado
**Última actualización:** 16 de Diciembre, 2025

---

## 📋 Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Problema que Resuelve](#problema-que-resuelve)
3. [Solución](#solución)
4. [Características Principales](#características-principales)
5. [Stack Tecnológico](#stack-tecnológico)
6. [Arquitectura de Alto Nivel](#arquitectura-de-alto-nivel)
7. [Estado del Proyecto](#estado-del-proyecto)
8. [Roadmap de Desarrollo](#roadmap-de-desarrollo)

---

## 🎯 Resumen Ejecutivo

**Sistema de Facturación Electrónica B2B** es una aplicación de escritorio multiplataforma diseñada específicamente para PyMEs chilenas que necesitan emitir documentos tributarios electrónicos (DTE) cumpliendo con las normativas del SII (Servicio de Impuestos Internos de Chile).

### Características Clave

- 💻 **Desktop nativo** - Funciona sin conexión a internet (offline-first)
- 📱 **Multiplataforma** - Windows, macOS, Linux
- 💾 **Base de datos local** - SQLite embebida, sin dependencia de servidores externos
- 📄 **Facturación completa** - DTE formato XML según estándar SII
- 📊 **Dashboard y reportes** - Análisis de ventas en tiempo real
- 🔐 **Seguro** - Autenticación local, datos cifrados

---

## 🔍 Problema que Resuelve

### Desafíos de las PyMEs Chilenas

1. **Alto costo de software de facturación**
   - Soluciones empresariales cuestan $50.000-$200.000 CLP/mes
   - Requieren contratos anuales
   - Funcionalidades innecesarias para PyMEs

2. **Dependencia de internet**
   - Sistemas SaaS requieren conexión constante
   - Problemas en zonas rurales o con internet inestable

3. **Curva de aprendizaje**
   - Interfaces complejas diseñadas para grandes empresas
   - Falta de soporte en español
   - Requieren capacitación costosa

4. **Cumplimiento tributario**
   - Normativa SII cambiante
   - Multas por documentos mal emitidos
   - Procesos manuales propensos a errores

---

## ✨ Solución

### Propuesta de Valor

**Un sistema de facturación simple, potente y accesible que permite a las PyMEs:**

- ✅ Emitir facturas electrónicas válidas ante el SII
- ✅ Trabajar sin conexión a internet (modo offline)
- ✅ Gestionar clientes, productos y vendedores
- ✅ Generar reportes tributarios automáticos
- ✅ Controlar inventario y stock
- ✅ Analizar ventas con dashboard interactivo
- ✅ Exportar datos a Excel
- ✅ Backups automáticos de información

### Ventajas Competitivas

| Característica | Sistema Facturación | Competencia SaaS |
|----------------|---------------------|------------------|
| Costo | Licencia única | $50K-$200K/mes |
| Internet | No requerido | Requerido |
| Velocidad | Instantáneo (local) | Depende de conexión |
| Datos | Tuyos, en tu equipo | En la nube |
| Personalización | Código modificable | Limitada |
| Soporte | Documentación completa | Chat/Ticket |

---

## 🎨 Características Principales

### ✅ Funcionalidades Implementadas (v1.0)

#### 1. **Gestión de Clientes**
- CRUD completo (Crear, Leer, Actualizar, Eliminar)
- Validación de RUT chileno (módulo 11)
- Selector de regiones y comunas de Chile
- Búsqueda por RUT, razón social o email
- Asignación de vendedor y condiciones de crédito
- Prevención de eliminación si tiene facturas

#### 2. **Gestión de Productos**
- Catálogo de productos con código único
- Control de stock automático
- Precios en CLP con formato chileno
- Búsqueda por código o nombre
- Actualización de stock al facturar

#### 3. **Gestión de Vendedores**
- Registro de vendedores con comisiones
- Asignación a clientes y facturas
- Reportes de ventas por vendedor
- Estado activo/inactivo

#### 4. **Facturación Electrónica**
- Generación de Facturas Electrónicas (Tipo 33 DTE)
- Folios automáticos consecutivos
- Múltiples items por factura
- Cálculo automático de IVA (19%)
- Descuentos por item
- Formas de pago: Contado y Crédito
- Generación de XML DTE según formato SII
- Generación de PDF profesional
- Almacenamiento local de PDFs

#### 5. **Sistema de Pagos**
- Registro de pagos parciales
- Cálculo automático de saldo pendiente
- Estados: Pendiente → Parcial → Pagada
- Historial de pagos por factura
- Reportes de cuentas por cobrar

#### 6. **Dashboard Interactivo**
- Tarjetas de estadísticas (Ventas totales, hoy, pendientes, stock)
- Gráfico de ventas últimos 7 días (Chart.js)
- Top 5 productos más vendidos
- Estado de facturas (pendientes, pagadas, vencidas)
- Facturas recientes con badges de estado

#### 7. **Reportes**
- Reporte de Ventas por período
- Reporte de Facturas emitidas
- Análisis de Clientes (top 10, sin compras, por región)
- Reporte de Productos (inventario, más vendidos)
- Reporte de Pagos y Cobranzas
- Resumen Tributario para declaración de impuestos

#### 8. **Exportación de Datos**
- Exportar Clientes a Excel (Ctrl+Shift+C)
- Exportar Productos a Excel (Ctrl+Shift+P)
- Exportar Facturas a Excel (Ctrl+Shift+F)
- Formato profesional con columnas ajustadas
- Apertura automática de archivos

#### 9. **Backup y Seguridad**
- Backup automático al cerrar aplicación
- Backup manual desde menú
- Restauración desde backup
- Retención de últimos 30 backups
- Autenticación con bcrypt (hash seguro)

#### 10. **Configuración**
- Configuración de datos del emisor (empresa)
- Cambio de contraseña seguro
- Datos de resolución SII

---

## 🛠️ Stack Tecnológico

### Frontend (Renderer Process)

```
Framework UI: React 18.2.0
Enrutamiento: React Router 7.10.1
Componentes: React Select 5.10.2
Gráficos: Chart.js 4.5.1 + react-chartjs-2 5.3.1
Estilos: CSS-in-JS (inline styles)
Build: Vite 5.0.8
```

### Backend (Main Process)

```
Runtime: Electron 28.1.0 (Node.js)
Base de datos: better-sqlite3 9.2.2 (SQLite)
Autenticación: bcrypt 6.0.0
PDF: jsPDF 2.5.2 + jspdf-autotable 5.0.2
Excel: xlsx 0.18.5
XML: xml2js 0.6.2
IDs: uuid 9.0.1
```

### DevOps

```
Build: electron-builder 24.9.1
Hot Reload: Vite HMR
Rebuild Nativos: electron-rebuild 3.2.9
Multi-proceso: concurrently 8.2.2
Cross-platform: cross-env 7.0.3
```

### Lenguajes

- **JavaScript ES6+** - Código moderno con async/await
- **JSX** - Templates de React
- **SQL** - Queries directos a SQLite
- **XML** - Generación de DTE

---

## 🏗️ Arquitectura de Alto Nivel

### Patrón: Cliente-Servidor Local

```
┌─────────────────────────────────────────────────────────┐
│                 RENDERER PROCESS (React)                 │
│  ┌────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │  Dashboard │  │   Clientes   │  │    Facturas     │ │
│  └────────────┘  └──────────────┘  └─────────────────┘ │
│              UI Components + React Router                │
│                         │                                │
│                         │ window.api.xxx()               │
│                         ▼                                │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Preload Script (contextBridge)           │  │
│  │     Expone API segura al renderer                │  │
│  └───────────────────┬──────────────────────────────┘  │
└────────────────────────┼────────────────────────────────┘
                         │ IPC (ipcRenderer.invoke)
                         │
┌────────────────────────┼────────────────────────────────┐
│                        ▼                                 │
│              MAIN PROCESS (Node.js)                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │              IPC Handlers                        │  │
│  │  ┌──────┐ ┌─────────┐ ┌─────────┐ ┌──────────┐  │  │
│  │  │ Auth │ │ Clientes│ │Productos│ │ Facturas │  │  │
│  │  └──────┘ └─────────┘ └─────────┘ └──────────┘  │  │
│  └────────────────────┬─────────────────────────────┘  │
│                       │                                 │
│                       ▼                                 │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Services                            │  │
│  │  ┌────────────┐  ┌───────────┐  ┌────────────┐  │  │
│  │  │ DTE Gen    │  │Export Excel│  │ API Client │  │  │
│  │  └────────────┘  └───────────┘  └────────────┘  │  │
│  └────────────────────┬─────────────────────────────┘  │
│                       │                                 │
│                       ▼                                 │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Database Layer (better-sqlite3)          │  │
│  │              facturacion.db (SQLite)             │  │
│  │  11 tablas: users, clientes, productos,         │  │
│  │  facturas, factura_items, vendedores, pagos...  │  │
│  └──────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘

                         │ (Futuro)
                         ▼
        ┌────────────────────────────────┐
        │      SERVIDOR BACKEND          │
        │    (Railway - PostgreSQL)      │
        │  - Sistema de Licencias        │
        │  - Integración ChileAPI → SII  │
        └────────────────────────────────┘
```

### Flujo de Datos Típico

1. **Usuario** interactúa con componente React
2. **React** llama `window.api.xxx()` (expuesto por preload)
3. **Preload** invoca IPC channel: `ipcRenderer.invoke('xxx:action', data)`
4. **Main Process** recibe en `ipcMain.handle('xxx:action', handler)`
5. **Handler** valida datos, consulta/modifica **BD SQLite**
6. **Handler** puede llamar **Services** (PDF, Excel, DTE)
7. **Handler** retorna resultado: `{success: boolean, data: any, error?: string}`
8. **React** recibe respuesta, actualiza estado y UI

---

## 📊 Estado del Proyecto

### Métricas de Desarrollo

```
Líneas de código:    ~15,000+
Componentes React:   11 páginas + 5 componentes compartidos
IPC Handlers:        40+ handlers en 7 módulos
Tablas BD:           11 tablas con relaciones
Dependencias:        20+ librerías de producción
```

### Estado de Completitud

| Área | Completitud | Detalles |
|------|-------------|----------|
| **Core de Facturación** | ✅ 100% | Crear, listar, PDF, XML DTE |
| **Gestión de Datos** | ✅ 95% | CRUD completo de clientes, productos, vendedores |
| **Reportes** | ⚠️ 80% | Backend completo, UI con placeholders |
| **Dashboard** | ✅ 100% | Gráficos, estadísticas, facturas recientes |
| **Exportación** | ✅ 100% | Excel para clientes, productos, facturas |
| **Backup** | ✅ 100% | Automático y manual |
| **Integración SII** | ⚠️ 40% | XML generado, envío en desarrollo |
| **Sistema de Pagos** | ⚠️ 70% | Backend completo, falta UI |
| **Servidor Backend** | ❌ 10% | Solo esqueleto básico |
| **Documentos Adicionales** | ❌ 0% | Guías despacho, notas crédito |

**PROGRESO GENERAL: 75-80%**

---

## 🗺️ Roadmap de Desarrollo

### ✅ FASE 1 - MVP Core (Completado)

**Objetivo:** Sistema funcional para facturación básica offline

- [x] Estructura de proyecto Electron + React + Vite
- [x] Base de datos SQLite con schema completo
- [x] Autenticación local
- [x] CRUD Clientes, Productos, Vendedores
- [x] Formulario de facturación con items
- [x] Generación de PDF profesional
- [x] Dashboard con gráficos interactivos
- [x] Sistema de backup automático
- [x] Exportación a Excel

**Estado:** ✅ Completado al 100%

---

### 🔄 FASE 2 - Integración SII (En Desarrollo)

**Objetivo:** Cumplimiento tributario completo

- [x] Generación de XML DTE (Tipo 33)
- [ ] Firma digital de XML
- [ ] Envío a servidor SII vía ChileAPI
- [ ] Consulta de estado de DTE
- [ ] Descarga de PDF timbrado
- [ ] Guías de Despacho (Tipo 52)
- [ ] Notas de Crédito (Tipo 61)
- [ ] Notas de Débito (Tipo 56)

**Estado:** ⚠️ 40% Completado

---

### 📋 FASE 3 - Features Avanzadas (Pendiente)

**Objetivo:** Funcionalidades competitivas

- [ ] UI de Cuentas por Cobrar
- [ ] UI de Reportes con datos reales
- [ ] Importación de Excel (clientes/productos)
- [ ] Productos exentos de IVA
- [ ] Cotizaciones
- [ ] Inventario avanzado (categorías, códigos de barras)
- [ ] Logo empresa en PDFs
- [ ] Múltiples usuarios locales

**Estado:** ❌ 0% Completado

---

### 🌐 FASE 4 - Servidor y Distribución (Futuro)

**Objetivo:** Producto comercializable

- [ ] Servidor backend en Railway/Heroku
- [ ] Sistema de licencias con validación
- [ ] Integración real ChileAPI → SII
- [ ] Cron jobs para envío automático
- [ ] Panel de administración de licencias
- [ ] Instalador con firma digital
- [ ] Auto-actualización
- [ ] Manual de usuario con videos
- [ ] Sitio web de producto

**Estado:** ❌ 10% Completado (solo esqueleto de servidor)

---

## 🎯 Público Objetivo

### Usuario Final

- **PyMEs chilenas** con 1-50 empleados
- **Sectores:** Comercio, distribución, servicios
- **Facturación:** 10-500 facturas/mes
- **Ubicación:** Todo Chile (especialmente zonas con internet limitado)
- **Conocimientos técnicos:** Básicos a intermedios

### Casos de Uso

1. **Ferretería local** - 30 facturas/día, internet inestable
2. **Distribuidor de alimentos** - 100 clientes, crédito a 30 días
3. **Taller mecánico** - Facturación esporádica, necesita simpleza
4. **Comercio rural** - Sin conexión internet constante

---

## 💡 Diferenciadores

### vs. Software Tradicional

- ✅ **Sin suscripción mensual** - Licencia única
- ✅ **Offline-first** - No requiere internet
- ✅ **Datos locales** - No dependes de terceros
- ✅ **Rápido** - Base de datos local

### vs. SaaS Moderno

- ✅ **Sin latencia** - Todo es instantáneo
- ✅ **Privacidad** - Tus datos no salen de tu equipo
- ✅ **Sin límites** - No hay restricción de facturas/mes
- ✅ **Personalizable** - Código abierto (opcional)

---

## 📞 Contacto

**Desarrollador:** Demian Maturana
**Email:** dmaturana22@alumnos.utalca.cl
**Proyecto:** Sistema de Facturación Electrónica B2B
**Repositorio:** [GitHub] (si aplica)

---

## 📄 Licencia

**UNLICENSED** - Uso privado

Todos los derechos reservados. Este software es propietario y no está disponible para distribución pública sin autorización expresa del autor.

---

## 📚 Siguiente Lectura

- **Para arquitectura detallada** → [02-ARQUITECTURA.md](./02-ARQUITECTURA.md)
- **Para base de datos** → [03-BASE_DE_DATOS.md](./03-BASE_DE_DATOS.md)
- **Para desarrollo** → [07-MANUAL_TECNICO.md](./07-MANUAL_TECNICO.md)
- **Para usar la app** → [08-MANUAL_USUARIO.md](./08-MANUAL_USUARIO.md)

---

**Última actualización:** 16 de Diciembre, 2025
