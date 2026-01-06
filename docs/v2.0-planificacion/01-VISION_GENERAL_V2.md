# 🎯 Visión General del Sistema v2.0

**Proyecto:** Sistema Contable Multi-Tenant para Chile  
**Versión:** 2.0.0  
**Fecha:** Enero 2026  
**Estado:** Arquitectura en Definición

---

## 📋 Resumen Ejecutivo

Sistema contable B2B multi-tenant que conecta **Contadores** con sus **Clientes** para gestionar facturación electrónica, boleteo y cumplimiento tributario en Chile, con integración directa al SII.

### Cambio de Paradigma

**v1.x (Actual):** Aplicación standalone para una empresa  
**v2.0 (Nueva):** Plataforma colaborativa Contador ↔️ Múltiples Clientes

---

## 🏢 Actores del Sistema

### 1. 👔 Contador (Profesional Contable)

**Rol:** Gestor centralizado de múltiples clientes

**Capacidades:**
- Dashboard consolidado de todos sus clientes
- Visibilidad total de DTEs emitidos por cada cliente
- Validación y aprobación de documentos antes de envío al SII
- Generación de reportes tributarios consolidados
- Gestión de folios y certificados digitales
- Configuración de perfiles por cliente (Facturador/Boleteador/Mixto)

**Flujo de Trabajo:**
```
Contador registra nuevos clientes → Asigna perfil → Configura folios
    ↓
Cliente emite DTE → Contador revisa → Aprueba → Se envía al SII
    ↓
Contador genera reportes mensuales → Exporta para DDJJ
```

### 2. 🏪 Cliente (Empresa/Persona)

**Rol:** Emisor de documentos tributarios

**Perfiles Disponibles:**
- **Facturador:** Solo emite Facturas Electrónicas (Tipo 33, 61, 56)
- **Boleteador:** Solo emite Boletas Electrónicas (Tipo 39, 41)
- **Mixto:** Emite ambos tipos (retail + B2B)

**Capacidades:**
- Emisión de DTEs según su perfil
- Gestión de productos/servicios
- Registro de clientes/compradores
- Consulta de estado de documentos
- Dashboard simplificado de ventas
- Sincronización automática con su contador

**Flujo de Trabajo:**
```
Cliente crea factura/boleta → Guarda localmente (modo offline)
    ↓
Se conecta a internet → Sincroniza con servidor
    ↓
Contador revisa y aprueba → DTE enviado al SII
    ↓
Cliente recibe confirmación y folio timbrado
```

---

## 🌐 Arquitectura de 3 Capas

```
┌─────────────────────────────────────────────────────────┐
│                    CAPA CLIENTE                         │
│  Electron App (Win/Mac/Linux) - Modo Offline-First     │
│  ┌──────────────┐              ┌──────────────┐        │
│  │   Contador   │              │   Cliente    │        │
│  │   Dashboard  │              │   Emisión    │        │
│  │   + Admin    │              │   DTEs       │        │
│  └──────────────┘              └──────────────┘        │
│         ↓ API REST + WebSocket ↓                       │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              CAPA SERVIDOR (Node.js + PostgreSQL)       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ Autenticación│  │Sincronización│  │  Orquestador│    │
│  │    OAuth2    │  │ Offline/Online│ │   de DTEs   │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  Multi-Tenant│  │  Cola Jobs  │  │  Webhooks   │    │
│  │  por Contador│  │  (Bull/Redis)│  │  Notif.     │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
│         ↓ SOAP + REST ↓                                │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              CAPA SII (Servicios de Impuestos)          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ Certificación│  │Envío DTEs   │  │Consulta Estado│  │
│  │  (Timbraje)  │  │ SOAP API    │  │  de Folios   │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Flujos de Datos Principales

### A. Registro Inicial

```
Usuario abre app por primera vez
    ↓
¿Es Contador o Cliente?
    ↓
[CONTADOR]                          [CLIENTE]
    ↓                                   ↓
Registra cuenta                     Ingresa código de invitación
    ↓                                   ↓
Servidor crea Tenant                Servidor valida código
    ↓                                   ↓
Recibe Token + Tenant ID            Recibe Token + Perfil
    ↓                                   ↓
Dashboard Contador                  Dashboard Cliente
(vacío, sin clientes)               (según perfil asignado)
```

### B. Emisión de DTE (Cliente → Contador → SII)

```
Cliente crea Factura/Boleta
    ↓
Guarda en SQLite local (estado: PENDIENTE)
    ↓
Cuando hay internet → Sincroniza con servidor
    ↓
Servidor recibe DTE → Asocia a Contador
    ↓
