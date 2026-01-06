# 🗄️ Base de Datos v2.0 - Esquema Multi-Tenant

**Versión:** 2.0.0  
**Motor:** PostgreSQL 16.x  
**Última actualización:** Enero 2026

---

## 📐 Principios de Diseño

1. **Multi-Tenancy por Contador:** Cada contador es un tenant con sus datos aislados
2. **Particionamiento:** Tablas grandes particionadas por `tenant_id` y fecha
3. **Auditoría Inmutable:** Todas las operaciones críticas registradas
4. **Optimización de Consultas:** Índices compuestos estratégicos
5. **Integridad Referencial:** Foreign keys estrictas entre entidades

---

## 🏗️ Esquema Completo

### Diagrama ER Simplificado

```
┌──────────────┐
│  contadores  │ (Tenant raíz)
└──────┬───────┘
       │ 1
       │
       │ N
┌──────▼───────┐         ┌─────────────┐
│   clientes   │────────▶│   usuarios  │
└──────┬───────┘         └─────────────┘
       │ 1
       │
       │ N
┌──────▼───────┐
│     dtes     │ (Particionado)
└──────┬───────┘
       │ 1
       │
       │ N
┌──────▼───────┐
│  dtes_items  │
└──────────────┘
```

---

## 📊 Tablas Principales

### 1. `contadores` (Tenants)

```sql
CREATE TABLE contadores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rut VARCHAR(12) UNIQUE NOT NULL,
    dv CHAR(1) NOT NULL,
    razon_social VARCHAR(255) NOT NULL,
    nombre_fantasia VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    direccion TEXT,
    comuna VARCHAR(100),
    region VARCHAR(100),
    giro VARCHAR(255),
    
    -- Plan y límites
    plan VARCHAR(50) NOT NULL DEFAULT 'BASICO', -- BASICO, PRO, ENTERPRISE
    max_clientes INT NOT NULL DEFAULT 50,
    max_dtes_mensuales INT NOT NULL DEFAULT 1000,
    
    -- Certificado digital
    certificado_id UUID REFERENCES certificados_digitales(id),
    
    -- Estado
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO', -- ACTIVO, SUSPENDIDO, CANCELADO
    fecha_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_fin DATE,
    
    -- Metadatos
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    -- Configuración JSON
    configuracion JSONB DEFAULT '{}'::jsonb,
    
    CONSTRAINT chk_rut_valido CHECK (rut ~ '^\d{7,8}$'),
    CONSTRAINT chk_dv_valido CHECK (dv ~ '^[0-9K]$'),
    CONSTRAINT chk_plan_valido CHECK (plan IN ('BASICO', 'PRO', 'ENTERPRISE')),
    CONSTRAINT chk_estado_valido CHECK (estado IN ('ACTIVO', 'SUSPENDIDO', 'CANCELADO'))
);

-- Índices
CREATE INDEX idx_contadores_rut ON contadores(rut);
CREATE INDEX idx_contadores_email ON contadores(email);
CREATE INDEX idx_contadores_estado ON contadores(estado) WHERE deleted_at IS NULL;

-- Trigger de actualización
CREATE TRIGGER trg_contadores_updated_at
    BEFORE UPDATE ON contadores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 2. `clientes` (Empresas de cada Contador)

```sql
CREATE TABLE clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contador_id UUID NOT NULL REFERENCES contadores(id) ON DELETE CASCADE,
    
    -- Datos tributarios
    rut VARCHAR(12) NOT NULL,
    dv CHAR(1) NOT NULL,
    razon_social VARCHAR(255) NOT NULL,
    nombre_fantasia VARCHAR(255),
    giro VARCHAR(255),
    
    -- Contacto
    email VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    direccion TEXT,
    comuna VARCHAR(100),
    region VARCHAR(100),
    
    -- Perfil de emisión
    perfil VARCHAR(20) NOT NULL DEFAULT 'FACTURADOR', -- FACTURADOR, BOLETEADOR, MIXTO
    
    -- Configuración de negocio
    lista_precios VARCHAR(50) DEFAULT 'GENERAL',
    condicion_pago VARCHAR(50),
    dias_credito INT DEFAULT 0,
    limite_credito DECIMAL(15,2) DEFAULT 0,
    descuento_automatico DECIMAL(5,2) DEFAULT 0,
    
    -- Estado
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO', -- ACTIVO, INACTIVO, BLOQUEADO
    
    -- Metadatos
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    -- Configuración específica JSON
    configuracion JSONB DEFAULT '{}'::jsonb,
    
    CONSTRAINT chk_cliente_rut_valido CHECK (rut ~ '^\d{7,8}$'),
    CONSTRAINT chk_cliente_dv_valido CHECK (dv ~ '^[0-9K]$'),
    CONSTRAINT chk_perfil_valido CHECK (perfil IN ('FACTURADOR', 'BOLETEADOR', 'MIXTO')),
    CONSTRAINT chk_cliente_estado_valido CHECK (estado IN ('ACTIVO', 'INACTIVO', 'BLOQUEADO')),
    CONSTRAINT uq_cliente_rut_por_contador UNIQUE(contador_id, rut)
);

