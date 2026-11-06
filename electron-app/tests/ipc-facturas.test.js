import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { invoke } from 'electron';
import { nuevaBaseDeDatos, insertarCliente, insertarProducto } from './helpers/db.js';

// El envío al SII pasa por la API remota: se reemplaza por un doble controlable
const enviarDTE = vi.fn();
vi.mock('../src/main/services/api-client.js', () => ({
  getAPIClient: () => ({ enviarDTE })
}));

const { registerFacturasHandlers } = await import('../src/main/ipc/facturas.js');
const { registerFoliosHandlers } = await import('../src/main/ipc/folios.js');

const emisor = {
  rut: '76.086.428-5',
  razon_social: 'Emisor SpA',
  giro: 'Comercio',
  direccion: 'Calle 1',
  comuna: 'Santiago',
  ciudad: 'Santiago'
};

function nuevaFactura(clienteId, items) {
  const subtotal = items.reduce((s, i) => s + i.monto_item, 0);
  const iva = Math.round(subtotal * 0.19);
  return {
    factura: { cliente_id: clienteId, fecha: '2025-03-10', subtotal, iva, total: subtotal + iva },
    items
  };
}

let ctx;
let cwdOriginal;
let cwdTemporal;

beforeAll(() => {
  registerFacturasHandlers();
  registerFoliosHandlers();
});

beforeEach(() => {
  ctx = nuevaBaseDeDatos();
  // facturas:create guarda el XML en <cwd>/XMLs: se redirige a un directorio temporal
  cwdOriginal = process.cwd();
  cwdTemporal = fs.mkdtempSync(path.join(os.tmpdir(), 'facturacion-cwd-'));
  process.chdir(cwdTemporal);
  enviarDTE.mockReset();
  enviarDTE.mockResolvedValue({ success: true, trackId: 'TRK-1', estado: 'RECIBIDO' });
});

afterEach(() => {
  process.chdir(cwdOriginal);
  fs.rmSync(cwdTemporal, { recursive: true, force: true });
  ctx.cerrar();
});

describe('facturas:create', () => {
  it('asigna folios correlativos, guarda ítems y descuenta stock', async () => {
    const { db } = ctx;
    const clienteId = insertarCliente(db);
    const productoId = insertarProducto(db, { stock: 10 });

    const r1 = await invoke('facturas:create', nuevaFactura(clienteId, [
      { producto_id: productoId, descripcion: 'Producto', cantidad: 3, precio_unitario: 1000, monto_item: 3000 },
      { descripcion: 'Servicio', cantidad: 1, precio_unitario: 500, monto_item: 500 }
    ]));
    const r2 = await invoke('facturas:create', nuevaFactura(clienteId, [
      { producto_id: productoId, descripcion: 'Producto', cantidad: 2, precio_unitario: 1000, monto_item: 2000 }
    ]));

    expect(r1).toMatchObject({ success: true, data: { folio: 1 } });
    expect(r2).toMatchObject({ success: true, data: { folio: 2 } });
    expect(db.prepare('SELECT actual FROM folios WHERE tipo_documento = 33').get().actual).toBe(3);
    expect(db.prepare('SELECT stock FROM productos WHERE id = ?').get(productoId).stock).toBe(5);

    const items = db.prepare('SELECT numero_linea, descripcion, unidad FROM factura_items WHERE factura_id = ? ORDER BY numero_linea').all(r1.data.id);
    expect(items).toEqual([
      { numero_linea: 1, descripcion: 'Producto', unidad: 'UN' },
      { numero_linea: 2, descripcion: 'Servicio', unidad: 'UN' }
    ]);

    const factura = db.prepare('SELECT estado, forma_pago, total FROM facturas WHERE id = ?').get(r1.data.id);
    expect(factura).toEqual({ estado: 'pendiente', forma_pago: 'contado', total: 4165 });
  });

  it('con emisor configurado genera el XML DTE y guarda el track del SII', async () => {
    const { db } = ctx;
    await invoke('emisor:save', emisor);
    const clienteId = insertarCliente(db);

    const r = await invoke('facturas:create', nuevaFactura(clienteId, [
      { descripcion: 'Item', cantidad: 1, precio_unitario: 1000, monto_item: 1000 }
    ]));

    expect(enviarDTE).toHaveBeenCalledTimes(1);
    const envio = enviarDTE.mock.calls[0][0];
    expect(envio).toMatchObject({ folio: 1, tipoDocumento: 33, emisor: { rut: emisor.rut }, receptor: { rut: '12.345.678-5' } });
    expect(envio.xml).toContain('<TipoDTE>33</TipoDTE>');
    expect(fs.existsSync(path.join(cwdTemporal, 'XMLs', 'factura-1.xml'))).toBe(true);

    const f = db.prepare('SELECT sii_track_id, sii_estado FROM facturas WHERE id = ?').get(r.data.id);
    expect(f).toEqual({ sii_track_id: 'TRK-1', sii_estado: 'RECIBIDO' });
  });

  it('si falla el SII la factura igual queda creada', async () => {
    const { db } = ctx;
    await invoke('emisor:save', emisor);
    enviarDTE.mockRejectedValue(new Error('timeout'));

    const r = await invoke('facturas:create', nuevaFactura(insertarCliente(db), [
      { descripcion: 'Item', cantidad: 1, precio_unitario: 1000, monto_item: 1000 }
    ]));

    expect(r.success).toBe(true);
    expect(db.prepare('SELECT sii_track_id FROM facturas WHERE id = ?').get(r.data.id).sii_track_id).toBeNull();
  });

  it('hace rollback (folio y stock intactos) si el cliente no existe', async () => {
    const { db } = ctx;
    const productoId = insertarProducto(db, { stock: 10 });

    const r = await invoke('facturas:create', nuevaFactura(999, [
      { producto_id: productoId, descripcion: 'Producto', cantidad: 4, precio_unitario: 1000, monto_item: 4000 }
    ]));

    expect(r.success).toBe(false);
    expect(db.prepare('SELECT COUNT(*) AS n FROM facturas').get().n).toBe(0);
    expect(db.prepare('SELECT actual FROM folios WHERE tipo_documento = 33').get().actual).toBe(1);
    expect(db.prepare('SELECT stock FROM productos WHERE id = ?').get(productoId).stock).toBe(10);
  });

  it('rechaza la factura cuando se agotaron los folios', async () => {
    const { db } = ctx;
    db.prepare('UPDATE folios SET actual = 11, hasta = 10 WHERE tipo_documento = 33').run();

    const r = await invoke('facturas:create', nuevaFactura(insertarCliente(db), [
      { descripcion: 'Item', cantidad: 1, precio_unitario: 1000, monto_item: 1000 }
    ]));

    expect(r).toEqual({ success: false, error: 'Se han agotado los folios disponibles' });
  });
});

