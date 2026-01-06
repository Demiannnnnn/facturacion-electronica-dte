# 🏛️ Integración con SII v2.0

**Versión:** 2.0.0  
**Última actualización:** Enero 2026

---

## 📋 Resumen

Integración completa con el Servicio de Impuestos Internos de Chile para:
- Solicitud y timbraje de folios (CAF)
- Envío de DTEs
- Consulta de estados
- Validación de RUTs

---

## 🔗 Endpoints SII

### Ambientes

```javascript
const SII_ENDPOINTS = {
  CERTIFICACION: {
    base: 'https://maullin.sii.cl/DTEWS',
    wsdl: {
      folios: '/QueryEstUp.jws?WSDL',
      dtes: '/dte/EnvioDTE?WSDL',
      consulta: '/ConsultaEstadoDTE?WSDL'
    }
  },
  
  PRODUCCION: {
    base: 'https://palena.sii.cl/DTEWS',
    wsdl: {
      folios: '/QueryEstUp.jws?WSDL',
      dtes: '/dte/EnvioDTE?WSDL',
      consulta: '/ConsultaEstadoDTE?WSDL'
    }
  }
};
```

---

## 🔐 Autenticación

### 1. Obtener Token

```javascript
// Flujo de autenticación SII
const autenticarSII = async (rutEmisor, certificado) => {
  // 1. Solicitar semilla
  const soapClient = await soap.createClientAsync(SII_ENDPOINTS.PRODUCCION.base + '/CrSeed.jws?WSDL');
  const [seedResult] = await soapClient.getSeedAsync();
  const seed = seedResult.return.seed;
  
  // 2. Firmar semilla con certificado digital
  const seedFirmada = firmarConCertificado(seed, certificado);
  
  // 3. Obtener token
  const [tokenResult] = await soapClient.getTokenAsync({
    pszXml: seedFirmada
  });
  
  const token = tokenResult.return.token;
  return token;
};
```

---

## 📑 Solicitud de Folios (CAF)

```javascript
const solicitarFolios = async (contador, cliente, tipoDocumento, cantidad) => {
  // 1. Autenticar
  const token = await autenticarSII(cliente.rut, contador.certificado);
  
  // 2. Construir XML de solicitud
  const xmlSolicitud = `
    <?xml version="1.0"?>
    <SOLICITUD_FOLIOS version="1.0">
      <CARATULA>
        <RUT_EMISOR>${cliente.rut}-${cliente.dv}</RUT_EMISOR>
        <RUT_ENVIA>${contador.rut}-${contador.dv}</RUT_ENVIA>
        <TIPO_DOCTO>${tipoDocumento}</TIPO_DOCTO>
        <CANTIDAD>${cantidad}</CANTIDAD>
      </CARATULA>
    </SOLICITUD_FOLIOS>
  `;
  
  // 3. Firmar solicitud
  const xmlFirmado = firmarXML(xmlSolicitud, contador.certificado);
  
  // 4. Enviar al SII
  const soapClient = await soap.createClientAsync(SII_ENDPOINTS.PRODUCCION.wsdl.folios);
  const [result] = await soapClient.solicitarFoliosAsync({
    token,
    xml: xmlFirmado
  });
  
  // 5. Procesar respuesta (CAF)
  const caf = result.return.caf; // XML con rango de folios autorizados
  
  // 6. Guardar en BD
  await db('folios').insert({
    contador_id: contador.id,
    cliente_id: cliente.id,
    tipo_documento: tipoDocumento,
    folio_desde: extraerFolioDesde(caf),
    folio_hasta: extraerFolioHasta(caf),
    folio_actual: extraerFolioDesde(caf),
    caf_xml: caf,
    caf_fecha_autorizacion: new Date(),
    estado: 'ACTIVO'
  });
  
  return caf;
};
```

---

## 📤 Envío de DTEs

