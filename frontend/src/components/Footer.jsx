import Link from 'next/link';
import Image from 'next/image';
import React, { memo } from 'react';
import { FiInstagram, FiFacebook, FiTwitter, FiYoutube, FiMail, FiPhone, FiMapPin, FiArrowRight } from 'react-icons/fi';
import { Leaf } from 'lucide-react';

const Footer = () => {
  return (
    <footer>
      {/* Trust Strip */}
      <div className="trust-strip">
        <style>{`
          @media (max-width: 768px) {
            .trust-grid {
              grid-template-columns: repeat(4, 1fr) !important;
              gap: 8px !important;
              padding: 0 4px !important;
            }
            .trust-item {
              flex-direction: column !important;
              text-align: center !important;
              gap: 6px !important;
            }
            .trust-icon {
              width: 36px !important;
              height: 36px !important;
              font-size: 16px !important;
              border-radius: 10px !important;
              margin: 0 auto !important;
            }
            .trust-title {
              font-size: 9.5px !important;
              text-align: center !important;
              line-height: 1.1 !important;
            }
            .trust-sub {
              display: none !important;
            }
          }
        `}</style>
        <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 20px' }}>
          <div className="trust-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', textAlign: 'center' }}>
            {[
              { icon: '🚚', title: 'Free Shipping', sub: 'On orders above ₹999' },
              { icon: '↩️', title: 'Easy Returns', sub: '7-Day Return Policy' },
              { icon: '🌿', title: '100% Natural', sub: 'Toxin-free formulations' },
              { icon: '⭐', title: '50K+ Customers', sub: 'Trusted by families' },
            ].map((item, idx) => (
              <div key={idx} className="trust-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                <div className="trust-icon" style={{
                  width: '44px', height: '44px', flexShrink: 0,
                  background: 'linear-gradient(135deg, #EAF8FF, #DDF7E3)',
                  borderRadius: '12px', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '20px',
                }}>
                  {item.icon}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div className="trust-title" style={{ fontFamily: 'var(--font-outfit)', fontSize: '14px', fontWeight: '700', color: '#1a2332' }}>{item.title}</div>
                  <div className="trust-sub" style={{ fontSize: '12px', color: '#64748b' }}>{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="mg-footer" style={{ padding: '60px 0 0' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '48px' }}>

            {/* Brand */}
            <div style={{ gridColumn: 'span 1' }}>
              <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', marginBottom: '16px', height: '40px' }}>
                <img
                  src="/logo.png"
                  alt="MaxGlow"
                  style={{ height: '100%', width: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
                />
              </Link>
              <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.7', marginBottom: '20px', maxWidth: '280px' }}>
                MaxGlow brings you a curated collection of premium herbal skincare, hair care &amp; wellness products — crafted from nature's finest botanical ingredients.
              </p>
              {/* Social Icons */}
              <div style={{ display: 'flex', gap: '10px' }}>
                {[
                  { icon: <FiInstagram size={16} />, href: '#', color: '#E1306C' },
                  { icon: <FiFacebook size={16} />, href: '#', color: '#1877F2' },
                  { icon: <FiTwitter size={16} />, href: '#', color: '#1DA1F2' },
                  { icon: <FiYoutube size={16} />, href: '#', color: '#FF0000' },
                ].map((social, idx) => (
                  <Link
                    key={idx}
                    href={social.href}
                    style={{
                      width: '36px', height: '36px', borderRadius: '10px',
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#94a3b8', textDecoration: 'none',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = social.color; e.currentTarget.style.borderColor = social.color; e.currentTarget.style.color = 'white'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#94a3b8'; }}
                  >
                    {social.icon}
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 style={{ fontFamily: 'var(--font-outfit)', fontSize: '14px', fontWeight: '700', color: 'white', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Quick Links
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: 'Home', href: '/' },
                  { label: 'Shop All', href: '/shop' },
                  { label: 'Bestsellers', href: '/shop?sort=bestselling' },
                  { label: 'Combo Boxes', href: '/build-combo' },
                  { label: 'About Us', href: '/about' },
                  { label: 'Contact', href: '/contact' },
                ].map((link, idx) => (
                  <li key={idx}>
                    <Link href={link.href} style={{
                      color: '#94a3b8', textDecoration: 'none', fontSize: '14px',
                      display: 'flex', alignItems: 'center', gap: '6px',
                      transition: 'color 0.2s ease',
                    }}
                      onMouseEnter={e => e.currentTarget.style.color = '#61C454'}
                      onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                    >
                      <FiArrowRight size={12} /> {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 style={{ fontFamily: 'var(--font-outfit)', fontSize: '14px', fontWeight: '700', color: 'white', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Categories
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {['Skin Care', 'Hair Care', 'Body Care', 'Wellness', 'Baby Care', 'Face Care'].map((cat, idx) => (
                  <li key={idx}>
                    <Link href={`/shop?category=${encodeURIComponent(cat)}`} style={{
                      color: '#94a3b8', textDecoration: 'none', fontSize: '14px',
                      display: 'flex', alignItems: 'center', gap: '6px',
                      transition: 'color 0.2s ease',
                    }}
                      onMouseEnter={e => e.currentTarget.style.color = '#61C454'}
                      onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                    >
                      <FiArrowRight size={12} /> {cat}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact + Newsletter */}
            <div>
              <h4 style={{ fontFamily: 'var(--font-outfit)', fontSize: '14px', fontWeight: '700', color: 'white', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Contact Us
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {[
                  { icon: <FiMail size={14} />, text: 'support@maxglowon.com' },
                  { icon: <FiPhone size={14} />, text: '+91 98765 43210' },
                  { icon: <FiMapPin size={14} />, text: 'Mumbai, Maharashtra, India' },
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#94a3b8', fontSize: '13px' }}>
                    <span style={{ color: '#61C454', flexShrink: 0 }}>{item.icon}</span>
                    {item.text}
                  </div>
                ))}
              </div>

              {/* Newsletter */}
              <div style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px', padding: '16px',
              }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: 'white', marginBottom: '4px' }}>Newsletter</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px' }}>Get wellness tips & exclusive offers</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="email"
                    style={{
                      flex: 1, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '8px', padding: '8px 12px', color: 'white', fontSize: '13px', outline: 'none',
                    }}
                  />
                  <button style={{
                    background: 'linear-gradient(135deg, #3BAE56, #61C454)', border: 'none',
                    borderRadius: '8px', padding: '8px 14px', color: 'white', cursor: 'pointer',
                    fontWeight: '700', fontSize: '13px', whiteSpace: 'nowrap',
                  }}>
                    Join
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.08)',
            paddingTop: '20px', paddingBottom: '20px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexWrap: 'wrap', gap: '12px',
          }}>
            <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
              © 2025 MaxGlow. All rights reserved.
            </p>
            <div style={{ display: 'flex', gap: '20px' }}>
              {['Privacy Policy', 'Terms of Service', 'Refund Policy'].map((link, idx) => (
                <Link key={idx} href="#" style={{ color: '#64748b', fontSize: '12px', textDecoration: 'none', transition: 'color 0.2s ease' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#61C454'}
                  onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
                >
                  {link}
                </Link>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '12px' }}>
              Made with <span style={{ color: '#ef4444' }}>♥</span> by{' '}
              <a href="https://wealll.com/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center' }}>
                <img src="/wealll-logo.png" alt="We All Logo" style={{ height: '18px', width: 'auto', objectFit: 'contain' }} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default memo(Footer);
