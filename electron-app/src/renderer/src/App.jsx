import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleSelectionPage from './pages/Auth/RoleSelectionPage';
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
import Folios from './pages/Configuracion/Folios';
import CuentasPorCobrar from './pages/Facturacion/CuentasPorCobrar';

function App() {
  // Listener para eventos del menú
  useEffect(() => {
    const handleMenuEvent = async (event) => {
      try {
        let result;

        switch (event) {
          // EXPORTACIÓN
          case 'export-clientes':
            result = await window.api.export.clientes();
            if (result.success) {
              alert(result.message);
            } else if (result.message !== 'Exportación cancelada') {
              alert(result.message);
            }
            break;

          case 'export-productos':
            result = await window.api.export.productos();
            if (result.success) {
              alert(result.message);
            } else if (result.message !== 'Exportación cancelada') {
              alert(result.message);
            }
            break;

          case 'export-facturas':
            result = await window.api.export.facturas();
            if (result.success) {
              alert(result.message);
            } else if (result.message !== 'Exportación cancelada') {
              alert(result.message);
            }
            break;

          // IMPORTACIÓN
          case 'import-clientes':
            result = await window.api.import.clientes({ updateExisting: true });
            if (result.success) {
              let mensaje = `✅ Importación completada\n\n`;
              mensaje += `📊 Total procesados: ${result.totalProcesados}\n`;
              mensaje += `✅ Nuevos: ${result.insertados}\n`;
              mensaje += `🔄 Actualizados: ${result.actualizados}\n`;

              if (result.erroresValidacion && result.erroresValidacion.length > 0) {
                mensaje += `\n⚠️ Errores de validación: ${result.erroresValidacion.length}\n`;
                mensaje += `\nPrimeros errores:\n`;
                result.erroresValidacion.slice(0, 3).forEach(err => {
                  mensaje += `\nLínea ${err.linea}: ${err.razonSocial || err.rut}\n`;
                  mensaje += `  - ${err.errores.join(', ')}\n`;
                });
              }

              alert(mensaje);
              // Recargar la página si estamos en clientes
              if (window.location.pathname === '/clientes') {
                window.location.reload();
              }
            } else if (!result.canceled) {
              alert(result.message);
            }
            break;

          case 'import-productos':
            result = await window.api.import.productos({ updateExisting: true, checkByName: true });
            if (result.success) {
              let mensaje = `✅ Importación completada\n\n`;
              mensaje += `📊 Total procesados: ${result.totalProcesados}\n`;
              mensaje += `✅ Nuevos: ${result.insertados}\n`;
              mensaje += `🔄 Actualizados: ${result.actualizados}\n`;

              if (result.erroresValidacion && result.erroresValidacion.length > 0) {
                mensaje += `\n⚠️ Errores de validación: ${result.erroresValidacion.length}\n`;
                mensaje += `\nPrimeros errores:\n`;
                result.erroresValidacion.slice(0, 3).forEach(err => {
                  mensaje += `\nLínea ${err.linea}: ${err.nombre || err.codigo}\n`;
                  mensaje += `  - ${err.errores.join(', ')}\n`;
                });
              }

              alert(mensaje);
              // Recargar la página si estamos en productos
              if (window.location.pathname === '/productos') {
                window.location.reload();
              }
            } else if (!result.canceled) {
              alert(result.message);
            }
            break;

          // TEMPLATES
          case 'template-clientes':
            result = await window.api.import.templateClientes();
            if (result.success) {
              alert('✅ Template de clientes generado exitosamente\n\nEl archivo se ha abierto automáticamente.\n\nCompleta los datos de tus clientes y luego usa:\nArchivo → Importar → Importar Clientes desde Excel');
            } else {
              alert(result.message);
            }
            break;

          case 'template-productos':
            result = await window.api.import.templateProductos();
            if (result.success) {
              alert('✅ Template de productos generado exitosamente\n\nEl archivo se ha abierto automáticamente.\n\nCompleta los datos de tus productos y luego usa:\nArchivo → Importar → Importar Productos desde Excel');
            } else {
              alert(result.message);
            }
            break;

          default:
            return;
        }
      } catch (error) {
        console.error('Error en operación:', error);
        alert('Error: ' + error.message);
      }
    };

    // Registrar listener
    window.api.onMenuEvent(handleMenuEvent);
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/role-selection" element={<RoleSelectionPage />} />
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
            path="/configuracion/folios"
            element={
              <ProtectedRoute>
                <Layout>
                  <Folios />
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
