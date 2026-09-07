"use client";
import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Pagination({ totalPages, currentPage }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    const current = new URLSearchParams(searchParams.toString());
    current.set('page', newPage.toString());
    // Preserve scroll by using window.scrollTo after navigation if needed, 
    // but Next.js automatically scrolls to top on navigation.
    router.push(`?${current.toString()}`);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '40px' }}>
      <button 
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={{
          padding: '8px 16px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          background: currentPage === 1 ? '#f8fafc' : '#ffffff',
          color: currentPage === 1 ? '#94a3b8' : '#1e293b',
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
          fontFamily: 'var(--font-outfit)',
          fontWeight: '600'
        }}
      >
        Previous
      </button>

      <span style={{ fontSize: '14px', fontWeight: '600', color: '#475569', margin: '0 12px' }}>
        Page {currentPage} of {totalPages}
      </span>

      <button 
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={{
          padding: '8px 16px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          background: currentPage === totalPages ? '#f8fafc' : '#ffffff',
          color: currentPage === totalPages ? '#94a3b8' : '#1e293b',
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
          fontFamily: 'var(--font-outfit)',
          fontWeight: '600'
        }}
      >
        Next
      </button>
    </div>
  );
}
