/**
 * Formatea un RUT para la API externa
 * Convierte: "213319078" → "21331907-8"
 * @param {string} rut - RUT limpio sin formato
 * @returns {string} RUT formateado con guión (sin puntos)
 */
export function formatearRutParaApi(rut) {
  if (!rut) return '';
  
  // Limpiar cualquier formato existente
  const rutLimpio = rut.replace(/[^0-9kK]/g, '').toUpperCase();
  
  if (rutLimpio.length < 2) return rutLimpio;
  
  // Separar cuerpo y dígito verificador
  const cuerpo = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1);
  
  // Retornar con formato: 21331907-8 (sin puntos)
  return `${cuerpo}-${dv}`;
}

/**
 * Limpia un RUT de todo formato
 * Convierte: "21.331.907-8" → "213319078"
 * @param {string} rut - RUT con cualquier formato
 * @returns {string} RUT limpio
 */
export function limpiarRut(rut) {
  if (!rut) return '';
  return rut.replace(/[^0-9kK]/g, '').toUpperCase();
}
