"use client";
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';


import Image from 'next/image';


import React, { useState, useEffect, Suspense } from 'react';


import { useDispatch, useSelector } from 'react-redux';
import { addToCart, clearCart } from '@/store/cartSlice';
import { fetchProducts, fetchProductDetails, fetchProductReviews, submitProductReview } from '@/store/productsSlice';
import { Star, MessageCircle, Heart, Plus, Minus } from 'lucide-react';
import { toggleWishlist } from '@/store/wishlistSlice';
import api from '@/utils/axiosConfig';
import { useNotification } from '@/context/NotificationContext';

function ShopDetailsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { showAlert } = useNotification();

  const { items: products, selectedProduct, reviews, reviewsLoading } = useSelector((state) => state.products);
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

  // 1. If we have productIdParam, dispatch fetch details and reviews
  useEffect(() => {
    if (productIdParam) {
      dispatch(fetchProductDetails(productIdParam));
      dispatch(fetchProductReviews(productIdParam));
    } else {
      // Fetch public list to match by name
      dispatch(fetchProducts({ limit: 100 }));
    }
  }, [dispatch, productIdParam]);

  // 2. Resolve the real product: either the fetched selectedProduct (if id param) or matched from list (if name param)
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

  // 3. If matched by name, dispatch its reviews
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
    return (
      <div className="container py-5 text-center d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-success mb-3" role="status">
          <span className="visually-hidden">Loading product details...</span>
        </div>
        <p className="text-muted">Loading product details...</p>
      </div>
    );
  }

  const averageRating = reviews && reviews.length > 0 
    ? (reviews.reduce((acc, rev) => acc + (Number(rev.rating) || 0), 0) / reviews.length).toFixed(1) 
    : (realProduct.rating ? Number(realProduct.rating).toFixed(1) : '5.0');

  const handleAddToCart = () => {
    const mockProduct = {
      _id: realProduct._id,
      name: realProduct.name,
      price: finalPrice,
      discount: 0, // already applied
      image: realProduct.images?.[0] || '/top_product1.png',
      stock: realProduct.stock || 100
    };
    
    dispatch(addToCart({
      product: mockProduct,
      quantity,
      size: selectedPack || defaultPackName
    }));

    if (typeof window !== 'undefined' && window.bootstrap) {
      const offcanvas = document.getElementById('cartOffcanvas');
      if (offcanvas) {
        window.bootstrap.Offcanvas.getOrCreateInstance(offcanvas).show();
      }
    }
  };

  const handleBuyNow = () => {
    const mockProduct = {
      _id: realProduct._id,
      name: realProduct.name,
      price: finalPrice,
      discount: 0,
      image: realProduct.images?.[0] || '/top_product1.png',
      stock: realProduct.stock || 100
    };
    
    dispatch(clearCart());
    
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
    <div className="container py-4 mt-2 bg-white animate-fade-in">
      {/* Breadcrumb */}
      <nav className="mb-4" style={{ fontSize: '13px', color: '#666' }}>
        <Link href="/" style={{ textDecoration: 'none', color: '#666' }}>Home</Link> &gt; 
        <Link href="/shop" style={{ textDecoration: 'none', color: '#666' }}> Shop </Link> &gt; 
        <span style={{ color: '#333' }}>{realProduct.name}</span>
      </nav>

      <div className="row g-5 mb-5">
        {/* Left Side: Images */}
        <div className="col-lg-5">
          <div className="mb-3 position-relative text-center border rounded-2 p-4">
             {realProduct.isFeatured && <span className="badge bg-primary position-absolute top-0 start-0 m-3">PREMIUM</span>}
            <Image
              src={getImageUrl(images[activeImageIndex])}
              alt={realProduct.name}
              width={500}
              height={400}
              className="img-fluid object-fit-contain"
              style={{ maxHeight: '400px', width: '100%' }}
            />
          </div>
          
          <div className="d-flex justify-content-center gap-2 mb-4">
            {images.map((imgUrl, index) => (
              <div 
                key={index} 
                className={`border rounded p-1 cursor-pointer ${activeImageIndex === index ? 'border-primary border-2' : ''}`} 
                style={{ width: '60px', height: '60px' }}
                onClick={() => setActiveImageIndex(index)}
              >
                  <Image src={getImageUrl(imgUrl)} width={60} height={60} className="img-fluid h-100 object-fit-contain" alt={`Thumbnail ${index}`} />
              </div>
            ))}
          </div>

          <div className="d-flex justify-content-between text-center px-3 border-top pt-4">
             <div>
                <Image src="/icon_heart.png" alt="Healthy" width={30} height={30} className="mb-2" />
                <p style={{ fontSize: '11px', color: '#666' }}>100% Healthy</p>
             </div>
             <div>
                <Image src="/icon_gluten.png" alt="Gluten Free" width={30} height={30} className="mb-2" />
                <p style={{ fontSize: '11px', color: '#666' }}>Gluten Free</p>
             </div>
             <div>
                <Image src="/icon_nutrition.png" alt="Nutrition" width={30} height={30} className="mb-2" />
                <p style={{ fontSize: '11px', color: '#666' }}>Powerful Nutrition</p>
             </div>
             <div>
                <Image src="/icon_cholesterol.png" alt="Cholesterol" width={30} height={30} className="mb-2" />
                <p style={{ fontSize: '11px', color: '#666' }}>Cholesterol Free</p>
             </div>
          </div>
        </div>

        {/* Right Side: Details */}
        <div className="col-lg-7 ps-lg-5">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <h1 className="fw-bold mb-2" style={{ fontSize: '24px', color: '#333', maxWidth: '80%' }}>{realProduct.name}</h1>
            <i className="fas fa-share-alt" style={{ fontSize: '20px', cursor: 'pointer', color: '#666' }}></i>
          </div>
          
          <div className="d-flex align-items-center gap-2 mb-3 pb-3 border-bottom">
            <div className="d-flex text-warning">
              {[...Array(5).keys()].map(x => (
                <Star key={x} fill={x < Math.round(Number(averageRating)) ? "#F59E0B" : "none"} color="#F59E0B" size={14} />
              ))}
            </div>
            <span className="badge bg-success text-white">{averageRating}</span>
            <span className="text-muted" style={{ fontSize: '13px' }}>{reviews.length} reviews</span>
          </div>

          <div className="d-flex align-items-center gap-3 mb-1">
            <span className="fw-bold" style={{ fontSize: '32px', color: '#005B6E' }}>₹{finalPrice}</span>
            {realProduct.discount > 0 && (
              <>
                <span className="badge bg-danger">{realProduct.discount}% OFF</span>
              </>
            )}
          </div>
          <p className="text-muted mb-4" style={{ fontSize: '14px' }}>MRP: <del>₹{realProduct.price}</del> <span style={{ fontSize: '12px' }}>(MRP inclusive of all taxes)</span></p>

          <div className="row mb-4">
             <div className="col-md-3">
                 <p className="fw-bold mb-2" style={{ fontSize: '14px' }}>Quantity</p>
                 <div className="d-flex align-items-center border rounded justify-content-between p-1" style={{ width: '100px' }}>
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="btn btn-sm border-0"><Minus size={12} /></button>
                    <span className="fw-bold">{quantity}</span>
                    <button onClick={() => setQuantity(Math.min(realProduct.stock || 100, quantity + 1))} className="btn btn-sm border-0" disabled={quantity >= (realProduct.stock || 100)}><Plus size={12} /></button>
                 </div>
             </div>
              <div className="col-md-9">
                 <p className="fw-bold mb-2" style={{ fontSize: '14px' }}>Select Pack Size</p>
                 <div className="d-flex gap-3 flex-wrap">
                      <div onClick={() => setSelectedPack(defaultPackName)} className={`border rounded p-2 text-center cursor-pointer ${selectedPack === defaultPackName ? 'border-primary border-2' : ''}`} style={{ minWidth: '120px' }}>
                         <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{defaultPackName}</div>
                         <div style={{ fontSize: '12px', color: '#005B6E' }}>₹{realProduct.discountedPrice || realProduct.price}</div>
                      </div>
                      
                      {realProduct.packSizes && realProduct.packSizes.map((pack, i) => {
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
                           <div key={i} onClick={() => setSelectedPack(pName)} className={`border rounded p-2 text-center cursor-pointer ${selectedPack === pName ? 'border-primary border-2' : ''}`} style={{ minWidth: '120px' }}>
                             <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{pName}</div>
                             <div style={{ fontSize: '12px', color: '#005B6E' }}>₹{pPrice}</div>
                           </div>
                         );
                      })}
                 </div>
              </div>
          </div>

          <div className="d-flex gap-3 mb-4">
             {realProduct.stock <= 0 ? (
               <button onClick={handleNotifyMe} className="btn w-100 py-3 fw-bold" style={{ backgroundColor: '#6c757d', color: 'white' }} disabled={notifyLoading}>
                 {notifyLoading ? 'Subscribing...' : 'Notify Me When Available'}
               </button>
             ) : (
               <>
                 <button onClick={handleAddToCart} className="btn w-50 py-3 fw-bold" style={{ backgroundColor: '#005B6E', color: 'white' }}>
                   Add To Cart
                 </button>
                 <button onClick={handleBuyNow} className="btn btn-outline-dark w-50 py-3 fw-bold">Buy It Now</button>
               </>
             )}
             <button onClick={() => dispatch(toggleWishlist(realProduct))} className="btn btn-outline-dark px-3"><Heart size={20} fill={isInWishlist ? 'var(--accent-color)' : 'none'} color={isInWishlist ? 'var(--accent-color)' : 'currentColor'} /></button>
          </div>

          <div className="mb-4 pt-2">
             <div className="d-flex">
                <input type="text" className="form-control rounded-start rounded-0 py-2 border-dark" value={pincode} onChange={(e) => setPincode(e.target.value)} style={{ maxWidth: '250px' }} />
                <button className="btn btn-dark rounded-end rounded-0 px-4">Check Now</button>
             </div>
             <div className="d-flex align-items-center gap-3 mt-3">
                <div style={{ fontSize: '13px' }}><i className="fas fa-truck text-muted me-1"></i> Estimate Delivery Date</div>
                <div style={{ fontSize: '13px' }}><i className="fas fa-wallet text-muted me-1"></i> COD AVAILABLE</div>
             </div>
          </div>
        </div>
      </div>

      <div className="border-top pt-5 mb-5 text-center px-4" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div className="d-flex justify-content-center gap-5 border-bottom mb-4">
           {['description', 'ingredients', 'benefits', 'additional info', 'reviews'].map((tab) => (
             <button 
                key={tab} 
                className={`btn border-0 text-capitalize fw-bold pb-3 rounded-0 ${activeTab === tab ? 'border-bottom border-dark border-2' : 'text-muted'}`}
                onClick={() => setActiveTab(tab)}
                style={{ fontSize: '14px' }}
             >
                {tab === 'reviews' ? `Reviews (${reviews.length})` : tab}
             </button>
           ))}
        </div>
        
        {activeTab === 'description' && (
           <p className="text-muted" style={{ fontSize: '14px', lineHeight: '1.8' }}>
             {realProduct.description}
           </p>
        )}
        {activeTab === 'ingredients' && (
           <p className="text-muted" style={{ fontSize: '14px', lineHeight: '1.8' }}>
             {realProduct.ingredients?.length > 0 ? realProduct.ingredients.join(', ') : 'No ingredients specified.'}
           </p>
        )}
        {activeTab === 'benefits' && (
           <p className="text-muted" style={{ fontSize: '14px', lineHeight: '1.8' }}>
             {realProduct.benefits?.length > 0 ? realProduct.benefits.join(', ') : 'No benefits specified.'}
           </p>
        )}
        {activeTab === 'additional info' && (
           <div className="text-muted text-start px-3" style={{ fontSize: '14px', lineHeight: '1.8' }}>
             <ul className="list-unstyled">
                <li><strong>SKU:</strong> {realProduct.sku || 'N/A'}</li>
                <li><strong>Category:</strong> {realProduct.category || 'N/A'}</li>
                {realProduct.subCategory && <li><strong>Sub Category:</strong> {realProduct.subCategory}</li>}
                {realProduct.subSubCategory && <li><strong>Sub Sub Category:</strong> {realProduct.subSubCategory}</li>}
                {realProduct.brand && <li><strong>Brand:</strong> {realProduct.brand}</li>}
                <li><strong>Product Type:</strong> {realProduct.productType || 'Physical'}</li>
                {realProduct.batchNumber && <li><strong>Batch Number:</strong> {realProduct.batchNumber}</li>}
                {realProduct.expiryDate && <li><strong>Expiry Date:</strong> {new Date(realProduct.expiryDate).toLocaleDateString()}</li>}
             </ul>
           </div>
        )}
        {activeTab === 'reviews' && (
          <div className="text-start animate-fade-in">
            <div className="row g-4">
              
              {/* Reviews List */}
              <div className="col-lg-7">
                <h5 className="fw-bold mb-4">Customer Feedback</h5>
                
                {reviewsLoading ? (
                  <p className="text-muted">Loading reviews...</p>
                ) : reviews.length === 0 ? (
                  <p className="text-muted">No reviews yet for this product. Be the first to write a review!</p>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {reviews.map((rev) => (
                      <div key={rev._id} className="border-bottom pb-3">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <h6 className="fw-bold m-0">{rev.user?.name || 'Anonymous User'}</h6>
                          <small className="text-muted">{new Date(rev.createdAt).toLocaleDateString()}</small>
                        </div>
                        
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <div className="d-flex text-warning">
                            {[...Array(rev.rating).keys()].map(x => <Star key={x} fill="#F59E0B" color="#F59E0B" size={14} />)}
                          </div>
                          {rev.isVerifiedPurchase && (
                            <span className="badge bg-success-subtle text-success fs-8">Verified Purchase</span>
                          )}
                        </div>
                        <p className="text-muted m-0 fs-7">{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Write a Review Form */}
              <div className="col-lg-5">
                <div className="bg-light p-4 rounded-3 border">
                  <h5 className="fw-bold mb-3">Write a Review</h5>
                  
                  {user ? (
                    <form onSubmit={handleReviewSubmit}>
                      <div className="mb-3">
                        <label className="fw-medium mb-1">Rating</label>
                        <select 
                          className="form-select"
                          value={rating}
                          onChange={(e) => setRating(Number(e.target.value))}
                        >
                          <option value="5">5 Stars (Excellent)</option>
                          <option value="4">4 Stars (Good)</option>
                          <option value="3">3 Stars (Average)</option>
                          <option value="2">2 Stars (Poor)</option>
                          <option value="1">1 Star (Very Poor)</option>
                        </select>
                      </div>

                      <div className="mb-3">
                        <label className="fw-medium mb-1">Your Comment</label>
                        <textarea
                          rows="4"
                          className="form-control"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                        ></textarea>
                      </div>

                      {reviewError && <div className="alert alert-danger p-2 fs-7 mb-3">{reviewError}</div>}
                      {reviewSuccess && <div className="alert alert-success p-2 fs-7 mb-3">{reviewSuccess}</div>}

                      <button type="submit" className="btn btn-brand w-100 py-2" style={{ backgroundColor: '#005B6E', border: '1px solid #005B6E', color: 'white' }}>
                        Submit Review
                      </button>
                    </form>
                  ) : (
                    <div className="text-center py-3">
                      <MessageCircle className="text-muted mb-2" size={32} />
                      <p className="text-muted fs-7 mb-3">You must be logged in to review products.</p>
                      <Link href="/login" className="btn btn-brand btn-sm">Log In</Link>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ShopDetailsPage() {
  return (
    <Suspense fallback={<div className="container py-5 text-center">Loading product details...</div>}>
      <ShopDetailsContent />
    </Suspense>
  );
}
