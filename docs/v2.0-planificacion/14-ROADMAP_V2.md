# 🚀 Roadmap v2.0 - Sistema Contable Multi-Tenant

**Versión:** 2.0.0  
**Fecha Inicio:** Enero 2026  
**Fecha Objetivo Producción:** Agosto 2026  
**Última actualización:** 5 de Enero 2026

---

## 📅 Timeline General

```
Enero - Marzo 2026: Fase 1 - Fundamentos
Abril - Mayo 2026:  Fase 2 - Roles y Perfiles
Junio - Julio 2026: Fase 3 - Testing y Producción
Agosto 2026:        Fase 4 - Lanzamiento Beta
Sept 2026+:         Fase 5 - Escalamiento
```

---

## 🎯 Fase 1: Fundamentos (12 semanas)

**Objetivo:** Construir la arquitectura base multi-tenant y servidor central

### Semana 1-2: Diseño y Planificación

**Entregables:**
- [x] Documentación completa v2.0
- [ ] Diseño de base de datos PostgreSQL
- [ ] Arquitectura de microservicios definida
- [ ] Wireframes de UI Contador y Cliente
- [ ] Plan de testing y QA

**Equipo:**
- 1 Arquitecto de Software
- 2 Desarrolladores Backend
- 1 Desarrollador Frontend
- 1 UX/UI Designer

### Semana 3-5: Servidor Central - Core

**Tareas:**

```javascript
// 1. Setup inicial del servidor
- Proyecto Node.js + Express
- PostgreSQL 16 con particionamiento
- Redis para cache y colas
- Docker Compose para desarrollo local

// 2. Autenticación y Autorización
- Passport.js con estrategia JWT
- Registro de Contadores
- Registro de Clientes vía invitación
- Refresh tokens
- Multi-Factor Authentication (MFA)

// 3. Multi-Tenancy
- Row-Level Security (RLS) en PostgreSQL
- Middleware de tenant isolation
- Configuración por tenant

// 4. APIs Base
GET    /api/v2/auth/register
POST   /api/v2/auth/login
POST   /api/v2/auth/refresh
GET    /api/v2/auth/me

POST   /api/v2/contadores
GET    /api/v2/contadores/:id

POST   /api/v2/clientes/invitar
POST   /api/v2/clientes
GET    /api/v2/clientes
GET    /api/v2/clientes/:id
```

**Testing:**
- Unit tests (Jest) para servicios
- Integration tests para APIs
- Coverage mínimo: 80%

### Semana 6-8: Integración SII Real

**Tareas:**

```javascript
// 1. Cliente SOAP para SII
- Librería soap/node-soap
- Certificados digitales PKI
- Endpoints de certificación, timbraje, envío

// 2. Gestión de Folios
- Solicitud de CAF (Código Autorización Folios)
- Almacenamiento cifrado de CAFs
- Asignación automática de folios

// 3. Generación y Firma de DTEs
- Generación de XML según esquema SII
- Firma digital con certificado
- Validación de estructura XML

// 4. Envío y Tracking
- Envío de DTEs al SII
- Polling de estado (Track ID)
- Manejo de respuestas y errores
- Retry con exponential backoff
```

**Servicios SII a Integrar:**
- `QueryEstUp`: Verificar disponibilidad
- `GetTokenFromSeed`: Autenticación
- `EnvioDTE`: Envío de documentos
- `GetEstDte`: Consulta de estado
- `GetRUT`: Validación de RUTs

**Testing:**
- Ambiente de certificación SII
- Casos de prueba con DTEs de ejemplo
- Manejo de errores SII

### Semana 9-10: Sincronización Offline/Online

**Tareas:**

```javascript
// 1. Sistema de Colas (Bull + Redis)
- Queue de sincronización
- Queue de procesamiento DTEs
- Queue de envío SII
- Workers para cada cola

// 2. Conflict Resolution
- Estrategias de merge
- Versionado de registros
- Logs de sync

// 3. WebSocket para Notificaciones
- Socket.io server
- Rooms por tenant
- Broadcasting de eventos

// 4. API de Sincronización
POST   /api/v2/sync/batch
GET    /api/v2/sync/status
POST   /api/v2/sync/resolve-conflict
```

