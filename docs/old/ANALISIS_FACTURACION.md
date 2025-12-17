# Análisis Profundo: Sistema de Facturación Electrónica Chile

## 1. PARÁMETROS OBLIGATORIOS FACTURA ELECTRÓNICA CHILENA (SII)

### 1.1 Datos del Emisor (Tu Empresa)
- ✅ RUT Emisor
- ✅ Razón Social
- ✅ Giro/Actividad Económica
- ✅ Dirección
- ✅ Comuna
- ✅ Ciudad
- ⚠️ Teléfono (opcional pero recomendado)
- ⚠️ Email (opcional pero recomendado)
- ❌ **FALTA**: Logo empresa
- ❌ **FALTA**: Resolución SII (autorización folios)
- ❌ **FALTA**: Número de Resolución
- ❌ **FALTA**: Fecha de Resolución

### 1.2 Datos del Receptor (Cliente)
- ✅ RUT Receptor (ya está en tabla clientes)
- ✅ Razón Social (ya está)
- ✅ Giro (ya está)
- ✅ Dirección (ya está)
- ✅ Comuna (ya está)
- ✅ Ciudad (ya está)
- ✅ Teléfono (ya está)
- ✅ Email (ya está)

### 1.3 Datos del Documento
- ✅ Tipo de Documento: 33 (Factura Electrónica)
- ✅ Folio: Número único correlativo (ya está en DB)
- ✅ Fecha de Emisión
- ⚠️ Fecha de Vencimiento (para crédito)
- ❌ **FALTA**: Forma de Pago (Contado/Crédito)
- ❌ **FALTA**: Condiciones de pago (ej: "30 días")

### 1.4 Detalle de Items
- ✅ Número de línea
- ✅ Código producto (opcional si no hay)
- ✅ Descripción/Nombre
- ✅ Cantidad
- ✅ Unidad de medida (ej: "UN", "KG", "LT")
- ✅ Precio Unitario (sin IVA)
- ⚠️ Descuento (% o monto fijo)
- ⚠️ Recargo
- ✅ Monto Item (Cantidad × Precio - Descuento)

### 1.5 Totales
- ✅ Monto Neto (suma de items sin IVA)
- ✅ Monto Exento (si hay productos exentos de IVA)
- ✅ IVA (19% sobre monto neto)
- ✅ Monto Total (Neto + IVA)

### 1.6 Otros Campos Importantes
- ⚠️ Observaciones/Glosa
- ⚠️ Referencia a otros documentos (ej: Guía de Despacho, Orden de Compra)
- ❌ **FALTA**: Timbre Electrónico (firma digital)
- ❌ **FALTA**: Ted (Timbre Electrónico DTE)

---

## 2. ESTADO ACTUAL DE LA BASE DE DATOS

### Tablas Existentes:
✅ `clientes` - Completa con todos los datos necesarios
✅ `productos` - Completa
✅ `facturas` - Tiene campos básicos
✅ `factura_items` - Tiene campos básicos
✅ `config` - Para configuraciones generales

### Campos que FALTAN en `facturas`:
- `tipo_documento` (33 para factura electrónica)
- `forma_pago` (contado/credito)
- `condiciones_pago` (ej: "30 días")
- `monto_exento` (por si hay productos exentos)
- `descuento_global` (descuento aplicado al total)

### Campos que FALTAN en `factura_items`:
- `numero_linea` (orden del item)
- `codigo_item` (código del producto)
- `unidad` (unidad de medida: UN, KG, etc)
- `descuento` (descuento individual del item)
- `monto_item` (subtotal del item)

