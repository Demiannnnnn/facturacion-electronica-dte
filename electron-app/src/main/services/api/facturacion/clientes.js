
import fetch from 'node-fetch';
import { apiFetch, buildAuthHeaders } from '../core/auth-session.js';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';

async function getClientes() {
  const res = await apiFetch(`${API_BASE_URL}/clientes`, {
    headers: buildAuthHeaders({
      'Content-Type': 'application/json'
    })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || 'Error al obtener clientes');
  }
  return res.json();
}

async function getClienteById(id) {
  const res = await apiFetch(`${API_BASE_URL}/clientes/${id}`, {
    headers: buildAuthHeaders({
      'Content-Type': 'application/json'
    })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || 'Cliente no encontrado');
  }
  return res.json();
}

async function crearCliente(data) {
  console.log('API clientes: creating cliente');
  console.log('API clientes: payload ->', data);

  const res = await apiFetch(`${API_BASE_URL}/clientes`, {
    method: 'POST',
    headers: buildAuthHeaders({
      'Content-Type': 'application/json'
    }),
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || 'Error al crear cliente');
  }
  return res.json();
}

async function actualizarCliente(id, data) {
  console.log('API clientes: actualizando cliente', id);

  const res = await apiFetch(`${API_BASE_URL}/clientes/${id}`, {
    method: 'PUT',
    headers: buildAuthHeaders({
      'Content-Type': 'application/json'
    }),
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || 'Error al actualizar cliente');
  }
  return res.json();
}

export default {
  getClientes,
  getClienteById,
  crearCliente,
  actualizarCliente
};