# 03 - ESQUEMA DE BASE DE DATOS
## Sistema de Facturación Electrónica B2B

**Versión del schema:** 1.2
**Motor:** SQLite 3 (better-sqlite3)
**Ubicación:** `%APPDATA%/sistema-facturacion/facturacion.db`

---

## 📋 Tabla de Contenidos

1. [Resumen](#resumen)
2. [Diagrama de Relaciones](#diagrama-de-relaciones)
3. [Tablas Detalladas](#tablas-detalladas)
4. [Índices y Constraints](#índices-y-constraints)
5. [Migraciones](#migraciones)

---

## 📊 Resumen

### Estadísticas

```
Total de tablas: 11
Total de relaciones: 8 Foreign Keys
Integridad referencial: Habilitada (PRAGMA foreign_keys = ON)
Codificación: UTF-8
Timestamps: ISO 8601 (YYYY-MM-DDTHH:MM:SS.SSSZ)
```

### Lista de Tablas

| # | Tabla | Registros típicos | Propósito |
|---|-------|-------------------|-----------|
| 1 | `users` | 1-5 | Usuarios del sistema |
| 2 | `clientes` | 50-5000 | Clientes de la empresa |
| 3 | `productos` | 100-10000 | Catálogo de productos |
| 4 | `vendedores` | 1-50 | Fuerza de ventas |
| 5 | `facturas` | 100-50000 | Facturas emitidas |
| 6 | `factura_items` | 200-150000 | Líneas de factura |
| 7 | `pagos` | 50-20000 | Pagos recibidos |
| 8 | `emisor` | 1 | Datos de la empresa |
| 9 | `folios` | 1-5 | Control de folios |
| 10 | `guias_despacho` | 0-10000 | Guías (futuro) |
| 11 | `config` | 10-50 | Configuración |

---

## 🔗 Diagrama de Relaciones

```
┌──────────┐
│  users   │
└──────────┘

┌──────────────┐     1:N     ┌──────────────┐
│  vendedores  │─────────────▶│  clientes    │
└──────────────┘              └──────────────┘
       │                             │
       │ 1:N                         │ 1:N
       │                             │
       ▼                             ▼
┌──────────────┐              ┌──────────────┐
│  facturas    │◀─────────────│  (cliente_id)│
└──────────────┘              └──────────────┘
       │
       │ 1:N
       │
       ▼
┌──────────────────┐           ┌──────────────┐
│  factura_items   │           │    pagos     │
└──────────────────┘           └──────────────┘
       │                             ▲
       │ N:1                         │ N:1
       ▼                             │
┌──────────────┐                     │
│  productos   │                     │
└──────────────┘                     │
                                     │
                              (factura_id)


┌──────────────┐
│   emisor     │ (1 registro único)
└──────────────┘

┌──────────────┐
│   folios     │ (Por tipo de documento)
└──────────────┘

┌──────────────┐
│   config     │ (Key-value store)
└──────────────┘
```

---

## 📝 Tablas Detalladas

### 1. `users` - Usuarios del Sistema

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

**Descripción:** Almacena usuarios que pueden acceder al sistema. Hash bcrypt con 10 salt rounds.

**Campos:**
- `id`: Identificador único
- `username`: Nombre de usuario (3-50 caracteres)
- `password_hash`: Hash bcrypt de la contraseña
- `created_at`: Fecha de creación
- `updated_at`: Última actualización

**Constraints:**
- `username` UNIQUE
- `username` NOT NULL
- `password_hash` NOT NULL

**Ejemplo:**
```json
{
  "id": 1,
  "username": "admin",
  "password_hash": "$2b$10$...",
  "created_at": "2025-12-16T10:00:00.000Z",
  "updated_at": "2025-12-16T10:00:00.000Z"
}
```

---

### 2. `clientes` - Clientes de la Empresa

```sql
CREATE TABLE clientes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  -- Identificación
  tipo_documento TEXT DEFAULT 'rut_empresa',
  rut TEXT UNIQUE NOT NULL,
  razon_social TEXT NOT NULL,
  nombre_fantasia TEXT,
  giro TEXT,

  -- Ubicación
  direccion TEXT,
  region TEXT,
  comuna TEXT,
  ciudad TEXT,

  -- Contacto
  telefono TEXT,
  email TEXT,

  -- Contacto personal
  contacto_nombre TEXT,
  contacto_cargo TEXT,
  contacto_email TEXT,
  contacto_telefono TEXT,

  -- Condiciones comerciales
  condicion_pago TEXT DEFAULT 'contado',
  dias_credito INTEGER DEFAULT 0,
  limite_credito REAL DEFAULT 0,
  vendedor_id INTEGER,
  zona TEXT,
  descuento_automatico REAL DEFAULT 0,
  lista_precios TEXT DEFAULT 'normal',

  -- Timestamps
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (vendedor_id) REFERENCES vendedores(id)
);

CREATE INDEX idx_clientes_rut ON clientes(rut);
CREATE INDEX idx_clientes_vendedor ON clientes(vendedor_id);
```

**Tipos de Documento:**
- `rut_empresa` - RUT de empresa (XX.XXX.XXX-X)
- `rut_persona` - RUT de persona natural
- `rut_extranjero` - RUT extranjero (100.XXX.XXX-X)
- `pasaporte` - Pasaporte
- `sin_identificacion` - Sin identificación

**Condiciones de Pago:**
- `contado` - Pago inmediato
- `credito` - Pago diferido (usa `dias_credito`)

**Listas de Precios:**
- `normal` - Precio estándar (100%)
- `mayorista` - Descuento mayorista (ej: -10%)
- `distribuidor` - Descuento distribuidor (ej: -15%)
- `especial` - Precio personalizado

**Ejemplo:**
```json
{
  "id": 1,
  "tipo_documento": "rut_empresa",
  "rut": "76.123.456-7",
  "razon_social": "Comercial Demo SpA",
  "nombre_fantasia": "Demo Store",
  "giro": "Venta al por menor",
  "direccion": "Av. Libertador 123",
  "region": "Región Metropolitana",
  "comuna": "Santiago",
  "ciudad": "Santiago",
  "telefono": "+56912345678",
  "email": "contacto@demo.cl",
  "condicion_pago": "credito",
  "dias_credito": 30,
  "limite_credito": 5000000,
  "vendedor_id": 1,
  "lista_precios": "mayorista"
}
```

---

### 3. `productos` - Catálogo de Productos

```sql
CREATE TABLE productos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo TEXT UNIQUE,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio REAL NOT NULL,
  stock INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_productos_codigo ON productos(codigo);
```

**Descripción:** Catálogo de productos/servicios vendidos por la empresa.

**Campos:**
- `codigo`: Código/SKU único (opcional)
- `nombre`: Nombre del producto
- `descripcion`: Descripción detallada
- `precio`: Precio unitario sin IVA en CLP
- `stock`: Unidades disponibles

**Constraints:**
- `codigo` UNIQUE
- `nombre` NOT NULL
- `precio` NOT NULL, CHECK (precio >= 0)
- `stock` DEFAULT 0, CHECK (stock >= 0)

**Ejemplo:**
```json
{
  "id": 1,
  "codigo": "MON-LED-24",
  "nombre": "Monitor LED 24 pulgadas",
  "descripcion": "Monitor LED Full HD 1920x1080",
  "precio": 150000,
  "stock": 25
}
```

---

### 4. `vendedores` - Fuerza de Ventas

```sql
CREATE TABLE vendedores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  email TEXT,
  telefono TEXT,
  comision REAL DEFAULT 0,
  activo INTEGER DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

**Descripción:** Vendedores de la empresa con comisiones.

**Campos:**
- `comision`: Porcentaje de comisión (ej: 5.5 = 5.5%)
- `activo`: 1 = activo, 0 = inactivo

**Ejemplo:**
```json
{
  "id": 1,
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "jperez@empresa.cl",
  "telefono": "+56987654321",
  "comision": 5.5,
  "activo": 1
}
```

---

### 5. `facturas` - Facturas Emitidas

```sql
CREATE TABLE facturas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  -- Identificación DTE
  folio INTEGER UNIQUE NOT NULL,
  tipo_documento INTEGER DEFAULT 33,

  -- Relaciones
  cliente_id INTEGER NOT NULL,
  vendedor_id INTEGER,

  -- Fechas
  fecha TEXT NOT NULL,
  fecha_vencimiento TEXT,

  -- Condiciones
  forma_pago TEXT DEFAULT 'contado',
  condiciones_pago TEXT,
  orden_compra TEXT,
  forma_pago_detalle TEXT,

  -- Montos
  subtotal REAL NOT NULL,
  monto_exento REAL DEFAULT 0,
  descuento_global REAL DEFAULT 0,
  iva REAL NOT NULL,
  total REAL NOT NULL,

  -- Estado
  estado TEXT DEFAULT 'pendiente',
  observaciones TEXT,

  -- SII
  pdf_path TEXT,
  sii_track_id TEXT,
  sii_estado TEXT,

  -- Timestamps
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (cliente_id) REFERENCES clientes(id),
  FOREIGN KEY (vendedor_id) REFERENCES vendedores(id)
);

CREATE INDEX idx_facturas_folio ON facturas(folio);
CREATE INDEX idx_facturas_cliente ON facturas(cliente_id);
CREATE INDEX idx_facturas_fecha ON facturas(fecha);
CREATE INDEX idx_facturas_estado ON facturas(estado);
```

**Tipos de Documento (DTE):**
- `33` - Factura Electrónica
- `52` - Guía de Despacho (futuro)
- `61` - Nota de Crédito (futuro)
- `56` - Nota de Débito (futuro)

**Estados:**
- `pendiente` - Sin pagar
- `parcial` - Pago parcial registrado
- `pagada` - Totalmente pagada
- `vencida` - Fecha vencimiento pasada
- `anulada` - Anulada

**Estados SII:**
- `PENDING` - Esperando envío
- `SENT` - Enviado al SII
- `ACCEPTED` - Aceptado por SII
- `REJECTED` - Rechazado por SII

**Cálculo de Montos:**
```javascript
subtotal = sum(factura_items.monto_item)
iva = (subtotal - monto_exento - descuento_global) * 0.19
total = subtotal - descuento_global + iva
```

**Ejemplo:**
```json
{
  "id": 1,
  "folio": 1001,
  "tipo_documento": 33,
  "cliente_id": 1,
  "vendedor_id": 1,
  "fecha": "2025-12-16",
  "fecha_vencimiento": "2026-01-15",
  "forma_pago": "credito",
  "condiciones_pago": "30 días",
  "subtotal": 500000,
  "monto_exento": 0,
  "descuento_global": 0,
  "iva": 95000,
  "total": 595000,
  "estado": "pendiente",
  "sii_estado": "ACCEPTED",
  "pdf_path": "/path/to/factura-1001.pdf"
}
```

---

### 6. `factura_items` - Líneas de Factura

```sql
CREATE TABLE factura_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  factura_id INTEGER NOT NULL,
  numero_linea INTEGER NOT NULL,
  producto_id INTEGER,
  codigo_item TEXT,
  descripcion TEXT NOT NULL,
  cantidad REAL NOT NULL,
  unidad TEXT DEFAULT 'UN',
  precio_unitario REAL NOT NULL,
  descuento REAL DEFAULT 0,
  descuento_monto REAL DEFAULT 0,
  monto_item REAL NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (factura_id) REFERENCES facturas(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id)
);

CREATE INDEX idx_factura_items_factura ON factura_items(factura_id);
```

**Unidades de Medida:**
- `UN` - Unidad
- `KG` - Kilogramo
- `LT` - Litro
- `MT` - Metro
- `M2` - Metro cuadrado
- `M3` - Metro cúbico
- `HR` - Hora

**Cálculo:**
```javascript
descuento_monto = precio_unitario * cantidad * (descuento / 100)
monto_item = (precio_unitario * cantidad) - descuento_monto
```

**Ejemplo:**
```json
{
  "id": 1,
  "factura_id": 1,
  "numero_linea": 1,
  "producto_id": 1,
  "codigo_item": "MON-LED-24",
  "descripcion": "Monitor LED 24 pulgadas",
  "cantidad": 2,
  "unidad": "UN",
  "precio_unitario": 150000,
  "descuento": 10,
  "descuento_monto": 30000,
  "monto_item": 270000
}
```

---

### 7. `pagos` - Pagos Recibidos

```sql
CREATE TABLE pagos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  factura_id INTEGER NOT NULL,
  monto REAL NOT NULL,
  fecha_pago TEXT NOT NULL,
  forma_pago TEXT NOT NULL,
  referencia TEXT,
  observaciones TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (factura_id) REFERENCES facturas(id) ON DELETE CASCADE
);

CREATE INDEX idx_pagos_factura ON pagos(factura_id);
```

**Formas de Pago:**
- `efectivo` - Efectivo
- `transferencia` - Transferencia bancaria
- `cheque` - Cheque
- `tarjeta_debito` - Tarjeta de débito
- `tarjeta_credito` - Tarjeta de crédito

**Lógica de Estado:**
```javascript
total_pagado = SUM(pagos.monto WHERE factura_id = X)
if (total_pagado >= factura.total) → estado = 'pagada'
else if (total_pagado > 0) → estado = 'parcial'
else → estado = 'pendiente'
```

**Ejemplo:**
```json
{
  "id": 1,
  "factura_id": 1,
  "monto": 200000,
  "fecha_pago": "2025-12-20",
  "forma_pago": "transferencia",
  "referencia": "TRANS-12345",
  "observaciones": "Abono inicial"
}
```

---

### 8. `emisor` - Datos de la Empresa

```sql
CREATE TABLE emisor (
  id INTEGER PRIMARY KEY CHECK (id = 1),
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
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

**Descripción:** Datos de la empresa emisora. Solo puede haber 1 registro (CHECK id = 1).

**Ejemplo:**
```json
{
  "id": 1,
  "rut": "76.123.456-7",
  "razon_social": "Mi Empresa SpA",
  "nombre_fantasia": "Mi Empresa",
  "giro": "Venta al por menor",
  "direccion": "Av. Principal 123",
  "comuna": "Santiago",
  "ciudad": "Santiago",
  "region": "Región Metropolitana",
  "telefono": "+56912345678",
  "email": "contacto@miempresa.cl",
  "resolucion_sii": "80",
  "numero_resolucion": "123456",
  "fecha_resolucion": "2025-01-01"
}
```

---

### 9. `folios` - Control de Folios

```sql
CREATE TABLE folios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tipo_documento INTEGER NOT NULL,
  desde INTEGER NOT NULL,
  hasta INTEGER NOT NULL,
  actual INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(tipo_documento)
);
```

**Descripción:** Control de numeración de documentos tributarios.

**Campos:**
- `desde`: Folio inicial autorizado por SII
- `hasta`: Folio final autorizado
- `actual`: Próximo folio a usar

**Lógica:**
```javascript
// Al crear factura:
SELECT actual FROM folios WHERE tipo_documento = 33
UPDATE folios SET actual = actual + 1 WHERE tipo_documento = 33
```

**Ejemplo:**
```json
{
  "id": 1,
  "tipo_documento": 33,
  "desde": 1,
  "hasta": 10000,
  "actual": 1001
}
```

---

### 10. `guias_despacho` - Guías de Despacho (Futuro)

```sql
CREATE TABLE guias_despacho (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  folio INTEGER UNIQUE NOT NULL,
  factura_id INTEGER,
  cliente_id INTEGER NOT NULL,
  fecha TEXT NOT NULL,
  direccion_despacho TEXT,
  fecha_despacho TEXT,
  transportista TEXT,
  patente TEXT,
  observaciones TEXT,
  estado TEXT DEFAULT 'pendiente',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (factura_id) REFERENCES facturas(id),
  FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);
```

**Estado:** Tabla creada, funcionalidad NO implementada.

---

### 11. `config` - Configuración

```sql
CREATE TABLE config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

**Descripción:** Almacenamiento key-value para configuración del sistema.

**Keys comunes:**
- `app_version` - Versión de la app
- `last_backup` - Fecha del último backup
- `backup_frequency` - Frecuencia de backup
- `api_mode` - `production`

**Ejemplo:**
```json
{
  "key": "app_version",
  "value": "1.0.0",
  "updated_at": "2025-12-16T10:00:00.000Z"
}
```

---

## 🔒 Índices y Constraints

### Índices Creados

```sql
-- Clientes
CREATE INDEX idx_clientes_rut ON clientes(rut);
CREATE INDEX idx_clientes_vendedor ON clientes(vendedor_id);

-- Productos
CREATE INDEX idx_productos_codigo ON productos(codigo);

-- Facturas
CREATE INDEX idx_facturas_folio ON facturas(folio);
CREATE INDEX idx_facturas_cliente ON facturas(cliente_id);
CREATE INDEX idx_facturas_fecha ON facturas(fecha);
CREATE INDEX idx_facturas_estado ON facturas(estado);

-- Factura Items
CREATE INDEX idx_factura_items_factura ON factura_items(factura_id);

-- Pagos
CREATE INDEX idx_pagos_factura ON pagos(factura_id);
```

### Foreign Keys

```sql
PRAGMA foreign_keys = ON;  -- Habilitado globalmente

-- clientes.vendedor_id → vendedores.id
-- facturas.cliente_id → clientes.id
-- facturas.vendedor_id → vendedores.id
-- factura_items.factura_id → facturas.id (ON DELETE CASCADE)
-- factura_items.producto_id → productos.id
-- pagos.factura_id → facturas.id (ON DELETE CASCADE)
-- guias_despacho.factura_id → facturas.id
-- guias_despacho.cliente_id → clientes.id
```

### Constraints Únicos

- `users.username` UNIQUE
- `clientes.rut` UNIQUE
- `productos.codigo` UNIQUE
- `facturas.folio` UNIQUE
- `emisor.id` CHECK (id = 1)
- `emisor.rut` UNIQUE
- `folios.tipo_documento` UNIQUE
- `guias_despacho.folio` UNIQUE

---

## 🔄 Migraciones

### Historial de Cambios

#### v1.0 → v1.1 (2025-12-10)
- Agregado `vendedor_id` a `facturas`
- Agregado `sii_track_id`, `sii_estado`, `pdf_path` a `facturas`
- Creada tabla `vendedores`
- Creada tabla `pagos`

#### v1.1 → v1.2 (2025-12-16)
- Agregado `region` a `clientes`
- Expandido campos de `clientes` (contacto_*, condicion_pago, etc.)
- Agregado `forma_pago_detalle`, `orden_compra` a `facturas`
- Agregado `descuento_monto` a `factura_items`

### Aplicar Migraciones

Las migraciones se aplican automáticamente al iniciar la aplicación en `database/connection.js`:

```javascript
function applyMigrations(db) {
  // v1.0 → v1.1
  try {
    db.prepare("ALTER TABLE facturas ADD COLUMN vendedor_id INTEGER").run();
  } catch (e) { /* ya existe */ }

  // ... más migraciones
}
```

---

## 🛠️ Mantenimiento

### Backup

```bash
# Ubicación de backups
%APPDATA%/sistema-facturacion/backups/

# Formato de nombre
backup_YYYY-MM-DD_HH-MM-SS.db
```

### Limpieza

```sql
-- Eliminar registros antiguos (ejemplo)
DELETE FROM pagos WHERE created_at < date('now', '-2 years');

-- Vacuuming (optimización)
VACUUM;
```

### Integridad

```sql
-- Verificar integridad
PRAGMA integrity_check;

-- Resultado esperado:
-- ok
```

---

## 📚 Siguiente Lectura

- **Para API que usa estas tablas** → [04-API_IPC.md](./04-API_IPC.md)
- **Para flujos de datos** → [05-FLUJOS.md](./05-FLUJOS.md)
- **Para desarrollo** → [07-MANUAL_TECNICO.md](./07-MANUAL_TECNICO.md)

---

**Última actualización:** 16 de Diciembre, 2025
