import React, { Suspense } from 'react';
import { Inter, Outfit } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import ReduxProvider from '../components/ReduxProvider';
import ConditionalHeader from '../components/ConditionalHeader';
import ConditionalFooter from '../components/ConditionalFooter';
import ScrollToTop from '../components/ScrollToTop';
import { NotificationProvider } from '../context/NotificationContext';

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], display: 'swap', variable: '--font-outfit' });

export const metadata = {
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
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#4A90E2',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className={`${inter.variable} ${outfit.variable} ${inter.className}`}>
        <ReduxProvider>
          <NotificationProvider>
            <Suspense fallback={null}>
              <ScrollToTop />
            </Suspense>
            <ConditionalHeader />
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
