/**
 * Setup para Jest
 * Configuración global para todos los tests
 */

import { setupTestAuth } from './auth-helper.js';

// Variables de entorno para testing
process.env.NODE_ENV = 'test';
process.env.API_URL = process.env.API_URL || 'http://localhost:3000';

// Nota: El timeout se configura en jest.config.js, no aquí con ES modules

// Mock global para console.error si no quieres ver errores en los tests
// import { jest } from '@jest/globals';
// global.console.error = jest.fn();

console.log('🧪 Jest setup completado');
console.log('📡 API_URL:', process.env.API_URL);

// Configurar autenticación para todos los tests
// Esto se ejecuta una vez al inicio de la suite de tests
(async () => {
  try {
    console.log('');
    console.log('🔐 Configurando autenticación global para tests...');
    
    const authResult = await setupTestAuth();
    
    if (authResult.success) {
      console.log('✅ Autenticación global configurada - JWT token disponible');
      console.log('🔑 Los tests que requieren autenticación funcionarán correctamente');
    } else {
      console.log('⚠️  Autenticación global no disponible:', authResult.reason);
      console.log('💡 Los tests de API mostrarán errores 401 (esperado sin backend)');
    }
    console.log('');
  } catch (error) {
    console.error('❌ Error configurando autenticación global:', error.message);
    console.log('💡 Los tests continuarán sin autenticación');
    console.log('');
  }
})();
