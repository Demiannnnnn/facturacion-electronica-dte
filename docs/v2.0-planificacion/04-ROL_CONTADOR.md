# 👔 Rol Contador - Funcionalidades v2.0

**Versión:** 2.0.0  
**Última actualización:** Enero 2026

---

## 🎯 Visión General

El **Contador** es el rol central del sistema v2.0. Actúa como administrador multi-tenant que gestiona múltiples clientes, sus documentos tributarios y el cumplimiento fiscal ante el SII.

---

## 🔑 Responsabilidades Principales

1. **Gestión de Clientes:** Invitar, configurar y administrar empresas clientes
2. **Aprobación de DTEs:** Revisar y aprobar documentos antes de envío al SII
3. **Gestión de Folios:** Solicitar, asignar y controlar uso de folios
4. **Certificados Digitales:** Administrar certificados PKI para firma electrónica
5. **Reportes y Cumplimiento:** Generar reportes tributarios consolidados
6. **Auditoría:** Supervisar todas las operaciones de sus clientes

---

## 📊 Dashboard Principal

### Vista Inicial

Al iniciar sesión, el contador ve:

```
┌─────────────────────────────────────────────────────────┐
│  🏢 Dashboard Contador - Juan Pérez Contadores          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  📈 Resumen General                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐│
│  │ Clientes │  │ DTEs Mes │  │Pendientes│  │ Alertas ││
│  │    25    │  │   1,247  │  │    8     │  │    3    ││
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘│
│                                                          │
│  🚨 Acciones Requeridas                                  │
│  ┌────────────────────────────────────────────────────┐│
│  │ [!] 8 DTEs pendientes de aprobación                ││
│  │ [!] 3 clientes con folios por agotarse (< 50)      ││
│  │ [!] Certificado digital vence en 15 días           ││
│  └────────────────────────────────────────────────────┘│
│                                                          │
│  👥 Clientes Activos                                     │
│  ┌────────────────────────────────────────────────────┐│
│  │ Distribuidora XYZ    [Mixto]      DTEs: 45  [Ver] ││
│  │ Restaurant ABC       [Boleteador] DTEs: 128 [Ver] ││
│  │ Constructora LMN     [Facturador] DTEs: 12  [Ver] ││
│  │ ...                                                 ││
│  └────────────────────────────────────────────────────┘│
│                                                          │
│  [+ Invitar Nuevo Cliente]  [📊 Reportes]  [⚙️ Config] │
└─────────────────────────────────────────────────────────┘
```

### Componentes del Dashboard

#### 1. **Tarjetas de Resumen (KPIs)**

```javascript
// Datos mostrados en tiempo real
const dashboardKPIs = {
  totalClientes: {
    valor: 25,
    activos: 24,
    inactivos: 1,
    tendencia: '+2 este mes'
  },
  dtesMesActual: {
    valor: 1247,
    facturas: 345,
    boletas: 902,
    monto_total: '$125,450,000',
    comparacion: '+15% vs mes anterior'
  },
  pendientesAprobacion: {
    valor: 8,
    urgentes: 3, // > 24 horas esperando
    normales: 5,
    tiempo_promedio_aprobacion: '4.5 horas'
  },
  alertas: {
    valor: 3,
    folios_criticos: 2,
    certificados_venciendo: 1,
    errores_sii: 0
  }
};
```

#### 2. **Lista de Clientes**

Tabla con columnas:
- Razón Social
- Perfil (Facturador/Boleteador/Mixto)
- DTEs último mes
- Facturación último mes
- Pendientes de aprobación
- Última actividad
- Acciones (Ver detalle, Configurar, Suspender)

**Filtros disponibles:**
- Por perfil
- Por estado (Activo/Inactivo)
- Por folios disponibles
- Búsqueda por RUT o nombre

#### 3. **Alertas y Notificaciones**

Sistema de notificaciones en tiempo real (WebSocket):

