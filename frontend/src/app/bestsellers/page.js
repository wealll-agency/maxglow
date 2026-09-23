'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Leaf } from 'lucide-react';
import ProductCard from '../../components/ProductCard';
import api from '../../utils/axiosConfig';
import { getImageUrl } from '../../utils/imageConfig';

export default function BestsellersPage() {
  const [products, setProducts] = useState([]);
  const [bannerImg, setBannerImg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, settingsRes] = await Promise.all([
          api.get('/products?sort=bestselling').catch(() => ({ data: { success: false } })),
          api.get('/auth/settings').catch(() => ({ data: { success: false } }))
        ]);
        
        if (prodRes.data && prodRes.data.products) {
          setProducts(prodRes.data.products);
        }
        
        if (settingsRes.data.success && settingsRes.data.settings?.media_bestseller_banner) {
          setBannerImg(settingsRes.data.settings.media_bestseller_banner);
        }
      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .shop-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 20px;
        }
        @media (max-width: 576px) {
          .shop-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
        }
        .bestseller-banner {
          background: linear-gradient(135deg, #EAF8FF 0%, #F5FBF6 100%);
          border-radius: 20px;
          padding: 60px 40px;
          text-align: center;
          margin-bottom: 40px;
          position: relative;
          overflow: hidden;
        }
        .bestseller-banner::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -10%;
          width: 50%;
          height: 200%;
          background: radial-gradient(circle, rgba(59,174,86,0.05) 0%, transparent 70%);
          transform: rotate(30deg);
        }
      `}} />
      <div className="container" style={{ padding: '40px 16px', maxWidth: '1440px', margin: '0 auto' }}>
        
        {bannerImg ? (
          <div style={{ 
            position: 'relative', 
            overflow: 'hidden', 
            width: '100%', 
            minHeight: '220px',
            maxHeight: '400px',
            aspectRatio: '1400 / 300',
            borderRadius: '24px', 
            marginBottom: '40px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)'
          }}>
            <Image 
              src={getImageUrl(bannerImg)} 
              alt="Bestsellers Banner" 
              fill
              priority
              sizes="(max-width: 768px) 100vw, 1400px"
              style={{ objectFit: 'cover', objectPosition: 'center' }} 
            />
          </div>
        ) : (
          <div className="bestseller-banner">
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <span className="mg-badge mg-badge-green" style={{ fontSize: '12px', padding: '6px 12px' }}>Curated Selection</span>
              </div>
              <h1 style={{ fontFamily: 'var(--font-outfit)', fontSize: '42px', fontWeight: '800', color: '#1a2332', margin: '0 0 16px' }}>Our Best Sellers</h1>
              <p style={{ fontSize: '16px', color: '#64748b', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
                Discover the most loved and highly rated herbal wellness products chosen by our customers.
              </p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-brand" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>
                Showing {products.length} products
              </span>
            </div>

            {products.length > 0 ? (
              <div className="shop-grid">
                {products.map(product => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="glass" style={{ textAlign: 'center', padding: '80px 20px', borderRadius: '20px' }}>
                <Leaf size={48} color="#94a3b8" style={{ marginBottom: '20px' }} />
                <h3 style={{ fontFamily: 'var(--font-outfit)', fontSize: '20px', fontWeight: '700', color: '#1a2332', marginBottom: '8px' }}>No Bestsellers Found</h3>
                <p style={{ fontSize: '15px', color: '#64748b', margin: 0 }}>Products added to the bestseller list will appear here.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
