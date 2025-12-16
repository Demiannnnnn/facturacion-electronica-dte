/**
 * Utilidades de validación para formularios
 */

/**
 * Limpia el RUT de puntos y guiones
 * @param {string} rut - RUT con o sin formato
 * @returns {string} RUT limpio solo con números y dígito verificador
 */
export function limpiarRut(rut) {
  return rut.replace(/[.-]/g, '');
}

/**
 * Formatea el RUT con puntos y guion
 * @param {string} rut - RUT sin formato
 * @returns {string} RUT formateado (ej: 12.345.678-9)
 */
export function formatearRut(rut) {
  // Remover todo lo que no sea número o K
  let valor = rut.replace(/[^0-9kK]/g, '').toUpperCase();

  if (valor.length === 0) return '';

  // Separar el dígito verificador
  let cuerpo = valor.slice(0, -1);
  let dv = valor.slice(-1);

  // Si solo hay un caracter, retornarlo sin formato
  if (cuerpo.length === 0) return dv;

  // Formatear el cuerpo con puntos
  cuerpo = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return `${cuerpo}-${dv}`;
}

/**
 * Calcula el dígito verificador de un RUT usando módulo 11
 * @param {string} rut - RUT sin dígito verificador
 * @returns {string} Dígito verificador (0-9 o K)
 */
export function calcularDV(rut) {
  let suma = 0;
  let multiplo = 2;

  // Recorrer el RUT de derecha a izquierda
  for (let i = rut.length - 1; i >= 0; i--) {
    suma += parseInt(rut.charAt(i)) * multiplo;
    multiplo = multiplo === 7 ? 2 : multiplo + 1;
  }

  const resto = suma % 11;
  const dv = 11 - resto;

  if (dv === 11) return '0';
  if (dv === 10) return 'K';
  return dv.toString();
}

/**
 * Valida un RUT chileno usando el algoritmo de módulo 11
 * @param {string} rut - RUT completo con o sin formato
 * @returns {boolean} true si el RUT es válido
 */
export function validarRut(rut) {
  if (!rut || rut.trim() === '') return false;

  // Limpiar el RUT
  const rutLimpio = limpiarRut(rut).toUpperCase();

  // Validar que tenga al menos 2 caracteres (número + DV)
  if (rutLimpio.length < 2) return false;

  // Separar cuerpo y dígito verificador
  const cuerpo = rutLimpio.slice(0, -1);
  const dvIngresado = rutLimpio.slice(-1);

  // Validar que el cuerpo sean solo números
  if (!/^\d+$/.test(cuerpo)) return false;

  // Validar rango realista de RUTs chilenos
  // RUTs desde 1.000.000 (antiguo) hasta 999.999.999 (empresas nuevas)
  // Acepta entre 1 y 9 dígitos
  if (cuerpo.length < 1 || cuerpo.length > 9) return false;

  // RUTs muy pequeños probablemente son inválidos (excepto RUTs históricos)
  const numero = parseInt(cuerpo);
  if (numero < 1000000 && numero > 100) {
    // Permitir RUTs históricos muy antiguos (< 100) o RUTs normales (> 1.000.000)
    return false;
  }

  // Calcular el DV esperado
  const dvEsperado = calcularDV(cuerpo);

  // Comparar
  return dvIngresado === dvEsperado;
}

/**
 * Valida que un RUT sea de tipo específico (empresa, persona, extranjero)
 * @param {string} rut - RUT completo
 * @param {string} tipo - 'rut_empresa', 'rut_persona', 'rut_extranjero', 'pasaporte', 'sin_identificacion'
 * @returns {boolean} true si coincide con el tipo
 */
