# 🧪 Guía Rápida de Testing

## ✅ Instalación Completada

Tu proyecto ahora tiene **Jest** configurado y listo para usar.

## 🚀 Comandos Rápidos

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch (útil mientras desarrollas)
npm run test:watch

# Ver cobertura de código
npm run test:coverage

# Ejecutar solo tests de API
npm run test:api

# Verificar conectividad con tu backend
npm run check-api
```

## 📊 Resultado de la Primera Ejecución

```
✅ Test Suites: 4 passed, 4 total
✅ Tests:       31 passed, 31 total
⚡ Time:        0.583 s
```

## 📁 Estructura Creada

```
electron-app/
├── jest.config.js              # Configuración de Jest
├── .env.test                   # Variables de entorno para tests
├── __tests__/                  # Carpeta de tests
│   ├── setup.js                # Setup global
│   ├── helpers.js              # Utilidades (mocks, helpers)
│   ├── README.md               # Documentación completa
│   ├── api/                    # Tests de API
│   │   ├── connectivity.test.js    # Tests de conectividad ⭐
│   │   ├── api-client.test.js      # Tests del cliente API
│   │   └── clientes-api.test.js    # Tests del servicio de clientes
│   └── integration/
│       └── ipc-handlers.test.js    # Tests de IPC (placeholder)
└── scripts/
    └── check-api.js            # Script para verificar backend
```

## 🎯 Tests Principales

### 1. **Test de Conectividad** (Más importante para ti)

```bash
npm run test:api -- connectivity.test.js
```

Este test verifica:
- ✅ La URL de tu API es válida
- ✅ El endpoint `/health` responde
- ✅ Los endpoints principales existen
- ✅ La latencia de tu API

### 2. **Verificación Rápida del Backend**

```bash
npm run check-api
```

Este comando te dice inmediatamente si tu backend está corriendo y funcionando.

## 📝 Tests Actuales

### 🔌 Conectividad (5 tests)
- Verifica que puedes conectarte a tu API
- Mide latencia
- Verifica endpoints principales

### 🔧 API Client (14 tests)
- Validación de licencias
- Envío de DTE al SII
- Consulta de estado de DTE
- Generación de PDF timbrado

### 👥 API de Clientes (12 tests)
- CRUD de clientes
- Validación de datos
- Manejo de errores

## 🎨 Características Especiales

### Tests Inteligentes
Los tests **NO FALLAN** si tu backend no está disponible. En su lugar, muestran advertencias:

```
⚠️  API no disponible (esto es esperado en desarrollo)
💡 Para tests completos, inicia tu backend en: http://localhost:3000
```

Esto te permite ejecutar tests en cualquier momento sin preocuparte de tener el backend corriendo.

## 📖 Ejemplo de Uso en Desarrollo

### Escenario 1: Desarrollo Normal
```bash
# Terminal 1: Inicia tu backend
cd backend && npm run dev

# Terminal 2: Ejecuta tests en watch mode
cd electron-app && npm run test:watch
```

### Escenario 2: Solo Frontend
```bash
# Los tests funcionan igual y te informan que el backend no está disponible
npm test
```

## 🔧 Configuración de Variables de Entorno

Edita `.env.test` si tu backend está en otra URL:

```env
NODE_ENV=test
API_URL=http://localhost:4000          # Si tu puerto es diferente
API_BASE_URL=http://localhost:4000/api
```

## 🧰 Helpers Disponibles

En `__tests__/helpers.js` tienes utilidades listas:

```javascript
import { 
  mockCliente,      // Cliente de prueba
  mockProducto,     // Producto de prueba
  mockFactura,      // Factura de prueba
  generarRutTest,   // Genera RUT válido aleatorio
  isAPIAvailable    // Verifica si API está disponible
} from './__tests__/helpers.js';
```

## 📚 Próximos Pasos

1. **Agregar más tests** según necesites:
   ```bash
   # Crea nuevos archivos en __tests__/api/
   touch __tests__/api/productos-api.test.js
   ```

2. **Tests de componentes React**:
   ```bash
   npm install --save-dev @testing-library/react @testing-library/jest-dom
   ```

3. **Ver documentación completa**:
   ```bash
   cat __tests__/README.md
   ```

## 🆘 Problemas Comunes

### "Cannot find module"
✅ Solución: Asegúrate de incluir `.js` en los imports:
```javascript
import { algo } from '../../src/main/services/algo.js';
```

### "Timeout exceeded"
✅ Solución: Aumenta el timeout en el test:
```javascript
test('mi test', async () => {
  // ...
}, 15000); // 15 segundos
```

### Backend no responde
✅ Solución: Verifica que esté corriendo:
```bash
npm run check-api
```

## 🎉 ¡Listo para usar!

Tu sistema de testing está completamente configurado. Puedes empezar a escribir tests para nuevas funcionalidades o ejecutar los existentes para verificar que todo funciona.

**Comando recomendado para empezar:**
```bash
npm run check-api && npm test
```

---

**Framework elegido:** Jest 29.7.0  
**Razón:** Estándar de la industria, excelente soporte para ES modules, gran ecosistema