```javascript
// Tipos de notificaciones
const tiposNotificaciones = {
  NUEVO_DTE: {
    titulo: 'Nuevo DTE para aprobar',
    mensaje: 'Cliente {nombre} emitió {tipo_doc} #{folio}',
    accion: 'Revisar',
    prioridad: 'NORMAL'
  },
  FOLIO_CRITICO: {
    titulo: 'Folios por agotarse',
    mensaje: 'Cliente {nombre} tiene solo {cantidad} folios disponibles',
    accion: 'Solicitar Folios',
    prioridad: 'ALTA'
  },
  CERTIFICADO_VENCIMIENTO: {
    titulo: 'Certificado próximo a vencer',
    mensaje: 'Certificado vence en {dias} días',
    accion: 'Renovar',
    prioridad: 'ALTA'
  },
  ERROR_SII: {
    titulo: 'Error al enviar al SII',
    mensaje: 'DTE #{folio} rechazado: {motivo}',
    accion: 'Ver Detalle',
    prioridad: 'URGENTE'
  }
};
```

---

## 👥 Gestión de Clientes

### Flujo: Invitar Nuevo Cliente

```
1. Contador hace clic en [+ Invitar Cliente]
    ↓
2. Formulario de invitación:
   - RUT del cliente
   - Razón Social
   - Nombre de Fantasía
   - Giro
   - Email de contacto
   - Perfil (Facturador/Boleteador/Mixto)
   - Configuración inicial:
     * Lista de precios
     * Condiciones de pago
     * Límite de crédito (opcional)
    ↓
3. Sistema valida RUT con API SII
    ↓
4. Genera código de invitación alfanumérico (8 caracteres)
    ↓
5. Envía email al cliente con:
   - Código de invitación
   - Instrucciones de registro
   - Link de descarga de la app
    ↓
6. Cliente recibe email y se registra
    ↓
7. Contador recibe notificación de cliente activado
    ↓
8. Sistema solicita automáticamente folios iniciales al SII
```

### Interfaz: Formulario de Invitación

```jsx
<FormularioInvitacion>
  <SeccionDatosTributarios>
    <Input label="RUT" validacion={validarRUT} />
    <Input label="Razón Social" requerido />
    <Input label="Nombre Fantasía" />
    <Input label="Giro" sugerencias={girosComunes} />
  </SeccionDatosTributarios>
  
  <SeccionContacto>
    <Input label="Email" tipo="email" requerido />
    <Input label="Teléfono" />
  </SeccionContacto>
  
  <SeccionPerfil>
    <RadioGroup label="Perfil de Emisión">
      <Radio value="FACTURADOR" 
             descripcion="Solo emite facturas (B2B)" />
      <Radio value="BOLETEADOR" 
             descripcion="Solo emite boletas (retail)" />
      <Radio value="MIXTO" 
             descripcion="Emite facturas y boletas" />
    </RadioGroup>
  </SeccionPerfil>
  
  <SeccionConfiguracion>
    <Select label="Lista de Precios" 
            opciones={['GENERAL', 'MAYORISTA', 'MINORISTA']} />
    <Select label="Condición de Pago"
            opciones={['CONTADO', 'CREDITO_30', 'CREDITO_60']} />
    <Input label="Límite de Crédito (opcional)" 
           tipo="moneda" />
  </SeccionConfiguracion>
  
  <Botones>
    <Button tipo="secundario">Cancelar</Button>
    <Button tipo="primario">Enviar Invitación</Button>
  </Botones>
</FormularioInvitacion>
```

### Vista: Detalle de Cliente

