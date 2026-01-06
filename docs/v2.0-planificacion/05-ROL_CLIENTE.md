# 🏪 Rol Cliente - Funcionalidades v2.0

**Versión:** 2.0.0  
**Última actualización:** Enero 2026

---

## 🎯 Visión General

El **Cliente** es el rol emisor de DTEs en el sistema. Puede ser una empresa o persona que emite facturas y/o boletas electrónicas, con supervisión de su contador.

---

## 🔑 Características Clave

1. **Modo Offline-First:** Trabaja sin internet, sincroniza cuando se conecta
2. **Interfaz Simplificada:** Foco en emisión rápida de documentos
3. **Perfiles Específicos:** UI adaptada según tipo (Facturador/Boleteador/Mixto)
4. **Sincronización Automática:** Datos siempre actualizados con el servidor
5. **Aprobación del Contador:** DTEs pasan por revisión antes de ir al SII

---

## 📊 Dashboard Cliente

### Vista Inicial (Perfil Facturador)

```
┌─────────────────────────────────────────────────────────┐
│  🏢 Distribuidora XYZ S.A.                               │
│  Conectado como: Juan López (Emisor)                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  📈 Resumen del Mes (Enero 2026)                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐│
│  │Documentos│  │Facturación│  │Pendientes│  │ Estado  ││
│  │    45    │  │$12,500,000│  │    2     │  │ 🟢 Activo││
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘│
│                                                          │
│  ⚡ Acceso Rápido                                         │
│  ┌────────────────────┐  ┌────────────────────┐        │
│  │  📄 Nueva Factura  │  │  📋 Ver Facturas   │        │
│  │                    │  │                    │        │
│  └────────────────────┘  └────────────────────┘        │
│                                                          │
│  📊 Últimas Facturas                                     │
│  ┌────────────────────────────────────────────────────┐│
│  │ #1235  15/01  Restaurant ABC    $890,000  [✅ SII] ││
│  │ #1234  14/01  Supermercado XYZ  $450,000  [⏳ Pend]││
│  │ #1233  12/01  Minimarket Sur    $125,000  [✅ SII] ││
│  │ ...                                                 ││
│  └────────────────────────────────────────────────────┘│
│                                                          │
│  [🔄 Sincronizar Ahora]  [📦 Productos]  [👥 Clientes] │
└─────────────────────────────────────────────────────────┘
```

### Vista Inicial (Perfil Boleteador)

```
┌─────────────────────────────────────────────────────────┐
│  🍽️ Restaurant ABC                                       │
│  Conectado como: María González (Emisor)                │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  📈 Resumen del Día (15/01/2026)                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐│
│  │ Boletas  │  │   Ventas  │  │ Ticket   │  │ Estado  ││
│  │    128   │  │ $2,450,000│  │ $19,141  │  │ 🟢 Online││
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘│
│                                                          │
│  ⚡ Acceso Rápido                                         │
│  ┌────────────────────┐  ┌────────────────────┐        │
│  │  🧾 Nueva Boleta   │  │  📋 Ver Boletas    │        │
│  │                    │  │       Hoy          │        │
│  └────────────────────┘  └────────────────────┘        │
│                                                          │
│  📊 Ventas por Hora (Hoy)                                │
│  [Gráfico de barras 12:00-22:00]                        │
│                                                          │
│  [🔄 Sincronizar]  [📦 Productos]  [⚙️ Configuración]   │
└─────────────────────────────────────────────────────────┘
```

### Vista Inicial (Perfil Mixto)

```
Combina ambas interfaces con tabs:
[Facturas] [Boletas] [Todas]

Permite emitir ambos tipos de documentos desde una sola app.
```

---

## 📄 Emisión de Facturas

### Flujo Completo

