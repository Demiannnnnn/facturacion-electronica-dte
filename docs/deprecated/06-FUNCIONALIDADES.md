# 06 - FUNCIONALIDADES DEL SISTEMA
## Sistema de Facturación Electrónica B2B

**Versión:** 1.0.0
**Estado General:** 75-80% Completado
**Última actualización:** 16 de Diciembre, 2025

---

## 📊 Resumen de Estado

| Categoría | Completitud | Funcionalidades | Notas |
|-----------|-------------|-----------------|-------|
| **Autenticación** | ✅ 100% | 6/6 | Login, registro, cambio contraseña |
| **Gestión de Clientes** | ✅ 100% | 8/8 | CRUD completo + reportes |
| **Gestión de Productos** | ✅ 100% | 7/7 | CRUD completo + control stock |
| **Gestión de Vendedores** | ✅ 100% | 6/6 | CRUD completo + comisiones |
| **Facturación** | ✅ 95% | 11/12 | Falta importar facturas antiguas |
| **Sistema de Pagos** | ⚠️ 70% | 5/7 | Backend completo, falta UI completa |
| **Dashboard y Reportes** | ⚠️ 85% | 7/9 | Backend completo, UI parcial |
| **Exportación** | ✅ 100% | 3/3 | Excel para clientes, productos, facturas |
| **Backup** | ✅ 100% | 6/6 | Automático y manual |
| **Integración SII** | ⚠️ 40% | 3/8 | XML generado, falta envío real |
| **Docs Tributarios Extra** | ❌ 0% | 0/3 | Guías, notas crédito/débito |
| **Servidor Backend** | ❌ 10% | 2/15 | Solo esqueleto |

**TOTAL: ~60 funcionalidades implementadas de ~80 planificadas = 75% completitud**

---

## ✅ FUNCIONALIDADES IMPLEMENTADAS

### 1. AUTENTICACIÓN Y SEGURIDAD (100%)

#### 1.1 Registro de Usuario ✅
- **Descripción:** Crear primer usuario del sistema
- **Handler IPC:** `auth:register`
- **Ubicación UI:** `/register`
- **Características:**
  - Solo en primera ejecución (sin usuarios en BD)
  - Username único (3-50 caracteres)
  - Contraseña mínimo 8 caracteres
  - Hash bcrypt con 10 salt rounds
  - Validación de campos requeridos

#### 1.2 Inicio de Sesión ✅
- **Handler IPC:** `auth:login`
- **Ubicación UI:** `/login`
- **Características:**
  - Validación de credenciales contra BD
  - Verificación de hash bcrypt
  - Sesión en memoria (no persistente)
  - Redirect automático a dashboard

#### 1.3 Cierre de Sesión ✅
- **Handler IPC:** `auth:logout`
- **Ubicación UI:** Botón en Layout
- **Características:**
  - Limpia sesión de memoria
  - Redirect a login
  - Backup automático al cerrar

#### 1.4 Cambio de Contraseña ✅
- **Handler IPC:** `auth:changePassword`
- **Ubicación UI:** `/configuracion/cambiar-contrasena`
- **Características:**
  - Valida contraseña actual
  - Mínimo 8 caracteres nueva contraseña
  - Re-hasheo con bcrypt
  - Confirmación de nueva contraseña

#### 1.5 Usuario Actual ✅
- **Handler IPC:** `auth:getCurrentUser`
- **Características:**
  - Retorna usuario de sesión
  - Usado por AuthContext
  - Valida autenticación

#### 1.6 Verificación Primera Ejecución ✅
- **Handler IPC:** `auth:checkFirstRun`
- **Características:**
  - Verifica si BD tiene usuarios
  - Determina mostrar login o register

---

### 2. GESTIÓN DE CLIENTES (100%)

#### 2.1 Crear Cliente ✅
- **Handler IPC:** `clientes:create`
- **Ubicación UI:** `/clientes` → Botón "Nuevo Cliente"
- **Características:**
  - Validación de RUT chileno (módulo 11)
  - Tipos de documento: RUT empresa/persona/extranjero, Pasaporte, Sin ID
  - Selector de regiones y comunas de Chile (15 regiones, 346 comunas)
  - Campos completos: Contacto personal, condiciones comerciales
  - Asignación de vendedor
  - Condiciones de crédito (días, límite)
  - Lista de precios (normal, mayorista, distribuidor, especial)

