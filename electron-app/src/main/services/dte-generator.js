import xml2js from 'xml2js';

/**
 * Generador de XML DTE según formato oficial del SII de Chile
 * Basado en el esquema XML versión 2.2 del SII
 */
class DTEGenerator {
    constructor() {
        this.builder = new xml2js.Builder({
            xmldec: { version: '1.0', encoding: 'ISO-8859-1' },
            renderOpts: { pretty: true, indent: '  ' }
        });
    }

    /**
     * Formatea RUT sin puntos ni guión
     */
    formatRutForXML(rut) {
        return rut.replace(/\./g, '').replace(/-/g, '');
    }

    /**
     * Formatea fecha para XML (YYYY-MM-DD)
     */
    formatFecha(fecha) {
        if (!fecha) return new Date().toISOString().split('T')[0];
        return fecha.split('T')[0];
    }

    /**
     * Genera XML de Factura Electrónica (Tipo 33)
     */
    generarFacturaElectronica(factura, emisor) {
        const fechaEmision = this.formatFecha(factura.fecha);

        // Estructura del DTE según formato oficial SII
        const dte = {
            DTE: {
                $: {
                    version: '1.0'
                },
                Documento: {
                    $: {
                        ID: `F${factura.folio}T33`
                    },
                    // ENCABEZADO
                    Encabezado: {
                        IdDoc: {
                            TipoDTE: 33, // Factura Electrónica
                            Folio: factura.folio,
                            FchEmis: fechaEmision,
                            FmaPago: factura.forma_pago === 'contado' ? 1 : 2, // 1=Contado, 2=Crédito
                            ...(factura.forma_pago === 'credito' && factura.fecha_vencimiento && {
                                FchVenc: this.formatFecha(factura.fecha_vencimiento)
                            })
                        },
                        Emisor: {
                            RUTEmisor: this.formatRutForXML(emisor.rut),
                            RznSoc: emisor.razon_social,
                            GiroEmis: emisor.giro,
                            Acteco: emisor.actividad_economica || '0',
                            DirOrigen: emisor.direccion,
                            CmnaOrigen: emisor.comuna,
                            CiudadOrigen: emisor.ciudad
                        },
                        Receptor: {
                            RUTRecep: this.formatRutForXML(factura.cliente_rut),
                            RznSocRecep: factura.cliente_razon_social,
                            GiroRecep: factura.cliente_giro || 'Sin especificar',
                            DirRecep: factura.cliente_direccion || 'Sin especificar',
                            CmnaRecep: factura.cliente_comuna || 'Sin especificar',
                            CiudadRecep: factura.cliente_ciudad || 'Sin especificar'
                        },
                        Totales: {
                            MntNeto: Math.round(factura.subtotal), // Monto neto (sin IVA)
                            TasaIVA: 19,
                            IVA: Math.round(factura.iva),
                            MntTotal: Math.round(factura.total)
                        }
                    },
                    // DETALLE (Items)
                    Detalle: factura.items.map((item, index) => ({
                        NroLinDet: index + 1,
                        NmbItem: item.descripcion,
                        QtyItem: item.cantidad,
                        UnmdItem: item.unidad || 'UN',
                        PrcItem: Math.round(item.precio_unitario),
                        ...(item.descuento > 0 && {
                            DescuentoPct: item.descuento,
                            DescuentoMonto: Math.round((item.precio_unitario * item.cantidad * item.descuento) / 100)
                        }),
                        MontoItem: Math.round(item.monto_item)
                    }))
                }
            }
        };

        // Generar XML
        const xml = this.builder.buildObject(dte);
        return xml;
    }

    /**
     * Genera XML de Guía de Despacho (Tipo 52)
     */
    generarGuiaDespacho(guia, emisor) {
        // TODO: Implementar cuando se agreguen guías
        throw new Error('Guías de despacho no implementadas aún');
    }

    /**
     * Genera XML de Nota de Crédito (Tipo 61)
     */
    generarNotaCredito(nota, emisor, facturaReferencia) {
        // TODO: Implementar cuando se agreguen notas de crédito
        throw new Error('Notas de crédito no implementadas aún');
    }

    /**
     * Valida XML contra esquema (básico)
     */
    validarXML(xml) {
        // Validaciones básicas
        if (!xml || xml.length === 0) {
            return { valid: false, error: 'XML vacío' };
        }

        if (!xml.includes('<DTE')) {
            return { valid: false, error: 'XML no contiene tag DTE' };
        }

        if (!xml.includes('<Documento')) {
            return { valid: false, error: 'XML no contiene tag Documento' };
        }

        // TODO: Validación contra XSD del SII (requiere librería adicional)

        return { valid: true };
    }
}

const dteGenerator = new DTEGenerator();
export default dteGenerator;
export { DTEGenerator };
