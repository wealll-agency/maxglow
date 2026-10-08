"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import React, { useState, useEffect, memo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getImageUrl } from '../../utils/imageConfig';
import { removeFromCart, updateCartQuantity, applyCouponCode, recalculateCart, clearRemovedCouponNotice } from '../../store/cartSlice';
import api from '../../utils/axiosConfig';
import { useNotification } from '../../context/NotificationContext';
import { FiTrash2, FiShoppingBag, FiPlus, FiMinus, FiArrowRight, FiPercent } from 'react-icons/fi';


function CartPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { showAlert } = useNotification();

  const { items, couponCode, subtotal, discount, tax, shippingFee, total, discountPercentage, isCombo, applicableProducts, removedCouponNotice } = useSelector(
    (state) => state.cart
  );
  const { user } = useSelector((state) => state.auth);

  const [couponInput, setCouponInput] = useState(couponCode);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  useEffect(() => {
    dispatch(recalculateCart());
  }, [dispatch, items]);

  useEffect(() => {
    if (removedCouponNotice) {
      setCouponError(removedCouponNotice);
      dispatch(clearRemovedCouponNotice());
    }
  }, [removedCouponNotice, dispatch]);

  const handleQuantityChange = (item, qty) => {
    const maxStock = item.maxStock || 100;
    const parsedQty = Math.max(1, Math.min(maxStock, qty));
    dispatch(updateCartQuantity({ 
      product: item.product || item.combo, 
      size: item.size, 
      quantity: parsedQty,
      itemType: item.itemType || (item.combo ? 'Combo' : 'Product')
    }));
  };

  const handleRemove = (item) => {
    dispatch(removeFromCart({ 
      product: item.product || item.combo, 
      size: item.size,
      itemType: item.itemType || (item.combo ? 'Combo' : 'Product')
    }));
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    try {
      setCouponError('');
      setCouponSuccess('');
      
      const response = await api.post(`/coupons/apply`, { code: couponInput.trim(), cartTotal: subtotal });
      const applicableProductsList = response.data.applicableProducts || [];

      if (applicableProductsList.length > 0) {
        const hasEligibleItem = items.some(item => applicableProductsList.includes(typeof item.product === 'object' ? item.product._id : item.product));
        if (!hasEligibleItem && !response.data.isCombo) {
          setCouponError('This coupon is not valid for any items in your cart.');
          dispatch(applyCouponCode({ code: '', discountType: 'percentage', discountPercentage: 0, flatDiscountAmount: 0, applicableProducts: [], isCombo: false, minOrderValue: 0 }));
          return;
        }
      }

      dispatch(applyCouponCode({
        code: response.data.code,
        discountType: response.data.discountType,
        discountPercentage: response.data.discountPercentage,
        flatDiscountAmount: response.data.flatDiscountAmount,
        applicableProducts: applicableProductsList,
        isCombo: response.data.isCombo,
        minOrderValue: response.data.minOrderValue || 0
      }));

      const discText = response.data.discountType === 'flat' ? `₹${response.data.flatDiscountAmount}` : `${response.data.discountPercentage}%`;
      setCouponSuccess(`Coupon "${response.data.code}" applied! ${discText} Discount.`);
    } catch (error) {
      setCouponError(error.response?.data?.message || 'Failed to apply coupon');
      dispatch(applyCouponCode({ code: '', discountType: 'percentage', discountPercentage: 0, flatDiscountAmount: 0, applicableProducts: [], isCombo: false, minOrderValue: 0 }));
    }
  };

  const handleCheckoutRedirect = () => {
    const TEMPORARY_ORDER_DISABLED = true;
    if (TEMPORARY_ORDER_DISABLED) {
      if (typeof document !== 'undefined' && !document.getElementById('temp-order-modal')) {
        const modal = document.createElement('div');
        modal.id = 'temp-order-modal';
        modal.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(26,35,50,0.4);backdrop-filter:blur(8px);z-index:999999;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.3s ease;padding:20px;';
        modal.innerHTML = `
          <div style="background:#fff;padding:40px;border-radius:24px;max-width:440px;width:100%;text-align:center;box-shadow:0 24px 64px rgba(0,0,0,0.12);transform:translateY(20px);transition:transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
            <div style="width:72px;height:72px;background:#fff0f0;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 24px;">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            </div>
            <h2 style="font-family:var(--font-outfit), sans-serif;font-size:22px;font-weight:800;color:#1a2332;margin-bottom:12px;letter-spacing:-0.5px;">Orders Temporarily Unavailable</h2>
            <p style="font-size:15px;color:#64748b;line-height:1.6;margin-bottom:32px;">We're currently not accepting orders at the moment. Please check back soon. We apologize for the inconvenience and appreciate your patience.</p>
            <button id="temp-order-close" style="background:#3BAE56;color:#fff;border:none;padding:16px 32px;font-size:15px;font-weight:700;border-radius:14px;cursor:pointer;width:100%;transition:all 0.2s ease;box-shadow:0 8px 16px rgba(59,174,86,0.2);">Okay, I Understand</button>
          </div>
        `;
        document.body.appendChild(modal);
        const btn = document.getElementById('temp-order-close');
        btn.onmouseover = () => btn.style.transform = 'translateY(-2px)';
        btn.onmouseout = () => btn.style.transform = 'translateY(0)';
        
        requestAnimationFrame(() => {
          modal.style.opacity = '1';
          modal.children[0].style.transform = 'translateY(0)';
        });
        btn.onclick = () => {
          modal.style.opacity = '0';
          modal.children[0].style.transform = 'translateY(20px)';
          setTimeout(() => modal.remove(), 300);
        };
      }
      return;
    }

    if (!user) {
      router.push('/login?redirect=checkout');
    } else {
      router.push('/checkout');
    }
  };


  if (items.length === 0) {
    return (
      <div style={{ background: '#F7FBFD', padding: '80px 20px', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass" style={{ borderRadius: '24px', padding: '40px 24px', maxWidth: '480px', width: '100%', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', background: '#EAF8FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <FiShoppingBag size={36} color="#4A90E2" />
          </div>
          <h2 style={{ fontFamily: 'var(--font-outfit)', fontSize: '22px', fontWeight: '800', color: '#1a2332', marginBottom: '8px' }}>Your Cart is Empty</h2>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>Discover our premium herbal products and start shopping.</p>
          <Link href="/shop" className="btn-mg-green" style={{ display: 'inline-flex' }}>Shop Catalog</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#F7FBFD', padding: '40px 0', minHeight: '80vh' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 20px' }}>
        <h1 style={{ fontFamily: 'var(--font-outfit)', fontSize: '32px', fontWeight: '800', color: '#1a2332', marginBottom: '28px' }}>
          Shopping Cart
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', alignItems: 'start' }}>
          {/* Left Side: Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', gridColumn: 'span 2' }}>
            <div className="glass" style={{ borderRadius: '20px', padding: '24px', background: 'white' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {items.map((item, idx) => (
                  <div key={`${item.product}-${item.size}-${idx}`} style={{
                    display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap',
                    paddingBottom: idx < items.length - 1 ? '20px' : '0',
                    borderBottom: idx < items.length - 1 ? '1px solid #f1f5f9' : 'none',
                  }}>
                    {/* Image */}
                    <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0, borderRadius: '12px', overflow: 'hidden', background: '#F7FBFD', border: '1px solid #EAF8FF' }}>
                      <Image src={getImageUrl(item.image)} alt={item.name} fill sizes="80px" style={{ objectFit: 'contain', padding: '6px' }} />
                    </div>

                    {/* Name */}
                    <div style={{ flex: 2, minWidth: '180px' }}>
                      <div style={{ fontSize: '10px', fontWeight: '700', color: '#3BAE56', letterSpacing: '0.08em', marginBottom: '2px' }}>MAXGLOW</div>
                      <Link href={`/product/${item.product}`} style={{ textDecoration: 'none', fontFamily: 'var(--font-outfit)', fontSize: '15px', fontWeight: '700', color: '#1a2332', lineHeight: '1.4' }}>
                        {item.name}
                      </Link>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Size: {item.size}</div>
                    </div>

                    {/* Price */}
                    <div style={{ flex: 1, minWidth: '80px', textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '2px' }}>Price</div>
                      <div style={{ fontWeight: '700', fontSize: '15px', color: '#1a2332' }}>₹{item.price}</div>
                    </div>

                    {/* Quantity controls */}
                    <div style={{ flex: 1, minWidth: '110px', display: 'flex', justifyContent: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', height: '36px' }}>
                        <button onClick={() => handleQuantityChange(item, item.quantity - 1)}
                          style={{ padding: '0 10px', height: '100%', background: 'transparent', border: 'none', cursor: 'pointer', color: '#374151', display: 'flex', alignItems: 'center' }}>
                          <FiMinus size={12} />
                        </button>
                        <span style={{ padding: '0 8px', fontWeight: '700', fontSize: '13px', color: '#1a2332', minWidth: '24px', textAlign: 'center' }}>{item.quantity}</span>
                        <button onClick={() => handleQuantityChange(item, item.quantity + 1)}
                          disabled={item.quantity >= (item.maxStock || 100)}
                          style={{ padding: '0 10px', height: '100%', background: 'transparent', border: 'none', cursor: 'pointer', color: '#374151', display: 'flex', alignItems: 'center' }}>
                          <FiPlus size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div style={{ flex: 1, minWidth: '80px', textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '2px' }}>Subtotal</div>
                      <div style={{ fontWeight: '800', fontSize: '16px', color: '#1a2332' }}>₹{item.price * item.quantity}</div>
                    </div>

                    {/* Trash */}
                    <button onClick={() => handleRemove(item)}
                      style={{ background: '#fff0f0', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FiTrash2 size={16} color="#ef4444" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side: Order Summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Coupon Card */}
            <div className="glass" style={{ borderRadius: '20px', padding: '24px', background: 'white' }}>
              <h3 style={{ fontFamily: 'var(--font-outfit)', fontSize: '16px', fontWeight: '700', color: '#1a2332', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiPercent /> Apply Coupon
              </h3>
              <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="mg-input"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  style={{ textTransform: 'uppercase', padding: '8px 12px' }}
                />
                <button type="submit" className="btn-mg-outline" style={{ padding: '8px 18px', fontSize: '13px' }}>Apply</button>
              </form>
              {couponError && <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '8px' }}>{couponError}</div>}
              {couponSuccess && <div style={{ fontSize: '12px', color: '#3BAE56', marginTop: '8px' }}>{couponSuccess}</div>}

              {couponCode && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', background: '#DDF7E3', padding: '8px 12px', borderRadius: '8px', border: '1px solid #BDEFCB' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#3BAE56' }}>Applied: {couponCode}</span>
                  <button type="button" onClick={() => {
                    setCouponInput('');
                    setCouponError('');
                    setCouponSuccess('');
                    dispatch(applyCouponCode({ code: '', discountPercentage: 0, applicableProducts: [], isCombo: false }));
                  }} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>Remove</button>
                </div>
              )}

              {isCombo && discount === 0 && couponCode && (
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '10px', fontSize: '11px', color: '#b45309', marginTop: '12px' }}>
                  <strong>Combo Incomplete!</strong> Add all required combo items to your cart to activate the {discountPercentage}% discount.
                </div>
              )}
            </div>

            {/* Price breakdown */}
            <div className="glass" style={{ borderRadius: '20px', padding: '24px', background: 'white' }}>
              <h3 style={{ fontFamily: 'var(--font-outfit)', fontSize: '18px', fontWeight: '700', color: '#1a2332', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                Order Summary
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                  <span>Subtotal</span>
                  <span style={{ fontWeight: '600', color: '#1a2332' }}>₹{subtotal}</span>
                </div>
                {discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#3BAE56' }}>
                    <span>Discount ({discountPercentage}%)</span>
                    <span style={{ fontWeight: '600' }}>-₹{discount}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                  <span>Shipping Fee</span>
                  <span style={{ fontWeight: '600', color: '#1a2332' }}>{shippingFee === 0 ? 'Free' : `₹${shippingFee}`}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                  <span>GST Tax (5% Incl.)</span>
                  <span style={{ fontWeight: '600', color: '#1a2332' }}>₹{tax}</span>
                </div>
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: '800', color: '#1a2332' }}>
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
              </div>
              <button onClick={handleCheckoutRedirect} className="btn-mg-green" style={{ width: '100%', justifyContent: 'center', fontSize: '15px', padding: '14px' }}>
                Proceed to Checkout <FiArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(CartPage);
