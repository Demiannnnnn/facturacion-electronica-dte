/**
 * Helper de Autenticación para Tests
 * Maneja registro, login y tokens JWT
 */

import authApi from '../src/main/services/api/auth.js';
import tokenStore from '../src/main/utils/tokenStore.js';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';

/**
 * Calcula el dígito verificador de un RUT usando módulo 11
 * @param {string|number} rutNumber - Número de RUT sin dígito verificador
 * @returns {string} Dígito verificador (0-9 o K)
 */
function calcularDigitoVerificador(rutNumber) {
  const rut = String(rutNumber);
  let suma = 0;
  let multiplicador = 2;

  // Recorrer el RUT de derecha a izquierda
  for (let i = rut.length - 1; i >= 0; i--) {
    suma += parseInt(rut[i]) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }

  const resto = suma % 11;
  const digito = 11 - resto;

  if (digito === 11) return '0';
  if (digito === 10) return 'K';
  return String(digito);
}

/**
 * Genera un RUT chileno válido aleatorio
 * @returns {string} RUT con formato XXXXXXXX-X
 */
function generarRutAleatorio() {
  // Generar número entre 10.000.000 y 25.999.999 (rangos comunes de RUT)
  const numeroBase = Math.floor(Math.random() * 16000000) + 10000000;
  const digitoVerificador = calcularDigitoVerificador(numeroBase);
  return `${numeroBase}-${digitoVerificador}`;
}

/**
 * Genera un email aleatorio con formato xxxxxx@gmail.com
 * @returns {string} Email aleatorio
 */
function generarEmailAleatorio() {
  const caracteres = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const longitud = 8 + Math.floor(Math.random() * 4); // 8-11 caracteres
  let username = '';
  
  for (let i = 0; i < longitud; i++) {
    username += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  
  return `${username}@gmail.com`;
}

/**
 * Usuario de prueba para tests
 * Se genera con RUT y email aleatorios para evitar conflictos
 */
export const testUser = {
  email: generarEmailAleatorio(),
  password: 'TestPassword123!',
  rut: generarRutAleatorio(),
  name: 'Usuario de Prueba'
};

// Log del usuario generado (para debugging)
console.log('👤 Usuario de prueba generado:');
console.log(`   Email: ${testUser.email}`);
console.log(`   RUT: ${testUser.rut}`);

/**
 * Verifica si la API está disponible
 */
export async function isAPIAvailable() {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000)
    });
    return response.status < 500;
  } catch (error) {
    return false;
  }
}

/**
 * Registra el usuario de prueba
 * Si ya existe, continúa sin error
 */
export async function registerTestUser() {
  try {
    const result = await authApi.register(
      testUser.email,
      testUser.password,
      testUser.rut,
      testUser.name
    );

    if (result.success) {
      console.log('✅ Usuario de prueba registrado');
      return { success: true };
    }

    // Si el error es que ya existe, considerar como éxito
    const errorMsg = result.error?.toLowerCase() || '';
    if (errorMsg.includes('ya está registrado') || 
        errorMsg.includes('already exists') || 
        errorMsg.includes('ya existe')) {
      console.log('✅ Usuario de prueba ya existe');
      return { success: true };
    }

    return result;
  } catch (error) {
    // Si el error es que ya existe, es ok
    const errorMsg = error.message?.toLowerCase() || '';
    if (errorMsg.includes('ya está registrado') || 
        errorMsg.includes('already exists') || 
        errorMsg.includes('ya existe')) {
      console.log('✅ Usuario de prueba ya existe');
      return { success: true };
    }
    
    console.error('❌ Error registrando usuario de prueba:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Hace login y obtiene el JWT token
 */
export async function loginTestUser() {
  try {
    const result = await authApi.login(testUser.email, testUser.password);

    // Manejar diferent formats de respuesta del backend
    let token = null;
    let user = null;

    // Formato 1: { accessToken, user }
    if (result.accessToken) {
      token = result.accessToken;
      user = result.user;
    }
    // Formato 2: { success: true, data: { token, user } }
    else if (result.success && result.data && result.data.token) {
      token = result.data.token;
      user = result.data.user;
    }
    // Formato 3: { token, user }
    else if (result.token) {
      token = result.token;
      user = result.user;
    }

    if (token) {
      // Guardar token en el store
      tokenStore.setAccessToken(token);
      
      console.log('✅ Login exitoso - Token obtenido');
      console.log('🔑 Token disponible:', token ? 'SÍ' : 'NO');
      
      return { 
        success: true, 
        token: token,
        user: user 
      };
    }

    // Si result.success está definido y es false
    if (result.success === false) {
      console.error('❌ Login falló:', result.error);
      return { success: false, error: result.error || 'Login failed' };
    }

    // Respuesta inesperada
    console.error('❌ Respuesta inesperada del login:', result);
    return { success: false, error: 'Respuesta inesperada del servidor' };
  } catch (error) {
    console.error('❌ Error en login:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Limpia la autenticación
 */
export function clearAuth() {
  tokenStore.setAccessToken(null);
  console.log('🧹 Autenticación limpiada');
}

/**
 * Setup completo de autenticación para tests
 * Registra usuario si no existe y hace login
 */
export async function setupTestAuth() {
  console.log('🔧 Configurando autenticación de prueba...');
  
  // Verificar que la API esté disponible
  const available = await isAPIAvailable();
  if (!available) {
    console.log('⚠️  API no disponible - tests se ejecutarán sin autenticación');
    return { success: false, reason: 'API_NOT_AVAILABLE' };
  }

  // Registrar usuario de prueba
  const registerResult = await registerTestUser();
  if (!registerResult.success) {
    console.log('⚠️  No se pudo registrar usuario de prueba');
    return { success: false, reason: 'REGISTRATION_FAILED' };
  }

  // Hacer login
  const loginResult = await loginTestUser();
  if (!loginResult.success) {
    console.log('⚠️  No se pudo hacer login');
    return { success: false, reason: 'LOGIN_FAILED' };
  }

  console.log('✅ Autenticación de prueba configurada correctamente');
  return { success: true, token: loginResult.token };
}

/**
 * Obtiene el token actual
 */
export function getAuthToken() {
  return tokenStore.getAccessToken();
}

/**
 * Verifica si estamos autenticados
 */
export function isAuthenticated() {
  const token = getAuthToken();
  return token !== null && token !== undefined && token !== '';
}
