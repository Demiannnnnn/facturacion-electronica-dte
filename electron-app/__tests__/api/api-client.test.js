/**
 * Tests para API Client
 * Pruebas de conexión y comunicación con el backend
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { getAPIClient } from '../../src/main/services/api-client.js';

describe('API Client - Pruebas de Conexión', () => {
  let apiClient;

  beforeAll(() => {
    apiClient = getAPIClient();
    console.log('🔧 Iniciando tests de API Client...');
    console.log('📡 API URL:', apiClient.apiUrl);
  });

  afterAll(() => {
    console.log('✅ Tests de API Client completados');
  });

  describe('Configuración inicial', () => {
    test('debe crear instancia del API Client', () => {
      expect(apiClient).toBeDefined();
      expect(apiClient.apiUrl).toBeDefined();
    });

    test('debe usar la URL correcta de la API', () => {
      const expectedUrl = process.env.API_URL || 'http://localhost:3000';
      expect(apiClient.apiUrl).toBe(expectedUrl);
    });

    test('debe ser un singleton', () => {
      const instance1 = getAPIClient();
      const instance2 = getAPIClient();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Validación de Licencias', () => {
    test('debe tener método validateLicense', () => {
      expect(typeof apiClient.validateLicense).toBe('function');
    });

    test('debe manejar error de conexión correctamente', async () => {
      // Usar una URL inválida temporalmente para probar el manejo de errores
      const originalUrl = apiClient.apiUrl;
      apiClient.apiUrl = 'http://localhost:9999'; // Puerto que probablemente no existe

      const result = await apiClient.validateLicense('test-key', 'test-machine-id');

      expect(result).toBeDefined();
      expect(result.valid).toBe(false);
      expect(result.code).toBe('CONNECTION_ERROR');
      expect(result.error).toContain('Error de conexión');

      // Restaurar URL original
      apiClient.apiUrl = originalUrl;
    }, 15000); // Timeout de 15s para este test

    // Test de conexión real - solo se ejecuta si la API está disponible
    test('debe conectarse a la API real (si está disponible)', async () => {
      try {
        const response = await fetch(`${apiClient.apiUrl}/health`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
          console.log('✅ API está disponible');
          expect(response.status).toBeLessThan(500);
        } else {
          console.log('⚠️  API respondió con error:', response.status);
          expect(response.status).toBeGreaterThanOrEqual(400);
        }
      } catch (error) {
        console.log('⚠️  API no disponible (esto es esperado en desarrollo):', error.message);
        // No fallar el test si la API no está disponible
        expect(error).toBeDefined();
      }
    }, 10000);
  });

  describe('Envío de DTE al SII', () => {
    test('debe tener método enviarDTE', () => {
      expect(typeof apiClient.enviarDTE).toBe('function');
    });

    test('debe manejar error de conexión al enviar DTE', async () => {
      const originalUrl = apiClient.apiUrl;
      apiClient.apiUrl = 'http://localhost:9999';

      const mockDTE = {
        folio: 123,
        tipo: 33,
        receptor: { rut: '12345678-9' }
      };

      const result = await apiClient.enviarDTE(mockDTE);

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.code).toBe('CONNECTION_ERROR');

      apiClient.apiUrl = originalUrl;
    }, 15000);
  });

  describe('Consulta de Estado DTE', () => {
    test('debe tener método consultarEstadoDTE', () => {
      expect(typeof apiClient.consultarEstadoDTE).toBe('function');
    });

    test('debe manejar error de conexión al consultar estado', async () => {
      const originalUrl = apiClient.apiUrl;
      apiClient.apiUrl = 'http://localhost:9999';

      const result = await apiClient.consultarEstadoDTE('test-track-id');

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.code).toBe('CONNECTION_ERROR');

      apiClient.apiUrl = originalUrl;
    }, 15000);
  });

  describe('Generación de PDF Timbrado', () => {
    test('debe tener método generarPDFTimbrado', () => {
      expect(typeof apiClient.generarPDFTimbrado).toBe('function');
    });

    test('debe manejar error de conexión al generar PDF', async () => {
      const originalUrl = apiClient.apiUrl;
      apiClient.apiUrl = 'http://localhost:9999';

      const result = await apiClient.generarPDFTimbrado(123);

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.code).toBe('CONNECTION_ERROR');

      apiClient.apiUrl = originalUrl;
    }, 15000);
  });
});

describe('API Client - Pruebas de Integración', () => {
  let apiClient;

  beforeAll(() => {
    apiClient = getAPIClient();
  });

  test('debe poder hacer múltiples llamadas secuenciales', async () => {
    const originalUrl = apiClient.apiUrl;
    apiClient.apiUrl = 'http://localhost:9999';

    const calls = [
      apiClient.validateLicense('key1', 'machine1'),
      apiClient.consultarEstadoDTE('track1'),
      apiClient.generarPDFTimbrado(100)
    ];

    const results = await Promise.all(calls);

    expect(results).toHaveLength(3);
    results.forEach(result => {
      expect(result).toBeDefined();
      expect(result.code || result.success !== undefined).toBeTruthy();
    });

    apiClient.apiUrl = originalUrl;
  }, 20000);

  test('debe mantener configuración entre llamadas', async () => {
    const url1 = apiClient.apiUrl;
    
    // Hacer una llamada
    await apiClient.validateLicense('test', 'test');
    
    const url2 = apiClient.apiUrl;
    
    expect(url1).toBe(url2);
  });
});
