# 📝 Guía de Implementación v2.0

## ✅ Estado Actual de Preparación

### 1. Base de Datos ✅ CONFIRMADO

**Implementación Actual:**
- ✅ Dos bases de datos separadas (desarrollo y producción)
- ✅ `facturacion.dev.db` - Para desarrollo (con datos de prueba)
- ✅ `facturacion.db` - Para producción (limpia al buildear)
- ✅ Sin datos precargados en producción
- ✅ Solo se inicializan tablas y folios básicos

**Ubicación:**
```
~/.config/sistema-facturacion-inventario/
├── facturacion.dev.db    ← Desarrollo
└── facturacion.db        ← Producción
```

---

### 2. Pantalla Inicial ✅ IMPLEMENTADO

**Nueva Pantalla de Selección de Rol:**
- ✅ `/role-selection` - Pantalla de bienvenida
- ✅ Opción "Contador" con funcionalidades multi-tenant
- ✅ Opción "Cliente" con funcionalidades offline-first
- ✅ Guardado de rol en configuración
- ✅ Redirección automática al registro

**Archivos Creados:**
- `RoleSelectionPage.jsx` - Pantalla de selección
- `config.js` - IPC handler para configuración
- Actualizado `App.jsx` con nueva ruta
- Actualizado `AuthContext.jsx` con lógica de redirección

---

### 3. Endpoints POST para Sincronización ✅ PREPARADOS

**Servicio de Sincronización Creado:**
- ✅ `sync-service.js` - Servicio principal con axios
- ✅ `sync.js` - IPC handlers para comunicación
- ✅ Funciones preparadas pero en modo simulación
- ✅ Cola de sincronización offline
- ✅ Manejo de errores y reconexión

**Endpoints Preparados (modo simulación):**
```javascript
// Facturas
window.api.sync.factura(facturaData)
window.api.sync.facturaXML({ facturaId, xmlContent })

// Ventas
window.api.sync.venta(ventaData)

// Productos
window.api.sync.productos(productos)

// Clientes
window.api.sync.clientes(clientes)

// Estado
window.api.sync.checkConnection()
window.api.sync.getQueueStatus()
window.api.sync.processQueue()
```

---

## 🔧 Cómo Borrar la DB y Reiniciar

### Opción 1: Script Automático (Recomendado) ⭐

```bash
cd electron-app
npm run reset
```

Este script:
- ✅ Elimina las bases de datos (dev y prod)
- ✅ Limpia localStorage y Session Storage
- ✅ Crea backup automático antes de borrar
- ✅ Muestra instrucciones claras

### Opción 2: Manual

```bash
# Borrar base de datos de desarrollo
rm ~/.config/sistema-facturacion/facturacion.dev.db

# Borrar base de datos de producción
rm ~/.config/sistema-facturacion/facturacion.db

# Limpiar almacenamiento
rm -rf ~/.config/sistema-facturacion/Local\ Storage
rm -rf ~/.config/sistema-facturacion/Session\ Storage

# Reiniciar la app
cd electron-app
npm run dev
```

**Nota:** El directorio es `sistema-facturacion` (sin `-inventario`), según el `name` en package.json.

### Flujo al Reiniciar

Después de borrar la DB, la app mostrará:

1. **Pantalla de Selección de Rol** (`/role-selection`)
   - Elegir entre Contador o Cliente
   - Se guarda en config: `user_role`

2. **Pantalla de Registro** (`/register`)
   - Crear usuario administrador
   - Se crea la primera cuenta

3. **Dashboard Principal** (`/`)
   - Ya con sesión iniciada

---

## 🚀 Próximos Pasos de Implementación

### Fase 1: Completar Pantalla Inicial
1. ✅ Crear pantalla de selección de rol
2. ⏳ Adaptar pantalla de registro según rol seleccionado
3. ⏳ Añadir campos específicos para contador (RUT contador, razón social)
4. ⏳ Añadir campos específicos para cliente (RUT empresa, invitación contador)

### Fase 2: Preparar Estructura Cliente
1. ⏳ Crear tabla `account_type` en configuración
2. ⏳ Modificar dashboard según rol (contador vs cliente)
3. ⏳ Implementar indicador de sincronización en UI
4. ⏳ Añadir botón manual de sincronización

### Fase 3: Implementar Servidor (Largo Plazo)
1. ⏳ Crear servidor Node.js + Express
2. ⏳ Implementar API REST para sincronización
3. ⏳ Configurar PostgreSQL multi-tenant
4. ⏳ Implementar autenticación JWT
5. ⏳ Conectar endpoints reales (quitar modo simulación)

