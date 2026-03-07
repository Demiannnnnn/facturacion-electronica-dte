import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Custom Jest Reporter que guarda los resultados en formato Markdown
 * CAPTURA TODO EL OUTPUT DE LA CONSOLA
 */
class MarkdownReporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options;
    this.results = [];
    this.consoleOutput = [];
    this.startTime = Date.now();
  }

  onRunStart() {
    this.startTime = Date.now();
    this.results = [];
    this.consoleOutput = [];
  }

  onTestResult(test, testResult, aggregatedResult) {
    this.results.push({
      testFilePath: testResult.testFilePath,
      testResults: testResult.testResults,
      numPassingTests: testResult.numPassingTests,
      numFailingTests: testResult.numFailingTests,
      numPendingTests: testResult.numPendingTests,
      perfStats: testResult.perfStats,
      console: testResult.console // ⬅️ CAPTURAR TODO EL OUTPUT DE CONSOLA
    });
  }

  onRunComplete(contexts, results) {
    const endTime = Date.now();
    const duration = ((endTime - this.startTime) / 1000).toFixed(3);
    
    const markdown = this.generateMarkdown(results, duration);
    this.saveToFile(markdown);
  }

  generateMarkdown(results, duration) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const date = new Date().toLocaleString('es-CL', {
      dateStyle: 'full',
      timeStyle: 'long',
      timeZone: 'America/Santiago'
    });

    let md = `# 📊 Reporte de Tests - Jest\n\n`;
    md += `**Fecha:** ${date}\n`;
    md += `**Duración:** ${duration}s\n\n`;

    // Resumen general
    md += `## 📈 Resumen General\n\n`;
    md += `| Métrica | Valor |\n`;
    md += `|---------|-------|\n`;
    md += `| **Test Suites** | ${results.numPassedTestSuites}/${results.numTotalTestSuites} pasadas |\n`;
    md += `| **Tests** | ${results.numPassedTests}/${results.numTotalTests} pasados |\n`;
    md += `| **Tests Fallidos** | ${results.numFailedTests} |\n`;
    md += `| **Tests Pendientes** | ${results.numPendingTests} |\n`;
    md += `| **Tiempo Total** | ${duration}s |\n\n`;

    // Estado general
    const allPassed = results.numFailedTests === 0;
    md += `### Estado: ${allPassed ? '✅ TODOS LOS TESTS PASARON' : '❌ HAY TESTS FALLIDOS'}\n\n`;

    // Progreso visual
    const progressBar = this.createProgressBar(
      results.numPassedTests,
      results.numTotalTests
    );
    md += `\`\`\`\n${progressBar}\n\`\`\`\n\n`;

    // ⭐ NUEVO: OUTPUT COMPLETO DE CONSOLA
    md += this.generateConsoleOutput();

    // Detalles por suite de tests
    md += `## 📝 Detalle por Suite\n\n`;

    this.results.forEach((suite) => {
      const suiteName = path.basename(suite.testFilePath);
      const suiteStatus = suite.numFailingTests === 0 ? '✅' : '❌';
      const suiteDuration = ((suite.perfStats.end - suite.perfStats.start) / 1000).toFixed(3);

      md += `### ${suiteStatus} ${suiteName}\n\n`;
      md += `- **Pasados:** ${suite.numPassingTests}\n`;
      md += `- **Fallidos:** ${suite.numFailingTests}\n`;
      md += `- **Pendientes:** ${suite.numPendingTests}\n`;
      md += `- **Duración:** ${suiteDuration}s\n\n`;

      // Tests individuales
      if (suite.testResults.length > 0) {
        md += `#### Tests:\n\n`;
        suite.testResults.forEach((test) => {
          const status = test.status === 'passed' ? '✅' : 
                        test.status === 'failed' ? '❌' : 
                        test.status === 'pending' ? '⏸️' : '⏭️';
          const testDuration = test.duration ? `(${test.duration}ms)` : '';
          
          md += `- ${status} ${test.title} ${testDuration}\n`;

          // Si el test falló, mostrar el error
          if (test.status === 'failed' && test.failureMessages.length > 0) {
            md += `\n**Error:**\n\`\`\`\n`;
            test.failureMessages.forEach(msg => {
              const cleanMsg = msg.replace(/\x1b\[[0-9;]*m/g, '');
              md += `${cleanMsg}\n`;
            });
            md += `\`\`\`\n\n`;
          }
        });
        md += `\n`;
      }

      // ⭐ NUEVO: Console output específico de esta suite
      if (suite.console && Array.isArray(suite.console)) {
        md += this.generateSuiteConsoleOutput(suite.console, suiteName);
      }
    });

    // Tests fallidos (si los hay)
    if (results.numFailedTests > 0) {
      md += `## ❌ Tests Fallidos\n\n`;
      this.results.forEach((suite) => {
        const failedTests = suite.testResults.filter(t => t.status === 'failed');
        if (failedTests.length > 0) {
          const suiteName = path.basename(suite.testFilePath);
          md += `### ${suiteName}\n\n`;
          failedTests.forEach((test) => {
            md += `#### ❌ ${test.title}\n\n`;
            if (test.failureMessages.length > 0) {
              md += `\`\`\`\n`;
              test.failureMessages.forEach(msg => {
                const cleanMsg = msg.replace(/\x1b\[[0-9;]*m/g, '');
                md += `${cleanMsg}\n`;
              });
              md += `\`\`\`\n\n`;
            }
          });
        }
      });
    }

    // Snapshot tests (si los hay)
    if (results.snapshot.total > 0) {
      md += `## 📸 Snapshots\n\n`;
      md += `| Métrica | Valor |\n`;
      md += `|---------|-------|\n`;
      md += `| **Total** | ${results.snapshot.total} |\n`;
      md += `| **Actualizados** | ${results.snapshot.updated} |\n`;
      md += `| **Agregados** | ${results.snapshot.added} |\n`;
      md += `| **Eliminados** | ${results.snapshot.filesRemoved} |\n\n`;
    }

    // Footer
    md += `---\n\n`;
    md += `*Generado automáticamente por Jest Markdown Reporter*\n`;
    md += `*Archivo: \`test-results-${timestamp}.md\`*\n`;

    return md;
  }

  /**
   * Genera el output completo de consola de TODAS las suites
   */
  generateConsoleOutput() {
    let md = `## 🖥️  Output Completo de Consola\n\n`;
    md += `> ⚠️  Este es el output COMPLETO tal como aparece en la terminal.\n`;
    md += `> Incluye todos los logs, errores, warnings y stack traces.\n\n`;

    let hasConsoleOutput = false;

    this.results.forEach((suite) => {
      if (suite.console && Array.isArray(suite.console) && suite.console.length > 0) {
        hasConsoleOutput = true;
        const suiteName = path.basename(suite.testFilePath);
        
        md += `### 📄 ${suiteName}\n\n`;
        md += `<details>\n<summary>Ver output de consola (${suite.console.length} entradas)</summary>\n\n`;
        md += `\`\`\`\n`;

        suite.console.forEach((log) => {
          const logType = log.type.toUpperCase();
          const message = log.message.replace(/\x1b\[[0-9;]*m/g, ''); // Remover colores ANSI
          const origin = log.origin ? ` (${log.origin})` : '';
          
          md += `[${logType}]${origin}\n${message}\n\n`;
        });

        md += `\`\`\`\n</details>\n\n`;
      }
    });

    if (!hasConsoleOutput) {
      md += `_No se registró output de consola._\n\n`;
    }

    return md;
  }

  /**
   * Genera el output de consola de una suite específica (versión resumida)
   */
  generateSuiteConsoleOutput(consoleBuffer, suiteName) {
    if (!consoleBuffer || consoleBuffer.length === 0) {
      return '';
    }

    let md = `#### 📟 Console Output\n\n`;
    md += `<details>\n<summary>Ver ${consoleBuffer.length} entradas de consola</summary>\n\n`;
    md += `\`\`\`\n`;

    // Filtrar y mostrar los más relevantes
    const errors = consoleBuffer.filter(log => log.type === 'error');
    const warns = consoleBuffer.filter(log => log.type === 'warn');
    const logs = consoleBuffer.filter(log => log.type === 'log');

    if (errors.length > 0) {
      md += `🔴 ERRORES (${errors.length}):\n`;
      errors.forEach(log => {
        const message = log.message.replace(/\x1b\[[0-9;]*m/g, '');
        md += `${message}\n\n`;
      });
    }

    if (warns.length > 0) {
      md += `🟡 WARNINGS (${warns.length}):\n`;
      warns.forEach(log => {
        const message = log.message.replace(/\x1b\[[0-9;]*m/g, '');
        md += `${message}\n\n`;
      });
    }

    if (logs.length > 0) {
      md += `⚪ LOGS (${logs.length}):\n`;
      logs.slice(0, 10).forEach(log => { // Solo primeros 10 logs
        const message = log.message.replace(/\x1b\[[0-9;]*m/g, '');
        md += `${message}\n`;
      });
      if (logs.length > 10) {
        md += `\n... y ${logs.length - 10} logs más\n`;
      }
    }

    md += `\`\`\`\n</details>\n\n`;
    return md;
  }

  createProgressBar(passed, total) {
    const percentage = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
    const barLength = 50;
    const filledLength = Math.round((passed / total) * barLength);
    const emptyLength = barLength - filledLength;
    
    const bar = '█'.repeat(filledLength) + '░'.repeat(emptyLength);
    return `${passed}/${total} tests [${bar}] ${percentage}%`;
  }

  saveToFile(content) {
    try {
      // Ruta a la carpeta logs en la raíz del proyecto
      const projectRoot = path.resolve(__dirname, '../../../');
      const logsDir = path.join(projectRoot, 'logs');
      
      // Crear la carpeta logs si no existe
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }

      // Generar nombre de archivo con timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const filename = `test-results-${timestamp}.md`;
      const filepath = path.join(logsDir, filename);

      // Guardar archivo
      fs.writeFileSync(filepath, content, 'utf8');

      // También guardar como "latest" para fácil acceso
      const latestPath = path.join(logsDir, 'test-results-latest.md');
      fs.writeFileSync(latestPath, content, 'utf8');

      console.log(`\n📄 Reporte guardado en: ${filepath}`);
      console.log(`📄 Último reporte: ${latestPath}\n`);
    } catch (error) {
      console.error('❌ Error al guardar el reporte:', error.message);
    }
  }
}

export default MarkdownReporter;
