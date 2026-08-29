"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import React, { memo, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart, removeFromCart, applyCouponCode } from '../store/cartSlice';
import { FiShoppingBag, FiX, FiTrash2, FiPlus, FiMinus, FiArrowRight, FiTag, FiChevronLeft, FiChevronRight, FiCheckCircle, FiChevronDown, FiChevronUp, FiFileText } from 'react-icons/fi';
import { Leaf } from 'lucide-react';
import { getImageUrl } from '../utils/imageConfig';
import api from '../utils/axiosConfig';
import { useNotification } from '../context/NotificationContext';

const CartOffcanvas = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { showAlert } = useNotification();
  
  const { items, subtotal, discount, total, couponCode, shippingFee } = useSelector((state) => state.cart);
  const allProducts = useSelector((state) => state.products?.items || []);

  const [currentView, setCurrentView] = useState('MAIN'); // 'MAIN' | 'COUPONS'
  const [publicCoupons, setPublicCoupons] = useState([]);
  const [couponInput, setCouponInput] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentView('MAIN');
      fetchPublicCoupons();
    }
  }, [isOpen]);

  const fetchPublicCoupons = async () => {
    setLoadingCoupons(true);
    try {
      const res = await api.get('/coupons/public');
      if (res.data.success) {
        setPublicCoupons(res.data.coupons);
      }
    } catch (err) {
      console.error('Error fetching coupons', err);
    } finally {
      setLoadingCoupons(false);
    }
  };

  const handleIncrement = (product, size) => {
    dispatch(addToCart({ product, quantity: 1, size }));
  };

  const handleDecrement = (product, size) => {
    const item = items.find(i => i.product === product._id && i.size === size);
    if (item && item.quantity > 1) {
      dispatch(addToCart({ product, quantity: -1, size }));
    } else {
      dispatch(removeFromCart({ product: product._id, size }));
    }
  };

  const handleRemove = (productId, size) => {
    dispatch(removeFromCart({ product: productId, size }));
  };

  const handleApplyCoupon = async (codeToApply) => {
    const code = codeToApply || couponInput.trim();
    if (!code) {
      showAlert('Please enter a coupon code', 'warning');
      return;
    }
    setApplyingCoupon(true);
    try {
      const response = await api.post(`/coupons/apply`, { code, cartTotal: subtotal });
      if (response.data.success) {
        dispatch(applyCouponCode({
          code: response.data.code,
          discountType: response.data.discountType,
          discountPercentage: response.data.discountPercentage,
          flatDiscountAmount: response.data.flatDiscountAmount,
          applicableProducts: response.data.applicableProducts,
          isCombo: response.data.isCombo
        }));
        setCouponInput('');
        setCurrentView('MAIN');
      }
    } catch (error) {
      showAlert(error.response?.data?.message || 'Failed to apply coupon', 'error');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    dispatch(applyCouponCode({ code: '', discountType: 'percentage', discountPercentage: 0, flatDiscountAmount: 0, applicableProducts: [], isCombo: false }));
  };

  const handleAddRecommended = (product) => {
    dispatch(addToCart({
      product: { ...product, _id: product._id },
      quantity: 1,
      size: product.sizes?.[0] || 'Default'
    }));
  };

  // --- Derived State & Calculations ---
  
  // 1. Progress Bar Logic
  const freeShippingThreshold = 999;
  let rawTargets = [{ value: freeShippingThreshold, type: 'shipping', label: 'Free Shipping' }];
  publicCoupons.forEach(c => {
    if (c.minOrderValue > 0) {
      const label = c.discountType === 'flat' ? `₹${c.flatDiscountAmount} OFF` : `${c.discountPercentage}% OFF`;
      rawTargets.push({ value: c.minOrderValue, type: 'discount', label });
    }
  });
  rawTargets.sort((a, b) => a.value - b.value);

  let targets = [];
  const seenValues = new Set();
  rawTargets.forEach(t => {
    if (!seenValues.has(t.value)) {
      seenValues.add(t.value);
      targets.push(t);
    }
  });
  
  const maxTargetValue = targets.length > 0 ? targets[targets.length - 1].value : freeShippingThreshold;
  const progressPercent = Math.min(100, (subtotal / maxTargetValue) * 100);

  // Find next target user hasn't hit
  const nextTarget = targets.find(t => subtotal < t.value);
  const remainingForNext = nextTarget ? Math.max(0, nextTarget.value - subtotal) : 0;
  
  let progressMessage = '';
  if (!nextTarget) {
    progressMessage = "🎉 You've unlocked all rewards!";
  } else if (nextTarget.type === 'shipping') {
    progressMessage = <>Add <span style={{ color: '#4A90E2', fontWeight: '700' }}>₹{remainingForNext.toFixed(0)}</span> more for Free Shipping</>;
  } else {
    progressMessage = <>Add <span style={{ color: '#4A90E2', fontWeight: '700' }}>₹{remainingForNext.toFixed(0)}</span> more to unlock {nextTarget.label}</>;
  }

  // 2. Recommendations Logic
  const cartProductIds = items.map(i => i.product);
  const recommended = allProducts.filter(p => !cartProductIds.includes(p._id)).slice(0, 4);

  const totalMrp = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalSavings = (totalMrp - subtotal) + discount; // Assuming some discount is applied to subtotal if there are discounts on products, but subtotal usually = totalMrp in this simple flow.
  
  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes milestonePulse {
          0% { box-shadow: 0 0 0 0 rgba(74, 144, 226, 0.5); transform: scale(1); }
          70% { box-shadow: 0 0 0 10px rgba(74, 144, 226, 0); transform: scale(1.2); }
          100% { box-shadow: 0 0 0 0 rgba(74, 144, 226, 0); transform: scale(1); }
        }
        @keyframes milestoneHit {
          0% { transform: scale(1); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
      `}</style>

      {/* Overlay */}
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', zIndex: 9998, animation: 'fadeIn 0.3s ease' }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="mg-cart-drawer" style={{ animation: 'slideInRight 0.3s cubic-bezier(0.4,0,0.2,1)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* --- MAIN VIEW --- */}
        {currentView === 'MAIN' && (
          <>
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px', borderBottom: '1px solid #f1f5f9',
              background: 'linear-gradient(135deg, #EAF8FF 0%, #DDF7E3 100%)',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #4A90E2, #3BAE56)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FiShoppingBag size={16} color="white" />
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-outfit)', fontSize: '14px', fontWeight: '700', color: '#1a2332' }}>YOUR CART</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{items.length} item{items.length !== 1 ? 's' : ''}</div>
                </div>
              </div>
              <button onClick={onClose} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <FiX size={16} color="#374151" />
              </button>
            </div>

            {items.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px' }}>
                <div style={{ width: '80px', height: '80px', background: '#EAF8FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <FiShoppingBag size={32} color="#4A90E2" />
                </div>
                <div style={{ fontFamily: 'var(--font-outfit)', fontSize: '18px', fontWeight: '700', color: '#1a2332', marginBottom: '8px' }}>Your cart is empty</div>
                <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px', textAlign: 'center' }}>Looks like you haven't added anything to your cart yet.</p>
                <Link href="/shop" onClick={onClose} className="btn-mg-green" style={{ fontSize: '15px', padding: '12px 32px', display: 'inline-flex' }}>
                  <Leaf size={18} className="me-2" /> Start Shopping
                </Link>
              </div>
            ) : (
              <>
                {/* Scrollable Content */}
                <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
                  {/* Tiered Progress Bar */}
                  <div style={{ padding: '24px 24px 16px', background: 'white', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: !nextTarget ? '#3BAE56' : '#374151', marginBottom: '24px', textAlign: 'center' }}>
                      {progressMessage}
                    </div>
                    
                    <div style={{ position: 'relative', height: '6px', background: '#e2e8f0', borderRadius: '9999px', marginBottom: '12px', margin: '0 10px' }}>
                      <div style={{
                        position: 'absolute', left: 0, top: 0, height: '100%',
                        width: `${progressPercent}%`,
                        background: 'linear-gradient(90deg, #4A90E2, #3BAE56)',
                        borderRadius: '9999px',
                        transition: 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      }} />
                      
                      {/* Milestones */}
                      {targets.map((t, idx) => {
                        const leftPos = Math.min(100, (t.value / maxTargetValue) * 100);
                        const isHit = subtotal >= t.value;
                        const isNext = nextTarget && t.value === nextTarget.value;
                        
                        return (
                          <div key={idx} style={{ position: 'absolute', left: `${leftPos}%`, top: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '64px' }}>
                            <div style={{ whiteSpace: 'normal', fontSize: '9px', fontWeight: '700', color: isHit ? '#3BAE56' : '#64748b', marginBottom: '6px', height: '24px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', textAlign: 'center', lineHeight: '1.1' }}>
                              <span>{t.label}</span>
                            </div>
                            <div style={{ 
                              width: '18px', height: '18px', borderRadius: '50%', 
                              background: isHit ? '#3BAE56' : 'white', 
                              border: isHit ? 'none' : (isNext ? '2px solid #4A90E2' : '2px solid #cbd5e1'),
                              boxShadow: '0 0 0 4px white',
                              zIndex: 2,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                              animation: isNext ? 'milestonePulse 2s infinite' : (isHit ? 'milestoneHit 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none')
                            }}>
                              {isHit && <FiCheckCircle size={14} color="white" />}
                            </div>
                            <div style={{ whiteSpace: 'nowrap', fontSize: '10px', fontWeight: '600', color: isHit ? '#3BAE56' : (isNext ? '#4A90E2' : '#94a3b8'), marginTop: '6px', height: '16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
                              ₹{t.value}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    {/* Extra bottom padding to accommodate labels */}
                    <div style={{ height: '16px' }}></div> 
                  </div>

                  {/* Items List */}
                  <div style={{ padding: '12px', background: '#f8fafc' }}>
                    {items.map((item, idx) => (
                      <div key={`${item.product}-${item.size}-${idx}`} style={{
                        background: 'white', borderRadius: '10px', padding: '12px',
                        marginBottom: '10px', border: '1px solid #f1f5f9',
                        display: 'flex', gap: '12px', alignItems: 'flex-start',
                      }}>
                        {/* Image */}
                        <div style={{ width: '64px', height: '64px', flexShrink: 0, borderRadius: '6px', overflow: 'hidden', background: '#F7FBFD', border: '1px solid #EAF8FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Image src={getImageUrl(item.image)} alt={item.name} width={64} height={64} style={{ objectFit: 'contain' }} onError={(e) => { e.currentTarget.src = '/placeholder.png'; }} />
                        </div>

                        {/* Details */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2px' }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: '#1a2332', lineHeight: '1.2', paddingRight: '8px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                              {item.name}
                            </div>
                            <button onClick={() => handleRemove(item.product, item.size)}
                              style={{ background: 'transparent', border: 'none', padding: '0px', cursor: 'pointer', flexShrink: 0, color: '#94a3b8' }}>
                              <FiTrash2 size={14} />
                            </button>
                          </div>
                          
                          {item.size && item.size !== 'Default' && (
                            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>{item.size}</div>
                          )}

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                              <span style={{ fontWeight: '800', fontSize: '14px', color: '#1a2332' }}>₹{item.price}</span>
                              {/* Assuming no variant MRP exists in current payload, so just price */}
                            </div>

                            {/* Qty controls */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0', border: '1px solid #e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                              <button onClick={() => handleDecrement({ _id: item.product, price: item.price, name: item.name, images: [item.image], stock: item.maxStock }, item.size)}
                                style={{ padding: '3px 8px', background: 'white', border: 'none', cursor: 'pointer', color: '#374151', display: 'flex', alignItems: 'center' }}>
                                <FiMinus size={12} />
                              </button>
                              <span style={{ padding: '3px 6px', fontWeight: '700', fontSize: '12px', color: '#1a2332', minWidth: '24px', textAlign: 'center', background: 'white' }}>{item.quantity}</span>
                              <button onClick={() => handleIncrement({ _id: item.product, price: item.price, name: item.name, images: [item.image], stock: item.maxStock }, item.size)}
                                style={{ padding: '3px 8px', background: 'white', border: 'none', cursor: 'pointer', color: '#374151', display: 'flex', alignItems: 'center' }}>
                                <FiPlus size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Recommendations */}
                  {recommended.length > 0 && (
                    <div style={{ padding: '16px 12px', background: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#1a2332', marginBottom: '12px' }}>Recommended for you</div>
                      <div className="hide-scrollbar" style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px' }}>
                        {recommended.map(product => (
                          <div key={product._id} style={{ width: '110px', flexShrink: 0, background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ width: '100%', height: '70px', background: '#F7FBFD', borderRadius: '4px', marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Image src={getImageUrl(product.images?.[0] || product.image)} alt={product.name} width={60} height={60} style={{ objectFit: 'contain' }} />
                            </div>
                            <div style={{ fontSize: '11px', fontWeight: '600', color: '#1a2332', lineHeight: '1.2', marginBottom: '4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>
                              {product.name}
                            </div>
                            <div style={{ fontSize: '12px', fontWeight: '800', color: '#1a2332', marginBottom: '6px' }}>₹{product.price}</div>
                            <button 
                              onClick={() => handleAddRecommended(product)}
                              style={{ width: '100%', background: 'white', border: '1px solid #3BAE56', color: '#3BAE56', borderRadius: '4px', padding: '3px 0', fontSize: '10px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s ease' }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = '#3BAE56'; e.currentTarget.style.color = 'white'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#3BAE56'; }}
                            >
                              + ADD
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Fixed Bottom elements (Coupons, Order Summary, Checkout) */}
                <div style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
                  {/* Coupon Application Box */}
                  <div style={{ padding: '10px 12px', background: 'white' }}>
                    {couponCode ? (
                      <div style={{ background: '#ecfdf5', border: '1px dashed #34d399', borderRadius: '6px', padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <FiTag size={14} color="#059669" />
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: '700', color: '#065f46' }}>'{couponCode}' Applied!</div>
                            <div style={{ fontSize: '11px', color: '#047857' }}>You saved ₹{discount.toFixed(0)}</div>
                          </div>
                        </div>
                        <button onClick={handleRemoveCoupon} style={{ background: 'transparent', border: 'none', color: '#059669', cursor: 'pointer', fontWeight: '600', fontSize: '12px', textDecoration: 'underline' }}>Remove</button>
                      </div>
                    ) : (
                      <div 
                        onClick={() => setCurrentView('COUPONS')}
                        style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <FiTag size={14} color="#4A90E2" />
                          <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Apply Coupon / Offers</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {publicCoupons.length > 0 && (
                            <span style={{ fontSize: '10px', background: '#fee2e2', color: '#ef4444', padding: '2px 6px', borderRadius: '9999px', fontWeight: '700' }}>{publicCoupons.length} Offers</span>
                          )}
                          <FiChevronRight size={14} color="#94a3b8" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Detailed Bill Summary (Collapsible) */}
                  <div style={{ padding: '12px', background: 'white', borderTop: '1px solid #f1f5f9' }}>
                    <div 
                      onClick={() => setShowSummary(!showSummary)} 
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'pointer', userSelect: 'none' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FiFileText size={16} color="#64748b" />
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#1a2332' }}>Estimated total</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {(discount > 0 || shippingFee === 0) && (
                            <span style={{ fontSize: '12px', color: '#94a3b8', textDecoration: 'line-through' }}>
                              ₹{(subtotal + (shippingFee === 0 ? 40 : shippingFee)).toFixed(0)}
                            </span>
                          )}
                          <span style={{ fontSize: '15px', fontWeight: '800', color: '#1a2332' }}>₹{total.toFixed(0)}</span>
                          {showSummary ? <FiChevronUp size={16} color="#64748b" /> : <FiChevronDown size={16} color="#64748b" />}
                        </div>
                        {(discount > 0 || shippingFee === 0) && (
                          <div style={{ fontSize: '11px', color: '#059669', fontWeight: '600', marginTop: '2px', paddingRight: '22px' }}>
                            You saved ₹{(discount + (shippingFee === 0 ? 40 : 0)).toFixed(0)}!
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div 
                      style={{ 
                        display: 'grid', 
                        gridTemplateRows: showSummary ? '1fr' : '0fr', 
                        transition: 'grid-template-rows 0.3s ease-out' 
                      }}
                    >
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ marginTop: '16px', borderTop: '1px dashed #e2e8f0', paddingTop: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#475569', marginBottom: '10px' }}>
                            <span>Total MRP</span>
                            <span style={{ fontWeight: '500' }}>₹{subtotal.toFixed(0)}</span>
                          </div>
                          
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#475569', marginBottom: '10px' }}>
                            <span>Delivery Fee</span>
                            <span style={{ fontWeight: '500' }}>{shippingFee === 0 ? <span style={{ color: '#059669' }}>FREE</span> : 'To be calculated'}</span>
                          </div>
                          
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#475569', marginBottom: '10px' }}>
                            <span>Discount on MRP</span>
                            <span style={{ color: '#059669', fontWeight: '500' }}>₹{((subtotal + (shippingFee === 0 ? 40 : shippingFee)) - total - discount).toFixed(0)}</span>
                          </div>
                          
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#475569', marginBottom: '12px' }}>
                            <span>Coupon discount</span>
                            <span style={{ color: '#059669', fontWeight: '500' }}>₹{discount.toFixed(0)}</span>
                          </div>
                          
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '700', color: '#1a2332', marginTop: '10px', paddingTop: '12px', borderTop: '1px dashed #e2e8f0' }}>
                            <span>Grand total</span>
                            <span>₹{total.toFixed(0)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Checkout */}
                  <div style={{ padding: '12px', background: 'white', borderTop: '1px solid #e2e8f0', boxShadow: '0 -4px 12px rgba(0,0,0,0.03)' }}>
                    <button
                      className="btn-mg-green"
                      style={{ width: '100%', justifyContent: 'center', fontSize: '15px', padding: '12px', fontWeight: '700', borderRadius: '8px' }}
                      onClick={() => { onClose(); router.push('/checkout'); }}
                    >
                      Checkout <FiArrowRight size={18} className="ms-2" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* --- COUPONS VIEW --- */}
        {currentView === 'COUPONS' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f8fafc' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '20px', background: 'white', borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
              <button onClick={() => setCurrentView('MAIN')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center', color: '#1a2332' }}>
                <FiChevronLeft size={24} />
              </button>
              <div style={{ marginLeft: '12px' }}>
                <div style={{ fontFamily: 'var(--font-outfit)', fontSize: '16px', fontWeight: '700', color: '#1a2332' }}>Coupons & Offers</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Cart value - ₹{subtotal.toFixed(0)}</div>
              </div>
            </div>

            {/* Content */}
            <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              {/* Input Box */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <FiTag size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="text" 
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    style={{ width: '100%', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '12px 12px 12px 36px', fontSize: '14px', textTransform: 'uppercase', outline: 'none' }}
                  />
                </div>
                <button 
                  onClick={() => handleApplyCoupon()}
                  disabled={!couponInput.trim() || applyingCoupon}
                  style={{ background: couponInput.trim() ? '#1a2332' : '#cbd5e1', color: 'white', border: 'none', borderRadius: '8px', padding: '0 20px', fontWeight: '600', cursor: couponInput.trim() ? 'pointer' : 'not-allowed', transition: 'background 0.2s' }}
                >
                  {applyingCoupon ? '...' : 'APPLY'}
                </button>
              </div>

              {loadingCoupons ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: '14px' }}>Loading offers...</div>
              ) : (
                <>
                  {/* Available Coupons */}
                  {publicCoupons.filter(c => subtotal >= c.minOrderValue).length > 0 && (
                    <div style={{ marginBottom: '24px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', letterSpacing: '0.05em', marginBottom: '12px' }}>AVAILABLE OFFERS</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {publicCoupons.filter(c => subtotal >= c.minOrderValue).map(coupon => {
                          const isApplied = couponCode === coupon.code;
                          const potentialDiscount = coupon.discountType === 'flat' ? Math.min(coupon.flatDiscountAmount, subtotal) : Math.round((subtotal * coupon.discountPercentage) / 100);
                          return (
                            <div key={coupon._id} style={{ background: isApplied ? '#ecfdf5' : 'white', border: isApplied ? '1px solid #34d399' : '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', position: 'relative', overflow: 'hidden' }}>
                              <div style={{ position: 'absolute', left: '-5px', top: '50%', transform: 'translateY(-50%)', width: '10px', height: '20px', background: '#f8fafc', borderRadius: '0 10px 10px 0', border: '1px solid #e2e8f0', borderLeft: 'none' }}></div>
                              <div style={{ position: 'absolute', right: '-5px', top: '50%', transform: 'translateY(-50%)', width: '10px', height: '20px', background: '#f8fafc', borderRadius: '10px 0 0 10px', border: '1px solid #e2e8f0', borderRight: 'none' }}></div>
                              
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                <div style={{ background: '#EAF8FF', color: '#4A90E2', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: '700', border: '1px dashed #bae6fd' }}>
                                  {coupon.code}
                                </div>
                                {isApplied ? (
                                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <FiCheckCircle size={14} /> Applied
                                  </div>
                                ) : (
                                  <button onClick={() => handleApplyCoupon(coupon.code)} disabled={applyingCoupon} style={{ background: 'transparent', border: 'none', color: '#3BAE56', fontSize: '13px', fontWeight: '700', cursor: 'pointer', padding: 0 }}>
                                    Apply
                                  </button>
                                )}
                              </div>
                              <div style={{ fontSize: '14px', fontWeight: '700', color: '#1a2332', marginBottom: '4px' }}>
                                {coupon.discountType === 'flat' ? `₹${coupon.flatDiscountAmount} OFF` : `${coupon.discountPercentage}% OFF`}
                              </div>
                              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                                On orders above ₹{coupon.minOrderValue}
                              </div>
                              <div style={{ fontSize: '12px', fontWeight: '600', color: '#059669' }}>
                                Save ₹{potentialDiscount} on this order!
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Unavailable Coupons */}
                  {publicCoupons.filter(c => subtotal < c.minOrderValue).length > 0 && (
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.05em', marginBottom: '12px' }}>UNAVAILABLE OFFERS</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', opacity: 0.7 }}>
                        {publicCoupons.filter(c => subtotal < c.minOrderValue).map(coupon => {
                          const diff = coupon.minOrderValue - subtotal;
                          return (
                            <div key={coupon._id} style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', position: 'relative', overflow: 'hidden' }}>
                              <div style={{ position: 'absolute', left: '-5px', top: '50%', transform: 'translateY(-50%)', width: '10px', height: '20px', background: '#f8fafc', borderRadius: '0 10px 10px 0', border: '1px solid #e2e8f0', borderLeft: 'none' }}></div>
                              <div style={{ position: 'absolute', right: '-5px', top: '50%', transform: 'translateY(-50%)', width: '10px', height: '20px', background: '#f8fafc', borderRadius: '10px 0 0 10px', border: '1px solid #e2e8f0', borderRight: 'none' }}></div>
                              
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                <div style={{ background: '#e2e8f0', color: '#475569', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: '700', border: '1px dashed #cbd5e1' }}>
                                  {coupon.code}
                                </div>
                                <button onClick={() => { setCurrentView('MAIN'); }} style={{ background: 'transparent', border: 'none', color: '#4A90E2', fontSize: '13px', fontWeight: '700', cursor: 'pointer', padding: 0 }}>
                                  Add items
                                </button>
                              </div>
                              <div style={{ fontSize: '14px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                                {coupon.discountType === 'flat' ? `₹${coupon.flatDiscountAmount} OFF` : `${coupon.discountPercentage}% OFF`}
                              </div>
                              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                                On orders above ₹{coupon.minOrderValue}
                              </div>
                              <div style={{ fontSize: '12px', fontWeight: '600', color: '#ef4444' }}>
                                Add ₹{diff.toFixed(0)} more to unlock!
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default memo(CartOffcanvas);
