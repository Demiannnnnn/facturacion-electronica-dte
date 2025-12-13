# Dashboard Moderno - Documentación

## 🎨 Características Implementadas

### 1. Tarjetas de Estadísticas (4 Cards)

Cada tarjeta tiene:
- **Gradientes modernos** con colores vibrantes
- **Animación hover** (se eleva al pasar el mouse)
- **Iconos emoji** para identificación rápida
- **Datos en tiempo real** desde la base de datos

**Tarjetas:**
1. 💰 **Total Ventas** - Suma de todas las facturas (gradiente morado)
2. 📈 **Ventas Hoy** - Ventas del día actual (gradiente rosa)
3. ⏳ **Pendientes** - Facturas por cobrar (gradiente naranja)
4. 📦 **Stock Total** - Unidades disponibles (gradiente turquesa)

### 2. Gráficos Interactivos (Chart.js)

#### 📊 Ventas Últimos 7 Días (Line Chart)
- **Tipo:** Gráfico de líneas con área rellena
- **Datos:** Ventas diarias de la última semana
- **Características:**
  - Línea suave (tension: 0.4)
  - Puntos interactivos
  - Tooltips con formato de moneda
  - Gradiente de fondo azul

#### 🏆 Top 5 Productos Más Vendidos (Bar Chart)
- **Tipo:** Gráfico de barras horizontales
- **Datos:** Los 5 productos con más unidades vendidas
- **Características:**
  - Colores diferentes por producto
  - Nombres truncados si son muy largos
  - Tooltips con cantidad exacta

#### 📋 Estado de Facturas (Doughnut Chart)
- **Tipo:** Gráfico de dona
- **Datos:** Distribución de facturas por estado
- **Estados:**
  - Pendientes (amarillo)
  - Pagadas (verde)
  - Vencidas (rojo)
  - Anuladas (gris)

### 3. Lista de Facturas Recientes

- **Muestra:** Últimas 5 facturas
- **Información por factura:**
  - Número de folio
  - Cliente (razón social)
  - Fecha de emisión
  - Monto total
  - Badge de estado (color-coded)
- **Interactividad:** Hover effect en cada item

### 4. Diseño Responsivo

- **Grid adaptativo** que se ajusta al tamaño de pantalla
- **Breakpoints:**
  - Cards: mínimo 250px
  - Gráficos: mínimo 400px
- **Layout:**
  - Fila 1: 4 tarjetas de estadísticas
  - Fila 2: 2 gráficos (ventas y productos)
  - Fila 3: Gráfico de dona + Lista de facturas

## 🎨 Paleta de Colores

### Gradientes de Cards:
- **Morado:** `#667eea → #764ba2`
- **Rosa:** `#f093fb → #f5576c`
- **Naranja:** `#ffecd2 → #fcb69f`
- **Turquesa:** `#a8edea → #fed6e3`

### Estados de Facturas:
- **Pendiente:** `#fef3c7` (fondo) / `#92400e` (texto)
- **Pagada:** `#d1fae5` (fondo) / `#065f46` (texto)
- **Vencida:** `#fee2e2` (fondo) / `#991b1b` (texto)
- **Anulada:** `#f3f4f6` (fondo) / `#374151` (texto)

## 📊 Fuentes de Datos

Todas las estadísticas se calculan en tiempo real desde:
- `window.api.facturas.getAll()` - Facturas
- `window.api.productos.getAll()` - Productos
- `window.api.clientes.getAll()` - Clientes

### Cálculos Implementados:

1. **Total Ventas:** Suma de `total` de todas las facturas
2. **Ventas Hoy:** Suma de facturas con `fecha === hoy`
3. **Facturas Pendientes:** Count de facturas con `estado === 'pendiente'`
4. **Stock Total:** Suma de `stock` de todos los productos
5. **Ventas Semanales:** Agrupación por día de los últimos 7 días
6. **Top Productos:** Suma de `cantidad` por producto en factura_items

## 🚀 Características Técnicas

### Librerías Utilizadas:
- `chart.js` v4.x - Motor de gráficos
- `react-chartjs-2` v5.x - Wrapper de React para Chart.js

### Componentes de Chart.js Registrados:
```javascript
- CategoryScale
- LinearScale
- PointElement
- LineElement
- BarElement
- ArcElement
- Title
- Tooltip
- Legend
- Filler
```

### Performance:
- **Carga inicial:** Todos los datos se cargan en un solo `useEffect`
- **Loading state:** Muestra mensaje mientras carga
- **Error handling:** Try-catch en todas las llamadas API

## 🎯 Mejoras Futuras Sugeridas

1. **Filtros de Fecha**
   - Selector de rango de fechas
   - Comparación con período anterior

2. **Más Gráficos**
   - Ventas por cliente
   - Productos con bajo stock
   - Tendencia mensual/anual

3. **Exportación**
   - Descargar gráficos como imagen
   - Exportar datos a Excel

4. **Tiempo Real**
   - Auto-refresh cada X minutos
   - WebSocket para actualizaciones instantáneas

5. **Personalización**
   - Drag & drop de widgets
   - Ocultar/mostrar gráficos
   - Temas claro/oscuro

## 📱 Responsive Design

El dashboard se adapta automáticamente a diferentes tamaños:

- **Desktop (>1200px):** 4 columnas de cards, 2 gráficos lado a lado
- **Tablet (768-1200px):** 2 columnas de cards, gráficos apilados
- **Mobile (<768px):** 1 columna, todo apilado verticalmente

## 🔄 Actualización de Datos

Para refrescar los datos del dashboard:
1. Navegar a otra página y volver
2. O implementar botón de refresh (futuro)

Los datos se cargan automáticamente al montar el componente.