-- Índices
CREATE INDEX idx_clientes_contador_id ON clientes(contador_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_clientes_rut ON clientes(rut);
CREATE INDEX idx_clientes_estado ON clientes(estado) WHERE deleted_at IS NULL;
CREATE INDEX idx_clientes_perfil ON clientes(perfil);

-- Trigger de actualización
CREATE TRIGGER trg_clientes_updated_at
    BEFORE UPDATE ON clientes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 3. `usuarios` (Login para Contadores y Clientes)

```sql
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Asociación (solo uno puede estar presente)
    contador_id UUID REFERENCES contadores(id) ON DELETE CASCADE,
    cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
    
    -- Credenciales
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    
    -- Rol y permisos
    rol VARCHAR(50) NOT NULL, -- CONTADOR_ADMIN, CONTADOR_ASISTENTE, CLIENTE_EMISOR, ADMIN_SISTEMA
    permisos JSONB DEFAULT '[]'::jsonb,
    
    -- Multi-Factor Authentication
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret VARCHAR(255),
    
    -- Sesión y tokens
    ultimo_login TIMESTAMPTZ,
    refresh_token_version INT DEFAULT 0, -- Para invalidar tokens
    
    -- Estado
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO', -- ACTIVO, BLOQUEADO, PENDIENTE_VERIFICACION
    email_verificado BOOLEAN DEFAULT FALSE,
    
    -- Metadatos
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    CONSTRAINT chk_usuario_asociacion CHECK (
        (contador_id IS NOT NULL AND cliente_id IS NULL) OR
        (contador_id IS NULL AND cliente_id IS NOT NULL)
    ),
    CONSTRAINT chk_rol_valido CHECK (rol IN (
        'CONTADOR_ADMIN', 'CONTADOR_ASISTENTE', 
        'CLIENTE_EMISOR', 'ADMIN_SISTEMA'
    )),
    CONSTRAINT chk_usuario_estado_valido CHECK (estado IN (
        'ACTIVO', 'BLOQUEADO', 'PENDIENTE_VERIFICACION'
    ))
);

-- Índices
CREATE INDEX idx_usuarios_email ON usuarios(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_usuarios_contador_id ON usuarios(contador_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_usuarios_cliente_id ON usuarios(cliente_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_usuarios_rol ON usuarios(rol);

-- Trigger de actualización
CREATE TRIGGER trg_usuarios_updated_at
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 4. `dtes` (Documentos Tributarios Electrónicos) - PARTICIONADA

```sql
CREATE TABLE dtes (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    contador_id UUID NOT NULL, -- Para particionamiento
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
    
    -- Tipo y folio
    tipo_documento INT NOT NULL, -- 33=Factura, 39=Boleta, 52=Guía, 56=NotaDébito, 61=NotaCrédito
    folio BIGINT NOT NULL,
    
    -- Fechas
    fecha_emision DATE NOT NULL,
    fecha_vencimiento DATE,
    
    -- Receptor (puede ser diferente al cliente, ej: cliente del cliente)
    receptor_rut VARCHAR(12) NOT NULL,
    receptor_dv CHAR(1) NOT NULL,
    receptor_razon_social VARCHAR(255) NOT NULL,
    receptor_direccion TEXT,
    receptor_comuna VARCHAR(100),
    receptor_giro VARCHAR(255),
    
    -- Montos
    subtotal DECIMAL(15,2) NOT NULL,
    descuento_global DECIMAL(15,2) DEFAULT 0,
    descuento_porcentaje DECIMAL(5,2) DEFAULT 0,
    subtotal_neto DECIMAL(15,2) NOT NULL,
    iva DECIMAL(15,2) NOT NULL DEFAULT 0,
    total DECIMAL(15,2) NOT NULL,
    
    -- Exento e impuestos adicionales
    monto_exento DECIMAL(15,2) DEFAULT 0,
    impuestos_adicionales JSONB DEFAULT '[]'::jsonb,
    
    -- Forma de pago
    forma_pago VARCHAR(50), -- CONTADO, CREDITO
    medio_pago VARCHAR(50), -- EFECTIVO, TRANSFERENCIA, CHEQUE, TARJETA
    orden_compra VARCHAR(100),
    
    -- Referencia a otros DTEs (notas de crédito/débito)
    referencia_tipo_doc INT,
    referencia_folio BIGINT,
    referencia_razon VARCHAR(255),
    
    -- XMLs y PDFs
    xml_sin_firmar TEXT,
    xml_firmado TEXT,
    pdf_path VARCHAR(500),
    
    -- Estados
    estado VARCHAR(50) NOT NULL DEFAULT 'BORRADOR', 
    -- BORRADOR, PENDIENTE_SYNC, PENDIENTE_APROBACION, APROBADO, 
    -- ENVIADO_SII, ACEPTADO_SII, RECHAZADO_SII, ANULADO, ERROR_SII
    
    estado_sii VARCHAR(50),
    sii_track_id VARCHAR(100),
    sii_respuesta JSONB,
    sii_error TEXT,
    
    -- Timestamps de flujo
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sincronizado_at TIMESTAMPTZ,
    aprobado_at TIMESTAMPTZ,
    aprobado_por UUID REFERENCES usuarios(id),
    enviado_sii_at TIMESTAMPTZ,
    aceptado_sii_at TIMESTAMPTZ,
    anulado_at TIMESTAMPTZ,
    anulado_por UUID REFERENCES usuarios(id),
    
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Observaciones
    observaciones TEXT,
    
    CONSTRAINT pk_dtes PRIMARY KEY (id, contador_id, fecha_emision),
    CONSTRAINT chk_tipo_documento_valido CHECK (tipo_documento IN (33, 39, 52, 56, 61)),
    CONSTRAINT chk_folio_positivo CHECK (folio > 0),
    CONSTRAINT chk_montos_positivos CHECK (
        subtotal >= 0 AND iva >= 0 AND total >= 0
    ),
    CONSTRAINT chk_estado_dte_valido CHECK (estado IN (
        'BORRADOR', 'PENDIENTE_SYNC', 'PENDIENTE_APROBACION', 'APROBADO',
        'ENVIADO_SII', 'ACEPTADO_SII', 'RECHAZADO_SII', 'ANULADO', 'ERROR_SII'
    ))
) PARTITION BY RANGE (fecha_emision);

-- Crear particiones por mes (ejemplo para 2026)
CREATE TABLE dtes_2026_01 PARTITION OF dtes
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE dtes_2026_02 PARTITION OF dtes
    FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
CREATE TABLE dtes_2026_03 PARTITION OF dtes
    FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
-- ... continuar para todos los meses

-- Índices en tabla particionada
CREATE INDEX idx_dtes_contador_cliente ON dtes(contador_id, cliente_id, fecha_emision DESC);
CREATE INDEX idx_dtes_folio ON dtes(contador_id, tipo_documento, folio);
CREATE INDEX idx_dtes_estado ON dtes(estado) WHERE estado != 'ANULADO';
CREATE INDEX idx_dtes_receptor ON dtes(receptor_rut);
CREATE INDEX idx_dtes_sii_track ON dtes(sii_track_id) WHERE sii_track_id IS NOT NULL;
CREATE INDEX idx_dtes_fecha_emision ON dtes(fecha_emision DESC);

-- Trigger de actualización
CREATE TRIGGER trg_dtes_updated_at
    BEFORE UPDATE ON dtes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 5. `dtes_items` (Líneas de detalle de DTEs)

```sql
CREATE TABLE dtes_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dte_id UUID NOT NULL,
    contador_id UUID NOT NULL,
    fecha_emision DATE NOT NULL, -- Para FK con partición
    
    -- Orden
    linea INT NOT NULL,
    
    -- Producto/Servicio
    codigo_interno VARCHAR(100),
    codigo_barra VARCHAR(100),
    nombre VARCHAR(500) NOT NULL,
    descripcion TEXT,
    
    -- Cantidades y precios
    cantidad DECIMAL(10,3) NOT NULL,
    unidad_medida VARCHAR(20) DEFAULT 'UN',
    precio_unitario DECIMAL(15,2) NOT NULL,
    descuento_porcentaje DECIMAL(5,2) DEFAULT 0,
    descuento_monto DECIMAL(15,2) DEFAULT 0,
    
    -- Cálculos
    subtotal DECIMAL(15,2) NOT NULL,
    exento BOOLEAN DEFAULT FALSE,
    
    -- Metadatos
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_dtes_items_dte FOREIGN KEY (dte_id, contador_id, fecha_emision)
        REFERENCES dtes(id, contador_id, fecha_emision)
        ON DELETE CASCADE,
    CONSTRAINT chk_cantidad_positiva CHECK (cantidad > 0),
    CONSTRAINT chk_precio_no_negativo CHECK (precio_unitario >= 0),
    CONSTRAINT chk_subtotal_positivo CHECK (subtotal >= 0)
);

-- Índices
CREATE INDEX idx_dtes_items_dte_id ON dtes_items(dte_id);
CREATE INDEX idx_dtes_items_codigo ON dtes_items(codigo_interno) WHERE codigo_interno IS NOT NULL;
```

### 6. `folios` (Control de folios por Contador y Cliente)

```sql
CREATE TABLE folios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contador_id UUID NOT NULL REFERENCES contadores(id) ON DELETE CASCADE,
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    
    -- Tipo de documento
    tipo_documento INT NOT NULL,
    
    -- Rango de folios
    folio_desde BIGINT NOT NULL,
    folio_hasta BIGINT NOT NULL,
    folio_actual BIGINT NOT NULL,
    
    -- Estado
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO', -- ACTIVO, AGOTADO, ANULADO
    
    -- CAF (Código de Autorización de Folios) del SII
    caf_xml TEXT NOT NULL,
    caf_fecha_autorizacion DATE NOT NULL,
    caf_fecha_vencimiento DATE,
    
    -- Metadatos
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    agotado_at TIMESTAMPTZ,
    
    CONSTRAINT chk_folio_tipo_valido CHECK (tipo_documento IN (33, 39, 52, 56, 61)),
    CONSTRAINT chk_folio_rango_valido CHECK (folio_desde <= folio_hasta),
    CONSTRAINT chk_folio_actual_valido CHECK (folio_actual >= folio_desde AND folio_actual <= folio_hasta),
    CONSTRAINT chk_folio_estado_valido CHECK (estado IN ('ACTIVO', 'AGOTADO', 'ANULADO')),
    CONSTRAINT uq_folio_por_cliente UNIQUE(cliente_id, tipo_documento, folio_desde)
);

-- Índices
CREATE INDEX idx_folios_cliente_tipo ON folios(cliente_id, tipo_documento) WHERE estado = 'ACTIVO';
CREATE INDEX idx_folios_contador_id ON folios(contador_id);
CREATE INDEX idx_folios_vencimiento ON folios(caf_fecha_vencimiento) WHERE estado = 'ACTIVO';

-- Trigger de actualización
CREATE TRIGGER trg_folios_updated_at
    BEFORE UPDATE ON folios
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 7. `productos` (Catálogo por Cliente)

```sql
CREATE TABLE productos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    
    -- Códigos
    codigo_interno VARCHAR(100),
    codigo_barra VARCHAR(100),
    sku VARCHAR(100),
    
    -- Identificación
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(100),
    
    -- Precios
    precio_venta DECIMAL(15,2) NOT NULL,
    precio_costo DECIMAL(15,2),
    
    -- Impuestos
    exento BOOLEAN DEFAULT FALSE,
    iva_incluido BOOLEAN DEFAULT TRUE,
    
    -- Inventario (opcional)
    stock_actual DECIMAL(10,3) DEFAULT 0,
    stock_minimo DECIMAL(10,3) DEFAULT 0,
    unidad_medida VARCHAR(20) DEFAULT 'UN',
    
    -- Estado
    activo BOOLEAN DEFAULT TRUE,
    
    -- Metadatos
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    CONSTRAINT chk_precio_venta_positivo CHECK (precio_venta >= 0),
    CONSTRAINT uq_producto_codigo_interno UNIQUE(cliente_id, codigo_interno)
);