export function validarTipoRut(rut, tipo) {
  if (tipo === 'sin_identificacion') return true;
  if (tipo === 'pasaporte') return rut && rut.length > 0; // Cualquier formato para pasaporte

  if (!validarRut(rut)) return false;

  const rutLimpio = limpiarRut(rut);
  const cuerpo = rutLimpio.slice(0, -1);
  const numero = parseInt(cuerpo);

  switch (tipo) {
    case 'rut_empresa':
      // RUTs de empresa empiezan con 50-99 (millones)
      return numero >= 50000000 && numero < 100000000;

    case 'rut_persona':
      // RUTs de persona van desde 1.000.000 hasta 49.999.999
      return numero >= 1000000 && numero < 50000000;

    case 'rut_extranjero':
      // RUTs de extranjero empiezan con 55 (serie especial del SII)
      return numero >= 55000000 && numero < 56000000;

    default:
      return true;
  }
}

/**
 * Valida un número de teléfono chileno
 * Acepta formatos: +56912345678, 912345678, +569 12345678, etc.
 * @param {string} telefono - Número de teléfono
 * @returns {boolean} true si el teléfono es válido
 */
export function validarTelefono(telefono) {
  if (!telefono || telefono.trim() === '') return true; // Opcional

  // Limpiar el teléfono de espacios y guiones
  const telefonoLimpio = telefono.replace(/[\s-]/g, '');

  // Validar formato chileno
  // Puede empezar con +56 o directamente con 9
  // Debe tener 9 dígitos después del código de país
  const regexChile = /^(\+?56)?9\d{8}$/;

  return regexChile.test(telefonoLimpio);
}

/**
 * Formatea un número de teléfono chileno
 * @param {string} telefono - Número de teléfono
 * @returns {string} Teléfono formateado (+56 9 1234 5678)
 */
export function formatearTelefono(telefono) {
  if (!telefono) return '';

  // Limpiar el teléfono
  let valor = telefono.replace(/[^\d]/g, '');

  // Si empieza con 56, agregar el +
  if (valor.startsWith('56')) {
    valor = valor.substring(2);
  }

  // Si no empieza con 9, no formatear
  if (!valor.startsWith('9')) return telefono;

  // Formatear: +56 9 1234 5678
  if (valor.length >= 9) {
    return `+56 ${valor.charAt(0)} ${valor.substring(1, 5)} ${valor.substring(5, 9)}`;
  } else if (valor.length >= 5) {
    return `+56 ${valor.charAt(0)} ${valor.substring(1, 5)} ${valor.substring(5)}`;
  } else if (valor.length >= 1) {
    return `+56 ${valor.charAt(0)} ${valor.substring(1)}`;
  }

  return telefono;
}

/**
 * Valida un correo electrónico
 * @param {string} email - Correo electrónico
 * @returns {boolean} true si el email es válido
 */
export function validarEmail(email) {
  if (!email || email.trim() === '') return true; // Opcional

  // Expresión regular para validar email
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return regex.test(email);
}

/**
 * Valida todos los campos del formulario de cliente
 * @param {object} formData - Datos del formulario
 * @returns {object} { valido: boolean, errores: { campo: mensaje } }
 */
export function validarFormularioCliente(formData) {
  const errores = {};

  // Validar RUT (requerido)
  if (!formData.rut || formData.rut.trim() === '') {
    errores.rut = 'El RUT es requerido';
  } else if (!validarRut(formData.rut)) {
    errores.rut = 'El RUT ingresado no es válido';
  }

  // Validar Razón Social (requerido)
  if (!formData.razonSocial || formData.razonSocial.trim() === '') {
    errores.razonSocial = 'La razón social es requerida';
  }

  // Validar Teléfono (opcional, pero si se ingresa debe ser válido)
  if (formData.telefono && formData.telefono.trim() !== '' && !validarTelefono(formData.telefono)) {
    errores.telefono = 'El número de teléfono no es válido. Formato: +56912345678 o 912345678';
  }

  // Validar Email (opcional, pero si se ingresa debe ser válido)
  if (formData.email && formData.email.trim() !== '' && !validarEmail(formData.email)) {
    errores.email = 'El correo electrónico no es válido';
  }

  return {
    valido: Object.keys(errores).length === 0,
    errores
  };
}
