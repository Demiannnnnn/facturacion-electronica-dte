# 📚 ÍNDICE MAESTRO - DOCUMENTACIÓN VENDEDORES Y USUARIOS

## 🎯 Bienvenida

Se ha generado una **documentación completa y profunda** sobre la estructura del frontend del proyecto **Sistema de Facturación e Inventario**, enfocada especialmente en los módulos de **Vendedores** y **Usuarios**.

Esta documentación answer todas tus preguntas iniciales:
1. ✅ Dónde está el componente/página "Vendedores"
2. ✅ Estructura actual de cómo se muestran los vendedores
3. ✅ Dónde están los componentes de usuarios
4. ✅ Cómo se relacionan las ventas con los usuarios
5. ✅ Estructura de rutas y componentes principales

---

## 📖 DOCUMENTOS DISPONIBLES

### 1. 📋 **MAPA_FRONTEND_VENDEDORES.md** ← COMENZAR AQUÍ
**Descripción:** Documentación técnica completa y detallada
**Tamaño:** Documento extenso (~80KB)
**Ideal para:** Entender la arquitectura, diagrama de relaciones, sistema de permisos
**Contiene:**
- Estructura general del proyecto
- Componentes principales (Vendedores y Usuarios)
- APIs IPC (comunicación main ↔ renderer)
- Sistema de permisos (AuthContext)
- Base de datos (tablas, relaciones)
- Flujos de datos completos
- Archivos clave con líneas de referencia
- TODOs y mejoras planificadas

**Navegar a:**
- Sección 1️⃣: Componente Vendedores
- Sección 2️⃣: Estructura actual de vendedores
- Sección 3️⃣: Componente Usuarios
- Sección 🔗: Relaciones Vendedores ↔ Usuarios ↔ Ventas
- Sección 5️⃣: Estructura de rutas

---

### 2. 🎨 **RESUMEN_VISUAL_VENDEDORES.md** ← RECOMENDADO PARA VISUALES
**Descripción:** Resumen con diagramas ASCII y flujos visuales
**Tamaño:** Documento visual (~40KB)
**Ideal para:** Entender flujos, arquitectura, toma de decisiones
**Contiene:**
- Diagrama de arquitectura completo
- Relaciones actuales vs. futuras entre tablas
- Casos de uso (crear vendedor, crear usuario, editar, etc.)
- Flujo de datos - API IPC
- Sistema de permisos (árbol de decisión)
- Matrices de roles y permisos
- Acciones rápidas & checklist

**Navegar a:**
- Diagrama de Arquitectura
- Flujos de Usuario
- Rol y Permisos Predefinidos
- Checklist para Próximas Mejoras

---

### 3. ⚡ **INDICE_RAPIDO_VENDEDORES.md** ← PARA CONSULTAS RÁPIDAS
**Descripción:** Índice rápido con respuestas directas a preguntas clave
**Tamaño:** Documento corto (~15KB)
**Ideal para:** Búsqueda rápida, respuestas directas, tablas de referencia
**Contiene:**
- Respuestas directas a las 5 preguntas iniciales
- Tabla de integración: APIs IPC
- Tablas de base de datos
- Permisos y control de acceso
- Archivos clave con líneas de referencia
- Quick reference para permisos
- Checklist para mejoras
- Búsqueda rápida (tabla de navegación)

**Navegar a:**
- 1️⃣ ¿Dónde está el componente "Vendedores"?
- 4️⃣ ¿Cómo se relacionan las ventas con los usuarios?
- 5️⃣ Estructura de rutas y componentes

---

### 4. 🌳 **ARBOL_CARPETAS_FRONTEND.md** ← PARA EXPLORAR ESTRUCTURA
**Descripción:** Árbol completo de carpetas con descripciones
**Tamaño:** Documento estructural (~25KB)
**Ideal para:** Navegar la estructura del proyecto, localizar archivos
**Contiene:**
- Árbol completo de carpetas `electron-app/src`
- Descripción en cada nivel
- Rutas importantes resaltadas
- Mapa de dependencias
- Flujo de datos simplificado
- Convenciones de nomenclatura

**Navegar a:**
- MAIN (Backend)
- RENDERER (Frontend)
- PRELOAD (IPC Bridge)
- Rutas Importantes
- Mapa de Dependencias

---

### 5. ⚡ **CHEAT_SHEET_VENDEDORES.md** ← PARA DESARROLLO
**Descripción:** Cheat sheet con ejemplos de código listos para usar
**Tamaño:** Documento práctico (~20KB)
**Ideal para:** Desarrolladores que necesitan hacer cambios rápidos
**Contiene:**
- Acciones rápidas (editar código)
- Ejemplos de uso de APIs
- Matrices de permisos listas para usar
- Cómo cambiar rutas
- Cambios a base de datos
- Backend: Agregar handlers
- Preload: Exponer nuevas APIs
- Testing rápido
- Debug común
- Consultas SQL útiles
- Migración paso a paso

