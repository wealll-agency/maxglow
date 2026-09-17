"use client";

import React from 'react';
import Link from 'next/link';
import { Tag, Layers, Bell, ChevronRight, Speaker } from 'lucide-react';

export default function PromotionalManagerPage() {
  const PAGES = [
    {
      id: 'coupons',
      title: 'Coupon Manager',
      subtitle: 'Create and manage discount codes, active status, and expiry dates.',
      badge: 'Discounts',
      icon: Tag,
      color: '#e65100',
      bgLight: '#fff3e0',
      borderColor: '#ffcc80',
      link: '/admin/coupons'
    },
    {
      id: 'combos',
      title: 'Combo Manager',
      subtitle: 'Create and manage product combinations and special bundle pricing.',
      badge: 'Bundles',
      icon: Layers,
      color: '#0288d1',
      bgLight: '#e1f5fe',
      borderColor: '#81d4fa',
      link: '/admin/combos'
    },
    {
      id: 'notification',
      title: 'Arrange Notification',
      subtitle: 'Update scrolling announcement text, colors, and speed.',
      badge: 'Announcements',
      icon: Speaker,
      color: '#2e7d32',
      bgLight: '#e8f5e9',
      borderColor: '#a5d6a7',
      link: '/admin/arrange-notification'
    }
  ];

  return (
    <div className="container-fluid py-4 px-lg-5 animate-fade-in" style={{ backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      
      <div className="mb-4 bg-white p-4 rounded-4 shadow-sm border border-light">
        <div className="d-flex align-items-center gap-3 mb-2">
          <div className="p-3 rounded-3" style={{ backgroundColor: '#e8f5e9', color: '#2e7d32' }}>
            <Tag size={28} />
          </div>
          <div>
            <h3 className="fw-bold mb-1" style={{ color: '#162C18' }}>Promotional & Notification Manager</h3>
            <p className="text-muted mb-0 fs-7">Select a manager below to update coupons, combos, and scrolling announcements.</p>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {PAGES.map(page => {
          const Icon = page.icon;
          return (
            <div key={page.id} className="col-md-6 col-lg-4">
              <Link href={page.link} className="text-decoration-none">
                <div 
                  className="card h-100 border-0 shadow-sm rounded-4 transition-all cursor-pointer overflow-hidden"
                  style={{ borderTop: `4px solid ${page.color}` }}
                >
                  <div className="card-body p-4 d-flex flex-column justify-content-between">
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="p-3 rounded-3" style={{ backgroundColor: page.bgLight, color: page.color }}>
                          <Icon size={24} />
                        </div>
                        <span className="badge px-3 py-2 rounded-pill fs-8 fw-semibold" style={{ backgroundColor: page.bgLight, color: page.color, border: `1px solid ${page.borderColor}` }}>
                          {page.badge}
                        </span>
                      </div>
                      <h5 className="fw-bold text-dark mb-2" style={{ fontSize: '18px' }}>{page.title}</h5>
                      <p className="text-muted fs-7 mb-4">{page.subtitle}</p>
                    </div>
                    <div className="pt-3 border-top d-flex align-items-center justify-content-between">
                      <span className="fw-semibold fs-7" style={{ color: page.color }}>Open {page.title}</span>
                      <div className="rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ backgroundColor: page.bgLight, color: page.color }}>
                        <ChevronRight size={18} />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
