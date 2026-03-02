import React from 'react';

function TecladoNumerico({ onInput }) {
  const teclas = [
    '7', '8', '9',
    '4', '5', '6',
    '1', '2', '3',
    '0', '00', '⌫'
  ];

  const handleClick = (tecla) => {
    onInput(tecla);
  };

  return (
    <div style={styles.container}>
      <div style={styles.grid}>
        {teclas.map((tecla, index) => (
          <button
            key={index}
            onClick={() => handleClick(tecla)}
            style={{
              ...styles.tecla,
              ...(tecla === '⌫' ? styles.teclaEspecial : {})
            }}
          >
            {tecla}
          </button>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '16px',
    backgroundColor: '#f9fafb',
    borderRadius: '12px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px'
  },
  tecla: {
    padding: '20px',
    backgroundColor: 'white',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '24px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
    color: '#1f2937'
  },
  teclaEspecial: {
    backgroundColor: '#fee2e2',
    borderColor: '#fca5a5',
    color: '#991b1b'
  }
};

export default TecladoNumerico;