```javascript
const enviarDTEAlSII = async (dte, contador) => {
  try {
    // 1. Validar estructura
    await validarEstructuraXML(dte.xml_firmado);
    
    // 2. Autenticar
    const token = await autenticarSII(contador.rut, contador.certificado);
    
    // 3. Construir EnvioDTE (envoltorio)
    const envioDTE = `
      <?xml version="1.0" encoding="ISO-8859-1"?>
      <EnvioDTE xmlns="http://www.sii.cl/SiiDte" version="1.0">
        <SetDTE ID="SetDoc">
          <Caratula version="1.0">
            <RutEmisor>${dte.emisor_rut}-${dte.emisor_dv}</RutEmisor>
            <RutEnvia>${contador.rut}-${contador.dv}</RutEnvia>
            <RutReceptor>${dte.receptor_rut}-${dte.receptor_dv}</RutReceptor>
            <FchResol>${contador.fecha_resolucion_sii}</FchResol>
            <NroResol>${contador.numero_resolucion_sii}</NroResol>
            <TmstFirmaEnv>${new Date().toISOString()}</TmstFirmaEnv>
            <SubTotDTE>
              <TpoDTE>${dte.tipo_documento}</TpoDTE>
              <NroDTE>1</NroDTE>
            </SubTotDTE>
          </Caratula>
          ${dte.xml_firmado}
        </SetDTE>
      </EnvioDTE>
    `;
    
    // 4. Firmar envío completo
    const envioDTEFirmado = firmarXML(envioDTE, contador.certificado);
    
    // 5. Enviar vía SOAP
    const soapClient = await soap.createClientAsync(SII_ENDPOINTS.PRODUCCION.wsdl.dtes);
    const [result] = await soapClient.enviarDTEAsync({
      token,
      archivo: Buffer.from(envioDTEFirmado).toString('base64')
    });
    
    // 6. Procesar respuesta
    const trackId = result.return.trackId;
    const estado = result.return.estado; // 0 = OK, -1 = Error
    
    if (estado === '0') {
      // Actualizar BD
      await db('dtes').where({ id: dte.id }).update({
        estado: 'ENVIADO_SII',
        sii_track_id: trackId,
        enviado_sii_at: new Date(),
        sii_respuesta: JSON.stringify(result.return)
      });
      
      return { success: true, trackId };
    } else {
      throw new Error(result.return.mensaje);
    }
    
  } catch (error) {
    // Log y actualizar estado de error
    await db('dtes').where({ id: dte.id }).update({
      estado: 'ERROR_SII',
      sii_error: error.message
    });
    
    throw error;
  }
};
```

---

## 🔍 Consulta de Estado

```javascript
const consultarEstadoDTE = async (trackId, contador) => {
  // 1. Autenticar
  const token = await autenticarSII(contador.rut, contador.certificado);
  
  // 2. Consultar
  const soapClient = await soap.createClientAsync(SII_ENDPOINTS.PRODUCCION.wsdl.consulta);
  const [result] = await soapClient.consultarEstadoDTEAsync({
    token,
    trackId
  });
  
  // 3. Parsear respuesta
  const estadoSII = result.return.estado; // ACEPTADO, RECHAZADO, REPARO, etc.
  const glosaEstado = result.return.glosaEstado;
  
  return {
    estado: estadoSII,
    glosa: glosaEstado,
    detalle: result.return
  };
};

// Worker que consulta periódicamente
const workerConsultaEstados = async () => {
  const dtesEnviados = await db('dtes')
    .where('estado', 'ENVIADO_SII')
    .where('enviado_sii_at', '>', db.raw("NOW() - INTERVAL '7 days'"));
  
  for (const dte of dtesEnviados) {
    try {
      const estado = await consultarEstadoDTE(dte.sii_track_id, dte.contador);
      
      if (estado.estado === 'ACEPTADO') {
        await db('dtes').where({ id: dte.id }).update({
          estado: 'ACEPTADO_SII',
          aceptado_sii_at: new Date(),
          sii_respuesta: JSON.stringify(estado.detalle)
        });
        
        // Generar PDF con timbre
        await generarPDFConTimbre(dte.id, estado.detalle.timbre);
        
        // Notificar cliente
        await notificarCliente(dte.cliente_id, 'DTE_ACEPTADO', {
          folio: dte.folio,
          tipo: dte.tipo_documento
        });
      } else if (estado.estado === 'RECHAZADO') {
        await db('dtes').where({ id: dte.id }).update({
          estado: 'RECHAZADO_SII',
          sii_error: estado.glosa
        });
        
        // Notificar contador
        await notificarContador(dte.contador_id, 'DTE_RECHAZADO', {
          folio: dte.folio,
          error: estado.glosa
        });
      }
      
    } catch (error) {
      console.error(`Error consultando estado DTE ${dte.id}:`, error);
    }
    
    // Rate limiting: esperar 2 segundos entre consultas
    await sleep(2000);
  }
};

// Ejecutar cada 5 minutos
setInterval(workerConsultaEstados, 5 * 60 * 1000);
```

