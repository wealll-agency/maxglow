"use client";
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import AnnouncementBar from './AnnouncementBar';

const Header = dynamic(() => import('./Header'), { ssr: false });

export default function ConditionalHeader() {
  const pathname = usePathname();

  if (pathname && pathname.startsWith('/admin')) {
    return null; // Admin has its own layout/header
  }

  return (
    <>
      <AnnouncementBar />
      <Header />
    </>
  );
}
