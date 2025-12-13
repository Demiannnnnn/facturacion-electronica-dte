import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { validarRut, formatearRut } from '@/utils/validaciones';
import { regiones, getComunasByRegion } from '@/data/regionesComunas';

function EmisorConfig() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    rut: '',
    razon_social: '',
    nombre_fantasia: '',
    giro: '',
    direccion: '',
    region: '',
    comuna: '',
    ciudad: '',
    telefono: '',
    email: ''
  });

  useEffect(() => {
    cargarDatosEmisor();
  }, []);

  useEffect(() => {
    if (formData.rut) {
      const timer = setTimeout(() => {
        const firstInput = document.querySelector('input[name="rut"]');
        if (firstInput) {
          firstInput.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  const cargarDatosEmisor = async () => {
    setLoading(true);
    try {
      const result = await window.api.emisor.get();
      if (result.success && result.data) {
        setFormData({
          rut: result.data.rut || '',
          razon_social: result.data.razon_social || '',
          nombre_fantasia: result.data.nombre_fantasia || '',
          giro: result.data.giro || '',
          direccion: result.data.direccion || '',
          region: result.data.region || '',
          comuna: result.data.comuna || '',
          ciudad: result.data.ciudad || '',
          telefono: result.data.telefono || '',
          email: result.data.email || ''
        });
      }
    } catch (error) {
      console.error('Error cargando datos del emisor:', error);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    let newValue = value;

    if (name === 'rut') {
      newValue = formatearRut(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
    setSuccessMessage('');
  };

  const handleRegionChange = (selectedOption) => {
    setFormData(prev => ({
      ...prev,
      region: selectedOption?.value || '',
      comuna: ''
    }));
    setErrors(prev => ({
      ...prev,
      region: '',
      comuna: ''
    }));
    setSuccessMessage('');
  };

  const handleComunaChange = (selectedOption) => {
    setFormData(prev => ({
      ...prev,
      comuna: selectedOption?.value || ''
    }));
    setErrors(prev => ({
      ...prev,
      comuna: ''
    }));
    setSuccessMessage('');
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.rut) {
      newErrors.rut = 'El RUT es obligatorio';
    } else if (!validarRut(formData.rut)) {
      newErrors.rut = 'RUT inválido';
    }

    if (!formData.razon_social || formData.razon_social.trim().length < 3) {
      newErrors.razon_social = 'La razón social debe tener al menos 3 caracteres';
    }

    if (!formData.giro || formData.giro.trim().length < 3) {
      newErrors.giro = 'El giro debe tener al menos 3 caracteres';
    }

    if (!formData.direccion || formData.direccion.trim().length < 5) {
      newErrors.direccion = 'La dirección debe tener al menos 5 caracteres';
    }

    if (!formData.region) {
      newErrors.region = 'La región es obligatoria';
    }

    if (!formData.comuna) {
      newErrors.comuna = 'La comuna es obligatoria';
    }

    if (!formData.ciudad || formData.ciudad.trim().length < 3) {
      newErrors.ciudad = 'La ciudad es obligatoria';
    }

    if (formData.telefono && !/^[0-9+\s()-]{8,15}$/.test(formData.telefono)) {
      newErrors.telefono = 'Formato de teléfono inválido';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Formato de email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setSuccessMessage('');

    try {
      const result = await window.api.emisor.save(formData);

      if (result.success) {
        setSuccessMessage('Configuración guardada exitosamente');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrors({ submit: result.error || 'Error al guardar la configuración' });
      }
    } catch (error) {
      console.error('Error:', error);
      setErrors({ submit: 'Error al guardar la configuración' });
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingMessage}>Cargando configuración...</div>
      </div>
    );
  }

  const regionOptions = regiones.map(region => ({
    value: region.value,
    label: region.label
  }));

  const comunaOptions = formData.region
    ? getComunasByRegion(formData.region)
    : [];

  const selectedRegion = regionOptions.find(opt => opt.value === formData.region);
  const selectedComuna = comunaOptions.find(opt => opt.value === formData.comuna);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>⚙️ Configuración del Emisor</h1>
          <p style={styles.subtitle}>Configure los datos de su empresa para la emisión de facturas electrónicas</p>
        </div>
      </div>

      {successMessage && (
        <div style={styles.successMessage}>
          ✓ {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Identificación</h3>

          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={styles.label}>RUT *</label>
              <input
                type="text"
                name="rut"
                value={formData.rut}
                onChange={handleChange}
                style={errors.rut ? {...styles.input, ...styles.inputError} : styles.input}
                placeholder="12.345.678-9"
                maxLength="12"
              />
              {errors.rut && <span style={styles.error}>{errors.rut}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Razón Social *</label>
              <input
                type="text"
                name="razon_social"
                value={formData.razon_social}
                onChange={handleChange}
                style={errors.razon_social ? {...styles.input, ...styles.inputError} : styles.input}
                placeholder="Empresa S.A."
              />
              {errors.razon_social && <span style={styles.error}>{errors.razon_social}</span>}
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Nombre Fantasía</label>
              <input
                type="text"
                name="nombre_fantasia"
                value={formData.nombre_fantasia}
                onChange={handleChange}
                style={styles.input}
                placeholder="Nombre comercial"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Giro *</label>
              <input
                type="text"
                name="giro"
                value={formData.giro}
                onChange={handleChange}
                style={errors.giro ? {...styles.input, ...styles.inputError} : styles.input}
                placeholder="Comercio al por menor"
              />
              {errors.giro && <span style={styles.error}>{errors.giro}</span>}
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Ubicación</h3>

          <div style={styles.formGroup}>
            <label style={styles.label}>Dirección *</label>
            <input
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              style={errors.direccion ? {...styles.input, ...styles.inputError} : styles.input}
              placeholder="Calle Ejemplo 123, Oficina 456"
            />
            {errors.direccion && <span style={styles.error}>{errors.direccion}</span>}
          </div>

          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Región *</label>
              <Select
                value={selectedRegion}
                onChange={handleRegionChange}
                options={regionOptions}
                placeholder="Seleccione región..."
                isClearable
                styles={{
                  control: (base) => ({
                    ...base,
                    borderColor: errors.region ? '#dc3545' : '#ced4da',
                    '&:hover': {
                      borderColor: errors.region ? '#dc3545' : '#80bdff'
                    }
                  })
                }}
              />
              {errors.region && <span style={styles.error}>{errors.region}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Comuna *</label>
              <Select
                value={selectedComuna}
                onChange={handleComunaChange}
                options={comunaOptions}
                placeholder={formData.region ? "Seleccione comuna..." : "Primero seleccione región"}
                isClearable
                isDisabled={!formData.region}
                styles={{
                  control: (base) => ({
                    ...base,
                    borderColor: errors.comuna ? '#dc3545' : '#ced4da',
                    '&:hover': {
                      borderColor: errors.comuna ? '#dc3545' : '#80bdff'
                    }
                  })
                }}
              />
              {errors.comuna && <span style={styles.error}>{errors.comuna}</span>}
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Ciudad *</label>
            <input
              type="text"
              name="ciudad"
              value={formData.ciudad}
              onChange={handleChange}
              style={errors.ciudad ? {...styles.input, ...styles.inputError} : styles.input}
              placeholder="Santiago"
            />
            {errors.ciudad && <span style={styles.error}>{errors.ciudad}</span>}
          </div>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Contacto</h3>

          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Teléfono</label>
              <input
                type="text"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                style={errors.telefono ? {...styles.input, ...styles.inputError} : styles.input}
                placeholder="+56 2 2345 6789"
              />
              {errors.telefono && <span style={styles.error}>{errors.telefono}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={errors.email ? {...styles.input, ...styles.inputError} : styles.input}
                placeholder="contacto@empresa.cl"
              />
              {errors.email && <span style={styles.error}>{errors.email}</span>}
            </div>
          </div>
        </div>

        {errors.submit && (
          <div style={styles.submitError}>
            {errors.submit}
          </div>
        )}

        <div style={styles.buttonContainer}>
          <button
            type="submit"
            style={saving ? {...styles.saveButton, ...styles.saveButtonDisabled} : styles.saveButton}
            disabled={saving}
          >
            {saving ? 'Guardando...' : 'Guardar Configuración'}
          </button>
        </div>
      </form>

      <div style={styles.infoBox}>
        <h4 style={styles.infoTitle}>ℹ️ Información Importante</h4>
        <ul style={styles.infoList}>
          <li>Los datos del emisor son requeridos para generar facturas electrónicas.</li>
          <li>Asegúrese de ingresar información correcta y actualizada.</li>
          <li>El RUT debe ser válido según el algoritmo del módulo 11.</li>
          <li>Estos datos aparecerán en todas las facturas que emita.</li>
        </ul>
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '30px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    maxWidth: '1000px',
    margin: '0 auto'
  },
  header: {
    marginBottom: '30px'
  },
  title: {
    fontSize: '28px',
    marginBottom: '5px',
    color: '#333'
  },
  subtitle: {
    fontSize: '14px',
    color: '#666'
  },
  loadingMessage: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '16px',
    color: '#666'
  },
  successMessage: {
    backgroundColor: '#d4edda',
    color: '#155724',
    border: '1px solid #c3e6cb',
    borderRadius: '4px',
    padding: '12px',
    marginBottom: '20px',
    fontSize: '14px'
  },
  form: {
    marginBottom: '30px'
  },
  section: {
    marginBottom: '30px',
    paddingBottom: '30px',
    borderBottom: '1px solid #e9ecef'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#495057',
    marginBottom: '20px'
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginBottom: '15px'
  },
  formGroup: {
    marginBottom: '15px'
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: '500',
    fontSize: '14px',
    color: '#495057'
  },
  input: {
    width: '100%',
    padding: '10px',
    fontSize: '14px',
    border: '1px solid #ced4da',
    borderRadius: '4px',
    boxSizing: 'border-box'
  },
  inputError: {
    borderColor: '#dc3545'
  },
  error: {
    color: '#dc3545',
    fontSize: '12px',
    marginTop: '5px',
    display: 'block'
  },
  submitError: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    border: '1px solid #f5c6cb',
    borderRadius: '4px',
    padding: '12px',
    marginBottom: '20px',
    fontSize: '14px'
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '30px'
  },
  saveButton: {
    padding: '12px 30px',
    fontSize: '14px',
    fontWeight: '600',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(40,167,69,0.3)'
  },
  saveButtonDisabled: {
    backgroundColor: '#6c757d',
    cursor: 'not-allowed'
  },
  infoBox: {
    backgroundColor: '#e7f3ff',
    border: '1px solid #b3d9ff',
    borderRadius: '6px',
    padding: '20px',
    marginTop: '30px'
  },
  infoTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#004085',
    marginBottom: '10px'
  },
  infoList: {
    margin: 0,
    paddingLeft: '20px',
    fontSize: '14px',
    color: '#004085',
    lineHeight: '1.8'
  }
};

export default EmisorConfig;
