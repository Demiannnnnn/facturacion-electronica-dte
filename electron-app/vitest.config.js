import { defineConfig } from 'vitest/config';
import path from 'path';

// Configuración de tests unitarios (independiente de vite.config.js, cuyo root es el renderer)
export default defineConfig({
  resolve: {
    alias: {
      // El proceso main importa 'electron'; en tests se reemplaza por un mock en memoria
      electron: path.resolve(__dirname, 'tests/mocks/electron.js')
    }
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    // forks permite process.chdir() y aísla los módulos nativos (better-sqlite3, bcrypt)
    pool: 'forks',
    restoreMocks: true
  }
});
