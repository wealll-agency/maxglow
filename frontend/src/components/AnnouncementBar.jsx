"use client";
import React, { memo, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiSmartphone, FiMapPin, FiGift, FiHelpCircle } from 'react-icons/fi';
import { fetchSystemSettings } from '../utils/settingsCache';

const AnnouncementBar = () => {
  const pathname = usePathname();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    let mounted = true;
    const getSettings = async () => {
      try {
        const res = await fetchSystemSettings();
        if (mounted && res && res.settings && res.settings.notification_settings) {
          setSettings(res.settings.notification_settings);
        } else if (mounted) {
          setSettings({
            text: '🌿 MaxGlow Grand Sale — Up to 60% OFF on Premium Herbal Products! Shop Now!',
            bgColor: '#DDF4FF',
            textColor: '#2d6a4f',
            speed: 30
          });
        }
      } catch (error) {
        console.error("Failed to load notification settings", error);
        if (mounted) {
          setSettings({
            text: '🌿 MaxGlow Grand Sale — Up to 60% OFF on Premium Herbal Products! Shop Now!',
            bgColor: '#DDF4FF',
            textColor: '#2d6a4f',
            speed: 30
          });
        }
      }
    };
    getSettings();
    return () => { mounted = false; };
  }, [pathname]);

  if (!settings) {
    return <div style={{ height: '37px', width: '100%' }}></div>;
  }

  return (
    <>
      {/* Top Announcement Bar */}
      <div style={{ backgroundColor: settings.bgColor, borderBottom: '1px solid rgba(93,174,255,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', height: '36px', overflow: 'hidden' }}>
          {/* Scrolling messages - left side */}
          <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
            <div style={{ display: 'inline-flex', animation: `scroll-left ${settings.speed}s linear infinite` }}>
              {/* First Half */}
              <div style={{ display: 'inline-flex', gap: '3rem', paddingRight: '3rem' }}>
                {[...Array(15)].map((_, i) => (
                  <span key={`a-${i}`} style={{ fontSize: '12px', fontWeight: '500', color: settings.textColor, whiteSpace: 'nowrap' }}>
                    {settings.text}
                  </span>
                ))}
              </div>
              {/* Second Half (Duplicate) */}
              <div style={{ display: 'inline-flex', gap: '3rem', paddingRight: '3rem' }}>
                {[...Array(15)].map((_, i) => (
                  <span key={`b-${i}`} style={{ fontSize: '12px', fontWeight: '500', color: settings.textColor, whiteSpace: 'nowrap' }}>
                    {settings.text}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0', borderLeft: '1px solid rgba(93,174,255,0.3)', flexShrink: 0 }}>
            {[
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
