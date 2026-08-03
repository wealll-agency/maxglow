import Link from 'next/link';
import Image from 'next/image';
import React, { memo } from 'react';
import { FiInstagram, FiFacebook, FiTwitter, FiYoutube, FiMail, FiPhone, FiMapPin, FiArrowRight } from 'react-icons/fi';
import { Leaf } from 'lucide-react';

const Footer = () => {
  return (
    <footer>
      <style dangerouslySetInnerHTML={{ __html: `
        .mg-footer-links-wrap {
          display: contents;
        }
        @media (max-width: 768px) {
          .mg-footer-links-wrap {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 20px !important;
            grid-column: span 1 !important;
          }
        }
      ` }} />
      {/* Trust Strip */}
      <div className="trust-strip">

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

            <div className="mg-footer-links-wrap">
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
                  {['Skin Care', 'Hair Care', 'Serum', 'Sheet Mask', 'Face Care'].map((cat, idx) => (
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
            </div>

            {/* Contact */}
            <div>
              <h4 style={{ fontFamily: 'var(--font-outfit)', fontSize: '14px', fontWeight: '700', color: 'white', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Contact Us
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { icon: <FiMail size={14} />, text: 'support@maxglowon.com' },
                  { icon: <FiMapPin size={14} />, text: 'Delhi, India' },
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#94a3b8', fontSize: '13px' }}>
                    <span style={{ color: '#61C454', flexShrink: 0 }}>{item.icon}</span>
                    {item.text}
                  </div>
                ))}
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