**Testing:**
- Simular pérdida de conexión
- Sincronización de 1000+ registros
- Conflictos simultáneos

### Semana 11-12: Refactorización Electron App

**Tareas:**

```javascript
// 1. Estructura Base v2
- Separar código Contador vs Cliente
- Routing diferenciado
- Context API para roles

// 2. SQLite Local Mejorado
- Nuevo esquema compatible con servidor
- Índices optimizados
- Triggers para sync queue

// 3. API Client
- Axios con interceptors
- Retry automático
- Queue de requests offline

// 4. Sincronización Client-Side
- Service Worker / Background process
- Detección de conectividad
- Progress tracking
```

**Entregables Fase 1:**
- ✅ Servidor central funcional
- ✅ Autenticación multi-tenant
- ✅ Integración SII completa
- ✅ Sincronización básica
- ✅ Electron app refactorizada

---

## 👥 Fase 2: Roles y Perfiles (8 semanas)

**Objetivo:** Implementar UIs diferenciadas y flujos específicos por rol

### Semana 13-15: UI Contador

**Componentes a Desarrollar:**

```jsx
// 1. Dashboard Contador
<DashboardContador>
  <ResumenKPIs />
  <AlertasYNotificaciones />
  <ListaClientes />
  <DTEsPendientesAprobacion />
</DashboardContador>

// 2. Gestión de Clientes
<GestionClientes>
  <FormularioInvitacion />
  <ListaClientesActivos />
  <DetalleCliente />
  <ConfiguracionCliente />
</GestionClientes>

// 3. Aprobación de DTEs
<ColaAprobacion>
  <ListaDTEsPendientes />
  <ModalRevisionDTE />
  <AprobacionLote />
</ColaAprobacion>

// 4. Gestión de Folios
<GestionFolios>
  <MonitorFolios />
  <SolicitudFoliosSII />
  <HistorialSolicitudes />
</GestionFolios>

// 5. Certificados Digitales
<GestionCertificados>
  <ListaCertificados />
  <FormularioCargaCertificado />
  <AlertasVencimiento />
</GestionCertificados>
```

**Características:**
- Tablas con paginación, filtros, búsqueda
- Gráficos con Chart.js
- Notificaciones en tiempo real (WebSocket)
- Export a Excel/PDF

### Semana 16-18: UI Cliente

**Componentes a Desarrollar:**

```jsx
// 1. Dashboard Cliente
<DashboardCliente perfil={perfil}>
  {perfil === 'FACTURADOR' && <DashboardFacturador />}
  {perfil === 'BOLETEADOR' && <DashboardBoleteador />}
  {perfil === 'MIXTO' && <DashboardMixto />}
</DashboardCliente>

// 2. Emisión de Documentos
<EmisionDTE tipo={tipo}>
  <BusquedaReceptor />
  <FormularioDetalle />
  <CalculadoraTotales />
  <PreviewDTE />
</EmisionDTE>

// 3. Gestión de Productos
<GestionProductos>
  <ListaProductos />
  <FormularioProducto />
  <ImportarExcel />
  <BusquedaRapida />
</GestionProductos>

// 4. Sincronización
<PanelSincronizacion>
  <EstadoConexion />
  <ColaPendientes />
  <LogSincronizacion />
</PanelSincronizacion>
```

**Optimizaciones:**
- Virtual scrolling para listas grandes
- Autocompletado con debounce
- Validación en tiempo real
- Shortcuts de teclado

### Semana 19-20: Sistema de Perfiles

**Implementación:**

