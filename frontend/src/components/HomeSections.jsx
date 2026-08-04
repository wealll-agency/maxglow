"use client";
import Link from 'next/link';
import Image from 'next/image';
import React, { memo } from 'react';
import { FiArrowRight, FiChevronDown, FiChevronUp } from 'react-icons/fi';

import { useState, useEffect } from 'react';

/* ═══════════════════════════════════════════
   HERBAL OFFER BANNERS SLIDER
   ═══════════════════════════════════════════ */
export const NuttyDelightOffers = () => {
  const [offersState, setOffersState] = useState([
    { img: '/mg-offer1.jpg', title: 'Herbal Glow Sale', badge: '40% OFF', color: '#DDF4FF' },
    { img: '/mg-offer2.jpg', title: 'Wellness Special', badge: '30% OFF', color: '#DDF7E3' },
    { img: '/mg-offer3.jpg', title: 'Combo Deals', badge: '50% OFF', color: '#FEF9E7' },
  ]);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const { default: api } = await import('../utils/axiosConfig');
        const res = await api.get('/auth/settings');
        if (res.data.success && res.data.settings?.media_offers?.length > 0) {
          const customOffers = res.data.settings.media_offers;
          setOffersState(prev => prev.map((offer, idx) => {
            if (customOffers[idx] && customOffers[idx].trim() !== '') {
              return { ...offer, img: customOffers[idx] };
            }
            return offer;
          }));
        }
      } catch (err) {}
    };
    fetchOffers();
  }, []);

  const offers = offersState;

  return (
    <section className="mg-section-spacing" style={{ background: '#F7FBFD' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 className="mg-section-title">Exclusive Herbal Offers</h2>
          <p className="mg-section-subtitle">Hand-picked deals on premium wellness products</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {offers.map((offer, idx) => (
            <Link
              key={idx}
              href="/shop"
              style={{ textDecoration: 'none' }}
            >
              <div className="mg-card" style={{
                position: 'relative', overflow: 'hidden', cursor: 'pointer',
                background: offer.color, aspectRatio: '16/9',
              }}>
                <Image
                  src={offer.img}
                  alt={offer.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  style={{ objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(135deg, rgba(0,0,0,0.5) 0%, transparent 60%)',
                  display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '24px',
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #3BAE56, #61C454)',
                    borderRadius: '9999px', padding: '4px 14px',
                    fontSize: '13px', fontWeight: '800', color: 'white',
                    display: 'inline-block', marginBottom: '8px', width: 'fit-content',
                  }}>{offer.badge}</div>
                  <div style={{ color: 'white', fontSize: '18px', fontWeight: '700', fontFamily: 'var(--font-outfit)' }}>{offer.title}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════
   SHOP BY CATEGORIES — CARD GRID (matches reference)
   ═══════════════════════════════════════════ */
export const ShopByCategoryCards = () => {
  const categories = [
    {
      name: 'Face Care',
      discount: 'UPTO 40% OFF',
      image: '/category_face_care_v2.png',
      query: 'Skin Care',
      bg: '#EAF8FF',
      accent: '#4A90E2',
    },
    {
      name: 'Hair Care',
      discount: 'UPTO 40% OFF',
      image: '/category_hair_care_v2.png',
      query: 'Hair Care',
      bg: '#DDF7E3',
      accent: '#3BAE56',
    },
    {
      name: 'Body Care',
      discount: 'UPTO 40% OFF',
      image: '/category_body_care_v2.png',
      query: 'Body Care',
      bg: '#FEF9E7',
      accent: '#f59e0b',
    },
    {
      name: 'Serum',
      discount: 'UPTO 50% OFF',
      image: '/category_wellness_v2.png',
      query: 'Serum',
      bg: '#F0E6FF',
      accent: '#8b5cf6',
    },
  ];

  return (
    <section className="mg-section-spacing" style={{ background: 'white' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .shop-by-cat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
        }
        
        .cat-card-container {
          background: var(--bg);
          border-radius: 20px;
          padding: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border: 1px solid var(--accent-trans);
          transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
          cursor: pointer;
          position: relative;
          overflow: hidden;
          min-height: 120px;
          width: 100%;
        }
        
        .cat-card-left {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        
        .cat-card-title {
          font-family: var(--font-outfit);
          font-size: 18px;
          font-weight: 700;
          color: #1a2332;
          margin-bottom: 4px;
        }
        
        .cat-card-discount {
          color: var(--accent);
          font-size: 12px;
          font-weight: 800;
          margin-bottom: 12px;
          letter-spacing: 0.03em;
        }
        
        .cat-card-shopnow {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: var(--accent);
          font-size: 13px;
          font-weight: 700;
        }
        
        .cat-card-img-wrapper {
          width: 90px;
          height: 90px;
          flex-shrink: 0;
          position: relative;
          mix-blend-mode: multiply;
        }
        
        @media (max-width: 768px) {
          .shop-by-cat-grid {
            grid-template-columns: repeat(4, 1fr) !important;
            gap: 8px !important;
          }
          
          .cat-card-container {
            flex-direction: column-reverse !important;
            align-items: center !important;
            justify-content: center !important;
            padding: 8px 4px !important;
            aspect-ratio: 1 / 1 !important;
            min-height: unset !important;
            border-radius: 12px !important;
            text-align: center !important;
          }
          
          .cat-card-left {
            align-items: center !important;
          }
          
          .cat-card-title {
            font-size: 10px !important;
            margin-bottom: 2px !important;
            margin-top: 4px !important;
            white-space: nowrap;
          }
          
          .cat-card-discount {
            font-size: 7px !important;
            margin-bottom: 0px !important;
            letter-spacing: 0px !important;
            white-space: nowrap;
          }
          
          .cat-card-shopnow {
            display: none !important;
          }
          
          .cat-card-img-wrapper {
            width: 36px !important;
            height: 36px !important;
          }
        }
        
        @media (max-width: 380px) {
          .cat-card-title {
            font-size: 8px !important;
          }
          .cat-card-discount {
            font-size: 6px !important;
          }
          .cat-card-img-wrapper {
            width: 28px !important;
            height: 28px !important;
          }
        }
      ` }} />
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 20px' }}>
        {/* Title with decorative lines */}
        <div className="mg-divider" style={{ marginBottom: '40px' }}>
          <span className="mg-section-title" style={{ margin: 0 }}>Shop By Categories</span>
        </div>

        <div className="shop-by-cat-grid">
          {categories.map((cat, idx) => (
            <Link key={idx} href={`/shop?category=${encodeURIComponent(cat.query)}`} style={{ textDecoration: 'none' }}>
              <div 
                className="cat-card-container"
                style={{
                  '--bg': cat.bg,
                  '--accent': cat.accent,
                  '--accent-trans': `${cat.accent}22`
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 12px 32px ${cat.accent}22`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                {/* Left content */}
                <div className="cat-card-left">
                  <h3 className="cat-card-title">{cat.name}</h3>
                  <div className="cat-card-discount">
                    {cat.discount}
                  </div>
                  <span className="cat-card-shopnow">
                    Shop Now <FiArrowRight size={14} />
                  </span>
                </div>

                {/* Product Image */}
                <div className="cat-card-img-wrapper">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 768px) 50px, 90px"
                    style={{ objectFit: 'cover', borderRadius: '50%' }}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════
   LEGACY ShopByCategory — kept for backward compat
   ═══════════════════════════════════════════ */
export const ShopByCategory = ShopByCategoryCards;

/* ═══════════════════════════════════════════
   RECENT BLOGS
   ═══════════════════════════════════════════ */
export const RecentBlogs = () => {
  const posts = [
    { img: '/blog_image1.png', title: 'Benefits of Aloe Vera for Skin', date: 'Jul 12, 2025', cat: 'Skin Care' },
    { img: '/blog_image2.png', title: 'How Neem Transforms Hair Health', date: 'Jun 28, 2025', cat: 'Hair Care' },
    { img: '/blog_image3.png', title: 'Ayurvedic Daily Wellness Routine', date: 'Jun 10, 2025', cat: 'Wellness' },
  ];

  return (
    <section className="mg-section-spacing" style={{ background: '#F7FBFD' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 className="mg-section-title">From Our Blog</h2>
          <p className="mg-section-subtitle">Tips, guides and insights on herbal wellness</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {posts.map((post, idx) => (
            <Link key={idx} href="/blog" style={{ textDecoration: 'none' }}>
              <div className="mg-card">
                <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                  <Image src={post.img} alt={post.title} fill sizes="400px" style={{ objectFit: 'cover', transition: 'transform 0.5s ease' }} />
                </div>
                <div style={{ padding: '20px' }}>
                  <span className="mg-badge mg-badge-green" style={{ marginBottom: '10px', display: 'inline-block' }}>{post.cat}</span>
                  <h3 style={{ fontFamily: 'var(--font-outfit)', fontSize: '16px', fontWeight: '700', color: '#1a2332', marginBottom: '8px', lineHeight: '1.4' }}>{post.title}</h3>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>{post.date}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════
   FAQS
   ═══════════════════════════════════════════ */
const faqs = [
  { q: 'Are MaxGlow products 100% natural?', a: 'Yes! All MaxGlow products are formulated with 100% natural botanical ingredients, free from harmful chemicals, parabens, and sulfates.' },
  { q: 'How long does delivery take?', a: 'We typically deliver within 3-7 business days for standard shipping. Express delivery options are available at checkout.' },
  { q: 'Can I return a product if I\'m not satisfied?', a: 'Yes, we offer a 7-day hassle-free return policy. Contact our support team and we\'ll process your return swiftly.' },
  { q: 'Are your products dermatologically tested?', a: 'Yes, all products undergo thorough dermatological testing and are clinically proven to be safe for all skin types.' },
  { q: 'Do you offer COD (Cash on Delivery)?', a: 'Yes, we offer Cash on Delivery for orders up to ₹10,000 across most pin codes in India.' },
];

export const Faqs = () => {
  const [openIdx, setOpenIdx] = useState(null);

  return (
    <section className="mg-section-spacing" style={{ background: 'white' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 className="mg-section-title">Frequently Asked Questions</h2>
          <p className="mg-section-subtitle">Everything you need to know about MaxGlow</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {faqs.map((faq, idx) => (
            <div key={idx} style={{
              border: '1.5px solid',
              borderColor: openIdx === idx ? '#4A90E2' : '#e2e8f0',
              borderRadius: '14px',
              overflow: 'hidden',
              transition: 'border-color 0.2s ease',
              boxShadow: openIdx === idx ? '0 4px 16px rgba(74,144,226,0.1)' : 'none',
            }}>
              <button
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '18px 20px', background: 'transparent', border: 'none', cursor: 'pointer',
                  textAlign: 'left', gap: '16px',
                }}
              >
                <span style={{ fontFamily: 'var(--font-outfit)', fontSize: '15px', fontWeight: '700', color: '#1a2332', flex: 1 }}>
                  {faq.q}
                </span>
                <div style={{ flexShrink: 0, color: openIdx === idx ? '#4A90E2' : '#94a3b8', transition: 'color 0.2s ease' }}>
                  {openIdx === idx ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                </div>
              </button>
              {openIdx === idx && (
                <div style={{ padding: '0 20px 18px', fontSize: '14px', color: '#64748b', lineHeight: '1.7' }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════
   TAGS SECTION
   ═══════════════════════════════════════════ */
export const TagsSection = () => {
  const tags = [
    'Aloe Vera', 'Neem Face Wash', 'Hair Oil', 'Skin Brightening', 'Body Butter',
    'Herbal Soap', 'Anti-Dandruff', 'Vitamin C Serum', 'Tea Tree Oil', 'Rosehip Oil',
    'Moisturizer', 'Sunscreen SPF50', 'Face Mask', 'Argan Oil', 'Biotin',
    'Collagen', 'Ashwagandha', 'Turmeric', 'Charcoal', 'Salicylic Acid',
  ];

  return (
    <section className="mg-section-spacing" style={{ background: '#F7FBFD' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 20px' }}>

        <h3 style={{ fontFamily: 'var(--font-outfit)', fontSize: '14px', fontWeight: '700', color: '#94a3b8', marginBottom: '16px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Popular Searches
        </h3>
        <div className="popular-tags-wrapper" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {tags.map((tag, idx) => (
            <Link key={idx} href={`/shop?keyword=${encodeURIComponent(tag)}`} className="popular-search-tag">
              {tag}
            </Link>
          ))}
          <Link href="/shop" className="view-all-btn">
            View All &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
};

/* Legacy HealthyCombo export */
export const HealthyCombo = () => null;
