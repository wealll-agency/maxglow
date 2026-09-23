"use client";
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import React, { useState, useEffect, useRef, memo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../store/authSlice';
import api from '../utils/axiosConfig';
import { getImageUrl } from '../utils/imageConfig';
import {
  FiSearch, FiX, FiUser, FiHeart, FiShoppingBag,
  FiMenu, FiLogIn, FiLogOut, FiPackage, FiSettings, FiChevronDown,
  FiGift, FiInfo
} from 'react-icons/fi';
import { Leaf, Flame, Award, Sparkles } from 'lucide-react';
import { MdDashboard } from 'react-icons/md';
import CartOffcanvas from './CartOffcanvas';

const Header = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const searchRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const userDropdownRef = useRef(null);

  const pathname = usePathname();

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setIsSuggestionsLoading(false);
      return;
    }

    setIsSuggestionsLoading(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await api.get(`/products?keyword=${encodeURIComponent(searchQuery.trim())}&limit=5`);
        const data = res.data;
        if (data.success) {
          setSuggestions(data.products || []);
        }
      } catch (err) {
        console.error('Error fetching search suggestions:', err);
      } finally {
        setIsSuggestionsLoading(false);
      }
    }, 300);
  }, [searchQuery]);

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
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setIsUserDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
        setIsMobileSearchOpen(false);
        setSuggestions([]);
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
      setIsMobileSearchOpen(false);
      setSearchQuery('');
      setSuggestions([]);
    }
  };

  const navLinks = [
    { href: '/shop', label: 'SHOP', icon: <FiShoppingBag size={14} /> },
    { href: '/bestsellers', label: 'BESTSELLERS', icon: <Award size={14} /> },
    { href: '/combos', label: 'COMBO', icon: <FiGift size={14} /> },
    { href: '/about', label: 'ABOUT', icon: <Leaf size={14} /> },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .nav-logo { height: 40px; width: auto; object-fit: contain; }
        @media (max-width: 768px) { .nav-logo { height: 32px !important; } }
      `}} />
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
        <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 20px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', height: '64px', gap: '20px', justifyContent: 'space-between' }}>

            {/* Logo */}
            <Link href="/" prefetch={true} onMouseEnter={() => router.prefetch('/')} style={{ textDecoration: 'none', flexShrink: 0, display: 'flex', alignItems: 'center', height: '100%' }}>
              <img
                src="/logo.png"
                alt="MaxGlow"
                className="nav-logo"
              />
            </Link>

            {/* Desktop Centered Icon + Label Navigation */}
            <nav className="mg-center-nav hide-mobile">
              {navLinks.map((link) => {
                const isActive = link.href === '/' 
                  ? pathname === '/' 
                  : (pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href)));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    prefetch={true}
                    onMouseEnter={() => router.prefetch(link.href)}
                    className={`mg-nav-link ${isActive ? 'active' : ''}`}
                    title={link.label}
                  >
                    <span className="mg-nav-icon-wrap">{link.icon}</span>
                    <span className="mg-nav-text">{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Actions & Search */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
              
              {/* Search Bar */}
              <div ref={searchRef} style={{ position: 'relative', flexShrink: 0 }} className="hide-mobile">
                {isSearchOpen ? (
                  <div style={{ position: 'relative', width: '240px' }}>
                    <form onSubmit={handleSearch} style={{
                      display: 'flex', alignItems: 'center',
                      background: 'white',
                      border: '1.5px solid #4A90E2',
                      borderRadius: '9999px',
                      padding: '5px 14px',
                      boxShadow: '0 0 0 3px rgba(74,144,226,0.15)',
                      width: '100%',
                      transition: 'all 0.3s ease',
                    }}>
                      <FiSearch size={15} color="#94a3b8" style={{ flexShrink: 0 }} />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                          border: 'none', background: 'transparent', outline: 'none',
                          flex: 1, padding: '0 6px', fontSize: '13.5px', color: '#1a2332',
                        }}
                        autoFocus
                      />
                      <button type="button" onClick={() => { setIsSearchOpen(false); setSuggestions([]); setSearchQuery(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#94a3b8' }}>
                        <FiX size={15} />
                      </button>
                    </form>
                    {(suggestions.length > 0 || isSuggestionsLoading || (searchQuery.trim() !== '' && suggestions.length === 0 && !isSuggestionsLoading)) && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '8px', background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #f1f5f9', overflow: 'hidden', zIndex: 1000 }}>
                        {isSuggestionsLoading ? (
                          <div style={{ padding: '15px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>Loading...</div>
                        ) : suggestions.length > 0 ? (
                          <div>
                            {suggestions.map(product => (
                              <Link 
                                key={product._id} 
                                href={`/product/${product.slug}`}
                                onClick={() => { setIsSearchOpen(false); setSuggestions([]); setSearchQuery(''); }}
                                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 15px', textDecoration: 'none', borderBottom: '1px solid #f8fafc', transition: 'background 0.2s ease' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                onMouseLeave={e => e.currentTarget.style.background = 'white'}
                              >
                                <Image
                                  src={getImageUrl(product.image || (product.images && product.images[0]))}
                                  alt={product.name}
                                  width={40}
                                  height={40}
                                  sizes="40px"
                                  style={{ objectFit: 'cover', borderRadius: '6px', width: '40px', height: '40px' }}
                                />
                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', lineHeight: '1.2', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</div>
                                  <div style={{ fontSize: '12px', color: '#3BAE56', marginTop: '2px', fontWeight: '500' }}>₹{product.price}</div>
                                </div>
                              </Link>
                            ))}
                            <div 
                              onClick={handleSearch}
                              style={{ padding: '10px 15px', textAlign: 'center', background: '#f8fafc', color: '#4A90E2', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s ease' }}
                              onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                              onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}
                            >
                              View all results
                            </div>
                          </div>
                        ) : searchQuery.trim() !== '' ? (
                          <div style={{ padding: '15px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No products found.</div>
                        ) : null}
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      background: '#F7FBFD', border: '1.5px solid rgba(221,244,255,0.8)',
                      borderRadius: '9999px', padding: '6px 14px',
                      fontSize: '12.5px', color: '#94a3b8', cursor: 'pointer',
                      transition: 'all 0.2s ease', whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#4A90E2'; e.currentTarget.style.background = 'white'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(221,244,255,0.8)'; e.currentTarget.style.background = '#F7FBFD'; }}
                  >
                    <FiSearch size={14} />
                    Search on MaxGlow
                  </button>
                )}
              </div>

              {/* Mobile Search Toggle */}
              <div className="show-mobile" style={{ position: 'relative' }}>
                <button className="mg-action-btn" onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)} type="button">
                  {isMobileSearchOpen ? <FiX size={18} /> : <FiSearch size={18} />}
                </button>
              </div>

              {/* User Dropdown */}
              <div ref={userDropdownRef} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                <button className="mg-action-btn" onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)} type="button" title="My Profile / Account">
                  <FiUser size={18} />
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
                            <MdDashboard size={15} color="#4A90E2" /> Admin Panel
                          </Link>
                        )}
                        <Link href="/user/profile" className="mg-dropdown-item" onClick={() => setIsUserDropdownOpen(false)}>
                          <FiUser size={15} color="#4A90E2" /> My Profile
                        </Link>
                        <Link href="/user/orders" className="mg-dropdown-item" onClick={() => setIsUserDropdownOpen(false)}>
                          <FiPackage size={15} color="#3BAE56" /> My Orders
                        </Link>
                        <div className="mg-dropdown-divider" />
                        <button onClick={handleLogout} className="mg-dropdown-item danger">
                          <FiLogOut size={15} color="#ef4444" /> Log Out
                        </button>
                      </>
                    ) : (
                      <>
                        <Link href="/login" className="mg-dropdown-item" onClick={() => setIsUserDropdownOpen(false)}>
                          <FiLogIn size={15} color="#3BAE56" /> Sign In
                        </Link>
                        <Link href="/register" className="mg-dropdown-item" onClick={() => setIsUserDropdownOpen(false)}>
                          <FiUser size={15} color="#4A90E2" /> Sign Up
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Wishlist / Favourites */}
              <Link href="/wishlist" prefetch={true} onMouseEnter={() => router.prefetch('/wishlist')} className="mg-action-btn hide-mobile" style={{ color: '#374151' }} title="Wishlist">
                <FiHeart size={18} />
                {isMounted && wishlistCount > 0 && (
                  <span className="mg-action-badge">{wishlistCount}</span>
                )}
              </Link>

              {/* Cart Button */}
              <button
                className="mg-action-btn"
                onClick={() => setIsCartOpen(true)}
                type="button"
                style={{ color: '#374151' }}
                title="Your Cart"
              >
                <FiShoppingBag size={18} />
                <span className="mg-action-badge">{isMounted ? cartCount : 0}</span>
              </button>
            </div>
          </div>

          {/* Mobile Search Dropdown Overlay */}
          {isMobileSearchOpen && (
            <div className="show-mobile" style={{ position: 'absolute', top: '100%', left: 0, right: 0, padding: '12px 20px', background: 'white', borderBottom: '1px solid #f1f5f9', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 9999 }}>
              <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', background: '#F7FBFD', borderRadius: '9999px', padding: '8px 16px', border: '1.5px solid #4A90E2' }}>
                <FiSearch size={16} color="#94a3b8" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ border: 'none', background: 'transparent', outline: 'none', flex: 1, padding: '0 10px', fontSize: '14px', color: '#1a2332' }}
                  autoFocus
                  placeholder="Search products..."
                />
                {searchQuery && (
                  <button type="button" onClick={() => { setSearchQuery(''); setSuggestions([]); }} style={{ background: 'none', border: 'none', padding: 0, color: '#94a3b8' }}>
                    <FiX size={16} />
                  </button>
                )}
              </form>
              {(suggestions.length > 0 || isSuggestionsLoading || (searchQuery.trim() !== '' && suggestions.length === 0 && !isSuggestionsLoading)) && (
                <div style={{ marginTop: '8px', background: 'white', borderRadius: '12px', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                  {isSuggestionsLoading ? (
                    <div style={{ padding: '15px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>Loading...</div>
                  ) : suggestions.length > 0 ? (
                    <div>
                      {suggestions.map(product => (
                        <Link 
                          key={product._id} 
                          href={`/product/${product.slug}`}
                          onClick={() => { setIsMobileSearchOpen(false); setSuggestions([]); setSearchQuery(''); }}
                          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 15px', textDecoration: 'none', borderBottom: '1px solid #f8fafc' }}
                        >
                          <Image
                            src={getImageUrl(product.image || (product.images && product.images[0]))}
                            alt={product.name}
                            width={40}
                            height={40}
                            sizes="40px"
                            style={{ objectFit: 'cover', borderRadius: '6px', width: '40px', height: '40px' }}
                          />
                          <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', lineHeight: '1.2', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</div>
                            <div style={{ fontSize: '12px', color: '#3BAE56', marginTop: '2px', fontWeight: '500' }}>₹{product.price}</div>
                          </div>
                        </Link>
                      ))}
                      <div 
                        onClick={(e) => handleSearch(e)}
                        style={{ padding: '10px 15px', textAlign: 'center', background: '#f8fafc', color: '#4A90E2', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                      >
                        View all results
                      </div>
                    </div>
                  ) : searchQuery.trim() !== '' ? (
                    <div style={{ padding: '15px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No products found.</div>
                  ) : null}
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Cart Offcanvas */}
      <CartOffcanvas isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Mobile Bottom Navigation Bar - Hidden on Product, Combo Details, Checkout, Login, and Register pages */}
      {!pathname?.startsWith('/product/') && 
       !(pathname?.startsWith('/combos/') && pathname !== '/combos') &&
       !pathname?.startsWith('/checkout') && 
       !pathname?.startsWith('/login') && 
       !pathname?.startsWith('/register') && (
        <div className="show-mobile">
          <div style={{
            position: 'fixed',
            bottom: 0, left: 0, right: 0,
            background: 'white',
            borderTop: '1px solid #f1f5f9',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.05)',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            height: '65px',
            zIndex: 9990,
            paddingBottom: 'env(safe-area-inset-bottom)'
          }}>
          {[
            { href: '/shop', label: 'Shop', icon: <FiShoppingBag size={20} /> },
            { href: '/combos', label: 'Combo', icon: <FiGift size={20} /> },
            { href: '/bestsellers', label: 'Bestseller', icon: <Flame size={20} /> },
            { href: '/wishlist', label: 'Favorite', icon: <FiHeart size={20} /> },
            { href: '/about', label: 'About', icon: <Leaf size={20} /> },
          ].map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
            return (
              <Link 
                key={item.label} 
                href={item.href} 
                prefetch={true}
                style={{ 
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                  color: isActive ? '#4A90E2' : '#94a3b8',
                  textDecoration: 'none', flex: 1, padding: '8px 0',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#4A90E2'}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = '#94a3b8'; }}
              >
                {item.icon}
                <span style={{ fontSize: '11px', fontWeight: isActive ? '600' : '500' }}>{item.label}</span>
              </Link>
            )
          })}
          </div>
        </div>
      )}
    </>
  );
};

export default memo(Header);
