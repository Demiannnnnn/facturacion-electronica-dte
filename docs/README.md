# 📋 README - Documentación del Proyecto

Esta carpeta contiene toda la documentación del **Sistema Contable Multi-Tenant**.

---

## 📂 Estructura

```
docs/
├── 📄 00-INDICE_V2.md           → Índice maestro (EMPIEZA AQUÍ)
├── 📄 00-INDICE.md              → Índice anterior (referencia)
├── 📄 CHANGELOG.md              → Historial de cambios del proyecto
│
├── 📁 v2.0-planificacion/       → 🚀 Arquitectura Nueva (Multi-Tenant)
│   ├── 01-VISION_GENERAL_V2.md
│   ├── 03-BASE_DE_DATOS_V2.md
│   ├── 04-ROL_CONTADOR.md
│   ├── 05-ROL_CLIENTE.md
│   ├── 08-INTEGRACION_SII.md
│   ├── 14-ROADMAP_V2.md
│   └── RESUMEN_TRANSFORMACION_V2.md
│
├── 📁 implementado/             → ✅ Funcionalidades Actuales (v1.x)
│   ├── IMPLEMENTACION_COMPLETADA.md
│   ├── GUIA_RAPIDA_CUENTAS_COBRAR.md
│   ├── MEJORAS_CUENTAS_COBRAR.md
│   ├── REPORTES_IMPLEMENTACION.md
│   ├── IMPORTACION_EXCEL.md
│   └── RESUMEN_COMPLETO_21DIC.md
│
├── 📁 deprecated/               → 🗑️ Documentos Obsoletos (v1.x antiguo)
│   └── (documentos históricos)
│
└── 📁 old/                      → 📦 Archivos Antiguos
    └── (archivos varios)
```

---

## 🎯 ¿Por Dónde Empezar?

### 👨‍💻 Para Desarrolladores

**Si vas a trabajar en la nueva versión v2.0:**
1. Lee **[00-INDICE_V2.md](00-INDICE_V2.md)** - Índice completo
2. Revisa **[v2.0-planificacion/01-VISION_GENERAL_V2.md](v2.0-planificacion/01-VISION_GENERAL_V2.md)** - Visión general
3. Estudia **[v2.0-planificacion/14-ROADMAP_V2.md](v2.0-planificacion/14-ROADMAP_V2.md)** - Plan de desarrollo

**Si necesitas entender el sistema actual (v1.x):**
1. Revisa **[implementado/IMPLEMENTACION_COMPLETADA.md](implementado/IMPLEMENTACION_COMPLETADA.md)**
2. Consulta documentos específicos en `/implementado/`

### 👤 Para Usuarios

**Para usar el sistema actual:**
- **[implementado/GUIA_RAPIDA_CUENTAS_COBRAR.md](implementado/GUIA_RAPIDA_CUENTAS_COBRAR.md)** - Guía rápida

**Para entender qué viene:**
- **[v2.0-planificacion/01-VISION_GENERAL_V2.md](v2.0-planificacion/01-VISION_GENERAL_V2.md)** - Nuevas funcionalidades

---

## 📚 Categorías de Documentación

### 🚀 Planificación v2.0 (`v2.0-planificacion/`)
Documentación de la **nueva arquitectura multi-tenant**:
- Arquitectura y diseño del sistema
- Roles (Contador y Cliente)
- Integración real con SII
- Roadmap de desarrollo
- Base de datos PostgreSQL

### ✅ Implementado (`implementado/`)
Documentación de **funcionalidades actuales** (v1.x):
- Guías de uso
- Mejoras implementadas
- Reportes técnicos
- Estado del proyecto

### 🗑️ Deprecado (`deprecated/`)
Documentos **obsoletos** pero mantenidos como referencia histórica.

---

## 📌 Documentos Clave

| Documento | Descripción | Ubicación |
|-----------|-------------|-----------|
| **00-INDICE_V2.md** | Índice maestro de documentación v2.0 | Raíz |
| **CHANGELOG.md** | Historial de cambios | Raíz |
| **01-VISION_GENERAL_V2.md** | Visión general del sistema nuevo | `v2.0-planificacion/` |
| **14-ROADMAP_V2.md** | Plan de desarrollo completo | `v2.0-planificacion/` |
| **03-BASE_DE_DATOS_V2.md** | Esquema de base de datos | `v2.0-planificacion/` |
| **IMPLEMENTACION_COMPLETADA.md** | Funcionalidades actuales | `implementado/` |

---

## 🔍 Convenciones

### Nomenclatura de Archivos

- **`##-NOMBRE.md`** → Documentos ordenados numéricamente
- **`NOMBRE_V2.md`** → Documentos de la versión 2.0
- **`NOMBRE_TEMA.md`** → Documentos descriptivos por tema

### Estados de Documentos

- ✅ **Actualizado** - Documento completo y actualizado
- 🆕 **Nuevo** - Documento recién creado para v2.0
- ⚠️ **Pendiente** - Requiere creación o actualización
- 🗑️ **Deprecado** - Solo referencia histórica

---

## 📞 Contacto

Para preguntas sobre la documentación:
- Crear issue en GitHub con etiqueta `documentation`
- Consultar al equipo de desarrollo

---

**Última actualización:** 6 de Enero 2026