-- Índices
CREATE INDEX idx_productos_cliente_id ON productos(cliente_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_productos_codigo_interno ON productos(codigo_interno) WHERE codigo_interno IS NOT NULL;
CREATE INDEX idx_productos_codigo_barra ON productos(codigo_barra) WHERE codigo_barra IS NOT NULL;
CREATE INDEX idx_productos_nombre ON productos USING gin(to_tsvector('spanish', nombre));

-- Trigger de actualización
CREATE TRIGGER trg_productos_updated_at
    BEFORE UPDATE ON productos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 8. `certificados_digitales` (Certificados PKI para firma)

```sql
CREATE TABLE certificados_digitales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contador_id UUID NOT NULL REFERENCES contadores(id) ON DELETE CASCADE,
    
    -- Datos del certificado
    nombre VARCHAR(255) NOT NULL,
    rut_titular VARCHAR(12) NOT NULL,
    dv_titular CHAR(1) NOT NULL,
    
    -- Archivos (cifrados)
    pfx_data BYTEA NOT NULL, -- Archivo .pfx/.p12 cifrado
    password_hash VARCHAR(255) NOT NULL,
    
    -- Validez
    fecha_emision DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    
    -- Estado
    activo BOOLEAN DEFAULT TRUE,
    revocado BOOLEAN DEFAULT FALSE,
    
    -- Metadatos
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT chk_cert_fechas_validas CHECK (fecha_vencimiento > fecha_emision)
);

-- Índices
CREATE INDEX idx_certificados_contador_id ON certificados_digitales(contador_id) WHERE activo = TRUE;
CREATE INDEX idx_certificados_vencimiento ON certificados_digitales(fecha_vencimiento) WHERE activo = TRUE;

-- Trigger de actualización
CREATE TRIGGER trg_certificados_updated_at
    BEFORE UPDATE ON certificados_digitales
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 9. `invitaciones_clientes` (Para onboarding)

```sql
CREATE TABLE invitaciones_clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contador_id UUID NOT NULL REFERENCES contadores(id) ON DELETE CASCADE,
    
    -- Código de invitación
    codigo VARCHAR(20) UNIQUE NOT NULL,
    
    -- Datos del cliente invitado
    rut VARCHAR(12) NOT NULL,
    dv CHAR(1) NOT NULL,
    razon_social VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    perfil VARCHAR(20) NOT NULL,
    
    -- Configuración inicial
    configuracion JSONB DEFAULT '{}'::jsonb,
    
    -- Estado
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE', -- PENDIENTE, ACEPTADA, EXPIRADA, CANCELADA
    
    -- Fechas
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expira_en TIMESTAMPTZ NOT NULL,
    aceptada_en TIMESTAMPTZ,
    
    CONSTRAINT chk_perfil_invitacion_valido CHECK (perfil IN ('FACTURADOR', 'BOLETEADOR', 'MIXTO')),
    CONSTRAINT chk_estado_invitacion_valido CHECK (estado IN ('PENDIENTE', 'ACEPTADA', 'EXPIRADA', 'CANCELADA'))
);

