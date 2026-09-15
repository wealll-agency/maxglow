export default function ShopLoading() {
  return (
    <div style={{ maxWidth: '1400px', margin: '20px auto 60px', padding: '0 20px' }}>
      {/* Breadcrumb skeleton */}
      <div style={{ width: '120px', height: '16px', background: '#e2e8f0', borderRadius: '4px', marginBottom: '20px' }} />

      {/* Banner skeleton */}
      <div style={{
        width: '100%',
        minHeight: '180px',
        borderRadius: '24px',
        background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
        backgroundSize: '200% 100%',
        marginBottom: '40px'
      }} />

      {/* Layout grid */}
      <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
        {/* Sidebar skeleton (desktop) */}
        <aside style={{ width: '280px', flexShrink: 0, display: 'none' }} className="d-none d-lg-block">
          <div style={{ height: '300px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }} />
        </aside>

        {/* Product grid skeleton */}
        <div style={{ flex: 1 }}>
          <div style={{ height: '52px', background: '#f8fafc', borderRadius: '16px', marginBottom: '24px', border: '1px solid #e2e8f0' }} />
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '20px'
          }}>
            {[...Array(8)].map((_, i) => (
              <div key={i} style={{
                borderRadius: '16px',
                border: '1px solid #f1f5f9',
                background: '#ffffff',
                overflow: 'hidden',
                padding: '0'
              }}>
                <div style={{ width: '100%', aspectRatio: '1/1', background: '#f1f5f9' }} />
                <div style={{ padding: '16px' }}>
                  <div style={{ width: '60px', height: '12px', background: '#e2e8f0', borderRadius: '4px', marginBottom: '8px' }} />
                  <div style={{ width: '90%', height: '16px', background: '#e2e8f0', borderRadius: '4px', marginBottom: '12px' }} />
                  <div style={{ width: '70px', height: '20px', background: '#e2e8f0', borderRadius: '4px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
