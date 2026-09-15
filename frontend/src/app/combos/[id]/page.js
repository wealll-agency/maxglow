"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../../store/cartSlice';
import { toggleWishlist } from '../../../store/wishlistSlice';
import { Star, Heart, Plus, Minus, Share2, ShieldCheck, Leaf, Award, ChevronDown, ChevronUp, AlertCircle, PackageCheck, Layers } from 'lucide-react';
import api from '../../../utils/axiosConfig';
import { useNotification } from '../../../context/NotificationContext';
import { getImageUrl } from '../../../utils/imageConfig';

function ComboDetailContent() {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { showAlert } = useNotification();

  const [combo, setCombo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [relatedCombos, setRelatedCombos] = useState([]);

  const wishlistItems = useSelector((state) => state.wishlist?.items || []);

  // Fetch Combo Data
  useEffect(() => {
    const fetchComboData = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/combos/${id}`);
        if (res.data.success && res.data.combo) {
          setCombo(res.data.combo);
        } else {
          router.push('/combos');
        }
      } catch (err) {
        showAlert('Failed to load combo details', 'danger');
        router.push('/combos');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchComboData();
    }
  }, [id, router, showAlert]);

  // Fetch related combos only
  useEffect(() => {
    const fetchRelatedCombos = async () => {
      try {
        const res = await api.get('/combos').catch(() => ({ data: { combos: [] } }));
        if (res.data?.success && res.data?.combos) {
          setRelatedCombos(res.data.combos.filter(c => String(c._id) !== String(id)).slice(0, 4));
        }
      } catch (e) {}
    };

    fetchRelatedCombos();
  }, [id]);

  // Reset state when id changes
  useEffect(() => {
    setActiveImageIndex(0);
    setQuantity(1);
    setActiveTab('description');
    setIsDetailsOpen(false);
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #3BAE56', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (!combo) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: '20px' }}>
        <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '16px' }} />
        <h2 style={{ fontFamily: 'var(--font-outfit)', fontSize: '24px', fontWeight: '800', color: '#1a2332', marginBottom: '8px' }}>Combo Not Found</h2>
        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>We couldn't find the combo pack you are looking for.</p>
        <Link href="/combos" className="btn-mg-primary">Explore Combos</Link>
      </div>
    );
  }

  // Calculate Combo Stock
  let maxStock = Infinity;
  if (combo.components && combo.components.length > 0) {
    combo.components.forEach(comp => {
      if (comp.product && typeof comp.product === 'object') {
        const productStock = comp.product.stock !== undefined ? comp.product.stock : 100;
        const possible = Math.floor(productStock / (comp.quantity || 1));
        if (possible < maxStock) maxStock = possible;
      } else if (comp.product) {
        // If ID only or unpopulated
        maxStock = Math.min(maxStock, 100);
      } else {
        maxStock = 0;
      }
    });
  } else {
    maxStock = 100;
  }
  if (maxStock === Infinity) maxStock = 100;

  const isOutOfStock = maxStock <= 0;
  const mrp = combo.regularTotal || combo.comboPrice || 0;
  const finalPrice = combo.comboPrice;
  const savings = Math.max(0, mrp - finalPrice);

  // Combo images gallery (only the combo's own media)
  const mediaList = [];
  if (combo.images && Array.isArray(combo.images) && combo.images.length > 0) {
    mediaList.push(...combo.images);
  } else if (combo.image) {
    mediaList.push(combo.image);
  }
  if (mediaList.length === 0) {
    mediaList.push('/top_product1.png');
  }

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    if (quantity > maxStock) {
      showAlert(`Only ${maxStock} combos available right now.`, 'warning');
      return;
    }

    dispatch(addToCart({
      combo,
      itemType: 'Combo',
      quantity,
      size: 'Standard'
    }));

    showAlert(`${combo.name} added to cart!`, 'success');

    if (typeof window !== 'undefined' && window.bootstrap) {
      const offcanvas = document.getElementById('cartOffcanvas');
      if (offcanvas) {
        const bsOffcanvas = window.bootstrap.Offcanvas.getOrCreateInstance(offcanvas);
        bsOffcanvas.show();
      }
    }
  };

  const handleBuyNow = () => {
    if (isOutOfStock || quantity > maxStock) return;
    dispatch(addToCart({
      combo,
      itemType: 'Combo',
      quantity,
      size: 'Standard'
    }));

    setTimeout(() => {
      router.push('/checkout');
    }, 100);
  };

  const handleShare = async () => {
    const shareData = {
      title: combo.name || 'MaxGlow Combo',
      text: `Check out ${combo.name} on MaxGlow!`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        showAlert('Link copied to clipboard!', 'success');
      } catch (err) {
        showAlert('Failed to copy link.', 'error');
      }
    }
  };

  const isInWishlist = wishlistItems.some(item => item._id === combo._id);

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
          
          .sticky-bar-outofstock-btn {
            width: 100%;
            background: #94a3b8;
            color: #ffffff;
            border: none;
            padding: 14px 6px;
            font-size: 14px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            border-radius: 8px;
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
              padding-bottom: 24px !important;
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
            <Link href="/combos" style={{ textDecoration: 'none', color: '#64748b', marginLeft: '6px' }}>Combos</Link> &gt; 
            <span style={{ color: '#1a2332', fontWeight: '600', marginLeft: '6px' }}>{combo.name}</span>
          </nav>

          {/* Product Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', marginBottom: '20px', alignItems: 'start' }}>
            
            {/* Left: Images Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '500px', margin: '0 auto', width: '100%' }}>
              <div className="glass" style={{ borderRadius: '24px', aspectRatio: '1 / 1', overflow: 'hidden', background: 'white', position: 'relative', width: '100%' }}>
                {combo.isFeatured && (
                  <span className="mg-badge mg-badge-blue" style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 5 }}>
                    PREMIUM COMBO
                  </span>
                )}
                
                <button
                  onClick={() => dispatch(toggleWishlist(combo))}
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

                <Image
                  src={getImageUrl(mediaList[activeImageIndex])}
                  alt={combo.name}
                  width={400}
                  height={400}
                  sizes="(max-width: 768px) 100vw, 500px"
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                  priority
                  fetchPriority="high"
                />
              </div>

              {/* Thumbnails */}
              {mediaList.length > 1 && (
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                  {mediaList.map((mediaUrl, index) => (
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
                        src={getImageUrl(mediaUrl)} 
                        alt="" width={56} height={56} 
                        sizes="56px"
                        loading="lazy"
                        style={{ objectFit: 'cover', width: '100%', height: '100%', borderRadius: '12px' }} 
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Trust / Brand pillars row (Exact MaxGlow 4 pillars) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', borderTop: '1px solid #e2e8f0', paddingTop: '24px', textAlign: 'center' }}>
                {[
                  { icon: <Leaf size={22} color="#3BAE56" />, bg: '#DDF7E3', label: 'Organic Fusion' },
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
                  MAXGLOW
                </span>
                <button onClick={handleShare} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }} aria-label="Share combo">
                  <Share2 size={18} />
                </button>
              </div>

              <h1 style={{ fontFamily: 'var(--font-outfit)', fontSize: '24px', fontWeight: '800', color: '#1a2332', lineHeight: '1.3', marginBottom: '12px' }}>
                {combo.name}
              </h1>

              {/* Rating summary */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />
                  ))}
                </div>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#374151' }}>5.0</span>
                <span style={{ color: '#94a3b8' }}>|</span>
                <span style={{ fontSize: '13px', color: '#64748b' }}>Curated Combo Pack</span>
              </div>

              {/* Price & Quantity Row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                    <span style={{ fontFamily: 'var(--font-outfit)', fontSize: '32px', fontWeight: '800', color: '#1a2332' }}>
                      ₹{finalPrice}
                    </span>
                    {savings > 0 && (
                      <span style={{ background: '#DDF7E3', color: '#3BAE56', fontSize: '12px', fontWeight: '700', padding: '4px 10px', borderRadius: '9999px' }}>
                        ₹{savings} OFF
                      </span>
                    )}
                  </div>
                  {mrp > finalPrice && (
                    <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                      MRP: <del>₹{mrp}</del> <span style={{ fontSize: '11px' }}>(inclusive of all taxes)</span>
                    </div>
                  )}
                </div>

                {/* Quantity Selector */}
                {!isOutOfStock && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #e2e8f0', borderRadius: '10px', width: '104px', height: '38px', overflow: 'hidden', background: '#F7FBFD' }}>
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ width: '32px', height: '100%', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151' }}>
                        <Minus size={14} />
                      </button>
                      <span style={{ flex: 1, textAlign: 'center', fontSize: '14px', fontWeight: '700', color: '#1a2332' }}>{quantity}</span>
                      <button onClick={() => setQuantity(Math.min(maxStock, quantity + 1))} disabled={quantity >= maxStock} style={{ width: '32px', height: '100%', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151' }}>
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* What's Inside This Combo */}
              {combo.components && combo.components.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <label className="mg-form-label" style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Layers size={15} color="#3BAE56" /> What's Inside This Combo
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
                    {combo.components.map((comp, idx) => {
                      const prodId = comp.product?._id || comp.product;
                      const prodImg = comp.product?.images?.[0] || comp.product?.image || '/top_product1.png';
                      return (
                        <Link
                          key={idx}
                          href={`/product/${prodId}`}
                          style={{ textDecoration: 'none' }}
                        >
                          <div 
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '10px 12px',
                              borderRadius: '12px',
                              background: '#F7FBFD',
                              border: '1.5px solid #e2e8f0',
                              transition: 'all 0.15s ease',
                              cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = '#3BAE56';
                              e.currentTarget.style.background = '#ffffff';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = '#e2e8f0';
                              e.currentTarget.style.background = '#F7FBFD';
                            }}
                          >
                            <div style={{ width: '44px', height: '44px', position: 'relative', flexShrink: 0, borderRadius: '8px', overflow: 'hidden', background: '#fff', border: '1px solid #e2e8f0' }}>
                              <Image 
                                src={getImageUrl(prodImg)}
                                alt={comp.name || 'Component'}
                                fill
                                sizes="44px"
                                style={{ objectFit: 'cover' }}
                              />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '12px', fontWeight: '700', color: '#1a2332', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {comp.name}
                              </div>
                              <div style={{ fontSize: '11px', color: '#3BAE56', fontWeight: '600', marginTop: '2px' }}>
                                {comp.size} &times; {comp.quantity}
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Buttons (Desktop) */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'nowrap' }}>
                <div className="inline-action-buttons-wrapper" style={{ display: 'flex', gap: '8px', flex: 1 }}>
                  {isOutOfStock ? (
                    <button
                      disabled
                      className="btn-mg-primary product-details-action-btn"
                      style={{ flex: 1, justifyContent: 'center', padding: '12px 6px', whiteSpace: 'nowrap', minWidth: 0, background: '#94a3b8', borderColor: '#94a3b8', cursor: 'not-allowed' }}
                    >
                      Out of Stock
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
                    onClick={() => dispatch(toggleWishlist(combo))}
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

              {/* Secure Checkout Note */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '12px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                <ShieldCheck size={16} color="#3BAE56" />
                <span>100% Secure Checkout & Original Products</span>
              </div>

              {/* Collapsible Product Details Dropdown (Mobile only) */}
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
                    Combo Details
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
                    {combo.description && (
                      <div>
                        <h4 style={{ fontSize: '12px', fontWeight: '800', color: '#1a2332', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Description</h4>
                        <p style={{ fontSize: '13px', color: '#4a5568', lineHeight: '1.6', margin: 0 }}>
                          {combo.description}
                        </p>
                      </div>
                    )}
                    <div>
                      <h4 style={{ fontSize: '12px', fontWeight: '800', color: '#1a2332', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Included Products</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {combo.components?.map((c, i) => (
                          <div key={i} style={{ fontSize: '13px', color: '#4a5568' }}>
                            • <strong>{c.name}</strong> ({c.size}) &times; {c.quantity}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Description & Detail Tabs (Desktop only) */}
          <div className="glass desktop-tabs-section" style={{ borderRadius: '24px', padding: '32px', background: 'white', marginTop: '40px' }}>
            <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid #e2e8f0', marginBottom: '24px', overflowX: 'auto' }}>
              {['description', 'combo items', 'benefits'].map((tab) => (
                <button
                  key={tab}
                  className={`mg-tab ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                  style={{ textTransform: 'capitalize' }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            <div style={{ minHeight: '120px' }}>
              {activeTab === 'description' && (
                <p style={{ fontSize: '14px', color: '#4a5568', lineHeight: '1.8' }}>
                  {combo.description || 'Specially selected combo set for ultimate skincare & wellness.'}
                </p>
              )}

              {activeTab === 'combo items' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                    {combo.components?.map((comp, idx) => {
                      const prodId = comp.product?._id || comp.product;
                      const prodImg = comp.product?.images?.[0] || comp.product?.image || '/top_product1.png';
                      return (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', borderRadius: '16px', background: '#F7FBFD', border: '1px solid #e2e8f0' }}>
                          <div style={{ width: '56px', height: '56px', position: 'relative', borderRadius: '10px', overflow: 'hidden', background: '#fff', border: '1px solid #e2e8f0', flexShrink: 0 }}>
                            <Image 
                              src={getImageUrl(prodImg)} 
                              alt={comp.name} 
                              fill 
                              sizes="56px"
                              style={{ objectFit: 'cover' }} 
                            />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '13px', fontWeight: '700', color: '#1a2332', marginBottom: '4px' }}>{comp.name}</div>
                            <div style={{ fontSize: '12px', color: '#3BAE56', fontWeight: '600' }}>
                              Package: {comp.size} | Qty: {comp.quantity}
                            </div>
                            <Link href={`/product/${prodId}`} style={{ fontSize: '11px', color: '#4A90E2', textDecoration: 'none', fontWeight: '600', marginTop: '4px', display: 'inline-block' }}>
                              View Product Details &rarr;
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'benefits' && (
                <div style={{ fontSize: '14px', color: '#4a5568', lineHeight: '1.8' }}>
                  {combo.benefits ? (
                    <div style={{ whiteSpace: 'pre-wrap' }}>{combo.benefits}</div>
                  ) : (
                    <ul style={{ paddingLeft: '20px', margin: 0 }}>
                      <li style={{ marginBottom: '8px' }}><strong>Complete Regimen:</strong> Perfectly paired herbal products designed to work in synergy for maximum effectiveness.</li>
                      <li style={{ marginBottom: '8px' }}><strong>Maximum Savings:</strong> Get your favorite premium wellness products at an exclusive bundled discount.</li>
                      <li style={{ marginBottom: '8px' }}><strong>100% Pure & Herbal:</strong> Free from harmful chemicals, parabens, and sulfates.</li>
                      <li><strong>Ideal for Gifting:</strong> Beautifully curated collection suited for personal pampering or special gift sets.</li>
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Recommended Combos / Products Section */}
          {relatedCombos.length > 0 && (
            <div style={{ marginTop: '40px', marginBottom: '40px' }}>
              <div style={{ borderBottom: '1px solid #e2e8f0', marginBottom: '24px', paddingBottom: '12px' }}>
                <h2 style={{ fontFamily: 'var(--font-outfit)', fontSize: '20px', fontWeight: '800', color: '#1a2332', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  More Combos You May Like
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
                {relatedCombos.map((cb) => {
                  const cbImage = cb.image ? cb.image : (cb.components?.[0]?.product?.images?.[0] || '/top_product1.png');
                  const cbMrp = cb.regularTotal || cb.comboPrice;
                  const cbSavings = Math.max(0, cbMrp - cb.comboPrice);

                  return (
                    <div 
                      key={cb._id}
                      className="glass"
                      style={{
                        borderRadius: '20px',
                        background: '#ffffff',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        border: '1px solid #e2e8f0',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.06)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <Link href={`/combos/${cb._id}`} style={{ textDecoration: 'none', color: 'inherit', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1', overflow: 'hidden', background: '#f8fafc' }}>
                          <Image 
                            src={getImageUrl(cbImage)} 
                            alt={cb.name}
                            fill
                            sizes="(max-width: 768px) 50vw, 250px"
                            style={{ objectFit: 'cover' }}
                          />
                          {cbSavings > 0 && (
                            <span style={{ position: 'absolute', top: '10px', left: '10px', background: '#DDF7E3', color: '#3BAE56', fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '9999px' }}>
                              ₹{cbSavings} OFF
                            </span>
                          )}
                        </div>

                        <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                          <span style={{ fontSize: '10px', fontWeight: '700', color: '#3BAE56', letterSpacing: '0.08em', marginBottom: '4px' }}>
                            MAXGLOW
                          </span>
                          <h3 style={{ fontFamily: 'var(--font-outfit)', fontSize: '14px', fontWeight: '700', color: '#1a2332', marginBottom: '8px', lineHeight: '1.3', flex: 1 }}>
                            {cb.name}
                          </h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 'auto' }}>
                            <span style={{ fontSize: '16px', fontWeight: '800', color: '#1a2332' }}>₹{cb.comboPrice}</span>
                            {cbMrp > cb.comboPrice && (
                              <del style={{ fontSize: '12px', color: '#94a3b8' }}>₹{cbMrp}</del>
                            )}
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Mobile Sticky Bottom Bar matching MaxGlow shop-details style */}
      <div className="mobile-sticky-bar">
        <div className="sticky-bar-price-row">
          <span className="sticky-bar-price-label">Final Price</span>
          <div>
            <span className="sticky-bar-price-val">₹{finalPrice}</span>
            {savings > 0 && (
              <>
                <span className="sticky-bar-mrp">₹{mrp}</span>
                <span className="sticky-bar-discount">₹{savings} OFF</span>
              </>
            )}
          </div>
        </div>
        <div className="sticky-bar-btn-row">
          {isOutOfStock ? (
            <button disabled className="sticky-bar-outofstock-btn">
              Out of Stock
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

export default function ComboDetailPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #3BAE56', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    }>
      <ComboDetailContent />
    </Suspense>
  );
}
