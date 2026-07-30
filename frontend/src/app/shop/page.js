"use client";
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import React, { useEffect, useState, Suspense, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../store/productsSlice';
import ProductCard from '../../components/ProductCard';
import { FiGrid, FiList, FiChevronDown, FiFilter, FiX } from 'react-icons/fi';
import { Leaf } from 'lucide-react';

function ShopContent() {
  const dispatch = useDispatch();
  const router = useRouter();
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
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

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

  const clearAllFilters = () => {
    setPriceFrom('');
    setPriceTo('');
    setSelectedStock(null);
    setSelectedBrand(null);
    setSelectedDiscount(null);
    setSelectedCategory(null);
    router.push('/shop');
  };

  const isAnyFilterActive = priceFrom || priceTo || selectedStock || selectedBrand || selectedDiscount || selectedCategory;

  const [customCategoryBanner, setCustomCategoryBanner] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/auth/settings');
        if (res.data.success && res.data.settings?.media_category_banner) {
          if (res.data.settings.media_category_banner.trim() !== '') {
            setCustomCategoryBanner(res.data.settings.media_category_banner);
          }
        }
      } catch (err) {}
    };
    fetchSettings();
  }, []);

  return (
    <>
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
      {/* Shop Banner */}
      {(() => {
        const cat = selectedCategory || categoryQuery;
        let bgImg = '/trending_banner.png';
        let title = 'MaxGlow Herbal Shop';
        let desc = 'Explore our curated range of premium natural wellness products. Clean formulas, botanical actives, and natural care.';
        
        if (cat) {
          const c = cat.toLowerCase().trim();
          if (c.includes('skin') || c.includes('face')) {
            bgImg = '/banner_skin_care.png';
            title = 'Premium Skin Care';
            desc = 'Reveal your natural glow with our deeply nourishing, botanical-rich face care formulations.';
          } else if (c.includes('hair')) {
            bgImg = '/banner_hair_care.png';
            title = 'Luxury Hair Care';
            desc = 'Transform your hair with our salon-quality, natural herbal blends for strength and shine.';
          } else if (c.includes('body')) {
            bgImg = '/banner_body_care.png';
            title = 'Nourishing Body Care';
            desc = 'Indulge in our luxurious spa-grade body lotions and scrubs for smooth, radiant skin.';
          } else if (c.includes('wellness')) {
            bgImg = '/banner_wellness.png';
            title = 'Holistic Wellness';
            desc = 'Find your balance with our peaceful aromatherapy and natural wellness essentials.';
          } else {
            title = `${cat} Products`;
          }
        }

        if (customCategoryBanner) {
          bgImg = customCategoryBanner;
        }

        return (
          <section style={{
            position: 'relative',
            overflow: 'hidden',
            minHeight: '220px',
            display: 'flex',
            alignItems: 'center',
            backgroundImage: `url("${bgImg}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: '24px',
            margin: '20px auto 0',
            maxWidth: '1400px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)'
          }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.8) 45%, rgba(255, 255, 255, 0.1) 100%)',
              zIndex: 1,
            }} />
            <div style={{ maxWidth: '1440px', margin: '0', padding: '40px 40px', width: '100%', position: 'relative', zIndex: 2 }}>
              <nav style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px', fontWeight: '500' }}>
                <Link href="/" style={{ textDecoration: 'none', color: '#64748b' }}>Home</Link> &gt; 
                <span style={{ color: '#1a2332', fontWeight: '700', marginLeft: '6px' }}>Shop</span>
                {cat && <span style={{ color: '#1a2332', fontWeight: '700', marginLeft: '6px' }}>&gt; {cat}</span>}
              </nav>
              <h1 style={{ fontFamily: 'var(--font-outfit)', fontSize: '42px', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>
                {title}
              </h1>
              <p style={{ fontSize: '16px', color: '#334155', marginTop: '12px', maxWidth: '500px', fontWeight: '500', lineHeight: '1.6' }}>
                {desc}
              </p>
            </div>
          </section>
        );
      })()}

      {/* Main Grid */}
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>

          {/* Desktop Sidebar Filters */}
          <aside style={{ width: '280px', flexShrink: 0, display: 'none', position: 'sticky', top: '90px' }} className="show-desktop-aside">
            <div className="glass" style={{ borderRadius: '20px', padding: '24px', border: '1px solid rgba(221,244,255,0.8)', boxShadow: '0 4px 20px rgba(74,144,226,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontFamily: 'var(--font-outfit)', fontSize: '16px', fontWeight: '700', color: '#1a2332', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FiFilter /> Filter By
                </h3>
                {isAnyFilterActive && (
                  <button onClick={clearAllFilters} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
                    Clear All
                  </button>
                )}
              </div>

              {/* Price Filter */}
              <div style={{ borderTop: '1.5px solid #f1f5f9', padding: '16px 0' }}>
                <h4 style={{ fontFamily: 'var(--font-outfit)', fontSize: '14px', fontWeight: '700', color: '#1a2332', marginBottom: '12px' }}>Price Range</h4>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: '#94a3b8' }}>₹</span>
                    <input
                      type="number"
                      placeholder="Min"
                      className="mg-input"
                      value={priceFrom}
                      onChange={(e) => setPriceFrom(e.target.value)}
                      style={{ paddingLeft: '22px', paddingTop: '8px', paddingBottom: '8px', borderRadius: '8px' }}
                    />
                  </div>
                  <span style={{ color: '#94a3b8', fontSize: '12px' }}>to</span>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: '#94a3b8' }}>₹</span>
                    <input
                      type="number"
                      placeholder="Max"
                      className="mg-input"
                      value={priceTo}
                      onChange={(e) => setPriceTo(e.target.value)}
                      style={{ paddingLeft: '22px', paddingTop: '8px', paddingBottom: '8px', borderRadius: '8px' }}
                    />
                  </div>
                </div>
              </div>

              {/* Availability */}
              <div style={{ borderTop: '1.5px solid #f1f5f9', padding: '16px 0' }}>
                <h4 style={{ fontFamily: 'var(--font-outfit)', fontSize: '14px', fontWeight: '700', color: '#1a2332', marginBottom: '12px' }}>Availability</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {['In Stock', 'Out Of Stock'].map(stock => (
                    <button
                      key={stock}
                      onClick={() => setSelectedStock(selectedStock === stock ? null : stock)}
                      style={{
                        padding: '6px 14px', borderRadius: '9999px', fontSize: '12px', fontWeight: '600',
                        background: selectedStock === stock ? '#DDF7E3' : '#F7FBFD',
                        border: `1.5px solid ${selectedStock === stock ? '#3BAE56' : '#e2e8f0'}`,
                        color: selectedStock === stock ? '#3BAE56' : '#374151', cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {stock}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brands filter removed as requested */}

              {/* Categories */}
              <div style={{ borderTop: '1.5px solid #f1f5f9', padding: '16px 0' }}>
                <h4 style={{ fontFamily: 'var(--font-outfit)', fontSize: '14px', fontWeight: '700', color: '#1a2332', marginBottom: '12px' }}>Category</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {['Skin Care', 'Hair Care', 'Body Care', 'Wellness', 'Baby Care', 'Combos'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                      style={{
                        padding: '6px 14px', borderRadius: '9999px', fontSize: '12px', fontWeight: '600',
                        background: selectedCategory === cat ? '#DDF7E3' : '#F7FBFD',
                        border: `1.5px solid ${selectedCategory === cat ? '#3BAE56' : '#e2e8f0'}`,
                        color: selectedCategory === cat ? '#3BAE56' : '#374151', cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Product Listing Area */}
          <div style={{ flex: 1 }}>
            {/* View controls */}
            <div className="glass" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderRadius: '16px', marginBottom: '24px', border: '1px solid rgba(221,244,255,0.8)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button
                  onClick={() => setIsMobileFilterOpen(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#F7FBFD', border: '1.5px solid #e2e8f0', borderRadius: '9999px', padding: '6px 14px', fontSize: '13px', fontWeight: '600', color: '#374151', cursor: 'pointer' }}
                  className="show-mobile-filter-btn"
                >
                  <FiFilter /> Filter
                </button>

                <div style={{ display: 'flex', gap: '4px' }} className="hide-mobile-view-btns">
                  <button
                    onClick={() => setViewType('grid')}
                    style={{ background: viewType === 'grid' ? '#EAF8FF' : 'transparent', border: 'none', color: viewType === 'grid' ? '#4A90E2' : '#64748b', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <FiGrid size={18} />
                  </button>
                  <button
                    onClick={() => setViewType('list')}
                    style={{ background: viewType === 'list' ? '#EAF8FF' : 'transparent', border: 'none', color: viewType === 'list' ? '#4A90E2' : '#64748b', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <FiList size={18} />
                  </button>
                </div>
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }} className="hide-mobile-view-btns">
                  Showing {sortedProducts.length} product{sortedProducts.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Sort by */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Sort by</span>
                <div style={{ position: 'relative' }}>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="mg-select"
                    style={{ paddingTop: '6px', paddingBottom: '6px', paddingLeft: '14px', paddingRight: '36px', borderRadius: '9999px', fontSize: '13px', fontWeight: '600', border: '1.5px solid #e2e8f0', minWidth: '150px' }}
                  >
                    <option>Best Selling</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                    <option>Newest</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Products Grid / List */}
            {loading ? (
              <div className="shop-grid">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="mg-card" style={{ height: '320px', padding: '16px' }}>
                    <div className="mg-skeleton" style={{ height: '180px', width: '100%', marginBottom: '16px' }} />
                    <div className="mg-skeleton" style={{ height: '16px', width: '60%', marginBottom: '8px' }} />
                    <div className="mg-skeleton" style={{ height: '16px', width: '40%' }} />
                  </div>
                ))}
              </div>
            ) : sortedProducts.length > 0 ? (
              viewType === 'grid' ? (
                <div className="shop-grid">
                  {sortedProducts.map(product => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {sortedProducts.map(product => {
                    const finalPrice = product.discountedPrice !== undefined ? product.discountedPrice : product.price;
                    const discountLabel = product.discount > 0 ? (product.discountType === 'Flat' ? `₹${product.discount} OFF` : `${product.discount}% OFF`) : null;
                    return (
                      <div key={product._id} className="mg-card" style={{ padding: '16px', display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <div style={{ width: '120px', height: '120px', flexShrink: 0, position: 'relative', background: '#F7FBFD', borderRadius: '12px', overflow: 'hidden' }}>
                          <Image src={product.images?.[0] || product.image || '/placeholder.png'} alt={product.name} fill sizes="120px" style={{ objectFit: 'contain', padding: '8px' }} />
                        </div>
                        <div style={{ flex: 1, minWidth: '240px' }}>
                          <div style={{ fontSize: '10px', fontWeight: '700', color: '#3BAE56', letterSpacing: '0.08em', marginBottom: '4px' }}>MAXGLOW</div>
                          <h3 style={{ fontFamily: 'var(--font-outfit)', fontSize: '16px', fontWeight: '700', color: '#1a2332', margin: '0 0 6px' }}>{product.name}</h3>
                          <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.description}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontFamily: 'var(--font-outfit)', fontSize: '18px', fontWeight: '800', color: '#1a2332' }}>₹{finalPrice}</span>
                            {product.discount > 0 && <del style={{ fontSize: '13px', color: '#94a3b8' }}>₹{product.price}</del>}
                            {discountLabel && <span className="mg-badge mg-badge-green" style={{ fontSize: '10px' }}>{discountLabel}</span>}
                          </div>
                        </div>
                        <Link href={`/shop-details?name=${encodeURIComponent(product.name)}`} className="btn-mg-primary" style={{ fontSize: '13px', padding: '10px 24px' }}>
                          View Details
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              <div className="glass" style={{ textAlign: 'center', padding: '60px 20px', borderRadius: '20px' }}>
                <Leaf size={40} color="#94a3b8" style={{ marginBottom: '16px' }} />
                <h3 style={{ fontFamily: 'var(--font-outfit)', fontSize: '18px', fontWeight: '700', color: '#1a2332', marginBottom: '8px' }}>No Products Found</h3>
                <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Try clearing your filters or searching for something else.</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Mobile filter Drawer */}
      {isMobileFilterOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9998 }} onClick={() => setIsMobileFilterOpen(false)} />
      )}
      <div style={{
        position: 'fixed', top: 0, right: 0, height: '100vh', width: '320px',
        background: 'white', zIndex: 9999, padding: '24px', display: 'flex', flexDirection: 'column',
        boxShadow: '-4px 0 40px rgba(0,0,0,0.15)',
        transform: isMobileFilterOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-outfit)', fontSize: '18px', fontWeight: '700', color: '#1a2332', margin: 0 }}>Filters</h3>
          <button onClick={() => setIsMobileFilterOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <FiX size={20} />
          </button>
        </div>

        {/* Filters content (cloned for mobile) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
          <div>
            <h4 style={{ fontFamily: 'var(--font-outfit)', fontSize: '14px', fontWeight: '700', color: '#1a2332', marginBottom: '12px' }}>Price Range</h4>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input type="number" placeholder="Min" className="mg-input" value={priceFrom} onChange={(e) => setPriceFrom(e.target.value)} style={{ padding: '8px 12px' }} />
              <span style={{ color: '#94a3b8' }}>-</span>
              <input type="number" placeholder="Max" className="mg-input" value={priceTo} onChange={(e) => setPriceTo(e.target.value)} style={{ padding: '8px 12px' }} />
            </div>
          </div>

          <div>
            <h4 style={{ fontFamily: 'var(--font-outfit)', fontSize: '14px', fontWeight: '700', color: '#1a2332', marginBottom: '12px' }}>Availability</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {['In Stock', 'Out Of Stock'].map(stock => (
                <button
                  key={stock}
                  onClick={() => { setSelectedStock(selectedStock === stock ? null : stock); setIsMobileFilterOpen(false); }}
                  style={{
                    padding: '6px 14px', borderRadius: '9999px', fontSize: '12px', fontWeight: '600',
                    background: selectedStock === stock ? '#DDF7E3' : '#F7FBFD',
                    border: `1.5px solid ${selectedStock === stock ? '#3BAE56' : '#e2e8f0'}`,
                    color: selectedStock === stock ? '#3BAE56' : '#374151', cursor: 'pointer',
                  }}
                >
                  {stock}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Brands filter removed */}

          <div>
            <h4 style={{ fontFamily: 'var(--font-outfit)', fontSize: '14px', fontWeight: '700', color: '#1a2332', marginBottom: '12px' }}>Category</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {['Skin Care', 'Hair Care', 'Body Care', 'Wellness', 'Baby Care', 'Combos'].map(cat => (
                <button
                  key={cat}
                  onClick={() => { setSelectedCategory(selectedCategory === cat ? null : cat); setIsMobileFilterOpen(false); }}
                  style={{
                    padding: '6px 14px', borderRadius: '9999px', fontSize: '12px', fontWeight: '600',
                    background: selectedCategory === cat ? '#DDF7E3' : '#F7FBFD',
                    border: `1.5px solid ${selectedCategory === cat ? '#3BAE56' : '#e2e8f0'}`,
                    color: selectedCategory === cat ? '#3BAE56' : '#374151', cursor: 'pointer',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1.5px solid #f1f5f9', paddingTop: '20px', marginTop: '20px' }}>
          <button
            onClick={() => { clearAllFilters(); setIsMobileFilterOpen(false); }}
            style={{ width: '100%', background: '#fff0f0', border: '1px solid #fecaca', borderRadius: '9999px', padding: '12px', color: '#ef4444', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}
          >
            Clear All Filters
          </button>
        </div>
      </div>

      <style>{`
        @media (min-width: 992px) {
          .show-desktop-aside { display: block !important; }
          .show-mobile-filter-btn { display: none !important; }
        }
        @media (max-width: 991px) {
          .hide-mobile-view-btns { display: none !important; }
        }
      `}</style>
    </>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #3BAE56', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
