"use client";
import React, { memo } from 'react';
import Link from 'next/link';
import { FiSmartphone, FiMapPin, FiGift, FiHelpCircle } from 'react-icons/fi';


const AnnouncementBar = () => {
  const messages = [
    '🌿 MaxGlow Grand Sale — Up to 60% OFF on Premium Herbal Products! Shop Now!',
    '🎁 Free Gift on orders above ₹999',
    '💧 Monsoon Wellness Sale — Extra 15% OFF Sitewide!',
    '✅ 100% Herbal | Toxin Free | Safe & Natural',
    '🌿 MaxGlow Grand Sale — Up to 60% OFF on Premium Herbal Products! Shop Now!',
    '🎁 Free Gift on orders above ₹999',
    '💧 Monsoon Wellness Sale — Extra 15% OFF Sitewide!',
    '✅ 100% Herbal | Toxin Free | Safe & Natural',
  ];

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-mg-announcement" style={{ borderBottom: '1px solid rgba(93,174,255,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', height: '36px', overflow: 'hidden' }}>
          {/* Scrolling messages - left side */}
          <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
            <div className="announcement-scroll">
              {messages.map((msg, i) => (
                <span key={i} style={{ fontSize: '12px', fontWeight: '500', color: '#2d6a4f', whiteSpace: 'nowrap', paddingRight: '3rem' }}>
                  {msg}
                </span>
              ))}
            </div>
          </div>

          {/* Right links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0', borderLeft: '1px solid rgba(93,174,255,0.3)', flexShrink: 0 }}>
            {[
              { icon: <FiSmartphone size={12} />, label: 'Get App', href: '#' },
              { icon: <FiMapPin size={12} />, label: 'Store & Events', href: '/contact' },
              { icon: <FiGift size={12} />, label: 'Gift Card', href: '#' },
              { icon: <FiHelpCircle size={12} />, label: 'Help', href: '/contact' },
            ].map((item, i) => (
              <Link
                key={i}
                href={item.href}
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  padding: '0 12px', borderLeft: i > 0 ? '1px solid rgba(93,174,255,0.3)' : 'none',
                  fontSize: '11px', fontWeight: '500', color: '#374151', textDecoration: 'none',
                  height: '36px', whiteSpace: 'nowrap',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#3BAE56'}
                onMouseLeave={e => e.currentTarget.style.color = '#374151'}
              >
                {item.icon} {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default memo(AnnouncementBar);
