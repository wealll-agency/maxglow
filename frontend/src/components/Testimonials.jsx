"use client";
import React, { useState, useEffect, memo } from 'react';
import { FiStar, FiChevronDown } from 'react-icons/fi';
import api from '../utils/axiosConfig';

const defaultTestimonials = [
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

const bgs = ['#DDF4FF', '#DDF7E3', '#FEF9E7', '#F0E6FF'];

const Testimonials = () => {
  const [reviewsList, setReviewsList] = useState([]);
  const [openIndices, setOpenIndices] = useState([0]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await api.get('/reviews/featured');
        if (res.data.success && res.data.reviews.length > 0) {
          const formatted = res.data.reviews.map((r, i) => ({
            name: r.user?.name || 'Customer',
            location: 'Verified Buyer',
            text: r.comment,
            rating: r.rating || 5,
            avatar: r.user?.name ? r.user.name.charAt(0).toUpperCase() : '👤',
            product: r.product?.name || 'MaxGlow Product',
            bg: bgs[i % bgs.length]
          }));
          setReviewsList(formatted);
        } else {
          setReviewsList(defaultTestimonials);
        }
      } catch (err) {
        console.error('Failed to fetch reviews', err);
        setReviewsList(defaultTestimonials);
      }
    };
    fetchReviews();
  }, []);

  const toggleReview = (index) => {
    setOpenIndices(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  return (
    <section className="mg-section-spacing" style={{ background: 'linear-gradient(180deg, white 0%, #EAF8FF 100%)' }}>
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
          <p className="mg-section-subtitle">Click on any review to read full details</p>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          maxWidth: '900px',
          margin: '0 auto',
        }}>
          {reviewsList.map((review, idx) => {
            const isOpen = openIndices.includes(idx);
            return (
              <div 
                key={idx} 
                className="testimonial-card" 
                style={{ 
                  padding: 0, 
                  margin: 0,
                  borderRadius: '16px',
                  overflow: 'hidden',
                  background: 'white',
                  boxShadow: isOpen ? '0 8px 24px rgba(74, 144, 226, 0.12)' : '0 2px 10px rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.3s ease',
                  border: isOpen ? '1.5px solid #5DAEFF' : '1.5px solid rgba(221, 244, 255, 0.8)'
                }}
              >
                {/* Accordion Header (Always Visible) */}
                <div
                  onClick={() => toggleReview(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    cursor: 'pointer',
                    userSelect: 'none',
                    background: isOpen ? '#F7FBFD' : 'white',
                    transition: 'background 0.2s ease',
                  }}
                >
                  {/* Name and Avatar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '38px', height: '38px', borderRadius: '50%',
                      background: review.bg, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '18px', flexShrink: 0,
                    }}>
                      {review.avatar}
                    </div>
                    <div>
                      <div style={{ fontFamily: 'var(--font-outfit)', fontSize: '15px', fontWeight: '700', color: '#1a2332' }}>
                        {review.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>{review.location}</div>
                    </div>
                  </div>

                  {/* Rating and Toggle Arrow */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[...Array(review.rating)].map((_, i) => (
                        <FiStar key={i} size={14} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                      ))}
                    </div>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      background: isOpen ? '#EAF8FF' : '#f8fafc',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.3s ease'
                    }}>
                      <FiChevronDown 
                        size={16} 
                        style={{ 
                          color: isOpen ? '#4A90E2' : '#64748b', 
                          transition: 'transform 0.3s ease',
                          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                        }} 
                      />
                    </div>
                  </div>
                </div>

                {/* Collapsible Content */}
                {isOpen && (
                  <div style={{
                    padding: '16px 20px 20px 20px',
                    borderTop: '1px dashed rgba(221, 244, 255, 0.9)',
                    background: 'white',
                  }}>
                    {/* Review text */}
                    <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.7', marginBottom: '14px', fontStyle: 'italic' }}>
                      "{review.text}"
                    </p>

                    {/* Product badge */}
                    <div style={{
                      display: 'inline-block', padding: '4px 12px',
                      background: review.bg, borderRadius: '9999px',
                      fontSize: '11px', fontWeight: '600', color: '#1a2332',
                    }}>
                      ✓ Verified Purchase — {review.product}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary stats */}
        <div className="stats-container" style={{
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
            <div key={idx} className="stat-item" style={{ textAlign: 'center' }}>
              <div className="stat-icon" style={{ fontSize: '28px', marginBottom: '4px' }}>{stat.icon}</div>
              <div className="stat-value" style={{ fontFamily: 'var(--font-outfit)', fontSize: '24px', fontWeight: '800', color: '#1a2332' }}>{stat.value}</div>
              <div className="stat-label" style={{ fontSize: '13px', color: '#64748b' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default memo(Testimonials);