-- Índices
CREATE INDEX idx_invitaciones_codigo ON invitaciones_clientes(codigo) WHERE estado = 'PENDIENTE';
CREATE INDEX idx_invitaciones_contador ON invitaciones_clientes(contador_id);
CREATE INDEX idx_invitaciones_email ON invitaciones_clientes(email);
```

### 10. `sync_log` (Log de sincronización)

```sql
CREATE TABLE sync_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    
    -- Operación
    operacion VARCHAR(20) NOT NULL, -- CREATE, UPDATE, DELETE
    entidad VARCHAR(50) NOT NULL, -- DTE, PRODUCTO, etc.
    entidad_id UUID NOT NULL,
    
    -- Datos
    payload JSONB NOT NULL,
    
    -- Estado
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE', -- PENDIENTE, COMPLETADO, ERROR
    intentos INT DEFAULT 0,
    ultimo_error TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    CONSTRAINT chk_sync_operacion_valida CHECK (operacion IN ('CREATE', 'UPDATE', 'DELETE')),
    CONSTRAINT chk_sync_estado_valido CHECK (estado IN ('PENDIENTE', 'COMPLETADO', 'ERROR'))
);

-- Índices
CREATE INDEX idx_sync_log_cliente ON sync_log(cliente_id, created_at DESC);
CREATE INDEX idx_sync_log_estado ON sync_log(estado) WHERE estado = 'PENDIENTE';
CREATE INDEX idx_sync_log_entidad ON sync_log(entidad, entidad_id);
```

### 11. `audit_log` (Auditoría inmutable)

```sql
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Contexto
    tenant_id UUID NOT NULL, -- contador_id
    usuario_id UUID NOT NULL,
    
    -- Operación
    accion VARCHAR(50) NOT NULL, -- CREATE, UPDATE, DELETE, APPROVE, SEND_SII, etc.
    entidad VARCHAR(50) NOT NULL,
    entidad_id UUID,
    
    -- Datos antes/después
    datos_antes JSONB,
    datos_despues JSONB,
    
    -- Metadata de request
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamp
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_audit_tenant_timestamp ON audit_log(tenant_id, timestamp DESC);
CREATE INDEX idx_audit_usuario ON audit_log(usuario_id, timestamp DESC);
CREATE INDEX idx_audit_entidad ON audit_log(entidad, entidad_id);
CREATE INDEX idx_audit_timestamp ON audit_log(timestamp DESC);
```

---

## 🔧 Funciones y Triggers Auxiliares

### Función para actualizar `updated_at`

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Función para auditoría automática

```sql
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_log (
        tenant_id,
        usuario_id,
        accion,
        entidad,
        entidad_id,
        datos_antes,
        datos_despues
    ) VALUES (
        COALESCE(
            current_setting('app.current_tenant_id', TRUE)::UUID,
            '00000000-0000-0000-0000-000000000000'::UUID
        ),
        COALESCE(
            current_setting('app.current_user_id', TRUE)::UUID,
            '00000000-0000-0000-0000-000000000000'::UUID
        ),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD) END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar a tablas críticas
