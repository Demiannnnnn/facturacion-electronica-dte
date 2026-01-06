# 📥 Importación de Datos desde Excel - Documentación

**Versión:** 1.2.0  
**Fecha:** 21 de Diciembre, 2025  
**Módulo:** Importación de Datos

---

## 🎯 DESCRIPCIÓN GENERAL

La funcionalidad de importación permite cargar datos masivos desde archivos Excel (.xlsx, .xls, .csv) al sistema, facilitando la migración desde otros sistemas o la carga inicial de datos.

### Características Principales:
- ✅ Importación de Clientes
- ✅ Importación de Productos
- ✅ Validación robusta de datos
- ✅ Detección y actualización de duplicados
- ✅ Generación de templates de ejemplo
- ✅ Reporte detallado de errores
- ✅ Soporte para múltiples formatos de columnas

---

## 📋 FUNCIONALIDADES IMPLEMENTADAS

### 1. Importar Clientes desde Excel

**Acceso:**
- Menú: `Archivo → Importar → Importar Clientes desde Excel`
- Atajo: `Ctrl+Shift+I` (Windows/Linux) o `Cmd+Shift+I` (Mac)

**Columnas Requeridas:**
- `RUT` o `rut` - RUT del cliente (requerido)
- `Razón Social` o `razon_social` o `Razon Social` - Nombre de la empresa (requerido)

**Columnas Opcionales:**
- `Giro` o `giro` - Actividad comercial
- `Dirección` o `direccion` o `Direccion` - Dirección física
- `Región` o `region` o `Region` - Región de Chile
- `Comuna` o `comuna` - Comuna
- `Ciudad` o `ciudad` - Ciudad
- `Teléfono` o `telefono` o `Telefono` - Número de contacto
- `Email` o `email` - Correo electrónico

**Validaciones:**
- ✅ RUT chileno válido (módulo 11)
- ✅ Email con formato válido
- ✅ Teléfono chileno válido
- ✅ Campos requeridos no vacíos

**Comportamiento con Duplicados:**
- Si el RUT ya existe → **Actualiza** los datos del cliente
- Si el RUT es nuevo → **Inserta** un nuevo cliente

### 2. Importar Productos desde Excel

**Acceso:**
- Menú: `Archivo → Importar → Importar Productos desde Excel`
- Atajo: `Ctrl+Shift+O` (Windows/Linux) o `Cmd+Shift+O` (Mac)

**Columnas Requeridas:**
- `Nombre` o `nombre` - Nombre del producto (requerido)
- `Precio` o `precio` - Precio sin IVA (requerido)

**Columnas Opcionales:**
- `Código` o `codigo` o `Codigo` - Código SKU del producto
- `Descripción` o `descripcion` o `Descripcion` - Descripción detallada
- `Stock` o `stock` - Cantidad en inventario (default: 0)

**Validaciones:**
- ✅ Precio debe ser número >= 0
- ✅ Stock debe ser número entero >= 0
- ✅ Nombre no vacío

**Comportamiento con Duplicados:**
- Si tiene código y el código existe → **Actualiza** el producto
- Si no tiene código pero el nombre existe → **Actualiza** el producto
- Si es nuevo → **Inserta** un nuevo producto

### 3. Descargar Template de Clientes

**Acceso:**
- Menú: `Archivo → Importar → Descargar Template de Clientes`

**Contenido:**
- Archivo Excel con 2 filas de ejemplo
- Todas las columnas con nombres correctos
- Datos de ejemplo para guiar al usuario
- Anchos de columna pre-ajustados

### 4. Descargar Template de Productos

**Acceso:**
- Menú: `Archivo → Importar → Descargar Template de Productos`

**Contenido:**
- Archivo Excel con 2 filas de ejemplo
- Todas las columnas con nombres correctos
- Datos de ejemplo para guiar al usuario
- Anchos de columna pre-ajustados

---

## 🚀 CÓMO USAR

### Flujo Completo de Importación

