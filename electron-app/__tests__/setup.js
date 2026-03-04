/**
 * Setup para Jest
 * Configuración global para todos los tests
 */

// Variables de entorno para testing
process.env.NODE_ENV = 'test';
process.env.API_URL = process.env.API_URL || 'http://localhost:3000';

// Nota: El timeout se configura en jest.config.js, no aquí con ES modules

// Mock global para console.error si no quieres ver errores en los tests
// import { jest } from '@jest/globals';
// global.console.error = jest.fn();

console.log('🧪 Jest setup completado');
console.log('📡 API_URL:', process.env.API_URL);