```javascript
// 1. Backend: Lógica de Perfiles
const perfilConfig = {
  FACTURADOR: {
    tipos_documento: [33, 56, 61], // Factura, NotaDébito, NotaCrédito
    requiere_receptor: true,
    flujo: 'INDIVIDUAL', // Cada doc se envía por separado
    ui: 'completa'
  },
  BOLETEADOR: {
    tipos_documento: [39, 41], // Boleta, Boleta Exenta
    requiere_receptor: false,
    flujo: 'LOTE', // Se agrupa diariamente
    ui: 'simplificada'
  },
  MIXTO: {
    tipos_documento: [33, 39, 56, 61, 41],
    requiere_receptor: 'SEGUN_TIPO',
    flujo: 'MIXTO',
    ui: 'completa_con_tabs'
  }
};

// 2. Frontend: Routing Dinámico
const rutasSegunPerfil = {
  FACTURADOR: ['/facturas', '/notas', '/clientes', '/productos'],
  BOLETEADOR: ['/boletas', '/productos', '/ventas-diarias'],
  MIXTO: ['/facturas', '/boletas', '/notas', '/clientes', '/productos']
};

// 3. Componentes Adaptativos
<FormularioEmision>
  {perfil === 'FACTURADOR' && <CamposFactura />}
  {perfil === 'BOLETEADOR' && <CamposBoleta />}
  {perfil === 'MIXTO' && (
    <Tabs>
      <Tab label="Factura"><CamposFactura /></Tab>
      <Tab label="Boleta"><CamposBoleta /></Tab>
    </Tabs>
  )}
</FormularioEmision>
```

**Testing:**
- Crear usuarios de cada perfil
- Verificar restricciones por perfil
- Transiciones de perfil

**Entregables Fase 2:**
- ✅ UI Contador completa y funcional
- ✅ UI Cliente con 3 perfiles
- ✅ Flujos de aprobación implementados
- ✅ Sistema de perfiles robusto

---

## 🧪 Fase 3: Testing y Producción (8 semanas)

**Objetivo:** Testing exhaustivo y preparación para lanzamiento

### Semana 21-23: Testing Funcional

**Tipos de Testing:**

#### 1. Unit Testing
```bash
# Backend
npm run test:unit
# Coverage objetivo: 85%

# Frontend
npm run test:components
# Coverage objetivo: 80%
```

#### 2. Integration Testing
```javascript
// Ejemplo: Test de flujo completo
describe('Flujo E2E: Emisión de Factura', () => {
  it('Cliente emite factura → Contador aprueba → SII acepta', async () => {
    // 1. Login como cliente
    const cliente = await login('cliente@test.cl', 'pass');
    
    // 2. Emitir factura
    const factura = await emitirFactura({
      receptor: 'Test S.A.',
      items: [{ producto: 'Test', cantidad: 1, precio: 1000 }]
    });
    
    // 3. Sincronizar
    await sincronizar();
    
    // 4. Login como contador
    const contador = await login('contador@test.cl', 'pass');
    
    // 5. Aprobar factura
    await aprobarDTE(factura.id);
    
    // 6. Verificar envío a SII
    const estado = await consultarEstadoSII(factura.id);
    expect(estado).toBe('ACEPTADO_SII');
  });
});
```

#### 3. Load Testing
```yaml
# Artillery.io config
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10  # 10 usuarios/seg
    - duration: 120
      arrivalRate: 50  # 50 usuarios/seg
    - duration: 60
      arrivalRate: 100 # 100 usuarios/seg

scenarios:
  - name: 'Emitir DTEs en paralelo'
    flow:
      - post:
          url: '/api/v2/dtes'
          json:
            tipo_documento: 33
            receptor_rut: '76123456'
            total: 10000
```

#### 4. Security Testing
- Penetration testing (OWASP Top 10)
- SQL Injection attempts
- XSS attempts
- CSRF protection
- Rate limiting validation
- JWT token validation

### Semana 24-26: Bug Fixing y Optimización

**Prioridades:**

1. **Bugs Críticos (P0):**
   - Pérdida de datos
   - Errores de seguridad
   - Crashes de app
   - Errores en envío SII

2. **Bugs Mayores (P1):**
   - Sincronización fallida
   - UI no responsiva
   - Performance degradado

