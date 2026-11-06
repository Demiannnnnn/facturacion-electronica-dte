import { describe, it, expect } from 'vitest';
import {
  limpiarRut,
  formatearRut,
  calcularDV,
  validarRut,
  validarTipoRut,
  validarTelefono,
  formatearTelefono,
  validarEmail,
  validarFormularioCliente
} from '../src/renderer/src/utils/validaciones.js';

describe('RUT', () => {
  it('limpiarRut quita puntos y guion', () => {
    expect(limpiarRut('12.345.678-5')).toBe('123456785');
  });

  it('formatearRut agrega puntos, guion y normaliza la K', () => {
    expect(formatearRut('123456785')).toBe('12.345.678-5');
    expect(formatearRut('7612345k')).toBe('7.612.345-K');
    expect(formatearRut('abc')).toBe('');
    expect(formatearRut('5')).toBe('5');
  });

  it('calcularDV aplica módulo 11 (incluye casos 0 y K)', () => {
    expect(calcularDV('12345678')).toBe('5');
    expect(calcularDV('11111111')).toBe('1');
    expect(calcularDV('10000004')).toBe('0');
    expect(calcularDV('10000013')).toBe('K');
  });

  it('validarRut acepta RUT correctos con o sin formato', () => {
    expect(validarRut('12.345.678-5')).toBe(true);
    expect(validarRut('123456785')).toBe(true);
    expect(validarRut('10.000.013-k')).toBe(true);
    expect(validarRut('76.086.428-5')).toBe(true);
  });

  it('validarRut rechaza DV incorrecto, vacíos y cuerpos no numéricos', () => {
    expect(validarRut('12.345.678-9')).toBe(false);
    expect(validarRut('')).toBe(false);
    expect(validarRut('   ')).toBe(false);
    expect(validarRut(null)).toBe(false);
    expect(validarRut('1')).toBe(false);
    expect(validarRut('12A45678-5')).toBe(false);
  });

  it('validarRut rechaza cuerpos entre 101 y 999.999 aunque el DV calce', () => {
    const cuerpo = '500000';
    expect(validarRut(cuerpo + calcularDV(cuerpo))).toBe(false);
  });

  it('validarTipoRut distingue empresa y persona por rango', () => {
    const empresa = '76086428' + calcularDV('76086428');
    const persona = '12345678' + calcularDV('12345678');
    expect(validarTipoRut(empresa, 'rut_empresa')).toBe(true);
    expect(validarTipoRut(empresa, 'rut_persona')).toBe(false);
    expect(validarTipoRut(persona, 'rut_persona')).toBe(true);
    expect(validarTipoRut(persona, 'rut_empresa')).toBe(false);
  });

  it('validarTipoRut: pasaporte y sin identificación no validan módulo 11', () => {
    expect(validarTipoRut('AB123456', 'pasaporte')).toBe(true);
    expect(validarTipoRut('', 'pasaporte')).toBeFalsy();
    expect(validarTipoRut('', 'sin_identificacion')).toBe(true);
    expect(validarTipoRut('12.345.678-9', 'rut_persona')).toBe(false);
  });
});

describe('Teléfono', () => {
  it('validarTelefono acepta móviles chilenos y vacío (opcional)', () => {
    expect(validarTelefono('+56912345678')).toBe(true);
    expect(validarTelefono('912345678')).toBe(true);
    expect(validarTelefono('+56 9 1234 5678')).toBe(true);
    expect(validarTelefono('56-9-1234-5678')).toBe(true);
    expect(validarTelefono('')).toBe(true);
    expect(validarTelefono(undefined)).toBe(true);
  });

  it('validarTelefono rechaza fijos y largos incorrectos', () => {
    expect(validarTelefono('221234567')).toBe(false);
    expect(validarTelefono('91234567')).toBe(false);
    expect(validarTelefono('+5491234567890')).toBe(false);
  });

  it('formatearTelefono produce +56 9 XXXX XXXX', () => {
    expect(formatearTelefono('912345678')).toBe('+56 9 1234 5678');
    expect(formatearTelefono('+56912345678')).toBe('+56 9 1234 5678');
    expect(formatearTelefono('91234')).toBe('+56 9 1234 ');
    expect(formatearTelefono('221234567')).toBe('221234567');
    expect(formatearTelefono('')).toBe('');
  });
});

describe('Email', () => {
  it('validarEmail', () => {
    expect(validarEmail('contacto@empresa.cl')).toBe(true);
    expect(validarEmail('')).toBe(true);
    expect(validarEmail('sin-arroba.cl')).toBe(false);
    expect(validarEmail('a@b')).toBe(false);
    expect(validarEmail('con espacio@x.cl')).toBe(false);
  });
});

describe('validarFormularioCliente', () => {
  const base = { rut: '12.345.678-5', razonSocial: 'Empresa SpA', telefono: '', email: '' };

  it('formulario válido no tiene errores', () => {
    expect(validarFormularioCliente(base)).toEqual({ valido: true, errores: {} });
  });

  it('reporta todos los campos inválidos a la vez', () => {
    const r = validarFormularioCliente({
      rut: '12.345.678-9',
      razonSocial: '  ',
      telefono: '123',
      email: 'malo'
    });
    expect(r.valido).toBe(false);
    expect(Object.keys(r.errores).sort()).toEqual(['email', 'razonSocial', 'rut', 'telefono']);
    expect(r.errores.rut).toMatch(/no es válido/);
  });

  it('RUT faltante usa mensaje de requerido', () => {
    const r = validarFormularioCliente({ ...base, rut: '' });
    expect(r.errores.rut).toBe('El RUT es requerido');
  });
});
