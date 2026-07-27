import React from 'react';

/**
 * MgBadge — MaxGlow Premium Badge Component
 */
export default function MgBadge({ children, variant = 'success', className = '', style = {} }) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
      case 'success':
        return { bg: '#F2FFF5', color: '#3e884a', border: '1px solid rgba(88, 179, 104, 0.3)' };
      case 'info':
        return { bg: '#EAF6FF', color: '#2563EB', border: '1px solid rgba(37, 99, 235, 0.2)' };
      case 'warning':
        return { bg: '#FFFBEB', color: '#D97706', border: '1px solid rgba(217, 119, 6, 0.2)' };
      case 'danger':
        return { bg: '#FEF2F2', color: '#DC2626', border: '1px solid rgba(220, 38, 38, 0.2)' };
      case 'neutral':
      default:
        return { bg: '#F1F5F9', color: '#475569', border: '1px solid #E2E8F0' };
    }
  };

  const { bg, color, border } = getVariantStyles();

  return (
    <span
      className={`mg-badge-pill ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 10px',
        borderRadius: '50px',
        fontSize: '11px',
        fontWeight: '700',
        letterSpacing: '0.03em',
        backgroundColor: bg,
        color: color,
        border: border,
        ...style
      }}
    >
      {children}
    </span>
  );
}
