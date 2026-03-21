import fetch from 'node-fetch';
import { apiFetch, buildAuthHeaders } from '../core/auth-session.js';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';

async function getProductos() {
    const res = await apiFetch(`${API_BASE_URL}/productos`, {
        headers: buildAuthHeaders({
            'Content-Type': 'application/json'
        })
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Error al obtener productos');
    }
    return res.json();
}

async function getProductoById(id) {
    const res = await apiFetch(`${API_BASE_URL}/productos/${id}`, {
        headers: buildAuthHeaders({
            'Content-Type': 'application/json'
        })
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Producto no encontrado');
    }
    return res.json();
}

async function createProducto(data) {
    const res = await apiFetch(`${API_BASE_URL}/productos`, {
        method: 'POST',
        headers: buildAuthHeaders({
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify(data)
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Error al crear producto');
    }
    return res.json();
}

async function updateProducto(id, data) {
    const res = await apiFetch(`${API_BASE_URL}/productos/${id}`, {
        method: 'PUT',
        headers: buildAuthHeaders({
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify(data)
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Error al actualizar producto');
    }
    return res.json();
}

async function deleteProducto(id) {
    const res = await apiFetch(`${API_BASE_URL}/productos/${id}`, {
        method: 'DELETE',
        headers: buildAuthHeaders({
            'Content-Type': 'application/json'
        })
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Error al eliminar producto');
    }
}

export default {
    getProductos,
    getProductoById,
    createProducto,
    updateProducto,
    deleteProducto
};