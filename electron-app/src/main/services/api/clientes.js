
import fetch from 'node-fetch';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';

async function getClientes() {
  const res = await fetch(`${API_BASE_URL}/clientes`);
  if (!res.ok) throw new Error('Error al obtener clientes');
  return res.json();
}

async function getClienteById(id) {
  const res = await fetch(`${API_BASE_URL}/clientes/${id}`);
  if (!res.ok) throw new Error('Cliente no encontrado');
  return res.json();
}

async function crearCliente(data) {
  const res = await fetch(`${API_BASE_URL}/clientes`, {
    method: 'POST',
    headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.API_TOKEN || ''}`,
        
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