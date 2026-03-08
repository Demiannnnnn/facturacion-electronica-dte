import React, { useState } from 'react';

const tokenGroups = [
  {
    name: 'Indigo (Brand)',
    shades: [
      { label: '950', hex: '#0F1535' },
      { label: '900', hex: '#1A2456' },
      { label: '800', hex: '#1E2F6E' },
      { label: '700', hex: '#2537A0' },
      { label: '600', hex: '#2E45C5' },
      { label: '500', hex: '#3D56E0' },
      { label: '400', hex: '#6278F0' },
      { label: '300', hex: '#8FA0F7' },
      { label: '200', hex: '#C2CDFB' },
      { label: '100', hex: '#E8EBFD' },
      { label: '50', hex: '#F4F5FE' }
    ]
  },
  {
    name: 'Cyan (Acento)',
    shades: [
      { label: '500', hex: '#06B6D4' },
      { label: '400', hex: '#22D3EE' },
      { label: '100', hex: '#CFFAFE' }
    ]
  },
  {
    name: 'Semánticos',
    shades: [
      { label: 'Éxito', hex: '#10B981' },
      { label: 'Alerta', hex: '#F59E0B' },
      { label: 'Error', hex: '#EF4444' }
    ]
  }
];

function DS() {
  const [activeTab, setActiveTab] = useState('tokens');

  return (
    <div style={{ background: 'var(--surface-1)', minHeight: '100vh' }}>
      <style>{`
        :root {
          --indigo-950: #0F1535;
          --indigo-900: #1A2456;
          --indigo-800: #1E2F6E;
          --indigo-700: #2537A0;
          --indigo-600: #2E45C5;
          --indigo-500: #3D56E0;
          --indigo-400: #6278F0;
          --indigo-300: #8FA0F7;
          --indigo-200: #C2CDFB;
          --indigo-100: #E8EBFD;
          --indigo-50: #F4F5FE;

          --slate-950: #0A0D1A;
          --slate-900: #111827;
          --slate-800: #1F2937;
          --slate-700: #374151;
          --slate-600: #4B5563;
          --slate-500: #6B7280;
          --slate-400: #9CA3AF;
          --slate-300: #D1D5DB;
          --slate-200: #E5E7EB;
          --slate-100: #F3F4F6;
          --slate-50: #F9FAFB;
          --white: #FFFFFF;

          --cyan-500: #06B6D4;
          --cyan-400: #22D3EE;
          --cyan-100: #CFFAFE;

          --success: #10B981;
          --warning: #F59E0B;
          --danger: #EF4444;
          --info: var(--indigo-500);

          --surface-0: var(--white);
          --surface-1: var(--slate-50);
          --surface-2: var(--slate-100);
          --border: var(--slate-200);
          --border-focus: var(--indigo-400);

          --font-display: 'Sora', sans-serif;
          --font-body: 'DM Sans', sans-serif;

          --radius-sm: 6px;
          --radius-md: 10px;
          --radius-lg: 16px;
          --radius-xl: 24px;

          --shadow-sm: 0 1px 3px rgba(15, 21, 53, 0.08), 0 1px 2px rgba(15, 21, 53, 0.06);
          --shadow-md: 0 4px 16px rgba(15, 21, 53, 0.10), 0 2px 6px rgba(15, 21, 53, 0.07);
          --shadow-lg: 0 12px 40px rgba(15, 21, 53, 0.14), 0 4px 12px rgba(15, 21, 53, 0.08);
          --shadow-glow: 0 0 0 3px rgba(62, 86, 224, 0.18);
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .btn {
          font-family: var(--font-body);
          font-weight: 500;
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.15s ease;
          letter-spacing: -0.01em;
        }

        .btn-primary {
          background: var(--indigo-600);
          color: white;
          padding: 11px 22px;
          border-radius: var(--radius-md);
          font-size: 14px;
          box-shadow: 0 2px 8px rgba(46, 69, 197, 0.30);
        }

        .btn-primary:hover {
          background: var(--indigo-700);
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(46, 69, 197, 0.38);
        }

        .btn-primary:active { transform: translateY(0); }

        .btn-secondary {
          background: var(--indigo-50);
          color: var(--indigo-700);
          padding: 11px 22px;
          border-radius: var(--radius-md);
          font-size: 14px;
          border: 1px solid var(--indigo-200);
        }

        .btn-secondary:hover { background: var(--indigo-100); }

        .btn-ghost {
          background: transparent;
          color: var(--slate-600);
          padding: 11px 18px;
          border-radius: var(--radius-md);
          font-size: 14px;
        }

        .btn-ghost:hover {
          background: var(--slate-100);
          color: var(--slate-900);
        }

        .btn-danger {
          background: #FEF2F2;
          color: var(--danger);
          padding: 11px 22px;
          border-radius: var(--radius-md);
          font-size: 14px;
          border: 1px solid #FECACA;
        }

        .btn-danger:hover { background: #FEE2E2; }

        .btn-lg { padding: 14px 28px; font-size: 15px; }
        .btn-sm { padding: 7px 14px; font-size: 13px; }
        .btn-full { width: 100%; justify-content: center; }

        .input-group { display: flex; flex-direction: column; gap: 6px; }

        .input-label {
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 500;
          color: var(--slate-700);
          letter-spacing: -0.01em;
        }

        .input {
          font-family: var(--font-body);
          font-size: 14px;
          color: var(--slate-900);
          background: var(--white);
          border: 1.5px solid var(--slate-200);
          border-radius: var(--radius-md);
          padding: 10px 14px;
          transition: all 0.15s;
          outline: none;
          width: 100%;
        }

        .input::placeholder { color: var(--slate-400); }

        .input:focus {
          border-color: var(--indigo-400);
          box-shadow: var(--shadow-glow);
        }

        .card {
          background: var(--white);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
          box-shadow: var(--shadow-sm);
        }

        .badge {
          font-family: var(--font-body);
          font-size: 11px;
          font-weight: 600;
          padding: 3px 9px;
          border-radius: 999px;
          letter-spacing: 0.03em;
          text-transform: uppercase;
        }

        .badge-indigo { background: var(--indigo-100); color: var(--indigo-700); }
        .badge-success { background: #D1FAE5; color: #065F46; }
        .badge-warning { background: #FEF3C7; color: #92400E; }
        .badge-cyan { background: var(--cyan-100); color: #0E7490; }

        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 14px;
          border-radius: var(--radius-md);
          font-size: 13.5px;
          font-weight: 500;
          color: var(--slate-500);
          cursor: pointer;
          transition: all 0.12s;
          font-family: var(--font-body);
          letter-spacing: -0.01em;
        }

        .sidebar-item:hover { background: var(--indigo-50); color: var(--indigo-700); }
        .sidebar-item.active { background: var(--indigo-100); color: var(--indigo-700); font-weight: 600; }
        .sidebar-dot { width: 6px; height: 6px; border-radius: 50%; background: transparent; flex-shrink: 0; }

        .stat-card {
          background: var(--white);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
          padding: 20px 24px;
          box-shadow: var(--shadow-sm);
        }

        .stat-label {
          font-size: 12px;
          font-weight: 500;
          color: var(--slate-500);
          letter-spacing: 0.04em;
          text-transform: uppercase;
          font-family: var(--font-body);
        }

        .stat-value {
          font-family: var(--font-display);
          font-size: 26px;
          font-weight: 700;
          color: var(--slate-900);
          margin-top: 4px;
          letter-spacing: -0.03em;
        }

        .stat-change { font-size: 12px; font-weight: 500; margin-top: 6px; font-family: var(--font-body); }
        .stat-up { color: var(--success); }
        .stat-neutral { color: var(--slate-400); }

        .pricing-featured {
          background: var(--indigo-950);
          border: 1.5px solid var(--indigo-700);
          box-shadow: var(--shadow-lg), 0 0 0 1px rgba(98, 120, 240, 0.15);
        }

        .pricing-featured .pricing-title,
        .pricing-featured .pricing-price { color: white; }

        .pricing-featured .pricing-period { color: var(--indigo-300); }
        .pricing-featured .pricing-feature { color: var(--indigo-200); }

        .role-card {
          background: white;
          border: 2px solid var(--slate-200);
          border-radius: var(--radius-xl);
          padding: 28px 24px;
          cursor: pointer;
          transition: all 0.18s;
        }

        .role-card:hover {
          border-color: var(--indigo-300);
          box-shadow: var(--shadow-md), 0 0 0 4px var(--indigo-50);
          transform: translateY(-2px);
        }

        .role-card.selected {
          border-color: var(--indigo-500);
          box-shadow: var(--shadow-md), 0 0 0 4px var(--indigo-100);
        }

        .role-icon-wrap {
          width: 52px;
          height: 52px;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          margin-bottom: 16px;
        }
      `}</style>

      <div style={{ background: 'var(--indigo-950)', padding: '32px 40px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{ width: 10, height: 10, background: 'var(--cyan-400)', borderRadius: '50%' }} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, color: 'var(--indigo-300)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Facturación SaaS
          </span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'white', letterSpacing: '-0.03em', marginBottom: 6 }}>
          Design System
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--indigo-300)' }}>
          Tokens, componentes y pantallas — listo para copiar a tu proyecto
        </p>
      </div>

      <div style={{ background: 'var(--indigo-900)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 4, padding: '0 40px' }}>
        {['tokens', 'components', 'screens'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              fontWeight: activeTab === tab ? 600 : 400,
              padding: '14px 18px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: activeTab === tab ? 'white' : 'var(--indigo-300)',
              borderBottom: activeTab === tab ? '2px solid var(--cyan-400)' : '2px solid transparent',
              transition: 'all 0.12s',
              textTransform: 'capitalize',
              letterSpacing: '-0.01em'
            }}
          >
            {tab === 'tokens' ? '🎨 Tokens' : tab === 'components' ? '🧩 Componentes' : '📐 Pantallas'}
          </button>
        ))}
      </div>

      <div style={{ padding: '32px 40px', maxWidth: 1100, margin: '0 auto' }}>
        {activeTab === 'tokens' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            <section>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--slate-900)', marginBottom: 16 }}>
                Paleta de Colores
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {tokenGroups.map(group => (
                  <div key={group.name}>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--slate-500)', marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      {group.name}
                    </p>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {group.shades.map(shade => (
                        <div key={shade.label} style={{ textAlign: 'center' }}>
                          <div style={{ width: 52, height: 40, borderRadius: 8, background: shade.hex, border: '1px solid rgba(0,0,0,0.06)', marginBottom: 4 }} />
                          <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--slate-500)', fontWeight: 500 }}>{shade.label}</div>
                          <div style={{ fontFamily: 'monospace', fontSize: 9, color: 'var(--slate-400)' }}>{shade.hex}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--slate-900)', marginBottom: 16, letterSpacing: '-0.02em' }}>
                Tipografía
              </h2>
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                <div className="card" style={{ padding: 24, flex: 1, minWidth: 280 }}>
                  <div className="badge badge-indigo" style={{ marginBottom: 12 }}>Display — Sora</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, color: 'var(--slate-900)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                    Sistema de
                    <br />
                    Facturación
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: 'var(--slate-700)', marginTop: 12, letterSpacing: '-0.02em' }}>
                    Encabezado de Sección
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 400, color: 'var(--slate-500)', marginTop: 8 }}>
                    Sora Regular — subtítulos
                  </div>
                </div>
                <div className="card" style={{ padding: 24, flex: 1, minWidth: 280 }}>
                  <div className="badge badge-cyan" style={{ marginBottom: 12 }}>Body — DM Sans</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--slate-800)', lineHeight: 1.7 }}>
                    Texto de párrafo. DM Sans es una tipografía geométrica sin serifa optimizada para interfaces digitales.
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--slate-500)', marginTop: 10, fontWeight: 500 }}>
                    Texto secundario — 13px Medium
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--slate-400)', marginTop: 6, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    Label — 11px Semibold Uppercase
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--slate-900)', marginBottom: 16 }}>
                Variables CSS — copiar a globals.css
              </h2>
              <div style={{ background: 'var(--indigo-950)', borderRadius: 'var(--radius-lg)', padding: 24, overflowX: 'auto' }}>
                <pre style={{ fontFamily: 'monospace', fontSize: 12, color: '#A5B4FC', lineHeight: 1.8, margin: 0 }}>{`:root {
  --indigo-950: #0F1535;
  --indigo-900: #1A2456;
  --indigo-800: #1E2F6E;
  --indigo-700: #2537A0;
  --indigo-600: #2E45C5;
  --indigo-500: #3D56E0;
  --indigo-400: #6278F0;
  --indigo-300: #8FA0F7;
  --indigo-200: #C2CDFB;
  --indigo-100: #E8EBFD;
  --indigo-50: #F4F5FE;
}`}</pre>
              </div>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--slate-900)', marginBottom: 16, letterSpacing: '-0.02em' }}>
                tailwind.config.js
              </h2>
              <div style={{ background: 'var(--indigo-950)', borderRadius: 'var(--radius-lg)', padding: 24, overflowX: 'auto' }}>
                <pre style={{ fontFamily: 'monospace', fontSize: 12, color: '#A5B4FC', lineHeight: 1.8, margin: 0 }}>{`module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          950: '#0F1535',
          900: '#1A2456',
          800: '#1E2F6E',
          700: '#2537A0',
          600: '#2E45C5',
          500: '#3D56E0'
        }
      }
    }
  }
};`}</pre>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'components' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            <section>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--slate-900)', marginBottom: 16 }}>Botones</h2>
              <div className="card" style={{ padding: 28 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
                  <button className="btn btn-primary">Continuar</button>
                  <button className="btn btn-primary btn-lg">Crear Factura</button>
                  <button className="btn btn-secondary">Cancelar</button>
                  <button className="btn btn-ghost">Ver más</button>
                  <button className="btn btn-danger">Eliminar</button>
                  <button className="btn btn-primary btn-sm">Guardar</button>
                </div>
              </div>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--slate-900)', marginBottom: 16 }}>Inputs</h2>
              <div className="card" style={{ padding: 28 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div className="input-group">
                    <label className="input-label">Email *</label>
                    <input className="input" placeholder="contacto@empresa.cl" />
                  </div>
                  <div className="input-group">
                    <label className="input-label">RUT *</label>
                    <input className="input" placeholder="12.345.678-9" />
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--slate-900)', marginBottom: 16, letterSpacing: '-0.02em' }}>
                Badges
              </h2>
              <div className="card" style={{ padding: 28 }}>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <span className="badge badge-indigo">Recomendado</span>
                  <span className="badge badge-success">Pagado</span>
                  <span className="badge badge-warning">Pendiente</span>
                  <span className="badge badge-cyan">Sin Tarjeta</span>
                  <span className="badge" style={{ background: '#FEE2E2', color: '#B91C1C' }}>Vencido</span>
                </div>
              </div>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--slate-900)', marginBottom: 16 }}>Stat Cards</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {[
                  { icon: '💰', label: 'Total Ventas', value: '$1.240.000', change: '+12% este mes', up: true },
                  { icon: '📄', label: 'Total Facturas', value: '47', change: '+3 hoy', up: true },
                  { icon: '👥', label: 'Clientes Activos', value: '18', change: 'Sin cambios', up: false }
                ].map(stat => (
                  <div key={stat.label} className="stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div className="stat-label">{stat.label}</div>
                        <div className="stat-value">{stat.value}</div>
                        <div className={`stat-change ${stat.up ? 'stat-up' : 'stat-neutral'}`}>
                          {stat.up ? '↑ ' : ''}{stat.change}
                        </div>
                      </div>
                      <div style={{ fontSize: 22, opacity: 0.7 }}>{stat.icon}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--slate-900)', marginBottom: 16, letterSpacing: '-0.02em' }}>
                Sidebar
              </h2>
              <div className="card" style={{ padding: 16, width: 220 }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 600, color: 'var(--slate-400)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 14px 8px' }}>
                  Principal
                </div>
                {[
                  { icon: '▦', label: 'Dashboard', active: true },
                  { icon: '⚡', label: 'Punto de Venta', active: false },
                  { icon: '👥', label: 'Clientes', active: false },
                  { icon: '📦', label: 'Productos', active: false },
                  { icon: '📄', label: 'Facturas', active: false }
                ].map(item => (
                  <div key={item.label} className={`sidebar-item ${item.active ? 'active' : ''}`}>
                    <span style={{ fontSize: 14 }}>{item.icon}</span>
                    <span>{item.label}</span>
                    <div className="sidebar-dot" style={{ marginLeft: 'auto' }} />
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'screens' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <section>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--slate-900)', marginBottom: 16 }}>
                Pantalla — Login
              </h2>
              <div style={{ background: 'var(--indigo-950)', borderRadius: 'var(--radius-xl)', padding: '48px 24px', display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: 380, background: 'white', borderRadius: 'var(--radius-xl)', padding: '36px 32px', boxShadow: 'var(--shadow-lg)' }}>
                  <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--slate-900)', marginBottom: 4 }}>
                      Bienvenido de vuelta
                    </h1>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--slate-500)' }}>
                      Ingresa tus credenciales para continuar
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="input-group">
                      <label className="input-label">Email</label>
                      <input className="input" placeholder="tu@empresa.cl" />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Contraseña</label>
                      <input className="input" type="password" placeholder="••••••••" />
                    </div>
                    <button className="btn btn-primary btn-full btn-lg">Iniciar Sesión →</button>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--slate-900)', marginBottom: 16, letterSpacing: '-0.02em' }}>
                Pantalla — Selección de Rol
              </h2>
              <div style={{ background: 'var(--slate-50)', borderRadius: 'var(--radius-xl)', padding: 36, border: '1px solid var(--slate-200)' }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                  <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--slate-900)', letterSpacing: '-0.03em', marginBottom: 6 }}>
                    ¿Cómo usarás el sistema?
                  </h1>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--slate-500)' }}>
                    Selecciona el tipo de cuenta que mejor se adapta a tu situación
                  </p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                  {[
                    { icon: '👨‍💼', bg: 'var(--indigo-100)', title: 'Contador', desc: 'Gestiona múltiples empresas desde una sola plataforma', features: ['Múltiples clientes', 'Dashboard consolidado', 'Gestión de folios', 'Aprobación de documentos'] },
                    { icon: '🏢', bg: '#DCFCE7', title: 'Empresa', desc: 'Persona jurídica — SpA, SRL, SA, EIRL', features: ['Facturación completa', 'Control de inventario', 'Múltiples usuarios', 'Reportes tributarios'], selected: true },
                    { icon: '👤', bg: '#FEF3C7', title: 'Persona Natural', desc: 'Profesional independiente o emprendedor', features: ['Boletas de honorarios', 'Gestión simplificada', 'Clientes y servicios', 'Libro de ventas'] }
                  ].map(role => (
                    <div key={role.title} className={`role-card ${role.selected ? 'selected' : ''}`}>
                      <div className="role-icon-wrap" style={{ background: role.bg }}>{role.icon}</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--slate-900)', marginBottom: 6, letterSpacing: '-0.02em' }}>
                        {role.title}
                      </div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--slate-500)', marginBottom: 16, lineHeight: 1.5 }}>
                        {role.desc}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                        {role.features.map(feature => (
                          <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 16, height: 16, borderRadius: '50%', background: role.selected ? 'var(--indigo-100)' : 'var(--slate-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <span style={{ fontSize: 9, color: role.selected ? 'var(--indigo-600)' : 'var(--slate-400)' }}>✓</span>
                            </div>
                            <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--slate-600)' }}>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
                  <button className="btn btn-primary btn-lg" style={{ minWidth: 260 }}>
                    Continuar con Empresa →
                  </button>
                </div>
              </div>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--slate-900)', marginBottom: 16, letterSpacing: '-0.02em' }}>
                Pantalla — Planes
              </h2>
              <div style={{ background: 'var(--slate-50)', borderRadius: 'var(--radius-xl)', padding: 36, border: '1px solid var(--slate-200)' }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                  <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--slate-900)', letterSpacing: '-0.03em', marginBottom: 6 }}>
                    Elige tu plan
                  </h1>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--slate-500)' }}>
                    Sin sorpresas. Cancela cuando quieras.
                  </p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, alignItems: 'end' }}>
                  {[
                    { icon: '🎁', title: 'Prueba Gratuita', badge: { text: 'Sin tarjeta', style: 'badge-cyan' }, price: '$0', period: '/ 3 meses', features: ['Acceso completo', 'Todas las funciones', 'Sin datos de pago', 'Cancela cuando quieras'], cta: 'Comenzar gratis', featured: false },
                    { icon: '⭐', title: 'Mensual', badge: { text: 'Más popular', style: 'badge-indigo' }, price: '$49.990', period: '/ mes', features: ['Acceso ilimitado', 'Soporte prioritario', 'Actualizaciones automáticas', 'Respaldo en la nube'], cta: 'Suscribirme', featured: true },
                    { icon: '💎', title: 'Anual', badge: { text: 'Ahorra 2 meses', style: 'badge-success' }, price: '$499.900', period: '/ año', sub: '≈ $41.658/mes', features: ['Todo lo del plan mensual', '2 meses gratis', 'Soporte prioritario', 'Respaldo en la nube'], cta: 'Suscribirme anual', featured: false }
                  ].map(plan => (
                    <div key={plan.title} className={`card ${plan.featured ? 'pricing-featured' : ''}`} style={{ padding: 28, transform: plan.featured ? 'translateY(-8px)' : 'none' }}>
                      <div style={{ fontSize: 28, marginBottom: 14 }}>{plan.icon}</div>
                      <span className={`badge ${plan.badge.style}`} style={{ marginBottom: 14, display: 'inline-block' }}>
                        {plan.badge.text}
                      </span>
                      <div className="pricing-title" style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--slate-900)', marginBottom: 6, letterSpacing: '-0.02em' }}>
                        {plan.title}
                      </div>
                      <div className="pricing-price" style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--slate-900)', letterSpacing: '-0.03em' }}>
                        {plan.price}
                        <span className="pricing-period" style={{ fontSize: 13, fontWeight: 400, color: 'var(--slate-400)', fontFamily: 'var(--font-body)' }}>
                          {' '}
                          {plan.period}
                        </span>
                      </div>
                      {plan.sub && (
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: plan.featured ? 'var(--cyan-400)' : 'var(--indigo-500)', marginTop: 3 }}>
                          {plan.sub}
                        </div>
                      )}
                      <div style={{ margin: '20px 0', height: 1, background: plan.featured ? 'rgba(255,255,255,0.08)' : 'var(--slate-100)' }} />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                        {plan.features.map(feature => (
                          <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span className="pricing-check" style={{ color: plan.featured ? 'var(--cyan-400)' : 'var(--success)', fontSize: 12 }}>✓</span>
                            <span className="pricing-feature" style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: plan.featured ? 'var(--indigo-200)' : 'var(--slate-600)' }}>
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>
                      <button
                        className="btn btn-full"
                        style={{
                          background: plan.featured ? 'var(--cyan-400)' : 'var(--indigo-50)',
                          color: plan.featured ? 'var(--indigo-950)' : 'var(--indigo-700)',
                          borderRadius: 'var(--radius-md)',
                          padding: '12px',
                          fontWeight: 600,
                          fontFamily: 'var(--font-body)',
                          fontSize: 14,
                          cursor: 'pointer',
                          border: plan.featured ? 'none' : '1px solid var(--indigo-200)'
                        }}
                      >
                        {plan.cta}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

export default DS;
