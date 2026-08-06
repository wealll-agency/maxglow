"use client";
import React, { useState, useEffect, Suspense, memo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../store/cartSlice';
import { fetchProductDetails, fetchProductReviews, submitProductReview, fetchProducts } from '../../store/productsSlice';
import { toggleWishlist } from '../../store/wishlistSlice';
import { Star, Heart, Plus, Minus, MessageCircle, Share2, ShieldCheck, RefreshCw, AlertCircle, ChevronDown, ChevronUp, Leaf, Award } from 'lucide-react';
import ProductCard from '../../components/ProductCard';
import api from '../../utils/axiosConfig';
import { useNotification } from '../../context/NotificationContext';

function ShopDetailsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { showAlert } = useNotification();

  const { items: products, selectedProduct, reviews, reviewsLoading, loading, detailsLoading } = useSelector((state) => state.products);
  const wishlistItems = useSelector((state) => state.wishlist?.items || []);
  const { user } = useSelector((state) => state.auth);
  
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [pincode, setPincode] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [openReviewIds, setOpenReviewIds] = useState([]);

  // Review form states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [notifyLoading, setNotifyLoading] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const productIdParam = searchParams.get('id');
  const productNameParam = searchParams.get('name') || '';

  // 1. Fetch logic
  useEffect(() => {
    if (productIdParam) {
      dispatch(fetchProductDetails(productIdParam));
      dispatch(fetchProductReviews(productIdParam));
    } else {
      dispatch(fetchProducts({ limit: 100 }));
    }
  }, [dispatch, productIdParam]);

  // 2. Resolve product
  let realProduct = null;
  if (productIdParam) {
    realProduct = selectedProduct;
  } else if (productNameParam && products && products.length > 0) {
    realProduct = products.find(p => {
      const pName = p.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
      const searchName = productNameParam.toLowerCase().replace(/\.\.\./g, '').replace(/[^a-zA-Z0-9]/g, '');
      return pName.includes(searchName) || searchName.includes(pName);
    });
  }

  // 3. Reviews sync
  useEffect(() => {
    if (realProduct && !productIdParam) {
      dispatch(fetchProductReviews(realProduct._id));
    }
  }, [dispatch, realProduct, productIdParam]);

  const defaultPackName = realProduct ? `${realProduct.unitValue || 1} ${realProduct.unit || 'Pack'}` : '';
  const [selectedPack, setSelectedPack] = useState('');
  
  useEffect(() => {
    if (realProduct) {
      setSelectedPack(defaultPackName);
    }
  }, [realProduct, defaultPackName]);

  let basePrice = realProduct ? realProduct.price : 0;
  if (realProduct && selectedPack !== defaultPackName && realProduct.packSizes && realProduct.packSizes.length > 0) {
    const selectedPackObj = realProduct.packSizes.find(p => `${p.weight} ${p.unit}` === selectedPack);
    if (selectedPackObj) {
      basePrice = selectedPackObj.price;
    }
  }

  let finalPrice = basePrice;
  if (realProduct && realProduct.discount > 0) {
    if (realProduct.discountType === 'Percent') {
      finalPrice = Math.round(basePrice * (1 - realProduct.discount / 100));
    } else {
      finalPrice = Math.max(0, basePrice - realProduct.discount);
    }
  }

  if (!realProduct) {
    if (loading || detailsLoading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #3BAE56', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      );
    } else {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: '20px' }}>
          <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontFamily: 'var(--font-outfit)', fontSize: '24px', fontWeight: '800', color: '#1a2332', marginBottom: '8px' }}>Product Not Found</h2>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>We couldn't find the product details you are looking for.</p>
          <Link href="/shop" className="btn-mg-primary">Back to Shop</Link>
        </div>
      );
    }
  }

  // Resolve recommended products from the same category only
  const relatedProducts = products
    ? products.filter(p => {
        const pIdStr = String(p._id || p.id || '').trim();
        const rIdStr = String(realProduct._id || realProduct.id || '').trim();
        const isSameProduct = (pIdStr === rIdStr) || (p.name.toLowerCase().trim() === realProduct.name.toLowerCase().trim());
        return p.category === realProduct.category && !isSameProduct;
      })
    : [];
  const recommendedList = relatedProducts.slice(0, 4);

  const handleAddToCart = () => {
    const mockProduct = {
      _id: realProduct._id,
      name: realProduct.name,
      price: finalPrice,
      discount: 0,
      image: realProduct.images?.[0] || '/top_product1.png',
      stock: realProduct.stock
    };
    dispatch(addToCart({
      product: mockProduct,
      quantity,
      size: selectedPack || defaultPackName
    }));
    showAlert('Product added to cart successfully!', 'success');
  };

  const handleBuyNow = () => {
    const mockProduct = {
      _id: realProduct._id,
      name: realProduct.name,
      price: finalPrice,
      discount: 0,
      image: realProduct.images?.[0] || '/top_product1.png',
      stock: realProduct.stock
    };
    dispatch(addToCart({
      product: mockProduct,
      quantity,
      size: selectedPack || defaultPackName
    }));

    setTimeout(() => {
      router.push('/checkout');
    }, 100);
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }
    if (!comment.trim()) {
      setReviewError('Please enter a comment');
      return;
    }

    dispatch(submitProductReview({ productId: realProduct._id, rating, comment: comment.trim() }))
      .unwrap()
      .then(() => {
        setReviewSuccess('Review submitted successfully!');
        setComment('');
        setRating(5);
        setReviewError('');
      })
      .catch((err) => {
        setReviewError(err || 'Failed to submit review. You can only review once and must buy this product first.');
      });
  };

  const handleNotifyMe = async () => {
    if (!user) {
      router.push(`/login?redirect=/shop-details?name=${encodeURIComponent(realProduct.name)}`);
      return;
    }
    
    setNotifyLoading(true);
    try {
      const response = await api.post('/notifications/stock', { productId: realProduct._id });
      if (response.data.success) {
        showAlert(response.data.message, 'success');
      }
    } catch (error) {
      showAlert(error.response?.data?.message || 'Failed to subscribe to notifications', 'error');
    } finally {
      setNotifyLoading(false);
    }
  };

  const isInWishlist = wishlistItems.some(item => item._id === realProduct._id);
  const images = realProduct.images && realProduct.images.length > 0 ? realProduct.images : ['/top_product1.png'];
  const mediaItems = [...images, ...(realProduct.videos || [])];
  const isVideo = (url) => url && (url.toLowerCase().endsWith('.mp4') || url.toLowerCase().endsWith('.webm') || (realProduct.videos && realProduct.videos.includes(url)));

  const getImageUrl = (url) => {
    if (!url) return '/top_product1.png';
    let cleanedUrl = url;
    if (typeof cleanedUrl === 'string' && cleanedUrl.includes('/uploads/')) {
      cleanedUrl = cleanedUrl.substring(cleanedUrl.indexOf('/uploads/'));
    }
    if (cleanedUrl.startsWith('http')) return cleanedUrl;
    if (cleanedUrl.startsWith('/uploads/')) {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : '';
      
      // Force video files to bypass Next.js rewrites and hit Express directly to preserve HTTP Range requests
      if (cleanedUrl.toLowerCase().endsWith('.mp4') || cleanedUrl.toLowerCase().endsWith('.webm')) {
        return `${baseUrl}/api${cleanedUrl}`;
      }
      return cleanedUrl;
    }
    return cleanedUrl.replace('/assets/images/', '/');
  };

  return (
    <>
      <div className="product-details-container" style={{ background: '#F7FBFD', padding: '40px 0' }}>
        <style dangerouslySetInnerHTML={{ __html: `
          .product-details-container {
            padding-bottom: 40px;
          }
          
          .mobile-sticky-bar {
            display: none;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: #ffffff;
            box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
            padding: 12px 16px;
            padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px));
            z-index: 1020;
            transform: translate3d(0, 0, 0);
            will-change: transform;
          }
        
        .sticky-bar-price-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          font-family: var(--font-outfit), sans-serif;
        }
        
        .sticky-bar-price-label {
          font-size: 13px;
          font-weight: 600;
          color: #4b5563;
        }
        
        .sticky-bar-price-val {
          font-size: 18px;
          font-weight: 800;
          color: #111827;
        }
        
        .sticky-bar-mrp {
          font-size: 13px;
          color: #9ca3af;
          text-decoration: line-through;
          margin-left: 6px;
        }
        
        .sticky-bar-discount {
          font-size: 13px;
          color: #22c55e;
          font-weight: 700;
          margin-left: 6px;
        }
        
        .sticky-bar-btn-row {
          display: flex;
          gap: 10px;
        }
        
        .sticky-bar-addcart-btn {
          flex: 1;
          background: #ffffff;
          color: #3BAE56;
          border: 2px solid #3BAE56;
          padding: 12px 6px;
          font-size: 14px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.15s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 46px;
        }
        
        .sticky-bar-buynow-btn {
          flex: 1;
          background: #3BAE56;
          color: #ffffff;
          border: none;
          padding: 12px 6px;
          font-size: 14px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.15s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 46px;
        }
        
        .sticky-bar-notify-btn {
          width: 100%;
          background: #3BAE56;
          color: #ffffff;
          border: none;
          padding: 14px 6px;
          font-size: 14px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 46px;
        }
        
        .image-floating-wishlist {
          display: flex;
        }
        
        .collapsible-product-details {
          display: block;
        }
        
        .desktop-tabs-section {
          display: block;
        }
        
        .mobile-reviews-section {
          display: block;
        }
        
        @media (min-width: 769px) {
          .image-floating-wishlist {
            display: none !important;
          }
          .collapsible-product-details {
            display: none !important;
          }
        }
        
        @media (max-width: 768px) {
          .product-details-container {
            padding-bottom: 120px !important;
          }
          .mobile-sticky-bar {
            display: block !important;
          }
          .inline-action-buttons-wrapper {
            display: none !important;
          }
          .desktop-tabs-section {
            display: none !important;
          }
        }
      ` }} />
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Breadcrumb */}
        <nav style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>
          <Link href="/" style={{ textDecoration: 'none', color: '#64748b' }}>Home</Link> &gt; 
          <Link href="/shop" style={{ textDecoration: 'none', color: '#64748b', marginLeft: '6px' }}>Shop</Link> &gt; 
          <span style={{ color: '#1a2332', fontWeight: '600', marginLeft: '6px' }}>{realProduct.name}</span>
        </nav>

        {/* Product Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', marginBottom: '20px', alignItems: 'start' }}>
          
          {/* Left: Images Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '500px', margin: '0 auto', width: '100%' }}>
            <div className="glass" style={{ borderRadius: '24px', aspectRatio: '1 / 1', overflow: 'hidden', background: 'white', position: 'relative', width: '100%' }}>
              {realProduct.isFeatured && (
                <span className="mg-badge mg-badge-blue" style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 5 }}>
                  PREMIUM
                </span>
              )}
              <button
                onClick={() => dispatch(toggleWishlist(realProduct))}
                className="image-floating-wishlist"
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  zIndex: 5,
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: 'none',
                  background: '#ffffff',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <Heart size={20} fill={isInWishlist ? '#ef4444' : 'none'} color={isInWishlist ? '#ef4444' : '#64748b'} />
              </button>
              {isVideo(mediaItems[activeImageIndex]) ? (
                <video
                  key={mediaItems[activeImageIndex]}
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                  controls
                  autoPlay
                  muted
                  playsInline
                  preload="metadata"
                >
                  <source src={encodeURI(getImageUrl(mediaItems[activeImageIndex]))} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <Image
                  src={getImageUrl(mediaItems[activeImageIndex])}
                  alt={realProduct.name}
                  width={400}
                  height={400}
                  sizes="(max-width: 768px) 100vw, 500px"
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                  priority
                />
              )}
            </div>

            {/* Thumbnails */}
            {mediaItems.length > 1 && (
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                {mediaItems.map((mediaUrl, index) => {
                  const isVid = isVideo(mediaUrl);
                  return (
                    <button
                      key={index}
                      onClick={() => setActiveImageIndex(index)}
                      style={{
                        position: 'relative',
                        width: '64px', height: '64px', borderRadius: '12px', background: 'white',
                        border: activeImageIndex === index ? '2px solid #3BAE56' : '1px solid #e2e8f0',
                        padding: '0', cursor: 'pointer', flexShrink: 0, overflow: 'hidden'
                      }}
                    >
                      <Image 
                        src={isVid ? getImageUrl(images[0]) : getImageUrl(mediaUrl)} 
                        alt="" width={56} height={56} 
                        style={{ objectFit: 'cover', width: '100%', height: '100%', borderRadius: '12px', opacity: isVid ? 0.7 : 1 }} 
                      />
                      {isVid && (
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ width: '24px', height: '24px', background: 'rgba(0,0,0,0.5)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Trust / Brand pillars row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', borderTop: '1px solid #e2e8f0', paddingTop: '24px', textAlign: 'center' }}>
              {[
                { icon: <Leaf size={22} color="#3BAE56" />, bg: '#DDF7E3', label: '100% Organic' },
                { icon: <Heart size={22} color="#ef4444" />, bg: '#ffe4e6', label: 'Cruelty Free' },
                { icon: <ShieldCheck size={22} color="#8b5cf6" />, bg: '#f3e8ff', label: 'Toxin Free' },
                { icon: <Award size={22} color="#4A90E2" />, bg: '#EAF8FF', label: 'Derm Tested' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%', background: item.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                  }}>
                    {item.icon}
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#1a2332', lineHeight: '1.2' }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Info Column */}
          <div className="glass" style={{ borderRadius: '24px', padding: '32px', background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#3BAE56', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {realProduct.brand || 'MaxGlow'}
              </span>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <Share2 size={18} />
              </button>
            </div>

            <h1 style={{ fontFamily: 'var(--font-outfit)', fontSize: '24px', fontWeight: '800', color: '#1a2332', lineHeight: '1.3', marginBottom: '12px' }}>
              {realProduct.name}
            </h1>

            {/* Rating summary */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill={i < Math.round(realProduct.rating || 5) ? "#f59e0b" : "none"} color="#f59e0b" />
                ))}
              </div>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#374151' }}>{realProduct.rating || '5.0'}</span>
              <span style={{ color: '#94a3b8' }}>|</span>
              <span style={{ fontSize: '13px', color: '#64748b' }}>{reviews.length} reviews</span>
            </div>

            {/* Price & Quantity Row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                  <span style={{ fontFamily: 'var(--font-outfit)', fontSize: '32px', fontWeight: '800', color: '#1a2332' }}>
                    ₹{finalPrice}
                  </span>
                  {realProduct.discount > 0 && (
                    <span style={{ background: '#DDF7E3', color: '#3BAE56', fontSize: '12px', fontWeight: '700', padding: '4px 10px', borderRadius: '9999px' }}>
                      {realProduct.discountType === 'Percent' ? `${realProduct.discount}% OFF` : `₹${realProduct.discount} OFF`}
                    </span>
                  )}
                </div>
                {realProduct.discount > 0 && (
                  <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                    MRP: <del>₹{realProduct.price}</del> <span style={{ fontSize: '11px' }}>(inclusive of all taxes)</span>
                  </div>
                )}
              </div>

              {/* Quantity Selector - positioned next to price */}
              {realProduct.stock > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #e2e8f0', borderRadius: '10px', width: '104px', height: '38px', overflow: 'hidden', background: '#F7FBFD' }}>
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ width: '32px', height: '100%', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151' }}>
                      <Minus size={14} />
                    </button>
                    <span style={{ flex: 1, textAlign: 'center', fontSize: '14px', fontWeight: '700', color: '#1a2332' }}>{quantity}</span>
                    <button onClick={() => setQuantity(Math.min(realProduct.stock || 100, quantity + 1))} disabled={quantity >= (realProduct.stock || 100)} style={{ width: '32px', height: '100%', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151' }}>
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Select Pack Size */}
            <div style={{ marginBottom: '24px' }}>
              <label className="mg-form-label" style={{ marginBottom: '10px' }}>Select Pack Size</label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setSelectedPack(defaultPackName)}
                  style={{
                    minWidth: '110px', padding: '10px 14px', borderRadius: '12px', background: 'white',
                    border: selectedPack === defaultPackName ? '2px solid #3BAE56' : '1.5px solid #e2e8f0',
                    cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#1a2332' }}>{defaultPackName}</div>
                  <div style={{ fontSize: '11px', color: '#3BAE56', fontWeight: '600', marginTop: '2px' }}>₹{realProduct.discountedPrice || realProduct.price}</div>
                </button>

                {realProduct.packSizes && realProduct.packSizes.map((pack, idx) => {
                  const pName = `${pack.weight} ${pack.unit}`;
                  let pPrice = pack.price;
                  if (realProduct.discount > 0) {
                    if (realProduct.discountType === 'Percent') {
                      pPrice = Math.round(pack.price * (1 - realProduct.discount / 100));
                    } else {
                      pPrice = Math.max(0, pack.price - realProduct.discount);
                    }
                  }
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedPack(pName)}
                      style={{
                        minWidth: '110px', padding: '10px 14px', borderRadius: '12px', background: 'white',
                        border: selectedPack === pName ? '2px solid #3BAE56' : '1.5px solid #e2e8f0',
                        cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#1a2332' }}>{pName}</div>
                      <div style={{ fontSize: '11px', color: '#3BAE56', fontWeight: '600', marginTop: '2px' }}>₹{pPrice}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', flexWrap: 'nowrap' }}>
              <div className="inline-action-buttons-wrapper" style={{ display: 'flex', gap: '8px', flex: 1 }}>
                {realProduct.stock <= 0 ? (
                  <button
                    onClick={handleNotifyMe}
                    disabled={notifyLoading}
                    className="btn-mg-primary product-details-action-btn"
                    style={{ flex: 1, justifyContent: 'center', padding: '12px 6px', whiteSpace: 'nowrap', minWidth: 0 }}
                  >
                    {notifyLoading ? 'Subscribing...' : 'Notify Me When Available'}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleAddToCart}
                      className="btn-mg-outline product-details-action-btn"
                      style={{ flex: 1, justifyContent: 'center', padding: '12px 6px', whiteSpace: 'nowrap', minWidth: 0 }}
                    >
                      Add To Cart
                    </button>
                    <button
                      onClick={handleBuyNow}
                      className="btn-mg-green product-details-action-btn"
                      style={{ flex: 1, justifyContent: 'center', padding: '12px 6px', whiteSpace: 'nowrap', minWidth: 0 }}
                    >
                      Buy It Now
                    </button>
                  </>
                )}
                {/* Wishlist Button for Desktop */}
                <button
                  onClick={() => dispatch(toggleWishlist(realProduct))}
                  style={{
                    width: '44px', minWidth: '44px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    transition: 'all 0.15s ease', flexShrink: 0
                  }}
                >
                  <Heart size={20} fill={isInWishlist ? '#ef4444' : 'none'} color={isInWishlist ? '#ef4444' : '#64748b'} />
                </button>
              </div>
            </div>

            {/* Collapsible Product Details Dropdown */}
            <div className="collapsible-product-details" style={{ borderTop: '1px solid #f1f5f9', paddingTop: '20px', marginTop: '20px' }}>
              <div 
                onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  cursor: 'pointer',
                  padding: '8px 0',
                  userSelect: 'none'
                }}
              >
                <span style={{ fontFamily: 'var(--font-outfit)', fontSize: '15px', fontWeight: '700', color: '#1a2332', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Product Details
                </span>
                {isDetailsOpen ? <ChevronUp size={18} color="#64748b" /> : <ChevronDown size={18} color="#64748b" />}
              </div>
              
              {isDetailsOpen && (
                <div style={{ 
                  padding: '12px 0 16px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '16px',
                  borderTop: '1px dashed #f1f5f9',
                  marginTop: '4px',
                }}>
                  {/* Description Section */}
                  {realProduct.description && (
                    <div>
                      <h4 style={{ fontSize: '12px', fontWeight: '800', color: '#1a2332', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Description</h4>
                      <p style={{ fontSize: '13px', color: '#4a5568', lineHeight: '1.6', margin: 0 }}>
                        {realProduct.description}
                      </p>
                    </div>
                  )}
                  
                  {/* Ingredients Section */}
                  {realProduct.ingredients && realProduct.ingredients.length > 0 && (
                    <div>
                      <h4 style={{ fontSize: '12px', fontWeight: '800', color: '#1a2332', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Ingredients</h4>
                      <p style={{ fontSize: '13px', color: '#4a5568', lineHeight: '1.6', margin: 0 }}>
                        {realProduct.ingredients.join(', ')}
                      </p>
                    </div>
                  )}
                  
                  {/* Benefits Section */}
                  {realProduct.benefits && realProduct.benefits.length > 0 && (
                    <div>
                      <h4 style={{ fontSize: '12px', fontWeight: '800', color: '#1a2332', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Benefits</h4>
                      <p style={{ fontSize: '13px', color: '#4a5568', lineHeight: '1.6', margin: 0 }}>
                        {realProduct.benefits.join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Description & Review Tabs (Desktop only) */}
        <div className="glass desktop-tabs-section" style={{ borderRadius: '24px', padding: '32px', background: 'white', marginTop: '40px' }}>
          <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid #e2e8f0', marginBottom: '24px', overflowX: 'auto' }}>
            {['description', 'ingredients', 'benefits'].map((tab) => (
              <button
                key={tab}
                className={`mg-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Contents */}
          <div style={{ minHeight: '120px' }}>
            {activeTab === 'description' && (
              <p style={{ fontSize: '14px', color: '#4a5568', lineHeight: '1.8' }}>{realProduct.description}</p>
            )}
            {activeTab === 'ingredients' && (
              <p style={{ fontSize: '14px', color: '#4a5568', lineHeight: '1.8' }}>
                {realProduct.ingredients?.length > 0 ? realProduct.ingredients.join(', ') : 'No ingredients specified.'}
              </p>
            )}
            {activeTab === 'benefits' && (
              <p style={{ fontSize: '14px', color: '#4a5568', lineHeight: '1.8' }}>
                {realProduct.benefits?.length > 0 ? realProduct.benefits.join(', ') : 'No benefits specified.'}
              </p>
            )}
          </div>
        </div>

        {/* Recommended Products Section */}
        {recommendedList.length > 0 && (
          <div style={{ marginTop: '40px', marginBottom: '40px' }}>
            <div style={{ borderBottom: '1px solid #e2e8f0', marginBottom: '24px', paddingBottom: '12px' }}>
              <h2 style={{ fontFamily: 'var(--font-outfit)', fontSize: '20px', fontWeight: '800', color: '#1a2332', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Recommended Products
              </h2>
            </div>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
              gap: '20px' 
            }} className="recommended-products-grid">
              <style dangerouslySetInnerHTML={{ __html: `
                @media (max-width: 576px) {
                  .recommended-products-grid {
                    grid-template-columns: repeat(2, 1fr) !important;
                    gap: 12px !important;
                  }
                }
              ` }} />
              {recommendedList.map((prod) => (
                <ProductCard key={prod._id} product={prod} />
              ))}
            </div>
          </div>
        )}

        {/* Customer Feedback & Reviews Section */}
        <div className="glass mobile-reviews-section" style={{ borderRadius: '24px', padding: '32px', background: 'white', marginTop: '16px' }}>
          <div style={{ borderBottom: '1px solid #e2e8f0', marginBottom: '24px', paddingBottom: '12px' }}>
            <h2 style={{ fontFamily: 'var(--font-outfit)', fontSize: '20px', fontWeight: '800', color: '#1a2332', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Customer Reviews ({reviews.length})
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px' }}>
            {/* Review List */}
            <div>
              <h3 style={{ fontFamily: 'var(--font-outfit)', fontSize: '16px', fontWeight: '700', color: '#1a2332', marginBottom: '16px' }}>Customer Feedback</h3>
              {reviewsLoading ? (
                <div style={{ color: '#94a3b8', fontSize: '13px' }}>Loading reviews...</div>
              ) : reviews.length === 0 ? (
                <div style={{ color: '#64748b', fontSize: '13px' }}>No reviews yet for this product. Be the first to write a review!</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {reviews.map((rev) => {
                    const isOpen = openReviewIds.includes(rev._id);
                    return (
                      <div 
                        key={rev._id} 
                        style={{ 
                          border: isOpen ? '1.5px solid #5DAEFF' : '1px solid #e2e8f0', 
                          borderRadius: '12px',
                          overflow: 'hidden',
                          background: 'white',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div 
                          onClick={() => {
                            setOpenReviewIds(prev => 
                              prev.includes(rev._id) ? prev.filter(id => id !== rev._id) : [...prev, rev._id]
                            );
                          }}
                          style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            padding: '12px 16px',
                            cursor: 'pointer',
                            background: isOpen ? '#F7FBFD' : 'white',
                            userSelect: 'none'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ fontWeight: '700', fontSize: '13px', color: '#1a2332' }}>{rev.user?.name || 'Anonymous User'}</div>
                            <div style={{ display: 'flex', gap: '2px' }}>
                              {[...Array(rev.rating)].map((_, i) => <Star key={i} size={12} fill="#f59e0b" color="#f59e0b" />)}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>{new Date(rev.createdAt).toLocaleDateString()}</span>
                            <ChevronDown size={16} style={{ color: '#64748b', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                          </div>
                        </div>

                        {isOpen && (
                          <div style={{ padding: '12px 16px 16px 16px', borderTop: '1px dashed #e2e8f0' }}>
                            <p style={{ fontSize: '13px', color: '#4a5568', margin: 0, lineHeight: '1.6', fontStyle: 'italic' }}>"{rev.comment}"</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Submit Review */}
            <div style={{ background: '#F7FBFD', border: '1px solid rgba(221,244,255,0.8)', borderRadius: '16px', padding: '24px' }}>
              <h3 style={{ fontFamily: 'var(--font-outfit)', fontSize: '16px', fontWeight: '700', color: '#1a2332', marginBottom: '16px' }}>Write a Review</h3>
              {user ? (
                <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label className="mg-form-label">Rating</label>
                    <select className="mg-select" value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                      <option value="5">5 Stars (Excellent)</option>
                      <option value="4">4 Stars (Good)</option>
                      <option value="3">3 Stars (Average)</option>
                      <option value="2">2 Stars (Poor)</option>
                      <option value="1">1 Star (Very Poor)</option>
                    </select>
                  </div>
                  <div>
                    <label className="mg-form-label">Comment</label>
                    <textarea rows="4" className="mg-input" value={comment} onChange={(e) => setComment(e.target.value)} style={{ resize: 'vertical' }} />
                  </div>
                  {reviewError && <div style={{ fontSize: '12px', color: '#ef4444' }}>{reviewError}</div>}
                  {reviewSuccess && <div style={{ fontSize: '12px', color: '#3BAE56' }}>{reviewSuccess}</div>}
                  <button type="submit" className="btn-mg-green" style={{ width: '100%', justifyContent: 'center', fontSize: '14px', padding: '10px' }}>
                    Submit Review
                  </button>
                </form>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <MessageCircle size={28} color="#94a3b8" style={{ marginBottom: '8px' }} />
                  <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>Please log in to write a product review.</p>
                  <Link href="/login" className="btn-mg-primary" style={{ padding: '10px 24px', fontSize: '13px' }}>Log In</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Mobile Sticky Bottom Bar in Beardo style */}
    <div className="mobile-sticky-bar">
      <div className="sticky-bar-price-row">
        <span className="sticky-bar-price-label">Final Price</span>
        <div>
          <span className="sticky-bar-price-val">₹{finalPrice}</span>
          {realProduct.discount > 0 && (
            <>
              <span className="sticky-bar-mrp">₹{basePrice}</span>
              <span className="sticky-bar-discount">
                {realProduct.discountType === 'Percent' 
                  ? `${realProduct.discount}% OFF` 
                  : `₹${realProduct.discount} OFF`}
              </span>
            </>
          )}
        </div>
      </div>
      <div className="sticky-bar-btn-row">
        {realProduct.stock <= 0 ? (
          <button
            onClick={handleNotifyMe}
            disabled={notifyLoading}
            className="sticky-bar-notify-btn"
          >
            {notifyLoading ? 'Subscribing...' : 'Notify Me When Available'}
          </button>
        ) : (
          <>
            <button
              onClick={handleAddToCart}
              className="sticky-bar-addcart-btn"
            >
              Add To Cart
            </button>
            <button
              onClick={handleBuyNow}
              className="sticky-bar-buynow-btn"
            >
              Buy Now
            </button>
          </>
        )}
      </div>
    </div>
    </>
  );
}

export default function ShopDetailsPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #3BAE56', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    }>
      <ShopDetailsContent />
    </Suspense>
  );
}
