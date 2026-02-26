# 05 - FLUJOS DE PROCESOS
## Sistema de Facturación Electrónica B2B

**Versión:** 1.0.0  
**Última actualización:** 17 de Diciembre, 2025

---

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Flujo de Autenticación](#flujo-de-autenticación)
3. [Flujo de Creación de Cliente](#flujo-de-creación-de-cliente)
4. [Flujo de Creación de Producto](#flujo-de-creación-de-producto)
5. [Flujo de Emisión de Factura](#flujo-de-emisión-de-factura)
6. [Flujo de Registro de Pago](#flujo-de-registro-de-pago)
7. [Flujo de Generación de Reportes](#flujo-de-generación-de-reportes)
8. [Flujo de Backup](#flujo-de-backup)
9. [Flujo de Exportación](#flujo-de-exportación)
10. [Flujo de Integración SII](#flujo-de-integración-sii)

---

## 🎯 Introducción

Este documento describe los flujos de procesos clave del sistema mediante diagramas Mermaid. Cada flujo muestra la secuencia de acciones desde la interacción del usuario hasta la persistencia de datos.

### Convenciones

- **Rectángulos:** Procesos/Acciones
- **Rombos:** Decisiones
- **Cilindros:** Base de datos
- **Flechas:** Flujo de control

---

## 🔐 Flujo de Autenticación

### Primera Ejecución (Registro)

```mermaid
flowchart TD
    A[Usuario abre aplicación] --> B{¿Primera ejecución?}
    B -->|Sí| C[Mostrar pantalla de Registro]
    B -->|No| D[Mostrar pantalla de Login]
    
    C --> E[Usuario ingresa username y password]
    E --> F{¿Validación OK?}
    F -->|No| G[Mostrar error]
    G --> E
    F -->|Sí| H[Hash password con bcrypt]
    H --> I[(Guardar en DB users)]
    I --> J[Crear sesión en memoria]
    J --> K[Redirigir a Dashboard]
```

### Login

```mermaid
flowchart TD
    A[Usuario en pantalla Login] --> B[Ingresar username y password]
    B --> C[Enviar a Main Process]
    C --> D[(Buscar user en DB)]
    D --> E{¿Usuario existe?}
    E -->|No| F[Error: Usuario no encontrado]
    F --> B
    E -->|Sí| G[Comparar hash con bcrypt]
    G --> H{¿Password correcto?}
    H -->|No| I[Error: Contraseña incorrecta]
    I --> B
    H -->|Sí| J[Crear sesión en memoria]
    J --> K[Retornar user data a Renderer]
    K --> L[Actualizar AuthContext]
    L --> M[Redirigir a Dashboard]
```

### Logout

```mermaid
flowchart TD
    A[Usuario clic en Logout] --> B[Llamar auth:logout]
    B --> C[Limpiar sesión en Main Process]
    C --> D[Retornar success]
    D --> E[Limpiar AuthContext]
    E --> F[Redirigir a Login]
```

---

## 👥 Flujo de Creación de Cliente

```mermaid
flowchart TD
    A[Usuario en página Clientes] --> B[Clic en Nuevo Cliente]
    B --> C[Mostrar formulario]
    C --> D[Usuario completa datos]
    D --> E[Clic en Guardar]
    E --> F{¿Validación frontend OK?}
    F -->|No| G[Mostrar errores]
    G --> D
    F -->|Sí| H[Enviar a Main Process]
    H --> I{¿RUT válido módulo 11?}
    I -->|No| J[Error: RUT inválido]
    J --> G
    I -->|Sí| K{¿RUT único?}
    K -->|No| L[Error: RUT duplicado]
    L --> G
    K -->|Sí| M[(INSERT INTO clientes)]
    M --> N[Retornar cliente creado]
    N --> O[Actualizar lista en UI]
    O --> P[Mostrar mensaje de éxito]
    P --> Q[Cerrar formulario]
```

---

## 📦 Flujo de Creación de Producto

```mermaid
flowchart TD
    A[Usuario en página Productos] --> B[Clic en Nuevo Producto]
    B --> C[Mostrar formulario]
    C --> D[Usuario completa datos]
    D --> E[Clic en Guardar]
    E --> F{¿Validación OK?}
    F -->|No| G[Mostrar errores]
    G --> D
    F -->|Sí| H[Enviar a Main Process]
    H --> I{¿Código único?}
    I -->|No| J[Error: Código duplicado]
    J --> G
    I -->|Sí| K{¿Precio > 0?}
    K -->|No| L[Error: Precio inválido]
    L --> G
    K -->|Sí| M[(INSERT INTO productos)]
    M --> N[Retornar producto creado]
    N --> O[Actualizar lista en UI]
    O --> P[Mostrar mensaje de éxito]
```

---

## 📄 Flujo de Emisión de Factura

```mermaid
flowchart TD
    A[Usuario en página Facturas] --> B[Clic en Nueva Factura]
    B --> C[Mostrar formulario]
    C --> D[Seleccionar cliente]
    D --> E[Agregar productos]
    E --> F{¿Más productos?}
    F -->|Sí| E
    F -->|No| G[Revisar totales]
    G --> H[Completar datos adicionales]
    H --> I[Clic en Emitir Factura]
    I --> J{¿Validación OK?}
    J -->|No| K[Mostrar errores]
    K --> H
    J -->|Sí| L[Enviar a Main Process]
    L --> M[Iniciar transacción DB]
    M --> N[(Obtener próximo folio)]
    N --> O[(Incrementar folio)]
    O --> P[(INSERT factura)]
    P --> Q[(INSERT factura_items)]
    Q --> R[(UPDATE stock productos)]
    R --> S{¿Todo OK?}
    S -->|No| T[ROLLBACK]
    T --> U[Error: Transacción fallida]
    S -->|Sí| V[COMMIT]
    V --> W[Generar XML DTE]
    W --> X[Generar PDF]
    X --> Y[(Guardar PDF en filesystem)]
    Y --> Z[Retornar factura creada]
    Z --> AA[Actualizar UI]
    AA --> AB[Mostrar PDF generado]
```

### Detalle: Transacción de Factura

```mermaid
sequenceDiagram
    participant U as Usuario
    participant R as React
    participant M as Main Process
    participant DB as SQLite
    participant FS as File System
    
    U->>R: Clic "Emitir Factura"
    R->>M: facturas:create(data)
    M->>DB: BEGIN TRANSACTION
    M->>DB: SELECT folio FROM folios
    DB-->>M: folio: 1001
    M->>DB: UPDATE folios SET actual = 1002
    M->>DB: INSERT INTO facturas
    M->>DB: INSERT INTO factura_items (x3)
    M->>DB: UPDATE productos stock (x3)
    M->>DB: COMMIT
    M->>M: Generar XML DTE
    M->>M: Generar PDF
    M->>FS: Guardar PDF
    M-->>R: {success: true, data: {...}}
    R->>U: Mostrar factura creada
```

---

## 💰 Flujo de Registro de Pago

```mermaid
flowchart TD
    A[Usuario selecciona factura] --> B[Ver detalle de factura]
    B --> C[Clic en Registrar Pago]
    C --> D[Mostrar formulario de pago]
    D --> E[Ingresar monto y forma de pago]
    E --> F[Clic en Guardar]
    F --> G{¿Monto válido?}
    G -->|No| H[Error: Monto inválido]
    H --> E
    G -->|Sí| I[Enviar a Main Process]
    I --> J[Iniciar transacción]
    J --> K[(INSERT INTO pagos)]
    K --> L[(SELECT SUM pagos WHERE factura_id)]
    L --> M{¿total_pagado >= total?}
    M -->|Sí| N[(UPDATE factura estado = pagada)]
    M -->|No| O{¿total_pagado > 0?}
    O -->|Sí| P[(UPDATE factura estado = parcial)]
    O -->|No| Q[(UPDATE factura estado = pendiente)]
    N --> R[COMMIT]
    P --> R
    Q --> R
    R --> S[Retornar pago creado]
    S --> T[Actualizar UI]
    T --> U[Mostrar nuevo estado]
```

---

## 📊 Flujo de Generación de Reportes

### Reporte de Ventas

```mermaid
flowchart TD
    A[Usuario en página Reportes] --> B[Seleccionar tipo: Ventas]
    B --> C[Seleccionar período]
    C --> D[Clic en Generar]
    D --> E[Enviar a Main Process]
    E --> F[Calcular fechas desde/hasta]
    F --> G[(SELECT facturas WHERE fecha BETWEEN)]
    G --> H[Calcular totales]
    H --> I[Agrupar por estado]
    I --> J[Retornar datos]
    J --> K[Renderizar reporte en UI]
    K --> L[Mostrar gráficos]
```

### Reporte Tributario

```mermaid
flowchart TD
    A[Usuario selecciona mes/año] --> B[Clic en Generar]
    B --> C[Enviar a Main Process]
    C --> D[(SELECT facturas del mes)]
    D --> E[Calcular ventas netas]
    E --> F[Calcular IVA]
    F --> G[Agrupar por día]
    G --> H[Calcular totales anuales]
    H --> I[Generar datos para F29]
    I --> J[Retornar reporte]
    J --> K[Renderizar en UI]
    K --> L[Mostrar códigos SII]
```

---

## 💾 Flujo de Backup

### Backup Automático

```mermaid
flowchart TD
    A[Usuario cierra aplicación] --> B[Evento: window-all-closed]
    B --> C[Llamar createAutomaticBackup]
    C --> D[Obtener fecha/hora actual]
    D --> E[Generar nombre: backup_YYYY-MM-DD_HH-MM-SS.db]
    E --> F[(Copiar facturacion.db)]
    F --> G[Guardar en carpeta backups/]
    G --> H[Listar backups existentes]
    H --> I{¿Más de 30 backups?}
    I -->|Sí| J[Eliminar backups antiguos]
    I -->|No| K[Continuar]
    J --> K
    K --> L[Cerrar aplicación]
```

### Restauración

```mermaid
flowchart TD
    A[Usuario selecciona backup] --> B[Confirmar restauración]
    B --> C{¿Confirmado?}
    C -->|No| D[Cancelar]
    C -->|Sí| E[Cerrar base de datos actual]
    E --> F[(Copiar backup sobre facturacion.db)]
    F --> G[Mostrar mensaje: Reiniciar app]
    G --> H[Usuario reinicia]
    H --> I[App carga DB restaurada]
```

---

## 📤 Flujo de Exportación

### Exportar a Excel

```mermaid
flowchart TD
    A[Usuario presiona Ctrl+Shift+C] --> B[Abrir diálogo guardar]
    B --> C[Usuario selecciona ubicación]
    C --> D[Enviar a Main Process]
    D --> E[(SELECT * FROM clientes)]
    E --> F[Crear workbook con xlsx]
    F --> G[Agregar headers]
    G --> H[Agregar filas de datos]
    H --> I[Ajustar ancho de columnas]
    I --> J[Guardar archivo .xlsx]
    J --> K[Abrir archivo con app default]
    K --> L[Retornar success]
    L --> M[Mostrar mensaje de éxito]
```

---

## 🏛️ Flujo de Integración SII

### Envío de DTE (Futuro)

```mermaid
flowchart TD
    A[Factura creada] --> B[XML DTE generado]
    B --> C{¿Modo producción?}
    C -->|No| D[Modo PRUEBA]
    D --> E[Simular envío]
    E --> F[Retornar trackId]
    C -->|Sí| G[Firmar XML con certificado]
    G --> H[Enviar a servidor backend]
    H --> I[Backend envía a ChileAPI]
    I --> J[ChileAPI envía a SII]
    J --> K[SII procesa DTE]
    K --> L{¿Aceptado?}
    L -->|Sí| M[Estado: ACCEPTED]
    L -->|No| N[Estado: REJECTED]
    M --> O[(UPDATE factura sii_estado)]
    N --> O
    O --> P[Retornar trackId y estado]
    P --> Q[Actualizar UI]
```

### Consulta de Estado

```mermaid
flowchart TD
    A[Usuario consulta estado] --> B[Enviar trackId a backend]
    B --> C[Backend consulta ChileAPI]
    C --> D[ChileAPI consulta SII]
    D --> E[SII retorna estado]
    E --> F{¿Estado cambió?}
    F -->|Sí| G[(UPDATE factura sii_estado)]
    F -->|No| H[Mantener estado actual]
    G --> I[Retornar nuevo estado]
    H --> I
    I --> J[Actualizar UI]
```

---

## 🔄 Flujo de Actualización de Stock

```mermaid
flowchart TD
    A[Factura emitida] --> B[Obtener items de factura]
    B --> C{¿Más items?}
    C -->|Sí| D[Tomar siguiente item]
    D --> E[(UPDATE productos SET stock = stock - cantidad)]
    E --> F{¿Stock < 0?}
    F -->|Sí| G[ROLLBACK transacción]
    G --> H[Error: Stock insuficiente]
    F -->|No| C
    C -->|No| I[COMMIT transacción]
    I --> J[Stock actualizado]
```

---

## 📱 Flujo de Navegación (SPA)

```mermaid
flowchart TD
    A[Usuario autenticado] --> B[Dashboard]
    B --> C{Selecciona opción}
    C -->|Clientes| D[/clientes]
    C -->|Productos| E[/productos]
    C -->|Facturas| F[/facturas]
    C -->|Vendedores| G[/vendedores]
    C -->|Reportes| H[/reportes]
    C -->|Configuración| I[/configuracion]
    
    D --> J[Cargar datos clientes]
    E --> K[Cargar datos productos]
    F --> L[Cargar datos facturas]
    G --> M[Cargar datos vendedores]
    H --> N[Mostrar opciones reportes]
    I --> O[Mostrar configuración]
    
    J --> P[Renderizar lista]
    K --> P
    L --> P
    M --> P
    N --> P
    O --> P
```

---

## 🔍 Flujo de Búsqueda

```mermaid
flowchart TD
    A[Usuario escribe en búsqueda] --> B{¿Debounce 300ms?}
    B -->|No| A
    B -->|Sí| C[Enviar término a Main Process]
    C --> D[(SELECT WHERE LIKE %term%)]
    D --> E[Retornar resultados]
    E --> F[Actualizar lista en UI]
    F --> G{¿Resultados vacíos?}
    G -->|Sí| H[Mostrar: No se encontraron resultados]
    G -->|No| I[Mostrar resultados]
```

---

## 🎨 Flujo de Renderizado de Dashboard

```mermaid
flowchart TD
    A[Usuario navega a Dashboard] --> B[useEffect ejecuta]
    B --> C[Cargar estadísticas]
    C --> D[(SELECT COUNT, SUM de facturas)]
    D --> E[(SELECT SUM stock de productos)]
    E --> F[Calcular totales]
    F --> G[Retornar datos]
    G --> H[Actualizar estado React]
    H --> I[Renderizar tarjetas]
    I --> J[Cargar datos de gráficos]
    J --> K[(SELECT ventas últimos 7 días)]
    K --> L[(SELECT top 5 productos)]
    L --> M[(SELECT facturas por estado)]
    M --> N[Retornar datos gráficos]
    N --> O[Renderizar gráficos Chart.js]
    O --> P[Cargar facturas recientes]
    P --> Q[(SELECT últimas 5 facturas)]
    Q --> R[Renderizar tabla]
```

---

## 📝 Notas de Implementación

### Transacciones ACID

Todos los flujos que modifican múltiples tablas usan transacciones:
- Creación de factura (factura + items + stock)
- Registro de pago (pago + estado factura)

### Validación en Dos Niveles

1. **Frontend (React):** Validación básica para UX
2. **Backend (Main):** Validación completa para seguridad

### Manejo de Errores

Todos los flujos incluyen manejo de errores:
- Try-catch en handlers
- Rollback automático en transacciones
- Mensajes de error descriptivos

---

## 🔗 Referencias

- [Manual Técnico](./07-MANUAL_TECNICO.md) - Implementación de flujos
- [API IPC](./04-API_IPC.md) - Handlers utilizados
- [Arquitectura](./02-ARQUITECTURA.md) - Visión general del sistema

---

**Última actualización:** 17 de Diciembre, 2025  
**Versión:** 1.0