#### 2.2 Listar Clientes ✅
- **Handler IPC:** `clientes:getAll`
- **Ubicación UI:** `/clientes`
- **Características:**
  - Tabla con todos los clientes
  - Ordenado por razón social
  - Muestra RUT, razón social, email, teléfono

#### 2.3 Ver Detalle de Cliente ✅
- **Handler IPC:** `clientes:getById`
- **Ubicación UI:** `/clientes` → Click en fila
- **Características:**
  - Vista completa de todos los datos
  - Modo edición

#### 2.4 Buscar Clientes ✅
- **Handler IPC:** `clientes:search`
- **Ubicación UI:** `/clientes` → Campo de búsqueda
- **Características:**
  - Búsqueda por RUT, razón social o email
  - Búsqueda parcial (LIKE %term%)
  - Resultados instantáneos

#### 2.5 Actualizar Cliente ✅
- **Handler IPC:** `clientes:update`
- **Ubicación UI:** `/clientes` → Botón "Editar"
- **Características:**
  - Edición de todos los campos
  - Validación de RUT (no duplicado si cambió)
  - Mantiene relaciones con facturas

#### 2.6 Eliminar Cliente ✅
- **Handler IPC:** `clientes:delete`
- **Ubicación UI:** `/clientes` → Botón "Eliminar"
- **Características:**
  - Validación: No permite si tiene facturas asociadas
  - Confirmación antes de eliminar
  - Eliminación física (DELETE)

#### 2.7 Reporte de Clientes ✅
- **Handler IPC:** `clientes:getReporte`
- **Ubicación UI:** `/reportes` → Tipo "Clientes"
- **Características:**
  - Total de clientes
  - Top 10 clientes por compras
  - Clientes sin compras
  - Distribución por región

#### 2.8 Validaciones Especiales ✅
- **Validación de RUT chileno:**
  - Formato XX.XXX.XXX-X
  - Módulo 11 para dígito verificador
  - Rango realista (1.000.000 - 999.999.999)
- **Validación de teléfono:**
  - Formato chileno +56912345678 o 912345678
- **Validación de email:**
  - Formato estándar RFC 5322

---

### 3. GESTIÓN DE PRODUCTOS (100%)

#### 3.1 Crear Producto ✅
- **Handler IPC:** `productos:create`
- **Ubicación UI:** `/productos` → "Nuevo Producto"
- **Características:**
  - Código único opcional
  - Nombre obligatorio
  - Descripción
  - Precio sin IVA en CLP
  - Stock inicial

#### 3.2 Listar Productos ✅
- **Handler IPC:** `productos:getAll`
- **Ubicación UI:** `/productos`
- **Características:**
  - Vista de grid con tarjetas
  - Muestra código, nombre, precio, stock
  - Ordenado por nombre

#### 3.3 Ver Detalle de Producto ✅
- **Handler IPC:** `productos:getById`
- **Características:**
  - Consulta un producto específico

#### 3.4 Buscar Productos ✅
- **Handler IPC:** `productos:search`
- **Ubicación UI:** `/productos` → Búsqueda
- **Características:**
  - Por código o nombre
  - Búsqueda parcial

#### 3.5 Actualizar Producto ✅
- **Handler IPC:** `productos:update`
- **Ubicación UI:** `/productos` → "Editar"
- **Características:**
  - Edición de precio, stock, descripción
  - Validación de código único

#### 3.6 Eliminar Producto ✅
- **Handler IPC:** `productos:delete`
- **Ubicación UI:** `/productos` → "Eliminar"
- **Características:**
  - Validación: No elimina si está en facturas
  - Confirmación

#### 3.7 Actualizar Stock ✅
- **Handler IPC:** `productos:updateStock`
- **Características:**
  - Incremento/decremento de stock
  - Usado automáticamente al facturar
  - Transacción ACID

---

### 4. GESTIÓN DE VENDEDORES (100%)

#### 4.1 Crear Vendedor ✅
- **Handler IPC:** `vendedores:create`
- **Ubicación UI:** `/vendedores`
- **Características:**
  - Nombre y apellido
  - Email y teléfono
  - Comisión en porcentaje
  - Estado activo/inactivo

