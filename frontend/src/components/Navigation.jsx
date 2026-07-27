import Link from 'next/link';
import React from 'react';


const Navigation = () => {
  return (
    <>
      <nav className="main-nav d-none d-lg-block">
        <div className="container">
          <ul className="nav-links">
            <li><Link href="/">🏠 HOME</Link></li>
            <li><Link href="/shop">🛍️ SHOP </Link></li>
            <li><Link href="/build-combo">🎁 COMBO GIFT BOX</Link></li>
            <li><Link href="/about">ℹ️ ABOUT</Link></li>
            {/* <li><Link href="/blog">📝 BLOG</Link></li> */}
            <li><Link href="/contact">📞 CONTACT</Link></li>
          </ul>
        </div>
      </nav>

      {/* Mobile Search Bar */}
      <div className="container d-block d-lg-none mt-2 mb-2">
        <form className="header-search-form w-100" style={{ height: '40px', borderColor: '#004c03' }}>
          <input type="text" style={{ flexGrow: 1, padding: '0 15px', fontSize: '13px' }} />
          <button type="submit" style={{ padding: '0 15px' }}><i className="fas fa-search"></i></button>
        </form>
      </div>
    </>
  );
};

export default Navigation;