describe('consultas y estado de facturas', () => {
  it('search filtra por estado y fecha; updateEstado cambia el estado', async () => {
    const { db } = ctx;
    const clienteId = insertarCliente(db);
    const item = [{ descripcion: 'Item', cantidad: 1, precio_unitario: 1000, monto_item: 1000 }];
    const a = await invoke('facturas:create', nuevaFactura(clienteId, item));
    const bData = nuevaFactura(clienteId, item);
    bData.factura.fecha = '2025-05-01';
    await invoke('facturas:create', bData);

    expect(await invoke('facturas:updateEstado', { id: a.data.id, estado: 'pagada' })).toEqual({ success: true });
    expect((await invoke('facturas:updateEstado', { id: 999, estado: 'pagada' })).error).toBe('Factura no encontrada');

    const pagadas = await invoke('facturas:search', { estado: 'pagada' });
    expect(pagadas.data.map((f) => f.folio)).toEqual([1]);

    const todas = await invoke('facturas:search', { estado: 'todos' });
    expect(todas.data.map((f) => f.folio)).toEqual([2, 1]);

    const abril = await invoke('facturas:search', { fecha_desde: '2025-04-01', fecha_hasta: '2025-12-31' });
    expect(abril.data.map((f) => f.folio)).toEqual([2]);
    expect(abril.data[0].cliente_nombre).toBe('Cliente Ltda');
  });

  it('getNextFolio devuelve el folio actual de facturas', async () => {
    expect(await invoke('facturas:getNextFolio')).toEqual({ success: true, data: 1 });
  });
});

describe('folios', () => {
  it('getAll incluye nombre descriptivo y folios disponibles', async () => {
    const r = await invoke('folios:getAll');
    const factura = r.data.find((f) => f.tipo_documento === 33);
    expect(factura).toMatchObject({ nombre: 'Factura Electrónica', desde: 1, hasta: 10000, disponibles: 10000 });
    expect(r.data.map((f) => f.tipo_documento)).toEqual([33, 52, 56, 61]);
  });

  it('update valida el rango contra el folio actual', async () => {
    const { db } = ctx;
    const { id } = db.prepare('SELECT id FROM folios WHERE tipo_documento = 33').get();
    db.prepare('UPDATE folios SET actual = 50 WHERE id = ?').run(id);

    expect((await invoke('folios:update', { id, desde: 0, hasta: 100 })).error).toMatch(/mayor a 0/);
    expect((await invoke('folios:update', { id, desde: 10, hasta: 10 })).error).toMatch(/mayor al folio inicial/);
    expect((await invoke('folios:update', { id, desde: 60, hasta: 100 })).error).toMatch(/folio actual \(50\)/);
    expect((await invoke('folios:update', { id, desde: 1, hasta: 40 })).error).toMatch(/menor al folio actual/);
    expect((await invoke('folios:update', { id: 999, desde: 1, hasta: 40 })).error).toBe('Folio no encontrado');

    const ok = await invoke('folios:update', { id, desde: 1, hasta: 60 });
    expect(ok).toMatchObject({ success: true, data: { hasta: 60, disponibles: 11 } });
  });

  it('getNext informa cuando los folios están agotados o no configurados', async () => {
    const { db } = ctx;
    db.prepare('UPDATE folios SET actual = 10001 WHERE tipo_documento = 52').run();
    expect((await invoke('folios:getNext', 52)).error).toMatch(/Se agotaron los folios para Guía de Despacho/);
    expect((await invoke('folios:getNext', 39)).error).toMatch(/No hay folios configurados/);
    expect(await invoke('folios:getNext', 61)).toEqual({ success: true, data: 1 });
  });
});
