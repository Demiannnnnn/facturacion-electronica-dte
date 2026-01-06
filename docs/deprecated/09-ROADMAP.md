# 09 - ROADMAP DEL PROYECTO
## Sistema de Facturación Electrónica B2B

**Versión Actual:** 1.0.0
**Estado:** 75-80% MVP Completado
**Última actualización:** 16 de Diciembre, 2025

---

## 📊 Resumen Ejecutivo

| Fase | Estado | Completitud | Tiempo Estimado Restante |
|------|--------|-------------|--------------------------|
| **FASE 1: MVP Core** | ✅ Completado | 100% | ✅ 0 semanas |
| **FASE 2: Integración SII** | ⚠️ En Desarrollo | 40% | 🔶 2-3 semanas |
| **FASE 3: Features Avanzadas** | ❌ Pendiente | 0% | 🔴 4-6 semanas |
| **FASE 4: Producción** | ❌ Pendiente | 10% | 🔴 3-4 semanas |

**TIEMPO TOTAL ESTIMADO PARA COMPLETAR:** 9-13 semanas

---

## ✅ FASE 1: MVP CORE (Completado al 100%)

**Objetivo:** Sistema funcional offline para facturación básica local

**Duración:** 6 semanas (Nov 1 - Dic 13, 2025)
**Estado:** ✅ **COMPLETADO**

### Funcionalidades Implementadas

#### Semana 1-2: Fundamentos
- [x] Estructura de proyecto Electron + React + Vite
- [x] Base de datos SQLite con schema completo
- [x] Sistema de autenticación local (bcrypt)
- [x] IPC seguro (contextBridge + preload)
- [x] Layout de aplicación con sidebar
- [x] Enrutamiento con React Router

#### Semana 3-4: Gestión de Datos
- [x] CRUD Clientes completo
- [x] Validación de RUT chileno (módulo 11)
- [x] Selector de regiones/comunas de Chile
- [x] CRUD Productos con control de stock
- [x] Búsqueda de clientes y productos
- [x] CRUD Vendedores con comisiones

#### Semana 5-6: Facturación
- [x] Formulario de facturación con múltiples items
- [x] Sistema de folios automático
- [x] Cálculo de IVA (19%) automático
- [x] Descuentos por item
- [x] Generación de PDF profesional (jsPDF)
- [x] Generación de XML DTE (formato SII)
- [x] Dashboard con Chart.js
- [x] Configuración de emisor

#### Extras Agregados
- [x] Sistema de vendedores
- [x] Sistema de pagos (backend)
- [x] Backup automático
- [x] Exportación a Excel (Ctrl+Shift+C/P/F)
- [x] Conversión de montos a palabras

---

## ⚠️ FASE 2: INTEGRACIÓN SII (40% Completado)

**Objetivo:** Cumplimiento tributario completo con SII de Chile

**Duración Estimada:** 3-4 semanas
**Estado:** ⚠️ **EN DESARROLLO**

### 2.1 Generación de XML DTE ✅ (Completado)
- [x] XML de Factura Electrónica (Tipo 33)
- [x] Formato según estándar SII
- [x] Estructura completa (Encabezado, Emisor, Receptor, Detalle, Totales)
- [x] Formateo de RUT y fechas
- [x] Validación básica de estructura

### 2.2 Firma Digital y Timbre ❌ (0%)
**Tiempo estimado:** 1 semana

- [ ] Cargar certificado digital (.pfx)
- [ ] Firmar XML con xmldsig
- [ ] Generar timbre electrónico SII
- [ ] Validar firma antes de enviar
- [ ] Manejo de certificados vencidos
- [ ] Renovación de certificados

**Dependencias:**
- Certificado digital del SII
- Librería de firma digital (node-forge o similar)

### 2.3 Envío Real al SII ⚠️ (30%)
**Tiempo estimado:** 1-2 semanas

- [x] Estructura de API client
- [x] Modo mock funcional
- [ ] Integración con ChileAPI
- [ ] Endpoint de envío de DTE
- [ ] Manejo de respuestas:
  - [ ] Aceptado
  - [ ] Rechazado con motivos
  - [ ] Reparos
- [ ] Cola de envíos (batch)
- [ ] Reintentos automáticos
- [ ] Log de envíos

**Dependencias:**
- Servidor backend funcional
- Cuenta en ChileAPI (o API SII directa)
- Credenciales de producción

