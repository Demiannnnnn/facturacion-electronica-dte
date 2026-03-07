# Sistema de Suscripciones con Flow

## 🎯 Descripción General

El sistema implementa un modelo de suscripción con dos opciones:
1. **Prueba gratuita de 3 meses**: Sin necesidad de tarjeta de crédito
2. **Suscripción de pago**: Integración con Flow para pagos mensuales

## 🔄 Flujo Completo

### 1. Registro de Usuario
```
Usuario → RegisterPage → Completa datos → Guarda email → Redirige a /subscription
```

### 2. Selección de Plan
```
/subscription → Usuario elige:
  - Prueba gratuita (3 meses)
  - Plan de pago (mensual)
```

### 3. Activación de Prueba
```
Click en "Comenzar prueba" →
IPC: subscription:activateTrial →
Guarda en electron-store:
  {
    subscriptionType: 'trial',
    startDate: now,
    endDate: now + 90 días,
    hasActiveSubscription: true
  } →
Redirige según rol (contador o módulos)
```

### 4. Proceso de Pago con Flow
```
Click en "Suscribirse" →
IPC: subscription:initializePayment →
POST a tu API REST /subscriptions/flow/create →
Tu API → Flow API →
Flow devuelve URL + token →
electron.shell.openExternal(url) →
Usuario paga en Flow →
Flow redirige a tu callback URL →
Tu API verifica pago →
Usuario hace click en "Verificar pago" →
IPC: subscription:verifyPayment →
GET a tu API REST /subscriptions/flow/verify/:token →
Si exitoso:
  Guarda suscripción activa →
  Redirige al sistema
```

### 5. Verificación en Login
```
LoginPage → login() →
AuthContext.login() →
  1. Verifica suscripción: subscription:getStatus
  2. Si no hay suscripción activa:
     - return { success: false, needsSubscription: true }
     - LoginPage redirige a /subscription
  3. Si hay suscripción:
     - Verifica contraseña
     - Inicia sesión
     - Redirige según rol
```

### 6. Advertencia de Vencimiento
```
Si subscription.daysRemaining <= 7:
  - Muestra SubscriptionWarning en layouts
  - Botón "Renovar ahora" → /subscription
  - Colores: 
    * <= 2 días: rojo
    * <= 5 días: naranja
    * <= 7 días: amarillo
```

## 📁 Estructura de Archivos

### Frontend (Renderer)
```
src/renderer/src/
├── pages/
│   ├── Auth/
│   │   ├── RegisterPage.jsx         # Guarda email y redirige a /subscription
│   │   └── LoginPage.jsx            # Verifica suscripción antes de login
│   └── SubscriptionPage.jsx         # Página de selección de plan
├── components/
│   └── SubscriptionWarning.jsx      # Alerta de vencimiento
├── context/
│   └── AuthContext.jsx              # Maneja estado de suscripción
└── App.jsx                          # Ruta /subscription
```

### Backend (Main Process)
```
src/main/
├── ipc/
│   └── subscription.js              # Handlers IPC para suscripciones
├── main.js                          # Importa handlers + openExternal
└── preload/
    └── preload.js                   # API subscription + openExternal
```

## 🔑 API IPC

### subscription:getStatus
Obtiene el estado actual de la suscripción
```javascript
const status = await window.api.subscription.getStatus();
// Returns:
{
  hasActiveSubscription: boolean,
  subscriptionType: 'trial' | 'paid' | null,
  startDate: string,
  endDate: string,
  daysRemaining: number | null
}
```

### subscription:activateTrial
Activa la prueba gratuita de 3 meses (solo una vez)
```javascript
const result = await window.api.subscription.activateTrial();
// Returns:
{
  success: boolean,
  subscription: { ... },
  error?: string
}
```

### subscription:initializePayment
Inicializa un pago con Flow
```javascript
const result = await window.api.subscription.initializePayment();
// Returns:
{
  success: boolean,
  paymentUrl: string,
  flowToken: string,
  error?: string
}
```

### subscription:verifyPayment
Verifica un pago realizado en Flow
```javascript
const result = await window.api.subscription.verifyPayment(flowToken);
// Returns:
{
  success: boolean,
  subscription: { ... },
  error?: string
}
```

### subscription:cancel
Cancela la suscripción actual
```javascript
const result = await window.api.subscription.cancel();
```

### subscription:renew
Renueva la suscripción (reinicia pago con Flow)
```javascript
const result = await window.api.subscription.renew();
```

## 🌐 Endpoints API REST (Tu Backend)

Debes implementar estos endpoints en tu API:

### POST /subscriptions/flow/create
Crea un pago en Flow
```json
Request: {
  "email": "user@example.com",
  "plan": "monthly"
}

Response: {
  "success": true,
  "paymentUrl": "https://www.flow.cl/app/web/pay.php?token=xxx",
  "flowToken": "xxx"
}
```

### GET /subscriptions/flow/verify/:token
Verifica el estado de un pago
```json
Response: {
  "success": true,
  "status": "paid",
  "subscriptionId": "sub_xxx",
  "expirationDate": "2024-04-01"
}
```

### POST /subscriptions/trial
Registra inicio de prueba (opcional, para tracking)
```json
Request: {
  "email": "user@example.com"
}
```

### POST /subscriptions/cancel
Cancela suscripción en Flow (si aplica)
```json
Request: {
  "subscriptionId": "sub_xxx"
}
```

## 💾 Almacenamiento Local (electron-store)

