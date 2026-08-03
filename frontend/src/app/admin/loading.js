import React from 'react';

export default function AdminLoading() {
  return (
    <div className="animate-fade-in py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="placeholder-glow w-50">
          <span className="placeholder col-6 rounded py-3 mb-2 d-block bg-secondary opacity-25"></span>
          <span className="placeholder col-4 rounded py-2 d-block bg-secondary opacity-25"></span>
        </div>
      </div>
      <div className="card shadow-sm p-4 border-0 rounded-4 bg-white mb-4">
        <div className="placeholder-glow">
          <span className="placeholder col-12 rounded py-4 mb-3 d-block bg-secondary opacity-25"></span>
          <span className="placeholder col-12 rounded py-3 mb-2 d-block bg-secondary opacity-25"></span>
          <span className="placeholder col-12 rounded py-3 mb-2 d-block bg-secondary opacity-25"></span>
          <span className="placeholder col-12 rounded py-3 d-block bg-secondary opacity-25"></span>
        </div>
      </div>
    </div>
  );
}
