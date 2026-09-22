import React, { Suspense } from 'react';
// Force Next.js dev server rebuild
import { Inter, Outfit } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import ReduxProvider from '../components/ReduxProvider';
import ConditionalHeader from '../components/ConditionalHeader';
import ConditionalFooter from '../components/ConditionalFooter';
import ScrollToTop from '../components/ScrollToTop';
import { NotificationProvider } from '../context/NotificationContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';



const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], display: 'swap', variable: '--font-outfit' });

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL),
  title: {
    default: 'MaxGlow — Premium Herbal Wellness',
    template: '%s | MaxGlow'
  },
  description: 'Discover MaxGlow — premium herbal skincare, hair care & wellness products crafted from nature\'s finest botanical ingredients. Pure. Natural. Effective.',
  keywords: 'herbal skincare, natural hair care, wellness products, aloe vera, neem, turmeric, ayurvedic',
  openGraph: {
    title: 'MaxGlow — Premium Herbal Wellness',
    description: 'Premium herbal products for Healthy Skin, Hair & Life.',
    type: 'website',
    url: '/',
    siteName: 'MaxGlow'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MaxGlow — Premium Herbal Wellness',
    description: 'Premium herbal products for Healthy Skin, Hair & Life.'
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#4A90E2',
};

async function getNotificationSettings() {
  try {
    const url = 'http://127.0.0.1:7052/api/auth/settings';
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      return data?.settings?.notification_settings || null;
    }
  } catch (err) {
    console.error("Layout fetch failed:", err.message);
  }
  return null;
}

export default async function RootLayout({ children }) {
  const initialNotificationSettings = await getNotificationSettings();
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://maxglow-assets-74641.s3.ap-south-1.amazonaws.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://maxglow-assets-74641.s3.ap-south-1.amazonaws.com" />
      </head>
      <body className={`${inter.variable} ${outfit.variable} ${inter.className}`}>
        <ReduxProvider>
          <NotificationProvider>

              <Suspense fallback={null}>
                <ScrollToTop />
              </Suspense>
            <ConditionalHeader initialNotificationSettings={initialNotificationSettings} />
            <main>
              {children}
            </main>
            <ConditionalFooter />

          </NotificationProvider>
        </ReduxProvider>
        <Script 
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" 
          strategy="lazyOnload" 
        />
      </body>
    </html>
  );
}
