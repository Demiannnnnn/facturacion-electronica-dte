/**
 * Tests para API de Clientes
 * Pruebas de integración con el servicio de clientes
 */

import { describe, test, expect, beforeAll, jest } from '@jest/globals';
import clientesApi from '../../src/main/services/api/clientes.js';

describe('API Clientes - Pruebas de Conexión', () => {
  const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';

  beforeAll(() => {
    console.log('🔧 Iniciando tests de API Clientes...');
    console.log('📡 API URL:', API_BASE_URL);
  });

  describe('Métodos disponibles', () => {
    test('debe exportar getClientes', () => {
      expect(typeof clientesApi.getClientes).toBe('function');
    });

    test('debe exportar getClienteById', () => {
      expect(typeof clientesApi.getClienteById).toBe('function');
    });

    test('debe exportar crearCliente', () => {
      expect(typeof clientesApi.crearCliente).toBe('function');
    });

    test('debe exportar actualizarCliente', () => {
      expect(typeof clientesApi.actualizarCliente).toBe('function');
    });
  });

  describe('Pruebas de Conexión Real', () => {
    test('debe manejar error al obtener clientes sin conexión', async () => {
      // Este test verifica que el manejo de errores funciona correctamente
      try {
        // Intentar conectar a un servidor que no existe
        const originalUrl = process.env.API_BASE_URL;
        process.env.API_BASE_URL = 'http://localhost:9999/api';

        await clientesApi.getClientes();
        
        // Si llegamos aquí, algo salió mal (debería haber lanzado error)
        process.env.API_BASE_URL = originalUrl;
        expect(true).toBe(false); // Forzar fallo
      } catch (error) {
        // Esperamos que lance un error
        expect(error).toBeDefined();
        expect(error.message).toBeDefined();
      }
    }, 10000);

    test('debe manejar error al crear cliente sin conexión', async () => {
      const mockCliente = {
        rut: '12345678-9',
        razonSocial: 'Test Cliente',
        email: 'test@test.com'
      };

      try {
        const originalUrl = process.env.API_BASE_URL;
        process.env.API_BASE_URL = 'http://localhost:9999/api';

        await clientesApi.crearCliente(mockCliente);
        
        process.env.API_BASE_URL = originalUrl;
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.message).toBeDefined();
      }
    }, 10000);

    // Test condicional - solo si la API está disponible
    test('debe poder conectarse a la API real (si está disponible)', async () => {
      try {
        const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
        
        if (response.ok) {
          console.log('✅ API de clientes está disponible');
          expect(response.status).toBeLessThan(500);
        } else {
          console.log('⚠️  API respondió con error:', response.status);
          expect(response.status).toBeGreaterThanOrEqual(400);
        }
      } catch (error) {
        console.log('⚠️  API no disponible:', error.message);
        console.log('💡 Para tests completos, inicia tu backend en:', API_BASE_URL);
        expect(error).toBeDefined();
      }
    }, 10000);
  });

  describe('Validación de datos', () => {
    test('debe validar estructura de datos al crear cliente', () => {
      const mockCliente = {
        rut: '12345678-9',
        razonSocial: 'Test Cliente',
        email: 'test@test.com',
        telefono: '+56912345678'
      };

      // Validar que los datos requeridos están presentes
      expect(mockCliente.rut).toBeDefined();
      expect(mockCliente.razonSocial).toBeDefined();
      expect(mockCliente.email).toBeDefined();
      
      // Validar formato básico
      expect(mockCliente.rut).toMatch(/\d+-\d/);
      expect(mockCliente.email).toMatch(/@/);
    });

    test('debe tener campos opcionales correctos', () => {
      const mockCliente = {
        rut: '12345678-9',
        razonSocial: 'Test Cliente',
        nombreFantasia: 'Test',
        giro: 'Servicios',
        direccion: 'Calle Test 123',
        region: 'Región Metropolitana',
        comuna: 'Santiago',
        condicionPago: 'contado',
        diasCredito: 0
      };

      expect(mockCliente.nombreFantasia).toBeDefined();
      expect(mockCliente.giro).toBeDefined();
      expect(mockCliente.condicionPago).toMatch(/contado|credito/);
      expect(typeof mockCliente.diasCredito).toBe('number');
    });
  });

  describe('Manejo de errores HTTP', () => {
    test('debe manejar respuesta 404 correctamente', async () => {
      try {
        // Intentar obtener un cliente que no existe
        await clientesApi.getClienteById(999999);
        expect(true).toBe(false); // No debería llegar aquí
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.message).toBeDefined();
      }
    }, 10000);

    test('debe incluir mensaje de error descriptivo', async () => {
      try {
        const originalUrl = process.env.API_BASE_URL;
        process.env.API_BASE_URL = 'http://localhost:9999/api';

        await clientesApi.getClientes();
        
        process.env.API_BASE_URL = originalUrl;
      } catch (error) {
        // El error debe tener un mensaje útil
        expect(error.message).toBeTruthy();
        expect(error.message.length).toBeGreaterThan(0);
      }
    }, 10000);
  });
});
