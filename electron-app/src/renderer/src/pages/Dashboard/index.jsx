import React from 'react';
import { useAuth } from '../../context/AuthContext';

function Dashboard() {
  const { user } = useAuth();

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Dashboard</h1>
      <div style={styles.welcome}>
        Bienvenido, <strong>{user?.username}</strong>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Clientes</h3>
          <p style={styles.cardContent}>Gestión de clientes</p>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Productos</h3>
          <p style={styles.cardContent}>Catálogo de productos</p>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Facturas</h3>
          <p style={styles.cardContent}>Facturación electrónica</p>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Reportes</h3>
          <p style={styles.cardContent}>Informes y estadísticas</p>
        </div>
      </div>

      <div style={styles.info}>
        <p>Sistema de Facturación Electrónica B2B</p>
        <p style={styles.subtitle}>Listo para comenzar a desarrollar las funcionalidades</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px'
  },
  title: {
    fontSize: '28px',
    marginBottom: '10px',
    color: '#333'
  },
  welcome: {
    fontSize: '16px',
    marginBottom: '30px',
    color: '#666'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '40px'
  },
  card: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    cursor: 'pointer',
    transition: 'transform 0.2s'
  },
  cardTitle: {
    fontSize: '18px',
    marginBottom: '10px',
    color: '#333'
  },
  cardContent: {
    fontSize: '14px',
    color: '#666'
  },
  info: {
    textAlign: 'center',
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    color: '#666'
  },
  subtitle: {
    fontSize: '14px',
    marginTop: '10px',
    color: '#999'
  }
};

export default Dashboard;
