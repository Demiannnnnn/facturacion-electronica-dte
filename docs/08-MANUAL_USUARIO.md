# 08 - MANUAL DE USUARIO
## Sistema de Facturación Electrónica B2B

**Versión:** 1.0.0  
**Última actualización:** 17 de Diciembre, 2025  
**Audiencia:** Usuarios finales (PyMEs)

---

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Requisitos del Sistema](#requisitos-del-sistema)
3. [Instalación](#instalación)
4. [Primer Uso](#primer-uso)
5. [Gestión de Clientes](#gestión-de-clientes)
6. [Gestión de Productos](#gestión-de-productos)
7. [Gestión de Vendedores](#gestión-de-vendedores)
8. [Emisión de Facturas](#emisión-de-facturas)
9. [Dashboard](#dashboard)
10. [Reportes](#reportes)
11. [Configuración](#configuración)
12. [Exportación de Datos](#exportación-de-datos)
13. [Backup y Restauración](#backup-y-restauración)
14. [Preguntas Frecuentes](#preguntas-frecuentes)
15. [Solución de Problemas](#solución-de-problemas)

---

## 🎯 Introducción

### ¿Qué es este sistema?

El **Sistema de Facturación Electrónica B2B** es una aplicación de escritorio diseñada para PyMEs chilenas que necesitan emitir facturas electrónicas cumpliendo con las normativas del SII (Servicio de Impuestos Internos).

### Características Principales

- ✅ **Funciona sin internet** - Todos tus datos están en tu computador
- ✅ **Facturas electrónicas válidas** - Genera XML según formato SII
- ✅ **PDF profesionales** - Imprime o envía facturas por email
- ✅ **Control de inventario** - Actualización automática de stock
- ✅ **Reportes tributarios** - Para declaración mensual de impuestos
- ✅ **Backup automático** - Tus datos siempre protegidos

### ¿Para quién es?

- Pequeñas y medianas empresas (PyMEs)
- Comercios que emiten 10-500 facturas al mes
- Negocios en zonas con internet limitado
- Empresas que buscan simplicidad y bajo costo

---

## 💻 Requisitos del Sistema

### Mínimos

- **Sistema Operativo:** Windows 10 o superior / macOS 10.13+ / Linux (Ubuntu 18.04+)
- **Procesador:** Intel Core i3 o equivalente
- **RAM:** 4 GB
- **Disco Duro:** 500 MB de espacio libre
- **Pantalla:** 1280x720 píxeles

### Recomendados

- **Sistema Operativo:** Windows 11 / macOS 12+ / Linux (Ubuntu 22.04+)
- **Procesador:** Intel Core i5 o superior
- **RAM:** 8 GB o más
- **Disco Duro:** 1 GB de espacio libre (para PDFs y backups)
- **Pantalla:** 1920x1080 píxeles

---

## 📥 Instalación

### Windows

1. **Descargar el instalador**
   - Descarga `Sistema-Facturacion-Setup-1.0.0.exe`
   - Ubicación: [Sitio web del producto o email recibido]

2. **Ejecutar el instalador**
   - Doble clic en el archivo descargado
   - Si Windows SmartScreen aparece, clic en "Más información" → "Ejecutar de todas formas"

3. **Seguir el asistente**
   - Aceptar términos y condiciones
   - Elegir carpeta de instalación (recomendado: dejar por defecto)
   - Crear acceso directo en escritorio ✓

4. **Finalizar**
   - Clic en "Finalizar"
   - La aplicación se abrirá automáticamente

### macOS

1. **Descargar el instalador**
   - Descarga `Sistema-Facturacion-1.0.0.dmg`

2. **Instalar**
   - Abrir el archivo .dmg
   - Arrastrar el ícono a la carpeta "Aplicaciones"

3. **Primera ejecución**
   - Si macOS bloquea la app: Sistema → Seguridad → "Abrir de todas formas"

### Linux

1. **Descargar el paquete**
   - Descarga `sistema-facturacion_1.0.0_amd64.deb` (Debian/Ubuntu)
   - O `sistema-facturacion-1.0.0.rpm` (Fedora/RedHat)

2. **Instalar**
   ```bash
   # Debian/Ubuntu
   sudo dpkg -i sistema-facturacion_1.0.0_amd64.deb
   
   # Fedora/RedHat
   sudo rpm -i sistema-facturacion-1.0.0.rpm
   ```

3. **Ejecutar**
   - Buscar "Sistema Facturación" en el menú de aplicaciones

---

## 🚀 Primer Uso

### 1. Registro de Usuario

Al abrir la aplicación por primera vez, verás la pantalla de **Registro**:

1. **Nombre de usuario**
   - Entre 3 y 50 caracteres
   - Ejemplo: `admin`, `contador`, `tu_nombre`

2. **Contraseña**
   - Mínimo 8 caracteres
   - Recomendado: Combinar letras, números y símbolos
   - Ejemplo: `MiEmpresa2025!`

3. **Confirmar contraseña**
   - Escribir la misma contraseña

4. **Clic en "Registrar"**

> ⚠️ **IMPORTANTE:** Guarda tu contraseña en un lugar seguro. No hay forma de recuperarla si la olvidas.

### 2. Configurar Datos de tu Empresa

Después del registro, ve a **Configuración → Datos del Emisor**:

#### Datos Obligatorios

- **RUT:** Tu RUT de empresa (formato: 76.123.456-7)
- **Razón Social:** Nombre legal de tu empresa
- **Giro:** Actividad económica (ej: "Venta al por menor")
- **Dirección:** Dirección completa
- **Comuna:** Seleccionar de la lista
- **Ciudad:** Nombre de la ciudad
- **Región:** Seleccionar de la lista

#### Datos Opcionales

- **Nombre Fantasía:** Nombre comercial
- **Teléfono:** Formato: +56912345678
- **Email:** contacto@tuempresa.cl

#### Datos SII (Importante para facturación electrónica)

- **Número de Resolución:** Proporcionado por el SII
- **Fecha de Resolución:** Fecha de autorización

> 💡 **TIP:** Si aún no tienes resolución SII, puedes dejar estos campos vacíos y trabajar en modo local. Los PDFs se generarán sin timbre electrónico.

### 3. Configurar Folios

Ve a **Configuración → Folios**:

- **Folio Inicial:** Número desde donde empezarán tus facturas (ej: 1)
- **Folio Final:** Número máximo autorizado por SII (ej: 10000)

El sistema incrementará automáticamente el folio con cada factura.

---

## 👥 Gestión de Clientes

### Crear un Cliente

1. **Ir a Clientes**
   - Clic en "Clientes" en el menú lateral

2. **Nuevo Cliente**
   - Clic en botón "➕ Nuevo Cliente"

3. **Completar Formulario**

   **Identificación:**
   - **Tipo de Documento:** RUT Empresa / RUT Persona / Pasaporte
   - **RUT:** Formato XX.XXX.XXX-X (con puntos y guión)
   - **Razón Social:** Nombre legal del cliente
   - **Nombre Fantasía:** (Opcional) Nombre comercial
   - **Giro:** Actividad del cliente

   **Ubicación:**
   - **Dirección:** Calle y número
   - **Región:** Seleccionar de lista
   - **Comuna:** Seleccionar de lista
   - **Ciudad:** Nombre de ciudad

   **Contacto:**
   - **Teléfono:** +56912345678
   - **Email:** cliente@email.com

   **Contacto Personal:** (Opcional)
   - Nombre, cargo, email y teléfono de persona de contacto

   **Condiciones Comerciales:**
   - **Condición de Pago:** Contado / Crédito
   - **Días de Crédito:** Si es crédito (ej: 30 días)
   - **Límite de Crédito:** Monto máximo en CLP
   - **Vendedor Asignado:** Seleccionar de lista
   - **Lista de Precios:** Normal / Mayorista / Distribuidor / Especial

4. **Guardar**
   - Clic en "Guardar Cliente"

### Buscar Clientes

- **Barra de búsqueda:** Escribe RUT, razón social o email
- **Resultados instantáneos:** La tabla se filtra automáticamente

### Editar Cliente

1. Clic en la fila del cliente en la tabla
2. Modificar los campos necesarios
3. Clic en "Guardar Cambios"

### Eliminar Cliente

1. Clic en botón "🗑️ Eliminar" en la fila del cliente
2. Confirmar eliminación

> ⚠️ **NOTA:** No puedes eliminar un cliente que tiene facturas asociadas.

---

## 📦 Gestión de Productos

### Crear un Producto

1. **Ir a Productos**
   - Clic en "Productos" en el menú lateral

2. **Nuevo Producto**
   - Clic en "➕ Nuevo Producto"

3. **Completar Formulario**
   - **Código:** (Opcional) SKU o código interno (ej: MON-LED-24)
   - **Nombre:** Nombre del producto (ej: "Monitor LED 24 pulgadas")
   - **Descripción:** (Opcional) Detalles adicionales
   - **Precio:** Precio unitario SIN IVA en CLP (ej: 150000)
   - **Stock:** Unidades disponibles (ej: 25)

4. **Guardar**
   - Clic en "Guardar Producto"

### Buscar Productos

- Escribe en la barra de búsqueda por código o nombre

### Editar Producto

1. Clic en el producto
2. Modificar campos
3. Guardar cambios

### Actualizar Stock

El stock se actualiza automáticamente al emitir facturas, pero puedes modificarlo manualmente:

1. Editar producto
2. Cambiar valor de "Stock"
3. Guardar

### Eliminar Producto

> ⚠️ No puedes eliminar productos que están en facturas emitidas.

---

## 💼 Gestión de Vendedores

### Crear Vendedor

1. **Ir a Vendedores**
2. **Nuevo Vendedor**
3. **Completar:**
   - **Nombre y Apellido**
   - **Email y Teléfono**
   - **Comisión:** Porcentaje (ej: 5.5 = 5.5%)
   - **Estado:** Activo / Inactivo

4. **Guardar**

### Asignar Vendedor a Cliente

Al crear o editar un cliente, selecciona el vendedor en "Vendedor Asignado".

### Reportes de Vendedores

Ve a **Reportes → Ventas por Vendedor** para ver el desempeño.

---

## 📄 Emisión de Facturas

### Crear una Factura

1. **Ir a Facturas**
   - Clic en "Facturas" en el menú lateral

2. **Nueva Factura**
   - Clic en "➕ Nueva Factura"

3. **Seleccionar Cliente**
   - Busca y selecciona el cliente
   - Los datos se cargarán automáticamente

4. **Agregar Productos**
   
   Para cada producto:
   - **Seleccionar Producto:** Busca en el selector
   - **Cantidad:** Unidades a facturar
   - **Precio Unitario:** Se carga automático (puedes modificar)
   - **Descuento:** Porcentaje de descuento (0-100)
   - **Clic en "Agregar"**

   Repite para todos los productos.

5. **Revisar Totales**
   - **Subtotal:** Suma de items
   - **IVA (19%):** Calculado automáticamente
   - **Total:** Subtotal + IVA

6. **Datos Adicionales**
   - **Forma de Pago:** Contado / Crédito
   - **Fecha de Vencimiento:** Si es crédito
   - **Orden de Compra:** (Opcional) Número de OC del cliente
   - **Vendedor:** Seleccionar vendedor
   - **Observaciones:** (Opcional) Notas adicionales

7. **Emitir Factura**
   - Clic en "Emitir Factura"
   - El sistema:
     - Asigna folio automático
     - Genera XML DTE
     - Genera PDF
     - Descuenta stock de productos
     - Guarda en base de datos

### Ver PDF de Factura

1. En la lista de facturas, clic en "📄 Ver PDF"
2. El PDF se abre con el visor del sistema
3. Puedes imprimirlo o guardarlo

### Estados de Factura

- **Pendiente:** Sin pagar (amarillo)
- **Parcial:** Pago parcial registrado (azul)
- **Pagada:** Totalmente pagada (verde)
- **Vencida:** Fecha de vencimiento pasada (rojo)
- **Anulada:** Factura anulada (gris)

### Anular Factura

> ⚠️ **IMPORTANTE:** Esta función está en desarrollo. Por ahora, cambia el estado manualmente.

---

## 📊 Dashboard

El Dashboard es la pantalla principal que muestra un resumen de tu negocio.

### Tarjetas de Estadísticas

1. **Total Ventas**
   - Suma de todas las facturas emitidas
   - Formato: $XXX.XXX.XXX

2. **Ventas Hoy**
   - Facturas emitidas hoy
   - Se actualiza en tiempo real

3. **Facturas Pendientes**
   - Cantidad de facturas sin pagar

4. **Stock Total**
   - Suma de unidades en inventario

### Gráficos

1. **Ventas Últimos 7 Días**
   - Gráfico de línea
   - Muestra tendencia de ventas

2. **Top 5 Productos**
   - Gráfico de barras
   - Productos más vendidos

3. **Estado de Facturas**
   - Gráfico circular (doughnut)
   - Distribución: Pendientes / Pagadas / Vencidas

### Facturas Recientes

- Últimas 5 facturas emitidas
- Clic en una fila para ver detalles

---

## 📈 Reportes

### Tipos de Reportes

#### 1. Reporte de Ventas

**Cómo generar:**
1. Ir a **Reportes**
2. Seleccionar "Ventas por Período"
3. Elegir período:
   - Hoy
   - Semana
   - Mes
   - Trimestre
   - Año
   - Personalizado (seleccionar fechas)
4. Clic en "Generar Reporte"

**Información incluida:**
- Total facturado
- Cantidad de facturas
- Promedio de venta
- Subtotal e IVA

#### 2. Reporte de Facturas Emitidas

- Lista completa de facturas del período
- Filtros por estado
- Detalle: Folio, Cliente, Fecha, Totales

#### 3. Reporte de Clientes

**Información:**
- Total de clientes
- Top 10 clientes por compras
- Clientes sin compras
- Distribución por región

#### 4. Reporte de Productos

- Inventario actual
- Productos más vendidos
- Valorización de inventario

#### 5. Reporte de Pagos y Cobranzas

**Muy útil para control de caja:**
- Total cobrado
- Total por cobrar
- Facturas vencidas
- Facturas por vencer (7 días, 15 días)
- Top deudores
- Proyección de cobros (90 días)

#### 6. Resumen Tributario

**Para declaración mensual SII:**
1. Seleccionar mes y año
2. Clic en "Generar"

**Información para Formulario 29:**
- Código 100: Ventas Netas
- Código 105: IVA Débito Fiscal
- Código 110: Ventas Exentas
- Detalle diario de ventas
- Resumen anual

---

## ⚙️ Configuración

### Datos del Emisor

Ya cubierto en [Primer Uso](#primer-uso).

### Cambiar Contraseña

1. Ir a **Configuración → Cambiar Contraseña**
2. Ingresar:
   - Contraseña actual
   - Nueva contraseña (mínimo 8 caracteres)
   - Confirmar nueva contraseña
3. Clic en "Cambiar Contraseña"

### Configurar Folios

- Modificar rango de folios autorizados por SII
- El folio actual se incrementa automáticamente

---

## 💾 Exportación de Datos

### Exportar a Excel

Puedes exportar tus datos a archivos Excel (.xlsx) para análisis externo.

#### Exportar Clientes

**Método 1:** Atajo de teclado
- Presiona `Ctrl + Shift + C`

**Método 2:** Menú
1. Menú "Archivo" → "Exportar" → "Exportar Clientes"
2. Seleccionar ubicación
3. El archivo se abre automáticamente

**Columnas incluidas:**
- RUT, Razón Social, Giro, Dirección, Región, Comuna, Teléfono, Email

#### Exportar Productos

- Atajo: `Ctrl + Shift + P`
- Menú: Archivo → Exportar → Exportar Productos

**Columnas:**
- Código, Nombre, Descripción, Precio, Stock

#### Exportar Facturas

- Atajo: `Ctrl + Shift + F`
- Menú: Archivo → Exportar → Exportar Facturas

**Columnas:**
- Folio, Cliente, RUT Cliente, Fecha, Vencimiento, Subtotal, IVA, Total, Estado

---

## 🔄 Backup y Restauración

### Backup Automático

El sistema crea backups automáticos:

- **Cuándo:** Al cerrar la aplicación
- **Ubicación:** `%APPDATA%/sistema-facturacion/backups/`
  - Windows: `C:\Users\TuUsuario\AppData\Roaming\sistema-facturacion\backups\`
  - macOS: `~/Library/Application Support/sistema-facturacion/backups/`
  - Linux: `~/.config/sistema-facturacion/backups/`
- **Nombre:** `backup_YYYY-MM-DD_HH-MM-SS.db`
- **Retención:** Últimos 30 backups (los antiguos se eliminan automáticamente)

### Backup Manual

> 📝 **NOTA:** Esta función está disponible pero no tiene botón en la UI actual. Se puede invocar desde el menú (en desarrollo).

### Restaurar desde Backup

**En caso de pérdida de datos:**

1. Cerrar la aplicación
2. Ir a la carpeta de backups
3. Copiar el archivo de backup deseado
4. Reemplazar el archivo `facturacion.db` en:
   - Windows: `C:\Users\TuUsuario\AppData\Roaming\sistema-facturacion\`
   - macOS: `~/Library/Application Support/sistema-facturacion/`
   - Linux: `~/.config/sistema-facturacion/`
5. Abrir la aplicación

> ⚠️ **IMPORTANTE:** Esto sobrescribirá todos los datos actuales.

### Exportar Base de Datos

Para hacer una copia de seguridad manual:

1. Cerrar la aplicación
2. Copiar el archivo `facturacion.db` a un USB o nube
3. Guardar en lugar seguro

---

## ❓ Preguntas Frecuentes

### General

**P: ¿Necesito internet para usar el sistema?**  
R: No. El sistema funciona 100% offline. Solo necesitarás internet cuando implementemos el envío automático al SII (próxima versión).

**P: ¿Mis datos están seguros?**  
R: Sí. Todos tus datos están en tu computador, no en la nube. Además, hay backups automáticos.

**P: ¿Puedo usar el sistema en varios computadores?**  
R: Sí, pero necesitarás copiar la base de datos entre computadores manualmente. En futuras versiones habrá sincronización.

**P: ¿Cuántas facturas puedo emitir?**  
R: Ilimitadas. No hay restricción de cantidad.

### Clientes

**P: ¿Cómo valido un RUT?**  
R: El sistema valida automáticamente usando el módulo 11. Si el RUT es inválido, mostrará un error.

**P: ¿Puedo tener clientes extranjeros?**  
R: Sí. Selecciona "RUT Extranjero" o "Pasaporte" como tipo de documento.

### Facturas

**P: ¿Puedo modificar una factura emitida?**  
R: No. Las facturas son documentos tributarios y no se pueden modificar. Debes emitir una Nota de Crédito (función en desarrollo).

**P: ¿Cómo anulo una factura?**  
R: Actualmente puedes cambiar el estado a "Anulada" manualmente. En la próxima versión habrá Notas de Crédito oficiales.

**P: ¿El IVA se calcula automáticamente?**  
R: Sí, siempre al 19% sobre el subtotal.

**P: ¿Puedo facturar productos exentos de IVA?**  
R: Esta función está en desarrollo para la próxima versión.

### Reportes

**P: ¿Los reportes se pueden imprimir?**  
R: Actualmente puedes usar la función de impresión del navegador (Ctrl+P). La exportación a PDF está en desarrollo.

**P: ¿Cómo uso el Resumen Tributario?**  
R: Genera el reporte del mes que necesitas declarar. Los códigos 100, 105 y 110 corresponden a las líneas del Formulario 29 del SII.

---

## 🔧 Solución de Problemas

### La aplicación no abre

**Solución:**
1. Verificar que cumples los requisitos mínimos
2. Reiniciar el computador
3. Reinstalar la aplicación
4. Contactar soporte

### Error al crear factura

**Posibles causas:**
- Stock insuficiente → Verifica el stock del producto
- Cliente no seleccionado → Selecciona un cliente
- No hay productos agregados → Agrega al menos un producto

### No puedo eliminar un cliente

**Causa:** El cliente tiene facturas asociadas.  
**Solución:** No se puede eliminar. Puedes dejarlo inactivo (función en desarrollo).

### Olvidé mi contraseña

**Solución:**
1. Si tienes acceso al computador, puedes eliminar la base de datos y empezar de nuevo (perderás todos los datos)
2. Si tienes un backup, restaura desde antes de cambiar la contraseña
3. Contacta soporte técnico

### Los backups ocupan mucho espacio

**Solución:**
- El sistema mantiene solo los últimos 30 backups
- Puedes eliminar manualmente backups antiguos de la carpeta
- Ubicación: `%APPDATA%/sistema-facturacion/backups/`

### Error al exportar a Excel

**Solución:**
1. Verifica que tienes permisos de escritura en la carpeta destino
2. Cierra cualquier archivo Excel abierto con el mismo nombre
3. Intenta guardar en otra ubicación

---

## 📞 Soporte

### Contacto

**Desarrollador:** Demian Maturana  
**Email:** dmaturana22@alumnos.utalca.cl

### Horario de Atención

Lunes a Viernes: 9:00 - 18:00 hrs (Chile)

### Antes de Contactar

Por favor, ten a mano:
- Versión del sistema (ver en Ayuda → Acerca de)
- Sistema operativo
- Descripción detallada del problema
- Capturas de pantalla si es posible

---

## 📚 Recursos Adicionales

### Documentación Técnica

Si eres desarrollador o quieres entender más a fondo el sistema:
- [Manual Técnico](./07-MANUAL_TECNICO.md)
- [Arquitectura del Sistema](./02-ARQUITECTURA.md)
- [Base de Datos](./03-BASE_DE_DATOS.md)

### Videos Tutoriales

> 🎥 En desarrollo. Próximamente disponibles en nuestro sitio web.

---

## 📄 Términos y Condiciones

Este software es proporcionado "tal cual" sin garantías de ningún tipo. El uso es bajo tu propia responsabilidad.

**Licencia:** UNLICENSED - Uso privado

---

**Última actualización:** 17 de Diciembre, 2025  
**Versión del manual:** 1.0
