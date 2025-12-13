# Sistema Mock - Guía de Uso

## 🎯 Propósito

Simular la conexión con Railway + ChileAPI **sin costos** durante el desarrollo.

## 📁 Estructura

```
Sistema-facturaje-inventario/
├── electron-app/
│   └── src/main/services/
│       └── api-client.js          ← Cliente API (usa mock o producción)
└── server/
    └── mock/
        ├── data/
        │   ├── licenses.json       ← Licencias simuladas
        │   └── sii-responses.json  ← Respuestas del SII simuladas
        └── mock-server.js          ← Lógica del mock
```

## 🚀 Uso

### Desarrollo (Mock)

```bash
# 1. Copiar .env.example
cd electron-app
cp .env.example .env

# 2. Verificar que API_MODE=mock
cat .env

# 3. Correr la app
npm run dev
```

**Resultado:** Todo funciona localmente, sin servidor externo.

### Producción (Railway)

```bash
# 1. Cambiar .env
API_MODE=production
API_URL=https://tu-app.railway.app
CHILEAPI_KEY=tu-key-real

# 2. Build
npm run build

# 3. La app ahora usa Railway + ChileAPI real
```

## 📝 Ejemplo de Uso en Código

```javascript
// En cualquier parte de tu app Electron
const { getAPIClient } = require('./services/api-client');

const api = getAPIClient();

// Validar licencia
const result = await api.validateLicense('DEV-LICENSE-2024', machineId);
if (result.valid) {
  console.log('Licencia válida');
}

// Enviar DTE al SII
const dteResult = await api.enviarDTE({
  folio: 123,
  emisor: { ... },
  receptor: { ... },
  items: [ ... ]
});

if (dteResult.success) {
  console.log('DTE enviado:', dteResult.trackId);
}
```

## 🎭 Respuestas Simuladas

### Licencias

**Licencia de desarrollo (siempre válida):**
- Key: `DEV-LICENSE-2024`
- Expira: 2099
- Machine ID: `*` (cualquier equipo)

### SII/ChileAPI

**Probabilidades:**
- 70% → Éxito (ACEPTADO)
- 20% → Aceptado con reparos
- 10% → Rechazado

**Delay simulado:** 200-1500ms (simula red real)

## 🔄 Migración a Producción

### Paso 1: Preparar Servidor

```bash
cd server
npm install
```

### Paso 2: Deploy a Railway

```bash
# Conectar con Railway
railway login
railway init
railway up
```

### Paso 3: Cambiar Variables

```env
# .env
API_MODE=production
API_URL=https://tu-app.railway.app
```

### Paso 4: Build

```bash
npm run build
```

**¡Listo!** La app ahora usa el servidor real.

## 🧪 Testing

### Probar Mock

```javascript
// En DevTools (F12)
const api = window.api; // Expuesto por preload

// Test licencia
const result = await api.validateLicense('DEV-LICENSE-2024', 'test-machine');
console.log(result);

// Test DTE
const dte = await api.enviarDTE({ folio: 1, ... });
console.log(dte);
```

### Probar Producción

1. Cambiar `API_MODE=production`
2. Reiniciar app
3. Mismo código, ahora usa Railway

## 📊 Ventajas

✅ **Cero costos** en desarrollo  
✅ **Desarrollo offline** (sin internet)  
✅ **Testing completo** (éxito, errores, timeouts)  
✅ **Migración trivial** (una variable)  
✅ **Debugging fácil** (logs locales)

## ⚠️ Limitaciones del Mock

- No valida XML real contra XSD del SII
- No genera firma digital real
- No descarga PDFs timbrados reales
- Respuestas predefinidas (no dinámicas)

**Solución:** Cuando tengas clientes, migra a producción.

## 🎯 Roadmap

**Semana 1-4 (Ahora):**
- ✅ Desarrollar con mock
- ✅ Implementar toda la lógica
- ✅ Testing exhaustivo

**Semana 4-5:**
- Deploy a Railway (tier gratuito)
- Integrar ChileAPI real
- Testing en producción

**Semana 6+:**
- Primeros clientes
- Escalar según demanda

## 💡 Tips

1. **Siempre desarrolla con mock primero**
2. **Prueba producción solo cuando esté pulido**
3. **Usa Railway gratis para testing**
4. **Activa pago solo con clientes**

## 🆘 Troubleshooting

**Error: "Cannot find module mock-server"**
```bash
# Verificar que existe
ls server/mock/mock-server.js

# Verificar ruta en api-client.js
```

**Mock no responde:**
```bash
# Verificar API_MODE
echo $API_MODE  # debe ser 'mock'

# Verificar logs
# Buscar "[API Client] Mode: mock"
```

**Quiero probar producción:**
```bash
# Cambiar temporalmente
API_MODE=production npm run dev

# Volver a mock
API_MODE=mock npm run dev
```

---

**¿Dudas?** Revisa `api-client.js` y `mock-server.js` - el código está comentado.
