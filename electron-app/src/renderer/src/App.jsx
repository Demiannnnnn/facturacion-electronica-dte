import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PermissionRoute from './components/auth/PermissionRoute';
import RoleSelectionPage from './pages/Auth/RoleSelectionPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import ModuleSelector from './pages/Auth/ModuleSelector';
import SubscriptionPage from './pages/Auth/SubscriptionPage';
import DesignSystem from './pages/DesignSystem';

// Layouts
import ContadorLayout from './components/layout/ContadorLayout';
import ClienteLayout from './components/layout/ClienteLayout';

// Páginas Contador
import ContadorDashboard from './pages/Contador/ContadorDashboard';
import Empresas from './pages/Contador/Empresas';

// Páginas Cliente
import ClienteDashboard from './pages/Cliente/ClienteDashboard';
import Clientes from './pages/Clientes';
import Productos from './pages/Productos';
import Trabajadores from './pages/Trabajadores';
import Facturas from './pages/Facturas';
import Guias from './pages/Guias';
import Reportes from './pages/Reportes';
import ChangePassword from './pages/Configuracion/ChangePassword';
import EmisorConfig from './pages/Configuracion/EmisorConfig';
import UserManual from './pages/Configuracion/UserManual';
import Folios from './pages/Configuracion/Folios';
import Usuarios from './pages/Usuarios';
import CuentasPorCobrar from './pages/Facturacion/CuentasPorCobrar';
import NotaCredito from './pages/Facturacion/NotaCredito';
import NotaDebito from './pages/Facturacion/NotaDebito';
import MiContador from './pages/Configuracion/MiContador';
import PuntoVenta from './pages/PuntoVenta';
import Caja from './pages/Caja';
import Boletas from './pages/Boletas';
import Compras from './pages/Compras';
import Documentos from './pages/Documentos';

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
          {/* Rutas públicas */}
          <Route path="/role-selection" element={<RoleSelectionPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/subscription" element={<SubscriptionPage />} />
          <Route path="/module-selector" element={<ModuleSelector />} />
          <Route path="/design-system" element={<DesignSystem />} />

          {/* ==================== RUTAS CONTADOR ==================== */}
          <Route
            path="/contador"
            element={
              <ProtectedRoute requiredRole="contador">
                <ContadorLayout>
                  <ContadorDashboard />
                </ContadorLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/contador/empresas"
            element={
              <ProtectedRoute requiredRole="contador">
                <ContadorLayout>
                  <Empresas />
                </ContadorLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/contador/clientes"
            element={
              <ProtectedRoute requiredRole="contador">
                <ContadorLayout>
                  <div style={{ padding: '20px', textAlign: 'center' }}>
                    <h2>👥 Gestión de Clientes</h2>
                    <p>Módulo en desarrollo - Vista consolidada de clientes de todas las empresas</p>
                  </div>
                </ContadorLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/contador/documentos"
            element={
              <ProtectedRoute requiredRole="contador">
                <ContadorLayout>
                  <div style={{ padding: '20px', textAlign: 'center' }}>
                    <h2>📄 Documentos Tributarios</h2>
                    <p>Módulo en desarrollo - Vista consolidada de documentos de todas las empresas</p>
                  </div>
                </ContadorLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/contador/reportes"
            element={
              <ProtectedRoute requiredRole="contador">
                <ContadorLayout>
                  <div style={{ padding: '20px', textAlign: 'center' }}>
                    <h2>📈 Reportes Consolidados</h2>
                    <p>Módulo en desarrollo - Reportes para múltiples empresas</p>
                  </div>
                </ContadorLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/contador/configuracion"
            element={
              <ProtectedRoute requiredRole="contador">
                <ContadorLayout>
                  <div style={{ padding: '20px', textAlign: 'center' }}>
                    <h2>⚙️ Configuración del Contador</h2>
                    <p>Módulo en desarrollo - Configuración específica del contador</p>
                  </div>
                </ContadorLayout>
              </ProtectedRoute>
            }
          />

          {/* ==================== RUTAS CLIENTE ==================== */}
          <Route
            path="/cliente"
            element={
              <ProtectedRoute requiredRole={['empresa', 'persona_natural']}>
                <ClienteLayout>
                  <ClienteDashboard />
                </ClienteLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/cliente/clientes"
            element={
              <ProtectedRoute requiredRole={['empresa', 'persona_natural']}>
                <PermissionRoute requiredPermission="clientes">
                  <ClienteLayout>
                    <Clientes />
                  </ClienteLayout>
                </PermissionRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/cliente/productos"
            element={
              <ProtectedRoute requiredRole={['empresa', 'persona_natural']}>
                <PermissionRoute requiredPermission="productos">
                  <ClienteLayout>
                    <Productos />
                  </ClienteLayout>
                </PermissionRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/cliente/trabajadores"
            element={
              <ProtectedRoute requiredRole={['empresa', 'persona_natural']}>
                <PermissionRoute requiredPermission="trabajadores" requiredAction="ver">
                  <ClienteLayout>
                    <Trabajadores />
                  </ClienteLayout>
                </PermissionRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/cliente/facturas"
            element={
              <ProtectedRoute requiredRole={['empresa', 'persona_natural']}>
                <PermissionRoute requiredPermission="facturas">
                  <ClienteLayout>
                    <Facturas />
                  </ClienteLayout>
                </PermissionRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/cliente/guias"
            element={
              <ProtectedRoute requiredRole={['empresa', 'persona_natural']}>
                <ClienteLayout>
                  <Guias />
                </ClienteLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/cliente/cuentas-por-cobrar"
            element={
              <ProtectedRoute requiredRole={['empresa', 'persona_natural']}>
                <ClienteLayout>
                  <CuentasPorCobrar />
                </ClienteLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/cliente/nota-credito"
            element={
              <ProtectedRoute requiredRole={['empresa', 'persona_natural']}>
                <ClienteLayout>
                  <NotaCredito />
                </ClienteLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/cliente/nota-debito"
            element={
              <ProtectedRoute requiredRole={['empresa', 'persona_natural']}>
                <ClienteLayout>
                  <NotaDebito />
                </ClienteLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/cliente/pos"
            element={
              <ProtectedRoute requiredRole={['empresa', 'persona_natural']}>
                <ClienteLayout>
                  <PuntoVenta />
                </ClienteLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/cliente/caja"
            element={
              <ProtectedRoute requiredRole={['empresa', 'persona_natural']}>
                <PermissionRoute requiredPermission="caja">
                  <ClienteLayout>
                    <Caja />
                  </ClienteLayout>
                </PermissionRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/cliente/boletas"
            element={
              <ProtectedRoute requiredRole={['empresa', 'persona_natural']}>
                <PermissionRoute requiredPermission="boletas">
                  <ClienteLayout>
                    <Boletas />
                  </ClienteLayout>
                </PermissionRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/cliente/compras"
            element={
              <ProtectedRoute requiredRole={['empresa', 'persona_natural']}>
                <ClienteLayout>
                  <Compras />
                </ClienteLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/cliente/documentos"
            element={
              <ProtectedRoute requiredRole={['empresa', 'persona_natural']}>
                <PermissionRoute requiredPermission="documentos">
                  <ClienteLayout>
                    <Documentos />
                  </ClienteLayout>
                </PermissionRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/cliente/reportes"
            element={
              <ProtectedRoute requiredRole={['empresa', 'persona_natural']}>
                <PermissionRoute requiredPermission="reportes">
                  <ClienteLayout>
                    <Reportes />
                  </ClienteLayout>
                </PermissionRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/cliente/folios"
            element={
              <ProtectedRoute requiredRole={['empresa', 'persona_natural']}>
                <ClienteLayout>
                  <Folios />
                </ClienteLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/cliente/configuracion"
            element={
              <ProtectedRoute requiredRole={['empresa', 'persona_natural']}>
                <ClienteLayout>
                  <EmisorConfig />
                </ClienteLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/cliente/configuracion/cambiar-contrasena"
            element={
              <ProtectedRoute requiredRole={['empresa', 'persona_natural']}>
                <ClienteLayout>
                  <ChangePassword />
                </ClienteLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/cliente/configuracion/manual"
            element={
              <ProtectedRoute requiredRole={['empresa', 'persona_natural']}>
                <ClienteLayout>
                  <UserManual />
                </ClienteLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/cliente/configuracion/usuarios"
            element={
              <ProtectedRoute requiredRole={['empresa', 'persona_natural']}>
                <ClienteLayout>
                  <Usuarios />
                </ClienteLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/cliente/mi-contador"
            element={
              <ProtectedRoute requiredRole={['empresa', 'persona_natural']}>
                <ClienteLayout>
                  <MiContador />
                </ClienteLayout>
              </ProtectedRoute>
            }
          />

          {/* Ruta de redirección por defecto */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
