import fetch from 'node-fetch';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';


async function register(name, email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error de registro');
        }
        return await response.json();
    }
    catch (error) {
        console.error('Registration error:', error);
        return { success: false, error: error.message };
    }
}


async function login(email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error de autenticación');
        }
        return await response.json();
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: error.message };
    }
}

async function changePassword(currentPassword, newPassword) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.API_TOKEN || ''}`
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al cambiar contraseña');
        }
        return await response.json();
    }
    catch (error) {
        console.error('Change password error:', error);
        return { success: false, error: error.message };
    }
}

async function me() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            method: 'GET',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.API_TOKEN || ''}`
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al obtener perfil');
        }
        return await response.json();
    }

    catch (error) {
        console.error('Get profile error:', error);
        return { success: false, error: error.message };
    }
}

export default {
    register,
    login,
    changePassword,
    me
};