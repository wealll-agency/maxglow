'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createOrder } from '../../store/ordersSlice.js';
import { clearCart, addToCart, applyCouponCode } from '../../store/cartSlice.js';
import api from '../../utils/axiosConfig.js';
import { addAddress } from '../../store/authSlice.js';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, CreditCard, ShoppingBag, Plus } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { user } = useSelector((state) => state.auth);
  const { items, couponCode, subtotal, discount, tax, shippingFee, total, isCombo, applicableProducts, discountPercentage } = useSelector((state) => state.cart);
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
    const [paymentMode, setPaymentMode] = useState('CCAvenue');
  const [hasCodPermission, setHasCodPermission] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!hasCodPermission && paymentMode === 'COD') {
      setPaymentMode('CCAvenue');
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
            setPaymentMode(state.paymentMode || 'CCAvenue');

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
    if (!isMounted) return;
    // Redirect if cart is empty
    if (items.length === 0) {
      router.push('/shop');
    }
  }, [items, router, isMounted]);

  if (!isMounted || items.length === 0) {
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
      // 1. Create order on backend (returns local order and CCAvenue payload)
      const orderResult = await dispatch(createOrder(orderData)).unwrap();
      const { encRequest, accessCode } = orderResult;
      
      // If COD, skip CCAvenue redirection and go to user profile
      if (paymentMode === 'COD' || !encRequest) {
        // Clear cart for COD immediately
        dispatch(clearCart());
        showAlert('Order placed successfully via Cash on Delivery!', 'success');
        router.push('/user/profile');
        return;
      }

      // 2. Redirect to CCAvenue via POST
      const form = document.createElement('form');
      form.method = 'POST';
      
      const ccavenueEnv = process.env.NEXT_PUBLIC_CCAVENUE_ENV || 'production';
      form.action = ccavenueEnv.toLowerCase() === 'test' || ccavenueEnv.toLowerCase() === 'sandbox'
        ? 'https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction'
        : 'https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction';
      
      const encInput = document.createElement('input');
      encInput.type = 'hidden';
      encInput.name = 'encRequest';
      encInput.value = encRequest;
      form.appendChild(encInput);
      
      const accessInput = document.createElement('input');
      accessInput.type = 'hidden';
      accessInput.name = 'access_code';
      accessInput.value = accessCode;
      form.appendChild(accessInput);
      
      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      showAlert(err || 'Failed to place order', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    
    if (!couponInput.trim()) {
      setCouponError('Please enter a coupon code.');
      return;
    }

    try {
      const response = await api.post(`/coupons/apply`, { code: couponInput.trim() });
      
      const applicableProducts = response.data.applicableProducts || [];

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

  const handleAddRecommended = (product) => {
    dispatch(addToCart({
      product,
      quantity: 1,
      size: product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'Standard'
    }));
  };

  return (
    <div className="container py-5 animate-fade-in">
      <h1 className="fw-bold mb-4 display-font">Secure Checkout</h1>

      <div className="row g-5">
        
        {/* Left Side: Delivery Address + Payment method */}
        <div className="col-lg-7">
          
          {/* Address Section */}
          <div className="bg-white p-4 rounded-4 shadow-sm border mb-4">
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <MapPin size={20} color="var(--primary-color)" /> Shipping Address
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
                    className={`p-3 rounded border cursor-pointer d-flex justify-content-between align-items-start ${selectedAddressIndex === idx ? 'border-success bg-light' : ''}`}
                    style={{ cursor: 'pointer' }}
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
                className="btn btn-brand-outline btn-sm d-flex align-items-center gap-1 mt-3"
              >
                <Plus size={16} /> {(user?.addresses?.length > 0) || (address && city) ? 'Add / Change Address' : 'Add Shipping Address'}
              </button>
            ) : (
              <form onSubmit={handleAddAddressSubmit} className="mt-3 border-top pt-3">
                <h6 className="fw-bold mb-3">Add a new address</h6>
                
                <div className="row g-2 mb-2">
                  <div className="col-md-6">
                    <label className="form-label mb-1 fs-7 fw-semibold">Full Name*</label>
                    <input
                      type="text"
                      required
                      className="form-control form-control-brand py-2 fs-7"
                      value={addrName}
                      onChange={(e) => setAddrName(e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label mb-1 fs-7 fw-semibold">Phone Number*</label>
                    <input
                      type="tel"
                      required
                      className="form-control form-control-brand py-2 fs-7"
                      value={addrPhone}
                      onChange={(e) => setAddrPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="row g-2 mb-2">
                  <div className="col-md-6">
                    <label className="form-label mb-1 fs-7 fw-semibold">Pincode*</label>
                    <input
                      type="text"
                      required
                      className="form-control form-control-brand py-2 fs-7"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label mb-1 fs-7 fw-semibold">Locality / Area*</label>
                    <input
                      type="text"
                      required
                      className="form-control form-control-brand py-2 fs-7"
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mb-2">
                  <label className="form-label mb-1 fs-7 fw-semibold">Street Address / House No.*</label>
                  <textarea
                    required
                    className="form-control form-control-brand py-2 fs-7"
                    rows="2"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  ></textarea>
                </div>

                <div className="row g-2 mb-2">
                  <div className="col-md-6">
                    <label className="form-label mb-1 fs-7 fw-semibold">City / District*</label>
                    <input
                      type="text"
                      required
                      className="form-control form-control-brand py-2 fs-7"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label mb-1 fs-7 fw-semibold">State*</label>
                    <input
                      type="text"
                      required
                      className="form-control form-control-brand py-2 fs-7"
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-md-6">
                    <label className="form-label mb-1 fs-7 fw-semibold">Landmark (Optional)</label>
                    <input
                      type="text"
                      className="form-control form-control-brand py-2 fs-7"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label mb-1 fs-7 fw-semibold">Alternate Phone (Optional)</label>
                    <input
                      type="tel"
                      className="form-control form-control-brand py-2 fs-7"
                      value={altPhone}
                      onChange={(e) => setAltPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mb-3 d-flex gap-3 align-items-center">
                  <span className="fs-7 fw-medium text-muted">Address Type</span>
                  <div className="form-check">
                    <input className="form-check-input" type="radio" name="addressType" id="homeTypeCheckout" value="Home" checked={addressType === 'Home'} onChange={(e) => setAddressType(e.target.value)} />
                    <label className="form-check-label fs-7" htmlFor="homeTypeCheckout">Home</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="radio" name="addressType" id="workTypeCheckout" value="Work" checked={addressType === 'Work'} onChange={(e) => setAddressType(e.target.value)} />
                    <label className="form-check-label fs-7" htmlFor="workTypeCheckout">Work</label>
                  </div>
                </div>

                {addressError && <div className="alert alert-danger p-2 fs-8 mb-2">{addressError}</div>}

                <div className="d-flex gap-2 mt-2">
                  <button type="submit" className="btn btn-brand btn-sm py-2 px-4">Save Address</button>
                  <button 
                    type="button" 
                    onClick={() => setShowNewAddressForm(false)} 
                    className="btn btn-light btn-sm py-2 px-4 border"
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
          </div>

          {/* Payment Card selection */}
          <div className="bg-white p-4 rounded-4 shadow-sm border">
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <CreditCard size={20} color="var(--primary-color)" /> Payment Method
            </h5>
            <div className="d-flex flex-column gap-3">
              <div 
                className={`p-3 rounded border cursor-pointer d-flex align-items-center gap-3 ${paymentMode === 'CCAvenue' ? 'border-success bg-light' : ''}`}
                onClick={() => setPaymentMode('CCAvenue')}
                style={{ cursor: 'pointer' }}
              >
                <input type="radio" checked={paymentMode === 'CCAvenue'} readOnly className="form-check-input mt-0" />
                <div>
                  <h6 className="fw-bold m-0 text-dark">CCAvenue Secure Payment</h6>
                  <small className="text-muted">Pay securely using Cards, Net Banking, UPI, or Wallets.</small>
                </div>
              </div>
              {hasCodPermission && (
                <div 
                  className={`p-3 rounded border cursor-pointer d-flex align-items-center gap-3 ${paymentMode === 'COD' ? 'border-success bg-light' : ''}`}
                  onClick={() => setPaymentMode('COD')}
                  style={{ cursor: 'pointer' }}
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
        </div>

        {/* Right Side: Order summary review */}
        <div className="col-lg-5">
          <div className="glass-card p-4">
            <h4 className="fw-bold mb-3 display-font text-dark border-bottom pb-2">Review Order</h4>

            {/* Small recap list */}
            <div className="d-flex flex-column gap-3 mb-4" style={{ maxHeight: '220px', overflowY: 'auto' }}>
              {items.map(item => (
                <div key={`${item.product}-${item.size}`} className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <ShoppingBag size={18} className="text-muted" />
                    <div>
                      <span className="fw-semibold text-dark fs-7 d-block text-truncate" style={{ maxWidth: '180px' }}>{item.name}</span>
                      <small className="text-muted fs-8">Qty: {item.quantity} | Size: {item.size}</small>
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
                <button type="submit" className="btn btn-sm btn-brand px-3">Apply</button>
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
                <span>GST Tax (5%)</span>
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

            <button
              onClick={handlePlaceOrder}
              disabled={loading || isSubmitting || (user && user.addresses?.length === 0) || (!user && (!address || !city))}
              className="btn btn-brand w-100 py-3 mt-4 fw-bold fs-6 d-flex align-items-center justify-content-center gap-2"
            >
              {(loading || isSubmitting) ? 'Processing Order...' : 'Pay Now'}
            </button>
          </div>

          {/* Cross-Sell Recommendations */}
          {recommendedProducts.length > 0 && (
            <div className="mt-4 pt-3 border-top">
              <h5 className="fw-bold mb-3 fs-6 d-flex align-items-center gap-2">
                <ShoppingBag size={16} /> You May Also Like
              </h5>
              <div className="row g-3">
                {recommendedProducts.map(product => {
                  const activePrice = product.price;

                  let imageSrc = '/placeholder.png';
                  if (product.images && product.images.length > 0) {
                    imageSrc = product.images[0].replace('/assets/images/', '/');
                  } else if (product.image) {
                    imageSrc = product.image.replace('/assets/images/', '/');
                  }

                  return (
                    <div key={product._id} className="col-6 col-md-4">
                      <div className="p-2 bg-white border rounded shadow-sm h-100 d-flex flex-column align-items-center text-center">
                        <div style={{ width: '100%', aspectRatio: '1/1', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#f8f9fa', marginBottom: '8px', position: 'relative' }}>
                          <Image 
                            src={imageSrc} 
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            style={{ objectFit: 'cover' }}
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/60?text=No+Image'; }}
                          />
                        </div>
                        <h6 className="fw-semibold fs-8 mb-1 text-truncate w-100" title={product.name}>{product.name}</h6>
                        <div className="mb-2">
                          <span className="fw-bold fs-7 text-dark">₹{activePrice}</span>
                          {product.discount > 0 && (
                            <span className="text-muted text-decoration-line-through fs-8 ms-1">₹{product.purchasePrice || product.price}</span>
                          )}
                        </div>
                        <button 
                          onClick={() => handleAddRecommended(product)}
                          className="btn btn-outline-brand btn-sm w-100 mt-auto"
                          style={{ borderRadius: '20px', fontSize: '12px' }}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
