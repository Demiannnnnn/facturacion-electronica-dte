import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';
import { invoke } from 'electron';
import { nuevaBaseDeDatos, insertarCliente } from './helpers/db.js';

// La creación de clientes también se envía a la API remota: se simula
const crearCliente = vi.fn();
vi.mock('../src/main/services/api/clientes.js', () => ({
  default: { crearCliente: (...a) => crearCliente(...a) }
}));

const { registerAuthHandlers } = await import('../src/main/ipc/auth.js');
const { registerClientesHandlers } = await import('../src/main/ipc/clientes.js');
const { getCurrentUser } = await import('../src/main/utils/session.js');

let ctx;

beforeAll(() => {
  registerAuthHandlers();
  registerClientesHandlers();
});

beforeEach(() => {
  ctx = nuevaBaseDeDatos();
  crearCliente.mockReset();
});

afterEach(async () => {
  await invoke('auth:logout');
  ctx.cerrar();
});

describe('auth', () => {
  it('valida usuario y contraseña al registrar', async () => {
    expect((await invoke('auth:register', { username: 'ab', password: '12345678' })).error).toMatch(/entre 3 y 50/);
    expect((await invoke('auth:register', { username: 'admin', password: 'corta' })).error).toMatch(/al menos 8/);
  });

  it('solo permite registrar el primer usuario y guarda el hash, no la contraseña', async () => {
    expect(await invoke('auth:checkFirstRun')).toEqual({ isFirstRun: true });

    const r = await invoke('auth:register', { username: 'admin', password: 'secreta123' });
    expect(r).toMatchObject({ success: true, user: { username: 'admin' } });

    const { password_hash } = ctx.db.prepare('SELECT password_hash FROM users').get();
    expect(password_hash).not.toBe('secreta123');
    expect(password_hash).toMatch(/^\$2[aby]\$10\$/);

    expect(await invoke('auth:checkFirstRun')).toEqual({ isFirstRun: false });
    expect((await invoke('auth:register', { username: 'otro', password: 'secreta123' })).error).toBe('Ya existe un usuario registrado');
  });

  it('login correcto abre sesión; credenciales malas usan un mensaje genérico', async () => {
    await invoke('auth:register', { username: 'admin', password: 'secreta123' });

    expect((await invoke('auth:login', { username: 'admin', password: 'mala-clave' })).error).toBe('Usuario o contraseña incorrectos');
    expect((await invoke('auth:login', { username: 'nadie', password: 'secreta123' })).error).toBe('Usuario o contraseña incorrectos');
    expect((await invoke('auth:login', { username: '', password: '' })).error).toMatch(/requeridos/);
    expect(getCurrentUser()).toBeNull();

    const ok = await invoke('auth:login', { username: 'admin', password: 'secreta123' });
    expect(ok.success).toBe(true);
    expect((await invoke('auth:getCurrentUser')).user).toEqual({ id: ok.user.id, username: 'admin' });

    await invoke('auth:logout');
    expect((await invoke('auth:getCurrentUser')).user).toBeNull();
  });

  it('changePassword exige la contraseña actual y una nueva distinta', async () => {
    const { user } = await invoke('auth:register', { username: 'admin', password: 'secreta123' });
    const cambiar = (currentPassword, newPassword, userId = user.id) =>
      invoke('auth:changePassword', { userId, currentPassword, newPassword });

    expect((await cambiar('secreta123', 'corta')).error).toMatch(/al menos 8/);
    expect((await cambiar('secreta123', 'secreta123')).error).toMatch(/diferente/);
    expect((await cambiar('incorrecta', 'nueva-clave-1')).error).toMatch(/actual es incorrecta/);
    expect((await cambiar('secreta123', 'nueva-clave-1', 999)).error).toBe('Usuario no encontrado');

    expect(await cambiar('secreta123', 'nueva-clave-1')).toEqual({ success: true });
    expect((await invoke('auth:login', { username: 'admin', password: 'secreta123' })).success).toBe(false);
    expect((await invoke('auth:login', { username: 'admin', password: 'nueva-clave-1' })).success).toBe(true);
  });
});

describe('clientes', () => {
  const cliente = { rut: '76.086.428-5', razonSocial: 'Comercial SpA', email: 'a@b.cl' };

  it('crea el cliente localmente con valores por defecto aunque la API falle', async () => {
    crearCliente.mockRejectedValue(new Error('API caída'));

    const r = await invoke('clientes:create', cliente);
    expect(r.success).toBe(true);
    expect(r.data.api).toBeNull();

    const row = ctx.db.prepare('SELECT * FROM clientes WHERE id = ?').get(r.data.id);
    expect(row).toMatchObject({
      rut: '76.086.428-5',
      razon_social: 'Comercial SpA',
      tipo_documento: 'rut_empresa',
      condicion_pago: 'contado',
      lista_precios: 'normal',
      giro: null
    });
  });

  it('no permite RUT duplicado', async () => {
    crearCliente.mockResolvedValue({ id: 1 });
    expect((await invoke('clientes:create', cliente)).success).toBe(true);
    const dup = await invoke('clientes:create', cliente);
    expect(dup.success).toBe(false);
    expect(dup.error).toMatch(/UNIQUE/);
  });

  it('update y delete informan cuando el cliente no existe', async () => {
    expect((await invoke('clientes:update', { id: 999, cliente })).error).toBe('Cliente no encontrado');
    expect((await invoke('clientes:delete', 999)).error).toBe('Cliente no encontrado');
  });

  it('no elimina clientes con facturas asociadas', async () => {
    const { db } = ctx;
    const id = insertarCliente(db);
    const now = new Date().toISOString();
    db.prepare(
      `INSERT INTO facturas (folio, cliente_id, fecha, subtotal, iva, total, estado, created_at, updated_at)
       VALUES (1, ?, '2025-01-01', 100, 19, 119, 'pendiente', ?, ?)`
    ).run(id, now, now);

    expect((await invoke('clientes:delete', id)).error).toMatch(/tiene 1 factura\(s\) asociada\(s\)/);

    const libre = insertarCliente(db, { rut: '11.111.111-1' });
    expect(await invoke('clientes:delete', libre)).toEqual({ success: true });
  });
});
