"use client";

'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function ConditionalFooter() {
  const pathname = usePathname();
  
  if (pathname && pathname.startsWith('/admin')) {
    return null;
  }
  
  if (pathname === '/login' || pathname === '/register') {
    return (
      <div className="d-none d-md-block">
        <Footer />
      </div>
    );
  }
  
  return <Footer />;
}
