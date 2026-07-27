import React from 'react';

/**
 * MgTable — MaxGlow Enterprise Table Wrapper Component
 */
export default function MgTable({ headers = [], children, className = '', style = {} }) {
  return (
    <div
      className="mg-table-responsive-wrapper shadow-sm rounded-4 overflow-hidden border"
      style={{
        borderColor: 'var(--mg-border, #E5EEF2)',
        backgroundColor: '#FFFFFF',
        ...style
      }}
    >
      <div className="table-responsive">
        <table className={`table table-hover align-middle m-0 ${className}`}>
          {headers.length > 0 && (
            <thead style={{ backgroundColor: '#F8FAFC' }}>
              <tr>
                {headers.map((head, index) => (
                  <th
                    key={index}
                    className="py-3 px-4 fw-semibold text-uppercase"
                    style={{
                      fontSize: '11px',
                      letterSpacing: '0.05em',
                      color: '#64748B',
                      borderBottom: '1px solid #E5EEF2'
                    }}
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody style={{ fontSize: '13px', color: '#1E293B' }}>{children}</tbody>
        </table>
      </div>
    </div>
  );
}
