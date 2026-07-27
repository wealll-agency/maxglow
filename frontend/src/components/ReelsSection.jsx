"use client";
import { useRouter } from 'next/navigation';


import React, { useRef, useState, useCallback, useEffect } from 'react';

import { Swiper, SwiperSlide, useSwiper } from 'swiper/react';
import { Autoplay, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';

/* ─────────────────────────────────────────────────────────
   REELS SECTION — Premium short-video carousel
   • Auto-slides left → right continuously
   • On hover → video plays (with sound muted)
   • On mouse leave → video pauses, resets to thumbnail
   • Glassmorphism overlay with title + CTA
   ───────────────────────────────────────────────────────── */

const reels = [
  {
    id: 1,
    video: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    poster: 'https://placehold.co/400x600/0a1628/ffffff?text=Aloe+Vera',
    title: 'Aloe Vera Glow Routine',
    tag: 'Skin Care',
    link: '/shop-details?name=Aloe%20Vera%20Gel'
  },
  {
    id: 2,
    video: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    poster: 'https://placehold.co/400x600/0a1628/ffffff?text=Hair+Oil',
    title: 'Herbal Hair Oil Massage',
    tag: 'Hair Care',
    link: '/shop-details?name=Herbal%20Hair%20Oil'
  },
  {
    id: 3,
    video: 'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    poster: 'https://placehold.co/400x600/0a1628/ffffff?text=Neem+Wash',
    title: 'Neem Face Wash Benefits',
    tag: 'Face Care',
    link: '/shop-details?name=Neem%20Face%20Wash'
  },
  {
    id: 4,
    video: 'https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    poster: 'https://placehold.co/400x600/0a1628/ffffff?text=Body+Scrub',
    title: 'Body Scrub Tutorial',
    tag: 'Body Care',
    link: '/shop-details?name=Body%20Scrub'
  },
  {
    id: 5,
    video: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    poster: 'https://placehold.co/400x600/0a1628/ffffff?text=Glow+Mask',
    title: 'Turmeric Glow Mask',
    tag: 'Wellness',
    link: '/shop-details?name=Turmeric%20Glow%20Mask'
  },
  {
    id: 6,
    video: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    poster: 'https://placehold.co/400x600/0a1628/ffffff?text=Rose+Mist',
    title: 'Rose Water Mist Ritual',
    tag: 'Skin Care',
    link: '/shop-details?name=Rose%20Water%20Mist'
  },
  {
    id: 7,
    video: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    poster: 'https://placehold.co/400x600/0a1628/ffffff?text=Tea+Tree',
    title: 'Tea Tree Spot Treatment',
    tag: 'Face Care',
    link: '/shop-details?name=Tea%20Tree%20Spot%20Treatment'
  },
  {
    id: 8,
    video: 'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    poster: 'https://placehold.co/400x600/0a1628/ffffff?text=Sleep+Spray',
    title: 'Lavender Sleep Spray',
    tag: 'Wellness',
    link: '/shop-details?name=Lavender%20Sleep%20Spray'
  },
];

/* ── Single Reel Card ── */
const ReelCard = ({ reel }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const router = useRouter();
  const swiper = useSwiper();

  const handleMouseEnter = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      video.play().catch(() => {});
      setIsPlaying(true);
      if (swiper && swiper.autoplay) swiper.autoplay.stop();
    }
  }, [swiper]);

  const handleMouseLeave = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
      setIsPlaying(false);
      if (swiper && swiper.autoplay) swiper.autoplay.start();
    }
  }, [swiper]);

  const handleBuyClick = (e) => {
    e.stopPropagation();
    router.push(reel.link);
  };

  return (
    <div
      className="reel-card"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Video element — hidden poster, shown on hover */}
      <video
        ref={videoRef}
        src={reel.video}
        poster={reel.poster}
        muted
        loop
        playsInline
        preload="none"
        className="reel-video"
      />

      {/* Play icon — visible when NOT playing */}
      <div className={`reel-play-icon ${isPlaying ? 'reel-play-hidden' : ''}`}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="white" opacity="0.9">
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>

      {/* Bottom glass overlay */}
      <div className="reel-overlay">
        <div className="d-flex justify-content-between align-items-end w-100">
          <div>
            <span className="reel-tag">{reel.tag}</span>
            <p className="reel-title">{reel.title}</p>
          </div>
          <button className="reel-buy-btn" onClick={handleBuyClick}>
            Buy
          </button>
        </div>
      </div>

      {/* Top-right "REEL" badge */}
      <div className="reel-badge">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="23 7 16 12 23 17 23 7" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
        <span>REEL</span>
      </div>
    </div>
  );
};

