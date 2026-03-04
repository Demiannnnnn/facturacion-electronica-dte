/** @type {import('jest').Config} */
export default {
  // Transformaciones
  transform: {},
  
  // Ambiente de prueba
  testEnvironment: 'node',
  
  // Patrón de archivos de prueba
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/__tests__/**/*.spec.js'
  ],
  
  // Archivos a ignorar
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/dist-renderer/'
  ],
  
  // Cobertura de código
  collectCoverageFrom: [
    'src/main/**/*.js',
    '!src/main/main.js',
    '!src/main/menu.js',
    '!**/node_modules/**'
  ],
  
  // Umbral de cobertura
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },
  
  // Timeout para tests (útil para tests de API)
  testTimeout: 10000,
  
  // Verbose output
  verbose: true,
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js']
};
