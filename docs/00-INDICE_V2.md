# 📚 Índice de Documentación - Sistema Contable B2B v2.0

**Proyecto:** Sistema Contable Multi-Tenant para Chile  
**Versión:** 2.0.0 (Refactorización Mayor)  
**Fecha:** Enero 2026  
**Estado:** En Planificación - Arquitectura Multi-Tenant

---

## 📂 Estructura de Documentación

```
docs/
├── 📄 00-INDICE_V2.md           ← Estás aquí
├── 📄 CHANGELOG.md               ← Historial de cambios
├── 📁 v2.0-planificacion/        ← Documentos de la nueva arquitectura
├── 📁 implementado/              ← Documentación de funcionalidades actuales (v1.x)
├── 📁 deprecated/                ← Documentos obsoletos (v1.x antiguo)
└── 📁 old/                       ← Archivos históricos
```

---

## 🎯 Cambio de Paradigma v2.0

**Antes (v1.x):** Sistema standalone de facturación para una empresa  
**Ahora (v2.0):** Plataforma contable multi-tenant con roles diferenciados

### Nuevas Capacidades

- **Modo Contador:** Gestión centralizada de múltiples clientes
- **Modo Cliente:** Facturación/Boleteo individual con sincronización
- **Servidor Central:** Orquestación, sincronización y conexión con SII
- **Multi-Perfil:** Soporte para Facturador, Boleteador o Mixto por cliente

---

## 📋 Documentación por Categoría

### 🏗️ Arquitectura y Diseño

| Documento | Descripción | Estado |
|-----------|-------------|--------|
| **[01-VISION_GENERAL_V2](v2.0-planificacion/01-VISION_GENERAL_V2.md)** | Visión general del sistema v2.0 | ✅ Actualizado |
| **[02-ARQUITECTURA_V2](v2.0-planificacion/02-ARQUITECTURA_V2.md)** | Arquitectura multi-tenant detallada | ⚠️ Pendiente |
| **[02.1-ARQUITECTURA_SERVIDOR](v2.0-planificacion/02.1-ARQUITECTURA_SERVIDOR.md)** | Diseño del servidor central | 🆕 Pendiente |
| **[02.2-FLUJO_DATOS](v2.0-planificacion/02.2-FLUJO_DATOS.md)** | Flujos de datos Contador ↔️ Cliente ↔️ SII | 🆕 Pendiente |
| **[03-BASE_DE_DATOS_V2](v2.0-planificacion/03-BASE_DE_DATOS_V2.md)** | Esquema BD multi-tenant | ✅ Actualizado |

### 👥 Roles y Funcionalidades

| Documento | Descripción | Estado |
|-----------|-------------|--------|
| **[04-ROL_CONTADOR](v2.0-planificacion/04-ROL_CONTADOR.md)** | Funcionalidades del Contador | 🆕 Nuevo |
| **[05-ROL_CLIENTE](v2.0-planificacion/05-ROL_CLIENTE.md)** | Funcionalidades del Cliente | 🆕 Nuevo |
| **[06-PERFILES_CLIENTE](v2.0-planificacion/06-PERFILES_CLIENTE.md)** | Tipos: Facturador, Boleteador, Mixto | 🆕 Pendiente |

### 🔧 Implementación Técnica

| Documento | Descripción | Estado |
|-----------|-------------|--------|
| **[07-MANUAL_TECNICO_V2](v2.0-planificacion/07-MANUAL_TECNICO_V2.md)** | Guía técnica desarrolladores | ⚠️ Pendiente |
| **[08-INTEGRACION_SII](v2.0-planificacion/08-INTEGRACION_SII.md)** | Conexión real con SII | 🆕 Nuevo |
| **[09-SINCRONIZACION](v2.0-planificacion/09-SINCRONIZACION.md)** | Lógica de sync offline/online | 🆕 Pendiente |
| **[10-SEGURIDAD](v2.0-planificacion/10-SEGURIDAD.md)** | Autenticación, autorización, cifrado | 🆕 Pendiente |

### 📖 Manuales de Usuario

| Documento | Descripción | Estado |
|-----------|-------------|--------|
| **[11-MANUAL_CONTADOR](v2.0-planificacion/11-MANUAL_CONTADOR.md)** | Guía para contadores | 🆕 Pendiente |
| **[12-MANUAL_CLIENTE](v2.0-planificacion/12-MANUAL_CLIENTE.md)** | Guía para clientes finales | 🆕 Pendiente |
| **[13-ONBOARDING](v2.0-planificacion/13-ONBOARDING.md)** | Primer uso y configuración inicial | 🆕 Pendiente |

### 🚀 Desarrollo y Deploy