/* ── Main Section ── */
const ReelsSection = () => {
  return (
    <section className="reels-section">
      <div className="container">
        <div className="d-flex justify-content-between align-items-end mb-4">
          <div>
            <h2 className="nykaa-section-title" style={{ fontSize: '24px' }}>
              Watch <span>and Buy</span>
            </h2>
            <p style={{ color: 'var(--text-mid)', fontSize: '14px', marginTop: '4px', marginBottom: 0 }}>
              Watch quick herbal beauty tips &amp; product tutorials
            </p>
          </div>
          <a href="/shop" className="nykaa-view-all d-none d-md-inline">View All</a>
        </div>
      </div>

      {/* Swiper — auto-sliding, free mode */}
      <div className="reels-slider-wrapper">
        <Swiper
          modules={[Autoplay, FreeMode]}
          slidesPerView="auto"
          spaceBetween={14}
          freeMode={{ enabled: true, sticky: false }}
          loop={true}
          speed={4000}
          autoplay={{
            delay: 0,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          breakpoints={{
            0:    { spaceBetween: 10 },
            768:  { spaceBetween: 14 },
            1200: { spaceBetween: 16 },
          }}
          className="reels-swiper"
        >
          {reels.map((reel) => (
            <SwiperSlide key={reel.id} style={{ width: 'auto' }}>
              <ReelCard reel={reel} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* ── Scoped Styles ── */}
      <style jsx global>{`
        /* Section */
        .reels-section {
          padding: 48px 0 56px;
          background: linear-gradient(180deg, var(--mg-bg) 0%, #fff 100%);
          overflow: hidden;
        }

        /* Slider wrapper — full bleed */
        .reels-slider-wrapper {
          padding-left: calc((100vw - 1320px) / 2 + 12px);
          overflow: visible;
        }
        @media (max-width: 1399.98px) {
          .reels-slider-wrapper { padding-left: calc((100vw - 1140px) / 2 + 12px); }
        }
        @media (max-width: 1199.98px) {
          .reels-slider-wrapper { padding-left: calc((100vw - 960px) / 2 + 12px); }
        }
        @media (max-width: 991.98px) {
          .reels-slider-wrapper { padding-left: calc((100vw - 720px) / 2 + 12px); }
        }
        @media (max-width: 767.98px) {
          .reels-slider-wrapper { padding-left: 16px; }
        }

        /* Swiper overrides */
        .reels-swiper {
          overflow: visible !important;
        }
        .reels-swiper .swiper-wrapper {
          transition-timing-function: linear !important;
        }

        /* ── Reel Card ── */
        .reel-card {
          position: relative;
          width: 240px;
          height: 420px;
          border-radius: 20px;
          overflow: hidden;
          cursor: pointer;
          background: #0a1628;
          box-shadow: 0 4px 24px rgba(74, 144, 226, 0.12);
          transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1),
                      box-shadow 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .reel-card:hover {
          transform: scale(1.05) translateY(-6px);
          box-shadow: 0 16px 48px rgba(74, 144, 226, 0.22),
                      0 0 0 2px rgba(93, 174, 255, 0.3);
        }

        /* Video fills card */
        .reel-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        /* Play icon */
        .reel-play-icon {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: rgba(10, 22, 40, 0.45);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          transition: opacity 0.3s, transform 0.3s;
          border: 1.5px solid rgba(255, 255, 255, 0.2);
        }
        .reel-play-icon svg {
          margin-left: 3px;
        }
        .reel-play-hidden {
          opacity: 0;
          transform: translate(-50%, -50%) scale(0.7);
          pointer-events: none;
        }

        /* Bottom glass overlay */
        .reel-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 40px 14px 14px;
          background: linear-gradient(to top,
            rgba(10, 22, 40, 0.88) 0%,
            rgba(10, 22, 40, 0.4) 60%,
            transparent 100%);
          z-index: 5;
        }
        .reel-tag {
          display: inline-block;
          background: rgba(93, 174, 255, 0.25);
          backdrop-filter: blur(6px);
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          padding: 3px 9px;
          border-radius: 50px;
          margin-bottom: 6px;
          border: 1px solid rgba(93, 174, 255, 0.3);
        }
        .reel-title {
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          line-height: 1.35;
          margin: 0;
          text-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
        }
        
        .reel-buy-btn {
          background: rgba(97, 196, 84, 0.9);
          color: #fff;
          border: none;
          padding: 6px 14px;
          border-radius: 50px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.2s, background 0.2s;
          box-shadow: 0 4px 10px rgba(97, 196, 84, 0.3);
          flex-shrink: 0;
        }
        .reel-buy-btn:hover {
          transform: scale(1.05);
          background: rgba(97, 196, 84, 1);
        }

        /* Top-right badge */
        .reel-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          display: flex;
          align-items: center;
          gap: 4px;
          background: rgba(10, 22, 40, 0.5);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.06em;
          padding: 4px 10px;
          border-radius: 50px;
          z-index: 10;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        /* Responsive card sizing */
        @media (max-width: 767.98px) {
          .reel-card {
            width: 175px;
            height: 310px;
          }
          .reel-play-icon {
            width: 44px;
            height: 44px;
          }
          .reel-play-icon svg {
            width: 24px;
            height: 24px;
          }
        }
      `}</style>
    </section>
  );
};

export default ReelsSection;
