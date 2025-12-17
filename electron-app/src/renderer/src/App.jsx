import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Productos from './pages/Productos';
import Vendedores from './pages/Vendedores';
import Facturas from './pages/Facturas';
import Reportes from './pages/Reportes';
import Layout from './components/layout/Layout';
import ChangePassword from './pages/Configuracion/ChangePassword';
import EmisorConfig from './pages/Configuracion/EmisorConfig';
import UserManual from './pages/Configuracion/UserManual';
import CuentasPorCobrar from './pages/Facturacion/CuentasPorCobrar';

function App() {
  // Listener para eventos del menú
  useEffect(() => {
    const handleMenuEvent = async (event) => {
      try {
        let result;

        switch (event) {
          case 'export-clientes':
            result = await window.api.export.clientes();
            break;
          case 'export-productos':
            result = await window.api.export.productos();
            break;
          case 'export-facturas':
            result = await window.api.export.facturas();
            break;
          default:
            return;
        }

        if (result.success) {
          alert(result.message);
        } else if (result.message !== 'Exportación cancelada') {
          alert(result.message);
        }
      } catch (error) {
        console.error('Error en exportación:', error);
        alert('Error al exportar: ' + error.message);
      }
    };

    // Registrar listener
    window.api.onMenuEvent(handleMenuEvent);
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/clientes"
            element={
              <ProtectedRoute>
                <Layout>
                  <Clientes />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/productos"
            element={
              <ProtectedRoute>
                <Layout>
                  <Productos />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/vendedores"
            element={
              <ProtectedRoute>
                <Layout>
                  <Vendedores />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/facturas"
            element={
              <ProtectedRoute>
                <Layout>
                  <Facturas />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/reportes"
            element={
              <ProtectedRoute>
                <Layout>
                  <Reportes />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/configuracion/cambiar-contrasena"
            element={
              <ProtectedRoute>
                <Layout>
                  <ChangePassword />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/configuracion/emisor"
            element={
              <ProtectedRoute>
                <Layout>
                  <EmisorConfig />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/configuracion/manual"
            element={
              <ProtectedRoute>
                <Layout>
                  <UserManual />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/cuentas-por-cobrar"
            element={
              <ProtectedRoute>
                <Layout>
                  <CuentasPorCobrar />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
