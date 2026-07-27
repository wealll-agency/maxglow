"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import React, { memo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart, removeFromCart } from '../store/cartSlice';
import { FiShoppingBag, FiX, FiTrash2, FiPlus, FiMinus, FiArrowRight } from 'react-icons/fi';
import { Leaf } from 'lucide-react';

const CartOffcanvas = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { items, subtotal, discount, total } = useSelector((state) => state.cart);

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

  const freeShippingThreshold = 999;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - total);
  const progressPercent = Math.min((total / freeShippingThreshold) * 100, 100);
  const totalMrp = subtotal + discount;

  const getImageUrl = (img) => {
    if (!img) return '/top_product1.png';
    if (img.startsWith('http') || img.startsWith('/')) return img;
    const base = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : '';
    return `${base}${img}`;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', zIndex: 9998 }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="mg-cart-drawer" style={{ animation: 'slideInRight 0.3s cubic-bezier(0.4,0,0.2,1)' }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px', borderBottom: '1px solid #f1f5f9',
          background: 'linear-gradient(135deg, #EAF8FF 0%, #DDF7E3 100%)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #4A90E2, #3BAE56)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiShoppingBag size={18} color="white" />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-outfit)', fontSize: '16px', fontWeight: '700', color: '#1a2332' }}>My Cart</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>{items.length} item{items.length !== 1 ? 's' : ''}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <FiX size={16} color="#374151" />
          </button>
        </div>

        {/* Free Shipping Bar */}
        <div style={{ padding: '12px 20px', background: 'white', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: remainingForFreeShipping === 0 ? '#3BAE56' : '#374151', marginBottom: '8px' }}>
            {remainingForFreeShipping === 0
              ? '🎉 You\'ve unlocked FREE SHIPPING!'
              : <>Add <span style={{ color: '#4A90E2' }}>₹{remainingForFreeShipping}</span> more for Free Shipping</>
            }
          </div>
          <div style={{ background: '#EAF8FF', borderRadius: '9999px', height: '6px', overflow: 'hidden' }}>
            <div style={{
              width: `${progressPercent}%`, height: '100%',
              background: 'linear-gradient(90deg, #4A90E2, #3BAE56)',
              borderRadius: '9999px', transition: 'width 0.5s ease',
            }} />
          </div>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ width: '80px', height: '80px', background: '#EAF8FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <FiShoppingBag size={32} color="#4A90E2" />
              </div>
              <div style={{ fontFamily: 'var(--font-outfit)', fontSize: '16px', fontWeight: '700', color: '#1a2332', marginBottom: '8px' }}>Your cart is empty</div>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>Discover our premium herbal products!</p>
              <Link href="/shop" onClick={onClose} className="btn-mg-green" style={{ fontSize: '14px', padding: '10px 24px', display: 'inline-flex' }}>
                <Leaf size={16} /> Shop Now
              </Link>
            </div>
          ) : (
            items.map((item, idx) => (
              <div key={`${item.product}-${item.size}-${idx}`} style={{
                background: 'white', borderRadius: '12px', padding: '14px',
                marginBottom: '10px', border: '1px solid rgba(221,244,255,0.8)',
                boxShadow: '0 2px 8px rgba(74,144,226,0.06)',
                display: 'flex', gap: '12px', alignItems: 'flex-start',
              }}>
                {/* Image */}
                <div style={{ width: '64px', height: '64px', flexShrink: 0, borderRadius: '10px', overflow: 'hidden', background: '#F7FBFD', border: '1px solid #EAF8FF' }}>
                  <Image src={getImageUrl(item.image)} alt={item.name} width={64} height={64} style={{ objectFit: 'contain', width: '100%', height: '100%' }} />
                </div>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '10px', fontWeight: '700', color: '#3BAE56', letterSpacing: '0.08em', marginBottom: '2px' }}>MAXGLOW</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#1a2332', lineHeight: '1.3', marginBottom: '4px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{item.name}</div>
                  {item.size && item.size !== 'Default' && (
                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>{item.size}</div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {/* Qty controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0', border: '1.5px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                      <button onClick={() => handleDecrement({ _id: item.product, price: item.price, name: item.name, images: [item.image], stock: item.maxStock }, item.size)}
                        style={{ padding: '5px 10px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#374151', display: 'flex', alignItems: 'center' }}>
                        <FiMinus size={12} />
                      </button>
                      <span style={{ padding: '5px 8px', fontWeight: '700', fontSize: '13px', color: '#1a2332', minWidth: '24px', textAlign: 'center' }}>{item.quantity}</span>
                      <button onClick={() => handleIncrement({ _id: item.product, price: item.price, name: item.name, images: [item.image], stock: item.maxStock }, item.size)}
                        style={{ padding: '5px 10px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#374151', display: 'flex', alignItems: 'center' }}>
                        <FiPlus size={12} />
                      </button>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: '800', fontSize: '15px', color: '#1a2332' }}>₹{(item.price * item.quantity).toFixed(0)}</div>
                    </div>
                  </div>
                </div>

                {/* Remove */}
                <button onClick={() => handleRemove(item.product, item.size)}
                  style={{ background: '#fff0f0', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FiTrash2 size={14} color="#ef4444" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: '16px', background: 'white', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748b', marginBottom: '6px' }}>
              <span>MRP Total</span>
              <span>₹{totalMrp.toFixed(0)}</span>
            </div>
            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#3BAE56', marginBottom: '6px' }}>
                <span>Offer Discount</span>
                <span>-₹{discount.toFixed(0)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '800', color: '#1a2332', marginBottom: '14px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
              <span>Sub-Total</span>
              <span>₹{total.toFixed(0)}</span>
            </div>
            <button
              className="btn-mg-green"
              style={{ width: '100%', justifyContent: 'center', fontSize: '15px', padding: '14px' }}
              onClick={() => { onClose(); router.push('/checkout'); }}
            >
              Proceed to Checkout <FiArrowRight size={16} />
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default memo(CartOffcanvas);
