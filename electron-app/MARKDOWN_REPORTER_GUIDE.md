# 📊 Reportes de Tests en Markdown - Guía Rápida

## ✅ Implementación Completada

Se ha implementado un sistema de reportes automáticos que guarda el resultado de cada ejecución de tests en formato Markdown.

## 🚀 Uso

### 1. Ejecutar tests normalmente

```bash
npm test
```

Al finalizar, verás:

```
📄 Reporte guardado en: /path/to/logs/test-results-2026-03-04T21-15-47.md
📄 Último reporte: /path/to/logs/test-results-latest.md
```

### 2. Ver el último reporte

```bash
npm run test:report
```

O abrirlo directamente:

```bash
# macOS
open ../logs/test-results-latest.md

# Linux
xdg-open ../logs/test-results-latest.md

# VS Code
code ../logs/test-results-latest.md
```

### 3. Limpiar reportes antiguos

```bash
npm run clean:logs
```

## 📁 Ubicación de los Reportes

```
Sistema-facturaje-inventario/
└── logs/
    ├── README.md                          # Documentación de la carpeta logs
    ├── .gitignore                         # Ignora reportes con timestamp
    ├── test-results-latest.md             # Último reporte (se versiona en git)
    └── test-results-YYYY-MM-DDTHH-MM-SS.md # Reportes históricos (no se versionan)
```

## 📝 Contenido del Reporte

Cada reporte incluye:

### 1. Resumen General

```markdown
## 📈 Resumen General

| Métrica | Valor |
|---------|-------|
| **Test Suites** | 5/5 pasadas |
| **Tests** | 46/46 pasados |
| **Tests Fallidos** | 0 |
| **Tests Pendientes** | 0 |
| **Tiempo Total** | 1.094s |
```

### 2. Barra de Progreso Visual

```
46/46 tests [██████████████████████████████████████████████████] 100.0%
```

### 3. Detalle por Suite

```markdown
### ✅ auth.test.js

- **Pasados:** 15
- **Fallidos:** 0
- **Pendientes:** 0
- **Duración:** 0.488s

#### Tests:

- ✅ debe tener configurado el usuario de prueba (1ms)
- ✅ debe poder verificar si está autenticado 
- ✅ debe poder obtener el token (aunque sea null) 
...
```

### 4. Tests Fallidos (si hay)

```markdown
## ❌ Tests Fallidos

### auth.test.js

#### ❌ debe hacer login correctamente

```
Error: Expected 200, received 401
...
```
```

## 🔧 Configuración

### Reporter Personalizado

El reporter está ubicado en:
```
electron-app/__tests__/reporters/markdown-reporter.js
```

### Configuración de Jest

En `jest.config.js`:

```javascript
reporters: [
  'default',                                              // Reporter de consola
  '<rootDir>/__tests__/reporters/markdown-reporter.js'    // Reporter de markdown
]
```

### Desactivar el Reporter

Si necesitas desactivar temporalmente el reporter, comenta la línea en `jest.config.js`:

```javascript
reporters: [
  'default',
  // '<rootDir>/__tests__/reporters/markdown-reporter.js'  // ⬅️ Comentar esta línea
]
```

## 📊 Ejemplo de Reporte Completo

```markdown
# 📊 Reporte de Tests - Jest

**Fecha:** miércoles, 4 de marzo de 2026, 9:15:47 p. m. CLST
**Duración:** 1.094s

## 📈 Resumen General

| Métrica | Valor |
|---------|-------|
| **Test Suites** | 5/5 pasadas |
| **Tests** | 46/46 pasados |
| **Tests Fallidos** | 0 |
| **Tests Pendientes** | 0 |
| **Tiempo Total** | 1.094s |

### Estado: ✅ TODOS LOS TESTS PASARON

[barra de progreso visual]

## 📝 Detalle por Suite

[Detalles de cada suite con tests individuales]

---

*Generado automáticamente por Jest Markdown Reporter*
```

## 🎯 Características

- ✅ **Generación automática** - Se ejecuta cada vez que corres `npm test`
- ✅ **Formato Markdown** - Fácil de leer y compatible con git
- ✅ **Historial completo** - Mantiene reportes con timestamp
- ✅ **Último reporte** - Siempre disponible en `test-results-latest.md`
- ✅ **Doble output** - Consola + archivo markdown
- ✅ **Git-friendly** - Solo versiona el reporte `latest`
- ✅ **Detalles de errores** - Incluye stack traces si hay fallos
- ✅ **Métricas visuales** - Barra de progreso y emojis
- ✅ **Timestamp** - Fecha y hora de cada ejecución

## 🔍 Scripts Disponibles

```bash
# Ejecutar tests y generar reporte
npm test

# Ver último reporte en consola
npm run test:report

# Limpiar reportes antiguos (mantiene latest)
npm run clean:logs

# Tests en modo watch (también genera reportes)
npm run test:watch

# Tests con cobertura
npm run test:coverage
```

## 💡 Casos de Uso

### 1. Debugging

Cuando un test falla, el reporte markdown tiene el stack trace completo:

```bash
npm test
# Ver el error en detalle
npm run test:report
```

### 2. Compartir Resultados

Compartir el archivo `test-results-latest.md` con el equipo:

```bash
# Copiar al clipboard (macOS)
cat ../logs/test-results-latest.md | pbcopy

# O enviar por email/slack
```

### 3. CI/CD

En pipelines de integración continua, guardar el reporte como artefacto:

```yaml
# GitHub Actions ejemplo
- name: Run tests
  run: npm test
- name: Upload test report
  uses: actions/upload-artifact@v2
  with:
    name: test-report
    path: logs/test-results-latest.md
```

### 4. Documentación

Usar el reporte para documentar el estado actual de los tests del proyecto.

## 🛠️ Personalización

### Cambiar ubicación de logs

En `markdown-reporter.js`, línea ~188:

```javascript
const projectRoot = path.resolve(__dirname, '../../../');  // Raíz del proyecto
const logsDir = path.join(projectRoot, 'logs');            // Carpeta logs
```

### Cambiar formato del nombre

En `markdown-reporter.js`, línea ~196:

```javascript
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const filename = `test-results-${timestamp}.md`;  // ⬅️ Cambiar aquí
```

### Agregar más información

Editar la función `generateMarkdown()` en `markdown-reporter.js` para agregar secciones personalizadas.

## 📚 Documentación Adicional

- [logs/README.md](../logs/README.md) - Documentación completa de la carpeta logs
- [__tests__/README.md](__tests__/README.md) - Documentación de tests
- [TESTING_AUTH_GUIDE.md](TESTING_AUTH_GUIDE.md) - Guía de autenticación en tests

## ✨ Resumen

**Sistema implementado completamente** ✅

Cada vez que ejecutas `npm test`:
1. ⚡ Los tests se ejecutan normalmente
2. 📊 Se genera automáticamente un reporte en markdown
3. 💾 Se guarda en `logs/test-results-[timestamp].md`
4. 🔄 Se actualiza `logs/test-results-latest.md`
5. 🎉 Puedes ver el reporte con `npm run test:report`

---

**Implementado:** 4 de Marzo de 2026  
**Reporter:** Custom Jest Markdown Reporter  
**Ubicación:** `__tests__/reporters/markdown-reporter.js`  
**Estado:** ✅ FUNCIONANDO
