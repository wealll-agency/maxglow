export default function ProductLoading() {
  return (
    <div style={{ background: '#F7FBFD', padding: '40px 0', minHeight: '80vh' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 20px' }}>
        {/* Breadcrumb skeleton */}
        <div style={{ width: '150px', height: '16px', background: '#e2e8f0', borderRadius: '4px', marginBottom: '24px' }} />

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '40px',
          alignItems: 'start'
        }}>
          {/* Image gallery skeleton */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              width: '100%',
              aspectRatio: '1/1',
              borderRadius: '24px',
              background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
              backgroundSize: '200% 100%',
              border: '1px solid #e2e8f0'
            }} />
            <div style={{ display: 'flex', gap: '8px' }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{ width: '64px', height: '64px', borderRadius: '12px', background: '#e2e8f0' }} />
              ))}
            </div>
          </div>

          {/* Product details skeleton */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ width: '80px', height: '14px', background: '#e2e8f0', borderRadius: '4px' }} />
            <div style={{ width: '85%', height: '28px', background: '#e2e8f0', borderRadius: '6px' }} />
            <div style={{ width: '120px', height: '18px', background: '#e2e8f0', borderRadius: '4px' }} />
            <div style={{ width: '140px', height: '36px', background: '#e2e8f0', borderRadius: '8px', margin: '8px 0' }} />
            <div style={{ width: '100%', height: '80px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <div style={{ flex: 1, height: '46px', background: '#e2e8f0', borderRadius: '9999px' }} />
              <div style={{ flex: 1, height: '46px', background: '#e2e8f0', borderRadius: '9999px' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
