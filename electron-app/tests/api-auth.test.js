import { describe, it, expect, vi, beforeEach } from 'vitest';

const fetchMock = vi.fn();
vi.mock('node-fetch', () => ({ default: (...a) => fetchMock(...a) }));

const { default: authApi } = await import('../src/main/services/api/auth.js');

function respuesta(ok, body) {
  return { ok, json: async () => body };
}

beforeEach(() => fetchMock.mockReset());

describe('services/api/auth', () => {
  it('login envía credenciales por POST y devuelve el cuerpo', async () => {
    fetchMock.mockResolvedValue(respuesta(true, { token: 't' }));
    expect(await authApi.login('a@b.cl', 'clave')).toEqual({ token: 't' });

    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toMatch(/\/auth\/login$/);
    expect(opts.method).toBe('POST');
    expect(JSON.parse(opts.body)).toEqual({ email: 'a@b.cl', password: 'clave' });
  });

  it('propaga el mensaje del servidor cuando la respuesta no es ok', async () => {
    fetchMock.mockResolvedValue(respuesta(false, { message: 'Credenciales inválidas' }));
    expect(await authApi.login('a@b.cl', 'x')).toEqual({ success: false, error: 'Credenciales inválidas' });
  });

  it('usa un mensaje por defecto y captura errores de red', async () => {
    fetchMock.mockResolvedValueOnce(respuesta(false, {}));
    expect((await authApi.register('n', 'a@b.cl', 'x')).error).toBe('Error de registro');

    fetchMock.mockRejectedValueOnce(new Error('ECONNREFUSED'));
    expect(await authApi.me()).toEqual({ success: false, error: 'ECONNREFUSED' });
  });

  it('las rutas autenticadas envían el header Authorization', async () => {
    fetchMock.mockResolvedValue(respuesta(true, { ok: true }));
    await authApi.changePassword('a', 'b');
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toMatch(/^Bearer /);
  });
});
