"use client";
import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// Configurable destination for the banner click
const BANNER_DESTINATION = '/shop';

export default function HeroSlider() {
  const router = useRouter();

  const handleBannerClick = () => {
    router.push(BANNER_DESTINATION);
  };

  return (
    <section 
      className="hero-banner-section" 
      onClick={handleBannerClick}
      style={{
        width: '100%',
        position: 'relative',
        cursor: 'pointer',
        overflow: 'hidden',
        display: 'block'
      }}
    >
      <div className="hero-banner-wrapper">
        <Image
          src="/hero_banner_new.png"
          alt="MaxGlow Premium Herbal Wellness"
          width={1660}
          height={948}
          priority
          sizes="100vw"
          className="hero-banner-image"
          style={{
            width: '100%',
            height: 'auto',
            display: 'block'
          }}
        />
      </div>
    </section>
  );
}