```
┌─────────────────────────────────────────────────────────┐
│  👤 Distribuidora XYZ S.A.                   [Editar]   │
├─────────────────────────────────────────────────────────┤
│  📋 Información General                                  │
│  RUT: 76.123.456-7          Perfil: MIXTO              │
│  Giro: Distribución de productos                        │
│  Email: contacto@xyz.cl     Teléfono: +56 9 1234 5678   │
│  Estado: ACTIVO             Desde: 15/08/2025           │
│                                                          │
│  📊 Estadísticas                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ DTEs Mes     │  │ Facturación  │  │ Pendientes   │ │
│  │    45        │  │ $12,500,000  │  │      2       │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                          │
│  📄 DTEs Recientes                                       │
│  ┌────────────────────────────────────────────────────┐│
│  │ Factura #1234  15/01/2026  $450,000  [Aceptado SII]││
│  │ Boleta #5678   14/01/2026  $125,000  [Aceptado SII]││
│  │ Factura #1235  12/01/2026  $890,000  [Pendiente]   ││
│  └────────────────────────────────────────────────────┘│
│                                                          │
│  🔢 Folios Disponibles                                   │
│  ┌────────────────────────────────────────────────────┐│
│  │ Facturas (33):  Folio 1200-1500  [Disponibles: 268]││
│  │ Boletas (39):   Folio 5000-7000  [Disponibles: 1342]││
│  │ Guías (52):     Folio 100-500    [Disponibles: 387]││
│  └────────────────────────────────────────────────────┘│
│                                                          │
│  [Ver Todos los DTEs]  [Solicitar Folios]  [Reportes]  │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ Aprobación de DTEs

### Vista: Cola de Aprobación

```
┌─────────────────────────────────────────────────────────┐
│  ✅ DTEs Pendientes de Aprobación (8)                    │
├─────────────────────────────────────────────────────────┤
│  Filtros: [Todos] [Urgentes] [Por Cliente]              │
│                                                          │
│  [🔴 URGENTE] Hace 26 horas                              │
│  ┌────────────────────────────────────────────────────┐│
│  │ Factura #1235                    Distribuidora XYZ  ││
│  │ Receptor: Restaurant La Buena Mesa                  ││
│  │ Fecha: 14/01/2026               Total: $890,000    ││
│  │ [Ver XML] [Ver PDF Preliminar] [Aprobar] [Rechazar]││
│  └────────────────────────────────────────────────────┘│
│                                                          │
│  [🟡 NORMAL] Hace 4 horas                                │
│  ┌────────────────────────────────────────────────────┐│
│  │ Boleta #5679                     Restaurant ABC     ││
│  │ Fecha: 15/01/2026               Total: $45,000     ││
│  │ [Ver Detalle] [Aprobar] [Rechazar]                  ││
│  └────────────────────────────────────────────────────┘│
│                                                          │
│  ... (6 más)                                             │
│                                                          │
│  [Aprobar Lote (Seleccionados)]                         │
└─────────────────────────────────────────────────────────┘
```

### Flujo de Aprobación Individual

```
1. Contador hace clic en DTE pendiente
    ↓
2. Modal de detalle se abre:
   ┌──────────────────────────────────────────────┐
   │ Factura Electrónica #1235                    │
   ├──────────────────────────────────────────────┤
   │ Cliente: Distribuidora XYZ                   │
   │ Receptor: Restaurant La Buena Mesa           │
   │ RUT Receptor: 76.987.654-3                   │
   │                                              │
   │ Fecha Emisión: 14/01/2026                    │
   │ Forma Pago: CREDITO (30 días)                │
   │                                              │
   │ DETALLE:                                     │
   │ ┌────────────────────────────────────────┐ │
   │ │ Producto A  x10  $50,000  = $500,000   │ │
   │ │ Producto B  x5   $70,000  = $350,000   │ │
   │ │ Descuento: -$10,000                     │ │
   │ │ Subtotal: $840,000                      │ │
   │ │ IVA (19%): $159,600                     │ │
   │ │ TOTAL: $999,600                         │ │
   │ └────────────────────────────────────────┘ │
   │                                              │
   │ [⬇️ Descargar XML] [📄 Ver PDF Preliminar]  │
   │                                              │
   │ Validaciones:                                │
   │ ✅ RUT receptor válido                       │
   │ ✅ Cálculos correctos                        │
   │ ✅ Folio disponible                          │
   │ ✅ Formato XML válido                        │
   │                                              │
   │ [Rechazar]        [✅ Aprobar y Enviar SII] │
   └──────────────────────────────────────────────┘
    ↓
3. Si aprueba:
   - Sistema firma XML con certificado digital
   - Envía al SII vía SOAP
   - Actualiza estado a "ENVIADO_SII"
   - Notifica al cliente
    ↓
