"use client";
import React, { useEffect, memo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import { toggleWishlist } from '../store/wishlistSlice';
import { fetchProducts } from '../store/productsSlice';
import { FiHeart, FiShoppingCart, FiZap, FiStar } from 'react-icons/fi';

const ProductCard = ({ product, isComboMode = false, isSelected = false, onToggleSelect = null }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist?.items || []);
  const dbProducts = useSelector((state) => state.products?.items || []);

  // Dynamically load products if this is a static card with no ID
  useEffect(() => {
    const isValidId = product._id && /^[0-9a-fA-F]{24}$/.test(product._id);
    if (!isValidId && dbProducts.length === 0) {
      dispatch(fetchProducts({ limit: 100 }));
    }
  }, [dispatch, product._id, dbProducts.length]);

  // Resolve matching DB product for static cards to get correct MongoDB _id
  const resolvedProduct = product._id && /^[0-9a-fA-F]{24}$/.test(product._id)
    ? product
    : dbProducts.find(p => {
        const pName = p.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
        const cardName = product.name.toLowerCase().replace(/\.\.\./g, '').replace(/[^a-zA-Z0-9]/g, '');
        return pName.includes(cardName) || cardName.includes(pName);
      }) || product;

  const productId = resolvedProduct._id || product.name;
  const isWishlisted = wishlistItems.some(i => i._id === productId);

  // Price calculation — unchanged logic
  let calculatedDiscountedPrice = resolvedProduct.price;
  if (resolvedProduct.discount > 0) {
    if (resolvedProduct.discountType === 'Percent') {
      calculatedDiscountedPrice = Math.round(resolvedProduct.price * (1 - resolvedProduct.discount / 100));
    } else {
      calculatedDiscountedPrice = Math.max(0, resolvedProduct.price - resolvedProduct.discount);
    }
  } else if (resolvedProduct.discountedPrice !== undefined) {
    calculatedDiscountedPrice = resolvedProduct.discountedPrice;
  }

  const discountLabel = resolvedProduct.discount > 0
    ? resolvedProduct.discountType === 'Flat'
      ? `₹${resolvedProduct.discount} OFF`
      : `${resolvedProduct.discount}% OFF`
    : null;

  // Wishlist handler — unchanged logic
  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(toggleWishlist({
      _id: productId,
      name: resolvedProduct.name,
      price: parseInt(resolvedProduct.price.toString().replace(/,/g, '')),
      discount: parseInt(resolvedProduct.discount || 0),
      images: [resolvedProduct.image || (resolvedProduct.images && resolvedProduct.images[0]) || '/placeholder.png'],
      stock: resolvedProduct.stock || 100,
      category: resolvedProduct.category || 'Herbal'
    }));
  };

  // Add to cart handler — unchanged logic
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const finalPrice = calculatedDiscountedPrice;
    dispatch(addToCart({
      product: {
        _id: productId,
        name: resolvedProduct.name,
        price: parseInt(finalPrice.toString().replace(/,/g, '')),
        discount: 0,
        images: [resolvedProduct.image || (resolvedProduct.images && resolvedProduct.images[0]) || '/placeholder.png'],
        stock: resolvedProduct.stock || 100
      },
      quantity: 1,
      size: resolvedProduct.unit || 'Default'
    }));
  };

  // Buy now handler — unchanged logic
  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const finalPrice = calculatedDiscountedPrice;
    dispatch(addToCart({
      product: {
        _id: productId,
        name: resolvedProduct.name,
        price: parseInt(finalPrice.toString().replace(/,/g, '')),
        discount: 0,
        images: [resolvedProduct.image || (resolvedProduct.images && resolvedProduct.images[0]) || '/placeholder.png'],
        stock: resolvedProduct.stock || 100
      },
      quantity: 1,
      size: resolvedProduct.unit || 'Default'
    }));
    router.push('/checkout');
  };

  const allImages = resolvedProduct.images && resolvedProduct.images.length > 0
    ? resolvedProduct.images
    : (resolvedProduct.image ? [resolvedProduct.image] : ['/placeholder.png']);

  const primaryImage = allImages[0]?.replace('/assets/images/', '/') || '/placeholder.png';
  const secondImage = allImages[1]?.replace('/assets/images/', '/') || primaryImage;

  return (
    <div className="mg-product-card" style={{ 
      height: '100%', 
      position: 'relative',
      border: isComboMode && isSelected ? '2px solid #1c72b9' : '2px solid transparent',
      borderRadius: '16px',
      boxShadow: isComboMode && isSelected ? '0 8px 24px rgba(28, 114, 185, 0.15)' : undefined
    }}>

      {isComboMode && isSelected && (
        <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 15, width: '28px', height: '28px', borderRadius: '50%', background: '#1c72b9', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
          <i className="fas fa-check" style={{ fontSize: '14px' }}></i>
        </div>
      )}
      {/* Image area */}
      <div className="mg-product-image-wrap" style={{ position: 'relative', aspectRatio: '1 / 1', width: '100%', overflow: 'hidden' }}>
        {/* Wishlist button */}
        <button
          onClick={handleToggleWishlist}
          style={{
            position: 'absolute', bottom: '12px', right: '12px', zIndex: 10,
            width: '34px', height: '34px', borderRadius: '50%',
            background: isWishlisted ? '#fff0f0' : 'rgba(255,255,255,0.9)',
            border: `1.5px solid ${isWishlisted ? '#fecaca' : 'rgba(221,244,255,0.8)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', backdropFilter: 'blur(8px)',
            transition: 'all 0.2s ease', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}
        >
          <FiHeart size={15} fill={isWishlisted ? '#ef4444' : 'none'} color={isWishlisted ? '#ef4444' : '#374151'} />
        </button>

        {/* Discount Badge */}
          {discountLabel && (
          <div className="mg-product-tag mg-tag-left" style={{
            position: 'absolute', top: '12px', left: '12px', zIndex: 10,
            background: 'linear-gradient(135deg, #3BAE56, #61C454)',
            color: 'white', fontSize: '11px', fontWeight: '800',
            padding: '4px 10px', borderRadius: '9999px',
            boxShadow: '0 2px 8px rgba(59,174,86,0.3)',
            letterSpacing: '0.03em',
          }}>
            {discountLabel}
          </div>
        )}

        {(() => {
          const rawTags = resolvedProduct.searchTags;
          const customTag = Array.isArray(rawTags) && rawTags.length > 0 && rawTags[0].trim() !== '' 
            ? rawTags[0] 
            : (typeof rawTags === 'string' && rawTags.trim() !== '' ? rawTags : null);
            
          if (customTag) {
            return (
              <div className="mg-product-tag mg-tag-right" style={{
                position: 'absolute', top: '12px', right: '12px', zIndex: 10,
                background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                color: 'white', fontSize: '11px', fontWeight: '800',
                padding: '4px 10px', borderRadius: '9999px',
                boxShadow: '0 2px 8px rgba(245,158,11,0.3)',
                letterSpacing: '0.03em',
                textTransform: 'uppercase'
              }}>
                {customTag}
              </div>
            );
          }
          return null;
        })()}

        {/* Out of stock overlay */}
        {resolvedProduct.stock <= 0 && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 8,
            background: 'rgba(248,250,252,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              background: '#ef4444', color: 'white', fontWeight: '700',
              fontSize: '12px', padding: '6px 16px', borderRadius: '9999px',
              boxShadow: '0 4px 12px rgba(239,68,68,0.3)', letterSpacing: '0.05em',
            }}>OUT OF STOCK</span>
          </div>
        )}

        {/* Product image */}
        <Link href={`/shop-details?name=${encodeURIComponent(resolvedProduct.name)}`} style={{ display: 'block', position: 'relative', height: '100%', width: '100%' }}>
          <Image
            src={primaryImage}
            alt={resolvedProduct.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            style={{ objectFit: 'cover' }}
          />
        </Link>
      </div>

      {/* Card Body */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Brand + Rating */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '10px', fontWeight: '700', color: '#3BAE56', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {resolvedProduct.brand || 'MaxGlow'}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <FiStar size={12} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#374151' }}>{resolvedProduct.rating || '4.8'}</span>
          </div>
        </div>

        {/* Product name */}
        <Link href={`/shop-details?name=${encodeURIComponent(resolvedProduct.name)}`} style={{ textDecoration: 'none', marginBottom: '10px' }}>
          <h3 style={{
            fontFamily: 'var(--font-outfit), sans-serif',
            fontSize: '14px', fontWeight: '600', color: '#1a2332',
            lineHeight: '1.4', margin: 0,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            overflow: 'hidden', minHeight: '40px',
          }} title={resolvedProduct.name}>
            {resolvedProduct.name}
          </h3>
        </Link>

        {/* Pricing */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <span style={{ fontFamily: 'var(--font-outfit)', fontSize: '18px', fontWeight: '800', color: '#1a2332' }}>
            ₹{calculatedDiscountedPrice}
          </span>
          {resolvedProduct.discount > 0 && (
            <del style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '400' }}>₹{resolvedProduct.price}</del>
          )}
          {(product.perGram || resolvedProduct.perGram) && (
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>({product.perGram || resolvedProduct.perGram})</span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="product-actions-container" style={{ marginTop: 'auto', display: 'flex', gap: '8px' }}>

          {isComboMode ? (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (resolvedProduct.stock > 0 && onToggleSelect) onToggleSelect(); }}
              disabled={resolvedProduct.stock <= 0}
              style={{
                flex: 1, padding: '10px 0', border: isSelected ? 'none' : '1.5px solid #1c72b9', cursor: resolvedProduct.stock > 0 ? 'pointer' : 'not-allowed',
                background: resolvedProduct.stock <= 0 ? '#64748b' : (isSelected ? '#1c72b9' : 'transparent'),
                color: resolvedProduct.stock <= 0 ? 'white' : (isSelected ? 'white' : '#1c72b9'),
                borderRadius: '9999px', fontSize: '13px', fontWeight: '700',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                transition: 'all 0.2s ease', letterSpacing: '0.03em', opacity: resolvedProduct.stock <= 0 ? 0.5 : 1
              }}
            >
              {resolvedProduct.stock <= 0 ? 'Out of Stock' : (isSelected ? 'Remove from Combo' : 'Select for Combo')}
            </button>
          ) : resolvedProduct.stock <= 0 ? (
            <Link
              href={`/shop-details?name=${encodeURIComponent(resolvedProduct.name)}`}
              className="mg-product-action-btn"
              style={{
                flex: 1, textAlign: 'center', padding: '10px 0',
                background: '#f1f5f9', color: '#64748b',
                borderRadius: '9999px', fontSize: '13px', fontWeight: '700',
                textDecoration: 'none', border: '1.5px solid #e2e8f0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              Notify Me
            </Link>
          ) : (
            <>
              <button
                onClick={handleAddToCart}
                className="mg-product-action-btn"
                style={{
                  flex: 1, padding: '10px 0', border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                  color: 'white', borderRadius: '9999px', fontSize: '11px', fontWeight: '800',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px',
                  transition: 'all 0.2s ease', letterSpacing: '0.01em',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                <FiShoppingCart size={13} /> CART
              </button>
              <button
                onClick={handleBuyNow}
                className="mg-product-action-btn"
                style={{
                  flex: 1, padding: '10px 0', border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg, #3BAE56 0%, #61C454 100%)',
                  color: 'white', borderRadius: '9999px', fontSize: '11px', fontWeight: '800',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px',
                  transition: 'all 0.2s ease', letterSpacing: '0.01em',
                  boxShadow: '0 4px 12px rgba(59,174,86,0.25)',
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 16px rgba(59,174,86,0.4)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(59,174,86,0.25)'}
              >
                <FiZap size={13} /> BUY NOW
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(ProductCard);
