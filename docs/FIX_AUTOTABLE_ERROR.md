# Solución al Error: doc.autoTable is not a function

## Problema
Error al generar PDF: `TypeError: doc.autoTable is not a function`

## Causa
El módulo `jspdf-autotable` no se está cargando correctamente, probablemente debido a:
1. Caché de Vite
2. Problema con hot module replacement (HMR)
3. Orden de importación incorrecto

## Solución

### Opción 1: Reiniciar el servidor de desarrollo (MÁS RÁPIDA)

1. Detener el servidor de desarrollo (Ctrl+C en la terminal donde corre `npm run dev`)
2. Limpiar caché de Vite:
   ```bash
   cd electron-app
   rm -rf node_modules/.vite
   ```
3. Reiniciar el servidor:
   ```bash
   npm run dev
   ```

### Opción 2: Reinstalar dependencias (SI OPCIÓN 1 NO FUNCIONA)

1. Detener el servidor de desarrollo
2. Eliminar node_modules y reinstalar:
   ```bash
   cd electron-app
   rm -rf node_modules package-lock.json
   npm install
   ```
3. Recompilar módulos nativos:
   ```bash
   npx electron-rebuild -f -w better-sqlite3
   ```
4. Reiniciar:
   ```bash
   npm run dev
   ```

### Opción 3: Verificar importación (YA CORREGIDO)

El archivo `generarPDF.js` debe tener:
```javascript
import jsPDF from 'jspdf';
import 'jspdf-autotable';  // Side-effect import que extiende jsPDF
```

**NO usar:**
```javascript
import { jsPDF } from 'jspdf';  // ❌ Named import
import autoTable from 'jspdf-autotable';  // ❌ No es necesario
```

## Verificación

Después de reiniciar, verifica en la consola del navegador (F12):
```javascript
const doc = new jsPDF();
console.log(typeof doc.autoTable);  // Debe ser 'function'
```

## Notas Adicionales

- `jspdf-autotable` v3+ se importa como side-effect
- Extiende automáticamente el prototipo de jsPDF
- No necesitas importar nada más que el módulo
- El método `autoTable` se agrega automáticamente a todas las instancias de jsPDF
