import React from 'react';

export default function RootLoading() {
  return (
    <div className="container py-5 text-center d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
      <div className="spinner-border text-success mb-3" role="status" style={{ width: '2.5rem', height: '2.5rem' }}>
        <span className="visually-hidden">Loading page...</span>
      </div>
      <p className="text-muted fs-7 m-0">Loading content...</p>
    </div>
  );
}
