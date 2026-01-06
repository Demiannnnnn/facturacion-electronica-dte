# 🏢 Sistema Contable Multi-Tenant v2.0

**Plataforma B2B de Facturación Electrónica para Chile**

Sistema contable multi-tenant que conecta **Contadores** con sus **Clientes** para gestionar facturación electrónica, boleteo y cumplimiento tributario con integración directa al SII.

---

## 🎯 Cambio de Paradigma v2.0

**v1.x (Actual):** Sistema standalone de facturación para una empresa  
**v2.0 (Nueva Arquitectura):** Plataforma colaborativa Contador ↔️ Múltiples Clientes

### Nuevas Capacidades

- ✅ **Modo Contador:** Gestión centralizada de múltiples clientes
- ✅ **Modo Cliente:** Facturación/Boleteo individual con sincronización offline
- ✅ **Servidor Central:** Orquestación, sincronización y conexión con SII
- ✅ **Multi-Perfil:** Soporte para Facturador, Boleteador o Mixto por cliente
- ✅ **Integración SII Real:** Solicitud de folios, envío y tracking de DTEs

---

## 🏗️ Arquitectura v2.0

```
┌─────────────────────────────────────────────────────────┐
│         CAPA CLIENTE (Electron Apps)                    │
│  ┌──────────────┐              ┌──────────────┐        │
│  │   Contador   │              │   Cliente    │        │
│  │   Dashboard  │              │   Emisión    │        │
│  └──────────────┘              └──────────────┘        │
└────────────────────┬───────────────────────────────────┘
                     │ API REST + WebSocket
┌────────────────────▼───────────────────────────────────┐
│    CAPA SERVIDOR (Node.js + PostgreSQL + Redis)        │
│  - Autenticación OAuth2                                 │
│  - Multi-Tenancy por Contador                           │
│  - Sincronización Offline/Online                        │
│  - Colas de Jobs (Bull + Redis)                         │
└────────────────────┬───────────────────────────────────┘
                     │ SOAP API
┌────────────────────▼───────────────────────────────────┐
│           CAPA SII (Servicios de Impuestos)             │
│  - Certificación de Folios                              │
│  - Envío de DTEs                                        │
│  - Consulta de Estados                                  │
└─────────────────────────────────────────────────────────┘
```

---

## 📚 Documentación v2.0

### 🎯 Para Empezar
- **[00-INDICE_V2.md](docs/00-INDICE_V2.md)** - Índice completo de documentación
- **[01-VISION_GENERAL_V2.md](docs/01-VISION_GENERAL_V2.md)** - Visión general del sistema
- **[13-ONBOARDING.md](docs/13-ONBOARDING.md)** - Primer uso y configuración

### 🏗️ Arquitectura y Diseño
- **[02-ARQUITECTURA_V2.md](docs/02-ARQUITECTURA_V2.md)** - Arquitectura completa
- **[03-BASE_DE_DATOS_V2.md](docs/03-BASE_DE_DATOS_V2.md)** - Esquema multi-tenant
- **[08-INTEGRACION_SII.md](docs/08-INTEGRACION_SII.md)** - Integración con SII
- **[09-SINCRONIZACION.md](docs/09-SINCRONIZACION.md)** - Lógica offline/online
- **[10-SEGURIDAD.md](docs/10-SEGURIDAD.md)** - Seguridad y cifrado

### 👥 Por Roles
- **[04-ROL_CONTADOR.md](docs/04-ROL_CONTADOR.md)** - Funcionalidades del Contador
- **[05-ROL_CLIENTE.md](docs/05-ROL_CLIENTE.md)** - Funcionalidades del Cliente
- **[06-PERFILES_CLIENTE.md](docs/06-PERFILES_CLIENTE.md)** - Perfiles (Facturador/Boleteador/Mixto)

### 🚀 Desarrollo
- **[14-ROADMAP_V2.md](docs/14-ROADMAP_V2.md)** - Roadmap completo
- **[15-MIGRACION_V1_V2.md](docs/15-MIGRACION_V1_V2.md)** - Guía de migración
- **[16-DEPLOY_SERVIDOR.md](docs/16-DEPLOY_SERVIDOR.md)** - Despliegue en producción
- **[17-PRUEBAS.md](docs/17-PRUEBAS.md)** - Estrategia de testing

---

## 🚀 Inicio Rápido (v2.0)

### Prerequisitos

