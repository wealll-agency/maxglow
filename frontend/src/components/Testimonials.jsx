"use client";
import React, { memo } from 'react';
import { FiStar } from 'react-icons/fi';

const testimonials = [
  {
    name: 'Priya Sharma',
    location: 'Mumbai',
    text: 'MaxGlow\'s Aloe Vera Gel completely transformed my skin! It feels so light and hydrating. I\'ve been using it for 3 months and can\'t imagine my routine without it.',
    rating: 5,
    avatar: '🌸',
    product: 'Aloe Vera Gel',
    bg: '#DDF4FF',
  },
  {
    name: 'Rahul Verma',
    location: 'Delhi',
    text: 'The Neem Face Wash is incredible — cleared my acne within 2 weeks. Pure, natural ingredients that actually work. Completely replaced my chemical-based wash!',
    rating: 5,
    avatar: '🌿',
    product: 'Neem Face Wash',
    bg: '#DDF7E3',
  },
  {
    name: 'Ananya Patel',
    location: 'Bangalore',
    text: 'The Herbal Hair Oil is the best I\'ve ever used. After a month of regular use, my hair has grown noticeably thicker and the dandruff is completely gone.',
    rating: 5,
    avatar: '💚',
    product: 'Herbal Hair Oil',
    bg: '#FEF9E7',
  },
  {
    name: 'Siddharth Roy',
    location: 'Kolkata',
    text: 'Fast delivery, premium quality packaging, and exceptional products. MaxGlow is truly a premium wellness brand. The Vitamin C serum is absolutely outstanding!',
    rating: 5,
    avatar: '✨',
    product: 'Vitamin C Serum',
    bg: '#F0E6FF',
  },
];

const Testimonials = () => {
  return (
    <section style={{ background: 'linear-gradient(180deg, white 0%, #EAF8FF 100%)', padding: '64px 0' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span style={{
            display: 'inline-block', padding: '6px 16px',
            background: '#DDF7E3', borderRadius: '9999px',
            fontSize: '12px', fontWeight: '700', color: '#3BAE56', letterSpacing: '0.06em',
            marginBottom: '12px',
          }}>
            CUSTOMER STORIES
          </span>
          <h2 className="mg-section-title">What Our Customers Say</h2>
          <p className="mg-section-subtitle">Real results, real people</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px',
        }}>
          {testimonials.map((review, idx) => (
            <div key={idx} className="mg-card" style={{ padding: '24px' }}>
              {/* Rating */}
              <div style={{ display: 'flex', gap: '3px', marginBottom: '14px' }}>
                {[...Array(review.rating)].map((_, i) => (
                  <FiStar key={i} size={14} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                ))}
              </div>

              {/* Review text */}
              <p style={{ fontSize: '14px', color: '#4a5568', lineHeight: '1.7', marginBottom: '20px', fontStyle: 'italic' }}>
                "{review.text}"
              </p>

              {/* Product badge */}
              <div style={{
                display: 'inline-block', padding: '4px 12px',
                background: review.bg, borderRadius: '9999px',
                fontSize: '11px', fontWeight: '600', color: '#374151',
                marginBottom: '16px',
              }}>
                ✓ Verified — {review.product}
              </div>

              {/* Author */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: review.bg, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '20px', flexShrink: 0,
                }}>
                  {review.avatar}
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-outfit)', fontSize: '14px', fontWeight: '700', color: '#1a2332' }}>
                    {review.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>{review.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary stats */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '24px', marginTop: '48px',
          background: 'white', borderRadius: '20px', padding: '32px',
          boxShadow: '0 4px 24px rgba(74,144,226,0.08)',
          border: '1px solid rgba(221,244,255,0.8)',
        }}>
          {[
            { value: '4.9/5', label: 'Average Rating', icon: '⭐' },
            { value: '50,000+', label: 'Happy Customers', icon: '😊' },
            { value: '98%', label: 'Would Recommend', icon: '💚' },
            { value: '5,000+', label: 'Verified Reviews', icon: '✅' },
          ].map((stat, idx) => (
            <div key={idx} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', marginBottom: '4px' }}>{stat.icon}</div>
              <div style={{ fontFamily: 'var(--font-outfit)', fontSize: '24px', fontWeight: '800', color: '#1a2332' }}>{stat.value}</div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default memo(Testimonials);