#### 4.2 Listar Vendedores ✅
- **Handler IPC:** `vendedores:getAll`
- **Ubicación UI:** `/vendedores`

#### 4.3 Listar Solo Activos ✅
- **Handler IPC:** `vendedores:getActivos`
- **Características:**
  - Usado en selectores de clientes/facturas

#### 4.4 Ver Vendedor ✅
- **Handler IPC:** `vendedores:getById`

#### 4.5 Actualizar Vendedor ✅
- **Handler IPC:** `vendedores:update`
- **Ubicación UI:** `/vendedores` → "Editar"

#### 4.6 Eliminar Vendedor ✅
- **Handler IPC:** `vendedores:delete`
- **Ubicación UI:** `/vendedores` → "Eliminar"
- **Características:**
  - Si tiene relaciones, marca como inactivo
  - Sino, eliminación física

---

### 5. FACTURACIÓN ELECTRÓNICA (95%)

#### 5.1 Obtener Próximo Folio ✅
- **Handler IPC:** `facturas:getNextFolio`
- **Características:**
  - Consulta tabla folios
  - Auto-incrementa

#### 5.2 Crear Factura ✅
- **Handler IPC:** `facturas:create`
- **Ubicación UI:** `/facturas` → FormularioFactura
- **Características COMPLETAS:**
  - Selector de cliente (react-select con búsqueda)
  - Selector de productos (react-select)
  - Tabla de items con múltiples líneas
  - Cálculo automático de IVA (19%)
  - Descuentos por item
  - Formas de pago: contado/crédito
  - Fecha de vencimiento
  - Observaciones
  - Orden de compra
  - Asignación de vendedor
  - **TRANSACCIÓN ACID:**
    1. BEGIN TRANSACTION
    2. Obtener folio
    3. Incrementar folio
    4. INSERT factura
    5. INSERT factura_items (múltiples)
    6. UPDATE productos stock (descontar)
    7. COMMIT
  - Generación de XML DTE (formato SII)
  - Generación de PDF profesional
  - Almacenamiento de PDF en disco

#### 5.3 Listar Facturas ✅
- **Handler IPC:** `facturas:getAll`
- **Ubicación UI:** `/facturas`
- **Características:**
  - Tabla con todas las facturas
  - Filtro por estado (pendiente, pagada, vencida, anulada)
  - Muestra folio, cliente, fecha, total, estado
  - Badges de estado con colores

#### 5.4 Ver Detalle de Factura ✅
- **Handler IPC:** `facturas:getById`
- **Características:**
  - Retorna factura + items
  - JOIN con cliente
  - Datos completos

#### 5.5 Buscar Facturas ✅
- **Handler IPC:** `facturas:search`
- **Características:**
  - Filtros: cliente, fecha, estado

#### 5.6 Actualizar Estado ✅
- **Handler IPC:** `facturas:updateEstado`
- **Características:**
  - Cambio manual de estado
  - Usado también automáticamente por sistema de pagos

#### 5.7 Generar PDF ✅
- **Servicio:** `generarPDF.js`
- **Ubicación UI:** `/facturas` → "Ver PDF"
- **Características:**
  - jsPDF + jsPDF-autotable
  - Encabezado azul con título
  - Datos del emisor (de tabla emisor)
  - Datos del receptor (cliente)
  - Tabla de items con descuentos
  - Totales: Neto, IVA, Total
  - Monto en palabras (ej: "Quinientos noventa y cinco mil pesos")
  - Formato profesional

#### 5.8 Guardar PDF ✅
- **Handler IPC:** `facturas:savePDF`
- **Características:**
  - Guarda PDF en userData/facturas/
  - Nombre: factura-{folio}.pdf
  - Actualiza pdf_path en BD

#### 5.9 Abrir PDF ✅
- **Handler IPC:** `facturas:openPDF`
- **Características:**
  - Abre PDF con visor del sistema (Electron shell.openPath)

#### 5.10 Generar XML DTE ✅
- **Servicio:** `dte-generator.js`
- **Características:**
  - XML según formato SII para Factura Electrónica (Tipo 33)
  - Estructura completa:
    - Encabezado (IdDoc, Emisor, Receptor, Totales)
    - Detalle (Items con cantidad, precio, descuentos)
  - Formateo de RUT (XX.XXX.XXX-X)
  - Fechas en formato ISO (YYYY-MM-DD)
  - Montos con 2 decimales

