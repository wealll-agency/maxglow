"use client";
import { usePathname, useSearchParams } from 'next/navigation';




import { useEffect } from 'react';


export default function ScrollToTop() {
  const pathname = usePathname();
  const location = { pathname };
  
  const searchParams = useSearchParams();

  useEffect(() => {
    try {
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('ScrollToTop error:', error);
    }
  }, [pathname, searchParams]);

  return null;
}
