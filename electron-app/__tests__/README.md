# 🧪 Tests del Sistema de Facturación

Esta carpeta contiene todos los tests automatizados del proyecto **con autenticación JWT completamente integrada**.

## ✅ Estado Actual

```
Test Suites: 5 passed, 5 total
Tests:       46 passed, 46 total
Autenticación: JWT Token ✅
```

## 📋 Estructura

```
__tests__/
├── setup.js                    # Configuración global de Jest
├── helpers.js                  # Utilidades y helpers para tests
├── api/                        # Tests de API
│   ├── connectivity.test.js    # Tests de conectividad general
│   ├── api-client.test.js      # Tests del cliente API principal
│   └── clientes-api.test.js    # Tests del servicio de clientes
└── integration/                # Tests de integración (TODO)
    └── ipc-handlers.test.js    # Tests de IPC handlers
```

## 🚀 Comandos

### Ejecutar todos los tests
```bash
npm test
```

### Ejecutar tests en modo watch (desarrollo)
```bash
npm run test:watch
```

### Ejecutar tests con reporte de cobertura
```bash
npm run test:coverage
```

### Ejecutar solo tests de API
```bash
npm run test:api
```

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env.test` en la raíz del proyecto:

```env
NODE_ENV=test
API_URL=http://localhost:3000
API_BASE_URL=http://localhost:3000/api
```

### Jest

La configuración de Jest está en `jest.config.js`. Características principales:

- ✅ Soporte para ES modules
- ✅ Timeout de 10 segundos para tests de API
- ✅ Reporte de cobertura configurado
- ✅ Setup automático antes de cada test suite

## 📝 Escribiendo Tests

### Estructura básica

```javascript
import { describe, test, expect } from '@jest/globals';

describe('Nombre del módulo', () => {
  test('debe hacer algo específico', () => {
    const resultado = miFuncion();
    expect(resultado).toBe(valorEsperado);
  });
});
```

### Tests de API

Para tests de API, usa los helpers disponibles:

```javascript
import { isAPIAvailable, mockCliente } from '../helpers.js';

test('debe conectarse a la API', async () => {
  const disponible = await isAPIAvailable('http://localhost:3000/health');
  expect(disponible).toBe(true);
}, 10000); // Timeout de 10s
```

### Mocks disponibles

En `helpers.js` encontrarás:
- `mockCliente` - Cliente de ejemplo
- `mockProducto` - Producto de ejemplo
- `mockFactura` - Factura de ejemplo
- `generarRutTest()` - Genera RUT válido aleatorio

## 🔍 Tests de Conectividad

El archivo `api/connectivity.test.js` es especialmente útil para verificar que tu backend está funcionando:

```bash
npm run test:api -- connectivity.test.js
```

Este test verifica:
- ✅ URL de la API es válida
- ✅ Endpoint `/health` responde
- ✅ Endpoints principales existen
- ✅ Latencia de la API

## 🐛 Debugging

### Ver output detallado
```bash
npm test -- --verbose
```

### Ejecutar un test específico
```bash
npm test -- api-client.test.js
```

### Ver solo tests fallidos
```bash
npm test -- --onlyFailures
```

## 📊 Cobertura de Código

El objetivo mínimo de cobertura es:
- Branches: 50%
- Functions: 50%
- Lines: 50%
- Statements: 50%

Para ver el reporte completo:
```bash
npm run test:coverage
```

Luego abre `coverage/lcov-report/index.html` en tu navegador.

## ⚠️ Notas Importantes

### Tests sin Backend

Los tests están diseñados para **no fallar** si el backend no está disponible. En lugar de fallar, mostrarán advertencias como:

```
⚠️  API no disponible (esto es esperado en desarrollo)
💡 Para tests completos, inicia tu backend en: http://localhost:3000
```

Esto permite ejecutar los tests en cualquier momento del desarrollo.

### Tests en CI/CD

Para CI/CD, asegúrate de que el backend esté corriendo antes de ejecutar los tests:

```bash
# En tu pipeline de CI
docker-compose up -d backend
npm test
```

## 🎯 Buenas Prácticas

1. **Tests descriptivos**: Usa nombres claros que expliquen qué se está probando
2. **Independencia**: Cada test debe poder ejecutarse solo
3. **Cleanup**: Limpia datos de test después de cada suite
4. **Mocks**: Usa mocks para APIs externas (SII, etc.)
5. **Timeouts**: Configura timeouts apropiados para tests de red

## 📚 Recursos

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [ES Modules in Jest](https://jestjs.io/docs/ecmascript-modules)

## 🆘 Troubleshooting

### "Cannot find module"
Asegúrate de usar rutas relativas correctas con `.js` al final:
```javascript
import { algo } from '../../src/main/services/algo.js';
```

### "Transform support is not enabled"
Ya está configurado en `jest.config.js`. Si persiste, ejecuta:
```bash
node --experimental-vm-modules node_modules/jest/bin/jest.js
```

### "Timeout exceeded"
Aumenta el timeout en tests de red:
```javascript
test('mi test lento', async () => {
  // ...
}, 15000); // 15 segundos
```

## 🚀 Próximos Pasos

- [ ] Agregar tests de integración para IPC handlers
- [ ] Tests para componentes React (usando @testing-library)
- [ ] Tests E2E con Playwright
- [ ] Integración con CI/CD (GitHub Actions)
- [ ] Tests de performance
