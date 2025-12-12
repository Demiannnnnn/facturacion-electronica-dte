# Sistema de Facturación Electrónica B2B

Sistema de facturación electrónica desktop para PyMEs en Chile.

## Características

- 📱 Aplicación desktop multiplataforma (Electron)
- 💾 Base de datos local SQLite
- 🔄 Sincronización con servidor
- 📄 Generación de DTE (XML) y PDF
- 🏦 Integración con SII vía ChileAPI
- 💰 Gestión de ventas a crédito
- 📊 Reportes y dashboard
- 📦 Importación masiva desde Excel

## Stack Tecnológico

### Cliente (Electron App)
- Electron v28.x
- React v18.x
- Vite v5.x
- SQLite3 v5.x
- jsPDF, xlsx

### Servidor
- Node.js v20.x LTS
- Express v4.x
- PostgreSQL v15.x
- node-cron v3.x

## Estructura del Proyecto

```
facturacion-app/
├── electron-app/        # Aplicación desktop
│   ├── src/
│   │   ├── main/       # Proceso principal Electron
│   │   ├── renderer/   # UI React
│   │   └── preload/    # Bridge seguro
│   └── assets/
├── server/             # Backend Node.js
│   └── src/
├── docs/               # Documentación
└── scripts/            # Scripts útiles
```

## Setup Desarrollo

Ver documentacion/latex.pdf para guía completa de implementación.

## Autor

Demian Maturana - Diciembre 2025