### Tabla NUEVA necesaria: `emisor` (datos de la empresa)
```sql
CREATE TABLE emisor (
  id INTEGER PRIMARY KEY CHECK (id = 1), -- Solo 1 registro
  rut TEXT UNIQUE NOT NULL,
  razon_social TEXT NOT NULL,
  nombre_fantasia TEXT,
  giro TEXT NOT NULL,
  direccion TEXT NOT NULL,
  comuna TEXT NOT NULL,
  ciudad TEXT NOT NULL,
  region TEXT,
  telefono TEXT,
  email TEXT,
  logo_path TEXT,
  resolucion_sii TEXT,
  numero_resolucion TEXT,
  fecha_resolucion TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

### Tabla para control de folios:
```sql
CREATE TABLE folios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tipo_documento INTEGER NOT NULL, -- 33 para factura
  desde INTEGER NOT NULL,
  hasta INTEGER NOT NULL,
  actual INTEGER NOT NULL,
  created_at TEXT NOT NULL
);
```

---

## 3. FLUJO DE CREACIÓN DE FACTURA

### Paso 1: Datos Generales
- Seleccionar Cliente (autocompletar con búsqueda)
- Fecha de Emisión (por defecto hoy)
- Forma de Pago (Contado/Crédito)
- Si es crédito: Fecha de Vencimiento
- Condiciones de Pago (texto libre)

### Paso 2: Agregar Items
- Buscar/Seleccionar Producto
  - O escribir descripción manual
- Cantidad
- Precio Unitario (auto desde producto, editable)
- Descuento % (opcional)
- Calcular automáticamente:
  - Monto Item = (Cantidad × Precio) - Descuento

### Paso 3: Cálculos Automáticos
```javascript
// Para cada item
montoItem = cantidad * precioUnitario * (1 - descuento/100)

