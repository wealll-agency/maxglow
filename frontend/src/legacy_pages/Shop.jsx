"use client";
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';


import Image from 'next/image';

import React, { useEffect, useState, Suspense } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '@/store/productsSlice';
import ProductCard from '@/components/ProductCard';


function ShopContent() {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  
  const { items: products, loading } = useSelector((state) => state.products);

  const keywordQuery = searchParams.get('keyword') || '';
  const categoryQuery = searchParams.get('category') || '';

  const [priceFrom, setPriceFrom] = useState('');
  const [priceTo, setPriceTo] = useState('');
  const [selectedStock, setSelectedStock] = useState('In Stock'); // Default to In Stock
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortBy, setSortBy] = useState('Best Selling');
  const [viewType, setViewType] = useState('grid');

  useEffect(() => {
    dispatch(fetchProducts({ limit: 100 }));
  }, [dispatch]);

  // Sync categoryQuery from URL to selectedCategory state
  useEffect(() => {
    if (categoryQuery) {
      setSelectedCategory(categoryQuery);
    }
  }, [categoryQuery]);

  // Filter products list
  const filteredProducts = products.filter(product => {
    // Price filter
    const finalPrice = product.discountedPrice !== undefined ? product.discountedPrice : product.price;

    if (priceFrom && finalPrice < parseFloat(priceFrom)) {
      return false;
    }
    if (priceTo && finalPrice > parseFloat(priceTo)) {
      return false;
    }

    // Availability (Stock) filter
    if (selectedStock === 'In Stock' && product.stock <= 0) {
      return false;
    }
    if (selectedStock === 'Out Of Stock' && product.stock > 0) {
      return false;
    }

    // Brand filter
    if (selectedBrand) {
      const matchBrand = (product.brand || '').toLowerCase().trim() === selectedBrand.toLowerCase().trim() ||
                         product.name.toLowerCase().includes(selectedBrand.toLowerCase());
      if (!matchBrand) return false;
    }

    // Discount filter
    if (selectedDiscount) {
      let reqDiscount = 0;
      if (selectedDiscount.includes('%')) {
        reqDiscount = parseFloat(selectedDiscount.replace(/[^0-9.]/g, ''));
      }
      if (product.discount < reqDiscount) {
        return false;
      }
    }

    // Category filter (selectedCategory state or categoryQuery URL parameter)
    const catFilter = selectedCategory || categoryQuery;
    if (catFilter) {
      const matchCategory = (product.category || '').toLowerCase().trim() === catFilter.toLowerCase().trim() ||
                            product.name.toLowerCase().includes(catFilter.toLowerCase());
      if (!matchCategory) return false;
    }

    // Keyword filter (search query)
    if (keywordQuery) {
      const matchKeyword = product.name.toLowerCase().includes(keywordQuery.toLowerCase()) ||
                           (product.category || '').toLowerCase().includes(keywordQuery.toLowerCase()) ||
                           (product.brand || '').toLowerCase().includes(keywordQuery.toLowerCase());
      if (!matchKeyword) return false;
    }

    return true;
  });

  // Sort products list
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const finalPriceA = a.discountedPrice !== undefined ? a.discountedPrice : a.price;
    const finalPriceB = b.discountedPrice !== undefined ? b.discountedPrice : b.price;

    if (sortBy === 'Price: Low to High') {
      return finalPriceA - finalPriceB;
    }
    if (sortBy === 'Price: High to Low') {
      return finalPriceB - finalPriceA;
    }
    if (sortBy === 'Newest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    // Default 'Best Selling' (Featured first)
    return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
  });

  return (
    <>
      <div className="marquee-wrapper">
        <marquee behavior="scroll" direction="left" scrollamount="5">
          || 🥜 MaxGlow Anmol Jumbo Nuts - Extra 10% OFF! 🥜 || 🎁 Nuts For Savings 🎁 || 🔥 PayDay Sale Is LIVE - Extra 15% OFF Sitewide! 🔥 ||
        </marquee>
      </div>

      {/* Shop Banner */}
      <section className="shop-banner">
        <div className="container">
          <div className="shop_banner_image" style={{ borderRadius: '15px', overflow: 'hidden', boxShadow: '0 8px 25px rgba(0,0,0,0.08)', margin: '15px 0' }}>
            {(() => {
               const cat = selectedCategory || categoryQuery;
               let bannerSrc = '/shop_banner.jpg';
               if (cat) {
                 const c = cat.toLowerCase().trim();
                 if (c.includes('skin care') || c.includes('face care')) bannerSrc = '/banner_skin_care.png';
                 else if (c.includes('hair care')) bannerSrc = '/banner_hair_care.png';
                 else if (c.includes('body care')) bannerSrc = '/banner_body_care.png';
                 else if (c.includes('wellness')) bannerSrc = '/banner_wellness.png';
               }
               return <Image src={bannerSrc} alt={`${cat || 'Shop'} Banner`} width={1920} height={400} priority={true} style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover', maxHeight: '400px' }} />;
            })()}
          </div>
        </div>
      </section>

      {/* Breadcrumb and Description */}
      <div className="container py-3">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb mb-2" style={{ fontSize: '13px' }}>
            <li className="breadcrumb-item"><Link href="/" className="text-muted">Home</Link></li>
            <li className="breadcrumb-item active text-dark fw-bold" aria-current="page">Shop</li>
          </ol>
        </nav>
        <p className="mb-4" style={{ fontSize: '14px', color: '#555' }}>
          MaxGlow <strong>GLOW UP SALE is Live!</strong> ✨ Get up to <strong>60% Off + Extra 15% Off</strong> on premium Skincare & Wellness. Shop now for healthy skin!
        </p>
      </div>

      <div className="container pb-5">
        <div className="row">
          {/* Sidebar Filters */}
          <div className="col-lg-3 d-none d-lg-block">
            <div className="shop-sidebar-filter card border-0 shadow-sm rounded-0 p-4 mb-4">
              <div className="filter-header d-flex justify-content-between align-items-center mb-1">
                <h5 className="fw-bold m-0 text-dark" style={{ fontSize: '16px' }}>Filter By</h5>
                {(priceFrom || priceTo || selectedStock || selectedBrand || selectedDiscount || selectedCategory) && (
                  <button 
                    onClick={() => {
                      setPriceFrom('');
                      setPriceTo('');
                      setSelectedStock(null);
                      setSelectedBrand(null);
                      setSelectedDiscount(null);
                      setSelectedCategory(null);
                      router.push('/shop'); // Reset URL queries too
                    }}
                    className="btn btn-link text-decoration-none p-0 text-danger fs-8 fw-semibold"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Price Filter */}
              <div className="filter-section border-top py-3">
                <div className="d-flex justify-content-between align-items-center filter-toggle" data-bs-toggle="collapse" data-bs-target="#priceFilter">
                  <span className="fw-bold" style={{ fontSize: '14px' }}>Price</span>
                  <i className="fas fa-minus small"></i>
                </div>
                <div id="priceFilter" className="collapse show mt-3">
                  <div className="from-to-inputs d-flex align-items-center gap-2">
                    <div className="input-group input-group-sm border rounded">
                      <span className="input-group-text bg-white border-0 text-muted">₹</span>
                      <input 
                        type="number" 
                        className="form-control border-0 px-1" 
                        value={priceFrom}
                        onChange={(e) => setPriceFrom(e.target.value)}
                      />
                    </div>
                    <div className="input-group input-group-sm border rounded">
                      <span className="input-group-text bg-white border-0 text-muted">₹</span>
                      <input 
                        type="number" 
                        className="form-control border-0 px-1" 
                        value={priceTo}
                        onChange={(e) => setPriceTo(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Availability Filter */}
              <div className="filter-section border-top py-3">
                <div className="d-flex justify-content-between align-items-center filter-toggle collapse-indicator" data-bs-toggle="collapse" data-bs-target="#stockFilter">
                  <span className="fw-bold" style={{ fontSize: '14px' }}>Availability</span>
                  <i className="fas fa-minus small"></i>
                </div>
                <div id="stockFilter" className="collapse show mt-3">
                  <div className="d-flex flex-wrap gap-2">
                    <button 
                      onClick={() => setSelectedStock(selectedStock === 'In Stock' ? null : 'In Stock')}
                      className={`filter-pill-btn ${selectedStock === 'In Stock' ? 'active' : ''}`}
                    >
                      In Stock
                    </button>
                    <button 
                      onClick={() => setSelectedStock(selectedStock === 'Out Of Stock' ? null : 'Out Of Stock')}
                      className={`filter-pill-btn ${selectedStock === 'Out Of Stock' ? 'active' : ''}`}
                    >
                      Out Of Stock
                    </button>
                  </div>
                </div>
              </div>

              {/* Brand Filter */}
              <div className="filter-section border-top py-3">
                <div className="d-flex justify-content-between align-items-center filter-toggle collapse-indicator" data-bs-toggle="collapse" data-bs-target="#brandFilter">
                  <span className="fw-bold" style={{ fontSize: '14px' }}>Brand</span>
                  <i className="fas fa-minus small"></i>
                </div>
                <div id="brandFilter" className="collapse show mt-3">
                  <div className="d-flex flex-wrap gap-2">
                    {['MaxGlow', 'MaxGlow ANMOL', 'MaxGlow SNACKRITE'].map((brand) => (
                      <button
                        key={brand}
                        onClick={() => setSelectedBrand(selectedBrand === brand ? null : brand)}
                        className="filter-tag-btn"
                        style={selectedBrand === brand ? { backgroundColor: 'var(--primary-color)', color: '#fff', borderColor: 'var(--primary-color)' } : {}}
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Discount Filter */}
              <div className="filter-section border-top py-3">
                <div className="d-flex justify-content-between align-items-center filter-toggle collapse-indicator" data-bs-toggle="collapse" data-bs-target="#discountFilter">
                  <span className="fw-bold" style={{ fontSize: '14px' }}>Discount</span>
                  <i className="fas fa-minus small"></i>
                </div>
                <div id="discountFilter" className="collapse show mt-3">
                  <div className="discount-grid">
                    {['10% Off', '30% Off', '50% Off'].map((disc) => (
                      <button
                        key={disc}
                        onClick={() => setSelectedDiscount(selectedDiscount === disc ? null : disc)}
                        className="filter-tag-btn"
                        style={selectedDiscount === disc ? { backgroundColor: 'var(--primary-color)', color: '#fff', borderColor: 'var(--primary-color)' } : {}}
                      >
                        {disc}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Shop By Category */}
              <div className="filter-section border-top py-3">
                <div className="d-flex justify-content-between align-items-center filter-toggle" data-bs-toggle="collapse" data-bs-target="#shopCatFilter">
                  <span className="fw-bold">Shop By Category</span>
                  <i className="fas fa-minus"></i>
                </div>
                <div id="shopCatFilter" className="collapse show mt-3">
                  <div className="discount-grid">
                    {['Almond', 'Cashew', 'Dates', 'Makhana', 'Spices'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                        className="filter-tag-btn"
                        style={selectedCategory === cat ? { backgroundColor: 'var(--primary-color)', color: '#fff', borderColor: 'var(--primary-color)' } : {}}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-9">
            {/* Minimal View Bar */}
            <div className="view-tools-bar mb-4">
              <div className="d-none d-lg-flex align-items-center">
                <button 
                  onClick={() => setViewType('grid')}
                  className={`view-btn ${viewType === 'grid' ? 'active' : ''}`}
                >
                  <i className="fas fa-th-large me-1"></i> Grid View
                </button>
                <div className="vr mx-3" style={{ height: '20px', opacity: 0.2 }}></div>
                <button 
                  onClick={() => setViewType('list')}
                  className={`view-btn ${viewType === 'list' ? 'active' : ''}`}
                >
                  <i className="fas fa-list me-1"></i> List View
                </button>
              </div>

              <div className="sort-select-wrapper d-none d-lg-block">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="form-select form-select-sm border-dark rounded-pill px-3" 
                  style={{ width: '175px' }}
                >
                  <option>Best Selling</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest</option>
                </select>
              </div>
            </div>

            <div className={viewType === 'grid' ? "row row-cols-2 row-cols-lg-3 g-2 g-lg-4" : "row g-3"} id="shopProductGrid">
              {loading ? (
                // Loading placeholders
                Array(6).fill(0).map((_, idx) => (
                  <div className="col" key={idx}>
                    <div className="placeholder-glow">
                      <div className="placeholder bg-light w-100 rounded mb-2" style={{ height: '260px' }}></div>
                      <div className="placeholder bg-light col-8 mb-1"></div>
                      <div className="placeholder bg-light col-4"></div>
                    </div>
                  </div>
                ))
              ) : sortedProducts && sortedProducts.length > 0 ? (
                sortedProducts.map((product) => {
                  const finalPrice = product.discountedPrice !== undefined ? product.discountedPrice : product.price;
                  return viewType === 'grid' ? (
                    <div className="col" key={product._id}>
                      <ProductCard product={product} />
                    </div>
                  ) : (
                    <div className="col-12" key={product._id}>
                      <div className="card border-0 shadow-sm p-3 rounded-3" style={{ border: '1px solid #eee' }}>
                        <div className="row g-0 align-items-center">
                          <div className="col-4 col-md-3 text-center position-relative" style={{ height: '130px' }}>
                            <Image 
                              src={product.images?.[0] || product.image || '/placeholder.png'} 
                              className="img-fluid rounded" 
                              alt={product.name} 
                              fill
                              sizes="(max-width: 768px) 33vw, 25vw"
                              style={{ objectFit: 'contain' }} 
                            />
                          </div>
                          <div className="col-8 col-md-9 ps-3 ps-md-4">
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <span className="badge bg-light text-dark border mb-1">{product.brand || 'MaxGlow'}</span>
                                <h5 className="fw-bold text-dark mb-1">{product.name}</h5>
                                <p className="text-muted fs-7 mb-2 text-truncate-2" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.description}</p>
                              </div>
                              {product.discount > 0 && <span className="badge bg-danger">{product.discount}% OFF</span>}
                            </div>
                            <div className="d-flex align-items-center gap-2 mb-3">
                              <span className="fw-bold fs-5 text-success">₹{finalPrice}</span>
                              {product.discount > 0 && (
                                <span className="text-muted text-decoration-line-through fs-7">₹{product.price}</span>
                              )}
                            </div>
                            <Link href={`/shop-details?id=${product._id}`} className="btn btn-sm btn-brand px-4 text-white">
                              View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-12 py-5 text-center w-100">
                  <h4 className="fw-bold mb-2">No Products Found</h4>
                  <p className="text-muted">There are no products to display matching your criteria.</p>
                </div>
              )}
            </div>
            
            {/* Pagination */}
            <div className="pagination-wrapper d-flex justify-content-center mt-5 mb-5">
              <nav>
                <ul className="pagination custom-maroon-pagination">
                  <li className="page-item active text-white"><a className="page-link bg-transparent text-white" href="#">1</a></li>
                </ul>
              </nav>
            </div>

          </div>
        </div>
      </div>
      
      {/* People Are Also Looking For Section */}
      <section className="tags-section bg-white py-5">
        <div className="container py-3">
          <h3 className="mb-4 text-start" style={{ fontSize: '24px', color: '#333' }}>People Are Also Looking For</h3>
          <div className="d-flex flex-wrap gap-2">
            <Link href="/shop?keyword=Cashew" className="search-tag-pill">Cashew Royale</Link>
            <Link href="/shop?keyword=Cashew" className="search-tag-pill">Cashew Premium</Link>
            <Link href="/shop?keyword=Almond" className="search-tag-pill">Almond American</Link>
            <Link href="/shop?keyword=Walnut" className="search-tag-pill">Walnut Royale</Link>
            <Link href="/shop?keyword=Dates" className="search-tag-pill">Dates Royale</Link>
          </div>
        </div>
      </section>
    </>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="container py-5 text-center">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading shop...</span>
        </div>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