3. **Bugs Menores (P2):**
   - UI inconsistencias
   - Mensajes de error poco claros
   - Funcionalidades secundarias

**Optimizaciones:**
- Queries SQL lentas (> 100ms)
- Reducción de tamaño de bundle JS
- Lazy loading de componentes
- Cache estratégico
- Índices de BD faltantes

### Semana 27-28: Deploy y DevOps

**Infraestructura:**

```yaml
# docker-compose.production.yml
version: '3.8'

services:
  api:
    image: sistema-contable-api:v2.0.0
    replicas: 3
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://...
      REDIS_URL: redis://...
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G

  postgres:
    image: postgres:16
    volumes:
      - postgres_data:/var/lib/postgresql/data
    deploy:
      replicas: 1
      placement:
        constraints: [node.role == manager]

  redis:
    image: redis:7-alpine
    deploy:
      replicas: 3

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
```

**CI/CD Pipeline:**

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: |
          npm install
          npm run test:all
          npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Build Docker images
        run: |
          docker build -t sistema-contable-api:${{github.sha}} .
          docker push ...

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to AWS ECS
        run: |
          aws ecs update-service --cluster prod --service api
```

**Monitoring:**

```javascript
// Prometheus + Grafana
const metricas = {
  http_requests_total: new Counter({
    name: 'http_requests_total',
    help: 'Total de requests HTTP',
    labelNames: ['method', 'route', 'status']
  }),
  
  http_request_duration_ms: new Histogram({
    name: 'http_request_duration_ms',
    help: 'Duración de requests en ms',
    labelNames: ['method', 'route'],
    buckets: [10, 50, 100, 200, 500, 1000, 2000]
  }),
  
  dtes_enviados_sii: new Counter({
    name: 'dtes_enviados_sii',
    help: 'DTEs enviados al SII',
    labelNames: ['tipo_documento', 'estado']
  })
};
```

**Entregables Fase 3:**
- ✅ Testing completo (funcional, carga, seguridad)
- ✅ 0 bugs críticos
- ✅ Deploy automatizado
- ✅ Monitoring en producción
- ✅ Documentación de deploy

---

## 🎉 Fase 4: Lanzamiento Beta (4 semanas)

**Objetivo:** Onboarding de primeros 10 contadores beta

### Semana 29-30: Preparación de Lanzamiento

**Tareas:**
- [ ] Crear landing page
- [ ] Programa de beta testers
- [ ] Videos tutoriales
- [ ] Documentación de usuario final
- [ ] Soporte técnico preparado
- [ ] Plan de comunicación

### Semana 31-32: Beta con Usuarios Reales

**Plan:**

1. **Semana 1:**
   - Invitar a 3 contadores
   - Cada contador invita 2-3 clientes
   - Total: ~10 usuarios activos

2. **Semana 2:**
   - Expandir a 10 contadores
   - ~30-40 clientes
   - Total: ~50 usuarios activos

**Métricas de Éxito:**
- NPS (Net Promoter Score) > 40
- Tasa de adopción: 80% de invitados se registran
- Uptime: > 99%
- Tiempo promedio de onboarding: < 15 min
- 0 bugs críticos reportados

**Feedback Loop:**
```javascript
const recolectarFeedback = {
  encuestas: {
    frecuencia: 'semanal',
    preguntas: [
      '¿Qué tan fácil fue registrarte?',
      '¿Encontraste algún error?',
      '¿Qué funcionalidad te falta?',
      'NPS: ¿Recomendarías la app?'
    ]
  },
  
  sesiones_usuario: {
    herramienta: 'Hotjar',
    grabar: 'primeras 50 sesiones',
    analizar: 'flujos abandonados'
  },
  
  soporte: {
    canal: 'Email + Chat en app',
    sla: '< 4 horas respuesta',
    escalacion: 'Bugs críticos → Desarrollo'
  }
};
```

**Entregables Fase 4:**
- ✅ 10 contadores + 40 clientes activos
- ✅ NPS > 40
- ✅ 0 bugs críticos en producción
- ✅ Feedback recopilado y priorizado

---

## 🚀 Fase 5: Escalamiento (Continuo)

**Objetivo:** Crecer a 100+ contadores y 500+ clientes

### Roadmap Post-Lanzamiento

#### Q3 2026 (Sept-Nov)

**Marketing y Crecimiento:**
- Lanzamiento público
- Partnerships con colegios de contadores
- Webinars y demos
- Objetivo: 50 contadores, 250 clientes

**Features Adicionales:**
- Reportes avanzados con BI
- Integración con bancos (pago de facturas)
- API pública para integraciones
- App móvil (React Native) - versión 1.0

#### Q4 2026 (Dic-Feb 2027)

**Integraciones Externas:**
- SAP Business One
- Defontana
- Softland
- QuickBooks (para migraciones)

**Optimizaciones:**
- Machine Learning para detección de anomalías
- Sugerencias inteligentes de productos
- Predicción de flujo de caja

**Escalamiento Técnico:**
- Migrar a Kubernetes
- Multi-región (Santiago + backup en USA)
- CDN global para assets

#### Q1 2027 (Mar-May)

**Nuevas Funcionalidades:**
- Módulo de inventario avanzado
- Gestión de compras y proveedores
- Conciliación bancaria automática
- Declaraciones de impuestos (F29, F50)

**Expansión:**
- Soporte para otros países (Perú, Colombia)
- Multi-idioma (español, inglés)

---

## 📊 KPIs de Seguimiento

```javascript
const kpisProyecto = {
  desarrollo: {
    velocity: '40 story points/sprint',
    bugs_nuevos: '< 5 por sprint',
    code_coverage: '> 85%',
    tech_debt: '< 10% tiempo sprint'
  },
  
  producto: {
    usuarios_activos_mensuales: {
      mes_1: 50,
      mes_3: 150,
      mes_6: 500,
      mes_12: 2000
    },
    
    retention: {
      mes_1: '> 90%',
      mes_3: '> 80%',
      mes_6: '> 70%'
    },
    
    nps: '> 50',
    
    churn: '< 5% mensual'
  },
  
  tecnico: {
    uptime: '> 99.9%',
    latencia_p95: '< 200ms',
    error_rate: '< 0.1%',
    throughput: '1000 DTEs/hora',
    tasa_rechazo_sii: '< 1%'
  }
};
```

---

## 🚧 Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| **Integración SII falla en prod** | Media | Alto | Testing exhaustivo en ambiente certificación. Plan B: queue offline y reintentos. |
| **Performance degrada con 100+ usuarios** | Baja | Alto | Load testing desde Fase 3. Escalamiento horizontal preparado. |
| **Bugs críticos en producción** | Media | Alto | Feature flags para rollback rápido. Monitoring 24/7. |
| **Adopción lenta de usuarios** | Media | Medio | Marketing agresivo. Onboarding mejorado. Incentivos para beta testers. |
| **Certificados digitales caducan** | Baja | Alto | Alertas automáticas 60/30/15 días antes. Proceso de renovación documentado. |
| **Pérdida de datos** | Muy Baja | Crítico | Backups automáticos cada 6h. Replicación cross-region. Testing de restore mensual. |

---

## 📞 Equipo y Roles

```
Product Owner: 1
Scrum Master: 1

Backend Developers: 3
Frontend Developers: 2
DevOps Engineer: 1
QA Engineer: 1
UX/UI Designer: 1

Soporte Técnico (a partir Fase 4): 2
```

---

**Última actualización:** 5 de Enero 2026  
**Próxima revisión:** Cada sprint (cada 2 semanas)

---

**Documentos Relacionados:**
- [15-MIGRACION_V1_V2.md](15-MIGRACION_V1_V2.md) - Guía de migración
- [16-DEPLOY_SERVIDOR.md](16-DEPLOY_SERVIDOR.md) - Instrucciones de deploy
- [17-PRUEBAS.md](17-PRUEBAS.md) - Estrategia de testing