CREATE TRIGGER audit_dtes
    AFTER INSERT OR UPDATE OR DELETE ON dtes
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_folios
    AFTER INSERT OR UPDATE OR DELETE ON folios
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
```

### Función para obtener siguiente folio

```sql
CREATE OR REPLACE FUNCTION obtener_siguiente_folio(
    p_cliente_id UUID,
    p_tipo_documento INT
) RETURNS BIGINT AS $$
DECLARE
    v_folio BIGINT;
    v_folio_id UUID;
BEGIN
    -- Buscar folio activo con espacio disponible
    SELECT id, folio_actual + 1 INTO v_folio_id, v_folio
    FROM folios
    WHERE cliente_id = p_cliente_id
      AND tipo_documento = p_tipo_documento
      AND estado = 'ACTIVO'
      AND folio_actual < folio_hasta
      AND (caf_fecha_vencimiento IS NULL OR caf_fecha_vencimiento > CURRENT_DATE)
    ORDER BY folio_actual ASC
    LIMIT 1
    FOR UPDATE;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'No hay folios disponibles para el tipo de documento %', p_tipo_documento;
    END IF;
    
    -- Actualizar folio actual
    UPDATE folios
    SET folio_actual = v_folio,
        updated_at = NOW()
    WHERE id = v_folio_id;
    
    -- Si se agotó el rango, marcar como agotado
    IF v_folio >= (SELECT folio_hasta FROM folios WHERE id = v_folio_id) THEN
        UPDATE folios
        SET estado = 'AGOTADO',
            agotado_at = NOW()
        WHERE id = v_folio_id;
    END IF;
    
    RETURN v_folio;
