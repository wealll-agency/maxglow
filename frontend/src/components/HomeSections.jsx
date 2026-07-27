"use client";
import Link from 'next/link';
import Image from 'next/image';
import React, { memo } from 'react';
import { FiArrowRight, FiChevronDown, FiChevronUp } from 'react-icons/fi';

import { useState } from 'react';

/* ═══════════════════════════════════════════
   HERBAL OFFER BANNERS SLIDER
   ═══════════════════════════════════════════ */
export const NuttyDelightOffers = () => {
  const offers = [
    { img: '/mg-offer1.jpg', title: 'Herbal Glow Sale', badge: '40% OFF', color: '#DDF4FF' },
    { img: '/mg-offer2.jpg', title: 'Wellness Special', badge: '30% OFF', color: '#DDF7E3' },
    { img: '/mg-offer3.jpg', title: 'Combo Deals', badge: '50% OFF', color: '#FEF9E7' },
  ];

  return (
    <section style={{ background: '#F7FBFD', padding: '60px 0' }}>
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
      image: '/category1.png',
      query: 'Skin Care',
      bg: '#EAF8FF',
      accent: '#4A90E2',
    },
    {
      name: 'Hair Care',
      discount: 'UPTO 40% OFF',
      image: '/category2.png',
      query: 'Hair Care',
      bg: '#DDF7E3',
      accent: '#3BAE56',
    },
    {
      name: 'Body Care',
      discount: 'UPTO 40% OFF',
      image: '/category3.png',
      query: 'Body Care',
      bg: '#FEF9E7',
      accent: '#f59e0b',
    },
    {
      name: 'Wellness',
      discount: 'UPTO 50% OFF',
      image: '/category4.png',
      query: 'Wellness',
      bg: '#F0E6FF',
      accent: '#8b5cf6',
    },
  ];

  return (
    <section style={{ background: 'white', padding: '64px 0' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 20px' }}>
        {/* Title with decorative lines */}
        <div className="mg-divider" style={{ marginBottom: '40px' }}>
          <span className="mg-section-title" style={{ margin: 0 }}>Shop By Categories</span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
        }}>
          {categories.map((cat, idx) => (
            <Link key={idx} href={`/shop?category=${encodeURIComponent(cat.query)}`} style={{ textDecoration: 'none' }}>
              <div style={{
                background: cat.bg,
                borderRadius: '20px',
                padding: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: `1px solid ${cat.accent}22`,
                transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                minHeight: '120px',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 12px 32px ${cat.accent}22`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                {/* Left content */}
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontFamily: 'var(--font-outfit)', fontSize: '18px', fontWeight: '700',
                    color: '#1a2332', marginBottom: '4px',
                  }}>{cat.name}</h3>
                  <div style={{ color: cat.accent, fontSize: '12px', fontWeight: '800', marginBottom: '12px', letterSpacing: '0.03em' }}>
                    {cat.discount}
                  </div>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    color: cat.accent, fontSize: '13px', fontWeight: '700',
                  }}>
                    Shop Now <FiArrowRight size={14} />
                  </span>
                </div>

                {/* Product Image */}
                <div style={{ width: '90px', height: '90px', flexShrink: 0, position: 'relative' }}>
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    sizes="90px"
                    style={{ objectFit: 'contain' }}
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
    <section style={{ background: '#F7FBFD', padding: '64px 0' }}>
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
    <section style={{ background: 'white', padding: '64px 0' }}>
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
    <section style={{ background: '#F7FBFD', padding: '40px 0' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 20px' }}>
        <h3 style={{ fontFamily: 'var(--font-outfit)', fontSize: '14px', fontWeight: '700', color: '#94a3b8', marginBottom: '16px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Popular Searches
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {tags.map((tag, idx) => (
            <Link key={idx} href={`/shop?keyword=${encodeURIComponent(tag)}`} style={{ textDecoration: 'none' }}>
              <span style={{
                display: 'inline-block', padding: '7px 16px',
                background: 'white', border: '1.5px solid rgba(221,244,255,0.8)',
                borderRadius: '9999px', fontSize: '13px', fontWeight: '500',
                color: '#374151', transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(74,144,226,0.06)',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#DDF7E3'; e.currentTarget.style.borderColor = '#3BAE56'; e.currentTarget.style.color = '#3BAE56'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = 'rgba(221,244,255,0.8)'; e.currentTarget.style.color = '#374151'; }}
              >
                {tag}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

/* Legacy HealthyCombo export */
export const HealthyCombo = () => null;
