import { describe, it, expect } from 'vitest';
import xml2js from 'xml2js';
import dteGenerator, { DTEGenerator } from '../src/main/services/dte-generator.js';

const emisor = {
  rut: '76.086.428-5',
  razon_social: 'Emisor SpA',
  giro: 'Venta de insumos',
  actividad_economica: '471000',
  direccion: 'Av. Siempre Viva 123',
  comuna: 'Santiago',
  ciudad: 'Santiago'
};

function factura(overrides = {}) {
  return {
    folio: 42,
    fecha: '2025-03-10T12:00:00.000Z',
    forma_pago: 'contado',
    cliente_rut: '12.345.678-5',
    cliente_razon_social: 'Cliente Ltda',
    subtotal: 10000.4,
    iva: 1900.2,
    total: 11900.6,
    items: [
      { descripcion: 'Producto A', cantidad: 2, precio_unitario: 3000, descuento: 0, monto_item: 6000 },
      { descripcion: 'Producto B', cantidad: 1, precio_unitario: 5000, descuento: 20, monto_item: 4000, unidad: 'KG' }
    ],
    ...overrides
  };
}

async function parse(xml) {
  return xml2js.parseStringPromise(xml, { explicitArray: false });
}

describe('DTEGenerator', () => {
  it('formatRutForXML y formatFecha', () => {
    expect(dteGenerator.formatRutForXML('76.086.428-5')).toBe('760864285');
    expect(dteGenerator.formatFecha('2025-03-10T12:00:00Z')).toBe('2025-03-10');
    expect(dteGenerator.formatFecha(undefined)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('genera una factura electrónica tipo 33 con encabezado y totales redondeados', async () => {
    const xml = dteGenerator.generarFacturaElectronica(factura(), emisor);
    expect(xml.startsWith('<?xml version="1.0" encoding="ISO-8859-1"?>')).toBe(true);

    const { DTE } = await parse(xml);
    const doc = DTE.Documento;
    expect(doc.$.ID).toBe('F42T33');
    expect(doc.Encabezado.IdDoc).toMatchObject({ TipoDTE: '33', Folio: '42', FchEmis: '2025-03-10', FmaPago: '1' });
    expect(doc.Encabezado.IdDoc.FchVenc).toBeUndefined();
    expect(doc.Encabezado.Emisor.RUTEmisor).toBe('760864285');
    expect(doc.Encabezado.Receptor).toMatchObject({
      RUTRecep: '123456785',
      RznSocRecep: 'Cliente Ltda',
      GiroRecep: 'Sin especificar',
      CmnaRecep: 'Sin especificar'
    });
    expect(doc.Encabezado.Totales).toEqual({ MntNeto: '10000', TasaIVA: '19', IVA: '1900', MntTotal: '11901' });
  });

  it('agrega líneas de detalle numeradas y descuentos solo cuando existen', async () => {
    const { DTE } = await parse(dteGenerator.generarFacturaElectronica(factura(), emisor));
    const [l1, l2] = DTE.Documento.Detalle;
    expect(l1).toMatchObject({ NroLinDet: '1', NmbItem: 'Producto A', QtyItem: '2', UnmdItem: 'UN', MontoItem: '6000' });
    expect(l1.DescuentoPct).toBeUndefined();
    expect(l2).toMatchObject({ NroLinDet: '2', UnmdItem: 'KG', DescuentoPct: '20', DescuentoMonto: '1000', MontoItem: '4000' });
  });

  it('pago a crédito usa FmaPago 2 e incluye la fecha de vencimiento', async () => {
    const xml = dteGenerator.generarFacturaElectronica(
      factura({ forma_pago: 'credito', fecha_vencimiento: '2025-04-09T00:00:00Z' }),
      emisor
    );
    const { DTE } = await parse(xml);
    expect(DTE.Documento.Encabezado.IdDoc.FmaPago).toBe('2');
    expect(DTE.Documento.Encabezado.IdDoc.FchVenc).toBe('2025-04-09');
  });

  it('escapa caracteres especiales en razones sociales', () => {
    const xml = dteGenerator.generarFacturaElectronica(factura({ cliente_razon_social: 'A & B <Ltda>' }), emisor);
    expect(xml).toContain('A &amp; B &lt;Ltda&gt;');
  });

  it('validarXML detecta documentos vacíos o incompletos', () => {
    expect(dteGenerator.validarXML('')).toEqual({ valid: false, error: 'XML vacío' });
    expect(dteGenerator.validarXML('<foo/>').valid).toBe(false);
    expect(dteGenerator.validarXML('<DTE></DTE>').error).toMatch(/Documento/);
    expect(dteGenerator.validarXML(dteGenerator.generarFacturaElectronica(factura(), emisor))).toEqual({ valid: true });
  });

  it('guías y notas de crédito aún no están implementadas', () => {
    const g = new DTEGenerator();
    expect(() => g.generarGuiaDespacho({}, emisor)).toThrow(/no implementadas/);
    expect(() => g.generarNotaCredito({}, emisor, {})).toThrow(/no implementadas/);
  });
});
