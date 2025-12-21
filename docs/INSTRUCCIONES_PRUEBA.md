# 🚀 Instrucciones de Instalación y Prueba - v1.1.0

## Nuevas Funcionalidades de Cuentas por Cobrar

---

## 📋 PREREQUISITOS

Antes de probar las nuevas funcionalidades, asegúrate de tener:

- ✅ Node.js 20.x LTS instalado
- ✅ npm 9.x o superior
- ✅ El proyecto clonado localmente
- ✅ Dependencias instaladas

---

## 🔧 INSTALACIÓN

### 1. Verificar Dependencias

Las nuevas funcionalidades requieren Chart.js. Verifica que esté instalado:

```bash
cd electron-app
npm list chart.js react-chartjs-2
```

**Salida esperada:**
```
├── chart.js@4.5.1
└── react-chartjs-2@5.3.1
```

### 2. Si NO están instaladas:

```bash
npm install chart.js@^4.5.1 react-chartjs-2@^5.3.1
```

### 3. Verificar Archivos Nuevos

Confirma que los archivos fueron creados correctamente:

```bash
# Desde la raíz del proyecto
ls -la electron-app/src/renderer/src/pages/Facturacion/CuentasPorCobrar.*
```

**Deberías ver:**
```
CuentasPorCobrar.css
CuentasPorCobrar.jsx
```

---

## ▶️ EJECUTAR LA APLICACIÓN

### Opción 1: Modo Desarrollo (Recomendado)

```bash
cd electron-app
npm run dev
```

**Qué hace:**
- Inicia Vite dev server en puerto 5173
- Abre Electron con hot-reload
- Los cambios se reflejan automáticamente

### Opción 2: Build y Ejecutar

```bash
cd electron-app
npm run build:renderer
npm start
```

**Qué hace:**
- Compila el frontend
- Ejecuta Electron en modo producción

---

## 🧪 GUÍA DE PRUEBAS

### Paso 1: Acceder al Módulo

1. Abre la aplicación
2. Inicia sesión (o regístrate si es primera vez)
3. En el menú lateral, haz clic en **💰 Cuentas por Cobrar**

### Paso 2: Verificar Alertas de Vencimiento

**Qué buscar:**
- 4 tarjetas de colores en la parte superior
- Cada tarjeta debe mostrar:
  - Icono grande (🚨, ⚠️, 📅, ✅)
  - Etiqueta descriptiva
  - Número de facturas
  - Monto total

**Prueba:**
- Pasa el mouse sobre cada tarjeta
- Debe elevarse ligeramente (efecto hover)
- Los colores deben ser distintivos

**Colores esperados:**
- Vencidas: Fondo rojo claro, borde rojo
- 7 días: Fondo amarillo claro, borde amarillo
- 15 días: Fondo azul claro, borde azul
- Cobrado: Fondo verde claro, borde verde

### Paso 3: Verificar Gráficos

**Gráfico 1: Distribución de Cobros (Dona)**

Ubicación: Debajo de las alertas, lado izquierdo

**Qué buscar:**
- Gráfico circular con 3 secciones
- Verde: Cobrado
- Amarillo: Por Cobrar
- Rojo: Vencido

**Prueba:**
- Pasa el mouse sobre cada sección
- Debe aparecer un tooltip con:
  - Nombre de la categoría
  - Monto en formato CLP ($XXX.XXX)

**Gráfico 2: Proyección de Flujo de Caja (Línea)**

Ubicación: Debajo de las alertas, lado derecho

**Qué buscar:**
- Gráfico de línea con puntos
- Eje X: Fechas (8 semanas)
- Eje Y: Montos (en miles: $XXK)
- Línea azul con relleno

**Prueba:**
- Pasa el mouse sobre cada punto
- Debe aparecer tooltip con:
  - Fecha
  - Monto esperado en CLP

### Paso 4: Verificar Botones de Exportación

**Ubicación:** Encima de la tabla de facturas

**Qué buscar:**
- 2 botones con iconos:
  - 📊 Exportar a Excel
  - 📑 Exportar a PDF

**Prueba:**
- Pasa el mouse sobre cada botón
- Debe cambiar de color (blanco → azul)
- Debe elevarse ligeramente
- Al hacer clic, debe mostrar mensaje (funcionalidad en desarrollo)

### Paso 5: Verificar Tabs

**Ubicación:** Debajo del título "Cuentas por Cobrar"

**Tabs disponibles:**
1. 📋 Pendientes
2. ⚠️ Vencidas
3. ✅ Pagadas
4. 📊 Estado de Cuenta

**Prueba:**
- Haz clic en cada tab
- El tab activo debe tener:
  - Borde inferior azul
  - Texto azul
- Los gráficos solo aparecen en tab "Pendientes"
- La tabla debe filtrar según el tab seleccionado

### Paso 6: Verificar Tabla de Facturas

**Qué buscar:**
- Tabla con encabezado morado (gradiente)
- Columnas: Folio, Cliente, Fecha Emisión, Vencimiento, Total, Pagado, Saldo, Estado, Acciones
- Filas con hover effect (fondo gris claro)

**Prueba:**
- Pasa el mouse sobre una fila
- Debe cambiar el color de fondo
- Los badges de estado deben tener colores:
  - Pagada: Verde
  - Pendiente: Azul
  - Vencida: Rojo
  - Pago Parcial: Amarillo

### Paso 7: Verificar Modal de Pago

**Cómo abrir:**
- En una factura pendiente, haz clic en el botón 💰

**Qué buscar:**
- Modal centrado con fondo oscuro difuminado
- Animación de entrada (slide-in desde arriba)
- Información de la factura en card gris
- Formulario con 4 campos:
  1. Monto a Pagar
  2. Método de Pago
  3. Referencia
  4. Notas

