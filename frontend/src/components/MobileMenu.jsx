'use client';
import React from 'react';
import Link from 'next/link';
import { Home, ShoppingBag, Gift, Info, BookOpen, Phone, User, Heart, MessageCircle, LogOut, LogIn, Package } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../store/authSlice';
import { useRouter } from 'next/navigation';

const MobileMenu = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  const closeMenu = () => {
    if (typeof window !== 'undefined' && window.bootstrap) {
      const menu = document.getElementById('mobileMenu');
      if (menu) {
        const bsOffcanvas = window.bootstrap.Offcanvas.getInstance(menu);
        if (bsOffcanvas) {
          bsOffcanvas.hide();
        }
      }
    }
  };

  const handleLogout = (e) => {
    e.preventDefault();
    dispatch(logoutUser());
    closeMenu();
    router.push('/login');
  };

  return (
    <div className="offcanvas offcanvas-start" tabIndex="-1" id="mobileMenu" aria-labelledby="mobileMenuLabel">
      <div className="offcanvas-header" style={{ backgroundColor: '#162C18', color: 'white' }}>
        <h5 className="offcanvas-title fw-bold" id="mobileMenuLabel">MaxGlow</h5>
        <button type="button" className="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
      </div>
      <div className="offcanvas-body p-0">
        <ul className="list-group list-group-flush mobile-nav-links">
          <li className="list-group-item">
            <Link href="/" className="d-flex align-items-center py-2 text-dark text-decoration-none fw-bold gap-2" onClick={closeMenu}>
              <Home size={18} className="text-muted" />HOME
            </Link>
          </li>
          <li className="list-group-item">
            <Link className="d-flex align-items-center py-2 text-dark text-decoration-none fw-bold gap-2" href="/shop" onClick={closeMenu}>
              <ShoppingBag size={18} className="text-muted" />SHOP
            </Link>
          </li>
          <li className="list-group-item">
            <Link href="/build-combo" className="d-flex align-items-center py-2 text-dark text-decoration-none fw-bold gap-2" onClick={closeMenu}>
              <Gift size={18} className="text-muted" />COMBO GIFT BOX
            </Link>
          </li>
          <li className="list-group-item">
            <Link href="/about" className="d-flex align-items-center py-2 text-dark text-decoration-none fw-bold gap-2" onClick={closeMenu}>
              <Info size={18} className="text-muted" />ABOUT
            </Link>
          </li>
          <li className="list-group-item">
            <Link href="/contact" className="d-flex align-items-center py-2 text-dark text-decoration-none fw-bold gap-2" onClick={closeMenu}>
              <Phone size={18} className="text-muted" />CONTACT
            </Link>
          </li>
          {user ? (
            <>
              <li className="list-group-item">
                <Link href="/user/profile" className="d-flex align-items-center py-2 text-dark text-decoration-none fw-bold gap-2" onClick={closeMenu}>
                  <User size={18} className="text-muted" />MY PROFILE
                </Link>
              </li>
              <li className="list-group-item">
                <Link href="/user/orders" className="d-flex align-items-center py-2 text-dark text-decoration-none fw-bold gap-2" onClick={closeMenu}>
                  <Package size={18} className="text-muted" />MY ORDERS
                </Link>
              </li>
              <li className="list-group-item">
                <a href="#" className="d-flex align-items-center py-2 text-danger text-decoration-none fw-bold gap-2" onClick={handleLogout}>
                  <LogOut size={18} className="text-danger" />LOG OUT
                </a>
              </li>
            </>
          ) : (
            <>
              <li className="list-group-item">
                <Link href="/login" className="d-flex align-items-center py-2 text-dark text-decoration-none fw-bold gap-2" onClick={closeMenu}>
                  <LogIn size={18} className="text-muted" />SIGN IN
                </Link>
              </li>
              <li className="list-group-item">
                <Link href="/register" className="d-flex align-items-center py-2 text-dark text-decoration-none fw-bold gap-2" onClick={closeMenu}>
                  <User size={18} className="text-muted" />SIGN UP
                </Link>
              </li>
            </>
          )}
        </ul>
        <div className="p-3 bg-light mt-3">
          <div className="d-flex justify-content-around">
            <Link href="/wishlist" className="text-dark bg-white rounded-circle p-2 shadow-sm d-flex align-items-center justify-content-center" onClick={closeMenu} style={{ width: '38px', height: '38px' }}>
              <Heart size={18} />
            </Link>
            <a href="https://wa.me/919748724689" target="_blank" rel="noopener noreferrer" className="text-dark bg-white rounded-circle p-2 shadow-sm d-flex align-items-center justify-content-center" onClick={closeMenu} style={{ width: '38px', height: '38px' }}>
              <MessageCircle size={18} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