#### 5.11 Envío a SII ⚠️ (Parcial)
- **Servicio:** `api-client.js`
- **Handler IPC:** `sii:enviarDTE`
- **Estado:** XML generado, envío
- **Pendiente:**
  - Firma digital del XML
  - Integración real con ChileAPI
  - Servidor backend funcional

#### 5.12 Importar Facturas Antiguas ❌
- **Estado:** NO implementado
- **Sería útil para:** Migración desde otro sistema

---

### 6. SISTEMA DE PAGOS (70%)

#### 6.1 Registrar Pago ✅
- **Handler IPC:** `pagos:create`
- **Ubicación UI:** ❌ No tiene UI completa
- **Características:**
  - Registro de pago con monto, fecha, forma de pago, referencia
  - **TRANSACCIÓN:**
    1. INSERT INTO pagos
    2. SELECT SUM(monto) pagos WHERE factura_id
    3. SELECT total FROM facturas WHERE id
    4. Calcular nuevo estado:
       - Si total_pagado >= total → 'pagada'
       - Si total_pagado > 0 → 'parcial'
       - Else → 'pendiente'
    5. UPDATE facturas SET estado
    6. COMMIT

#### 6.2 Ver Pagos de Factura ✅
- **Handler IPC:** `pagos:getByFactura`

#### 6.3 Estado de Cuenta por Cliente ✅
- **Handler IPC:** `pagos:getEstadoCuenta`
- **Características:**
  - Lista facturas del cliente con saldos
  - Calcula total pagado vs total factura
  - Muestra saldo pendiente

#### 6.4 Reporte de Cuentas por Cobrar ✅
- **Handler IPC:** `pagos:getReporteCobrar`
- **Características:**
  - Lista clientes con facturas pendientes
  - Agrupado por cliente
  - Totales de deuda

#### 6.5 Eliminar Pago ✅
- **Handler IPC:** `pagos:delete`
- **Características:**
  - Elimina pago
  - Recalcula estado de factura

#### 6.6 UI de Cuentas por Cobrar ❌
- **Estado:** Backend completo, falta página en React

#### 6.7 UI de Registrar Pago ❌
- **Estado:** Backend completo, falta formulario en React

---

### 7. DASHBOARD Y REPORTES (85%)

#### 7.1 Dashboard Interactivo ✅
- **Ubicación UI:** `/`
- **Características COMPLETAS:**
  - **4 Tarjetas de Estadísticas:**
    1. Total Ventas (suma de todas las facturas)
    2. Ventas Hoy (facturas del día actual)
    3. Facturas Pendientes (count de estado pendiente)
    4. Stock Total (suma de stock de productos)
  - **3 Gráficos con Chart.js:**
    1. Línea: Ventas últimos 7 días
    2. Barras: Top 5 productos más vendidos
    3. Doughnut: Estado de facturas (pendiente/pagada/vencida)
  - **Tabla de Facturas Recientes:**
    - Últimas 5 facturas
    - Badges de estado con colores
  - **Actualización en Tiempo Real:**
    - Al montar componente (`useEffect`)

#### 7.2 Reporte de Ventas ✅
- **Handler IPC:** `reportes:ventasPorPeriodo`
- **Ubicación UI:** `/reportes` → Tipo "Ventas"
- **Características:**
  - Filtro por período (hoy, semana, mes, trimestre, año, personalizado)
  - Totales: Subtotal, IVA, Total
  - Cantidad de facturas
  - Promedio de venta

#### 7.3 Reporte de Facturas ✅
- **Handler IPC:** `reportes:facturasEmitidas`
- **Características:**
  - Lista de facturas con cliente, fecha, totales
  - Filtrado por período

#### 7.4 Reporte de Clientes ✅
- **Handler IPC:** `clientes:getReporte`
- **Características:**
  - Total de clientes
  - Top 10 por compras
  - Clientes sin compras
  - Distribución por región

#### 7.5 Reporte de Productos ✅
- **Handler IPC:** `productos:getReporte`
- **Características:**
  - Inventario actual
  - Productos más vendidos
  - Valorización de inventario