```
1. Cliente hace clic en [Nueva Factura]
    ↓
2. Formulario de factura se abre:
   ┌──────────────────────────────────────────────┐
   │ Nueva Factura Electrónica                    │
   ├──────────────────────────────────────────────┤
   │ Receptor:                                    │
   │ [Buscar cliente existente ▼] o [+ Nuevo]     │
   │                                              │
   │ Cliente Seleccionado:                        │
   │ Restaurant La Buena Mesa                     │
   │ RUT: 76.987.654-3                            │
   │                                              │
   │ Fecha Emisión: [15/01/2026]                  │
   │ Forma Pago: [CREDITO ▼]  Días: [30]         │
   │ Orden Compra: [Opcional]                     │
   │                                              │
   │ DETALLE:                                     │
   │ ┌────────────────────────────────────────┐ │
   │ │ [Buscar producto...]                   │ │
   │ │                                        │ │
   │ │ Producto A    Cant: [10]  $50,000  [-]│ │
   │ │ Producto B    Cant: [5]   $70,000  [-]│ │
   │ │                                        │ │
   │ │ [+ Agregar Producto]                   │ │
   │ └────────────────────────────────────────┘ │
   │                                              │
   │ Descuento Global: [$10,000] o [2%]          │
   │                                              │
   │ Subtotal:    $840,000                        │
   │ IVA (19%):   $159,600                        │
   │ TOTAL:       $999,600                        │
   │                                              │
   │ Observaciones: [Campo de texto libre]        │
   │                                              │
   │ [Cancelar] [Guardar Borrador] [Emitir]     │
   └──────────────────────────────────────────────┘
    ↓
3. Cliente hace clic en [Emitir]
    ↓
4. Sistema valida:
   - Receptor RUT válido
   - Al menos un producto
   - Cálculos correctos
   - Folio disponible (local)
    ↓
5. Guarda en SQLite local con estado "PENDIENTE_SYNC"
    ↓
6. Si hay internet:
   - Sincroniza inmediatamente con servidor
   - Servidor valida y guarda
   - Notifica al contador
   - Retorna confirmación al cliente
   
   Si NO hay internet:
   - Queda en cola de sincronización
   - Se sincronizará cuando haya conexión
    ↓
7. Cliente ve mensaje:
   "Factura #1235 creada. Esperando aprobación del contador."
    ↓
8. [Tiempo después] Contador aprueba
    ↓
9. Servidor envía al SII
    ↓
10. SII acepta y devuelve timbre
    ↓
11. Cliente recibe notificación:
    "Factura #1235 ACEPTADA por SII. PDF disponible."
    ↓
12. Cliente puede descargar PDF timbrado
```

### Características del Formulario

#### Búsqueda de Clientes (Receptores)

```javascript
// Búsqueda inteligente con autocompletado
const buscarCliente = async (termino) => {
  // Busca en BD local primero (offline)
  const locales = await db.query(`
    SELECT * FROM clientes_receptores
    WHERE razon_social LIKE ? OR rut LIKE ?
    ORDER BY frecuencia_uso DESC
    LIMIT 10
  `, [`%${termino}%`, `%${termino}%`]);
  
  // Si está online, también busca en servidor (sincronizado)
  if (isOnline) {
    const remotos = await api.buscarClientes(termino);
    return [...locales, ...remotos];
  }
  
  return locales;
};
```

#### Búsqueda de Productos

```javascript
// Búsqueda rápida con precios y stock
const buscarProducto = async (termino) => {
  const productos = await db.query(`
    SELECT 
      id, codigo_interno, nombre, precio_venta, 
      stock_actual, exento
    FROM productos
    WHERE 
      nombre LIKE ? OR 
      codigo_interno LIKE ? OR 
      codigo_barra LIKE ?
    ORDER BY 
      CASE 
        WHEN nombre LIKE ? THEN 0
        ELSE 1
      END,
      frecuencia_uso DESC
    LIMIT 20
  `, [
    `%${termino}%`, 
    `%${termino}%`, 
    `%${termino}%`,
    `${termino}%` // Priorizar coincidencias al inicio
  ]);
  
  return productos;
};
```

#### Cálculo Automático

```javascript
// Cálculo en tiempo real mientras se edita
const calcularTotales = (items, descuentoGlobal) => {
  const subtotal = items.reduce((sum, item) => {
    const subtotalItem = item.cantidad * item.precio_unitario;
    const descuentoItem = subtotalItem * (item.descuento_porcentaje / 100);
    return sum + (subtotalItem - descuentoItem);
  }, 0);
  
  const descuento = descuentoGlobal.tipo === 'MONTO' 
    ? descuentoGlobal.valor
    : subtotal * (descuentoGlobal.valor / 100);
  
  const subtotalNeto = subtotal - descuento;
  
  const iva = subtotalNeto * 0.19;
  
  const total = subtotalNeto + iva;
  
  return {
    subtotal,
    descuento,
    subtotalNeto,
    iva,
    total
  };
};
```

---

## 🧾 Emisión de Boletas

### Diferencias con Facturas

1. **Sin Receptor Obligatorio:** Boletas pueden ser anónimas o con RUT opcional
2. **Más Rápido:** Flujo optimizado para venta al público
3. **Agrupación Diaria:** Múltiples boletas se reportan al SII en lotes

