
import fetch from 'node-fetch';
import tokenStore from '../../utils/tokenStore.js';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';

async function getClientes() {
  const res = await fetch(`${API_BASE_URL}/clientes`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenStore.getAccessToken() || ''}`
    }
  });
  if (!res.ok) throw new Error('Error al obtener clientes');
  return res.json();
}

async function getClienteById(id) {
  const res = await fetch(`${API_BASE_URL}/clientes/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenStore.getAccessToken() || ''}`
    }
  });
  if (!res.ok) throw new Error('Cliente no encontrado');
  return res.json();
}

async function crearCliente(data) {
  const token = tokenStore.getAccessToken();
  console.log('API clientes: using access token ->', token ? 'PRESENT' : 'MISSING');
  console.log('API clientes: payload ->', data);

  const res = await fetch(`${API_BASE_URL}/clientes`, {
    method: 'POST',
    headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token || ''}`,
        
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Error al crear cliente');
  return res.json();
}

export default {
  getClientes,
  getClienteById,
  crearCliente
};