**Navegar a:**
- Acciones Rápidas
- Ejemplos de Código
- Agregar Handler Backend
- Migración

---

## 🎯 GUÍA: Por Dónde Empezar

### Si eres NUEVO en el proyecto:
1. 📋 Leer **MAPA_FRONTEND_VENDEDORES.md** (primero)
2. 🎨 Ver **RESUMEN_VISUAL_VENDEDORES.md** (para visualizar)
3. ⚡ Consultar **INDICE_RAPIDO_VENDEDORES.md** (cuando necesites referencias rápidas)

### Si necesitas DESARROLLO RÁPIDO:
1. 📚 Consultar **CHEAT_SHEET_VENDEDORES.md**
2. 🌳 Usar **ARBOL_CARPETAS_FRONTEND.md** para encontrar archivos
3. ⚡ Verificar en **INDICE_RAPIDO_VENDEDORES.md** (líneas de referencia)

### Si necesitas ENTENDER LA ARQUITECTURA:
1. 🎨 Ver **RESUMEN_VISUAL_VENDEDORES.md** (diagramas)
2. 📋 Profundizar en **MAPA_FRONTEND_VENDEDORES.md**
3. 🌳 Explorar con **ARBOL_CARPETAS_FRONTEND.md**

### Si necesitas NAVEGAR EL CÓDIGO:
1. 🌳 Usar **ARBOL_CARPETAS_FRONTEND.md** (encontrar archivos)
2. ⚡ Consultar **CHEAT_SHEET_VENDEDORES.md** (ejemplos de código)
3. 📋 Verificar líneas en **MAPA_FRONTEND_VENDEDORES.md**

---

## 🚀 QUICK START

### Pregunta 1: ¿Dónde está el componente Vendedores?
**Respuesta:** 
```
electron-app/src/renderer/src/pages/Vendedores/index.jsx
Ruta web: /cliente/vendedores
```
👉 Ver en: INDICE_RAPIDO_VENDEDORES.md (Sección 1️⃣)

### Pregunta 2: ¿Estructura actual de vendedores?
**Respuesta:**
- Tabla HTML con vendedores
- Formulario para crear/editar
- Campos: nombre, apellido, email, telefono, comisión, activo
- CRUD completo implementado
👉 Ver en: CHEAT_SHEET_VENDEDORES.md + MAPA_FRONTEND_VENDEDORES.md

### Pregunta 3: ¿Dónde están componentes de usuarios?
**Respuesta:**
```
electron-app/src/renderer/src/pages/Usuarios/index.jsx
Ruta web: /cliente/configuracion/usuarios
Permiso: configuracion.usuarios
```
👉 Ver en: INDICE_RAPIDO_VENDEDORES.md (Sección 3️⃣)

### Pregunta 4: ¿Relación ventas ↔ usuarios?
**Respuesta:**
- Actualmente: SIN conexión directa (vendedores es tabla independiente)
- Futuro: Se planea agregar vendedor_id en facturas y clientes
- Auditoría: Existe tabla audit_usuarios
👉 Ver en: RESUMEN_VISUAL_VENDEDORES.md + MAPA_FRONTEND_VENDEDORES.md

### Pregunta 5: ¿Estructura de rutas?
**Respuesta:**
- Router principal: App.jsx
- Layouts: ClienteLayout, ContadorLayout
- 15+ rutas de cliente configuradas
- Sistema de permisos: ProtectedRoute + PermissionRoute
👉 Ver en: ARBOL_CARPETAS_FRONTEND.md + MAPA_FRONTEND_VENDEDORES.md

---

## 📍 REFERENCIAS CRÍTICAS

### Archivos Principales
| Componente | Archivo |
|-----------|---------|
| **Vendedores UI** | `pages/Vendedores/index.jsx` |
| **Usuarios UI** | `pages/Usuarios/index.jsx` |
| **Rutas** | `App.jsx` (líneas 297-302, 482-489) |
| **Backend Vendedores** | `ipc/vendedores.js` |
| **Backend Usuarios** | `ipc/usuarios.js` |
| **BD Schema** | `database/connection.js` |
| **Permisos** | `context/AuthContext.jsx` |
| **API Expuesta** | `preload/preload.js` |
| **Menú/Layout** | `components/layout/ClienteLayout.jsx` |

### Tablas BD Relevantes
| Tabla | Línea | Descripción |
|-------|-------|-------------|
| `users` | 50 | Registro de usuarios con roles/permisos |
| `vendedores` | 453 | Vendedores (independiente de users) |
| `facturas` | ~400 | Facturas (SIN vendedor_id aún) |
| `roles` | 150 | Roles predefinidos con permisos |
| `audit_usuarios` | 160 | Auditoría de acciones |

---

## 🔐 PERMISOS - Resumen

### Roles Disponibles
- **dueño** - Acceso total
- **administrador** - Casi total (except administrar usuarios)
- **vendedor** - Crear ventas
- **contador** - Solo lectura
- **cajero** - Solo caja

