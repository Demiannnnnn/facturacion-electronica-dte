# 04 - API IPC REFERENCE
## Sistema de Facturación Electrónica B2B

**Versión:** 1.0.0  
**Última actualización:** 17 de Diciembre, 2025  
**Total de Handlers:** 40+

---

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Convenciones](#convenciones)
3. [Autenticación](#autenticación)
4. [Clientes](#clientes)
5. [Productos](#productos)
6. [Vendedores](#vendedores)
7. [Facturas](#facturas)
8. [Pagos](#pagos)
9. [Reportes](#reportes)
10. [Backup](#backup)
11. [Exportación](#exportación)
12. [SII](#sii)
13. [Licencias](#licencias)
14. [Emisor](#emisor)

---

## 🎯 Introducción

Este documento es una referencia completa de todos los handlers IPC (Inter-Process Communication) disponibles en el sistema. Los handlers permiten la comunicación entre el proceso de renderizado (React) y el proceso principal (Node.js/Electron).

### Arquitectura IPC

```
React Component → window.api.* → Preload → IPC Channel → Main Process Handler → Database
```

### Formato de Respuesta

Todos los handlers retornan un objeto con la siguiente estructura:

```javascript
// Éxito
{
  success: true,
  data: any  // Datos retornados
}

// Error
{
  success: false,
  error: string  // Mensaje de error
}
```

---

## 📏 Convenciones

### Nomenclatura

```
Patrón: <módulo>:<acción>

Ejemplos:
- auth:login
- clientes:create
- facturas:getAll
```

### Uso en React

```javascript
// Llamar handler
const result = await window.api.modulo.accion(params);

// Verificar resultado
if (result.success) {
  console.log('Datos:', result.data);
} else {
  console.error('Error:', result.error);
}
```

---

## 🔐 Autenticación

**Archivo:** `electron-app/src/main/ipc/auth.js`

### `auth:checkFirstRun`

Verifica si es la primera ejecución (no hay usuarios en la BD).

**Parámetros:** Ninguno

**Retorna:**
```javascript
{
  success: true,
  isFirstRun: boolean
}
```

**Ejemplo:**
```javascript
const result = await window.api.auth.checkFirstRun();
if (result.isFirstRun) {
  // Mostrar pantalla de registro
}
```

---

### `auth:register`

Registra el primer usuario del sistema.

**Parámetros:**
```javascript
{
  username: string,  // 3-50 caracteres
  password: string   // Mínimo 8 caracteres
}
```

**Retorna:**
```javascript
{
  success: true,
  user: {
    id: number,
    username: string
  }
}
```

**Validaciones:**
- Username: 3-50 caracteres
- Password: Mínimo 8 caracteres
- Solo funciona si no hay usuarios existentes

**Ejemplo:**
```javascript
const result = await window.api.auth.register({
  username: 'admin',
  password: 'MiPassword123'
});
```

---

### `auth:login`

Inicia sesión con credenciales.

**Parámetros:**
```javascript
{
  username: string,
  password: string
}
```

**Retorna:**
```javascript
{
  success: true,
  user: {
    id: number,
    username: string
  }
}
```

**Ejemplo:**
```javascript
const result = await window.api.auth.login({
  username: 'admin',
  password: 'MiPassword123'
});

if (result.success) {
  // Redirigir a dashboard
}
```

---

### `auth:getCurrentUser`

Obtiene el usuario de la sesión actual.

**Parámetros:** Ninguno

**Retorna:**
```javascript
{
  success: true,
  user: {
    id: number,
    username: string
  } | null
}
```

---

### `auth:logout`

Cierra la sesión actual.

**Parámetros:** Ninguno

**Retorna:**
```javascript
{
  success: true
}
```

---

### `auth:changePassword`

Cambia la contraseña del usuario.

**Parámetros:**
```javascript
{
  userId: number,
  currentPassword: string,
  newPassword: string
}
```

**Retorna:**
```javascript
{
  success: true
}
```

**Validaciones:**
- Nueva contraseña: Mínimo 8 caracteres
- Nueva contraseña debe ser diferente a la actual
- Contraseña actual debe ser correcta

---

## 👥 Clientes

**Archivo:** `electron-app/src/main/ipc/clientes.js`

### `clientes:create`

Crea un nuevo cliente.

**Parámetros:**
```javascript
{
  tipo_documento: string,      // 'rut_empresa', 'rut_persona', etc.
  rut: string,                  // Formato: XX.XXX.XXX-X
  razon_social: string,
  nombre_fantasia?: string,
  giro?: string,
  direccion?: string,
  region?: string,
  comuna?: string,
  ciudad?: string,
  telefono?: string,
  email?: string,
  contacto_nombre?: string,
  contacto_cargo?: string,
  contacto_email?: string,
  contacto_telefono?: string,
  condicion_pago?: string,     // 'contado' | 'credito'
  dias_credito?: number,
  limite_credito?: number,
  vendedor_id?: number,
  zona?: string,
  descuento_automatico?: number,
  lista_precios?: string       // 'normal', 'mayorista', etc.
}
```

**Retorna:**
```javascript
{
  success: true,
  data: {
    id: number,
    ...clienteData
  }
}
```

**Validaciones:**
- RUT único
- Razón social requerida
- Validación de RUT chileno (módulo 11)

---

### `clientes:getAll`

Obtiene todos los clientes.

**Parámetros:** Ninguno

**Retorna:**
```javascript
{
  success: true,
  data: Cliente[]  // Array de clientes ordenados por razón social
}
```

---

### `clientes:getById`

Obtiene un cliente por ID.

**Parámetros:** `id: number`

**Retorna:**
```javascript
{
  success: true,
  data: Cliente
}
```

---

### `clientes:search`

Busca clientes por RUT, razón social o email.

**Parámetros:** `term: string`

**Retorna:**
```javascript
{
  success: true,
  data: Cliente[]  // Clientes que coinciden con el término
}
```

**Búsqueda:** LIKE parcial en rut, razon_social y email

---

### `clientes:update`

Actualiza un cliente existente.

**Parámetros:**
```javascript
{
  id: number,
  cliente: ClienteData  // Mismo formato que create
}
```

**Retorna:**
```javascript
{
  success: true,
  data: Cliente
}
```

---

### `clientes:delete`

Elimina un cliente.

**Parámetros:** `id: number`

**Retorna:**
```javascript
{
  success: true
}
```

**Validación:** No permite eliminar si tiene facturas asociadas

---

### `clientes:getReporte`

Genera reporte completo de clientes.

**Parámetros:** Ninguno

**Retorna:**
```javascript
{
  success: true,
  data: {
    clientes: Cliente[],
    totales: {
      total_clientes: number,
      clientes_activos: number,
      clientes_sin_compras: number,
      total_facturado: number,
      total_pendiente: number,
      promedio_compra: number
    },
    topClientes: Cliente[],        // Top 10 por monto
    clientesPendientes: Cliente[], // Con deuda
    clientesSinCompras: Cliente[], // Sin facturas
    clientesPorRegion: Object      // Agrupados por región
  }
}
```

---

## 📦 Productos

**Archivo:** `electron-app/src/main/ipc/productos.js`

### `productos:create`

Crea un nuevo producto.

**Parámetros:**
```javascript
{
  codigo?: string,       // SKU único (opcional)
  nombre: string,        // Requerido
  descripcion?: string,
  precio: number,        // Precio sin IVA
  stock?: number         // Default: 0
}
```

**Retorna:**
```javascript
{
  success: true,
  data: {
    id: number,
    ...productoData
  }
}
```

---

### `productos:getAll`

Obtiene todos los productos.

**Parámetros:** Ninguno

**Retorna:**
```javascript
{
  success: true,
  data: Producto[]  // Ordenados por nombre
}
```

---

### `productos:getById`

Obtiene un producto por ID.

**Parámetros:** `id: number`

**Retorna:**
```javascript
{
  success: true,
  data: Producto
}
```

---

### `productos:search`

Busca productos por código, nombre o descripción.

**Parámetros:** `term: string`

**Retorna:**
```javascript
{
  success: true,
  data: Producto[]
}
```

---

### `productos:update`

Actualiza un producto.

**Parámetros:**
```javascript
{
  id: number,
  producto: ProductoData
}
```

**Retorna:**
```javascript
{
  success: true,
  data: Producto
}
```

---

### `productos:delete`

Elimina un producto.

**Parámetros:** `id: number`

**Retorna:**
```javascript
{
  success: true
}
```

**Validación:** No permite eliminar si está en facturas

---

### `productos:updateStock`

Actualiza el stock de un producto (incremento/decremento).

**Parámetros:**
```javascript
{
  id: number,
  cantidad: number  // Positivo para incrementar, negativo para decrementar
}
```

**Retorna:**
```javascript
{
  success: true,
  data: {
    id: number,
    stock: number  // Stock actualizado
  }
}
```

---

## 💼 Vendedores

**Archivo:** `electron-app/src/main/ipc/vendedores.js`

### `vendedores:create`

Crea un nuevo vendedor.

**Parámetros:**
```javascript
{
  nombre: string,
  apellido: string,
  email?: string,
  telefono?: string,
  comision?: number,  // Porcentaje (ej: 5.5 = 5.5%)
  activo?: boolean    // Default: true
}
```

**Retorna:**
```javascript
{
  success: true,
  data: {
    id: number,
    ...vendedorData
  }
}
```

---

### `vendedores:getAll`

Obtiene todos los vendedores.

**Parámetros:** Ninguno

**Retorna:**
```javascript
{
  success: true,
  data: Vendedor[]  // Ordenados por apellido, nombre
}
```

---

### `vendedores:getActivos`

Obtiene solo vendedores activos.

**Parámetros:** Ninguno

**Retorna:**
```javascript
{
  success: true,
  data: Vendedor[]
}
```

---

### `vendedores:getById`

Obtiene un vendedor por ID.

**Parámetros:** `id: number`

**Retorna:**
```javascript
{
  success: true,
  data: Vendedor
}
```

---

### `vendedores:update`

Actualiza un vendedor.

**Parámetros:**
```javascript
{
  id: number,
  vendedor: VendedorData
}
```

**Retorna:**
```javascript
{
  success: true,
  data: Vendedor
}
```

---

### `vendedores:delete`

Elimina o desactiva un vendedor.

**Parámetros:** `id: number`

**Retorna:**
```javascript
{
  success: true,
  message?: string  // Si fue desactivado en lugar de eliminado
}
```

**Lógica:**
- Si tiene clientes o facturas asociadas: Marca como inactivo
- Si no tiene registros asociados: Eliminación física

---

## 📄 Facturas

**Archivo:** `electron-app/src/main/ipc/facturas.js`

### `facturas:getNextFolio`

Obtiene el próximo folio disponible.

**Parámetros:** Ninguno

**Retorna:**
```javascript
{
  success: true,
  data: {
    folio: number
  }
}
```

---

### `facturas:create`

Crea una nueva factura.

**Parámetros:**
```javascript
{
  cliente_id: number,
  vendedor_id?: number,
  fecha: string,              // YYYY-MM-DD
  fecha_vencimiento?: string, // YYYY-MM-DD
  forma_pago: string,         // 'contado' | 'credito'
  condiciones_pago?: string,
  orden_compra?: string,
  forma_pago_detalle?: string,
  observaciones?: string,
  items: [
    {
      producto_id?: number,
      codigo_item?: string,
      descripcion: string,
      cantidad: number,
      unidad?: string,        // Default: 'UN'
      precio_unitario: number,
      descuento?: number,     // Porcentaje
      monto_item: number
    }
  ]
}
```

**Retorna:**
```javascript
{
  success: true,
  data: {
    id: number,
    folio: number,
    ...facturaData
  }
}
```

**Proceso (Transacción ACID):**
1. Obtener y reservar folio
2. Insertar factura
3. Insertar items
4. Actualizar stock de productos
5. Generar XML DTE
6. Generar PDF
7. Guardar PDF en disco

---

### `facturas:getAll`

Obtiene todas las facturas.

**Parámetros:** Ninguno

**Retorna:**
```javascript
{
  success: true,
  data: Factura[]  // Con datos de cliente (JOIN)
}
```

---

### `facturas:getById`

Obtiene una factura con sus items.

**Parámetros:** `id: number`

**Retorna:**
```javascript
{
  success: true,
  data: {
    factura: Factura,
    items: FacturaItem[],
    cliente: Cliente
  }
}
```

---

### `facturas:search`

Busca facturas con filtros.

**Parámetros:**
```javascript
{
  cliente_id?: number,
  fecha_desde?: string,
  fecha_hasta?: string,
  estado?: string
}
```

**Retorna:**
```javascript
{
  success: true,
  data: Factura[]
}
```

---

### `facturas:updateEstado`

Actualiza el estado de una factura.

**Parámetros:**
```javascript
{
  id: number,
  estado: string  // 'pendiente', 'parcial', 'pagada', 'vencida', 'anulada'
}
```

**Retorna:**
```javascript
{
  success: true
}
```

---

### `facturas:savePDF`

Guarda el PDF de una factura en disco.

**Parámetros:**
```javascript
{
  facturaId: number,
  pdfData: string  // Base64
}
```

**Retorna:**
```javascript
{
  success: true,
  data: {
    path: string  // Ruta del PDF guardado
  }
}
```

---

### `facturas:openPDF`

Abre el PDF de una factura con el visor del sistema.

**Parámetros:** `facturaId: number`

**Retorna:**
```javascript
{
  success: true
}
```

---

### `facturas:getReporteVentas`

Genera reporte de ventas por período.

**Parámetros:**
```javascript
{
  fecha_desde: string,  // YYYY-MM-DD
  fecha_hasta: string   // YYYY-MM-DD
}
```

**Retorna:**
```javascript
{
  success: true,
  data: {
    facturas: Factura[],
    totales: {
      cantidad: number,
      subtotal: number,
      iva: number,
      total: number,
      promedio: number
    },
    porEstado: {
      pendiente: number,
      pagada: number,
      vencida: number,
      anulada: number
    }
  }
}
```

---

### `facturas:getReportePagos`

Genera reporte de cuentas por cobrar.

**Parámetros:** Ninguno

**Retorna:**
```javascript
{
  success: true,
  data: {
    totales: {
      total_cobrado: number,
      total_por_cobrar: number,
      total_vencido: number,
      cantidad_pagadas: number,
      cantidad_pendientes: number,
      cantidad_vencidas: number
    },
    facturasPagadas: Factura[],
    facturasPendientes: Factura[],
    facturasVencidas: Factura[],
    facturasPorVencer: Factura[],
    proximos7Dias: Factura[],
    proximos15Dias: Factura[],
    topDeudores: Array<{
      cliente_id: number,
      cliente_nombre: string,
      total_deuda: number,
      cantidad_facturas: number,
      facturas_vencidas: number
    }>,
    proyeccion: Array<{
      periodo: string,
      monto_esperado: number,
      cantidad_facturas: number
    }>
  }
}
```

---

### `facturas:getReporteTributario`

Genera resumen tributario para SII.

**Parámetros:**
```javascript
{
  mes?: number,   // 1-12 (default: mes actual)
  anio?: number   // YYYY (default: año actual)
}
```

**Retorna:**
```javascript
{
  success: true,
  data: {
    mes: number,
    anio: number,
    fecha_desde: string,
    fecha_hasta: string,
    totales: {
      cantidad_documentos: number,
      ventas_netas: number,
      ventas_exentas: number,
      total_iva: number,
      total_facturado: number,
      documentos_anulados: number,
      monto_anulado: number
    },
    facturas: Factura[],
    ventasPorDia: Array<{
      fecha: string,
      cantidad: number,
      neto: number,
      iva: number,
      total: number
    }>,
    porTipoDocumento: Object,
    formulario29: {
      periodo: string,
      codigo_100: number,  // Ventas netas
      codigo_105: number,  // IVA débito
      codigo_110: number   // Ventas exentas
    },
    ventasPorMes: Array,
    totalesAnuales: Object
  }
}
```

---

## 💰 Pagos

**Archivo:** `electron-app/src/main/ipc/pagos.js`

### `pagos:create`

Registra un pago para una factura.

**Parámetros:**
```javascript
{
  factura_id: number,
  monto: number,
  fecha_pago: string,      // YYYY-MM-DD
  forma_pago: string,      // 'efectivo', 'transferencia', 'cheque', etc.
  referencia?: string,     // Número de transferencia, cheque, etc.
  observaciones?: string
}
```

**Retorna:**
```javascript
{
  success: true,
  data: {
    id: number,
    ...pagoData
  }
}
```

**Proceso (Transacción):**
1. Insertar pago
2. Calcular total pagado
3. Actualizar estado de factura:
   - Si total_pagado >= total → 'pagada'
   - Si total_pagado > 0 → 'parcial'
   - Else → 'pendiente'

---

### `pagos:getByFactura`

Obtiene todos los pagos de una factura.

**Parámetros:** `facturaId: number`

**Retorna:**
```javascript
{
  success: true,
  data: Pago[]
}
```

---

### `pagos:getEstadoCuenta`

Obtiene estado de cuenta de un cliente.

**Parámetros:** `clienteId: number`

**Retorna:**
```javascript
{
  success: true,
  data: {
    cliente: Cliente,
    facturas: Array<{
      factura: Factura,
      total_pagado: number,
      saldo_pendiente: number,
      pagos: Pago[]
    }>,
    totales: {
      total_facturado: number,
      total_pagado: number,
      saldo_pendiente: number
    }
  }
}
```

---

### `pagos:delete`

Elimina un pago y recalcula estado de factura.

**Parámetros:** `id: number`

**Retorna:**
```javascript
{
  success: true
}
```

---

## 📊 Reportes

**Archivo:** `electron-app/src/main/ipc/reportes.js`

### `reportes:ventasPorPeriodo`

Alias de `facturas:getReporteVentas` (ver arriba).

### `reportes:facturasEmitidas`

Alias de `facturas:getReporteVentas` (ver arriba).

### `reportes:resumenTributario`

Alias de `facturas:getReporteTributario` (ver arriba).

---

## 💾 Backup

**Archivo:** `electron-app/src/main/ipc/backup.js`

### `backup:create`

Crea un backup de la base de datos.

**Parámetros:** Ninguno

**Retorna:**
```javascript
{
  success: true,
  data: {
    path: string,  // Ruta del backup
    size: number   // Tamaño en bytes
  }
}
```

**Ubicación:** `%APPDATA%/sistema-facturacion/backups/backup_YYYY-MM-DD_HH-MM-SS.db`

---

### `backup:list`

Lista todos los backups disponibles.

**Parámetros:** Ninguno

**Retorna:**
```javascript
{
  success: true,
  data: Array<{
    filename: string,
    path: string,
    size: number,
    created: string  // Fecha ISO
  }>
}
```

---

### `backup:restore`

Restaura la base de datos desde un backup.

**Parámetros:** `backupPath: string`

**Retorna:**
```javascript
{
  success: true,
  message: string  // Instrucciones para reiniciar
}
```

> ⚠️ Requiere reiniciar la aplicación

---

### `backup:export`

Exporta la base de datos a una ubicación personalizada.

**Parámetros:** Ninguno (abre diálogo)

**Retorna:**
```javascript
{
  success: true,
  data: {
    path: string
  }
}
```

---

### `backup:import`

Importa una base de datos desde un archivo.

**Parámetros:** Ninguno (abre diálogo)

**Retorna:**
```javascript
{
  success: true,
  message: string
}
```

> ⚠️ Requiere reiniciar la aplicación

---

## 📤 Exportación

**Archivo:** `electron-app/src/main/ipc/export.js`

### `export:clientes`

Exporta clientes a Excel.

**Parámetros:** Ninguno (abre diálogo para guardar)

**Retorna:**
```javascript
{
  success: true,
  data: {
    path: string,      // Ruta del archivo
    count: number      // Cantidad de clientes exportados
  }
}
```

**Columnas:** RUT, Razón Social, Giro, Dirección, Región, Comuna, Teléfono, Email

---

### `export:productos`

Exporta productos a Excel.

**Parámetros:** Ninguno

**Retorna:**
```javascript
{
  success: true,
  data: {
    path: string,
    count: number
  }
}
```

**Columnas:** Código, Nombre, Descripción, Precio, Stock

---

### `export:facturas`

Exporta facturas a Excel.

**Parámetros:** Ninguno

**Retorna:**
```javascript
{
  success: true,
  data: {
    path: string,
    count: number
  }
}
```

**Columnas:** Folio, Cliente, RUT Cliente, Fecha, Vencimiento, Subtotal, IVA, Total, Estado

---

## 🏛️ SII

**Archivo:** `electron-app/src/main/ipc/sii.js`

### `sii:enviarDTE`

Envía un DTE al SII.

**Parámetros:**
```javascript
{
  facturaId: number
}
```

**Retorna:**
```javascript
{
  success: true,
  data: {
    trackId: string,
    estado: string  // 'PENDING', 'SENT', 'ACCEPTED', 'REJECTED'
  }
}
```



---

### `sii:consultarEstado`

Consulta el estado de un DTE en el SII.

**Parámetros:** `trackId: string`

**Retorna:**
```javascript
{
  success: true,
  data: {
    estado: string,
    mensaje?: string
  }
}
```

---

## 🔑 Licencias

**Archivo:** `electron-app/src/main/ipc/licenses.js`

### `licenses:validate`

Valida una licencia con el servidor.

**Parámetros:**
```javascript
{
  licenseKey: string
}
```

**Retorna:**
```javascript
{
  success: true,
  data: {
    valid: boolean,
    expiresAt?: string,
    features?: string[]
  }
}
```

> 📝 **NOTA:** Funcionalidad en desarrollo (Fase 4).

---

## 🏢 Emisor

**Archivo:** `electron-app/src/main/ipc/facturas.js` (handlers adicionales)

### `emisor:get`

Obtiene los datos del emisor (empresa).

**Parámetros:** Ninguno

**Retorna:**
```javascript
{
  success: true,
  data: {
    id: 1,
    rut: string,
    razon_social: string,
    nombre_fantasia?: string,
    giro: string,
    direccion: string,
    comuna: string,
    ciudad: string,
    region?: string,
    telefono?: string,
    email?: string,
    logo_path?: string,
    resolucion_sii?: string,
    numero_resolucion?: string,
    fecha_resolucion?: string
  }
}
```

---

### `emisor:save`

Guarda o actualiza los datos del emisor.

**Parámetros:**
```javascript
{
  rut: string,
  razon_social: string,
  giro: string,
  direccion: string,
  comuna: string,
  ciudad: string,
  // ... más campos opcionales
}
```

**Retorna:**
```javascript
{
  success: true
}
```

**Nota:** Solo puede haber 1 registro de emisor (CHECK id = 1)

---

## 📝 Notas Importantes

### Seguridad

- Todos los handlers validan parámetros de entrada
- Se usan prepared statements para prevenir SQL injection
- Las contraseñas se hashean con bcrypt (10 salt rounds)

### Transacciones

Los siguientes handlers usan transacciones ACID:
- `facturas:create` - Factura + items + stock
- `pagos:create` - Pago + actualización de estado

### Errores Comunes

```javascript
// Error: Database not initialized
// Solución: Asegurar que initDatabase() se llamó

// Error: UNIQUE constraint failed
// Solución: Verificar duplicados (RUT, código, folio)

// Error: FOREIGN KEY constraint failed
// Solución: Verificar que IDs referenciados existen
```

---

## 🔗 Referencias

- [Manual Técnico](./07-MANUAL_TECNICO.md) - Cómo agregar nuevos handlers
- [Base de Datos](./03-BASE_DE_DATOS.md) - Schema completo
- [Arquitectura](./02-ARQUITECTURA.md) - Visión general del sistema

---

**Última actualización:** 17 de Diciembre, 2025  
**Versión:** 1.0