### Interfaz Simplificada (Modo Boleta)

```
┌──────────────────────────────────────────────┐
│ Nueva Boleta Electrónica                     │
├──────────────────────────────────────────────┤
│ RUT Cliente (Opcional): [__________-_]       │
│                                              │
│ PRODUCTOS:                                   │
│ ┌────────────────────────────────────────┐ │
│ │ [Buscar o escanear...]                 │ │
│ │                                        │ │
│ │ Menu del día       x2    $15,000  [-] │ │
│ │ Bebida             x2    $2,500   [-] │ │
│ │                                        │ │
│ │ [+ Agregar]                            │ │
│ └────────────────────────────────────────┘ │
│                                              │
│ Forma de Pago:                               │
│ [Efectivo] [Tarjeta] [Transferencia]        │
│                                              │
│ TOTAL:  $35,000                              │
│                                              │
│ [Cancelar]              [💵 Cobrar]         │
└──────────────────────────────────────────────┘
```

### Flujo Rápido de Boleta

```
1. Empleado busca productos (por nombre o escaneando código de barras)
    ↓
2. Agrega cantidades
    ↓
3. Selecciona forma de pago
    ↓
4. Presiona [Cobrar]
    ↓
5. Sistema:
   - Asigna folio local temporal
   - Guarda en SQLite local
   - Imprime ticket (opcional, si hay impresora térmica)
   - Muestra confirmación en pantalla
    ↓
6. Cliente recibe ticket físico o puede enviar por email
    ↓
7. [Cada hora o al final del día] Sistema sincroniza lote de boletas
    ↓
8. Servidor agrupa y envía al SII según normativa
```

---

## 📦 Gestión de Productos

### Vista de Productos

```
┌─────────────────────────────────────────────────────────┐
│  📦 Productos                          [+ Nuevo Producto]│
├─────────────────────────────────────────────────────────┤
│  Buscar: [___________]  Categoría: [Todas ▼]            │
│                                                          │
│  ┌────────────────────────────────────────────────────┐│
│  │ Código   Nombre           Precio    Stock   Acciones││
│  ├────────────────────────────────────────────────────┤│
│  │ P001     Producto A       $50,000    125    [✏️] [🗑️]││
│  │ P002     Producto B       $70,000     89    [✏️] [🗑️]││
│  │ P003     Producto C       $25,000      5    [✏️] [🗑️]││
│  │ ...                                                 ││
│  └────────────────────────────────────────────────────┘│
│                                                          │
│  [Importar desde Excel]  [Exportar]                     │
└─────────────────────────────────────────────────────────┘
```

### Formulario de Producto

```
┌──────────────────────────────────────────────┐
│ Nuevo Producto                               │
├──────────────────────────────────────────────┤
│ Código Interno: [P004]                       │
│ Código de Barras: [7800123456789]            │
│ SKU: [Opcional]                              │
│                                              │
│ Nombre: [____________________]               │
│ Descripción: [_________________]             │
│ Categoría: [Electrónica ▼]                   │
│                                              │
│ Precio de Venta: [$_____]                    │
│ Precio de Costo: [$_____] (Opcional)         │
│                                              │
│ [✓] Afecto a IVA                             │
│ [ ] Producto Exento                          │
│                                              │
│ Stock Actual: [____]                         │
│ Stock Mínimo: [____]                         │
│ Unidad: [UN ▼]                               │
│                                              │
│ [Cancelar]  [Guardar]                        │
└──────────────────────────────────────────────┘
```

---

## 👥 Gestión de Clientes/Receptores

Similar a productos, pero para receptores de facturas.

```
Campos principales:
- RUT
- Razón Social
- Nombre de Fantasía
- Giro
- Dirección, Comuna, Ciudad
- Email, Teléfono
- Condiciones comerciales (crédito, descuentos)
```

---

## 🔄 Sincronización

### Indicador de Estado

```
┌─────────────────────────────────────┐
│ 🟢 Online - Todo sincronizado       │ ← Estado normal
├─────────────────────────────────────┤
│ 🟡 Offline - 3 pendientes           │ ← Sin conexión
├─────────────────────────────────────┤
│ 🔴 Error - 2 con problemas          │ ← Requiere atención
└─────────────────────────────────────┘
```

### Modal de Sincronización

