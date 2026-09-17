"use client";

'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function ConditionalFooter() {
  const pathname = usePathname();
  
  if (pathname && (pathname.startsWith('/admin') || pathname.startsWith('/checkout') || pathname === '/login' || pathname === '/register')) {
    return null;
  }
  
  return <Footer />;
}