**Para Desarrollo:**
- Node.js 20.x LTS
- PostgreSQL 16.x
- Redis 7.x
- Docker & Docker Compose (recomendado)

**Para Uso Final:**
- Solo la app Electron (incluye todo lo necesario)

### Instalación Desarrollo

```bash
# 1. Clonar repositorio
git clone https://github.com/tu-usuario/Sistema-facturaje-inventario.git
cd Sistema-facturaje-inventario

# 2. Levantar servicios con Docker
docker-compose up -d postgres redis

# 3. Instalar dependencias del servidor
cd server
npm install

# 4. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# 5. Ejecutar migraciones
npm run migrate

# 6. Iniciar servidor
npm run dev

# 7. En otra terminal: Instalar y ejecutar app Electron
cd ../electron-app
npm install
npm run dev
```

### Primera Ejecución

1. **Al abrir la app por primera vez:**
   ```
   ¿Eres Contador o Cliente?
   [Contador] [Cliente]
   ```

2. **Si seleccionas Contador:**
   - Completa registro (RUT, Razón Social, Email, Contraseña)
   - El sistema crea tu tenant
   - Accede al Dashboard Contador (vacío)
   - Invita a tu primer cliente

3. **Si seleccionas Cliente:**
   - Ingresa código de invitación (recibido por email del contador)
   - Completa registro
   - Accede al Dashboard Cliente según tu perfil

---

## 📦 Estructura del Proyecto v2.0

```
.
├── docs/                    # Documentación completa v2.0
│   ├── 00-INDICE_V2.md
│   ├── 01-VISION_GENERAL_V2.md
│   ├── 02-ARQUITECTURA_V2.md
│   ├── 03-BASE_DE_DATOS_V2.md
│   ├── 04-ROL_CONTADOR.md
│   ├── 05-ROL_CLIENTE.md
│   └── ... (más documentos)
│
├── server/                  # Servidor Node.js (NUEVO v2.0)
│   ├── src/
│   │   ├── routes/         # APIs REST
│   │   ├── services/       # Lógica de negocio
│   │   ├── models/         # Modelos de datos
│   │   ├── workers/        # Bull Queue workers
│   │   ├── websocket/      # Manejo WebSocket
│   │   └── app.js          # Entry point
│   ├── migrations/         # Migraciones PostgreSQL
│   ├── tests/              # Tests unitarios e integración
│   ├── docker/             # Dockerfiles
│   └── package.json
│
├── electron-app/            # App Electron (Refactorizada v2.0)
│   ├── src/
│   │   ├── main/           # Proceso principal
│   │   │   ├── database/   # SQLite local
│   │   │   ├── ipc/        # IPC handlers
│   │   │   └── services/   # Servicios (sync, api client)
│   │   └── renderer/       # UI React
│   │       ├── pages/
│   │       │   ├── Contador/    # UI Contador
│   │       │   ├── Cliente/     # UI Cliente
│   │       │   └── Auth/        # Login/Registro
│   │       ├── components/
│   │       ├── store/          # Zustand stores
│   │       └── hooks/
│   └── package.json
│
├── PDFs/                    # PDFs generados
├── XMLs/                    # XMLs de DTEs
├── README.md                # Este archivo
└── docker-compose.yml       # Servicios Docker
```

---

## 🎯 Casos de Uso Principales

### Para Contadores

1. **Registrar y configurar cuenta**
2. **Invitar clientes** (enviar código de invitación)
3. **Aprobar DTEs** antes de envío al SII
4. **Gestionar folios** (solicitar, asignar, monitorear)
5. **Administrar certificados digitales**
6. **Generar reportes consolidados** de todos los clientes

### Para Clientes

1. **Registrarse con código de invitación**
2. **Emitir facturas/boletas** (offline-first)
3. **Gestionar productos y clientes/receptores**
4. **Sincronizar automáticamente** cuando hay internet
5. **Consultar estado de documentos**
6. **Descargar PDFs timbrados**

---

## 🔐 Seguridad

- **Autenticación JWT** con refresh tokens
- **MFA obligatorio** para Contadores (TOTP)
- **Cifrado E2E:** TLS 1.3 en tránsito, AES-256 en reposo
- **Row-Level Security** en PostgreSQL (aislamiento multi-tenant)
- **Auditoría completa** (logs inmutables de todas las operaciones)
- **Certificados digitales** cifrados en HSM/KMS

---

## 📊 Tecnologías Utilizadas

