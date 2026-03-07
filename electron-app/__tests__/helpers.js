/** 
 * Helpers y utilidades para tests
 */

import tokenStore from '../src/main/utils/tokenStore.js';

/**
 * Espera un tiempo determinado (útil para tests asíncronos)
 */
export const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Verifica si un endpoint está disponible
 */
export async function isAPIAvailable(url, timeout = 3000) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' }
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Obtiene el token de autenticación actual
 */
export function getAuthToken() {
  return tokenStore.getAccessToken();
}

/**
 * Verifica si hay un token de autenticación disponible
 */
export function isAuthenticated() {
  const token = getAuthToken();
  return token !== null && token !== undefined && token !== '';
}

/**
 * Mock de cliente para tests
 */
export const mockCliente = {
  rut: '12345678-9',
  razonSocial: 'Test Cliente S.A.',
  nombreFantasia: 'Test Cliente',
  giro: 'Servicios de Testing',
  direccion: 'Calle Test 123',
  region: 'Región Metropolitana',
  comuna: 'Santiago',
  ciudad: 'Santiago',
  telefono: '+56912345678',
  email: 'test@testcliente.cl',
  tipoDocumento: 'rut_empresa',
  condicionPago: 'contado',
  diasCredito: 0,
  limiteCredito: 0,
  descuentoAutomatico: 0
};

/**
 * Mock de producto para tests
 */
export const mockProducto = {
  codigo: 'TEST-001',
  nombre: 'Producto de Prueba',
  descripcion: 'Producto para testing',
  precio: 10000,
  stock: 100,
  categoria: 'Test',
  unidad: 'UN'
};

/**
 * Mock de factura para tests
 */
export const mockFactura = {
  tipo: 33, // Factura electrónica
  folio: 1,
  fecha: new Date().toISOString(),
  clienteRut: '12345678-9',
  clienteRazonSocial: 'Test Cliente',
  items: [
    {
      nombre: 'Producto Test',
      cantidad: 1,
      precio: 10000,
      descuento: 0
    }
  ],
  neto: 10000,
  iva: 1900,
  total: 11900
};

/**
 * Genera un RUT aleatorio válido para tests
 */
export function generarRutTest() {
  const rutBase = Math.floor(Math.random() * 99999999) + 10000000;
  return `${rutBase}-${calcularDV(rutBase)}`;
}

function calcularDV(rut) {
  let suma = 0;
  let multiplicador = 2;
  
  while (rut > 0) {
    suma += (rut % 10) * multiplicador;
    rut = Math.floor(rut / 10);
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }
  
  const resto = suma % 11;
  const dv = 11 - resto;
  
  if (dv === 11) return '0';
  if (dv === 10) return 'K';
  return String(dv);
}

/**
 * Limpia la base de datos de test (útil para tests de integración)
 */
export async function limpiarDBTest(db) {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Esta función solo debe usarse en ambiente de test');
  }
  
  // Limpiar tablas en orden (respetando foreign keys)
  const tables = [
    'facturas_items',
    'facturas',
    'pagos',
    'productos',
    'clientes',
    'vendedores'
  ];
  
  for (const table of tables) {
    try {
      db.prepare(`DELETE FROM ${table}`).run();
    } catch (error) {
      console.warn(`No se pudo limpiar tabla ${table}:`, error.message);
    }
  }
}

/**
 * Crea un cliente de test en la base de datos
 */
export function crearClienteTest(db, clienteData = {}) {
  const cliente = { ...mockCliente, ...clienteData };
  
  const stmt = db.prepare(`
    INSERT INTO clientes (
      rut, razon_social, nombre_fantasia, giro, direccion,
      region, comuna, ciudad, telefono, email,
      tipo_documento, condicion_pago, dias_credito,
      limite_credito, descuento_automatico,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const now = new Date().toISOString();
  
  const result = stmt.run(
    cliente.rut,
    cliente.razonSocial,
    cliente.nombreFantasia,
    cliente.giro,
    cliente.direccion,
    cliente.region,
    cliente.comuna,
    cliente.ciudad,
    cliente.telefono,
    cliente.email,
    cliente.tipoDocumento,
    cliente.condicionPago,
    cliente.diasCredito,
    cliente.limiteCredito,
    cliente.descuentoAutomatico,
    now,
    now
  );
  
  return { id: result.lastInsertRowid, ...cliente };
}

/**
 * Verifica que los campos requeridos estén presentes
 */
export function validarCamposRequeridos(obj, camposRequeridos) {
  const faltantes = [];
  
  for (const campo of camposRequeridos) {
    if (!obj[campo] && obj[campo] !== 0 && obj[campo] !== false) {
      faltantes.push(campo);
    }
  }
  
  return {
    valido: faltantes.length === 0,
    faltantes
  };
}

/**
 * Compara dos objetos ignorando ciertos campos
 */
export function compararObjetos(obj1, obj2, ignorarCampos = []) {
  const keys1 = Object.keys(obj1).filter(k => !ignorarCampos.includes(k));
  const keys2 = Object.keys(obj2).filter(k => !ignorarCampos.includes(k));
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) return false;
  }
  
  return true;
}
