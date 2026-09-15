'use client';
import React, { useEffect } from 'react';
import { FiAlertCircle, FiRefreshCw } from 'react-icons/fi';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('Shop API Error:', error);
  }, [error]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '20px', textAlign: 'center' }}>
      <FiAlertCircle size={48} color="#ef4444" style={{ marginBottom: '16px' }} />
      <h2 style={{ fontFamily: 'var(--font-outfit)', fontSize: '24px', fontWeight: '700', color: '#1a2332', marginBottom: '12px' }}>
        Oops! Something went wrong
      </h2>
      <p style={{ fontSize: '15px', color: '#64748b', maxWidth: '400px', marginBottom: '24px', lineHeight: '1.6' }}>
        We encountered an issue while trying to load the products. Our servers might be experiencing a temporary hiccup.
      </p>
      <button
        onClick={() => reset()}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'linear-gradient(135deg, #3BAE56 0%, #61C454 100%)',
          color: 'white', border: 'none', padding: '12px 28px', borderRadius: '9999px',
          fontSize: '14px', fontWeight: '700', cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(59,174,86,0.3)'
        }}
      >
        <FiRefreshCw size={16} /> Try Again
      </button>
    </div>
  );
}