---

## 📊 Uso de los Endpoints de Sincronización

### Ejemplo: Sincronizar Factura al Crear

```javascript
// En el handler de creación de factura
const factura = await crearFactura(data);

// Intentar sincronizar con servidor
const syncResult = await window.api.sync.factura({
  id: factura.id,
  folio: factura.folio,
  cliente_id: factura.cliente_id,
  total: factura.total,
  fecha: factura.fecha,
  // ... otros campos
});

if (syncResult.success) {
  console.log('✅ Factura sincronizada con servidor');
  console.log('ID servidor:', syncResult.serverFacturaId);
} else if (syncResult.offline) {
  console.log('⚠️ Servidor no disponible - sincronización en cola');
  // La factura se sincronizará cuando haya conexión
} else {
  console.error('❌ Error sincronizando:', syncResult.error);
}
```

### Ejemplo: Sincronizar XML Generado

```javascript
// Después de generar el XML
const xmlContent = generarXML(factura);

const syncResult = await window.api.sync.facturaXML({
  facturaId: factura.id,
  xmlContent: xmlContent
});

if (syncResult.success) {
  console.log('✅ XML enviado al servidor');
}
```

### Ejemplo: Procesar Cola Pendiente

```javascript
// Al detectar conexión
const connectionResult = await window.api.sync.checkConnection();

if (connectionResult.connected && connectionResult.queueSize > 0) {
  console.log(`Procesando ${connectionResult.queueSize} items pendientes...`);
  
  const processResult = await window.api.sync.processQueue();
  
  if (processResult.success) {
    console.log(`✅ ${processResult.processed} items sincronizados`);
  }
}
```

---

## 🔐 Variables de Entorno Necesarias

Cuando implementes el servidor, añadir a `.env`:

```bash
# Servidor de Sincronización
API_URL=http://localhost:3000/api
API_TIMEOUT=30000

# Autenticación
JWT_SECRET=tu_secret_key_aqui

# PostgreSQL (servidor)
DATABASE_URL=postgresql://user:password@localhost:5432/facturacion_db
```

---

## ⚠️ Consideraciones Importantes

### Modo Simulación Actual
- Todos los endpoints están preparados pero **NO** se comunican con servidor real
- Las funciones retornan respuestas simuladas exitosas
- La cola de sincronización funciona en memoria (se pierde al cerrar app)
- Esto permite desarrollar la UI sin tener servidor implementado

### Para Activar Modo Real
1. Implementar servidor Node.js con los endpoints
2. Descomentar las llamadas reales en `sync-service.js`
3. Configurar variables de entorno (API_URL)
4. Implementar manejo de tokens JWT
5. Hacer build y probar en producción

### Base de Datos en Producción
- La app buildeada siempre inicia con DB limpia
- El usuario DEBE pasar por:
  1. Selección de rol (contador/cliente)
  2. Registro de usuario
  3. Configuración de emisor
- Esto garantiza que cada instalación sea independiente

---

## 📁 Archivos Modificados/Creados

### Creados
- `electron-app/src/renderer/src/pages/Auth/RoleSelectionPage.jsx`
- `electron-app/src/main/ipc/config.js`
- `electron-app/src/main/ipc/sync.js`
- `electron-app/src/main/services/sync-service.js`
- `docs/README.md`
- `docs/GUIA_IMPLEMENTACION_V2.md` (este archivo)

### Modificados
- `electron-app/src/main/main.js` - Registrar handlers config y sync
- `electron-app/src/preload/preload.js` - Exponer APIs config y sync
- `electron-app/src/renderer/src/App.jsx` - Nueva ruta role-selection
- `electron-app/src/renderer/src/context/AuthContext.jsx` - Lógica de redirección

---

## ✅ Checklist de Validación

- [x] Base de datos separada dev/prod confirmada
- [x] Pantalla de selección de rol creada
- [x] Sistema de configuración implementado
- [x] Endpoints de sincronización preparados
- [x] IPC handlers registrados correctamente
- [x] Servicio de sincronización con cola offline
- [ ] Adaptar RegisterPage según rol
- [ ] Modificar Dashboard según rol
- [ ] Implementar indicador de sincronización
- [ ] Crear servidor Node.js
- [ ] Conectar endpoints reales

---

**Última actualización:** 6 de Enero 2026  
**Estado:** ✅ Fase preparatoria completada - Lista para desarrollo v2.0
