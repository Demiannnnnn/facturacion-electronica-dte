#!/usr/bin/env node

/**
 * Script de verificación rápida de conectividad con la API
 * Útil para verificar que el backend está funcionando antes de ejecutar tests
 */

const API_URL = process.env.API_URL || 'http://localhost:3000';

console.log('🔍 Verificando conectividad con la API...');
console.log('📡 URL:', API_URL);
console.log('');

async function checkAPI() {
  const endpoints = [
    { name: 'Health Check', path: '/health' },
    { name: 'API Base', path: '/api' },
    { name: 'Clientes', path: '/api/clientes' },
    { name: 'Productos', path: '/api/productos' }
  ];

  let allOk = true;

  for (const endpoint of endpoints) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(`${API_URL}${endpoint.path}`, {
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' }
      });

      clearTimeout(timeout);

      const status = response.status;
      const isOk = status < 500;

      console.log(
        `${isOk ? '✅' : '❌'} ${endpoint.name.padEnd(20)} - Status: ${status}`
      );

      if (!isOk) allOk = false;
      
    } catch (error) {
      console.log(`❌ ${endpoint.name.padEnd(20)} - Error: ${error.message}`);
      allOk = false;
    }
  }

  console.log('');

  if (allOk) {
    console.log('✅ Todos los endpoints responden correctamente');
    console.log('💡 Puedes ejecutar los tests con: npm test');
    process.exit(0);
  } else {
    console.log('❌ Algunos endpoints no responden');
    console.log('💡 Asegúrate de que el backend esté corriendo');
    console.log('💡 Comando sugerido: cd backend && npm run dev');
    process.exit(1);
  }
}

checkAPI().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