// Totales
montoNeto = suma(todosLosItems.montoItem)
IVA = montoNeto * 0.19
total = montoNeto + IVA
```

### Paso 4: Observaciones
- Campo de texto libre para notas adicionales

### Paso 5: Guardar
- Asignar folio automático
- Guardar en DB
- Descontar stock de productos

### Paso 6: Generar PDF
- Diseño según formato estándar chileno
- Incluir todos los datos obligatorios
- Código QR (opcional) o código de barras del folio

### Paso 7: Generar XML (futuro)
- Formato DTE según especificaciones SII
- Firma digital
- Envío al SII

---

## 4. DISEÑO DE LA INTERFAZ (GUI)

### Vista Principal (Lista)
- Tabla con columnas:
  - Folio
  - Cliente
  - Fecha
  - Total
  - Estado (Pendiente/Pagada/Vencida/Anulada)
  - Acciones (Ver PDF, Editar, Anular)
- Filtros:
  - Por estado
  - Por fecha
  - Por cliente
  - Por rango de montos
- Tarjetas de resumen:
  - Total facturas
  - Pendientes
  - Pagadas
  - Monto total

### Vista Formulario (Crear/Editar)
```
┌─────────────────────────────────────────────────┐
│  NUEVA FACTURA ELECTRÓNICA                      │
├─────────────────────────────────────────────────┤
│                                                 │
│  DATOS DEL CLIENTE                              │
│  [Seleccionar Cliente ▼]                        │
│  RUT: 12.345.678-9                              │
│  Razón Social: Empresa Ejemplo SpA              │
│  Dirección: Av. Principal 123, Santiago         │
│                                                 │
│  DATOS DE LA FACTURA                            │
│  Folio: [Auto] #1001                            │
│  Fecha: [📅] 13/12/2025                         │
│  Forma Pago: ( ) Contado (•) Crédito            │
│  Vencimiento: [📅] 12/01/2026                   │
│                                                 │
│  DETALLE DE ITEMS                               │
│  ┌──────────────────────────────────────────┐  │
│  │ [+ Agregar Item]                         │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  Item 1:                                        │
│  Producto: [Buscar producto...] [x]             │
│  Descripción: Monitor LED 24"                   │
│  Cantidad: [1]  Precio Unit: [$150.000]        │
│  Descuento: [0]%  Subtotal: $150.000           │
│                                                 │
│  Item 2:                                        │
│  ... (igual que arriba)                         │
│                                                 │
│  OBSERVACIONES                                  │
│  [_____________________________________]        │
│                                                 │
│  TOTALES                     ┌─────────────┐   │
│                              │ Neto:       │   │
│                              │ $300.000    │   │
│                              │ IVA (19%):  │   │
│                              │ $57.000     │   │
│                              │ TOTAL:      │   │
│                              │ $357.000    │   │
│                              └─────────────┘   │
│                                                 │
│  [Cancelar]  [Guardar y Ver PDF]               │
└─────────────────────────────────────────────────┘
```

---

## 5. GENERACIÓN DE PDF

### Librería recomendada: `jspdf` + `jspdf-autotable`

### Estructura del PDF:
```
┌────────────────────────────────────────────┐
│  [LOGO]        FACTURA ELECTRÓNICA         │
│                                            │
│  EMISOR                    DOCUMENTO       │
│  Empresa Demo              RUT: 76.xxx.xxx │
│  RUT: 76.123.456-7         Folio: 1001     │
│  Giro: Comercio            Fecha: 13/12/25 │
│  Dirección...              SII Resolution   │
│                                            │
│  RECEPTOR                                  │
│  Cliente SpA                               │
│  RUT: 12.345.678-9                         │
│  Dirección...                              │
│                                            │
│  DETALLE                                   │
│  ┌──────────────────────────────────────┐ │
│  │ Item │ Cant │ P.Unit │ Desc │ Total │ │
│  ├──────────────────────────────────────┤ │
│  │ 1.   │  1   │150.000 │  0%  │150.000│ │
│  │ 2.   │  2   │ 75.000 │  5%  │142.500│ │
│  └──────────────────────────────────────┘ │
│                                            │
│  TOTALES                    Neto: 292.500  │
│                              IVA:  55.575  │
│                            TOTAL: 348.075  │
│                                            │
│  Observaciones: ...                        │
│  ┌──────┐                                  │
│  │ QR   │  TIMBRE ELECTRÓNICO (futuro)     │
│  └──────┘                                  │
└────────────────────────────────────────────┘
```

---

## 6. PLAN DE IMPLEMENTACIÓN PROPUESTO

### FASE 1: Base de Datos y Backend (1-2 días)
1. ✅ Actualizar esquema de `facturas`
2. ✅ Actualizar esquema de `factura_items`
3. ✅ Crear tabla `emisor`
4. ✅ Crear tabla `folios`
5. ✅ Crear IPC handlers para facturas
6. ✅ Sistema de folios automáticos

### FASE 2: GUI - Formulario de Factura (2-3 días)
1. ✅ Selector de cliente con autocompletar
2. ✅ Campos de datos generales
3. ✅ Tabla dinámica de items
4. ✅ Búsqueda de productos
5. ✅ Cálculos automáticos en tiempo real
6. ✅ Validaciones

### FASE 3: Generación de PDF (1-2 días)
1. ✅ Instalar jsPDF
2. ✅ Diseñar template PDF
3. ✅ Implementar generación
4. ✅ Botón "Ver PDF"

### FASE 4: Lista y Gestión (1 día)
1. ✅ Tabla de facturas
2. ✅ Filtros y búsqueda
3. ✅ Vista de detalle
4. ✅ Cambiar estado

### FASE 5: Configuración Emisor (1 día)
1. ✅ Formulario para datos de la empresa
2. ✅ Subir logo
3. ✅ Datos de resolución SII

### FASE 6: XML y Envío SII (FUTURO)
- Dejar para cuando exista el servidor
- Por ahora: generar XML de prueba sin firma

---

## 7. CAMPOS QUE DEJAMOS PARA DESPUÉS

Por ahora NO implementaremos:
- ❌ Firma digital / Timbre electrónico
- ❌ Envío automático al SII
- ❌ Productos exentos de IVA
- ❌ Referencias a otros documentos
- ❌ Descuentos/recargos globales complejos
- ❌ Múltiples formas de pago

PERO sí los dejaremos preparados en el esquema para futuro.

---

## 8. PRIORIDAD DE IMPLEMENTACIÓN

### AHORA (Crítico):
1. Configuración de emisor
2. Formulario crear factura
3. Cálculos automáticos
4. Guardar en DB
5. Generación PDF básico

### PRONTO (Importante):
1. Lista de facturas
2. Filtros y búsqueda
3. Control de stock
4. PDF con mejor diseño

### DESPUÉS (Nice to have):
1. XML de prueba
2. Estadísticas avanzadas
3. Exportar a Excel
4. Gráficos
