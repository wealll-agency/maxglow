"use client";
import Link from 'next/link';
import React, { memo } from 'react';
import { Leaf, Sparkles, Shield, Heart } from 'lucide-react';
import { FiArrowRight } from 'react-icons/fi';

const purposes = [
  {
    icon: <Sparkles size={28} />,
    title: 'Skin Glow & Brightening',
    desc: 'Vitamin C, Aloe Vera, Neem — herbal actives for radiant skin',
    link: '/shop?category=Skin+Care',
    color: '#DDF4FF',
    accent: '#4A90E2',
  },
  {
    icon: <Leaf size={28} />,
    title: 'Hair Growth & Strength',
    desc: 'Biotin, Onion, Bhringraj — nourish your scalp naturally',
    link: '/shop?category=Hair+Care',
    color: '#DDF7E3',
    accent: '#3BAE56',
  },
  {
    icon: <Shield size={28} />,
    title: 'Wellness & Immunity',
    desc: 'Ashwagandha, Tulsi, Turmeric — strengthen from within',
    link: '/shop?category=Wellness',
    color: '#F0E6FF',
    accent: '#8b5cf6',
  },
  {
    icon: <Heart size={28} />,
    title: 'Body Care & Moisture',
    desc: 'Shea Butter, Argan, Coconut — deeply hydrate your skin',
    link: '/shop?category=Body+Care',
    color: '#FEF9E7',
    accent: '#f59e0b',
  },
];

const ShopByPurpose = () => {
  return (
    <section className="mg-section-spacing" style={{ background: 'linear-gradient(180deg, #F7FBFD 0%, white 100%)' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 20px' }}>
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span className="mg-badge mg-badge-green" style={{ marginBottom: '12px', display: 'inline-block' }}>
            CURATED FOR YOU
          </span>
          <h2 className="mg-section-title">Shop By Purpose</h2>
          <p className="mg-section-subtitle">Discover products tailored to your wellness goals</p>
        </div>


        {/* Cards Grid */}
        <div className="purpose-grid">
          {purposes.map((item, idx) => (
            <Link key={idx} href={item.link} className="purpose-card-link" style={{ textDecoration: 'none' }}>
              <div className="purpose-card-inner" style={{
                background: item.color,
                borderRadius: '20px',
                padding: '28px 24px',
                height: '100%',
                border: `1px solid ${item.accent}22`,
                transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = `0 16px 40px ${item.accent}25`;
                  e.currentTarget.style.background = 'white';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.background = item.color;
                }}
              >
                {/* Icon circle */}
                <div className="purpose-icon-wrapper" style={{
                  width: '56px', height: '56px', borderRadius: '14px',
                  background: `${item.accent}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: item.accent, marginBottom: '16px',
                  transition: 'background 0.3s ease',
                }}>
                  {item.icon}
                </div>

                <h3 className="purpose-card-title" style={{
                  fontFamily: 'var(--font-outfit)', fontSize: '16px', fontWeight: '700',
                  color: '#1a2332', marginBottom: '8px',
                }}>{item.title}</h3>

                <p className="purpose-card-desc" style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.6', marginBottom: '16px' }}>
                  {item.desc}
                </p>

                <div className="purpose-card-explore" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  color: item.accent, fontSize: '13px', fontWeight: '700',
                }}>
                  Explore <FiArrowRight size={14} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default memo(ShopByPurpose);