**Prueba:**
- Completa el formulario
- Haz clic en "Registrar Pago"
- Debe cerrar el modal
- La tabla debe actualizarse
- Los gráficos deben recalcularse

### Paso 8: Verificar Responsive Design

**Prueba en diferentes tamaños:**

**Desktop (>768px):**
- Alertas: 4 columnas
- Gráficos: 2 columnas
- Tabla: Todas las columnas visibles

**Tablet (768px):**
- Alertas: 2 columnas
- Gráficos: 1 columna
- Tabla: Scroll horizontal

**Mobile (<768px):**
- Alertas: 1 columna
- Gráficos: 1 columna
- Tabs: Scroll horizontal
- Tabla: Fuentes reducidas

**Cómo probar:**
- Abre DevTools (F12)
- Haz clic en el icono de dispositivo móvil
- Cambia entre diferentes tamaños
- Verifica que todo se vea bien

---

## ✅ CHECKLIST DE VALIDACIÓN

Marca cada item después de probarlo:

### Funcionalidad:
- [ ] Alertas muestran datos correctos
- [ ] Gráfico de dona se renderiza
- [ ] Gráfico de línea se renderiza
- [ ] Tooltips funcionan en gráficos
- [ ] Botones de exportación están visibles
- [ ] Tabs cambian correctamente
- [ ] Tabla filtra según tab
- [ ] Modal de pago se abre
- [ ] Registro de pago funciona
- [ ] Datos se actualizan después de pago

### Diseño:
- [ ] Colores son consistentes
- [ ] Gradientes se ven bien
- [ ] Animaciones son suaves
- [ ] Hover effects funcionan
- [ ] Modal tiene backdrop blur
- [ ] Badges tienen colores correctos
- [ ] Tipografía es legible
- [ ] Iconos son claros

### Responsive:
- [ ] Desktop (>768px) se ve bien
- [ ] Tablet (768px) se ve bien
- [ ] Mobile (<768px) se ve bien
- [ ] Tabs tienen scroll en mobile
- [ ] Alertas se apilan en mobile
- [ ] Gráficos se adaptan

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Problema: Los gráficos no se muestran

**Posibles causas:**
1. Chart.js no está instalado
2. Error en la consola

**Solución:**
```bash
# Reinstalar dependencias
cd electron-app
npm install chart.js react-chartjs-2

# Limpiar caché y reiniciar
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Problema: Las alertas muestran 0 en todo

**Causa:** No hay facturas en la base de datos

**Solución:**
1. Crea algunos clientes
2. Crea algunas facturas
3. Recarga la página de Cuentas por Cobrar

### Problema: Error "Cannot read property 'map' of undefined"

**Causa:** Datos no cargados desde el backend

**Solución:**
1. Verifica que los handlers IPC estén registrados
2. Revisa la consola del proceso principal
3. Asegúrate de que la BD existe

```bash
# Verificar que la BD existe
ls -la ~/Library/Application\ Support/sistema-facturacion/facturacion.db
```

### Problema: Los estilos no se aplican

**Causa:** CSS no se importó correctamente

**Solución:**
1. Verifica que CuentasPorCobrar.css existe
2. Verifica el import en CuentasPorCobrar.jsx:
```javascript
import './CuentasPorCobrar.css';
```
3. Reinicia el servidor de desarrollo

### Problema: Modal no se cierra

**Causa:** Event propagation

**Solución:**
- Haz clic en el botón X (arriba derecha)
- O haz clic fuera del modal (en el fondo oscuro)

---

## 📊 DATOS DE PRUEBA RECOMENDADOS

Para probar todas las funcionalidades, crea:

### Clientes (mínimo 3):
1. Cliente A - RUT válido
2. Cliente B - RUT válido
3. Cliente C - RUT válido

### Facturas (mínimo 6):
1. Factura vencida (fecha vencimiento: hace 10 días)
2. Factura vencida (fecha vencimiento: hace 5 días)
3. Factura vence en 5 días
4. Factura vence en 10 días
5. Factura vence en 20 días
6. Factura pagada

**Cómo crear facturas con fechas específicas:**
1. Crea la factura normalmente
2. Edita manualmente la BD (si es necesario)
3. O espera a que algunas facturas venzan naturalmente

---

## 🎯 CRITERIOS DE ÉXITO

La implementación es exitosa si:

✅ **Todos los gráficos se renderizan** correctamente  
✅ **Las alertas muestran datos** reales de la BD  
✅ **Los colores y diseño** son consistentes  
✅ **Las animaciones** son suaves y profesionales  
✅ **El responsive** funciona en todos los tamaños  
✅ **No hay errores** en la consola  
✅ **La performance** es buena (sin lag)  

---

## 📞 SOPORTE

Si encuentras problemas:

1. **Revisa la consola** (F12) para errores
2. **Consulta la documentación:**
   - MEJORAS_CUENTAS_COBRAR.md
   - GUIA_RAPIDA_CUENTAS_COBRAR.md
3. **Verifica los archivos** fueron creados correctamente
4. **Contacta al desarrollador:**
   - Email: dmaturana22@alumnos.utalca.cl

---

## 🎉 ¡LISTO!

Si completaste todos los pasos del checklist, ¡felicitaciones! 

Las nuevas funcionalidades están funcionando correctamente y listas para usar.

**Próximos pasos:**
1. Usar el sistema en producción
2. Recopilar feedback de usuarios
3. Implementar mejoras adicionales

---

**Versión:** 1.1.0  
**Fecha:** 21 de Diciembre, 2025  
**Desarrollador:** Demian Maturana