### 2.4 Consulta de Estado ❌ (0%)
**Tiempo estimado:** 3 días

- [ ] Consultar estado de DTE en SII
- [ ] Actualizar estado local según respuesta
- [ ] Notificaciones de cambios de estado
- [ ] Historial de estados

### 2.5 PDF Timbrado ❌ (0%)
**Tiempo estimado:** 2 días

- [ ] Descargar PDF con timbre del SII
- [ ] Reemplazar PDF local con PDF timbrado
- [ ] Código QR en PDF
- [ ] Logo de empresa en PDF

### 2.6 Guías de Despacho (Tipo 52) ❌ (0%)
**Tiempo estimado:** 1 semana

- [ ] Tabla `guias_despacho` y `guia_items` (ya existe)
- [ ] IPC handlers para guías
- [ ] Formulario de creación (sin precios)
- [ ] Referencia a factura (opcional)
- [ ] Generación de XML DTE tipo 52
- [ ] Generación de PDF
- [ ] Sistema de folios independiente
- [ ] Envío al SII

### 2.7 Notas de Crédito (Tipo 61) ❌ (0%)
**Tiempo estimado:** 1 semana

- [ ] Tabla `notas_credito`
- [ ] IPC handlers
- [ ] Formulario de nota de crédito
- [ ] Referencia a factura original (obligatorio)
- [ ] Motivo de la nota
- [ ] Anulación total o parcial
- [ ] Generación de XML tipo 61
- [ ] Envío al SII
- [ ] Actualización de totales de factura original

### 2.8 Notas de Débito (Tipo 56) ❌ (0%)
**Tiempo estimado:** 3 días

- [ ] Similar a notas de crédito
- [ ] Cargo adicional a factura
- [ ] XML tipo 56

---

## ❌ FASE 3: FEATURES AVANZADAS (0% Completado)

**Objetivo:** Funcionalidades competitivas para venta

**Duración Estimada:** 4-6 semanas
**Estado:** ❌ **PENDIENTE**

### 3.1 UI de Cuentas por Cobrar
**Tiempo estimado:** 1 semana

- [ ] Página `/cuentas-por-cobrar`
- [ ] Lista de facturas pendientes
- [ ] Filtros por cliente, fecha, monto
- [ ] Formulario de registro de pagos
- [ ] Historial de pagos por factura
- [ ] Estado de cuenta por cliente
- [ ] Reporte de antigüedad de saldos
- [ ] Alertas de vencimiento (7 días antes, el día, vencidas)

**Backend:** ✅ Completado (handlers IPC existen)

### 3.2 Reportes UI con Datos Reales
**Tiempo estimado:** 1 semana

- [ ] Conectar backend de reportes a UI
- [ ] 6 tipos de reportes funcionales:
  1. [ ] Ventas por período
  2. [ ] Facturas emitidas
  3. [ ] Análisis de clientes
  4. [ ] Movimiento de productos
  5. [ ] Pagos y cobranzas
  6. [ ] Resumen tributario
- [ ] Gráficos interactivos (Chart.js)
- [ ] Exportación a PDF
- [ ] Filtros avanzados

**Backend:** ✅ Completado

### 3.3 Importación de Datos desde Excel
**Tiempo estimado:** 1 semana

- [ ] Template Excel para clientes
- [ ] Template Excel para productos
- [ ] Diálogo de selección de archivo
- [ ] Lectura con librería xlsx
- [ ] Validación de datos:
  - [ ] RUT válido
  - [ ] Campos requeridos
  - [ ] Formatos correctos
- [ ] Manejo de duplicados (actualizar/omitir)
- [ ] Preview de datos antes de importar
- [ ] Reporte de importación (éxitos/errores)
- [ ] Rollback en caso de error

### 3.4 Productos Exentos de IVA
**Tiempo estimado:** 3 días

- [ ] Campo `exento` en tabla productos (migración)
- [ ] Checkbox en formulario de producto
- [ ] Cálculo de IVA considerando exentos
- [ ] Campo `monto_exento` en facturas (ya existe)
- [ ] Mostrar en PDF: Neto, Exento, IVA, Total

### 3.5 Cotizaciones
**Tiempo estimado:** 1 semana

- [ ] Tabla `cotizaciones` y `cotizacion_items`
- [ ] IPC handlers
- [ ] Formulario similar a facturas (sin folio DTE)
- [ ] PDF de cotización (sin timbre)
- [ ] Validez de cotización (días)
- [ ] Estados: pendiente, aceptada, rechazada
- [ ] Convertir cotización → factura (un click)
- [ ] Envío por email (futuro)

