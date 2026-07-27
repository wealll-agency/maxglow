"use client";
import React, { useState, useEffect, Suspense, memo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../store/cartSlice';
import { fetchProductDetails, fetchProductReviews, submitProductReview, fetchProducts } from '../../store/productsSlice';
import { toggleWishlist } from '../../store/wishlistSlice';
import { Star, Heart, Plus, Minus, MessageCircle, Share2, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';
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

  // Review form states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [notifyLoading, setNotifyLoading] = useState(false);

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

  const getImageUrl = (url) => {
    if (!url) return '/top_product1.png';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads/')) {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'https://www.maxglowon.com';
      return `${baseUrl}${url}`;
    }
    return url.replace('/assets/images/', '/');
  };

  return (
    <div style={{ background: '#F7FBFD', padding: '40px 0' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Breadcrumb */}
        <nav style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>
          <Link href="/" style={{ textDecoration: 'none', color: '#64748b' }}>Home</Link> &gt; 
          <Link href="/shop" style={{ textDecoration: 'none', color: '#64748b', marginLeft: '6px' }}>Shop</Link> &gt; 
          <span style={{ color: '#1a2332', fontWeight: '600', marginLeft: '6px' }}>{realProduct.name}</span>
        </nav>

        {/* Product Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', marginBottom: '48px', alignItems: 'start' }}>
          
          {/* Left: Images Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '500px', margin: '0 auto', width: '100%' }}>
            <div className="glass" style={{ borderRadius: '24px', aspectRatio: '1 / 1', overflow: 'hidden', background: 'white', position: 'relative', width: '100%' }}>
              {realProduct.isFeatured && (
                <span className="mg-badge mg-badge-blue" style={{ position: 'absolute', top: '16px', left: '16px' }}>
                  PREMIUM
                </span>
              )}
              <Image
                src={getImageUrl(images[activeImageIndex])}
                alt={realProduct.name}
                width={400}
                height={400}
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                priority
              />
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                {images.map((imgUrl, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    style={{
                      width: '64px', height: '64px', borderRadius: '12px', background: 'white',
                      border: activeImageIndex === index ? '2px solid #3BAE56' : '1px solid #e2e8f0',
                      padding: '0', cursor: 'pointer', flexShrink: 0,
                    }}
                  >
                    <Image src={getImageUrl(imgUrl)} alt="" width={56} height={56} style={{ objectFit: 'cover', width: '100%', height: '100%', borderRadius: '12px' }} />
                  </button>
                ))}
              </div>
            )}

            {/* Trust icons row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', borderTop: '1px solid #e2e8f0', paddingTop: '24px', textAlign: 'center' }}>
              {[
                { img: '/icon_heart.png', label: '100% Healthy' },
                { img: '/icon_gluten.png', label: 'Gluten Free' },
                { img: '/icon_nutrition.png', label: 'Rich Nutrients' },
                { img: '/icon_cholesterol.png', label: 'No Toxins' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '6px' }}>
                    <Image src={item.img} alt={item.label} width={30} height={30} />
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: '600', color: '#64748b' }}>{item.label}</span>
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

            {/* Price Box */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                <span style={{ fontFamily: 'var(--font-outfit)', fontSize: '32px', fontWeight: '800', color: '#1a2332' }}>
                  ₹{finalPrice}
                </span>
                {realProduct.discount > 0 && (
                  <span style={{ background: '#DDF7E3', color: '#3BAE56', fontSize: '12px', fontWeight: '700', padding: '4px 10px', borderRadius: '9999px' }}>
                    {realProduct.discount}% OFF
                  </span>
                )}
              </div>
              {realProduct.discount > 0 && (
                <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                  MRP: <del>₹{realProduct.price}</del> <span style={{ fontSize: '11px' }}>(inclusive of all taxes)</span>
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

            {/* Quantity */}
            {realProduct.stock > 0 && (
              <div style={{ marginBottom: '28px' }}>
                <label className="mg-form-label" style={{ marginBottom: '10px' }}>Quantity</label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #e2e8f0', borderRadius: '10px', width: '110px', height: '40px', overflow: 'hidden' }}>
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ width: '36px', height: '100%', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151' }}>
                    <Minus size={14} />
                  </button>
                  <span style={{ flex: 1, textAlign: 'center', fontSize: '14px', fontWeight: '700', color: '#1a2332' }}>{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(realProduct.stock || 100, quantity + 1))} disabled={quantity >= (realProduct.stock || 100)} style={{ width: '36px', height: '100%', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151' }}>
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '28px' }}>
              {realProduct.stock <= 0 ? (
                <button
                  onClick={handleNotifyMe}
                  disabled={notifyLoading}
                  className="btn-mg-primary"
                  style={{ flex: 1, justifyContent: 'center', padding: '14px' }}
                >
                  {notifyLoading ? 'Subscribing...' : 'Notify Me When Available'}
                </button>
              ) : (
                <>
                  <button
                    onClick={handleAddToCart}
                    className="btn-mg-outline"
                    style={{ flex: 1, justifyContent: 'center', padding: '14px' }}
                  >
                    Add To Cart
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="btn-mg-green"
                    style={{ flex: 1, justifyContent: 'center', padding: '14px' }}
                  >
                    Buy It Now
                  </button>
                </>
              )}
              <button
                onClick={() => dispatch(toggleWishlist(realProduct))}
                style={{
                  width: '48px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Heart size={20} fill={isInWishlist ? '#ef4444' : 'none'} color={isInWishlist ? '#ef4444' : '#64748b'} />
              </button>
            </div>

            {/* Pincode & Info */}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <input
                  type="text"
                  placeholder="Enter Pincode"
                  className="mg-input"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  style={{ padding: '8px 14px', borderRadius: '8px', maxWidth: '180px' }}
                />
                <button className="btn-mg-outline" style={{ padding: '8px 16px', fontSize: '13px' }}>Check Delivery</button>
              </div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#64748b' }}>
                <span>🚚 Free Shipping above ₹999</span>
                <span>💵 Cash on Delivery Available</span>
              </div>
            </div>

          </div>
        </div>

        {/* Description & Review Tabs */}
        <div className="glass" style={{ borderRadius: '24px', padding: '32px', background: 'white', marginTop: '40px' }}>
          <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid #e2e8f0', marginBottom: '24px', overflowX: 'auto' }}>
            {['description', 'ingredients', 'benefits', 'additional info', 'reviews'].map((tab) => (
              <button
                key={tab}
                className={`mg-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'reviews' ? `Reviews (${reviews.length})` : tab}
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
            {activeTab === 'additional info' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', fontSize: '14px', color: '#4a5568' }}>
                <div><strong>SKU:</strong> {realProduct.sku || 'N/A'}</div>
                <div><strong>Category:</strong> {realProduct.category || 'N/A'}</div>
                {realProduct.subCategory && <div><strong>Sub Category:</strong> {realProduct.subCategory}</div>}
                {realProduct.brand && <div><strong>Brand:</strong> {realProduct.brand}</div>}
                <div><strong>Product Type:</strong> {realProduct.productType || 'Physical'}</div>
                {realProduct.expiryDate && <div><strong>Expiry Date:</strong> {new Date(realProduct.expiryDate).toLocaleDateString()}</div>}
              </div>
            )}
            {activeTab === 'reviews' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px' }}>
                {/* Review List */}
                <div>
                  <h3 style={{ fontFamily: 'var(--font-outfit)', fontSize: '16px', fontWeight: '700', color: '#1a2332', marginBottom: '16px' }}>Customer Feedback</h3>
                  {reviewsLoading ? (
                    <div style={{ color: '#94a3b8', fontSize: '13px' }}>Loading reviews...</div>
                  ) : reviews.length === 0 ? (
                    <div style={{ color: '#64748b', fontSize: '13px' }}>No reviews yet for this product. Be the first to write a review!</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {reviews.map((rev) => (
                        <div key={rev._id} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <div style={{ fontWeight: '700', fontSize: '13px', color: '#1a2332' }}>{rev.user?.name || 'Anonymous User'}</div>
                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>{new Date(rev.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '2px', marginBottom: '6px' }}>
                            {[...Array(rev.rating)].map((_, i) => <Star key={i} size={12} fill="#f59e0b" color="#f59e0b" />)}
                          </div>
                          <p style={{ fontSize: '13px', color: '#4a5568', margin: 0 }}>{rev.comment}</p>
                        </div>
                      ))}
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
            )}
          </div>
        </div>

      </div>
    </div>
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
