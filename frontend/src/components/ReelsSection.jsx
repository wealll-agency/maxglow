"use client";
import { useRouter } from 'next/navigation';


import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/cartSlice';

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
  const dispatch = useDispatch();
  const swiper = useSwiper();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!isMobile || !videoRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoRef.current.currentTime = 0;
            videoRef.current.play().catch(() => {});
            setIsPlaying(true);
            // On mobile, we let Swiper's 5s autoplay continue running
          } else {
            videoRef.current.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.6 }
    );
    observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, [isMobile]);

  const handleMouseEnter = useCallback(() => {
    if (isMobile) return;
    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      video.play().catch(() => {});
      setIsPlaying(true);
      if (swiper && swiper.autoplay) swiper.autoplay.stop();
    }
  }, [swiper, isMobile]);

  const handleMouseLeave = useCallback(() => {
    if (isMobile) return;
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
      setIsPlaying(false);
      if (swiper && swiper.autoplay) swiper.autoplay.start();
    }
  }, [swiper, isMobile]);

  const handleVideoEnded = () => {
    if (isMobile && swiper) {
      swiper.slideNext();
    }
  };

  const handleBuyClick = (e) => {
    e.stopPropagation();
    
    // Add product to cart
    dispatch(addToCart({
      product: {
        _id: reel.originalProduct._id,
        name: reel.originalProduct.name,
        price: reel.originalProduct.price,
        discount: reel.originalProduct.discount || 0,
        image: reel.originalProduct.images?.[0] || reel.poster,
        stock: reel.originalProduct.stock
      },
      quantity: 1,
      size: `${reel.originalProduct.unitValue || 1} ${reel.originalProduct.unit || 'Pack'}`
    }));
    
    // Redirect to checkout
    router.push('/checkout');
  };

  return (
    <div
      className="reel-card"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => router.push(reel.link)}
      style={{ cursor: 'pointer' }}
    >
      {/* Video element — hidden poster, shown on hover */}
      <video
        ref={videoRef}
        src={reel.video}
        poster={reel.poster}
        muted
        loop={!isMobile}
        onEnded={handleVideoEnded}
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
  const [reelsState, setReelsState] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReels = async () => {
      try {
        const { default: api } = await import('../utils/axiosConfig');
        const res = await api.get('/products?showInReels=true&inStock=true');
        if (res.data.success && res.data.products) {
          const fetchedReels = res.data.products
            .filter(p => p.videos && p.videos.length > 0)
            .map((p, idx) => {
              let finalPrice = p.price;
              if (p.discount > 0) {
                finalPrice = p.discountType === 'Percent'
                  ? Math.round(p.price * (1 - p.discount / 100))
                  : Math.max(0, p.price - p.discount);
              }
              return {
                id: p._id || idx,
                video: p.videos[0],
                poster: p.images && p.images.length > 0 ? p.images[0] : 'https://placehold.co/400x600/0a1628/ffffff',
                title: p.name,
                tag: p.category || 'Product',
                link: `/shop-details?name=${encodeURIComponent(p.name)}`,
                originalProduct: { ...p, price: finalPrice }
              };
            });
          setReelsState(fetchedReels);
        }
      } catch (err) {
        console.error("Failed to fetch reels", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReels();
  }, []);

  if (loading || reelsState.length === 0) return null;

  return (
    <section className="reels-section">
      <div className="container" style={{ padding: '0 20px', maxWidth: '1440px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{
              fontFamily: 'var(--font-outfit), sans-serif',
              fontSize: '24px', fontWeight: '800', color: '#1a2332', margin: 0,
            }}>
              Watch and Buy
            </h2>
            <div style={{ height: '3px', width: '48px', background: 'linear-gradient(90deg, #4A90E2, #3BAE56)', borderRadius: '9999px', marginTop: '8px' }} />
            <p style={{ color: 'var(--text-mid)', fontSize: '14px', marginTop: '8px', marginBottom: 0 }}>
              Watch quick herbal beauty tips &amp; product tutorials
            </p>
          </div>
          <a href="/shop" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            color: '#3BAE56', fontWeight: '700', fontSize: '14px', textDecoration: 'none',
            padding: '8px 16px', border: '1.5px solid #3BAE56', borderRadius: '9999px',
            transition: 'all 0.2s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#3BAE56'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#3BAE56'; }}
          >
            View All <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </a>
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
          speed={800}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          breakpoints={{
            0:    { spaceBetween: 10, freeMode: { enabled: false }, speed: 600, autoplay: { delay: 5000, disableOnInteraction: false }, centeredSlides: true },
            768:  { spaceBetween: 14, freeMode: { enabled: true, sticky: false }, speed: 4000, autoplay: { delay: 0 }, centeredSlides: false },
            1200: { spaceBetween: 16, freeMode: { enabled: true, sticky: false }, speed: 4000, autoplay: { delay: 0 }, centeredSlides: false },
          }}
          className="reels-swiper"
        >
          {reelsState.map((reel) => (
            <SwiperSlide key={reel.id} style={{ width: 'auto' }}>
              <ReelCard reel={reel} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* ── Scoped Styles ── */}
      <style dangerouslySetInnerHTML={{ __html: `
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
          width: 240px; /* Base desktop width */
          aspect-ratio: 4 / 7;
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
          .reels-slider-wrapper {
            padding-left: 0;
            padding-right: 0;
          }
          .reels-swiper .swiper-slide .reel-card {
            transition: transform 0.4s ease, opacity 0.4s ease;
            transform: scale(0.9);
            opacity: 0.6;
          }
          .reels-swiper .swiper-slide-active .reel-card {
            transform: scale(1);
            opacity: 1;
          }
          .reel-card {
            width: 75vw;
            max-width: 280px;
            aspect-ratio: 4 / 6.5;
            margin: 0;
          }
          .reel-overlay {
            padding: 40px 14px 14px;
          }
          .reel-title {
            font-size: 14px;
            margin-bottom: 6px;
          }
          .reel-tag {
            font-size: 11px;
            padding: 4px 10px;
            margin-bottom: 8px;
          }
          .reel-buy-btn {
            padding: 8px 16px;
            font-size: 13px;
          }
          .reel-play-icon {
            width: 52px;
            height: 52px;
          }
          .reel-play-icon svg {
            width: 26px;
            height: 26px;
          }
        }
      ` }} />
    </section>
  );
};

export default ReelsSection;
