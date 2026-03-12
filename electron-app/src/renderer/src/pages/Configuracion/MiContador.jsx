import React, { useState, useEffect, useCallback } from 'react';

function MiContador() {
  const [view, setView] = useState('loading'); // loading, connected, search, pendientes
  const [contador, setContador] = useState(null);
  const [pendientes, setPendientes] = useState([]);
  const [enviadas, setEnviadas] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Cargar vínculos activos
      const activasResult = await window.api.vinculaciones.activas();
      if (activasResult.success && activasResult.data?.length > 0) {
        // Buscar el vínculo con un contador
        const vinculoContador = activasResult.data.find(
          v => v.contador || v.role === 'contador' || v.targetRole === 'contador' || v.sourceRole === 'contador'
        );
        if (vinculoContador) {
          setContador(vinculoContador);
          setView('connected');
          setLoading(false);
          return;
        }
      }

      // Cargar solicitudes pendientes recibidas
      const pendResult = await window.api.vinculaciones.pendientes();
      if (pendResult.success) {
        setPendientes(pendResult.data || []);
      }

      // Cargar solicitudes enviadas
      const envResult = await window.api.vinculaciones.enviadas();
      if (envResult.success) {
        setEnviadas(envResult.data || []);
      }

      setView('disconnected');
    } catch (err) {
      setError('Error al cargar datos. Verifica tu conexión a internet.');
      setView('disconnected');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearch = async () => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setError('Ingresa al menos 2 caracteres para buscar');
      return;
    }
    setSearching(true);
    setError('');
    setSearchResults([]);
    try {
      const result = await window.api.vinculaciones.buscar(searchQuery.trim());
      if (result.success) {
        setSearchResults(result.data || []);
        if ((result.data || []).length === 0) {
          setError('No se encontraron contadores con ese RUT o nombre');
        }
      } else {
        setError(result.error || 'Error al buscar');
      }
    } catch {
      setError('Error de conexión al buscar');
    } finally {
      setSearching(false);
    }
  };

  const handleSendRequest = async (targetUserId) => {
    setError('');
    setSuccess('');
    try {
      const result = await window.api.vinculaciones.enviarSolicitud(targetUserId);
      if (result.success) {
        setSuccess('Solicitud enviada correctamente. Espera a que tu contador la acepte.');
        setSearchResults([]);
        setSearchQuery('');
        loadData();
      } else {
        setError(result.error || 'Error al enviar solicitud');
      }
    } catch {
      setError('Error de conexión al enviar solicitud');
    }
  };

  const handleAccept = async (id) => {
    setError('');
    try {
      const result = await window.api.vinculaciones.aceptar(id);
      if (result.success) {
        setSuccess('Solicitud aceptada. Ya estás conectado con tu contador.');
        loadData();
      } else {
        setError(result.error || 'Error al aceptar');
      }
    } catch {
      setError('Error de conexión');
    }
  };

  const handleReject = async (id) => {
    setError('');
    try {
      const result = await window.api.vinculaciones.rechazar(id);
      if (result.success) {
        loadData();
      } else {
        setError(result.error || 'Error al rechazar');
      }
    } catch {
      setError('Error de conexión');
    }
  };

  const handleDisconnect = async () => {
    if (!contador) return;
    const confirmed = window.confirm('¿Estás seguro de que deseas desvincularte de tu contador?');
    if (!confirmed) return;
    setError('');
    try {
      const vinculoId = contador.id || contador.vinculacionId;
      const result = await window.api.vinculaciones.eliminar(vinculoId);
      if (result.success) {
        setContador(null);
        setSuccess('Te has desvinculado de tu contador.');
        loadData();
      } else {
        setError(result.error || 'Error al desvincular');
      }
    } catch {
      setError('Error de conexión');
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingCard}>
          <div style={styles.spinner}>⏳</div>
          <p style={styles.loadingText}>Cargando información del contador...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📊 Mi Contador</h1>
        <p style={styles.subtitle}>Conecta con tu contador para que acceda a tu información tributaria</p>
      </div>

      {error && (
        <div style={styles.alert.error}>
          <span>⚠️</span> {error}
          <button onClick={() => setError('')} style={styles.alertClose}>✕</button>
        </div>
      )}
      {success && (
        <div style={styles.alert.success}>
          <span>✅</span> {success}
          <button onClick={() => setSuccess('')} style={styles.alertClose}>✕</button>
        </div>
      )}

      {/* ======== VISTA CONECTADO ======== */}
      {view === 'connected' && contador && (
        <div style={styles.connectedCard}>
          <div style={styles.connectedHeader}>
            <div style={styles.statusBadge.active}>
              <span style={styles.statusDot.active}></span>
              Conectado
            </div>
          </div>
          <div style={styles.contadorInfo}>
            <div style={styles.contadorAvatar}>📊</div>
            <div style={styles.contadorDetails}>
              <h2 style={styles.contadorName}>
                {contador.contadorNombre || contador.nombre || contador.targetName || contador.sourceName || 'Contador'}
              </h2>
              <p style={styles.contadorMeta}>
                <span style={styles.metaItem}>📧 {contador.contadorEmail || contador.email || contador.targetEmail || contador.sourceEmail || '-'}</span>
              </p>
              {(contador.contadorRut || contador.rut || contador.targetRut || contador.sourceRut) && (
                <p style={styles.contadorMeta}>
                  <span style={styles.metaItem}>🪪 RUT: {contador.contadorRut || contador.rut || contador.targetRut || contador.sourceRut}</span>
                </p>
              )}
            </div>
          </div>
          <div style={styles.connectedActions}>
            <p style={styles.connectedNote}>
              Tu contador tiene acceso de lectura a tus documentos tributarios, reportes y datos financieros.
            </p>
            <button onClick={handleDisconnect} style={styles.btnDanger}>
              🔗 Desvincular Contador
            </button>
          </div>
        </div>
      )}

      {/* ======== VISTA DESCONECTADO ======== */}
      {view === 'disconnected' && (
        <>
          {/* Solicitudes pendientes recibidas */}
          {pendientes.length > 0 && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>📩 Solicitudes Recibidas</h3>
              {pendientes.map((sol) => (
                <div key={sol.id} style={styles.solicitudCard}>
                  <div style={styles.solicitudInfo}>
                    <span style={styles.solicitudName}>
                      {sol.sourceName || sol.nombre || sol.email || 'Usuario'}
                    </span>
                    {sol.sourceRut && <span style={styles.solicitudRut}>RUT: {sol.sourceRut}</span>}
                    <span style={styles.solicitudEmail}>{sol.sourceEmail || sol.email}</span>
                  </div>
                  <div style={styles.solicitudActions}>
                    <button onClick={() => handleAccept(sol.id)} style={styles.btnSuccess}>
                      ✅ Aceptar
                    </button>
                    <button onClick={() => handleReject(sol.id)} style={styles.btnOutline}>
                      ✕ Rechazar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Solicitudes enviadas */}
          {enviadas.length > 0 && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>📤 Solicitudes Enviadas</h3>
              {enviadas.map((sol) => (
                <div key={sol.id} style={styles.solicitudCard}>
                  <div style={styles.solicitudInfo}>
                    <span style={styles.solicitudName}>
                      {sol.targetName || sol.nombre || 'Contador'}
                    </span>
                    <span style={styles.solicitudEmail}>{sol.targetEmail || sol.email}</span>
                  </div>
                  <div style={styles.statusBadge.pending}>
                    ⏳ Pendiente
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Buscar contador */}
          <div style={styles.searchCard}>
            <h3 style={styles.searchTitle}>🔍 Buscar Contador</h3>
            <p style={styles.searchDescription}>
              Busca a tu contador por RUT o nombre para enviarle una solicitud de vinculación.
            </p>
            <div style={styles.searchRow}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Ingresa RUT o nombre del contador..."
                style={styles.searchInput}
              />
              <button
                onClick={handleSearch}
                disabled={searching}
                style={styles.btnPrimary}
              >
                {searching ? '⏳ Buscando...' : '🔍 Buscar'}
              </button>
            </div>

            {/* Resultados de búsqueda */}
            {searchResults.length > 0 && (
              <div style={styles.resultsList}>
                {searchResults.map((user) => (
                  <div key={user.id} style={styles.resultCard}>
                    <div style={styles.resultInfo}>
                      <span style={styles.resultName}>{user.nombre || user.name || user.email}</span>
                      {user.rut && <span style={styles.resultRut}>RUT: {user.rut}</span>}
                      <span style={styles.resultEmail}>{user.email}</span>
                    </div>
                    <button
                      onClick={() => handleSendRequest(user.id)}
                      style={styles.btnPrimary}
                    >
                      📨 Enviar Solicitud
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info card si no hay nada */}
          {pendientes.length === 0 && enviadas.length === 0 && (
            <div style={styles.emptyCard}>
              <div style={styles.emptyIcon}>🤝</div>
              <h3 style={styles.emptyTitle}>Sin contador vinculado</h3>
              <p style={styles.emptyText}>
                Conecta con tu contador para que pueda acceder a tu información tributaria.
                Puedes buscarlo por RUT o nombre, o pedirle que te envíe una invitación desde su plataforma.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '24px',
    maxWidth: '800px',
    margin: '0 auto'
  },
  header: {
    marginBottom: '24px'
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 4px 0'
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0
  },
  loadingCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 24px',
    background: '#fff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0'
  },
  spinner: {
    fontSize: '32px',
    marginBottom: '12px',
    animation: 'spin 1s linear infinite'
  },
  loadingText: {
    color: '#64748b',
    fontSize: '14px'
  },

  // Alerts
  alert: {
    error: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 16px',
      background: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: '8px',
      color: '#991b1b',
      fontSize: '14px',
      marginBottom: '16px',
      position: 'relative'
    },
    success: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 16px',
      background: '#f0fdf4',
      border: '1px solid #bbf7d0',
      borderRadius: '8px',
      color: '#166534',
      fontSize: '14px',
      marginBottom: '16px',
      position: 'relative'
    }
  },
  alertClose: {
    marginLeft: 'auto',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    opacity: 0.6,
    padding: '0 4px'
  },

  // Connected state
  connectedCard: {
    background: '#fff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
  },
  connectedHeader: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '16px'
  },
  contadorInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '20px'
  },
  contadorAvatar: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: '#ede9fe',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    flexShrink: 0
  },
  contadorDetails: {
    flex: 1
  },
  contadorName: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 4px 0'
  },
  contadorMeta: {
    margin: '2px 0',
    fontSize: '14px',
    color: '#64748b'
  },
  metaItem: {
    display: 'inline-block'
  },
  connectedActions: {
    borderTop: '1px solid #e2e8f0',
    paddingTop: '16px'
  },
  connectedNote: {
    fontSize: '13px',
    color: '#64748b',
    margin: '0 0 12px 0'
  },

  // Status badges
  statusBadge: {
    active: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 12px',
      borderRadius: '20px',
      background: '#f0fdf4',
      color: '#166534',
      fontSize: '13px',
      fontWeight: '500',
      border: '1px solid #bbf7d0'
    },
    pending: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 12px',
      borderRadius: '20px',
      background: '#fffbeb',
      color: '#92400e',
      fontSize: '13px',
      fontWeight: '500',
      border: '1px solid #fde68a'
    }
  },
  statusDot: {
    active: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: '#22c55e',
      display: 'inline-block'
    }
  },

  // Sections
  section: {
    marginBottom: '20px'
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 12px 0'
  },

  // Solicitud cards
  solicitudCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    background: '#fff',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    marginBottom: '8px',
    flexWrap: 'wrap',
    gap: '10px'
  },
  solicitudInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  solicitudName: {
    fontWeight: '600',
    color: '#1e293b',
    fontSize: '14px'
  },
  solicitudRut: {
    fontSize: '12px',
    color: '#64748b'
  },
  solicitudEmail: {
    fontSize: '12px',
    color: '#94a3b8'
  },
  solicitudActions: {
    display: 'flex',
    gap: '8px'
  },

  // Search card
  searchCard: {
    background: '#fff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
  },
  searchTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 4px 0'
  },
  searchDescription: {
    fontSize: '13px',
    color: '#64748b',
    margin: '0 0 16px 0'
  },
  searchRow: {
    display: 'flex',
    gap: '8px'
  },
  searchInput: {
    flex: 1,
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
    background: '#f9fafb'
  },

  // Results
  resultsList: {
    marginTop: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  resultCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    background: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    flexWrap: 'wrap',
    gap: '10px'
  },
  resultInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  resultName: {
    fontWeight: '600',
    color: '#1e293b',
    fontSize: '14px'
  },
  resultRut: {
    fontSize: '12px',
    color: '#64748b'
  },
  resultEmail: {
    fontSize: '12px',
    color: '#94a3b8'
  },

  // Empty state
  emptyCard: {
    textAlign: 'center',
    padding: '40px 24px',
    background: '#f8fafc',
    borderRadius: '12px',
    border: '1px dashed #cbd5e1',
    marginBottom: '20px'
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '12px'
  },
  emptyTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#334155',
    margin: '0 0 8px 0'
  },
  emptyText: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0,
    maxWidth: '500px',
    marginLeft: 'auto',
    marginRight: 'auto',
    lineHeight: '1.5'
  },

  // Buttons
  btnPrimary: {
    padding: '10px 18px',
    background: '#7c3aed',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    whiteSpace: 'nowrap',
    transition: 'background 0.2s'
  },
  btnSuccess: {
    padding: '8px 14px',
    background: '#16a34a',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500'
  },
  btnOutline: {
    padding: '8px 14px',
    background: 'transparent',
    color: '#64748b',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500'
  },
  btnDanger: {
    padding: '10px 18px',
    background: 'transparent',
    color: '#dc2626',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  }
};

export default MiContador;