#### 7.6 Reporte de Pagos ✅
- **Handler IPC:** `pagos:getReporteCobrar`
- **Características:**
  - Cuentas por cobrar
  - Antigüedad de saldos

#### 7.7 Resumen Tributario ✅
- **Handler IPC:** `reportes:resumenTributario`
- **Características:**
  - IVA del período
  - Ventas netas
  - Para declaración mensual de impuestos

#### 7.8 UI de Reportes con Datos Reales ⚠️
- **Ubicación UI:** `/reportes`
- **Estado:** Estructura UI lista, pero muestra placeholders
- **Pendiente:** Conectar con handlers IPC

#### 7.9 Exportación de Reportes a PDF ❌
- **Estado:** Backend tiene lógica, falta UI

---

### 8. EXPORTACIÓN DE DATOS (100%)

#### 8.1 Exportar Clientes a Excel ✅
- **Handler IPC:** `export:clientes`
- **Atajo:** Ctrl+Shift+C
- **Ubicación Menú:** Archivo → Exportar → Exportar Clientes
- **Características:**
  - Formato XLSX con librería xlsx
  - Columnas: RUT, Razón Social, Giro, Dirección, Región, Comuna, Teléfono, Email
  - Ajuste automático de ancho de columnas
  - Nombre archivo: Clientes_YYYY-MM-DD.xlsx
  - Ubicación: Documentos del usuario (diálogo para seleccionar)
  - Apertura automática tras exportar

#### 8.2 Exportar Productos a Excel ✅
- **Handler IPC:** `export:productos`
- **Atajo:** Ctrl+Shift+P
- **Ubicación Menú:** Archivo → Exportar → Exportar Productos
- **Características:**
  - Columnas: Código, Nombre, Descripción, Precio, Stock
  - Formato de precio en CLP
  - Nombre archivo: Productos_YYYY-MM-DD.xlsx

#### 8.3 Exportar Facturas a Excel ✅
- **Handler IPC:** `export:facturas`
- **Atajo:** Ctrl+Shift+F
- **Ubicación Menú:** Archivo → Exportar → Exportar Facturas
- **Características:**
  - Columnas: Folio, Cliente, RUT Cliente, Fecha, Fecha Vencimiento, Subtotal, IVA, Total, Estado
  - Formato de fechas DD/MM/YYYY
  - Formato de montos en CLP
  - Nombre archivo: Facturas_YYYY-MM-DD.xlsx

---

### 9. BACKUP Y RESTAURACIÓN (100%)

#### 9.1 Backup Automático ✅
- **Handler IPC:** `backup:create`
- **Trigger:** Al cerrar aplicación
- **Características:**
  - Copia completa de facturacion.db
  - Ubicación: userData/backups/
  - Nombre: backup_YYYY-MM-DD_HH-MM-SS.db
  - Retención: Últimos 30 backups (limpieza automática)

#### 9.2 Backup Manual ✅
- **Handler IPC:** `backup:create`
- **Ubicación UI:** ❌ No tiene botón en UI (se puede agregar)
- **Características:**
  - Mismo proceso que automático
  - Puede invocarse manualmente

#### 9.3 Listar Backups ✅
- **Handler IPC:** `backup:list`
- **Características:**
  - Lista archivos .db en carpeta backups/
  - Ordenados por fecha descendente
  - Muestra tamaño de archivo

#### 9.4 Restaurar desde Backup ✅
- **Handler IPC:** `backup:restore`
- **Ubicación UI:** ❌ No tiene UI
- **Características:**
  - Copia backup seleccionado sobre BD actual
  - Requiere reiniciar aplicación

#### 9.5 Exportar BD ✅
- **Handler IPC:** `backup:export`
- **Características:**
  - Diálogo para seleccionar ubicación
  - Copia BD a ubicación elegida
  - Nombre personalizable

#### 9.6 Importar BD ✅
- **Handler IPC:** `backup:import`
- **Características:**
  - Diálogo para seleccionar archivo .db
  - Reemplaza BD actual
  - Requiere reinicio

---

### 10. CONFIGURACIÓN (100%)