### 3.6 Inventario Avanzado
**Tiempo estimado:** 2 semanas

- [ ] **Categorías:**
  - [ ] Tabla `categorias`
  - [ ] CRUD de categorías
  - [ ] Asignación a productos
  - [ ] Filtro por categoría
- [ ] **Códigos de Barras:**
  - [ ] Campo `codigo_barras` en productos
  - [ ] Generación de código de barras (EAN-13)
  - [ ] Impresión de etiquetas
  - [ ] Lector de código de barras (USB scanner)
- [ ] **Alertas de Stock:**
  - [ ] Campo `stock_minimo` en productos
  - [ ] Notificaciones cuando stock < stock_minimo
  - [ ] Lista de productos bajo stock
- [ ] **Múltiples Unidades:**
  - [ ] Unidades: UN, KG, LT, MT, M2, M3, HR, etc.
  - [ ] Conversión entre unidades
- [ ] **Kits/Combos:**
  - [ ] Tabla `kits`
  - [ ] Definir kit con múltiples productos
  - [ ] Descuento automático de stock de componentes

### 3.7 Multi-Usuario Local
**Tiempo estimado:** 1 semana

- [ ] Tabla `roles` (admin, vendedor, contador, bodeguero)
- [ ] Tabla `permissions`
- [ ] Múltiples usuarios en tabla users
- [ ] Asignación de rol a usuario
- [ ] Protección de rutas según permisos
- [ ] Log de acciones por usuario (auditoría)
- [ ] Gestión de usuarios (admin)

### 3.8 Mejoras de UI/UX
**Tiempo estimado:** 1 semana

- [ ] Tema oscuro/claro
- [ ] Personalización de colores
- [ ] Atajos de teclado adicionales
- [ ] Búsqueda global (Ctrl+K)
- [ ] Notificaciones toast (reemplazar alert())
- [ ] Tour guiado para nuevos usuarios
- [ ] Ayuda contextual (?)
- [ ] Logo de empresa en header
- [ ] Skeleton loaders
- [ ] Animaciones suaves

---

## 🌐 FASE 4: SERVIDOR Y PRODUCCIÓN (10% Completado)

**Objetivo:** Producto comercializable y distribuible

**Duración Estimada:** 3-4 semanas
**Estado:** ❌ **PENDIENTE** (solo esqueleto)

### 4.1 Servidor Backend Completo
**Tiempo estimado:** 2 semanas

**Estado Actual:**
- ✅ Archivo `server/src/index.js` (esqueleto)
- ✅ Endpoints básicos: `/health`, `/api`

**Pendiente:**

#### Base de Datos PostgreSQL
- [ ] Configurar PostgreSQL en Railway/Heroku
- [ ] Schema de tablas (licenses, dte_logs, companies)
- [ ] Migraciones con node-pg-migrate
- [ ] Pool de conexiones
- [ ] Queries preparados

#### Endpoints de Licencias
- [ ] `POST /api/licenses/validate`
  - Validar license key + machine ID
  - Verificar expiración
  - Registrar validación
  - Retornar datos de cliente
- [ ] `POST /api/licenses/generate` (admin)
  - Generar nueva licencia
  - Asignar a cliente
  - Configurar expiración
- [ ] `POST /api/licenses/revoke` (admin)
  - Revocar licencia
  - Blacklist de machine ID
- [ ] `GET /api/licenses/status/:key`
  - Consultar estado de licencia
- [ ] `PATCH /api/licenses/renew/:key`
  - Renovar licencia vencida

#### Endpoints de SII
- [ ] `POST /api/sii/enviar-dte`
  - Recibir XML firmado
  - Validar estructura
  - Enviar a ChileAPI
  - Retornar track ID
  - Guardar log de envío
- [ ] `GET /api/sii/estado/:trackId`
  - Consultar estado en ChileAPI
  - Retornar estado actual
- [ ] `GET /api/sii/pdf/:folio`
  - Descargar PDF timbrado
  - Proxy desde ChileAPI

#### Cron Jobs
- [ ] Instalar node-cron
- [ ] Job cada hora: Procesar DTEs pendientes
  - Consultar BD local (futuro: sincronización)
  - Enviar DTEs a SII
  - Actualizar estados