END;
$$ LANGUAGE plpgsql;
```

---

## 📈 Mantenimiento y Optimización

### Vacuum y Analyze Automático

```sql
-- Configurar autovacuum agresivo para tablas de alta escritura
ALTER TABLE dtes SET (
    autovacuum_vacuum_scale_factor = 0.05,
    autovacuum_analyze_scale_factor = 0.02
);

ALTER TABLE audit_log SET (
    autovacuum_vacuum_scale_factor = 0.02,
    autovacuum_analyze_scale_factor = 0.01
);
```

### Creación Automática de Particiones

```sql
-- Script para crear particiones futuras (ejecutar mensualmente)
CREATE OR REPLACE FUNCTION crear_particiones_futuras(meses_adelante INT DEFAULT 3)
RETURNS VOID AS $$
DECLARE
    fecha_inicio DATE;
    fecha_fin DATE;
    nombre_particion TEXT;
    i INT;
BEGIN
    FOR i IN 1..meses_adelante LOOP
        fecha_inicio := DATE_TRUNC('month', CURRENT_DATE + (i || ' months')::INTERVAL);
        fecha_fin := fecha_inicio + '1 month'::INTERVAL;
        nombre_particion := 'dtes_' || TO_CHAR(fecha_inicio, 'YYYY_MM');
        
        -- Verificar si ya existe
        IF NOT EXISTS (
            SELECT 1 FROM pg_tables 
            WHERE tablename = nombre_particion
        ) THEN
            EXECUTE format(
                'CREATE TABLE %I PARTITION OF dtes FOR VALUES FROM (%L) TO (%L)',
                nombre_particion,
                fecha_inicio,
                fecha_fin
            );
            RAISE NOTICE 'Partición % creada', nombre_particion;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Programar con pg_cron (extensión)
