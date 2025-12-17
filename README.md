# Sistema de Facturación Electrónica B2B para Chile

Sistema de escritorio multiplataforma para gestión de facturación electrónica, diseñado específicamente para PyMEs chilenas que necesitan emitir documentos tributarios electrónicos (DTE) cumpliendo con las normativas del SII.

**Versión:** 1.0.0
**Estado:** 75-80% Completado (MVP funcional)
**Licencia:** UNLICENSED - Uso privado

---

## 🎯 Características Principales

- 💻 **Desktop nativo** - Funciona sin conexión a internet (offline-first)
- 📱 **Multiplataforma** - Windows, macOS, Linux
- 💾 **Base de datos local** - SQLite embebida, tus datos siempre accesibles
- 📄 **Facturación electrónica** - DTE formato XML según estándar SII
- 📊 **Dashboard interactivo** - Análisis de ventas con Chart.js
- 🔐 **Seguro** - Autenticación local con bcrypt, datos protegidos
- 📦 **Gestión completa** - Clientes, productos, vendedores, inventario
- 💰 **Control de pagos** - Cuentas por cobrar, pagos parciales
- 📤 **Exportación** - Excel para clientes, productos y facturas
- 🔄 **Backup automático** - Respaldos automáticos de tu información

---

## 🚀 Inicio Rápido

### Prerequisitos

- Node.js 20.x LTS
- npm 9.x o superior

### Instalación

```bash
# 1. Clonar repositorio
git clone <tu-repo>
cd Sistema-facturaje-inventario

# 2. Instalar dependencias de la app
cd electron-app
npm install

# 3. Ejecutar en modo desarrollo
npm run dev
```

La aplicación se abrirá automáticamente.

### Primera Ejecución

1. Se mostrará pantalla de registro (primera vez)
2. Crear usuario administrador
3. Configurar datos del emisor (tu empresa) en `/configuracion/emisor`
4. ¡Listo para usar!

---

## 📚 Documentación

### Para Usuarios

- **[Manual de Usuario](docs/08-MANUAL_USUARIO.md)** - Guía paso a paso para usar la aplicación
- **[Funcionalidades](docs/06-FUNCIONALIDADES.md)** - Lista completa de características

### Para Desarrolladores

- **[00-ÍNDICE](docs/00-INDICE.md)** - Índice maestro de toda la documentación
- **[01-Visión General](docs/01-VISION_GENERAL.md)** - Overview del proyecto
- **[02-Arquitectura](docs/02-ARQUITECTURA.md)** - Arquitectura del sistema
- **[03-Base de Datos](docs/03-BASE_DE_DATOS.md)** - Esquema completo de BD
- **[07-Manual Técnico](docs/07-MANUAL_TECNICO.md)** - Guía para desarrolladores
- **[09-Roadmap](docs/09-ROADMAP.md)** - Plan de desarrollo

---

## 🛠️ Stack Tecnológico

### Frontend (Renderer Process)
- **React** 18.2.0 - Framework UI
- **React Router** 7.10.1 - Navegación
- **Chart.js** 4.5.1 - Gráficos interactivos
- **React Select** 5.10.2 - Selectores avanzados
- **Vite** 5.0.8 - Build tool y dev server

### Backend (Main Process)
- **Electron** 28.1.0 - Framework desktop
- **better-sqlite3** 9.2.2 - Base de datos SQLite
- **bcrypt** 6.0.0 - Hash de contraseñas
- **jsPDF** 2.5.2 - Generación de PDFs
- **xlsx** 0.18.5 - Exportación a Excel
- **xml2js** 0.6.2 - Procesamiento de XML

---

## 📊 Estado del Proyecto

### Completado (75-80%)

✅ **Core Funcional**
- Autenticación y seguridad
- CRUD de Clientes, Productos, Vendedores
- Sistema de facturación completo
- Generación de PDF profesional
- Generación de XML DTE (Tipo 33)
- Dashboard con gráficos
- Sistema de pagos (backend)
- Backup automático
- Exportación a Excel

### En Desarrollo (20-25%)

⚠️ **Integración SII**
- Firma digital de XML
- Envío real al SII (actualmente en modo mock)
- Consulta de estado de DTE
- Guías de Despacho
- Notas de Crédito/Débito

❌ **Servidor Backend**
- API de licencias
- Integración con ChileAPI
- Base de datos PostgreSQL
- Cron jobs

### Pendiente

📋 **Features Avanzadas**
- UI de Cuentas por Cobrar
- Importación desde Excel
- Cotizaciones
- Inventario avanzado (categorías, códigos de barras)
- Multi-usuario local

Ver [Roadmap completo](docs/09-ROADMAP.md) para más detalles.

---

## 🔧 Comandos de Desarrollo

```bash
# Desarrollo
npm run dev              # Ejecutar app en desarrollo (Vite + Electron)
npm run dev:vite        # Solo frontend (puerto 5173)
npm run dev:electron    # Solo Electron

# Build
npm run build:renderer  # Build del frontend (Vite)
npm run build           # Build completo + instalador
npm start               # Ejecutar versión empaquetada

# Utilidades
npx electron-rebuild -f -w better-sqlite3  # Recompilar nativos
```

---

## 📁 Estructura del Proyecto

