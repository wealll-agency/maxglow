"use client";
import React, { useState, useEffect, useRef, memo } from 'react';
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
  const scrollRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (window.innerWidth >= 768) return; // Only auto-slide on mobile
      
      const container = scrollRef.current;
      if (container) {
        // If reached the end, scroll back to start
        if (container.scrollLeft >= container.scrollWidth - container.clientWidth - 10) {
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          // Scroll forward by one container width; snap will align it
          container.scrollBy({ left: container.clientWidth, behavior: 'smooth' });
        }
      }
    }, 3500);
    return () => clearInterval(interval);
  }, []);

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
    <section className="mg-section-spacing" style={{ background: 'linear-gradient(180deg, white 0%, #EAF8FF 100%)', paddingBottom: '0', paddingTop: '10px' }}>
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
          <p className="mg-section-subtitle">Read what our community has to say about their experience</p>
        </div>

        <style dangerouslySetInnerHTML={{__html: `
          .reviews-grid {
            display: flex;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            gap: 16px;
            padding-bottom: 24px;
            margin: 0 -20px;
            padding-left: 20px;
            padding-right: 20px;
            scrollbar-width: none;
            -webkit-overflow-scrolling: touch;
          }
          .reviews-grid::-webkit-scrollbar {
            display: none;
          }
          .testimonial-card {
            flex: 0 0 100%;
            scroll-snap-align: center;
            display: flex;
            flex-direction: column;
          }
          .review-content {
            display: block;
            flex-grow: 1;
          }
          @media (min-width: 768px) {
            .reviews-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              overflow-x: visible;
              margin: 0 auto;
              padding-left: 0;
              padding-right: 0;
              max-width: 1200px;
            }
            .testimonial-card {
              flex: auto;
            }
          }
          @media (min-width: 1024px) {
            .reviews-grid {
              grid-template-columns: repeat(4, 1fr);
            }
          }
        `}} />

        <div className="reviews-grid" ref={scrollRef}>
          {reviewsList.map((review, idx) => {
            return (
              <div 
                key={idx} 
                className="testimonial-card" 
                style={{ 
                  padding: 0, 
                  borderRadius: '16px',
                  overflow: 'hidden',
                  background: 'white',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.3s ease',
                  border: '1.5px solid rgba(221, 244, 255, 0.8)'
                }}
              >
                {/* Header */}
                <div
                  className="review-card-header"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    userSelect: 'none',
                    background: 'white',
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

                  {/* Rating */}
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[...Array(review.rating)].map((_, i) => (
                      <FiStar key={i} size={14} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div className="review-content" style={{
                  padding: '16px 20px 20px 20px',
                  borderTop: '1px dashed rgba(221, 244, 255, 0.9)',
                  background: 'white',
                }}>
                  <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.7', marginBottom: '14px', fontStyle: 'italic' }}>
                    "{review.text}"
                  </p>
                  <div style={{
                    display: 'inline-block', padding: '4px 12px',
                    background: review.bg, borderRadius: '9999px',
                    fontSize: '11px', fontWeight: '600', color: '#1a2332',
                  }}>
                    ✓ Verified Purchase — {review.product}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Summary stats styled exactly like trust-strip */}
      <div className="trust-strip" style={{ marginTop: '48px' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 20px' }}>
          <div className="trust-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', textAlign: 'center' }}>
            {[
              { value: '4.9/5', label: 'Average Rating', icon: '⭐' },
              { value: '50,000+', label: 'Happy Customers', icon: '😊' },
              { value: '98%', label: 'Would Recommend', icon: '💚' },
              { value: '5,000+', label: 'Verified Reviews', icon: '✅' },
            ].map((stat, idx) => (
              <div key={idx} className="trust-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                <div className="trust-icon" style={{
                  width: '44px', height: '44px', flexShrink: 0,
                  background: 'linear-gradient(135deg, #EAF8FF, #DDF7E3)',
                  borderRadius: '12px', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '20px',
                }}>
                  {stat.icon}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div className="trust-title" style={{ fontFamily: 'var(--font-outfit)', fontSize: '16px', fontWeight: '700', color: '#1a2332' }}>{stat.value}</div>
                  <div className="trust-sub" style={{ fontSize: '13px', color: '#64748b' }}>{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default memo(Testimonials);
