import { apiFetch, buildAuthHeaders } from '../core/auth-session.js';

const API_BASE_URL = process.env.API_BASE_URL || process.env.API_URL || 'http://localhost:3000/api';

function toDateOnly(value) {
	if (!value) {
		return new Date().toISOString().split('T')[0];
	}

	const raw = String(value);
	if (raw.includes('T')) {
		return raw.split('T')[0];
	}

	return raw;
}

function toNumber(value, fallback = 0) {
	const n = Number(value);
	return Number.isFinite(n) ? n : fallback;
}

function parseOrThrow(response, fallbackMessage) {
	return response.json().then((payload) => {
		if (!response.ok || payload?.success === false) {
			throw new Error(payload?.error || payload?.message || fallbackMessage);
		}
		return payload;
	});
}

function normalizeItems(items = []) {
	return (items || []).map((item, index) => ({
		numeroLinea: toNumber(item.numeroLinea ?? item.numero_linea ?? index + 1, index + 1),
		descripcion: item.descripcion || item.nombre || '',
		cantidad: toNumber(item.cantidad, 0),
		unidad: item.unidad || 'UN',
		precioUnitario: toNumber(item.precioUnitario ?? item.precio_unitario, 0),
		montoItem: toNumber(item.montoItem ?? item.monto_item, 0)
	}));
}

export function buildDocumentoPayload(documento = {}) {
	return {
		tipoDocumento: toNumber(documento.tipoDocumento ?? documento.tipo_documento ?? 33, 33),
		folio: toNumber(documento.folio, 0),
		fechaEmision: toDateOnly(documento.fechaEmision ?? documento.fecha),
		subtotal: toNumber(documento.subtotal, 0),
		iva: toNumber(documento.iva, 0),
		total: toNumber(documento.total, 0),
		clienteRut: documento.clienteRut ?? documento.cliente_rut ?? '',
		clienteRazonSocial: documento.clienteRazonSocial ?? documento.cliente_razon_social ?? '',
		clienteGiro: documento.clienteGiro ?? documento.cliente_giro ?? '',
		clienteDireccion: documento.clienteDireccion ?? documento.cliente_direccion ?? '',
		clienteComuna: documento.clienteComuna ?? documento.cliente_comuna ?? '',
		items: normalizeItems(documento.items)
	};
}

async function enviarDocumento(documento = {}) {
	const payload = buildDocumentoPayload(documento);

	const response = await apiFetch(`${API_BASE_URL}/documentos`, {
		method: 'POST',
		headers: buildAuthHeaders({
			'Content-Type': 'application/json'
		}),
		body: JSON.stringify(payload)
	});

	return parseOrThrow(response, 'Error al enviar documento');
}

async function consultarEstado(trackId) {
	const response = await apiFetch(`${API_BASE_URL}/documentos/estado/${trackId}`, {
		method: 'GET',
		headers: buildAuthHeaders({
			'Content-Type': 'application/json'
		})
	});

	return parseOrThrow(response, 'Error al consultar estado del documento');
}

async function generarPDFTimbrado(folio) {
	const response = await apiFetch(`${API_BASE_URL}/documentos/pdf/${folio}`, {
		method: 'GET',
		headers: buildAuthHeaders({
			'Content-Type': 'application/json'
		})
	});

	return parseOrThrow(response, 'Error al generar PDF timbrado');
}

export default {
	buildDocumentoPayload,
	enviarDocumento,
	consultarEstado,
	generarPDFTimbrado
};