4. Si rechaza:
   - Modal solicita motivo del rechazo
   - Notifica al cliente con motivo
   - Cliente debe corregir y reenviar
```

### Aprobación por Lote

```javascript
// Permite aprobar múltiples DTEs a la vez
const aprobarLote = async (dtesSeleccionados) => {
  // Validaciones previas
  for (const dte of dtesSeleccionados) {
    const validacion = await validarDTE(dte);
    if (!validacion.ok) {
      throw new Error(`DTE ${dte.folio} tiene errores: ${validacion.errores}`);
    }
  }
  
  // Firmar todos
  const dtesFirmados = await Promise.all(
    dtesSeleccionados.map(dte => firmarXML(dte, certificado))
  );
  
  // Enviar al SII en batch (máximo 100 por envío según SII)
  const batches = chunk(dtesFirmados, 100);
  for (const batch of batches) {
    await enviarBatchSII(batch);
  }
  
  // Notificar a todos los clientes
  await notificarClientesAprobacion(dtesSeleccionados);
};
```

---

## 🔢 Gestión de Folios

### Vista: Control de Folios

```
┌─────────────────────────────────────────────────────────┐
│  🔢 Gestión de Folios                                    │
├─────────────────────────────────────────────────────────┤
│  Resumen: 15 clientes con folios activos                │
│                                                          │
│  [🔴 CRÍTICOS (< 50 folios)]                             │
│  ┌────────────────────────────────────────────────────┐│
│  │ Distribuidora XYZ - Facturas (33)                   ││
│  │ Rango: 1200-1500  Actual: 1468  [Disponibles: 32]  ││
│  │ [⚠️ Solicitar Folios Urgente]                        ││
│  └────────────────────────────────────────────────────┘│
│                                                          │
│  [🟡 NORMALES (50-200 folios)]                           │
│  ┌────────────────────────────────────────────────────┐│
│  │ Restaurant ABC - Boletas (39)                       ││
│  │ Rango: 5000-7000  Actual: 5878  [Disponibles: 1122]││
│  │ [Solicitar Más Folios]                              ││
│  └────────────────────────────────────────────────────┘│
│                                                          │
│  [🟢 BUENOS (> 200 folios)]                              │
│  ... (12 clientes)                                       │
│                                                          │
│  [Solicitar Folios para Múltiples Clientes]             │
└─────────────────────────────────────────────────────────┘
```

### Flujo: Solicitar Folios al SII

```
1. Contador selecciona cliente y tipo de documento
    ↓
2. Formulario de solicitud:
   - Cliente: [Seleccionado]
   - Tipo Documento: Factura Electrónica (33)
   - Cantidad de folios: [1000] (rango: 100-10,000)
   - Certificado Digital: [Certificado Activo]
    ↓
3. Sistema valida con SII:
   - RUT emisor autorizado
   - Certificado vigente
   - Sin deudas tributarias pendientes
    ↓
4. Envía solicitud SOAP al SII
    ↓
5. SII responde con CAF (Código de Autorización de Folios):
   - XML con rango de folios autorizados
   - Timbre digital
   - Fecha de vencimiento (opcional)
    ↓
6. Sistema almacena CAF en BD cifrado
    ↓
7. Notifica al cliente que tiene nuevos folios disponibles
```

---

## 🔐 Gestión de Certificados Digitales

### Vista: Certificados

```
┌─────────────────────────────────────────────────────────┐
│  🔐 Certificados Digitales                               │
├─────────────────────────────────────────────────────────┤
│  [✅ ACTIVO]                                              │
│  ┌────────────────────────────────────────────────────┐│
│  │ Certificado: Juan Pérez Contador                    ││
│  │ RUT: 12.345.678-9                                   ││
│  │ Emisor: E-CERT Chile                                ││
│  │ Válido desde: 01/03/2025                            ││
│  │ Válido hasta: 01/03/2026  [⚠️ Vence en 45 días]     ││
│  │                                                      ││
│  │ [Ver Detalles] [Renovar] [Exportar]                 ││
│  └────────────────────────────────────────────────────┘│
│                                                          │
│  [⚪ VENCIDOS]                                            │
│  ... (0 certificados)                                    │
│                                                          │
│  [+ Cargar Nuevo Certificado]                           │
└─────────────────────────────────────────────────────────┘
```

### Flujo: Cargar Certificado

```
1. Contador obtiene certificado digital de entidad autorizada
   (Ej: E-Cert Chile, Agencia de Certificación)
    ↓
