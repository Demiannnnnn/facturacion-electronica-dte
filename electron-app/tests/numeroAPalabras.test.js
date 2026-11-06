import { describe, it, expect } from 'vitest';
import { numeroAPalabras, numeroAPalabrasConDecimales } from '../src/renderer/src/utils/numeroAPalabras.js';

describe('numeroAPalabras', () => {
  it.each([
    [0, 'CERO PESOS'],
    [1, 'UN PESO'],
    [15, 'QUINCE PESOS'],
    [21, 'VEINTIÚN PESOS'],
    [30, 'TREINTA PESOS'],
    [45, 'CUARENTA Y CINCO PESOS'],
    [100, 'CIEN PESOS'],
    [101, 'CIENTO UN PESOS'],
    [1001, 'MIL UN PESOS'],
    [999, 'NOVECIENTOS NOVENTA Y NUEVE PESOS'],
    [1000, 'MIL PESOS'],
    [1500, 'MIL QUINIENTOS PESOS'],
    [100000, 'CIEN MIL PESOS'],
    [357000, 'TRESCIENTOS CINCUENTA Y SIETE MIL PESOS'],
    [1000000, 'UN MILLÓN PESOS'],
    [1190000, 'UN MILLÓN CIENTO NOVENTA MIL PESOS'],
    [2000000, 'DOS MILLONES PESOS'],
    [999999999, 'NOVECIENTOS NOVENTA Y NUEVE MILLONES NOVECIENTOS NOVENTA Y NUEVE MIL NOVECIENTOS NOVENTA Y NUEVE PESOS']
  ])('%i -> %s', (n, esperado) => {
    expect(numeroAPalabras(n)).toBe(esperado);
  });

  it('apocopa "uno" delante de MIL, MILLONES y PESOS', () => {
    expect(numeroAPalabras(21000)).toBe('VEINTIÚN MIL PESOS');
    expect(numeroAPalabras(31000)).toBe('TREINTA Y UN MIL PESOS');
    expect(numeroAPalabras(101000)).toBe('CIENTO UN MIL PESOS');
    expect(numeroAPalabras(21000000)).toBe('VEINTIÚN MILLONES PESOS');
    expect(numeroAPalabras(41500000)).toBe('CUARENTA Y UN MILLONES QUINIENTOS MIL PESOS');
  });

  it('trunca decimales y controla límites', () => {
    expect(numeroAPalabras(1500.99)).toBe('MIL QUINIENTOS PESOS');
    expect(numeroAPalabras(-5)).toBe('NÚMERO INVÁLIDO');
    expect(numeroAPalabras(1000000000)).toBe('MONTO EXCEDE LÍMITE');
  });
});

describe('numeroAPalabrasConDecimales', () => {
  it('agrega centavos como fracción', () => {
    expect(numeroAPalabrasConDecimales(1190000.5)).toBe('UN MILLÓN CIENTO NOVENTA MIL PESOS CON 50/100');
    expect(numeroAPalabrasConDecimales(1500)).toBe('MIL QUINIENTOS PESOS');
  });
});
