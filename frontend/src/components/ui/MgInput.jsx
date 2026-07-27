import React from 'react';

/**
 * MgInput — MaxGlow Premium Form Input Component
 * CRITICAL RULE ENFORCED: Zero placeholder attributes used! Uses clean top labels.
 */
export default function MgInput({
  label,
  type = 'text',
  name,
  value,
  onChange,
  required = false,
  error,
  disabled = false,
  className = '',
  rows,
  as = 'input',
  children,
  style = {}
}) {
  const Component = as === 'textarea' ? 'textarea' : as === 'select' ? 'select' : 'input';

  return (
    <div className={`mg-input-group mb-3 ${className}`}>
      {label && (
        <label htmlFor={name} className="form-label fw-semibold" style={{ fontSize: '13px', color: '#1E293B', marginBottom: '6px' }}>
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <Component
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        rows={rows}
        className={`form-control mg-input-field ${error ? 'is-invalid' : ''}`}
        style={{
          borderRadius: '12px',
          border: error ? '1.5px solid #EF4444' : '1px solid #E5EEF2',
          backgroundColor: disabled ? '#F8FAFC' : '#FFFFFF',
          padding: '10px 16px',
          fontSize: '14px',
          color: '#1E293B',
          boxShadow: 'none',
          transition: 'all 0.2s ease',
          ...style
        }}
      >
        {children}
      </Component>
      {error && <div className="invalid-feedback fs-7 mt-1">{error}</div>}
    </div>
  );
}
