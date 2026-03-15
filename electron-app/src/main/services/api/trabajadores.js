import fetch from 'node-fetch';
import tokenStore from '../../utils/tokenStore.js';
import { getMachineId } from '../../utils/machineId.js';

const API_BASE_URL = process.env.API_BASE_URL || process.env.API_URL || 'http://localhost:3000/api';

function getAuthHeaders() {
	const token = tokenStore.getAccessToken();

	return {
		'Content-Type': 'application/json',
		'Authorization': `Bearer ${token || ''}`,
		'machineid': getMachineId()
	};
}

function splitNombreApellido(nombreCompleto = '') {
	const normalized = String(nombreCompleto).trim().replace(/\s+/g, ' ');
	if (!normalized) {
		return { nombre: '', apellido: '' };
	}

	const parts = normalized.split(' ');
	if (parts.length === 1) {
		return { nombre: parts[0], apellido: parts[0] };
	}

	return {
		nombre: parts[0],
		apellido: parts.slice(1).join(' ')
	};
}

function mapToTrabajadorSchema(data) {
	const { nombre, apellido } = splitNombreApellido(data.nombre || '');

	return {
		email: data.email || undefined,
		password: data.password || undefined,
		nombre,
		apellido,
		telefono: data.telefono || undefined,
		rut: data.rut || undefined,
		cargo: data.cargo || data.rol || undefined,
		activo: data.activo === undefined ? true : Boolean(data.activo),
		comision: data.comision === undefined || data.comision === '' ? undefined : Number(data.comision),
		local_id: data.local_id === undefined || data.local_id === '' ? undefined : Number(data.local_id)
	};
}

async function parseOrThrow(response, fallbackMessage) {
	const payload = await response.json().catch(() => ({}));
	if (!response.ok) {
		throw new Error(payload.error || payload.message || fallbackMessage);
	}
	return payload;
}

async function createTrabajador(data) {
	const payload = mapToTrabajadorSchema(data);
	const url = `${API_BASE_URL}/trabajadores`;

	if (!payload.nombre || !payload.apellido) {
		throw new Error('El nombre completo del trabajador es requerido');
	}

	const token = tokenStore.getAccessToken();
	console.log('📤 [API:trabajadores:create] Request:', {
		url,
		hasToken: !!token,
		machineId: getMachineId(),
		payload: {
			email: payload.email,
			nombre: payload.nombre,
			apellido: payload.apellido,
			cargo: payload.cargo,
			activo: payload.activo
		}
	});

	const response = await fetch(url, {
		method: 'POST',
		headers: getAuthHeaders(),
		body: JSON.stringify(payload)
	});

	console.log('📥 [API:trabajadores:create] Response status:', response.status);

	return parseOrThrow(response, 'Error al crear trabajador');
}

async function getTrabajadores() {
	const response = await fetch(`${API_BASE_URL}/trabajadores`, {
		headers: getAuthHeaders()
	});
	return parseOrThrow(response, 'Error al obtener trabajadores');
}

async function searchTrabajadores(term = '') {
	const query = new URLSearchParams({ q: term }).toString();
	const response = await fetch(`${API_BASE_URL}/trabajadores/search?${query}`, {
		headers: getAuthHeaders()
	});
	return parseOrThrow(response, 'Error al buscar trabajadores');
}

async function getTrabajadorById(id) {
	const response = await fetch(`${API_BASE_URL}/trabajadores/${id}`, {
		headers: getAuthHeaders()
	});
	return parseOrThrow(response, 'Trabajador no encontrado');
}

async function updateTrabajador(id, data) {
	const payload = mapToTrabajadorSchema(data);
	const response = await fetch(`${API_BASE_URL}/trabajadores/${id}`, {
		method: 'PUT',
		headers: getAuthHeaders(),
		body: JSON.stringify(payload)
	});
	return parseOrThrow(response, 'Error al actualizar trabajador');
}

async function toggleTrabajadorActivo(id) {
	const response = await fetch(`${API_BASE_URL}/trabajadores/${id}/toggle-active`, {
		method: 'PATCH',
		headers: getAuthHeaders()
	});
	return parseOrThrow(response, 'Error al cambiar estado de trabajador');
}

async function deleteTrabajador(id) {
	const response = await fetch(`${API_BASE_URL}/trabajadores/${id}`, {
		method: 'DELETE',
		headers: getAuthHeaders()
	});
	return parseOrThrow(response, 'Error al eliminar trabajador');
}

export default {
	createTrabajador,
	getTrabajadores,
	searchTrabajadores,
	getTrabajadorById,
	updateTrabajador,
	toggleTrabajadorActivo,
	deleteTrabajador
};
