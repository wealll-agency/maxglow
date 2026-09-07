'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createOrder } from '../../store/ordersSlice.js';
import { clearCart, addToCart, applyCouponCode, clearRemovedCouponNotice } from '../../store/cartSlice.js';
import api from '../../utils/axiosConfig.js';
import { addAddress } from '../../store/authSlice.js';
import Link from 'next/link';
import Image from 'next/image';
import { FaMapMarkerAlt, FaCreditCard, FaMoneyBillWave, FaShieldAlt } from 'react-icons/fa';
import { MapPin, CreditCard, ShoppingBag, Plus } from 'lucide-react';
import MgButton from '../../components/ui/MgButton';
import MgCard from '../../components/ui/MgCard';
import { useNotification } from '../../context/NotificationContext';
import { getImageUrl } from '../../utils/imageConfig';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { user } = useSelector((state) => state.auth);
  const { items, isHydrated, isCartSyncing, couponCode, subtotal, discount, tax, shippingFee, total, isCombo, applicableProducts, discountPercentage, removedCouponNotice } = useSelector((state) => state.cart);
  const { loading, error } = useSelector((state) => state.orders);
  const { showAlert } = useNotification();

  // Address selection states
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [addressError, setAddressError] = useState('');
  const [recommendedProducts, setRecommendedProducts] = useState([]);

  // Coupon states
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  useEffect(() => {
    if (removedCouponNotice) {
      setCouponError(removedCouponNotice);
      dispatch(clearRemovedCouponNotice());
    }
  }, [removedCouponNotice, dispatch]);

  // New Address Form fields
  const [addrName, setAddrName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [pincode, setPincode] = useState('');
  const [locality, setLocality] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [landmark, setLandmark] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [addressType, setAddressType] = useState('Home');
    const [paymentMode, setPaymentMode] = useState('Razorpay');
  const [hasCodPermission, setHasCodPermission] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!hasCodPermission && paymentMode === 'COD') {
      setPaymentMode('Razorpay');
    }
  }, [hasCodPermission, paymentMode]);

  useEffect(() => {
    setIsMounted(true);

    const fetchGlobalSettings = async () => {
      try {
        const res = await api.get(`/auth/settings?t=${Date.now()}`);
        if (res.data.success) {
          setHasCodPermission(res.data.settings.cod !== false);
        }
      } catch (err) {
        console.error('Failed to fetch system settings', err);
      }
    };
    fetchGlobalSettings();
    
    // Parse error from URL if redirected from CCAvenue failure
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('error')) {
        setPaymentError(params.get('error'));
      }
    }

    // Fetch recommended products
    const fetchRecommended = async () => {
      try {
        const res = await api.get(`/products`);
        if (res.data.success) {
          // Exclude products already in cart, get top 3
          const cartProductIds = items.map(item => item.product);
          const availableRecs = res.data.products
            .filter(p => !cartProductIds.includes(p._id) && p.stock > 0)
            .slice(0, 3);
          setRecommendedProducts(availableRecs);
        }
      } catch (err) {
        console.error('Failed to load recommendations', err);
      }
    };
    if (items.length > 0) {
      fetchRecommended();
    }
  }, [items]);

  // Restore Checkout State after login/registration
  useEffect(() => {
    if (user) {
      const pendingCheckoutStr = sessionStorage.getItem('pendingCheckout');
      if (pendingCheckoutStr) {
        try {
          const state = JSON.parse(pendingCheckoutStr);
          if (state.address && state.city) {
            setAddrName(state.addrName || '');
            setAddrPhone(state.addrPhone || '');
            setPincode(state.pincode || '');
            setLocality(state.locality || '');
            setAddress(state.address || '');
            setCity(state.city || '');
            setStateName(state.stateName || '');
            setLandmark(state.landmark || '');
            setAltPhone(state.altPhone || '');
            setAddressType(state.addressType || 'Home');
            setPaymentMode(state.paymentMode || 'Razorpay');

            // Automatically save this address to their profile
            dispatch(addAddress({ 
              name: state.addrName, phone: state.addrPhone, pincode: state.pincode, locality: state.locality, address: state.address, 
              city: state.city, state: state.stateName, landmark: state.landmark, alternatePhone: state.altPhone, addressType: state.addressType,
              isDefault: (!user.addresses || user.addresses.length === 0)
            })).unwrap().then((addresses) => {
              setSelectedAddressIndex(addresses.length - 1);
              setShowNewAddressForm(false);
            }).catch(err => console.error("Failed to restore checkout address", err));
          }
          sessionStorage.removeItem('pendingCheckout');
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [user, dispatch]);

  useEffect(() => {
    if (!isMounted || !isHydrated || isCartSyncing) return;
    // Redirect if cart is empty after hydration and API sync completes
    if (items.length === 0) {
      router.push('/shop');
    }
  }, [items, router, isMounted, isHydrated, isCartSyncing]);

  if (!isMounted || !isHydrated || isCartSyncing || items.length === 0) {
    return (
      <div className="container py-5 text-center d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-success mb-3" role="status">
          <span className="visually-hidden">Loading checkout...</span>
        </div>
        <p className="text-muted">Loading checkout details...</p>
      </div>
    );
  }

  const handleAddAddressSubmit = (e) => {
    e.preventDefault();
    if (!addrName || !addrPhone || !pincode || !locality || !address || !city || !stateName) {
      setAddressError('Please fill out all required address fields');
      return;
    }
    setAddressError('');
    
    if (!user) {
      // For guest users, just save locally for now. They will be asked to login upon payment.
      setShowNewAddressForm(false);
      return;
    }

    dispatch(addAddress({ 
      name: addrName, phone: addrPhone, pincode, locality, address, 
      city, state: stateName, landmark, alternatePhone: altPhone, addressType,
      isDefault: user.addresses.length === 0 
    }))
      .unwrap()
      .then((addresses) => {
        setShowNewAddressForm(false);
        setSelectedAddressIndex(addresses.length - 1);
        setAddrName(''); setAddrPhone(''); setPincode(''); setLocality('');
        setAddress(''); setCity(''); setStateName(''); setLandmark(''); setAltPhone('');
      })
      .catch((err) => {
        setAddressError(err || 'Failed to save address. Please try again.');
      });
  };

  const handlePlaceOrder = async () => {
    if (isSubmitting) return;
    if (!user) {
      const checkoutState = {
        addrName, addrPhone, pincode, locality, address, city, stateName, landmark, altPhone, addressType, paymentMode
      };
      sessionStorage.setItem('pendingCheckout', JSON.stringify(checkoutState));
      router.push('/login?redirect=checkout');
      return;
    }

    const addressObj = user.addresses ? user.addresses[selectedAddressIndex] : null;
    if (!addressObj) {
      showAlert('Please select or add a shipping address', 'warning');
      return;
    }

    const orderData = {
      items: items.map(i => ({ product: i.product, name: i.name, quantity: i.quantity, price: i.price })),
      deliveryAddress: {
        name: addressObj.name || user.name || 'Guest Customer',
        phone: addressObj.phone || user.phone || '9999999999',
        pincode: addressObj.pincode || addressObj.zipCode || '',
        locality: addressObj.locality || addressObj.street || addressObj.address || addressObj.city || '',
        address: addressObj.address || addressObj.street || addressObj.locality || '',
        city: addressObj.city || '',
        state: addressObj.state || '',
        landmark: addressObj.landmark || '',
        alternatePhone: addressObj.alternatePhone || addressObj.phone || user.phone || '',
        addressType: addressObj.addressType || 'Home'
      },
      couponCode: couponCode || undefined,
      paymentMode: paymentMode
    };

    setIsSubmitting(true);
    try {
      // 1. Create order on backend (returns local order and Razorpay payload)
      const orderResult = await dispatch(createOrder(orderData)).unwrap();
      
      // If COD, skip Razorpay redirection and go to user profile
      if (paymentMode === 'COD' || !orderResult.razorpayOrderId) {
        // Clear cart for COD immediately
        dispatch(clearCart());
        showAlert('Order placed successfully via Cash on Delivery!', 'success');
        router.push('/user/profile');
        return;
      }

      // 2. Load Razorpay SDK
      const res = await loadRazorpayScript();
      if (!res) {
        showAlert('Razorpay SDK failed to load. Check your connection.', 'error');
        setIsSubmitting(false);
        return;
      }

      // 3. Open Razorpay Modal
      const options = {
        key: orderResult.key,
        amount: orderResult.amount,
        currency: orderResult.currency,
        name: 'MaxGlow',
        description: 'Premium Herbal Wellness',
        order_id: orderResult.razorpayOrderId,
        handler: async function (response) {
          try {
            // Send verification request to backend
            const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/verify-payment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${user.token}`
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                order_id: orderResult.order._id
              })
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              dispatch(clearCart());
              showAlert('Payment successful! Order confirmed.', 'success');
              router.push(`/user/orders/${orderResult.order._id}?success=true`);
            } else {
              showAlert(verifyData.message || 'Payment verification failed', 'error');
              setIsSubmitting(false);
            }
          } catch (error) {
            showAlert('Payment verification error', 'error');
            setIsSubmitting(false);
          }
        },
        prefill: {
          name: addressObj.name || user.name || '',
          email: user.email || '',
          contact: addressObj.phone || user.phone || ''
        },
        theme: {
          color: '#1c72b9'
        },
        modal: {
          ondismiss: function() {
            showAlert('Payment cancelled', 'warning');
            setIsSubmitting(false);
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      showAlert(err || 'Failed to place order', 'error');
      setIsSubmitting(false);
    }
  };

  const handleApplyCoupon = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    
    if (!couponInput.trim()) {
      setCouponError('Please enter a coupon code.');
      return;
    }

    try {
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
      if (applicableProductsList.length > 0) {
        setCouponSuccess(`Coupon "${response.data.code}" applied! ${discText} Discount on eligible items.`);
      } else {
        setCouponSuccess(`Coupon "${response.data.code}" applied! ${discText} Storewide Discount.`);
      }
    } catch (error) {
      setCouponError(error.response?.data?.message || 'Failed to apply coupon');
      dispatch(applyCouponCode({ code: '', discountType: 'percentage', discountPercentage: 0, flatDiscountAmount: 0, applicableProducts: [], isCombo: false, minOrderValue: 0 }));
    }
  };

  const handleAddRecommended = (product) => {
    dispatch(addToCart({
      product,
      quantity: 1,
      size: product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'Standard'
    }));
  };

  const renderCrossSells = () => {
    if (!recommendedProducts || recommendedProducts.length === 0) return null;
    
    return (
      <div className="mt-4 pt-4 border-top">
        <h5 className="fw-bold mb-4 fs-5 d-flex align-items-center gap-2" style={{ color: '#1a2332' }}>
          <div style={{ background: '#F7FBFD', padding: '8px', borderRadius: '10px' }}><ShoppingBag size={20} color="#4A90E2" /></div>
          You May Also Like
        </h5>
        <div className="row g-4">
          {recommendedProducts.map(product => {
            const activePrice = product.price;
            let imageSrc = getImageUrl(product.images?.[0] || product.image);
            
            return (
              <div key={product._id} className="col-6 col-md-4">
                <div className="p-3 bg-white border rounded-4 shadow-sm h-100 d-flex flex-column align-items-center text-center transition-all" style={{ border: '1px solid #e2e8f0' }}>
                  <div style={{ width: '100%', aspectRatio: '1/1', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#f8f9fa', marginBottom: '12px', position: 'relative' }}>
                    <Image 
                      src={imageSrc} 
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      style={{ objectFit: 'cover' }}
                      onError={(e) => { e.currentTarget.src = '/placeholder.png'; }}
                    />
                  </div>
                  <h6 className="fw-semibold fs-7 mb-2 text-truncate w-100" title={product.name}>{product.name}</h6>
                  <div className="mb-3">
                    <span className="fw-bold fs-6 text-dark">₹{activePrice}</span>
                    {product.discount > 0 && (
                      <span className="text-muted text-decoration-line-through fs-8 ms-2">₹{product.purchasePrice || product.price}</span>
                    )}
                  </div>
                  <button 
                    onClick={() => handleAddRecommended(product)}
                    className="btn btn-outline-brand btn-sm w-100 mt-auto fw-bold"
                    style={{ borderRadius: '9999px', fontSize: '13px', padding: '8px' }}
                  >
                    Add to Order
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
    <div className="container py-5">
      <style>{`
        .checkout-box {
          background: #ffffff;
          border-radius: 20px;
          border: 1px solid rgba(226, 232, 240, 0.8);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0,0,0,0.02);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .checkout-box:hover {
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.05), 0 3px 6px rgba(0,0,0,0.03);
          transform: translateY(-2px);
        }
        .glass-box {
          background: linear-gradient(145deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7));
          backdrop-filter: blur(12px);
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.6);
          box-shadow: 0 15px 40px rgba(0,0,0,0.04);
        }
        .form-check-input:checked {
          background-color: #3BAE56;
          border-color: #3BAE56;
        }
          @media (max-width: 768px) {
            .container.py-5 {
              padding-top: 1.5rem !important;
              padding-bottom: 95px !important;
            }
          h4.fw-bold, h5.fw-bold {
            font-size: 15px !important;
            margin-bottom: 12px !important;
            gap: 8px !important;
          }
          h4.fw-bold div, h5.fw-bold div {
            padding: 6px !important;
            border-radius: 8px !important;
          }
          .mobile-sticky-checkout-btn-wrapper {
            display: none;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: #ffffff;
            border-top: 1px solid #e2e8f0;
            box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
            padding: 12px 16px;
            padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px));
            z-index: 1020;
            transform: translate3d(0, 0, 0);
            -webkit-transform: translate3d(0, 0, 0);
            will-change: transform;
            box-sizing: border-box;
          }
          @media (max-width: 768px) {
            .mobile-sticky-checkout-btn-wrapper {
              display: block !important;
            }
          }
          .mobile-sticky-checkout-btn-wrapper button {
            margin-top: 0 !important;
          }
          h4.fw-bold div svg, h5.fw-bold div svg {
            width: 16px !important;
            height: 16px !important;
          }
          .p-4.rounded-4, .rounded-4, .checkout-box {
            padding: 12px 16px !important;
            border-radius: 12px !important;
            margin-bottom: 10px !important;
          }
          h6.fw-bold {
            font-size: 13px !important;
          }
          span.badge {
            font-size: 10px !important;
            padding: 3px 8px !important;
          }
          small.text-muted {
            font-size: 11px !important;
            line-height: 1.3 !important;
          }
          .mg-input, .form-control {
            font-size: 12px !important;
            padding: 8px 12px !important;
            border-radius: 6px !important;
          }
          .btn-sm, .btn {
            font-size: 11px !important;
            padding: 6px 12px !important;
          }
          .glass-box {
            padding: 16px !important;
            border-radius: 16px !important;
          }
          .pe-2.custom-scrollbar .d-flex {
            gap: 12px !important;
          }
          .pe-2.custom-scrollbar .fw-bold.fs-7 {
            font-size: 12px !important;
          }
          .pe-2.custom-scrollbar small.fs-8 {
            font-size: 11px !important;
          }
          .pe-2.custom-scrollbar span.fw-bold.text-dark {
            font-size: 12px !important;
          }
          .d-flex.flex-column.gap-2.text-muted.border-top.pt-3.fs-7 {
            font-size: 12px !important;
            gap: 6px !important;
          }
          .d-flex.justify-content-between.text-dark.fw-bold.fs-5 {
            font-size: 15px !important;
          }
          .btn-mg-green.w-100.py-3 {
            padding-top: 12px !important;
            padding-bottom: 12px !important;
            font-size: 14px !important;
            border-radius: 10px !important;
            margin-top: 16px !important;
          }
        }
      `}</style>

      <div className="row g-5">
        
        {/* Left Side: Delivery Address + Payment method */}
        <div className="col-lg-7">
          
          {/* Address Section */}
          <div className="checkout-box p-4 mb-4 position-relative overflow-hidden">
            <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(59, 174, 86, 0.05) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%' }}></div>
            
            <h5 className="fw-bold mb-4 d-flex align-items-center gap-3" style={{ color: '#1a2332' }}>
              <div style={{ background: '#EAF8FF', padding: '10px', borderRadius: '12px', display: 'flex' }}><MapPin size={22} color="#4A90E2" /></div>
              Shipping Address
            </h5>

            {!user ? (
              <p className="text-muted fs-7">Please fill in your shipping details. You will be asked to login before payment.</p>
            ) : user.addresses?.length === 0 ? (
              <p className="text-muted fs-7">No shipping addresses saved yet. Please add a new shipping address below.</p>
            ) : (
              <div className="d-flex flex-column gap-3 mb-4">
                {user.addresses?.map((addr, idx) => (
                  <div 
                    key={addr._id || idx}
                    onClick={() => setSelectedAddressIndex(idx)}
                    className={`p-4 rounded-4 cursor-pointer d-flex justify-content-between align-items-start ${selectedAddressIndex === idx ? 'bg-white shadow-sm' : 'bg-light'}`}
                    style={{ border: selectedAddressIndex === idx ? '2px solid #3BAE56' : '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.2s ease' }}
                  >
                    <div>
                      <div className="d-flex align-items-center gap-3 mb-1">
                        <span className="fw-bold fs-6 text-dark">{addr.name || user.name}</span>
                        {(addr.phone || user.phone) && <span className="fw-bold fs-6 text-dark">{addr.phone || user.phone}</span>}
                        <span className="badge bg-light text-dark border fs-8 px-2 py-1">{addr.addressType || 'Home'}</span>
                      </div>
                      <p className="m-0 text-muted fs-7 lh-sm mt-1">
                        {addr.address || addr.street}
                        {addr.locality ? `, ${addr.locality}` : ''}<br />
                        {addr.city}, {addr.state} - <span className="fw-medium text-dark">{addr.pincode || addr.zipCode}</span>
                      </p>
                    </div>
                    {selectedAddressIndex === idx && <span className="badge bg-success">Selected</span>}
                  </div>
                ))}
              </div>
            )}

            {/* Form inline address */}
            {!showNewAddressForm ? (
              <button 
                onClick={() => setShowNewAddressForm(true)} 
                className="btn btn-brand-outline btn-sm d-flex align-items-center gap-2 mt-2 px-4 py-2"
                style={{ borderRadius: '9999px', fontWeight: '600' }}
              >
                <Plus size={18} /> {(user?.addresses?.length > 0) || (address && city) ? 'Add / Change Address' : 'Add Shipping Address'}
              </button>
            ) : (
              <form onSubmit={handleAddAddressSubmit} className="mt-3 pt-3 border-top">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div className="bg-mg-blue-50 p-1 rounded-circle text-primary" style={{ backgroundColor: 'var(--color-mg-blue-50)' }}>
                    <MapPin size={16} color="var(--color-mg-blue-500)" />
                  </div>
                  <h6 className="fw-bold mb-0 display-font" style={{ fontSize: '1rem' }}>Add New Address</h6>
                </div>
                
                <div className="row g-2 mb-2">
                  <div className="col-md-6">
                    <label className="mg-form-label" style={{ fontSize: '12px', marginBottom: '4px' }}>Full Name*</label>
                    <input
                      type="text"
                      required
                      className="mg-input"
                      style={{ padding: '8px 12px', fontSize: '13px', borderRadius: '0.5rem' }}
                      value={addrName}
                      onChange={(e) => setAddrName(e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="mg-form-label" style={{ fontSize: '12px', marginBottom: '4px' }}>Phone Number*</label>
                    <input
                      type="tel"
                      required
                      className="mg-input"
                      style={{ padding: '8px 12px', fontSize: '13px', borderRadius: '0.5rem' }}
                      value={addrPhone}
                      onChange={(e) => setAddrPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="row g-2 mb-2">
                  <div className="col-md-6">
                    <label className="mg-form-label" style={{ fontSize: '12px', marginBottom: '4px' }}>Pincode*</label>
                    <input
                      type="text"
                      required
                      className="mg-input"
                      style={{ padding: '8px 12px', fontSize: '13px', borderRadius: '0.5rem' }}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="mg-form-label" style={{ fontSize: '12px', marginBottom: '4px' }}>Locality / Area*</label>
                    <input
                      type="text"
                      required
                      className="mg-input"
                      style={{ padding: '8px 12px', fontSize: '13px', borderRadius: '0.5rem' }}
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mb-2">
                  <label className="mg-form-label" style={{ fontSize: '12px', marginBottom: '4px' }}>Street Address / House No.*</label>
                  <textarea
                    required
                    className="mg-input"
                    rows="2"
                    style={{ padding: '8px 12px', fontSize: '13px', borderRadius: '0.5rem' }}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  ></textarea>
                </div>

                <div className="row g-2 mb-2">
                  <div className="col-md-6">
                    <label className="mg-form-label" style={{ fontSize: '12px', marginBottom: '4px' }}>City / District*</label>
                    <input
                      type="text"
                      required
                      className="mg-input"
                      style={{ padding: '8px 12px', fontSize: '13px', borderRadius: '0.5rem' }}
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="mg-form-label" style={{ fontSize: '12px', marginBottom: '4px' }}>State*</label>
                    <input
                      type="text"
                      required
                      className="mg-input"
                      style={{ padding: '8px 12px', fontSize: '13px', borderRadius: '0.5rem' }}
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-md-6">
                    <label className="mg-form-label" style={{ fontSize: '12px', marginBottom: '4px' }}>Landmark (Optional)</label>
                    <input
                      type="text"
                      className="mg-input"
                      style={{ padding: '8px 12px', fontSize: '13px', borderRadius: '0.5rem' }}
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="mg-form-label" style={{ fontSize: '12px', marginBottom: '4px' }}>Alternate Phone (Optional)</label>
                    <input
                      type="tel"
                      className="mg-input"
                      style={{ padding: '8px 12px', fontSize: '13px', borderRadius: '0.5rem' }}
                      value={altPhone}
                      onChange={(e) => setAltPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mb-3 bg-light p-2 px-3 rounded-3 border">
                  <label className="mg-form-label" style={{ fontSize: '12px', marginBottom: '6px' }}>Address Type</label>
                  <div className="d-flex gap-4">
                    <label className="form-check m-0 d-flex align-items-center gap-2" style={{ cursor: 'pointer' }}>
                      <input className="form-check-input mt-0" type="radio" name="addressType" value="Home" checked={addressType === 'Home'} onChange={(e) => setAddressType(e.target.value)} style={{ transform: 'scale(0.9)' }} />
                      <span className="fs-8 fw-medium text-dark">Home</span>
                    </label>
                    <label className="form-check m-0 d-flex align-items-center gap-2" style={{ cursor: 'pointer' }}>
                      <input className="form-check-input mt-0" type="radio" name="addressType" value="Work" checked={addressType === 'Work'} onChange={(e) => setAddressType(e.target.value)} style={{ transform: 'scale(0.9)' }} />
                      <span className="fs-8 fw-medium text-dark">Work</span>
                    </label>
                  </div>
                </div>

                {addressError && <div className="alert alert-danger p-2 fs-8 mb-2">{addressError}</div>}

                <div className="d-flex gap-2 mt-1">
                  <button type="submit" className="btn-mg-primary flex-grow-1 justify-content-center" style={{ borderRadius: '0.5rem', padding: '8px 16px', fontSize: '14px' }}>Save Address</button>
                  <button 
                    type="button" 
                    onClick={() => setShowNewAddressForm(false)} 
                    className="btn btn-light border flex-grow-1 fw-bold"
                    style={{ borderRadius: '0.5rem', color: '#64748b', padding: '8px 16px', fontSize: '14px' }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Display locally saved guest address if filled */}
            {!user && address && city && !showNewAddressForm && (
              <div className="mt-3 p-3 rounded border border-success bg-light d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="fw-bold mb-1">Guest Details</h6>
                  <p className="m-0 text-muted fs-7">{address}, {city}</p>
                  <p className="m-0 text-muted fs-7">{stateName} - {pincode}</p>
                </div>
                <span className="badge bg-success">Ready for Checkout</span>
              </div>
            )}

            <hr className="my-4" style={{ borderColor: '#e2e8f0' }} />

            {/* Payment Card selection */}
            <h5 className="fw-bold mb-4 d-flex align-items-center gap-3" style={{ color: '#1a2332' }}>
              <div style={{ background: '#ecfdf5', padding: '10px', borderRadius: '12px', display: 'flex' }}><CreditCard size={22} color="#3BAE56" /></div>
              Payment Method
            </h5>
            <div className="d-flex flex-column gap-3 position-relative" style={{ zIndex: 1 }}>
              <div 
                className={`p-4 rounded-4 cursor-pointer d-flex align-items-center gap-3 ${paymentMode === 'Razorpay' ? 'bg-white shadow-sm' : 'bg-light'}`}
                onClick={() => setPaymentMode('Razorpay')}
                style={{ border: paymentMode === 'Razorpay' ? '2px solid #3BAE56' : '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.2s ease' }}
              >
                <input type="radio" checked={paymentMode === 'Razorpay'} readOnly className="form-check-input mt-0" />
                <div>
                  <h6 className="fw-bold m-0 text-dark">Razorpay Secure Payment</h6>
                  <small className="text-muted">Pay securely using Cards, Net Banking, UPI, or Wallets.</small>
                </div>
              </div>
              {hasCodPermission && (
                <div 
                  className={`p-4 rounded-4 cursor-pointer d-flex align-items-center gap-3 ${paymentMode === 'COD' ? 'bg-white shadow-sm' : 'bg-light'}`}
                  onClick={() => setPaymentMode('COD')}
                  style={{ border: paymentMode === 'COD' ? '2px solid #3BAE56' : '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.2s ease' }}
                >
                  <input type="radio" checked={paymentMode === 'COD'} readOnly className="form-check-input mt-0" />
                  <div>
                    <h6 className="fw-bold m-0 text-dark">Cash on Delivery (COD)</h6>
                    <small className="text-muted">Pay in cash when your order is delivered to your door.</small>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cross-Sell Recommendations for Desktop */}
          <div className="d-none d-lg-block">
            {renderCrossSells()}
          </div>

        </div>

        {/* Right Side: Order summary review */}
        <div className="col-lg-5 mt-4 mt-lg-0">
          <div className="glass-box p-4 sticky-lg-top" style={{ top: '24px', zIndex: 1 }}>
            <h4 className="fw-bold mb-4 display-font text-dark d-flex align-items-center gap-2">
              <ShoppingBag size={22} color="#4A90E2" /> Review Order
            </h4>

            {/* Small recap list */}
            <div className="d-flex flex-column gap-4 mb-4 pe-2 custom-scrollbar" style={{ maxHeight: '280px', overflowY: 'auto' }}>
              {items.map(item => (
                <div key={`${item.product}-${item.size}`} className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-3">
                    <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#F7FBFD', border: '1px solid #EAF8FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ShoppingBag size={20} className="text-muted opacity-50" />
                    </div>
                    <div>
                      <span className="fw-bold text-dark fs-7 d-block text-truncate" style={{ maxWidth: '180px', lineHeight: '1.2' }}>{item.name}</span>
                      <small className="text-muted fs-8" style={{ fontWeight: '500' }}>Qty: {item.quantity} | Size: {item.size}</small>
                    </div>
                  </div>
                  <span className="fw-bold fs-7 text-dark">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Coupon Entry */}
            <div className="mt-3 mb-4 border-top pt-3">
              <h6 className="fw-bold fs-7 mb-2 text-dark">Have a coupon?</h6>
              <form onSubmit={handleApplyCoupon} className="d-flex gap-2">
                <input
                  type="text"
                  className="form-control form-control-sm form-control-brand"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                />
                <button type="submit" className="btn-mg-green btn-sm px-3" style={{ borderRadius: '8px', padding: '6px 16px', fontSize: '12px' }}>Apply</button>
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

            <div className="d-flex flex-column gap-2 text-muted border-top pt-3 fs-7">
              <div className="d-flex justify-content-between">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              {discount > 0 && (
                <div className="d-flex justify-content-between text-success">
                  <span>Coupon Discount</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div className="d-flex justify-content-between">
                <span>Shipping Fee</span>
                <span>{shippingFee === 0 ? 'Free' : `₹${shippingFee}`}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>GST Tax (5% Incl.)</span>
                <span>₹{tax}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between text-dark fw-bold fs-5">
                <span>Total Amount</span>
                <span>₹{total}</span>
              </div>
            </div>

            {error && <div className="alert alert-danger p-2 fs-8 mt-3">{error}</div>}
            {paymentError && <div className="alert alert-danger p-2 fs-8 mt-3"><i className="fas fa-exclamation-triangle me-1"></i> {paymentError}</div>}

            <div className="d-none d-md-block">
              <button
                onClick={handlePlaceOrder}
                disabled={loading || isSubmitting || (user && user.addresses?.length === 0) || (!user && (!address || !city))}
                className="btn-mg-green w-100 py-3 mt-4 fw-bold fs-6 d-flex align-items-center justify-content-center gap-2"
                style={{ borderRadius: '14px', boxShadow: '0 8px 25px rgba(59, 174, 86, 0.3)', transition: 'all 0.3s ease', letterSpacing: '0.5px' }}
              >
                {(loading || isSubmitting) ? 'Processing Order...' : 'Pay Now'}
              </button>
            </div>
          </div>
        </div>

        {/* Cross-Sell Recommendations for Mobile */}
        <div className="col-12 d-lg-none">
          {renderCrossSells()}
        </div>

      </div>
    </div>
    
      {/* Mobile Sticky Checkout Bar */}
      <div className="mobile-sticky-checkout-btn-wrapper">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', width: '100%' }}>
          <div>
            <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Payable</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#1a2332', fontFamily: 'var(--font-outfit)', lineHeight: 1.1 }}>₹{total}</div>
          </div>
          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={loading || isSubmitting || (user && user.addresses?.length === 0) || (!user && (!address || !city))}
            className="btn-mg-green fw-bold fs-6 d-flex align-items-center justify-content-center gap-2"
            style={{
              flex: 1,
              borderRadius: '12px',
              boxShadow: '0 6px 20px rgba(59, 174, 86, 0.35)',
              padding: '12px 18px',
              fontSize: '15px',
              margin: 0
            }}
          >
            {(loading || isSubmitting) ? 'Processing Order...' : 'Pay Now'}
          </button>
        </div>
      </div>
    </>
  );
}
