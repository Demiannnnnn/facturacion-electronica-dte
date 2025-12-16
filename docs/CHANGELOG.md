# Changelog - Sistema de Facturación Electrónica

## [Unreleased]

### Added - 2025-12-16

#### ✨ Exportación a Excel desde Menú

**Descripción:**
Se implementó la funcionalidad completa de exportación de datos a Excel accesible desde el menú de la aplicación.

**Funcionalidades:**
- Exportar Clientes a Excel con todos sus datos (RUT, Razón Social, Giro, Dirección, Región, Comuna, etc.)
- Exportar Productos a Excel con información completa (Código, Nombre, Descripción, Precio, Stock)
- Exportar Facturas a Excel con datos del cliente y montos (Folio, Cliente, Fechas, Totales, Estado)

**Acceso:**
- Menú: `Archivo` → `Exportar` → Seleccionar opción
- Atajos de teclado:
  - `Ctrl+Shift+C` - Exportar Clientes
  - `Ctrl+Shift+P` - Exportar Productos
  - `Ctrl+Shift+F` - Exportar Facturas

**Características técnicas:**
- Formato profesional con columnas ajustadas automáticamente
- Fechas formateadas en DD/MM/YYYY
- Diálogo para seleccionar ubicación de guardado
- Apertura automática del archivo después de exportar
- Validación de datos (muestra mensaje si no hay datos para exportar)
- Manejo de errores con mensajes claros al usuario

**Archivos creados:**
- `src/main/services/exportExcel.js` - Servicio de exportación con funciones para cada tipo de dato
- `src/main/ipc/export.js` - IPC handlers para comunicación entre procesos

**Archivos modificados:**
- `src/main/main.js` - Registro de handlers de exportación
- `src/main/menu.js` - Agregado submenú "Exportar" con 3 opciones
- `src/preload/preload.js` - Exposición de API de exportación y listener de eventos del menú
- `src/renderer/src/App.jsx` - Listener global para eventos del menú

**Dependencias:**
- `xlsx` - Librería para generación de archivos Excel (ya estaba instalada)

**Ubicación de archivos exportados:**
Por defecto en la carpeta Documentos del usuario con formato:
- `Clientes_YYYY-MM-DD.xlsx`
- `Productos_YYYY-MM-DD.xlsx`
- `Facturas_YYYY-MM-DD.xlsx`

---

## Versiones Anteriores

### [1.0.0] - 2025-12-13

#### Implementación Inicial
- ✅ Autenticación local con bcrypt
- ✅ CRUD de Clientes con validación de RUT chileno
- ✅ CRUD de Productos con control de stock
- ✅ Sistema de Facturación con múltiples items
- ✅ Generación de PDF profesional
- ✅ Sistema de folios automático
- ✅ Configuración de emisor
- ✅ Dashboard con gráficos (Chart.js)
- ✅ Base de datos SQLite con migraciones
- ✅ Sistema de backup automático
- ✅ Gestión de vendedores

---

## Próximas Funcionalidades Planificadas

### Alta Prioridad
- [ ] Importación de datos desde Excel
- [ ] Generación de XML DTE local
- [ ] Ventas a Crédito - Interfaz completa
- [ ] Guías de Despacho
- [ ] Productos Exentos de IVA

### Media Prioridad
- [ ] Notas de Crédito y Débito
- [ ] Cotizaciones
- [ ] Reportes funcionales con datos reales
- [ ] Inventario avanzado (categorías, códigos de barras)
- [ ] Mejoras en PDF (logo, código QR)

### Baja Prioridad
- [ ] Tema oscuro/claro
- [ ] Multi-usuario local
- [ ] Atajos de teclado adicionales
- [ ] Tour guiado para nuevos usuarios

---

## Notas de Desarrollo

**Arquitectura:**
- Electron 28.x + React 18.x + Vite 5.x
- SQLite local con better-sqlite3
- IPC seguro con contextBridge
- Menú en español

**Convenciones:**
- Commits: `feat:`, `fix:`, `docs:`, `refactor:`
- Archivos: PascalCase para componentes, camelCase para utilidades
- Código: ES6+ modules, async/await

---

**Última actualización:** 16 de Diciembre, 2025