Notifica vía WebSocket al Contador
    ↓
Contador revisa en su dashboard
    ↓
Contador APRUEBA el DTE
    ↓
Servidor firma XML y envía al SII
    ↓
SII responde (Track ID + Estado ACEPTADO)
    ↓
Servidor actualiza estado → Notifica al Cliente
    ↓
Cliente actualiza estado local + descarga PDF timbrado
```

### C. Sincronización Offline → Online

```
Cliente crea 5 DTEs en modo offline (sin internet)
    ↓
Quedan en SQLite local (estado: PENDIENTE_SYNC)
    ↓
Cliente reconecta a internet
    ↓
App detecta conexión → Envía cola de 5 DTEs al servidor
    ↓
Servidor valida e inserta en PostgreSQL
    ↓
Servidor encola 5 jobs para procesamiento
    ↓
Para cada DTE:
  - Notifica al Contador
  - Contador aprueba
  - Envía al SII
  - SII confirma
  - Notifica al Cliente
    ↓
Cliente actualiza estado de los 5 DTEs localmente
```

---

## 🎯 Objetivos de Negocio

### Para Contadores
✅ Centralizar la gestión de múltiples clientes en una sola interfaz  
✅ Reducir errores tributarios con validación previa al SII  
✅ Automatizar reportes mensuales y anuales  
✅ Ofrecer servicio de valor agregado a sus clientes  

### Para Clientes (Empresas)
✅ Simplificar emisión de DTEs sin conocimientos contables  
✅ Trabajar offline sin depender de internet 24/7  
✅ Delegar cumplimiento tributario al contador  
✅ Reducir costos de software contable complejo  

### Técnicos
✅ Arquitectura escalable (multi-tenant)  
✅ Alta disponibilidad (99.9% uptime)  
✅ Sincronización robusta offline/online  
✅ Seguridad nivel bancario (cifrado E2E)  

---

## 📊 Métricas de Éxito v2.0

| Métrica | Objetivo | Medición |
|---------|----------|----------|
| **Tiempo de onboarding** | < 10 min (Contador), < 5 min (Cliente) | Desde registro hasta primer DTE |
| **Tasa de adopción** | 100 contadores + 500 clientes en 6 meses | Usuarios activos/mes |
| **Uptime servidor** | 99.9% | Monitoreo 24/7 |
| **Latencia sync** | < 3 seg para sincronizar 100 DTEs | Pruebas de carga |
| **Tasa de rechazo SII** | < 1% | DTEs rechazados / total enviados |
| **Satisfacción usuario** | NPS > 50 | Encuestas trimestrales |

---

## 🚀 Roadmap de Alto Nivel

### Fase 1: Fundamentos (3 meses)
✅ Refactor arquitectura multi-tenant  
✅ Servidor central con autenticación OAuth2  
✅ Base de datos PostgreSQL + sincronización básica  
✅ Integración real con SII (certificación)  

### Fase 2: Roles y Perfiles (2 meses)
✅ UI diferenciada Contador vs Cliente  
✅ Sistema de perfiles (Facturador/Boleteador/Mixto)  
✅ Dashboard Contador con multi-cliente  
✅ Flujo de aprobación de DTEs  

### Fase 3: Producción (2 meses)
✅ Testing exhaustivo (E2E, carga, seguridad)  
✅ Deploy en producción (AWS/GCP)  
✅ Documentación completa  
✅ Onboarding de primeros 10 contadores beta  

### Fase 4: Escalamiento (continuo)
✅ App móvil (React Native)  
✅ Integraciones con ERPs (SAP, Defontana)  
✅ Reportes avanzados con IA  
✅ Marketplace de plugins  

---

## 🔐 Consideraciones de Seguridad

- **Cifrado E2E:** DTEs cifrados en tránsito (TLS 1.3) y en reposo (AES-256)
- **Multi-Factor Auth:** Obligatorio para Contadores
- **Auditoría completa:** Logs inmutables de todas las operaciones
- **Segregación de datos:** Cada Contador = Tenant aislado
- **Certificados digitales:** Almacenamiento seguro en HSM (Hardware Security Module)

---

## 📞 Próximos Pasos

1. Revisar [02-ARQUITECTURA_V2.md](02-ARQUITECTURA_V2.md) para detalles técnicos
2. Revisar [03-BASE_DE_DATOS_V2.md](03-BASE_DE_DATOS_V2.md) para esquema de datos
3. Revisar [14-ROADMAP_V2.md](14-ROADMAP_V2.md) para timeline detallado

---

**Última actualización:** 5 de Enero 2026
