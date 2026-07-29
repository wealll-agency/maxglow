"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';




import { useSelector, useDispatch } from 'react-redux';
import { toggleWishlist } from '@/store/wishlistSlice';
import { addToCart } from '@/store/cartSlice';


import { Heart, Trash2 } from 'lucide-react';
import ProductCard from '@/components/ProductCard';

export default function WishlistPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist.items);

  const handleAddToCart = (product) => {
    dispatch(addToCart({ product, quantity: 1, size: '100ml' }));
  };

  const handleBuyNow = (product) => {
    dispatch(addToCart({ product, quantity: 1, size: '100ml' }));
    router.push('/checkout');
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="container py-5 text-center animate-fade-in">
        <div className="glass-card bg-white p-5 max-w-lg mx-auto">
          <Heart size={56} className="text-muted mb-3 mx-auto" />
          <h2 className="fw-bold mb-2">Your Wishlist is Empty</h2>
          <p className="text-muted mb-4">Save products you like to purchase them later.</p>
          <Link href="/shop" className="btn btn-brand">Explore Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5 animate-fade-in">
      <h1 className="fw-bold mb-4 display-font">My Wishlist</h1>

      <div className="row g-4">
        {wishlistItems.map((product) => (
          <div key={product._id} className="col-sm-6 col-md-4 col-lg-3">
            <ProductCard 
              product={{
                ...product,
                image: product.images?.[0] || product.image,
                mrp: product.purchasePrice || product.price,
                brand: 'MaxGlow'
              }} 
            />
          </div>
        ))}
      </div>
    </div>
  );
}