### subscription_config
```json
{
  "hasActiveSubscription": true,
  "subscriptionType": "trial",  // 'trial' | 'paid'
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-04-01T00:00:00.000Z",
  "flowToken": "xxx",           // solo para paid
  "subscriptionId": "sub_xxx"   // solo para paid
}
```

### trial_used
```json
{
  "used": true,
  "usedAt": "2024-01-01T00:00:00.000Z"
}
```

### user_email
```json
"user@example.com"
```

## 🎨 UI Components

### SubscriptionPage
- Card "Prueba Gratuita": 3 meses, botón verde
- Card "Plan Mensual": Precio, botón azul
- Botón "Verificar pago" después de Flow

### SubscriptionWarning
- Se muestra cuando `daysRemaining <= 7`
- Colores según urgencia (rojo/naranja/amarillo)
- Botón "Renovar ahora"
- Botón "Cerrar" (oculta temporalmente)

### Role Badge
Muestra el rol del usuario en el header:
- 👑 Dueño (dorado)
- 🛡️ Administrador (azul)
- 💼 Vendedor (verde)
- 💰 Cajero (amarillo)
- 📊 Contador (morado)

## 🔒 Validaciones

### En Login
```javascript
1. Verifica si hay suscripción activa
2. Si no hay → redirige a /subscription
3. Si está vencida → redirige a /subscription
4. Si está activa → permite login
```

### En Trial Activation
```javascript
1. Verifica si trial ya fue usado
2. Si fue usado → error
3. Si no → activa trial de 3 meses
```

### En Payment Verification
```javascript
1. Verifica token con API
2. Si pago exitoso → activa suscripción
3. Si falla → muestra error
```

## 🧪 Testing

### Probar Flujo Completo
```bash
# 1. Limpiar configuración
rm -rf ~/Library/Application\ Support/electron-app/config.json  # macOS
rm -rf ~/.config/electron-app/config.json  # Linux

# 2. Iniciar app
npm run dev

# 3. Registrar usuario nuevo
# 4. Seleccionar "Prueba Gratuita"
# 5. Verificar que accede al sistema
# 6. Verificar que no se puede usar trial de nuevo
```

### Probar Pago con Flow
```bash
# 1. Registrar usuario
# 2. Seleccionar "Plan Mensual"
# 3. Se abre navegador con Flow
# 4. Completar pago en Flow (usar tarjetas de prueba)
# 5. Volver a la app
# 6. Click en "Verificar pago"
# 7. Verificar que suscripción está activa
```

### Probar Vencimiento
```javascript
// En DevTools (Ctrl+Shift+I en la app)
// Modificar fecha de vencimiento para probar advertencias
await window.api.config.set('subscription_config', {
  hasActiveSubscription: true,
  subscriptionType: 'trial',
  startDate: '2024-01-01',
  endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 días
});
// Recargar app → debería mostrar advertencia naranja
```

## 🔧 Configuración

### Flow API Keys
En tu backend, necesitas configurar:
```env
FLOW_API_KEY=tu_api_key
FLOW_SECRET_KEY=tu_secret_key
FLOW_API_URL=https://www.flow.cl/api
```

### Callback URL
Configura en Flow la URL de retorno:
```
https://tuapi.com/flow/callback
```

## 📊 Estados de Suscripción

| Estado | hasActiveSubscription | Comportamiento |
|--------|----------------------|----------------|
| Sin suscripción | false | Bloquea login, redirige a /subscription |
| Trial activo | true | Permite acceso completo |
| Trial por vencer | true | Muestra advertencia + permite acceso |
| Trial vencido | false | Bloquea login |
| Pago activo | true | Permite acceso completo |
| Pago por vencer | true | Muestra advertencia + permite acceso |
| Pago vencido | false | Bloquea login |

## 🚀 Próximos Pasos

1. **Implementar endpoints de API**:
   - POST /subscriptions/flow/create
   - GET /subscriptions/flow/verify/:token
   - POST /subscriptions/trial
   - POST /subscriptions/cancel

2. **Configurar Flow**:
   - Crear cuenta Flow
   - Obtener API keys
   - Configurar webhooks
   - Configurar URL de retorno

3. **Testing en producción**:
   - Probar con tarjetas reales
   - Verificar webhooks
   - Probar renovación automática

4. **Mejoras futuras**:
   - Planes anuales con descuento
   - Diferentes niveles de suscripción
   - Renovación automática
   - Historial de pagos
   - Facturas descargables

## 📝 Notas Importantes

- ✅ La prueba gratuita solo se puede usar UNA VEZ por instalación
- ✅ El token de Flow es de un solo uso
- ✅ La suscripción se verifica en cada login
- ✅ Las advertencias aparecen 7 días antes del vencimiento
- ✅ El sistema bloquea acceso cuando vence la suscripción
- ✅ electron-store persiste la configuración entre reinicios

## 🐛 Troubleshooting

### "No se puede activar trial"
- Verificar que no se haya usado antes
- Borrar `trial_used` de electron-store si es ambiente de desarrollo

### "Error al inicializar pago"
- Verificar que la API esté corriendo
- Verificar API keys de Flow
- Revisar logs del backend

### "Pago no se verifica"
- Esperar 1-2 minutos después del pago en Flow
- Verificar que el callback de Flow haya llegado al backend
- Revisar logs de Flow en el dashboard

### "Suscripción se muestra como inactiva después de pagar"
- Click en "Verificar pago" nuevamente
- Verificar que la fecha de vencimiento sea futura
- Revicar configuración en electron-store
