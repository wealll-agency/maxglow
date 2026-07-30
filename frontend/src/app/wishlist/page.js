"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleWishlist } from '../../store/wishlistSlice';
import { addToCart } from '../../store/cartSlice';
import { FiHeart, FiTrash2 } from 'react-icons/fi';

import ProductCard from '../../components/ProductCard';

export default function WishlistPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist.items || []);

  if (wishlistItems.length === 0) {
    return (
      <div style={{ background: '#F7FBFD', padding: '80px 20px', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass" style={{ borderRadius: '24px', padding: '40px 24px', maxWidth: '480px', width: '100%', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', background: '#fff0f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <FiHeart size={36} color="#ef4444" fill="#ef4444" />
          </div>
          <h2 style={{ fontFamily: 'var(--font-outfit)', fontSize: '22px', fontWeight: '800', color: '#1a2332', marginBottom: '8px' }}>Your Wishlist is Empty</h2>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>Save items you love here to easily find and purchase them later.</p>
          <Link href="/shop" className="btn-mg-green" style={{ display: 'inline-flex' }}>Explore Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#F7FBFD', padding: '40px 0', minHeight: '60vh' }}>
      <style>{`
        .shop-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 20px;
        }
        @media (max-width: 576px) {
          .shop-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
        }
      `}</style>
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 20px' }}>
        <h1 style={{ fontFamily: 'var(--font-outfit)', fontSize: '32px', fontWeight: '800', color: '#1a2332', marginBottom: '28px' }}>
          My Wishlist
        </h1>

        <div className="shop-grid">
          {wishlistItems.map((product) => (
            <ProductCard 
              key={product._id}
              product={{
                ...product,
                image: product.images?.[0] || product.image,
                mrp: product.purchasePrice || product.price,
                brand: 'MaxGlow'
              }} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}