#### 10.1 Configuración del Emisor ✅
- **Handler IPC:** `emisor:get`, `emisor:save`
- **Ubicación UI:** `/configuracion/emisor`
- **Características:**
  - Datos completos de la empresa:
    - RUT, Razón Social, Nombre Fantasía
    - Giro, Dirección, Comuna, Ciudad, Región
    - Teléfono, Email
    - Resolución SII (número y fecha)
  - Logo de empresa (ruta a archivo)
  - Solo 1 registro permitido (CHECK id = 1)

#### 10.2 Cambio de Contraseña ✅
- Ya documentado en sección Autenticación

---

## ⚠️ FUNCIONALIDADES PARCIALMENTE IMPLEMENTADAS

### 1. Integración con SII (40%)
- ✅ Generación de XML DTE (Tipo 33)
- ✅ Estructura de envío a API

- ❌ Firma digital del XML
- ❌ Envío real a ChileAPI
- ❌ Validación de respuesta SII
- ❌ Descarga de PDF timbrado
- ❌ Consulta de estado DTE en SII

### 2. Reportes UI (80%)
- ✅ Backend completo (7 tipos de reportes)
- ✅ Página de reportes con UI
- ⚠️ UI muestra placeholders
- ❌ Conectar datos reales a UI
- ❌ Gráficos de reportes
- ❌ Exportación a PDF de reportes

### 3. Sistema de Pagos UI (70%)
- ✅ Backend completo
- ⚠️ Lógica de estados funcional
- ❌ Página de Cuentas por Cobrar
- ❌ Formulario de registro de pagos
- ❌ Reportes de morosidad en UI

---

## ❌ FUNCIONALIDADES NO IMPLEMENTADAS

### 1. Documentos Tributarios Adicionales (0%)
- ❌ Guías de Despacho (Tipo 52 DTE)
- ❌ Notas de Crédito (Tipo 61 DTE)
- ❌ Notas de Débito (Tipo 56 DTE)
- ❌ Boletas Electrónicas (Tipo 39 DTE)

### 2. Importación de Datos (0%)
- ❌ Importar clientes desde Excel
- ❌ Importar productos desde Excel
- ❌ Importar facturas antiguas
- ❌ Templates de Excel para importación

### 3. Inventario Avanzado (0%)
- ❌ Categorías de productos
- ❌ Códigos de barras
- ❌ Lector de código de barras
- ❌ Múltiples unidades de medida
- ❌ Kits/combos de productos
- ❌ Alertas de stock bajo
- ❌ Reorden automático

### 4. Cotizaciones (0%)
- ❌ Tabla cotizaciones en BD
- ❌ Formulario de cotización
- ❌ PDF de cotización
- ❌ Convertir cotización → factura

### 5. Servidor Backend Completo (10%)
- ❌ Endpoints de API funcionales
- ❌ Sistema de licencias en servidor
- ❌ Integración real ChileAPI → SII
- ❌ Base de datos PostgreSQL
- ❌ Cron jobs para envío automático
- ❌ Panel de administración

### 6. Multi-Usuario Local (0%)
- ❌ Múltiples usuarios en misma BD
- ❌ Roles y permisos
- ❌ Log de auditoría de acciones

### 7. Características Avanzadas (0%)
- ❌ Tema oscuro/claro
- ❌ Email automático de facturas
- ❌ Envío por WhatsApp
- ❌ Firma digital local
- ❌ Certificados digitales
- ❌ Validación XSD de XML

---

## 📊 Métricas de Código

```
Líneas de código total:     ~15,000+
Handlers IPC:               40+
Componentes React:          16
Tablas de BD:               11
Servicios:                  5
Utilidades:                 4
Dependencias:               20+
```

---

## 📈 Evolución del Proyecto

### v0.1 - Setup Inicial (Dic 10, 2025)
- Estructura de proyecto
- Autenticación básica
- CRUD clientes y productos

### v0.5 - Core Completo (Dic 13, 2025)
- Sistema de facturación completo
- Generación de PDF
- Dashboard con gráficos
- Configuración de emisor

### v1.0 - Features Avanzadas (Dic 16, 2025)
- Sistema de vendedores
- Sistema de pagos (backend)
- Backup automático
- Exportación a Excel
- Generación de XML DTE

---

## 🎯 Próximas Funcionalidades a Implementar

Ver [09-ROADMAP.md](./09-ROADMAP.md) para planificación detallada.

---

**Última actualización:** 16 de Diciembre, 2025