```
Sistema-facturaje-inventario/
├── electron-app/              # Aplicación Electron
│   ├── src/
│   │   ├── main/             # Proceso principal (Node.js)
│   │   │   ├── database/     # Conexión y schema SQLite
│   │   │   ├── ipc/          # Handlers IPC (auth, clientes, facturas, etc.)
│   │   │   ├── services/     # Servicios (PDF, XML, Excel)
│   │   │   └── utils/        # Utilidades
│   │   ├── preload/          # Script de preload (bridge seguro)
│   │   └── renderer/         # UI React
│   │       └── src/
│   │           ├── pages/    # Páginas de la app
│   │           ├── components/ # Componentes reutilizables
│   │           ├── context/  # Context API
│   │           └── utils/    # Utilidades de frontend
│   ├── vite.config.js
│   ├── electron-builder.yml
│   └── package.json
│
├── server/                    # Backend (Node.js/Express)
│   └── src/
│       └── index.js          # API server (en desarrollo)
│
├── docs/                      # Documentación completa
│   ├── 00-INDICE.md          # Índice maestro
│   ├── 01-VISION_GENERAL.md  # Overview
│   ├── 03-BASE_DE_DATOS.md   # Schema BD
│   ├── 06-FUNCIONALIDADES.md # Features
│   ├── 09-ROADMAP.md         # Roadmap
│   └── CHANGELOG.md          # Historial de cambios
│
├── README.md                  # Este archivo
└── PROXIMOS_PASOS.md         # Próximos pasos de desarrollo
```

---

## 🎨 Capturas de Pantalla

### Dashboard
![Dashboard](docs/screenshots/dashboard.png) *(pendiente)*

### Facturación
![Factura](docs/screenshots/factura.png) *(pendiente)*

---

## 🔐 Seguridad

- ✅ Context isolation habilitado
- ✅ Node integration deshabilitado
- ✅ Preload script para exponer API segura
- ✅ Contraseñas hasheadas con bcrypt (10 salt rounds)
- ✅ Prepared statements para prevenir SQL injection
- ✅ Validación de RUT chileno (módulo 11)
- ✅ Datos almacenados localmente en SQLite

---

## 📦 Build para Producción

```bash
# 1. Build del frontend
cd electron-app
npm run build:renderer

# 2. Generar instalador
npm run build

# Resultado:
# dist/Sistema-Facturacion-Setup-1.0.0.exe (Windows)
# dist/Sistema-Facturacion-1.0.0.dmg (macOS)
# dist/Sistema-Facturacion-1.0.0.AppImage (Linux)
```

---

## 🐛 Troubleshooting

### Error con better-sqlite3

```bash
npm install better-sqlite3
npx electron-rebuild -f -w better-sqlite3
```

### Error "window.api is undefined"

Verificar que preload.js está cargado en main.js:
```javascript
webPreferences: {
  preload: path.join(__dirname, '../preload/preload.js')
}
```

### Base de datos no inicializa

Verificar que `initDatabase()` se llama antes de usar `getDatabase()` en main.js.

Ver más en [docs/07-MANUAL_TECNICO.md](docs/07-MANUAL_TECNICO.md).

---

## 🤝 Contribuir

Este es un proyecto privado. Para contribuir:

1. Contactar al autor
2. Fork del repositorio (si autorizado)
3. Crear feature branch (`git checkout -b feature/AmazingFeature`)
4. Commit cambios (`git commit -m 'feat: Add AmazingFeature'`)
5. Push a branch (`git push origin feature/AmazingFeature`)
6. Abrir Pull Request

### Convenciones de Commits

- `feat:` - Nueva funcionalidad
- `fix:` - Corrección de bug
- `docs:` - Cambios en documentación
- `style:` - Formato, puntuación
- `refactor:` - Refactorización de código
- `test:` - Agregar tests
- `chore:` - Mantenimiento

---

## 📝 Changelog

Ver [CHANGELOG.md](docs/CHANGELOG.md) para historial completo de cambios.

### Versión 1.0.0 (13 Dic 2025)
- ✅ Implementación inicial del MVP
- ✅ CRUD completo de clientes, productos, vendedores
- ✅ Sistema de facturación con PDF y XML
- ✅ Dashboard con gráficos interactivos
- ✅ Sistema de backup automático
- ✅ Exportación a Excel

---

## 📞 Contacto y Soporte

**Desarrollador:** Demian Maturana
**Email:** dmaturana22@alumnos.utalca.cl
**Proyecto:** Sistema de Facturación Electrónica B2B

---

## 📄 Licencia

**UNLICENSED** - Todos los derechos reservados.

Este software es propietario y no está disponible para distribución pública sin autorización expresa del autor.

---

## 🙏 Agradecimientos

- Electron Team - Framework desktop
- React Team - Biblioteca UI
- Chart.js - Gráficos interactivos
- Better SQLite3 - Base de datos local
- Comunidad open source

---

## 🗺️ Próximos Pasos

Ver [docs/09-ROADMAP.md](docs/09-ROADMAP.md) para plan completo de desarrollo.

**Próximas funcionalidades:**
1. Firma digital y envío real al SII
2. Guías de Despacho y Notas de Crédito
3. UI de Cuentas por Cobrar
4. Servidor backend con sistema de licencias
5. Build de producción con instalador

---

**Desarrollado con ❤️ para PyMEs chilenas**

**Última actualización:** 16 de Diciembre, 2025
