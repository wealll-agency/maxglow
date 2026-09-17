"use client";

import { usePathname } from 'next/navigation';
import Header from './Header';
import AnnouncementBar from './AnnouncementBar';

export default function ConditionalHeader({ initialNotificationSettings }) {
  const pathname = usePathname();

  if (pathname && pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      <AnnouncementBar initialSettings={initialNotificationSettings} />
      <Header />
    </>
  );
}
