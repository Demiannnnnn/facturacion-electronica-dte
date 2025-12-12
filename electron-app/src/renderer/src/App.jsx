// TODO: Implementar según documentación
// Ver documentacion/latex.pdf página 29

import React from 'react';

function App() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1>Sistema de Facturación Electrónica B2B</h1>
        <p>Proyecto inicializado correctamente</p>
        <p style={{ marginTop: '20px', color: '#666' }}>
          Consulta <code>documentacion/latex.pdf</code> para comenzar el desarrollo
        </p>
      </div>
    </div>
  );
}

export default App;