| Documento | Descripción | Estado |
|-----------|-------------|--------|
| **[14-ROADMAP_V2](v2.0-planificacion/14-ROADMAP_V2.md)** | Plan de desarrollo v2.0 | ✅ Actualizado |
| **[15-MIGRACION_V1_V2](v2.0-planificacion/15-MIGRACION_V1_V2.md)** | Guía de migración desde v1.x | 🆕 Pendiente |
| **[16-DEPLOY_SERVIDOR](v2.0-planificacion/16-DEPLOY_SERVIDOR.md)** | Deploy del servidor central | 🆕 Pendiente |
| **[17-PRUEBAS](v2.0-planificacion/17-PRUEBAS.md)** | Estrategia de testing | 🆕 Pendiente |

---

## 📚 Documentación v1.x Implementado

### Funcionalidades Actuales

| Documento | Descripción |
|-----------|-------------|
| **[IMPLEMENTACION_COMPLETADA](implementado/IMPLEMENTACION_COMPLETADA.md)** | Lista de funcionalidades implementadas v1.x |
| **[GUIA_RAPIDA_CUENTAS_COBRAR](implementado/GUIA_RAPIDA_CUENTAS_COBRAR.md)** | Guía de uso de cuentas por cobrar |
| **[MEJORAS_CUENTAS_COBRAR](implementado/MEJORAS_CUENTAS_COBRAR.md)** | Documentación de mejoras implementadas |
| **[REPORTES_IMPLEMENTACION](implementado/REPORTES_IMPLEMENTACION.md)** | Sistema de reportes actual |
| **[IMPORTACION_EXCEL](implementado/IMPORTACION_EXCEL.md)** | Funcionalidad de importación |
| **[MEJORA_BUSCADOR_CLIENTES](implementado/MEJORA_BUSCADOR_CLIENTES.md)** | Buscador mejorado |

### Resúmenes Técnicos

| Documento | Descripción |
|-----------|-------------|
| **[RESUMEN_COMPLETO_21DIC](implementado/RESUMEN_COMPLETO_21DIC.md)** | Estado del proyecto 21 Dic 2025 |
| **[RESUMEN_IMPLEMENTACION](implementado/RESUMEN_IMPLEMENTACION.md)** | Resumen de implementación |
| **[RESUMEN_IMPORTACION](implementado/RESUMEN_IMPORTACION.md)** | Resumen de importación Excel |

---

## 🔄 Documentos Deprecados (v1.x)

Los siguientes documentos se mantienen como referencia histórica en `/docs/deprecated/`:

- `01-VISION_GENERAL.md` → Reemplazado por [01-VISION_GENERAL_V2](v2.0-planificacion/01-VISION_GENERAL_V2.md)
- `02-ARQUITECTURA.md` → Reemplazado por arquitectura v2.0
- `06-FUNCIONALIDADES.md` → Dividido en [04-ROL_CONTADOR](v2.0-planificacion/04-ROL_CONTADOR.md) y [05-ROL_CLIENTE](v2.0-planificacion/05-ROL_CLIENTE.md)
- `09-ROADMAP.md` → Reemplazado por [14-ROADMAP_V2](v2.0-planificacion/14-ROADMAP_V2.md)

---

## 📌 Leyenda de Estados

- ✅ **Actualizado:** Documento completo y actualizado para v2.0
- 🆕 **Nuevo:** Documento creado para v2.0
- ⚠️ **Pendiente:** Requiere actualización o creación
- 🗑️ **Deprecado:** Solo referencia histórica

---

## 🎯 Prioridad de Lectura

### Para Desarrolladores Backend
1. [01-VISION_GENERAL_V2](v2.0-planificacion/01-VISION_GENERAL_V2.md)
2. [03-BASE_DE_DATOS_V2](v2.0-planificacion/03-BASE_DE_DATOS_V2.md)
3. [08-INTEGRACION_SII](v2.0-planificacion/08-INTEGRACION_SII.md)
4. [14-ROADMAP_V2](v2.0-planificacion/14-ROADMAP_V2.md)

### Para Desarrolladores Frontend
1. [01-VISION_GENERAL_V2](v2.0-planificacion/01-VISION_GENERAL_V2.md)
2. [04-ROL_CONTADOR](v2.0-planificacion/04-ROL_CONTADOR.md)
3. [05-ROL_CLIENTE](v2.0-planificacion/05-ROL_CLIENTE.md)
4. [14-ROADMAP_V2](v2.0-planificacion/14-ROADMAP_V2.md)

### Para Usuarios Finales
1. [IMPLEMENTACION_COMPLETADA](implementado/IMPLEMENTACION_COMPLETADA.md) - Funcionalidades actuales
2. [GUIA_RAPIDA_CUENTAS_COBRAR](implementado/GUIA_RAPIDA_CUENTAS_COBRAR.md) - Uso actual

---

## 📞 Contacto y Contribución

**Mantenedor Principal:** Equipo de Desarrollo  
**Repositorio:** Sistema Contable Multi-Tenant

**Contribuciones:**
- Issues y sugerencias: Crear issue en repositorio
- Pull Requests: Seguir guía de contribución (`CONTRIBUTING.md`)

---

**Última actualización:** 5 de Enero 2026  
**Próxima revisión:** Febrero 2026
