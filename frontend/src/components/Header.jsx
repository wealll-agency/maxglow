"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import React, { useState, useEffect, useRef, memo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../store/authSlice';
import {
  FiSearch, FiX, FiUser, FiHeart, FiShoppingBag,
  FiMenu, FiLogIn, FiLogOut, FiPackage, FiSettings, FiChevronDown
} from 'react-icons/fi';
import { Leaf } from 'lucide-react';
import { MdDashboard } from 'react-icons/md';
import CartOffcanvas from './CartOffcanvas';

const Header = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const searchRef = useRef(null);
  const userDropdownRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { user } = useSelector((state) => state.auth);
  const wishlistItems = useSelector((state) => state.wishlist?.items || []);
  const { items: cartItems } = useSelector((state) => state.cart);
  const cartCount = cartItems ? cartItems.reduce((acc, item) => acc + item.quantity, 0) : 0;
  const wishlistCount = wishlistItems.length;

  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    const handleResize = () => {
      if (window.innerWidth >= 992) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    
    handleResize(); // Check initially
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen || isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen, isCartOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setIsUserDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = (e) => {
    e.preventDefault();
    dispatch(logoutUser());
    setIsUserDropdownOpen(false);
    router.push('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?keyword=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { href: '/shop', label: 'Shop' },
    { href: '/shop?sort=bestselling', label: 'Bestsellers' },
    { href: '/build-combo', label: 'Combos' },
    { href: '/about', label: 'About' },
  ];

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 9000,
          background: isScrolled ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.98)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(221,244,255,0.8)',
          transition: 'all 0.3s ease',
          boxShadow: isScrolled ? '0 4px 20px rgba(74,144,226,0.1)' : 'none',
        }}
      >
        <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', height: '64px', gap: '24px', justifyContent: 'space-between' }}>

            {/* Logo */}
            <Link href="/" prefetch={true} onMouseEnter={() => router.prefetch('/')} style={{ textDecoration: 'none', flexShrink: 0, display: 'flex', alignItems: 'center', height: '40px' }}>
              <Image
                src="/logo.png"
                alt="MaxGlow"
                width={120}
                height={40}
                priority
                style={{ height: '100%', width: 'auto', objectFit: 'contain' }}
              />
            </Link>

            {/* Desktop Nav */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: '2px', flex: 1 }} className="hide-mobile">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={true}
                  onMouseEnter={() => router.prefetch(link.href)}
                  className="mg-nav-link"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Search Bar */}
            <div ref={searchRef} style={{ position: 'relative', flexShrink: 0 }} className="hide-mobile">
              {isSearchOpen ? (
                <form onSubmit={handleSearch} style={{
                  display: 'flex', alignItems: 'center',
                  background: 'white',
                  border: '1.5px solid #4A90E2',
                  borderRadius: '9999px',
                  padding: '6px 16px',
                  boxShadow: '0 0 0 3px rgba(74,144,226,0.15)',
                  width: '260px',
                  transition: 'all 0.3s ease',
                }}>
                  <FiSearch size={16} color="#94a3b8" style={{ flexShrink: 0 }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      border: 'none', background: 'transparent', outline: 'none',
                      flex: 1, padding: '0 8px', fontSize: '14px', color: '#1a2332',
                    }}
                    autoFocus
                  />
                  <button type="button" onClick={() => setIsSearchOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#94a3b8' }}>
                    <FiX size={16} />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    background: '#F7FBFD', border: '1.5px solid rgba(221,244,255,0.8)',
                    borderRadius: '9999px', padding: '7px 16px',
                    fontSize: '13px', color: '#94a3b8', cursor: 'pointer',
                    transition: 'all 0.2s ease', whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#4A90E2'; e.currentTarget.style.background = 'white'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(221,244,255,0.8)'; e.currentTarget.style.background = '#F7FBFD'; }}
                >
                  <FiSearch size={15} />
                  Search on MaxGlow
                </button>
              )}
            </div>

            {/* Right Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>

              {/* User */}
              <div ref={userDropdownRef} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }} className="hide-mobile">
                <button className="mg-action-btn" onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)} type="button">
                  <FiUser size={20} />
                </button>
                {isUserDropdownOpen && (
                  <div className="mg-dropdown">
                    {isMounted && user ? (
                      <>
                        <div style={{ padding: '12px', borderBottom: '1px solid #f1f5f9', marginBottom: '4px' }}>
                          <div style={{ fontSize: '13px', fontWeight: '700', color: '#1a2332' }}>Hi, {user.name?.split(' ')[0] || 'User'}</div>
                          <div style={{ fontSize: '11px', color: '#94a3b8' }}>{user.email}</div>
                        </div>
                        {(user?.role === 'Super Admin' || user?.role === 'Manager' || user?.role === 'Staff') && (
                          <Link href="/admin/dashboard" className="mg-dropdown-item" onClick={() => setIsUserDropdownOpen(false)}>
                            <MdDashboard size={16} color="#4A90E2" /> Admin Panel
                          </Link>
                        )}
                        <Link href="/user/profile" className="mg-dropdown-item" onClick={() => setIsUserDropdownOpen(false)}>
                          <FiUser size={16} color="#4A90E2" /> My Profile
                        </Link>
                        <Link href="/user/orders" className="mg-dropdown-item" onClick={() => setIsUserDropdownOpen(false)}>
                          <FiPackage size={16} color="#3BAE56" /> My Orders
                        </Link>
                        <div className="mg-dropdown-divider" />
                        <button onClick={handleLogout} className="mg-dropdown-item danger">
                          <FiLogOut size={16} color="#ef4444" /> Log Out
                        </button>
                      </>
                    ) : (
                      <>
                        <Link href="/login" className="mg-dropdown-item" onClick={() => setIsUserDropdownOpen(false)}>
                          <FiLogIn size={16} color="#3BAE56" /> Sign In
                        </Link>
                        <Link href="/register" className="mg-dropdown-item" onClick={() => setIsUserDropdownOpen(false)}>
                          <FiUser size={16} color="#4A90E2" /> Sign Up
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Wishlist / Favourites */}
              <Link href="/wishlist" prefetch={true} onMouseEnter={() => router.prefetch('/wishlist')} className="mg-action-btn" style={{ color: '#374151' }}>
                <FiHeart size={20} />
                {isMounted && wishlistCount > 0 && (
                  <span className="mg-action-badge">{wishlistCount}</span>
                )}
              </Link>

              {/* Cart */}
              <button
                className="mg-action-btn"
                onClick={() => setIsCartOpen(true)}
                type="button"
                style={{ color: '#374151' }}
              >
                <FiShoppingBag size={20} />
                <span className="mg-action-badge">{isMounted ? cartCount : 0}</span>
              </button>

              {/* Mobile hamburger */}
              <button
                className="mg-action-btn show-mobile"
                onClick={() => setIsMobileMenuOpen(true)}
                type="button"
                style={{ color: '#374151' }}
              >
                <FiMenu size={22} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Cart Offcanvas */}
      <CartOffcanvas isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 9990, backdropFilter: 'blur(4px)'
          }}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div style={{
        position: 'fixed', top: 0, left: 0, height: '100vh', width: '100%', maxWidth: '300px',
        background: 'white', zIndex: 9991,
        boxShadow: '4px 0 40px rgba(0,0,0,0.15)',
        transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex', flexDirection: 'column',
        overflowY: 'auto',
      }}>
        {/* Mobile Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: '1px solid #f1f5f9',
          background: 'linear-gradient(135deg, #EAF8FF 0%, #DDF7E3 100%)',
        }}>
          <h5 style={{ margin: 0, fontWeight: 700, color: '#1a2332', fontFamily: 'var(--font-outfit), sans-serif' }}>Menu</h5>
          <button onClick={() => setIsMobileMenuOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}>
            <FiX size={22} />
          </button>
        </div>

        {/* Mobile Search */}
        <div style={{ padding: '16px' }}>
          <form onSubmit={(e) => { handleSearch(e); setIsMobileMenuOpen(false); }} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: '#F7FBFD', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '10px 14px',
          }}>
            <FiSearch size={16} color="#94a3b8" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', flex: 1, fontSize: '14px', color: '#1a2332' }}
            />
          </form>
        </div>

        {/* Mobile Nav Links */}
        <nav style={{ padding: '8px 16px', flex: 1 }}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              prefetch={true}
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', padding: '14px 12px',
                borderRadius: '10px', fontSize: '15px', fontWeight: '600',
                color: '#374151', textDecoration: 'none',
                fontFamily: 'var(--font-outfit), sans-serif',
                marginBottom: '4px', transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                router.prefetch(link.href);
                e.currentTarget.style.background = '#DDF7E3';
                e.currentTarget.style.color = '#3BAE56';
              }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#374151'; }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/user/orders"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              display: 'flex', alignItems: 'center', padding: '14px 12px',
              borderRadius: '10px', fontSize: '15px', fontWeight: '600',
              color: '#374151', textDecoration: 'none',
              fontFamily: 'var(--font-outfit), sans-serif',
              marginBottom: '4px', transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#DDF7E3'; e.currentTarget.style.color = '#3BAE56'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#374151'; }}
          >
            My Orders
          </Link>
        </nav>

        {/* Mobile Footer */}
        <div style={{ padding: '16px', paddingBottom: '40px', borderTop: '1px solid #f1f5f9' }}>
          {user ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link href="/user/profile" className="btn-mg-outline" onClick={() => setIsMobileMenuOpen(false)} style={{ justifyContent: 'center', fontSize: '14px', padding: '10px 20px' }}>
                <FiUser size={16} /> My Profile
              </Link>
              {['Super Admin', 'Manager', 'Staff'].includes(user.role) && (
                <Link href="/admin/dashboard" className="btn-mg-primary" onClick={() => setIsMobileMenuOpen(false)} style={{ justifyContent: 'center', fontSize: '14px', padding: '10px 20px', background: '#3BAE56', color: '#fff', border: 'none' }}>
                  <MdDashboard size={16} style={{ marginRight: '6px' }} /> Go to Admin Portal
                </Link>
              )}
              <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff0f0', border: 'none', borderRadius: '9999px', padding: '10px', color: '#ef4444', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>
                <FiLogOut size={16} style={{ marginRight: '6px' }} /> Log Out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link href="/login" className="btn-mg-primary" onClick={() => setIsMobileMenuOpen(false)} style={{ justifyContent: 'center', fontSize: '14px', padding: '11px 20px' }}>
                <FiLogIn size={16} /> Sign In
              </Link>
              <Link href="/register" className="btn-mg-outline" onClick={() => setIsMobileMenuOpen(false)} style={{ justifyContent: 'center', fontSize: '14px', padding: '10px 20px' }}>
                <FiUser size={16} /> Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>


    </>
  );
};

export default memo(Header);