-- SELECT cron.schedule('crear-particiones', '0 0 1 * *', 'SELECT crear_particiones_futuras(3)');
```

### Archivado de Datos Antiguos

```sql
-- Mover DTEs antiguos a tabla de archivo (> 2 años)
CREATE TABLE dtes_archivo (LIKE dtes INCLUDING ALL);

CREATE OR REPLACE FUNCTION archivar_dtes_antiguos()
RETURNS INT AS $$
DECLARE
    registros_movidos INT;
BEGIN
    WITH moved AS (
        DELETE FROM dtes
        WHERE fecha_emision < CURRENT_DATE - INTERVAL '2 years'
          AND estado IN ('ACEPTADO_SII', 'ANULADO')
        RETURNING *
    )
    INSERT INTO dtes_archivo SELECT * FROM moved;
    
    GET DIAGNOSTICS registros_movidos = ROW_COUNT;
    RETURN registros_movidos;
END;
$$ LANGUAGE plpgsql;

-- Ejecutar anualmente
```

---

## 🔐 Seguridad de Datos

### Row-Level Security (RLS)

```sql
-- Habilitar RLS en tablas multi-tenant
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dtes ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

-- Política: Contadores solo ven sus datos
CREATE POLICY contador_isolation ON clientes
    USING (contador_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY contador_isolation ON dtes
    USING (contador_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY contador_isolation ON productos
    USING (
        cliente_id IN (
            SELECT id FROM clientes 
            WHERE contador_id = current_setting('app.current_tenant_id')::UUID
        )
    );

-- Política: Clientes solo ven sus datos
CREATE POLICY cliente_isolation ON dtes
    USING (
        cliente_id = current_setting('app.current_cliente_id')::UUID
        AND contador_id = current_setting('app.current_tenant_id')::UUID
    );
```

### Cifrado de Columnas Sensibles

```sql
-- Usar pgcrypto para cifrar datos sensibles
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Ejemplo: cifrar password de certificado
UPDATE certificados_digitales
SET password_hash = crypt(password, gen_salt('bf', 12));

-- Verificar
SELECT id FROM certificados_digitales
WHERE password_hash = crypt('password_ingresado', password_hash);
```

---

## 📊 Consultas Útiles

### Dashboard Contador: Resumen de todos los clientes

```sql
SELECT 
    c.id,
    c.razon_social,
    c.perfil,
    COUNT(DISTINCT d.id) FILTER (WHERE d.fecha_emision >= CURRENT_DATE - INTERVAL '30 days') as dtes_ultimo_mes,
    SUM(d.total) FILTER (WHERE d.fecha_emision >= CURRENT_DATE - INTERVAL '30 days') as facturacion_ultimo_mes,
    COUNT(DISTINCT d.id) FILTER (WHERE d.estado = 'PENDIENTE_APROBACION') as pendientes_aprobacion,
    MAX(d.fecha_emision) as ultima_emision
FROM clientes c
LEFT JOIN dtes d ON d.cliente_id = c.id
WHERE c.contador_id = $1
  AND c.deleted_at IS NULL
GROUP BY c.id, c.razon_social, c.perfil
ORDER BY pendientes_aprobacion DESC, ultima_emision DESC;
```

### DTEs pendientes de aprobación

```sql
SELECT 
    d.id,
    d.tipo_documento,
    d.folio,
    d.fecha_emision,
    c.razon_social as cliente,
    d.receptor_razon_social,
    d.total,
    d.created_at,
    EXTRACT(EPOCH FROM (NOW() - d.created_at))/3600 as horas_pendiente
FROM dtes d
INNER JOIN clientes c ON c.id = d.cliente_id
WHERE d.contador_id = $1
  AND d.estado = 'PENDIENTE_APROBACION'
ORDER BY d.created_at ASC;
```

### Verificar folios próximos a agotarse

```sql
SELECT 
    c.razon_social,
    f.tipo_documento,
    f.folio_desde,
    f.folio_hasta,
    f.folio_actual,
    (f.folio_hasta - f.folio_actual) as folios_disponibles,
    ROUND(((f.folio_actual - f.folio_desde)::NUMERIC / (f.folio_hasta - f.folio_desde)::NUMERIC * 100), 2) as porcentaje_usado
FROM folios f
INNER JOIN clientes c ON c.id = f.cliente_id
WHERE f.contador_id = $1
  AND f.estado = 'ACTIVO'
  AND (f.folio_hasta - f.folio_actual) < 100
ORDER BY folios_disponibles ASC;
```

---

**Última actualización:** 5 de Enero 2026  
**Próximo documento:** [04-ROL_CONTADOR.md](04-ROL_CONTADOR.md)
