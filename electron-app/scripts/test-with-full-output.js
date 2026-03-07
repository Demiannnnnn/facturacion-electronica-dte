#!/usr/bin/env node

/**
 * Script que ejecuta los tests y captura TODO el output en markdown
 * Incluye TODO: logs, errores, warnings, stack traces, etc.
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración
const projectRoot = path.resolve(__dirname, '../../');
const logsDir = path.join(projectRoot, 'logs');

// Crear carpeta logs si no existe
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

console.log('🧪 Ejecutando tests y capturando output completo...\n');

// Buffer para capturar TODO el output
let fullOutput = '';
let errorOutput = '';

// Timestamp
const startTime = Date.now();
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const date = new Date().toLocaleString('es-CL', {
  dateStyle: 'full',
  timeStyle: 'long',
  timeZone: 'America/Santiago'
});

// Ejecutar npm test y capturar TODO
const testProcess = spawn('npm', ['test'], {
  cwd: path.join(__dirname, '..'),
  shell: true,
  env: { ...process.env, FORCE_COLOR: '0' } // Deshabilitar colores ANSI
});

// Capturar STDOUT (salida normal)
testProcess.stdout.on('data', (data) => {
  const output = data.toString();
  fullOutput += output;
  process.stdout.write(output); // Mostrar en consola también
});

// Capturar STDERR (errores)
testProcess.stderr.on('data', (data) => {
  const output = data.toString();
  errorOutput += output;
  fullOutput += output;
  process.stderr.write(output); // Mostrar en consola también
});

// Cuando termine
testProcess.on('close', (code) => {
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(3);

  console.log(`\n\n📊 Generando reporte markdown con output completo...`);

  // Generar el markdown
  let md = `# 📊 Reporte Completo de Tests - Jest\n\n`;
  md += `**Fecha:** ${date}\n`;
  md += `**Duración:** ${duration}s\n`;
  md += `**Exit Code:** ${code}\n`;
  md += `**Estado:** ${code === 0 ? '✅ TODOS LOS TESTS PASARON' : '❌ HAY TESTS FALLIDOS'}\n\n`;

  md += `---\n\n`;

  // Extraer resumen de las últimas líneas
  const lines = fullOutput.split('\n');
  const summaryStart = lines.findIndex(line => line.includes('Test Suites:'));
  
  if (summaryStart !== -1) {
    md += `## 📈 Resumen\n\n`;
    md += `\`\`\`\n`;
    for (let i = summaryStart; i < summaryStart + 5 && i < lines.length; i++) {
      md += `${lines[i]}\n`;
    }
    md += `\`\`\`\n\n`;
  }

  // OUTPUT COMPLETO
  md += `## 🖥️  Output Completo de la Consola\n\n`;
  md += `> Este es el output EXACTO tal como aparece en la terminal.\n`;
  md += `> Incluye TODOS los logs, errores, warnings, stack traces y mensajes.\n\n`;

  // Detectar secciones importantes
  md += `### 📋 Estructura del Output\n\n`;
  
  const hasErrors = fullOutput.toLowerCase().includes('error');
  const hasWarnings = fullOutput.toLowerCase().includes('warning') || fullOutput.toLowerCase().includes('cannot log after tests');
  const hasFailures = fullOutput.includes('FAIL');
  const hasPasses = fullOutput.includes('PASS');

  md += `- ${hasErrors ? '🔴' : '✅'} Errores detectados: ${hasErrors ? 'SÍ' : 'NO'}\n`;
  md += `- ${hasWarnings ? '🟡' : '✅'} Warnings detectados: ${hasWarnings ? 'SÍ' : 'NO'}\n`;
  md += `- ${hasFailures ? '❌' : '✅'} Tests fallidos: ${hasFailures ? 'SÍ' : 'NO'}\n`;
  md += `- ${hasPasses ? '✅' : '❌'} Tests pasados: ${hasPasses ? 'SÍ' : 'NO'}\n\n`;

  // Output completo en bloque de código
  md += `### 📄 Output Completo (${fullOutput.split('\n').length} líneas)\n\n`;
  md += `<details>\n<summary>🔍 Click para ver el output completo</summary>\n\n`;
  md += `\`\`\`\n`;
  md += fullOutput;
  md += `\n\`\`\`\n`;
  md += `</details>\n\n`;

  // Si hay errores en STDERR
  if (errorOutput.trim().length > 0) {
    md += `### 🔴 STDERR Output\n\n`;
    md += `<details>\n<summary>Ver errores de STDERR</summary>\n\n`;
    md += `\`\`\`\n`;
    md += errorOutput;
    md += `\n\`\`\`\n`;
    md += `</details>\n\n`;
  }

  // Análisis de errores específicos
  md += `## 🔍 Análisis Detallado\n\n`;

  // Buscar errores de conexión
  const connectionErrors = fullOutput.match(/ECONNREFUSED/g);
  if (connectionErrors) {
    md += `### ⚠️  Errores de Conexión\n\n`;
    md += `Se detectaron **${connectionErrors.length}** errores de conexión (\`ECONNREFUSED\`).\n`;
    md += `Esto indica que el backend no está corriendo en \`http://localhost:3000\`.\n\n`;
  }

  // Buscar warnings de "Cannot log after tests"
  const asyncWarnings = fullOutput.match(/Cannot log after tests are done/g);
  if (asyncWarnings) {
    md += `### 🟡 Async Logging Warnings\n\n`;
    md += `Se detectaron **${asyncWarnings.length}** warnings de logging asíncrono.\n`;
    md += `Estos son menores y no afectan la funcionalidad de los tests.\n\n`;
  }

  // Buscar errores 404
  const errors404 = fullOutput.match(/404/g);
  if (errors404) {
    md += `### 🔴 Errores 404\n\n`;
    md += `Se detectaron **${errors404.length}** respuestas 404 (Not Found).\n`;
    md += `Los endpoints están retornando 404, verificar las rutas de la API.\n\n`;
  }

  // Buscar errores 401
  const errors401 = fullOutput.match(/401/g);
  if (errors401) {
    md += `### 🔴 Errores 401\n\n`;
    md += `Se detectaron **${errors401.length}** respuestas 401 (Unauthorized).\n`;
    md += `Algunos endpoints requieren autenticación JWT.\n\n`;
  }

  // Buscar usuarios generados
  const userMatches = fullOutput.match(/Email: ([^\n]+)/);
  const rutMatches = fullOutput.match(/RUT: ([^\n]+)/);
  if (userMatches && rutMatches) {
    md += `### 👤 Usuario de Prueba Generado\n\n`;
    md += `- **Email:** ${userMatches[1].trim()}\n`;
    md += `- **RUT:** ${rutMatches[1].trim()}\n\n`;
  }

  // Footer
  md += `---\n\n`;
  md += `**Archivo generado:** \`test-results-${timestamp}.md\`\n`;
  md += `**Generado por:** \`test-with-full-output.js\`\n`;
  md += `**Comando:** \`npm test\`\n\n`;

  // Guardar el archivo
  const filename = `test-results-${timestamp}.md`;
  const filepath = path.join(logsDir, filename);
  fs.writeFileSync(filepath, md, 'utf8');

  // Guardar como latest
  const latestPath = path.join(logsDir, 'test-results-latest.md');
  fs.writeFileSync(latestPath, md, 'utf8');

  console.log(`\n✅ Reporte completo guardado en:`);
  console.log(`   📄 ${filepath}`);
  console.log(`   📄 ${latestPath}`);
  console.log(`\n📊 Estadísticas:`);
  console.log(`   - Líneas de output: ${fullOutput.split('\n').length}`);
  console.log(`   - Tamaño del reporte: ${(md.length / 1024).toFixed(2)} KB`);
  console.log(`   - Exit code: ${code}\n`);

  process.exit(code);
});

testProcess.on('error', (error) => {
  console.error('❌ Error ejecutando tests:', error);
  process.exit(1);
});
