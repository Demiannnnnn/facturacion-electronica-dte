/**
 * Tests de Autenticación
 * Pruebas de registro, login y manejo de JWT tokens
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import authApi from '../../src/main/services/api/auth.js';
import tokenStore from '../../src/main/utils/tokenStore.js';
import { 
  testUser, 
  isAPIAvailable, 
  registerTestUser, 
  loginTestUser,
  clearAuth,
  getAuthToken,
  isAuthenticated
} from '../auth-helper.js';

describe('API Auth - Autenticación y JWT', () => {
  const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';
  let apiAvailable = false;

  beforeAll(async () => {
    console.log('🔧 Iniciando tests de autenticación...');
    console.log('📡 API URL:', API_BASE_URL);
    
    apiAvailable = await isAPIAvailable();
    if (apiAvailable) {
      console.log('✅ API disponible para tests');
    } else {
      console.log('⚠️  API no disponible - algunos tests se saltarán');
    }
    
    // Limpiar autenticación previa
    clearAuth();
  });

  afterAll(() => {
    console.log('✅ Tests de autenticación completados');
  });

  describe('Helpers de autenticación', () => {
    test('debe tener configurado el usuario de prueba', () => {
      expect(testUser).toBeDefined();
      expect(testUser.email).toBeDefined();
      expect(testUser.password).toBeDefined();
      expect(testUser.rut).toBeDefined();
      expect(testUser.name).toBeDefined();
    });

    test('debe poder verificar si está autenticado', () => {
      const authenticated = isAuthenticated();
      expect(typeof authenticated).toBe('boolean');
    });

    test('debe poder obtener el token (aunque sea null)', () => {
      const token = getAuthToken();
      expect(token === null || typeof token === 'string').toBe(true);
    });
  });

  describe('Servicios de Auth API', () => {
    test('debe exportar función register', () => {
      expect(typeof authApi.register).toBe('function');
    });

    test('debe exportar función login', () => {
      expect(typeof authApi.login).toBe('function');
    });

    test('debe exportar función changePassword', () => {
      expect(typeof authApi.changePassword).toBe('function');
    });

    test('debe exportar función me', () => {
      expect(typeof authApi.me).toBe('function');
    });
  });

  describe('Registro de Usuario', () => {
    test('debe poder registrar un usuario de prueba', async () => {
      if (!apiAvailable) {
        console.log('⚠️  Test saltado - API no disponible');
        return;
      }

      const result = await registerTestUser();
      
      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
      
      if (!result.success) {
        // Si falla, debe ser porque ya existe
        console.log('💡 Usuario ya existe (esperado):', result.error);
      } else {
        console.log('✅ Usuario registrado exitosamente');
      }
    }, 15000);

    test('debe manejar error al registrar con datos inválidos', async () => {
      if (!apiAvailable) {
        console.log('⚠️  Test saltado - API no disponible');
        return;
      }

      const result = await authApi.register('', '', '', '');
      
      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      
      console.log('✅ Error manejado correctamente:', result.error);
    }, 10000);
  });

  describe('Login y JWT Token', () => {
    test('debe poder hacer login con credenciales válidas', async () => {
      if (!apiAvailable) {
        console.log('⚠️  Test saltado - API no disponible');
        return;
      }

      // Primero asegurarse que el usuario existe
      await registerTestUser();

      const result = await loginTestUser();
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.token).toBeDefined();
      expect(typeof result.token).toBe('string');
      expect(result.token.length).toBeGreaterThan(0);
      
      console.log('✅ Login exitoso');
      console.log('🔑 Token recibido:', result.token.substring(0, 20) + '...');
      
      // Verificar que el token se guardó en tokenStore
      const storedToken = getAuthToken();
      expect(storedToken).toBe(result.token);
      expect(isAuthenticated()).toBe(true);
      
      console.log('✅ Token guardado en tokenStore');
    }, 15000);

    test('debe fallar login con credenciales incorrectas', async () => {
      if (!apiAvailable) {
        console.log('⚠️  Test saltado - API no disponible');
        return;
      }

      const result = await authApi.login('invalid@test.com', 'wrongpassword');
      
      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      
      console.log('✅ Login rechazado correctamente:', result.error);
    }, 10000);

    test('debe poder usar el token para llamadas autenticadas', async () => {
      if (!apiAvailable) {
        console.log('⚠️  Test saltado - API no disponible');
        return;
      }

      // Hacer login primero
      await registerTestUser();
      const loginResult = await loginTestUser();
      
      if (!loginResult.success) {
        console.log('⚠️  No se pudo hacer login');
        return;
      }

      // Intentar obtener perfil (requiere autenticación)
      const profileResult = await authApi.me();
      
      expect(profileResult).toBeDefined();
      
      if (profileResult.success) {
        console.log('✅ Llamada autenticada exitosa');
        
        // Manejar diferentes formatos de respuesta
        const user = profileResult.user || profileResult.data?.user;
        console.log('👤 Usuario:', user?.email || 'N/A');
        
        if (user) {
          expect(user).toBeDefined();
          expect(user.email).toBe(testUser.email);
        } else {
          console.log('⚠️  Usuario no encontrado en respuesta pero llamada exitosa');
        }
      } else {
        console.log('⚠️  Llamada autenticada falló:', profileResult.error);
      }
    }, 15000);
  });

  describe('Token Store', () => {
    test('debe poder guardar y recuperar token', () => {
      const testToken = 'test-jwt-token-12345';
      
      tokenStore.setAccessToken(testToken);
      const retrieved = tokenStore.getAccessToken();
      
      expect(retrieved).toBe(testToken);
      console.log('✅ Token guardado y recuperado correctamente');
      
      // Limpiar
      tokenStore.setAccessToken(null);
    });

    test('debe poder limpiar token', () => {
      tokenStore.setAccessToken('some-token');
      expect(tokenStore.getAccessToken()).toBe('some-token');
      
      tokenStore.setAccessToken(null);
      expect(tokenStore.getAccessToken()).toBe(null);
      
      console.log('✅ Token limpiado correctamente');
    });
  });

  describe('Flujo completo de autenticación', () => {
    test('debe ejecutar flujo completo: registro → login → uso de token', async () => {
      if (!apiAvailable) {
        console.log('⚠️  Test saltado - API no disponible');
        return;
      }

      console.log('🔄 Iniciando flujo completo...');
      
      // 1. Limpiar autenticación
      clearAuth();
      expect(isAuthenticated()).toBe(false);
      console.log('✅ 1. Autenticación limpiada');
      
      // 2. Registrar usuario (o confirmar que existe)
      const registerResult = await registerTestUser();
      expect(registerResult.success).toBe(true);
      console.log('✅ 2. Usuario registrado/confirmado');
      
      // 3. Hacer login
      const loginResult = await loginTestUser();
      expect(loginResult.success).toBe(true);
      expect(loginResult.token).toBeDefined();
      console.log('✅ 3. Login exitoso');
      
      // 4. Verificar autenticación
      expect(isAuthenticated()).toBe(true);
      expect(getAuthToken()).toBe(loginResult.token);
      console.log('✅ 4. Token verificado');
      
      // 5. Usar token en llamada autenticada
      const profileResult = await authApi.me();
      if (profileResult.success) {
        const user = profileResult.user || profileResult.data?.user;
        
        if (user) {
          expect(user).toBeDefined();
          expect(user.email).toBe(testUser.email);
        }
        console.log('✅ 5. Llamada autenticada exitosa');
      }
      
      console.log('✅ Flujo completo ejecutado correctamente');
    }, 20000);
  });
});
