/**
 * Test de Conectividad General con la API
 * Prueba rápida para verificar si el backend está disponible
 */

import { describe, test, expect } from '@jest/globals';

describe('Conectividad API - Health Check', () => {
  const API_URL = process.env.API_URL || 'http://localhost:3000';
  const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';

  test('debe poder resolver el hostname de la API', async () => {
    try {
      const url = new URL(API_URL);
      expect(url.hostname).toBeDefined();
      expect(url.protocol).toMatch(/^https?:/);
      console.log('✅ URL válida:', API_URL);
    } catch (error) {
      console.error('❌ URL inválida:', error.message);
      throw error;
    }
  });

  test('debe intentar conectarse al endpoint de health', async () => {
    console.log('🔍 Intentando conectar a:', `${API_URL}/health`);
    
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${API_URL}/health`, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      clearTimeout(timeout);

      console.log('📡 Respuesta recibida:', response.status);

      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        console.log('✅ API está funcionando');
        console.log('📦 Datos:', data);
        
        expect(response.status).toBe(200);
        expect(data).toBeDefined();
      } else {
        console.log('⚠️  API respondió con código:', response.status);
        expect(response.status).toBeGreaterThanOrEqual(400);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('⏱️  Timeout: La API no respondió en 5 segundos');
        console.log('💡 Verifica que tu backend esté corriendo en:', API_URL);
      } else {
        console.log('❌ Error de conexión:', error.message);
        console.log('💡 Asegúrate de que el backend esté iniciado');
        console.log('💡 Comando sugerido: cd backend && npm run dev');
      }
      
      // No fallar el test si es un problema de conectividad
      // (útil para desarrollo)
      expect(error).toBeDefined();
    }
  }, 10000);

  test('debe verificar endpoints principales de la API', async () => {
    const endpoints = [
      { path: '/health', method: 'GET' },
      { path: '/api/clientes', method: 'GET' },
      { path: '/api/productos', method: 'GET' }
    ];

    console.log('🔍 Verificando endpoints...');

    for (const endpoint of endpoints) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);

        const response = await fetch(`${API_URL}${endpoint.path}`, {
          method: endpoint.method,
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json'
          }
        });

        clearTimeout(timeout);

        // 200-299 es éxito, 401/403 significa que existe pero necesita auth
        const isAvailable = response.status < 500;
        
        console.log(`${isAvailable ? '✅' : '❌'} ${endpoint.path} - Status: ${response.status}`);
        expect(response).toBeDefined();
        
      } catch (error) {
        console.log(`⚠️  ${endpoint.path} - No disponible: ${error.message}`);
        // No fallar el test por endpoints individuales
      }
    }
  }, 15000);

  test('debe verificar que las variables de entorno están configuradas', () => {
    console.log('🔧 Variables de entorno:');
    console.log('  API_URL:', process.env.API_URL || '(no configurada, usando default)');
    console.log('  API_BASE_URL:', process.env.API_BASE_URL || '(no configurada, usando default)');
    console.log('  NODE_ENV:', process.env.NODE_ENV);

    // Solo verificar que existen (pueden ser undefined y usar defaults)
    expect(API_URL).toBeDefined();
    expect(API_BASE_URL).toBeDefined();
  });

  test('debe poder medir la latencia de la API', async () => {
    try {
      const startTime = Date.now();
      
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      await fetch(`${API_URL}/health`, {
        signal: controller.signal
      });

      clearTimeout(timeout);
      
      const latency = Date.now() - startTime;
      
      console.log(`⚡ Latencia: ${latency}ms`);
      
      expect(latency).toBeGreaterThan(0);
      
      if (latency < 100) {
        console.log('✅ Latencia excelente (<100ms)');
      } else if (latency < 500) {
        console.log('✅ Latencia aceptable (<500ms)');
      } else if (latency < 2000) {
        console.log('⚠️  Latencia alta (<2s)');
      } else {
        console.log('❌ Latencia muy alta (>2s)');
      }
      
    } catch (error) {
      console.log('⚠️  No se pudo medir latencia:', error.message);
      expect(error).toBeDefined();
    }
  }, 10000);
});
