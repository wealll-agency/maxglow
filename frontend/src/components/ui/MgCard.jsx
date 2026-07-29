'use client';

import React from 'react';
/**
 * MgCard — MaxGlow Premium Soft Floating Card
 * Radius: 18px, Background: White, Border: #E5EEF2, Soft Shadow
 */
export default function MgCard({ children, className = '', style = {}, onClick, hoverable = true }) {
  return (
    <div
      onClick={onClick}
      className={`mg-card-container ${hoverable ? 'mg-card-hover' : ''} ${className}`}
      style={{
        backgroundColor: 'var(--mg-card-bg, #ffffff)',
        borderRadius: 'var(--mg-radius, 18px)',
        border: '1px solid var(--mg-border, #E5EEF2)',
        boxShadow: 'var(--shadow-sm, 0 2px 8px rgba(30, 41, 59, 0.04))',
        padding: '24px',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        ...style
      }}
    >
      {children}
      <style jsx>{`
        .mg-card-hover:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md, 0 6px 24px rgba(88, 179, 104, 0.08)) !important;
          border-color: rgba(88, 179, 104, 0.3) !important;
        }
      `}</style>
    </div>
  );
}