### Permisos para Vendedores
```
- vendedores.crear (crear nuevos)
- vendedores.ver (listar)
- vendedores.editar (modificar)
- vendedores.eliminar (borrar)
```

### Permisos para Usuarios
```
- configuracion.usuarios (acceso a gestión)
Nota: Solo dueño/admin pueden gestionar usuarios
```

---

## ✨ PUNTOS DESTACABLES

### ✅ YA IMPLEMENTADO
- ✅ CRUD de vendedores
- ✅ CRUD de usuarios
- ✅ Sistema de permisos por rol
- ✅ Gestión de comisiones en vendedores
- ✅ Auditoría de usuarios
- ✅ Autenticación con roles
- ✅ Sincronización SII de trabajadores

### ⏳ PENDIENTE DE IMPLEMENTAR
- ⏳ Conexión vendedor_id en facturas
- ⏳ Conexión vendedor_id en clientes
- ⏳ Reportes de comisiones automáticas
- ⏳ Dashboard de vendedor
- ⏳ Análisis de ventas por vendedor

---

## 🛠️ HERRAMIENTAS Y TECNOLOGIAS

### Frontend
- **React 18+** - Framework UI
- **React Router v6** - Enrutamiento
- **Context API** - Estado global (auth, permisos)
- **Electron** - Aplicación de escritorio

### Backend
- **Node.js** - Runtime
- **Electron IPC** - Comunicación en proceso
- **SQLite3** - Base de datos
- **bcrypt** - Hash de contraseñas

### Desarrollo
- **Vite** - Build tool
- **Jest** - Testing
- **ESLint** - Linting (potencial)

---

## 📞 SOPORTE

### Dudas sobre estructura
👉 Ver **ARBOL_CARPETAS_FRONTEND.md**

### Dudas sobre flujos
👉 Ver **RESUMEN_VISUAL_VENDEDORES.md**

### Dudas sobre código
👉 Ver **CHEAT_SHEET_VENDEDORES.md**

### Dudas sobre permisos
👉 Ver **MAPA_FRONTEND_VENDEDORES.md** (Sección 🔐)

### Dudas sobre BD
👉 Ver **MAPA_FRONTEND_VENDEDORES.md** (Sección 📊)

---

## 📈 Roadmap de Documentación

| Documento | Estado | Útil Para |
|-----------|--------|-----------|
| MAPA_FRONTEND_VENDEDORES.md | ✅ Completo | Arquitectura completa |
| RESUMEN_VISUAL_VENDEDORES.md | ✅ Completo | Flujos y diagramas |
| INDICE_RAPIDO_VENDEDORES.md | ✅ Completo | Búsqueda rápida |
| ARBOL_CARPETAS_FRONTEND.md | ✅ Completo | Exploración de archivos |
| CHEAT_SHEET_VENDEDORES.md | ✅ Completo | Desarrollo rápido |
| ESTE DOCUMENTO | ✅ Completo | Navegación general |

---

## 🎓 Flujo de Aprendizaje Sugerido

```
Principiante
    ↓
1. Leer RESUMEN_VISUAL_VENDEDORES.md (visual)
2. Explorar ARBOL_CARPETAS_FRONTEND.md (estructura)
    ↓
Desarrollador
    ↓
3. Estudiar MAPA_FRONTEND_VENDEDORES.md (detallado)
4. Consultar INDICE_RAPIDO_VENDEDORES.md (referencia)
    ↓
Contribuidor
    ↓
5. Usar CHEAT_SHEET_VENDEDORES.md (código)
6. Realizar cambios en el proyecto
7. Actualizar documentación
```

---

## 📝 Información de Documentación

| Propiedad | Valor |
|-----------|-------|
| **Fecha de Creación** | 2026-03-19 |
| **Última Actualización** | 2026-03-19 |
| **Versión** | 1.0 Complete |
| **Totales Documentos** | 6 archivos |
| **Tamaño Total** | ~180 KB |
| **Cobertura** | 100% estructura frontend |
| **Estado** | ✅ Listo para usar |

---

## 🎯 Próximos Pasos

### Para Aprender
1. Lee RESUMEN_VISUAL_VENDEDORES.md
2. Abre los archivos mencionados en tu editor
3. Explora la estructura con ARBOL_CARPETAS_FRONTEND.md

### Para Desarrollar
1. Identifica el cambio necesario
2. Consulta CHEAT_SHEET_VENDEDORES.md para ejemplos
3. Modifica el código siguiendo los patrones
4. Test en la aplicación

### Para Contribuir
1. Lee toda la documentación
2. Mantén las convenciones de nomenclatura
3. Actualiza la documentación cuando hayas hecho cambios
4. Sigue los patrones estabelecidos

---

**Bienvenido a la documentación del Sistema de Facturación e Inventario 🚀**

Has completado una exploración profunda del módulo Vendedores y Usuarios. 
Ahora estás listo para:
- ✅ Entender la arquitectura
- ✅ Navegar el código
- ✅ Hacer cambios seguros
- ✅ Contribuir mejoras

¡Que disfrutes desarrollando! 💪