---

## 🔏 Firma Digital

```javascript
const firmarXML = (xml, certificado) => {
  const { forge } = require('node-forge');
  
  // 1. Cargar certificado .pfx
  const p12Asn1 = forge.asn1.fromDer(certificado.pfx_data);
  const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, certificado.password);
  
  // 2. Extraer clave privada y certificado
  const keyBag = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[forge.pki.oids.pkcs8ShroudedKeyBag][0];
  const privateKey = keyBag.key;
  
  const certBag = p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag][0];
  const cert = certBag.cert;
  
  // 3. Firmar XML según estándar XMLDSig
  const xmldsig = require('xmldsigjs');
  
  const signedXml = xmldsig.sign(xml, {
    key: privateKey,
    cert: cert,
    algorithm: 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha1',
    references: [
      { uri: '', transforms: ['enveloped'] }
    ]
  });
  
  return signedXml;
};
```

---

## ⚡ Optimizaciones

### Circuit Breaker

```javascript
const CircuitBreaker = require('opossum');

const enviarDTEConCircuitBreaker = new CircuitBreaker(enviarDTEAlSII, {
  timeout: 30000, // 30 segundos
  errorThresholdPercentage: 50,
  resetTimeout: 60000 // 1 minuto
});

enviarDTEConCircuitBreaker.fallback(() => {
  // Si SII está caído, encolar para reintentar después
  return { success: false, mensaje: 'SII temporalmente no disponible' };
});
```

### Retry con Exponential Backoff

```javascript
const retry = require('async-retry');

const enviarConRetry = async (dte, contador) => {
  return await retry(
    async (bail) => {
      try {
        return await enviarDTEAlSII(dte, contador);
      } catch (error) {
        if (error.code === 'CERTIFICADO_INVALIDO') {
          // Error no recuperable
          bail(error);
        }
        // Errores recuperables se reintentarán
        throw error;
      }
    },
    {
      retries: 5,
      factor: 2,
      minTimeout: 1000,
      maxTimeout: 60000
    }
  );
};
```

---

## 📊 Monitoreo SII

```javascript
const monitorearSalud SII = async () => {
  try {
    const soapClient = await soap.createClientAsync(SII_ENDPOINTS.PRODUCCION.base + '/QueryEstUp.jws?WSDL');
    const [result] = await soapClient.getEstadoAsync();
    
    const estado = result.return.estado; // 'UP' o 'DOWN'
    
    // Registrar métrica
    prometheus.gauge('sii_disponibilidad').set(estado === 'UP' ? 1 : 0);
    
    if (estado === 'DOWN') {
      // Alertar equipo
      await enviarAlerta('SII caído', 'CRITICO');
    }
    
  } catch (error) {
    prometheus.gauge('sii_disponibilidad').set(0);
  }
};

// Verificar cada 5 minutos
setInterval(monitorearSaludSII, 5 * 60 * 1000);
```

---

**Próximo documento:** [09-SINCRONIZACION.md](09-SINCRONIZACION.md)
