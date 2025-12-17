# 10 - DOCUMENTACIÓN DEL SERVIDOR
## Sistema de Facturación Electrónica B2B - Backend

**Versión:** 0.1.0 (En Desarrollo)  
**Última actualización:** 17 de Diciembre, 2025  
**Estado:** Fase 4 - Pendiente

---

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Estado Actual](#estado-actual)
3. [Arquitectura Planificada](#arquitectura-planificada)
4. [Tecnologías](#tecnologías)
5. [Endpoints API](#endpoints-api)
6. [Base de Datos](#base-de-datos)
7. [Autenticación y Seguridad](#autenticación-y-seguridad)
8. [Sistema de Licencias](#sistema-de-licencias)
9. [Integración con SII](#integración-con-sii)
10. [Cron Jobs](#cron-jobs)
11. [Deployment](#deployment)
12. [Monitoreo](#monitoreo)
13. [Roadmap](#roadmap)

---

## 🎯 Introducción

El servidor backend es un componente **futuro** del sistema que proporcionará:

- **Sistema de licencias:** Validación y gestión de licencias de clientes
- **Integración con SII:** Envío de DTEs a través de ChileAPI
- **Sincronización:** (Opcional) Sincronización de datos entre dispositivos
- **Panel de administración:** Gestión de clientes y licencias

> ⚠️ **NOTA:** Este componente está en **Fase 4** del roadmap y actualmente solo existe como esqueleto básico.

---

## 📊 Estado Actual

### Implementado (10%)

```
server/
├── src/
│   └── index.js          # ✅ Servidor Express básico
├── package.json          # ✅ Dependencias definidas
└── README.md             # ✅ Documentación básica
```

**Funcionalidad actual:**
- Servidor Express.js básico
- Endpoints de prueba: `/health`, `/api`
- Configuración de CORS
- Puerto: 3000

### Pendiente (90%)

- ❌ Base de datos PostgreSQL
- ❌ Endpoints de licencias
- ❌ Endpoints de SII
- ❌ Autenticación JWT
- ❌ Integración con ChileAPI
- ❌ Cron jobs
- ❌ Panel de administración
- ❌ Deployment en producción

---

## 🏗️ Arquitectura Planificada

```
┌─────────────────────────────────────────────────────────────┐
│                    INTERNET                                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                 LOAD BALANCER (Railway)                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              EXPRESS.JS SERVER (Node.js)                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Middleware Layer                         │  │
│  │  - CORS                                               │  │
│  │  - Helmet (Security Headers)                          │  │
│  │  - Rate Limiting                                      │  │
│  │  - JWT Authentication                                 │  │
│  │  - Request Logging (Winston)                          │  │
│  │  - Error Handling                                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                         │                                   │
│                         ▼                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Routes Layer                             │  │
│  │  /api/licenses/*                                      │  │
│  │  /api/sii/*                                           │  │
│  │  /api/admin/*                                         │  │
│  │  /health                                              │  │
│  └──────────────────────────────────────────────────────┘  │
│                         │                                   │
│                         ▼                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Controllers Layer                        │  │
│  │  - LicensesController                                 │  │
│  │  - SIIController                                      │  │
│  │  - AdminController                                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                         │                                   │
│                         ▼                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Services Layer                           │  │
│  │  - LicenseService                                     │  │
│  │  - ChileAPIService                                    │  │
│  │  - EmailService                                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                         │                                   │
│                         ▼                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Data Access Layer                        │  │
│  │  - PostgreSQL Client (pg)                             │  │
│  │  - Query Builders                                     │  │
│  │  - Migrations (node-pg-migrate)                       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                     │                    │
                     ▼                    ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│   PostgreSQL Database    │  │      ChileAPI            │
│   (Railway)              │  │   (External Service)     │
│  - licenses              │  │  - Envío DTE al SII      │
│  - dte_logs              │  │  - Consulta estado       │
│  - companies             │  │  - Descarga PDF          │
│  - api_keys              │  └──────────────────────────┘
└──────────────────────────┘
```

---

## 🛠️ Tecnologías

### Backend Framework

```json
{
  "express": "^4.18.2",
  "cors": "^2.8.5",
  "helmet": "^7.1.0",
  "dotenv": "^16.3.1"
}
```

### Base de Datos

```json
{
  "pg": "^8.11.3",
  "node-pg-migrate": "^6.2.2"
}
```

### Autenticación

```json
{
  "jsonwebtoken": "^9.0.2",
  "bcrypt": "^5.1.1"
}
```

### Utilidades

```json
{
  "winston": "^3.11.0",
  "express-rate-limit": "^7.1.5",
  "axios": "^1.6.2",
  "node-cron": "^3.0.3"
}
```

---

## 🔌 Endpoints API

### Licencias

#### `POST /api/licenses/validate`

Valida una licencia de cliente.

**Request:**
```json
{
  "licenseKey": "XXXX-XXXX-XXXX-XXXX",
  "machineId": "unique-machine-identifier"
}
```

**Response:**
```json
{
  "valid": true,
  "expiresAt": "2026-12-31T23:59:59Z",
  "features": ["invoicing", "reports", "export"],
  "company": {
    "id": 123,
    "name": "Mi Empresa SpA"
  }
}
```

**Códigos de Estado:**
- `200` - Licencia válida
- `401` - Licencia inválida o expirada
- `403` - Límite de dispositivos excedido
- `500` - Error del servidor

---

#### `POST /api/licenses/generate` (Admin)

Genera una nueva licencia.

**Request:**
```json
{
  "companyName": "Mi Empresa SpA",
  "email": "contacto@miempresa.cl",
  "duration": 365,
  "maxDevices": 3,
  "features": ["invoicing", "reports"]
}
```

**Response:**
```json
{
  "licenseKey": "ABCD-1234-EFGH-5678",
  "expiresAt": "2026-12-31T23:59:59Z"
}
```

---

#### `POST /api/licenses/revoke` (Admin)

Revoca una licencia.

**Request:**
```json
{
  "licenseKey": "XXXX-XXXX-XXXX-XXXX",
  "reason": "Fraud detected"
}
```

**Response:**
```json
{
  "success": true,
  "message": "License revoked successfully"
}
```

---

### SII Integration

#### `POST /api/sii/enviar-dte`

Envía un DTE al SII.

**Request:**
```json
{
  "xml": "<DTE>...</DTE>",
  "rutEmisor": "76.123.456-7",
  "folio": 1001,
  "tipoDTE": 33
}
```

**Response:**
```json
{
  "trackId": "abc123def456",
  "estado": "PENDING",
  "message": "DTE enviado correctamente"
}
```

---

#### `GET /api/sii/estado/:trackId`

Consulta el estado de un DTE.

**Response:**
```json
{
  "trackId": "abc123def456",
  "estado": "ACCEPTED",
  "fechaProceso": "2025-12-17T10:30:00Z",
  "glosa": "DTE aceptado por el SII"
}
```

**Estados posibles:**
- `PENDING` - En proceso
- `SENT` - Enviado al SII
- `ACCEPTED` - Aceptado
- `REJECTED` - Rechazado
- `ERROR` - Error en procesamiento

---

#### `GET /api/sii/pdf/:folio`

Descarga el PDF timbrado del SII.

**Response:** Archivo PDF (binary)

---

### Administración

#### `GET /api/admin/dashboard`

Obtiene estadísticas del panel de administración.

**Response:**
```json
{
  "licenses": {
    "total": 150,
    "active": 120,
    "expired": 30
  },
  "dte": {
    "sent_today": 450,
    "sent_month": 12000,
    "accepted_rate": 98.5
  },
  "revenue": {
    "monthly": 4500000,
    "annual": 54000000
  }
}
```

---

#### `GET /api/admin/licenses`

Lista todas las licencias.

**Query Parameters:**
- `status`: `active` | `expired` | `all`
- `page`: Número de página
- `limit`: Items por página

**Response:**
```json
{
  "licenses": [
    {
      "id": 1,
      "licenseKey": "XXXX-XXXX-XXXX-XXXX",
      "company": "Mi Empresa SpA",
      "status": "active",
      "expiresAt": "2026-12-31",
      "devices": 2,
      "maxDevices": 3
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "pages": 15
  }
}
```

---

## 🗄️ Base de Datos

### Schema PostgreSQL

#### Tabla: `companies`

```sql
CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  rut VARCHAR(12) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

#### Tabla: `licenses`

```sql
CREATE TABLE licenses (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id),
  license_key VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  expires_at TIMESTAMP NOT NULL,
  max_devices INTEGER DEFAULT 1,
  features JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_licenses_key ON licenses(license_key);
CREATE INDEX idx_licenses_company ON licenses(company_id);
CREATE INDEX idx_licenses_status ON licenses(status);
```

---

#### Tabla: `license_activations`

```sql
CREATE TABLE license_activations (
  id SERIAL PRIMARY KEY,
  license_id INTEGER REFERENCES licenses(id),
  machine_id VARCHAR(255) NOT NULL,
  activated_at TIMESTAMP DEFAULT NOW(),
  last_seen TIMESTAMP DEFAULT NOW(),
  UNIQUE(license_id, machine_id)
);
```

---

#### Tabla: `dte_logs`

```sql
CREATE TABLE dte_logs (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id),
  track_id VARCHAR(100) UNIQUE,
  folio INTEGER NOT NULL,
  tipo_dte INTEGER NOT NULL,
  rut_receptor VARCHAR(12),
  monto_total DECIMAL(15, 2),
  xml_content TEXT,
  estado VARCHAR(20) DEFAULT 'PENDING',
  sii_response JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_dte_logs_track ON dte_logs(track_id);
CREATE INDEX idx_dte_logs_company ON dte_logs(company_id);
CREATE INDEX idx_dte_logs_estado ON dte_logs(estado);
```

---

#### Tabla: `api_keys`

```sql
CREATE TABLE api_keys (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id),
  key_hash VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100),
  permissions JSONB,
  last_used TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  revoked_at TIMESTAMP
);
```

---

## 🔐 Autenticación y Seguridad

### JWT Authentication

**Generación de Token:**
```javascript
const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { 
    companyId: 123,
    licenseKey: 'XXXX-XXXX-XXXX-XXXX'
  },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);
```

**Middleware de Autenticación:**
```javascript
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}
```

---

### Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por ventana
  message: 'Too many requests, please try again later'
});

app.use('/api/', limiter);
```

---

### CORS Configuration

```javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS.split(','),
  credentials: true
}));
```

---

## 🎫 Sistema de Licencias

### Generación de License Key

```javascript
function generateLicenseKey() {
  const segments = [];
  for (let i = 0; i < 4; i++) {
    const segment = Math.random().toString(36).substring(2, 6).toUpperCase();
    segments.push(segment);
  }
  return segments.join('-');
}

// Ejemplo: "A3F2-9K7L-P4M1-X8Q5"
```

---

### Validación de Licencia

```javascript
async function validateLicense(licenseKey, machineId) {
  // 1. Buscar licencia
  const license = await db.query(
    'SELECT * FROM licenses WHERE license_key = $1',
    [licenseKey]
  );

  if (!license) {
    return { valid: false, error: 'License not found' };
  }

  // 2. Verificar expiración
  if (new Date(license.expires_at) < new Date()) {
    return { valid: false, error: 'License expired' };
  }

  // 3. Verificar estado
  if (license.status !== 'active') {
    return { valid: false, error: 'License revoked' };
  }

  // 4. Verificar límite de dispositivos
  const activations = await db.query(
    'SELECT COUNT(*) FROM license_activations WHERE license_id = $1',
    [license.id]
  );

  if (activations.count >= license.max_devices) {
    // Verificar si este machineId ya está activado
    const existing = await db.query(
      'SELECT * FROM license_activations WHERE license_id = $1 AND machine_id = $2',
      [license.id, machineId]
    );

    if (!existing) {
      return { valid: false, error: 'Device limit exceeded' };
    }
  }

  // 5. Registrar/actualizar activación
  await db.query(`
    INSERT INTO license_activations (license_id, machine_id, last_seen)
    VALUES ($1, $2, NOW())
    ON CONFLICT (license_id, machine_id)
    DO UPDATE SET last_seen = NOW()
  `, [license.id, machineId]);

  return {
    valid: true,
    expiresAt: license.expires_at,
    features: license.features
  };
}
```

---

## 🏛️ Integración con SII

### ChileAPI Service

```javascript
const axios = require('axios');

class ChileAPIService {
  constructor() {
    this.baseURL = process.env.CHILEAPI_URL;
    this.apiKey = process.env.CHILEAPI_KEY;
  }

  async enviarDTE(xml, rutEmisor, folio, tipoDTE) {
    try {
      const response = await axios.post(
        `${this.baseURL}/dte/enviar`,
        {
          xml,
          rutEmisor,
          folio,
          tipoDTE
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        trackId: response.data.trackId,
        estado: 'SENT'
      };
    } catch (error) {
      console.error('Error enviando DTE:', error);
      throw error;
    }
  }

  async consultarEstado(trackId) {
    const response = await axios.get(
      `${this.baseURL}/dte/estado/${trackId}`,
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      }
    );

    return response.data;
  }

  async descargarPDF(folio, rutEmisor) {
    const response = await axios.get(
      `${this.baseURL}/dte/pdf/${folio}`,
      {
        params: { rutEmisor },
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        },
        responseType: 'arraybuffer'
      }
    );

    return response.data;
  }
}
```

---

## ⏰ Cron Jobs

### Procesamiento de DTEs Pendientes

```javascript
const cron = require('node-cron');

// Cada hora
cron.schedule('0 * * * *', async () => {
  console.log('Procesando DTEs pendientes...');

  const pendingDTEs = await db.query(`
    SELECT * FROM dte_logs
    WHERE estado = 'PENDING'
    AND created_at > NOW() - INTERVAL '24 hours'
  `);

  for (const dte of pendingDTEs.rows) {
    try {
      const result = await chileAPIService.consultarEstado(dte.track_id);
      
      await db.query(`
        UPDATE dte_logs
        SET estado = $1, sii_response = $2, updated_at = NOW()
        WHERE id = $3
      `, [result.estado, JSON.stringify(result), dte.id]);
    } catch (error) {
      console.error(`Error procesando DTE ${dte.id}:`, error);
    }
  }
});
```

---

### Limpieza de Logs Antiguos

```javascript
// Diario a las 3 AM
cron.schedule('0 3 * * *', async () => {
  console.log('Limpiando logs antiguos...');

  await db.query(`
    DELETE FROM dte_logs
    WHERE created_at < NOW() - INTERVAL '2 years'
  `);
});
```

---

## 🚀 Deployment

### Railway (Recomendado)

**1. Crear proyecto en Railway:**
```bash
railway login
railway init
```

**2. Agregar PostgreSQL:**
```bash
railway add postgresql
```

**3. Configurar variables de entorno:**
```bash
railway variables set JWT_SECRET=your-secret-key
railway variables set CHILEAPI_URL=https://api.chileapi.cl
railway variables set CHILEAPI_KEY=your-api-key
```

**4. Deploy:**
```bash
railway up
```

---

### Heroku (Alternativa)

**1. Crear app:**
```bash
heroku create sistema-facturacion-api
```

**2. Agregar PostgreSQL:**
```bash
heroku addons:create heroku-postgresql:hobby-dev
```

**3. Deploy:**
```bash
git push heroku main
```

---

### Docker (Opcional)

**Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "src/index.js"]
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/facturacion
      - JWT_SECRET=your-secret
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=facturacion
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

## 📊 Monitoreo

### Logging con Winston

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

---

### Health Check

```javascript
app.get('/health', async (req, res) => {
  try {
    // Verificar DB
    await db.query('SELECT 1');
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});
```

---

## 🗺️ Roadmap

### Fase 1: Infraestructura (2 semanas)
- [x] Servidor Express básico
- [ ] Base de datos PostgreSQL
- [ ] Migraciones
- [ ] Autenticación JWT
- [ ] Logging y monitoreo

### Fase 2: Sistema de Licencias (1 semana)
- [ ] Endpoints de validación
- [ ] Generación de licencias
- [ ] Panel de administración básico

### Fase 3: Integración SII (2 semanas)
- [ ] Integración con ChileAPI
- [ ] Endpoints de envío DTE
- [ ] Consulta de estado
- [ ] Descarga de PDFs

### Fase 4: Producción (1 semana)
- [ ] Testing completo
- [ ] Deployment en Railway
- [ ] Documentación de API
- [ ] Monitoreo y alertas

---

## 📚 Referencias

- [Express.js Documentation](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Railway Documentation](https://docs.railway.app/)
- [JWT Best Practices](https://jwt.io/introduction)

---

**Última actualización:** 17 de Diciembre, 2025  
**Versión:** 0.1.0 (En Desarrollo)
