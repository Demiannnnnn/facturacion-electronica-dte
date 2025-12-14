/**
 * Safe logger que maneja errores EPIPE
 * Estos errores ocurren cuando stdout se cierra prematuramente
 */

function safeLog(...args) {
  try {
    console.log(...args);
  } catch (error) {
    // Ignorar errores EPIPE silenciosamente
    if (error.code !== 'EPIPE') {
      // Solo mostrar otros tipos de errores
      try {
        console.error('Logger error:', error.message);
      } catch {
        // Silenciosamente ignorar si console.error también falla
      }
    }
  }
}

function safeError(...args) {
  try {
    console.error(...args);
  } catch (error) {
    // Silenciosamente ignorar errores EPIPE
  }
}

export { safeLog, safeError };