#### Paso 1: Descargar Template
```
1. Menú → Archivo → Importar → Descargar Template de [Clientes/Productos]
2. El archivo se abre automáticamente
3. Guardar en ubicación deseada
```

#### Paso 2: Completar Datos
```
1. Abrir el template en Excel
2. Eliminar las filas de ejemplo (opcional)
3. Agregar tus datos fila por fila
4. Respetar los nombres de las columnas
5. Guardar el archivo
```

#### Paso 3: Importar
```
1. Menú → Archivo → Importar → Importar [Clientes/Productos] desde Excel
2. Seleccionar tu archivo
3. Esperar procesamiento
4. Revisar reporte de resultados
```

#### Paso 4: Verificar
```
1. Ir a la página de Clientes o Productos
2. Verificar que los datos se importaron correctamente
3. Revisar los registros actualizados
```

---

## 📊 FORMATO DE ARCHIVOS

### Ejemplo de Template de Clientes

| RUT | Razón Social | Giro | Dirección | Región | Comuna | Ciudad | Teléfono | Email |
|-----|--------------|------|-----------|--------|--------|--------|----------|-------|
| 12.345.678-9 | Empresa Ejemplo S.A. | Comercio al por menor | Av. Principal 123 | Región Metropolitana | Santiago | Santiago | +56912345678 | contacto@ejemplo.cl |
| 98.765.432-1 | Comercial Demo Ltda. | Servicios profesionales | Calle Secundaria 456 | Valparaíso | Viña del Mar | Viña del Mar | +56987654321 | info@demo.cl |

### Ejemplo de Template de Productos

| Código | Nombre | Descripción | Precio | Stock |
|--------|--------|-------------|--------|-------|
| PROD001 | Producto Ejemplo 1 | Descripción detallada del producto | 10000 | 50 |
| PROD002 | Producto Ejemplo 2 | Otro producto de ejemplo | 25000 | 100 |

---

## ⚙️ VALIDACIONES IMPLEMENTADAS

### Validación de RUT Chileno

```javascript
Formato aceptado: XX.XXX.XXX-X o XXXXXXXXX
Algoritmo: Módulo 11
Dígito verificador: 0-9 o K

Ejemplos válidos:
- 12.345.678-9
- 12345678-9
- 123456789

Ejemplos inválidos:
- 12.345.678-0 (dígito verificador incorrecto)
- ABC.DEF.GHI-J (no numérico)
- 123 (muy corto)
```

### Validación de Email

```javascript
Formato: usuario@dominio.extension

Ejemplos válidos:
- contacto@empresa.cl
- info@ejemplo.com
- ventas@tienda.com.ar

Ejemplos inválidos:
- contacto@empresa (sin extensión)
- @empresa.cl (sin usuario)
- contacto empresa.cl (sin @)
```

### Validación de Teléfono Chileno

```javascript
Formato: +56XXXXXXXXX o XXXXXXXXX
Longitud: 8-9 dígitos

Ejemplos válidos:
- +56912345678
- 912345678
- +56221234567
- 221234567

Ejemplos inválidos:
- 12345 (muy corto)
- +54912345678 (código de país incorrecto)
```

---

## 📝 REPORTES DE IMPORTACIÓN

### Reporte Exitoso

```
✅ Importación completada

📊 Total procesados: 50
✅ Nuevos: 30
🔄 Actualizados: 20
```

### Reporte con Errores

```
✅ Importación completada

📊 Total procesados: 50
✅ Nuevos: 25
🔄 Actualizados: 15

⚠️ Errores de validación: 10

Primeros errores:

Línea 5: Empresa XYZ S.A.
  - RUT inválido

Línea 12: Comercial ABC Ltda.
  - Email inválido

Línea 18: N/A
  - Razón Social es requerida
```

---

## 🔧 CONFIGURACIÓN AVANZADA

### Opciones de Importación

#### Para Clientes:
```javascript
{
  updateExisting: true  // Actualizar si ya existe (por RUT)
}
```

