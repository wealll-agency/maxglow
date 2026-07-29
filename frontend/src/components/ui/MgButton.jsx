'use client';

import React from 'react';
/**
 * MgButton — MaxGlow Premium Reusable Button Component
 * Supports variants: 'primary' (#58B368 gradient), 'secondary' (#8FD3C4), 'outline', 'ghost', 'danger'
 */
export default function MgButton({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  style = {}
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          background: 'var(--mg-secondary, #8FD3C4)',
          color: '#1E293B',
          border: 'none'
        };
      case 'outline':
        return {
          background: 'transparent',
          color: 'var(--mg-primary, #58B368)',
          border: '1.5px solid var(--mg-primary, #58B368)'
        };
      case 'ghost':
        return {
          background: 'transparent',
          color: 'var(--mg-text, #1E293B)',
          border: 'none'
        };
      case 'danger':
        return {
          background: '#EF4444',
          color: '#FFFFFF',
          border: 'none'
        };
      case 'primary':
      default:
        return {
          background: 'var(--mg-gradient-primary, linear-gradient(135deg, #58B368 0%, #469a54 100%))',
          color: '#FFFFFF',
          border: 'none',
          boxShadow: '0 4px 14px rgba(88, 179, 104, 0.25)'
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { padding: '6px 14px', fontSize: '13px' };
      case 'lg':
        return { padding: '14px 28px', fontSize: '16px' };
      case 'md':
      default:
        return { padding: '10px 20px', fontSize: '14px' };
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`mg-btn-base ${className}`}
      style={{
        borderRadius: '50px',
        fontWeight: '600',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'var(--transition, all 0.25s ease)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        width: fullWidth ? '100%' : 'auto',
        ...getVariantStyles(),
        ...getSizeStyles(),
        ...style
      }}
    >
      {children}
    </button>
  );
}