- [ ] Job diario: Limpiar logs antiguos
- [ ] Job semanal: Estadísticas de uso

#### Seguridad
- [ ] Autenticación JWT
- [ ] Rate limiting (express-rate-limit)
- [ ] CORS configurado
- [ ] Helmet para headers
- [ ] Sanitización de inputs
- [ ] Logging con Winston

### 4.2 Sistema de Licencias Cliente
**Tiempo estimado:** 3 días

- [ ] Pantalla de activación (primera vez)
- [ ] Validación al iniciar app (cada 24h)
- [ ] Generación de machine ID único
- [ ] Almacenamiento seguro de license key
- [ ] Manejo de licencia expirada:
  - [ ] Advertencia 7 días antes
  - [ ] Bloqueo de funciones críticas
  - [ ] Modo solo lectura
- [ ] Renovación de licencia online
- [ ] Transferencia de licencia a otro equipo

### 4.3 Panel de Administración
**Tiempo estimado:** 1 semana

- [ ] Dashboard de licencias activas
- [ ] Generador de licencias
  - Formulario: Cliente, Email, Duración, Max devices
  - Generar key (UUID)
- [ ] Revocación de licencias
- [ ] Estadísticas de uso
  - Licencias activas/expiradas
  - Validaciones por día
  - Clientes por región
- [ ] Alertas de licencias por vencer
- [ ] Logs de actividad

### 4.4 Integración ChileAPI
**Tiempo estimado:** 3 días

- [ ] Cuenta en ChileAPI
- [ ] API Key de producción
- [ ] Configuración de credenciales
- [ ] Testing en sandbox
- [ ] Testing en producción
- [ ] Manejo de errores específicos del SII
- [ ] Documentación de códigos de error

### 4.5 Build y Distribución
**Tiempo estimado:** 1 semana

#### Electron Builder
- [ ] Configuración completa electron-builder.yml
- [ ] Icono de aplicación (Windows, macOS, Linux)
- [ ] Firma de código (Windows):
  - Certificado de firma de código
  - Configurar firma automática
- [ ] Notarización (macOS):
  - Cuenta de desarrollador Apple
  - Configurar notarización
- [ ] Instalador profesional:
  - Wizard de instalación
  - Aceptar términos y condiciones
  - Seleccionar carpeta
  - Crear acceso directo

#### Auto-actualización
- [ ] Configurar electron-updater
- [ ] Servidor de releases (GitHub Releases o S3)
- [ ] Detección de nuevas versiones
- [ ] Descarga en background
- [ ] Instalación al reiniciar
- [ ] Release notes en la app

#### Testing
- [ ] Testing en máquinas limpias (sin node, sin dev tools)
- [ ] Windows 10/11
- [ ] macOS Catalina+
- [ ] Linux (Ubuntu, Fedora)
- [ ] Testing de instalador
- [ ] Testing de auto-actualización

### 4.6 Documentación Final
**Tiempo estimado:** 3 días

- [ ] Manual de usuario completo (con screenshots)
- [ ] Videos tutoriales:
  - Instalación
  - Configuración inicial
  - Crear primera factura
  - Reportes
- [ ] FAQ extendido
- [ ] Troubleshooting completo
- [ ] Guía de migración (desde otros sistemas)

### 4.7 Sitio Web del Producto
**Tiempo estimado:** 1 semana

- [ ] Landing page
  - Hero con CTA
  - Características principales
  - Screenshots
  - Precios
  - Testimonios
- [ ] Página de descarga
- [ ] Documentación online
- [ ] Blog/Noticias
- [ ] Contacto/Soporte
- [ ] Dominio .cl

---

## 📅 CRONOGRAMA SUGERIDO

### Mes 1 (Enero 2026)
**Objetivo:** Completar Integración SII

- **Semana 1:** Firma digital y timbre electrónico
- **Semana 2:** Envío real al SII + Consulta de estado
- **Semana 3:** Guías de Despacho
- **Semana 4:** Notas de Crédito y Débito

**Entregable:** Sistema con facturación electrónica 100% válida ante el SII

### Mes 2 (Febrero 2026)
**Objetivo:** Features Avanzadas

- **Semana 1:** UI Cuentas por Cobrar + Reportes UI
- **Semana 2:** Importación Excel + Productos exentos
- **Semana 3:** Cotizaciones
- **Semana 4:** Inventario avanzado (parte 1)

**Entregable:** Sistema competitivo con features clave