#### Para Productos:
```javascript
{
  updateExisting: true,  // Actualizar si ya existe
  checkByName: true      // Buscar duplicados por nombre si no tiene código
}
```

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Problema: "El archivo está vacío o no tiene el formato correcto"

**Causas:**
- El archivo no tiene datos
- La primera fila no tiene encabezados
- El archivo está corrupto

**Solución:**
1. Verificar que el archivo tiene datos
2. Asegurar que la primera fila tiene los nombres de columnas
3. Intentar abrir el archivo en Excel para verificar que no está corrupto

### Problema: "RUT inválido" en múltiples filas

**Causas:**
- RUT mal formateado
- Dígito verificador incorrecto
- Columna RUT vacía

**Solución:**
1. Verificar que los RUTs tengan el formato correcto
2. Usar una calculadora de RUT para verificar dígitos verificadores
3. Asegurar que la columna RUT no esté vacía

### Problema: "Razón Social es requerida"

**Causas:**
- Columna vacía
- Nombre de columna incorrecto

**Solución:**
1. Verificar que la columna tiene datos
2. Verificar que la columna se llama exactamente "Razón Social" o "razon_social"

### Problema: Los datos no se actualizan

**Causas:**
- La opción `updateExisting` está en false
- Los RUTs/códigos no coinciden exactamente

**Solución:**
1. La importación por defecto actualiza registros existentes
2. Verificar que los RUTs o códigos sean exactamente iguales

---

## 💡 MEJORES PRÁCTICAS

### Antes de Importar

1. **Descargar el template** - Siempre usa el template oficial
2. **Validar datos** - Revisa que los RUTs sean correctos
3. **Backup** - Haz un backup de tu base de datos
4. **Prueba pequeña** - Importa primero 5-10 registros de prueba

### Durante la Importación

1. **No cerrar el programa** - Espera a que termine
2. **Revisar mensajes** - Lee los mensajes de error
3. **Tomar nota** - Anota las líneas con errores

### Después de Importar

1. **Verificar datos** - Revisa que los datos se importaron correctamente
2. **Corregir errores** - Importa nuevamente las filas con errores corregidas
3. **Actualizar** - Si es necesario, actualiza manualmente algunos registros

---

## 📈 LÍMITES Y RENDIMIENTO

### Límites Recomendados

- **Clientes:** Hasta 10,000 registros por archivo
- **Productos:** Hasta 5,000 registros por archivo

### Rendimiento Esperado

- **100 registros:** ~1-2 segundos
- **1,000 registros:** ~10-15 segundos
- **10,000 registros:** ~1-2 minutos

### Optimización

Para archivos muy grandes (>5,000 registros):
1. Dividir en archivos más pequeños
2. Importar en lotes
3. Hacer durante horarios de baja actividad

---

## 🔐 SEGURIDAD

### Validación de Datos

- ✅ Todos los datos se validan antes de insertar
- ✅ Transacciones SQL para integridad
- ✅ Prepared statements para prevenir SQL injection
- ✅ Sanitización de inputs

### Privacidad

- ✅ Los datos solo se guardan localmente
- ✅ No se envían a servidores externos
- ✅ El archivo Excel no se modifica

---

## 📞 SOPORTE

### Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| RUT inválido | Dígito verificador incorrecto | Verificar con calculadora de RUT |
| Email inválido | Formato incorrecto | Usar formato usuario@dominio.ext |
| Precio inválido | No es un número | Usar solo números, sin símbolos |
| Columna no encontrada | Nombre incorrecto | Usar nombres del template |

### Contacto

**Desarrollador:** Demian Maturana  
**Email:** dmaturana22@alumnos.utalca.cl

---

## 📚 ARCHIVOS RELACIONADOS

### Backend:
- `src/main/services/importExcel.js` - Servicio de importación
- `src/main/ipc/import.js` - Handlers IPC

### Frontend:
- `src/renderer/src/App.jsx` - Manejo de eventos del menú

### Menú:
- `src/main/menu.js` - Configuración del menú

---

**Versión:** 1.2.0  
**Última actualización:** 21 de Diciembre, 2025
