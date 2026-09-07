import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function ShopBanner({ category, serverSettings = {} }) {
  let bgImg = '/maxglow_shop_banner.png';
  let title = 'MaxGlow Herbal Shop';
  let desc = 'Explore our curated range of premium natural wellness products. Clean formulas, botanical actives, and natural care.';
  
  if (category) {
    const c = category.toLowerCase().trim();
    if (c.includes('skin') || c.includes('face')) {
      title = 'Premium Skin Care';
      desc = 'Reveal your natural glow with our deeply nourishing, botanical-rich face care formulations.';
      bgImg = '/banner_skin_care.png';
    } else if (c.includes('hair')) {
      title = 'Luxury Hair Care';
      desc = 'Transform your hair with our salon-quality, natural herbal blends for strength and shine.';
      bgImg = '/banner_hair_care.png';
    } else if (c.includes('body')) {
      title = 'Nourishing Body Care';
      desc = 'Indulge in our luxurious spa-grade body lotions and scrubs for smooth, radiant skin.';
      bgImg = '/banner_body_care.png';
    } else if (c.includes('serum')) {
      title = 'Premium Serums';
      desc = 'Target your skin concerns with our concentrated, botanical-rich face serums.';
      bgImg = '/banner_wellness.png';
    } else {
      title = `${category} Products`;
    }

    // Check if admin uploaded a custom banner for this category
    const bannersMap = typeof serverSettings.media_category_banners === 'object' ? serverSettings.media_category_banners : {};
    const catKey = Object.keys(bannersMap).find(k => k.toLowerCase().trim() === category.toLowerCase().trim());
    if (catKey && bannersMap[catKey] && bannersMap[catKey].trim() !== '') {
      bgImg = bannersMap[catKey];
    }
  } else if (serverSettings.media_category_banner && serverSettings.media_category_banner.trim() !== '') {
    bgImg = serverSettings.media_category_banner;
  }

  const resolveUrl = (url) => {
    if (!url || url === '/trending_banner.png' || url.includes('1785930462176_1st_Banner_for_webside.png')) return '/maxglow_shop_banner.png';
    if (url.startsWith('http') || url.startsWith('blob:')) return url;
    if (url.startsWith('/uploads/')) {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : '';
      return `${baseUrl}${url}`;
    }
    return url;
  };

  const finalBgUrl = resolveUrl(bgImg);

  return (
    <>
      <div style={{ maxWidth: '1400px', margin: '20px auto 0', padding: '0 20px' }}>
        <nav style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
          <Link href="/" style={{ textDecoration: 'none', color: '#64748b' }}>Home</Link> &gt; 
          <Link href="/shop" style={{ textDecoration: 'none', color: '#64748b', marginLeft: '6px' }}>Shop</Link>
          {category && <span style={{ color: '#1a2332', fontWeight: '700', marginLeft: '6px' }}>&gt; {category}</span>}
        </nav>
      </div>

      <div className="shop-banner-section" style={{ position: 'relative' }}>
        <Image
          src={finalBgUrl}
          alt={title}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 1400px"
          style={{ objectFit: 'cover' }}
        />
      </div>
    </>
  );
}
