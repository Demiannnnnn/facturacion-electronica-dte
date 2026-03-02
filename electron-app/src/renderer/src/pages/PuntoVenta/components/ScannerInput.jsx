import React, { useRef, useEffect } from 'react';

function ScannerInput({ value, onChange, onScan }) {
  const inputRef = useRef(null);
  const scanBuffer = useRef('');
  const scanTimeout = useRef(null);

  useEffect(() => {
    // Auto-focus en el input
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e) => {
    // Detectar escaneo rápido de código de barras
    clearTimeout(scanTimeout.current);
    
    if (e.key === 'Enter') {
      if (scanBuffer.current.length > 0 || value.length > 0) {
        const codigo = scanBuffer.current || value;
        onScan(codigo);
        scanBuffer.current = '';
        onChange('');
      }
    } else {
      scanBuffer.current += e.key;
      
      // Reset buffer después de 100ms (indicador de entrada manual vs escáner)
      scanTimeout.current = setTimeout(() => {
        scanBuffer.current = '';
      }, 100);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.iconContainer}>
        🔍
      </div>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Buscar producto o escanear código de barras..."
        style={styles.input}
        autoFocus
      />
      {value && (
        <button
          onClick={() => onChange('')}
          style={styles.clearButton}
        >
          ✕
        </button>
      )}
    </div>
  );
}

const styles = {
  container: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'white',
    border: '3px solid #0f766e',
    borderRadius: '12px',
    padding: '4px',
    boxShadow: '0 4px 12px rgba(15, 118, 110, 0.15)'
  },
  iconContainer: {
    fontSize: '24px',
    padding: '0 12px',
    color: '#0f766e'
  },
  input: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '18px',
    padding: '12px 8px',
    fontWeight: '500',
    color: '#1f2937'
  },
  clearButton: {
    padding: '8px 12px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '18px',
    color: '#6b7280',
    borderRadius: '6px',
    transition: 'all 0.2s'
  }
};

export default ScannerInput;