```
┌──────────────────────────────────────────────┐
│ 🔄 Sincronización                            │
├──────────────────────────────────────────────┤
│ Última sincronización: Hace 5 minutos        │
│                                              │
│ Pendientes de envío:                         │
│ ┌────────────────────────────────────────┐ │
│ │ ✅ Factura #1235  →  Enviado           │ │
│ │ ✅ Factura #1236  →  Enviado           │ │
│ │ 🔄 Producto "XYZ" →  Sincronizando...  │ │
│ └────────────────────────────────────────┘ │
│                                              │
│ Recibidos del servidor:                      │
│ ┌────────────────────────────────────────┐ │
│ │ ✅ Factura #1235: ACEPTADA por SII     │ │
│ │ ✅ PDF timbrado descargado             │ │
│ └────────────────────────────────────────┘ │
│                                              │
│ [Sincronizar Ahora]  [Ver Detalles]  [OK]   │
└──────────────────────────────────────────────┘
```

### Resolución de Conflictos

```javascript
// Si el mismo registro fue modificado offline y online
const resolverConflicto = async (registroLocal, registroRemoto) => {
  // Estrategia: El servidor gana por defecto
  // Pero se notifica al usuario para revisar
  
  await mostrarModal({
    titulo: 'Conflicto de Sincronización',
    mensaje: `
      El producto "${registroLocal.nombre}" fue modificado 
      tanto localmente como en el servidor.
      
      Versión Local:  Precio $${registroLocal.precio}
      Versión Servidor: Precio $${registroRemoto.precio}
      
      ¿Cuál versión deseas mantener?
    `,
    opciones: [
      { label: 'Mantener Local', value: 'LOCAL' },
      { label: 'Usar Servidor', value: 'REMOTO' },
      { label: 'Ver Diferencias', value: 'DIFF' }
    ]
  });
};
```

---

## 📊 Reportes para Cliente

### Reportes Disponibles

1. **Ventas del Período**
   - Total facturado
   - Cantidad de documentos
   - Ticket promedio
   - Gráficos de tendencia

2. **Productos Más Vendidos**
   - Top 10 productos
   - Cantidad y monto
   - Comparación con períodos anteriores

3. **Clientes Frecuentes** (solo Facturador)
   - Top clientes por facturación
   - Frecuencia de compra
   - Ticket promedio por cliente

4. **Estado de Documentos**
   - DTEs por estado (Borrador, Enviado, Aceptado, Rechazado)
   - Tasa de aprobación
   - Tiempo promedio de aprobación

---

## 📱 Notificaciones

### Tipos de Notificaciones que Recibe el Cliente

```javascript
const notificacionesCliente = {
  DTE_APROBADO: {
    titulo: 'Documento Aprobado',
    mensaje: 'Tu {tipo_doc} #{folio} fue aprobado y enviado al SII',
    accion: 'Ver PDF'
  },
  DTE_RECHAZADO: {
    titulo: 'Documento Rechazado',
    mensaje: 'Tu {tipo_doc} #{folio} fue rechazado. Motivo: {motivo}',
    accion: 'Corregir',
    prioridad: 'ALTA'
  },
  FOLIOS_BAJOS: {
    titulo: 'Folios por agotarse',
    mensaje: 'Te quedan solo {cantidad} folios para {tipo_doc}',
    accion: 'Notificar Contador'
  },
  SII_ACEPTADO: {
    titulo: 'SII Aceptó Documento',
    mensaje: '{tipo_doc} #{folio} fue aceptado por el SII',
    accion: 'Descargar PDF'
  },
  SII_RECHAZADO: {
    titulo: 'SII Rechazó Documento',
    mensaje: '{tipo_doc} #{folio} rechazado por SII. Error: {error_sii}',
    accion: 'Ver Detalles',
    prioridad: 'URGENTE'
  }
};
```

---

## ⚙️ Configuración del Cliente

### Preferencias

```
- Datos de la empresa (logo, datos tributarios)
- Preferencias de emisión:
  * Folio automático o manual
  * Imprimir automáticamente
  * Formato de impresión (carta, térmica)
- Configuración de productos:
  * Lista de precios activa
  * Redondeo de precios
- Notificaciones:
  * Email
  * Push (futuro)
  * Sonido
```

---

## 🖨️ Impresión

### Opciones de Impresión

1. **PDF Estándar (Carta)**
   - Para facturas formales
   - Con logo y timbre SII

2. **Ticket Térmico (58mm o 80mm)**
   - Para boletas en retail
   - Formato compacto
   - Compatible con impresoras ESC/POS

3. **Email Automático**
   - Enviar PDF al receptor
   - Configurable por tipo de documento

---

**Próximo documento:** [06-PERFILES_CLIENTE.md](06-PERFILES_CLIENTE.md)
