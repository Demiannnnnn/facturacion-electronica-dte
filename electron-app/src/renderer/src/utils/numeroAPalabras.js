/**
 * Convierte un número a su representación en palabras en español chileno
 * Para ser usado en documentos tributarios (facturas, etc.)
 *
 * @param {number} numero - El número a convertir
 * @returns {string} - El número en palabras
 */

const unidades = ['', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
const decenas = ['', '', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
const especiales = {
  10: 'DIEZ',
  11: 'ONCE',
  12: 'DOCE',
  13: 'TRECE',
  14: 'CATORCE',
  15: 'QUINCE',
  16: 'DIECISÉIS',
  17: 'DIECISIETE',
  18: 'DIECIOCHO',
  19: 'DIECINUEVE',
  21: 'VEINTIUNO',
  22: 'VEINTIDÓS',
  23: 'VEINTITRÉS',
  24: 'VEINTICUATRO',
  25: 'VEINTICINCO',
  26: 'VEINTISÉIS',
  27: 'VEINTISIETE',
  28: 'VEINTIOCHO',
  29: 'VEINTINUEVE'
};

const centenas = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

function convertirMenorMil(numero) {
  if (numero === 0) return '';
  if (numero === 100) return 'CIEN';

  let resultado = '';

  // Centenas
  const centena = Math.floor(numero / 100);
  if (centena > 0) {
    resultado += centenas[centena] + ' ';
  }

  // Decenas y unidades
  const resto = numero % 100;

  if (especiales[resto]) {
    resultado += especiales[resto];
  } else {
    const decena = Math.floor(resto / 10);
    const unidad = resto % 10;

    if (decena > 0) {
      resultado += decenas[decena];
      if (unidad > 0) {
        resultado += ' Y ' + unidades[unidad];
      }
    } else if (unidad > 0) {
      resultado += unidades[unidad];
    }
  }

  return resultado.trim();
}

function convertirMiles(numero) {
  if (numero === 0) return '';
  if (numero === 1) return 'MIL';

  return convertirMenorMil(numero) + ' MIL';
}

function convertirMillones(numero) {
  if (numero === 0) return '';
  if (numero === 1) return 'UN MILLÓN';

  return convertirMenorMil(numero) + ' MILLONES';
}

export function numeroAPalabras(numero) {
  // Convertir a entero (sin decimales)
  numero = Math.floor(numero);

  // Casos especiales
  if (numero === 0) return 'CERO PESOS';
  if (numero < 0) return 'NÚMERO INVÁLIDO';

  // Limitar a 999,999,999 (999 millones)
  if (numero > 999999999) {
    return 'MONTO EXCEDE LÍMITE';
  }

  let resultado = '';

  // Millones
  const millones = Math.floor(numero / 1000000);
  if (millones > 0) {
    resultado += convertirMillones(millones) + ' ';
    numero = numero % 1000000;
  }

  // Miles
  const miles = Math.floor(numero / 1000);
  if (miles > 0) {
    resultado += convertirMiles(miles) + ' ';
    numero = numero % 1000;
  }

  // Centenas
  if (numero > 0) {
    resultado += convertirMenorMil(numero);
  }

  return resultado.trim() + ' PESOS';
}

// Función para formatear con decimales (opcional)
export function numeroAPalabrasConDecimales(numero) {
  const parteEntera = Math.floor(numero);
  const parteDecimal = Math.round((numero - parteEntera) * 100);

  let resultado = numeroAPalabras(parteEntera);

  if (parteDecimal > 0) {
    resultado += ` CON ${parteDecimal}/100`;
  }

  return resultado;
}

// Ejemplos de uso:
// numeroAPalabras(1190000) => "UN MILLÓN CIENTO NOVENTA MIL PESOS"
// numeroAPalabras(357000) => "TRESCIENTOS CINCUENTA Y SIETE MIL PESOS"
// numeroAPalabras(1500) => "MIL QUINIENTOS PESOS"
// numeroAPalabrasConDecimales(1190000.50) => "UN MILLÓN CIENTO NOVENTA MIL PESOS CON 50/100"