### Frontend (Electron App)
- **Electron** 28.x
- **React** 18.x
- **Vite** 5.x
- **Zustand** (state management)
- **React Query** (server state)
- **Chart.js** (gráficos)
- **SQLite** (better-sqlite3) - Base de datos local

### Backend (Servidor)
- **Node.js** 20.x + Express 5.x
- **PostgreSQL** 16.x (con particionamiento y RLS)
- **Redis** 7.x (cache y colas)
- **Bull** (job queues)
- **Socket.io** (WebSocket)
- **Passport.js** (autenticación)
- **Knex.js** (query builder)

### Infraestructura
- **Docker** + Docker Compose
- **NGINX** (reverse proxy)
- **Prometheus** + Grafana (monitoring)
- **AWS/GCP** (producción)

---

## 🧪 Testing

```bash
# Backend
cd server
npm run test           # Unit tests
npm run test:integration  # Integration tests
npm run test:e2e       # End-to-end tests
npm run test:coverage  # Coverage report

# Frontend
cd electron-app
npm run test           # Component tests
npm run test:e2e       # E2E tests con Playwright
```

**Coverage Objetivo:** 85%+ en backend, 80%+ en frontend

---

## 📈 Roadmap

### ✅ Fase 1: Fundamentos (Enero-Marzo 2026)
- Refactor arquitectura multi-tenant
- Servidor central con autenticación
- Integración SII completa
- Sincronización básica

### 🔄 Fase 2: Roles y Perfiles (Abril-Mayo 2026)
- UI diferenciada Contador vs Cliente
- Sistema de perfiles
- Flujo de aprobación

### ⏳ Fase 3: Testing y Producción (Junio-Julio 2026)
- Testing exhaustivo
- Deploy en producción
- Documentación completa

### 🎯 Fase 4: Beta (Agosto 2026)
- Onboarding de 10 contadores + 40 clientes
- Feedback y mejoras

### 🚀 Fase 5: Escalamiento (Sept 2026+)
- App móvil (React Native)
- Integraciones ERPs
- Reportes con IA
- Marketplace de plugins

**[Ver Roadmap Completo](docs/14-ROADMAP_V2.md)**

---

## 🤝 Contribución

Este proyecto está en desarrollo activo para v2.0. Contribuciones bienvenidas:

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

**Guías:**
- [Guía de Contribución](CONTRIBUTING.md) (próximamente)
- [Código de Conducta](CODE_OF_CONDUCT.md) (próximamente)

---

## 📝 Licencia

**Licencia:** UNLICENSED - Uso privado

Este software es propiedad privada y no está disponible para uso, modificación o distribución sin autorización explícita.

---

## 📞 Contacto y Soporte

**Desarrollador Principal:** Demian  
**Email:** [Tu email]  
**Issues:** [GitHub Issues](https://github.com/tu-usuario/Sistema-facturaje-inventario/issues)

---

## 🙏 Agradecimientos

- **SII Chile** por la documentación de DTEs
- **Comunidad Open Source** por las herramientas utilizadas
- **Beta Testers** (próximamente)

---

## 📜 Changelog

### v2.0.0 (En Desarrollo - Enero 2026)
- ♻️ **REFACTOR MAYOR:** Arquitectura multi-tenant
- ✨ **NUEVO:** Servidor Node.js central
- ✨ **NUEVO:** Rol Contador con gestión multi-cliente
- ✨ **NUEVO:** Sistema de perfiles (Facturador/Boleteador/Mixto)
- ✨ **NUEVO:** Sincronización offline/online robusta
- ✨ **NUEVO:** Integración SII real (certificación, envío, tracking)
- ✨ **NUEVO:** Autenticación JWT + MFA
- ✨ **NUEVO:** WebSocket para notificaciones en tiempo real
- 📚 **DOCS:** Documentación completa v2.0

### v1.1.0 (21 Diciembre 2025)
- ✨ Cuentas por Cobrar renovado con gráficos
- 🎨 Diseño moderno con CSS mejorado
- 📊 Proyección de flujo de caja
- 📤 Exportación Excel y PDF mejorada

### v1.0.0 (Noviembre 2025)
- 🎉 Release inicial
- ✅ Facturación básica standalone
- ✅ Gestión de clientes, productos, vendedores
- ✅ Reportes básicos

---

**¡Gracias por usar Sistema Contable Multi-Tenant v2.0!** 🚀

Para más información, consulta la **[Documentación Completa](docs/00-INDICE_V2.md)**.
