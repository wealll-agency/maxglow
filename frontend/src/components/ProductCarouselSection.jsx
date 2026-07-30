"use client";
import React, { memo } from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import ProductCard from './ProductCard';
import { FiArrowRight, FiArrowLeft } from 'react-icons/fi';

const ProductCarouselSection = ({ title, products = [] }) => {
  if (!products || products.length === 0) return null;

  return (
    <section className="mg-section-spacing" style={{ background: 'white', position: 'relative' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 20px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{
              fontFamily: 'var(--font-outfit), sans-serif',
              fontSize: '24px', fontWeight: '800', color: '#1a2332', margin: 0,
            }}>
              {title}
            </h2>
            <div style={{ height: '3px', width: '48px', background: 'linear-gradient(90deg, #4A90E2, #3BAE56)', borderRadius: '9999px', marginTop: '8px' }} />
          </div>
          <Link href="/shop" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            color: '#3BAE56', fontWeight: '700', fontSize: '14px', textDecoration: 'none',
            padding: '8px 16px', border: '1.5px solid #3BAE56', borderRadius: '9999px',
            transition: 'all 0.2s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#3BAE56'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#3BAE56'; }}
          >
            View All <FiArrowRight size={14} />
          </Link>
        </div>

        {/* Swiper */}
        <div style={{ position: 'relative' }}>
          <Swiper
            modules={[Autoplay, Navigation]}
            spaceBetween={16}
            slidesPerView={1}
            loop={products.length > 4}
            autoplay={{ delay: 3500, disableOnInteraction: false }}
            navigation={{
              prevEl: `.prev-${title?.replace(/\s/g, '')}`,
              nextEl: `.next-${title?.replace(/\s/g, '')}`,
            }}
            breakpoints={{
              480: { slidesPerView: 2 },
              768: { slidesPerView: 3 },
              1024: { slidesPerView: 4 },
            }}
            style={{ padding: '4px 2px 8px' }}
          >
            {products.map((product, idx) => (
              <SwiperSlide key={product._id || idx} style={{ height: 'auto' }}>
                <ProductCard product={product} />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Nav */}
          <button className={`prev-${title?.replace(/\s/g, '')} carousel-nav-btn`} style={{
            position: 'absolute', left: '-20px', top: '50%', transform: 'translateY(-50%)',
            zIndex: 10, width: '40px', height: '40px', borderRadius: '50%',
            background: 'white', border: '1.5px solid rgba(221,244,255,0.8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 4px 16px rgba(74,144,226,0.15)',
            transition: 'all 0.2s ease',
          }}>
            <FiArrowLeft size={16} color="#374151" />
          </button>
          <button className={`next-${title?.replace(/\s/g, '')} carousel-nav-btn`} style={{
            position: 'absolute', right: '-20px', top: '50%', transform: 'translateY(-50%)',
            zIndex: 10, width: '40px', height: '40px', borderRadius: '50%',
            background: 'white', border: '1.5px solid rgba(221,244,255,0.8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 4px 16px rgba(74,144,226,0.15)',
            transition: 'all 0.2s ease',
          }}>
            <FiArrowRight size={16} color="#374151" />
          </button>
        </div>
      </div>

      <style>{`
        .carousel-nav-btn:hover {
          background: #3BAE56 !important;
          border-color: #3BAE56 !important;
        }
        .carousel-nav-btn:hover svg { color: white !important; }
        .swiper-button-next, .swiper-button-prev { display: none !important; }
      `}</style>
    </section>
  );
};

export default memo(ProductCarouselSection);