2. En la app: [+ Cargar Nuevo Certificado]
    ↓
3. Formulario:
   - Archivo .pfx/.p12: [Seleccionar archivo]
   - Contraseña del certificado: [input tipo password]
   - Confirmar que es el titular autorizado: [checkbox]
    ↓
4. Sistema valida:
   - Formato del archivo
   - Contraseña correcta
   - Vigencia del certificado
   - RUT coincide con el contador
    ↓
5. Cifra y almacena:
   - Archivo .pfx cifrado con AES-256
   - Contraseña hasheada con bcrypt
   - Metadatos (fechas, RUT, emisor)
    ↓
6. Marca como certificado activo
    ↓
7. Configura alertas:
   - 60 días antes: Primera notificación
   - 30 días antes: Segunda notificación
   - 15 días antes: Alerta crítica
```

---

## 📊 Reportes y Análisis

### Tipos de Reportes Disponibles

#### 1. **Reporte de Ventas Consolidado**

```
Resumen mensual/anual de todos los clientes:
- Total facturado por cliente
- Distribución por tipo de documento
- Tendencias de crecimiento
- Top 10 clientes por facturación
```

#### 2. **Libro de Compras y Ventas**

```
Reporte oficial para DDJJ al SII:
- Todas las facturas emitidas
- Formato exportable a Excel/CSV
- Compatible con software de declaración SII
```

#### 3. **Análisis de Cumplimiento**

```
- % de DTEs aceptados vs rechazados por SII
- Tiempo promedio de aprobación
- Folios utilizados vs disponibles
- Clientes con mayor actividad
```

#### 4. **Auditoria de Operaciones**

```
- Todas las acciones realizadas
- DTEs aprobados/rechazados por usuario
- Cambios de configuración
- Accesos al sistema
```

### Interfaz de Reportes

```
┌─────────────────────────────────────────────────────────┐
│  📊 Reportes                                             │
├─────────────────────────────────────────────────────────┤
│  Período: [Enero 2026 ▼]    Clientes: [Todos ▼]        │
│                                                          │
│  📈 Facturación Consolidada                              │
│  ┌────────────────────────────────────────────────────┐│
│  │  Total Facturado: $145,250,000                      ││
│  │  DTEs Emitidos: 1,247                               ││
│  │  Ticket Promedio: $116,478                          ││
│  │                                                      ││
│  │  [Gráfico de barras por semana]                     ││
│  └────────────────────────────────────────────────────┘│
│                                                          │
│  🏆 Top 10 Clientes                                      │
│  1. Distribuidora XYZ    $45,000,000                    │
│  2. Constructora LMN     $32,500,000                    │
│  3. Restaurant ABC       $18,750,000                    │
│  ... (7 más)                                             │
│                                                          │
│  [Exportar Excel] [Exportar PDF] [Enviar por Email]    │
└─────────────────────────────────────────────────────────┘
```

---

## ⚙️ Configuración del Contador

### Perfil y Preferencias

```
- Datos del contador (Razón Social, RUT, dirección)
- Logo corporativo (para reportes y PDFs)
- Firma digital
- Preferencias de notificaciones
- Configuración de alertas
- Usuarios adicionales (asistentes)
```

### Gestión de Usuarios Asistentes

```
Permite al contador admin crear usuarios con permisos limitados:
- Rol: CONTADOR_ASISTENTE
- Permisos configurables:
  * Ver DTEs
  * Aprobar DTEs (opcional)
  * Gestionar clientes
  * Solicitar folios
  * Generar reportes
```

---

**Próximo documento:** [05-ROL_CLIENTE.md](05-ROL_CLIENTE.md)
