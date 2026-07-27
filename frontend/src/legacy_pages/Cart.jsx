"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';


import Image from 'next/image';




import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, updateCartQuantity, applyCouponCode, recalculateCart } from '@/store/cartSlice';
import api from '@/utils/axiosConfig';
import { Trash2, ShoppingBag, Plus, Minus, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { items, couponCode, subtotal, discount, tax, shippingFee, total, discountPercentage, isCombo, applicableProducts } = useSelector(
    (state) => state.cart
  );
  const { user } = useSelector((state) => state.auth);

  const [couponInput, setCouponInput] = useState(couponCode);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  useEffect(() => {
    dispatch(recalculateCart());
  }, [dispatch, items]);

  const handleQuantityChange = (product, size, qty, maxStock) => {
    const parsedQty = Math.max(1, Math.min(maxStock, qty));
    dispatch(updateCartQuantity({ product, size, quantity: parsedQty }));
  };

  const handleRemove = (product, size) => {
    dispatch(removeFromCart({ product, size }));
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
      
      const response = await api.post(`/coupons/apply`, { code: couponInput.trim() });
      
      const applicableProducts = response.data.applicableProducts || [];

      // If the coupon has specific products, check if the cart contains at least one
      if (applicableProducts.length > 0) {
        const hasEligibleItem = items.some(item => applicableProducts.includes(item.product));
        if (!hasEligibleItem && !response.data.isCombo) {
          setCouponError('This coupon is not valid for any items in your cart.');
          dispatch(applyCouponCode({ code: '', discountPercentage: 0, applicableProducts: [], isCombo: false }));
          return;
        }
      }

      dispatch(applyCouponCode({
        code: response.data.code,
        discountPercentage: response.data.discountPercentage,
        applicableProducts: applicableProducts,
        isCombo: response.data.isCombo
      }));

      setCouponSuccess(`Coupon "${response.data.code}" applied! ${response.data.discountPercentage}% Discount.`);
    } catch (error) {
      setCouponError(error.response?.data?.message || 'Failed to apply coupon');
      dispatch(applyCouponCode({ code: '', discountPercentage: 0, applicableProducts: [], isCombo: false }));
    }
  };

  const handleCheckoutRedirect = () => {
    if (!user) {
      router.push('/login?redirect=checkout');
    } else {
      router.push('/checkout');
    }
  };

  if (items.length === 0) {
    return (
      <div className="container py-5 text-center animate-fade-in">
        <div className="glass-card bg-white p-5 max-w-lg mx-auto">
          <i className="fas fa-shopping-bag fa-3x text-muted mb-3 d-block"></i>
          <h2 className="fw-bold mb-2" style={{ color: '#203d74' }}>Your Cart is Empty</h2>
          <p className="text-muted mb-4">Discover our high-quality herbal products and start shopping.</p>
          <Link href="/shop" className="btn btn-brand">Shop Catalog</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h1 className="fw-bold mb-4" style={{ color: '#203d74' }}>Shopping Cart</h1>

      <div className="row g-4">
        
        {/* Left Side: Cart Items Table */}
        <div className="col-lg-8">
          <div className="bg-white p-4 rounded-4 shadow-sm border overflow-auto">
            <table className="table table-borderless align-middle m-0" style={{ minWidth: '600px' }}>
              <thead>
                <tr className="border-bottom text-muted fs-7">
                  <th>Product</th>
                  <th className="text-center">Price</th>
                  <th className="text-center">Quantity</th>
                  <th className="text-center">Subtotal</th>
                  <th className="text-center">Remove</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={`${item.product}-${item.size}`} className="border-bottom">
                    <td className="py-3">
                      <div className="d-flex align-items-center gap-3">
                        <Image
                          src={item.image?.startsWith('http') ? item.image : (item.image ? `${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'https://www.maxglowon.com'}${item.image}` : 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=100')}
                          alt={item.name}
                          width={60}
                          height={60}
                          className="rounded object-fit-cover"
                        />
                        <div>
                          <Link href={`/shop-details?name=${encodeURIComponent(item.name)}`} className="fw-bold text-dark text-decoration-none hover-green">
                            {item.name}
                          </Link>
                          <span className="d-block text-muted fs-8">Size: {item.size}</span>
                        </div>
                      </div>
                    </td>
                    
                    <td className="text-center fw-medium">₹{item.price}</td>
                    
                    <td className="text-center">
                      <div className="d-inline-flex align-items-center border rounded bg-white p-1">
                        <button
                          onClick={() => handleQuantityChange(item.product, item.size, item.quantity - 1, item.maxStock)}
                          className="btn btn-sm border-0 px-1 py-0"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-2 fw-semibold fs-7" style={{ minWidth: '24px' }}>{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.product, item.size, item.quantity + 1, item.maxStock)}
                          className="btn btn-sm border-0 px-1 py-0"
                          disabled={item.quantity >= item.maxStock}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </td>
                    
                    <td className="text-center fw-bold">₹{item.price * item.quantity}</td>
                    
                    <td className="text-center">
                      <button
                        onClick={() => handleRemove(item.product, item.size)}
                        className="btn btn-sm btn-link text-danger border-0 p-0"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Price Breakdown Card */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-0 p-4 mb-4">
            <h5 className="fw-bold mb-3 text-dark">Apply Coupon</h5>
            <form onSubmit={handleApplyCoupon} className="d-flex gap-2 mb-2">
              <input 
                type="text" 
                className="form-control" 
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
              />
              <button type="submit" className="btn btn-dark">Apply</button>
            </form>
            {couponError && <div className="text-danger fs-8 mt-1">{couponError}</div>}
            {couponSuccess && <div className="text-success fs-8 mt-1">{couponSuccess}</div>}
            
            {couponCode && (
              <div className="d-flex justify-content-between align-items-center mt-3 bg-light p-2 rounded border">
                <span className="fw-semibold text-success fs-7">Code: {couponCode}</span>
                <button type="button" className="btn btn-sm text-danger p-0" onClick={() => {
                  setCouponInput('');
                  setCouponError('');
                  setCouponSuccess('');
                  dispatch(applyCouponCode({ code: '', discountPercentage: 0, applicableProducts: [], isCombo: false }));
                }}>Remove</button>
              </div>
            )}

            {isCombo && discount === 0 && couponCode && (
              <div className="alert alert-warning py-2 px-3 mt-3 fs-8 mb-0">
                <i className="fas fa-exclamation-circle me-1"></i>
                <strong>Combo Incomplete!</strong> You must add all required combo products to your cart to activate the {discountPercentage}% discount.
              </div>
            )}
          </div>

          <div className="card border-0 shadow-sm rounded-0 p-4">
            <h4 className="fw-bold mb-4 text-dark border-bottom pb-2">Order Summary</h4>
            
            <div className="d-flex flex-column gap-3 fs-6">
              <div className="d-flex justify-content-between text-muted">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              
              {discount > 0 && (
                <div className="d-flex justify-content-between text-success">
                  <span>Discount ({discountPercentage}%)</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              
              <div className="d-flex justify-content-between text-muted">
                <span>Shipping Fee</span>
                <span>{shippingFee === 0 ? 'Free' : `₹${shippingFee}`}</span>
              </div>
              
              <div className="d-flex justify-content-between text-muted">
                <span>GST Tax (5%)</span>
                <span>₹{tax}</span>
              </div>
              
              <hr className="my-2" />
              
              <div className="d-flex justify-content-between fw-bold text-dark fs-5 mb-3">
                <span>Total</span>
                <span>₹{total}</span>
              </div>

              <button
                onClick={handleCheckoutRedirect}
                className="btn btn-brand w-100 py-3 d-flex align-items-center justify-content-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