### Mes 3 (Marzo 2026)
**Objetivo:** Servidor y Producción

- **Semana 1-2:** Servidor backend completo
- **Semana 3:** Sistema de licencias + Panel admin
- **Semana 4:** Build, instalador, testing

**Entregable:** Producto listo para venta

### Mes 4 (Abril 2026)
**Objetivo:** Lanzamiento

- **Semana 1:** Documentación final + videos
- **Semana 2:** Sitio web
- **Semana 3:** Beta testing con clientes reales
- **Semana 4:** Lanzamiento oficial

**Entregable:** Producto en el mercado

---

## 🎯 HITOS CLAVE

| Hito | Fecha Objetivo | Estado |
|------|----------------|--------|
| MVP Core Completo | 13 Dic 2025 | ✅ Completado |
| Integración SII Completa | 31 Ene 2026 | ⏳ Pendiente |
| Features Avanzadas | 28 Feb 2026 | ⏳ Pendiente |
| Servidor Backend Funcional | 15 Mar 2026 | ⏳ Pendiente |
| Build de Producción | 31 Mar 2026 | ⏳ Pendiente |
| Beta Testing | 15 Abr 2026 | ⏳ Pendiente |
| Lanzamiento Público | 30 Abr 2026 | ⏳ Pendiente |

---

## ⚠️ RIESGOS Y DEPENDENCIAS

### Riesgos Técnicos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Cambios en API del SII | Media | Alto | Monitorear docs SII, tests automatizados |
| Certificados digitales complejos | Alta | Alto | Contratar asesoría especializada |
| Performance con muchos datos | Baja | Medio | Paginación, índices BD |
| Bugs en producción | Media | Alto | Testing exhaustivo, beta con clientes |

### Dependencias Externas

1. **ChileAPI o API SII**
   - Cuenta activa
   - Credenciales de producción
   - Sandbox para testing
   - Documentación actualizada

2. **Certificado Digital**
   - Obtener de entidad certificadora (ej: E-Sign)
   - Renovación anual
   - Costo: ~$40.000-$80.000 CLP/año

3. **Hosting**
   - Railway, Heroku o similar
   - PostgreSQL
   - Costo: ~$5-$20 USD/mes

4. **Dominio**
   - .cl o .com
   - Costo: ~$15.000 CLP/año

---

## 💰 INVERSIÓN ESTIMADA

### Costos de Desarrollo

| Item | Costo |
|------|-------|
| Desarrollo (3 meses adicionales) | Tiempo |
| Testing y QA | Tiempo |
| **Total Desarrollo** | **3 meses de trabajo** |

### Costos Operacionales (Mensuales)

| Item | Costo Mensual |
|------|---------------|
| Hosting (Railway) | $10 USD |
| Base de datos PostgreSQL | $5 USD |
| ChileAPI | $30.000 CLP |
| **Total Mensual** | **~$50.000 CLP** |

### Costos Únicos

| Item | Costo |
|------|-------|
| Certificado digital | $60.000 CLP/año |
| Dominio .cl | $15.000 CLP/año |
| Certificado de firma de código (Windows) | $200 USD |
| **Total Único/Anual** | **~$90.000 CLP** |

---

## 📈 PROYECCIÓN DE VENTAS

### Modelo de Negocio Sugerido

**Licencia única:** $150.000 - $300.000 CLP por empresa
- Sin suscripción mensual
- Actualizaciones incluidas por 1 año
- Soporte por email/WhatsApp

**Objetivo Año 1:** 50-100 clientes = $7.5M - $30M CLP

### Break-even

Con costos operacionales de ~$50K/mes:
- Necesitas ~1 cliente/mes para cubrir costos
- Con 10 clientes ya tienes profit significativo

---

## 🎁 FEATURES OPCIONALES (Nice to Have)

Estas funcionalidades podrían agregarse en versiones futuras:

- App móvil (React Native)
- Sincronización en la nube
- Email automático de facturas
- WhatsApp Business API
- Integración con Mercado Pago/Flow
- Integración con contabilidad (Softland, etc.)
- Punto de Venta (POS) con pantalla táctil
- CRM básico
- Multi-empresa (una instalación, varias empresas)

---

## 📞 Contacto

**Desarrollador:** Demian Maturana
**Email:** dmaturana22@alumnos.utalca.cl

---

**Última actualización:** 16 de Diciembre, 2025
**Próxima revisión:** 31 de Diciembre, 2025
