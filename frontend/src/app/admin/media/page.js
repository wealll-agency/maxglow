"use client";

import React, { useState, useEffect } from 'react';
import { useNotification } from '../../../context/NotificationContext';
import api from '../../../utils/axiosConfig';

export default function AdminMedia() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { showAlert } = useNotification();

  // States
  const [heroImages, setHeroImages] = useState(['/hero_final_1.png', '/hero_final_2.png', '/hero_final_3.png']);
  const [newArrivals, setNewArrivals] = useState('/new_arrival_banner.png');
  const [offers, setOffers] = useState(['/mg-offer1.jpg', '/mg-offer2.jpg', '/mg-offer3.jpg']);
  const [categoryBanner, setCategoryBanner] = useState('/trending_banner.png');
  const [categoryBanners, setCategoryBanners] = useState({
    'Skin Care': '/banner_skin_care.png',
    'Hair Care': '/banner_hair_care.png',
    'Body Care': '/banner_body_care.png',
    'Serum': '/banner_wellness.png'
  });
  const [categories, setCategories] = useState([]);
  const [reels, setReels] = useState([
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4'
  ]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getImageUrl = (url) => {
    if (!url) return '';
    let cleanedUrl = url;
    if (typeof cleanedUrl === 'string' && (cleanedUrl.includes('localhost') || cleanedUrl.includes('127.0.0.1'))) {
      if (cleanedUrl.includes('/uploads/')) {
        cleanedUrl = cleanedUrl.substring(cleanedUrl.indexOf('/uploads/'));
      }
    }
    if (cleanedUrl.startsWith('http') || cleanedUrl.startsWith('blob:')) return cleanedUrl;
    if (cleanedUrl.startsWith('/uploads/')) {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'https://api.maxglow.in';
      return `${baseUrl}${cleanedUrl}`;
    }
    return cleanedUrl;
  };

  const fetchData = async () => {
    try {
      const [settingsRes, categoriesRes] = await Promise.all([
        api.get('/auth/settings'),
        api.get('/categories').catch(() => ({ data: { success: false } }))
      ]);

      if (settingsRes.data.success && settingsRes.data.settings) {
        const { media_hero, media_new_arrivals, media_offers, media_category_banner, media_category_banners, media_reels } = settingsRes.data.settings;
        if (Array.isArray(media_hero) && media_hero.length) setHeroImages(media_hero);
        if (media_new_arrivals) setNewArrivals(media_new_arrivals);
        if (Array.isArray(media_offers) && media_offers.length) setOffers(media_offers);
        if (media_category_banner) setCategoryBanner(media_category_banner);
        if (media_category_banners && typeof media_category_banners === 'object') {
          setCategoryBanners(prev => ({ ...prev, ...media_category_banners }));
        }
        if (Array.isArray(media_reels) && media_reels.length) setReels(media_reels);
      }

      if (categoriesRes.data && categoriesRes.data.categories) {
        setCategories(categoriesRes.data.categories);
      } else if (Array.isArray(categoriesRes.data)) {
        setCategories(categoriesRes.data);
      }
    } catch (err) {
      showAlert('Failed to load media settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSection = async (sectionName, payload) => {
    setSaving(true);
    try {
      const res = await api.put('/auth/settings', {
        settings: payload
      });
      if (res.data.success) {
        showAlert(`${sectionName} saved successfully!`, 'success');
      }
    } catch (err) {
      showAlert(`Failed to save ${sectionName}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e, setter, isArray = false, array = [], index = null) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    
    setUploading(true);
    showAlert('Uploading file... Please wait.', 'info');

    try {
      const res = await api.post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        showAlert('Upload successful!', 'success');
        const url = res.data.url;
        
        if (isArray && index !== null) {
          const newArr = [...array];
          newArr[index] = url;
          setter(newArr);
        } else {
          setter(url);
        }
      } else {
        throw new Error(res.data.message || 'Upload failed');
      }
    } catch (err) {
      showAlert(err.response?.data?.message || err.message || 'Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleCategoryFileUpload = async (e, categoryName) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    showAlert(`Uploading banner for ${categoryName}...`, 'info');

    try {
      const res = await api.post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        showAlert('Upload successful!', 'success');
        const url = res.data.url;
        setCategoryBanners(prev => ({
          ...prev,
          [categoryName]: url
        }));
      } else {
        throw new Error(res.data.message || 'Upload failed');
      }
    } catch (err) {
      showAlert(err.response?.data?.message || err.message || 'Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const addArrayItem = (setter, array) => {
    setter([...(Array.isArray(array) ? array : []), '']);
  };

  const removeArrayItem = (setter, array, index) => {
    const newArr = [...array];
    newArr.splice(index, 1);
    setter(newArr);
  };

  if (loading) {
    return <div className="p-4">Loading Media Settings...</div>;
  }

  // Combined list of default + dynamic categories
  const defaultCategoryNames = ['Skin Care', 'Hair Care', 'Body Care', 'Serum'];
  const fetchedCategoryNames = (categories || []).map(c => typeof c === 'string' ? c : c.name).filter(Boolean);
  const allCategoryNames = Array.from(new Set([...defaultCategoryNames, ...fetchedCategoryNames, ...Object.keys(categoryBanners)]));

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold m-0" style={{ fontFamily: 'var(--font-outfit)', color: '#1e293b' }}>Media Manager</h2>
          <p className="text-muted small mb-0">Upload and manage all homepage banners, category headers, hero sliders, and promo videos.</p>
        </div>
      </div>

      <div className="row g-4">
        {/* 1. Hero Slider */}
        <div className="col-12">
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-header bg-white border-0 pt-4 pb-2 d-flex justify-content-between align-items-center">
              <div>
                <h5 className="fw-bold text-dark mb-1">1. Hero Slider Images</h5>
                <p className="text-muted small mb-0">Recommended Dimensions: <strong>1920 × 800px</strong> (21:9 Aspect Ratio). Auto-slides on homepage.</p>
              </div>
              <button className="btn btn-sm btn-success px-4 rounded-pill fw-bold" onClick={() => handleSaveSection('Hero Images', { media_hero: heroImages })} disabled={saving || uploading}>
                Save Section
              </button>
            </div>
            <div className="card-body">
              {(Array.isArray(heroImages) ? heroImages : []).map((img, idx) => (
                <div key={idx} className="mb-3 p-3 bg-light rounded-3 border">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="fw-bold small text-dark">Hero Slide Image #{idx + 1} (Required Size: 1920×800px)</span>
                  </div>
                  <div className="d-flex gap-3 align-items-center flex-wrap">
                    {img && (
                      <div className="d-flex align-items-center gap-2 bg-white p-2 rounded border">
                        <img 
                          src={getImageUrl(img)} 
                          alt="Hero Preview" 
                          style={{ width: '120px', height: '60px', objectFit: 'cover', borderRadius: '6px' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        <span className="small text-truncate" style={{ maxWidth: '180px' }}>{img.split('/').pop()}</span>
                      </div>
                    )}
                    <div className="flex-grow-1" style={{ maxWidth: '300px' }}>
                      <input 
                        type="file" 
                        className="form-control" 
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, setHeroImages, true, heroImages, idx)} 
                      />
                    </div>
                    <button className="btn btn-outline-danger" onClick={() => removeArrayItem(setHeroImages, heroImages, idx)}>Remove Slide</button>
                  </div>
                </div>
              ))}
              <button className="btn btn-outline-success btn-sm mt-2 rounded-pill fw-semibold" onClick={() => addArrayItem(setHeroImages, heroImages)}>+ Upload Another Slide Image</button>
            </div>
          </div>
        </div>

        {/* 2. New Arrivals Banner */}
        <div className="col-12">
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-header bg-white border-0 pt-4 pb-2 d-flex justify-content-between align-items-center">
              <div>
                <h5 className="fw-bold text-dark mb-1">2. New Arrivals Banner</h5>
                <p className="text-muted small mb-0">Recommended Dimensions: <strong>1400 × 400px</strong>. Displayed inside New Arrivals homepage section.</p>
              </div>
              <button className="btn btn-sm btn-success px-4 rounded-pill fw-bold" onClick={() => handleSaveSection('New Arrivals', { media_new_arrivals: newArrivals })} disabled={saving || uploading}>
                Save Section
              </button>
            </div>
            <div className="card-body">
              <div className="p-3 bg-light rounded-3 border">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="fw-bold small text-dark">New Arrivals Main Banner (Required Size: 1400×400px)</span>
                </div>
                <div className="d-flex gap-3 align-items-center flex-wrap">
                  {newArrivals && (
                    <div className="d-flex align-items-center gap-2 bg-white p-2 rounded border">
                      <img 
                        src={getImageUrl(newArrivals)} 
                        alt="New Arrivals Preview" 
                        style={{ width: '140px', height: '60px', objectFit: 'cover', borderRadius: '6px' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                      <span className="small text-truncate" style={{ maxWidth: '180px' }}>{newArrivals.split('/').pop()}</span>
                    </div>
                  )}
                  <div className="flex-grow-1" style={{ maxWidth: '300px' }}>
                    <input 
                      type="file" 
                      className="form-control" 
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, setNewArrivals)} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Exclusive Offers Banners */}
        <div className="col-12">
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-header bg-white border-0 pt-4 pb-2 d-flex justify-content-between align-items-center">
              <div>
                <h5 className="fw-bold text-dark mb-1">3. Exclusive Offers Banners</h5>
                <p className="text-muted small mb-0">Recommended Dimensions: <strong>800 × 400px</strong> per banner. (3 offer cards side-by-side).</p>
              </div>
              <button className="btn btn-sm btn-success px-4 rounded-pill fw-bold" onClick={() => handleSaveSection('Offers Banners', { media_offers: offers })} disabled={saving || uploading}>
                Save Section
              </button>
            </div>
            <div className="card-body">
              {(Array.isArray(offers) ? offers : []).map((img, idx) => (
                <div key={idx} className="mb-3 p-3 bg-light rounded-3 border">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="fw-bold small text-dark">Exclusive Offer Card #{idx + 1} (Required Size: 800×400px)</span>
                  </div>
                  <div className="d-flex gap-3 align-items-center flex-wrap">
                    {img && (
                      <div className="d-flex align-items-center gap-2 bg-white p-2 rounded border">
                        <img 
                          src={getImageUrl(img)} 
                          alt="Offer Preview" 
                          style={{ width: '120px', height: '60px', objectFit: 'cover', borderRadius: '6px' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        <span className="small text-truncate" style={{ maxWidth: '180px' }}>{img.split('/').pop()}</span>
                      </div>
                    )}
                    <div className="flex-grow-1" style={{ maxWidth: '300px' }}>
                      <input 
                        type="file" 
                        className="form-control" 
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, setOffers, true, offers, idx)} 
                      />
                    </div>
                    <button className="btn btn-outline-danger" onClick={() => removeArrayItem(setOffers, offers, idx)}>Remove Offer</button>
                  </div>
                </div>
              ))}
              <button className="btn btn-outline-success btn-sm mt-2 rounded-pill fw-semibold" onClick={() => addArrayItem(setOffers, offers)}>+ Upload Another Offer Banner</button>
            </div>
          </div>
        </div>

        {/* 4. Category Specific Banners */}
        <div className="col-12">
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-header bg-white border-0 pt-4 pb-2 d-flex justify-content-between align-items-center">
              <div>
                <h5 className="fw-bold text-dark mb-1">4. Category Specific Banners</h5>
                <p className="text-muted small mb-0">Recommended Dimensions: <strong>1920 × 300px</strong>. Upload custom banner images for each product category.</p>
              </div>
              <button className="btn btn-sm btn-success px-4 rounded-pill fw-bold" onClick={() => handleSaveSection('Category Banners', { media_category_banner: categoryBanner, media_category_banners: categoryBanners })} disabled={saving || uploading}>
                Save Category Banners
              </button>
            </div>
            <div className="card-body">
              {/* Default General Fallback Banner */}
              <div className="mb-4 p-3 bg-light rounded-3 border">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="fw-bold small text-dark">Default / General Fallback Banner (Required Size: 1920×300px)</span>
                  <span className="text-muted small">Used when a category does not have a custom banner uploaded</span>
                </div>
                <div className="d-flex gap-3 align-items-center flex-wrap">
                  {categoryBanner && (
                    <div className="d-flex align-items-center gap-2 bg-white p-2 rounded border">
                      <img 
                        src={getImageUrl(categoryBanner)} 
                        alt="Fallback Preview" 
                        style={{ width: '150px', height: '50px', objectFit: 'cover', borderRadius: '6px' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                      <span className="small text-truncate" style={{ maxWidth: '180px' }}>{categoryBanner.split('/').pop()}</span>
                    </div>
                  )}
                  <div className="flex-grow-1" style={{ maxWidth: '300px' }}>
                    <input 
                      type="file" 
                      className="form-control" 
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, setCategoryBanner)} 
                    />
                  </div>
                </div>
              </div>

              <div className="d-flex align-items-center justify-content-between my-3">
                <h6 className="fw-bold text-dark m-0">Individual Product Category Banners ({allCategoryNames.length} Categories)</h6>
                <span className="badge bg-secondary px-3 py-2 rounded-pill">Required Size: 1920×300px</span>
              </div>

              {allCategoryNames.map((catName) => {
                const currentVal = categoryBanners[catName] || '';
                return (
                  <div key={catName} className="mb-3 p-3 border rounded-3 bg-white shadow-sm">
                    <div className="d-flex align-items-center justify-content-between mb-2 pb-2 border-bottom">
                      <div>
                        <span className="badge bg-success text-white fs-6 px-3 py-2 rounded-pill me-2">Category: {catName}</span>
                        <span className="text-muted small">Target Page: <code>/shop?category={encodeURIComponent(catName)}</code> (Required Size: 1920×300px)</span>
                      </div>
                      {currentVal ? (
                        <span className="badge bg-success-subtle text-success border border-success px-3 py-1 rounded-pill fw-bold">✓ Custom Banner Active</span>
                      ) : (
                        <span className="badge bg-warning-subtle text-warning-emphasis border border-warning px-3 py-1 rounded-pill fw-semibold">Using Default Fallback</span>
                      )}
                    </div>

                    <div className="d-flex gap-3 align-items-center flex-wrap mt-3">
                      {currentVal && (
                        <div className="d-flex align-items-center gap-2 bg-light p-2 rounded border">
                          <img 
                            src={getImageUrl(currentVal)} 
                            alt={`${catName} Banner Preview`} 
                            style={{ width: '160px', height: '50px', objectFit: 'cover', borderRadius: '6px' }}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                          <span className="small text-truncate" style={{ maxWidth: '160px' }}>{currentVal.split('/').pop()}</span>
                        </div>
                      )}
                      <div className="flex-grow-1" style={{ maxWidth: '320px' }}>
                        <input 
                          type="file" 
                          className="form-control" 
                          accept="image/*"
                          onChange={(e) => handleCategoryFileUpload(e, catName)} 
                        />
                      </div>
                      {currentVal && (
                        <button 
                          className="btn btn-outline-danger"
                          onClick={() => {
                            setCategoryBanners(prev => {
                              const updated = { ...prev };
                              delete updated[catName];
                              return updated;
                            });
                          }}
                        >
                          Remove Banner
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 5. Reels Section */}
        <div className="col-12 mb-5">
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-header bg-white border-0 pt-4 pb-2 d-flex justify-content-between align-items-center">
              <div>
                <h5 className="fw-bold text-dark mb-1">5. Reels / Watch & Buy Videos</h5>
                <p className="text-muted small mb-0">Recommended Dimensions: <strong>1080 × 1920px</strong> (9:16 Aspect Ratio). Maximum Duration: 10 Seconds per reel video.</p>
              </div>
              <button className="btn btn-sm btn-success px-4 rounded-pill fw-bold" onClick={() => handleSaveSection('Reels', { media_reels: reels })} disabled={saving || uploading}>
                Save Section
              </button>
            </div>
            <div className="card-body">
              {(Array.isArray(reels) ? reels : []).map((vid, idx) => (
                <div key={idx} className="mb-3 p-3 bg-light rounded-3 border">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="fw-bold small text-dark">Reel Video #{idx + 1} (Required Size: 1080×1920px 9:16)</span>
                  </div>
                  <div className="d-flex gap-3 align-items-center flex-wrap">
                    {vid && (
                      <div className="d-flex align-items-center gap-2 bg-white p-2 rounded border">
                        <video 
                          src={getImageUrl(vid)} 
                          style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '6px' }}
                          muted
                        />
                        <span className="small text-truncate" style={{ maxWidth: '180px' }}>{vid.split('/').pop()}</span>
                      </div>
                    )}
                    <div className="flex-grow-1" style={{ maxWidth: '300px' }}>
                      <input 
                        type="file" 
                        className="form-control" 
                        accept="video/*"
                        onChange={(e) => handleFileUpload(e, setReels, true, reels, idx)} 
                      />
                    </div>
                    <button className="btn btn-outline-danger" onClick={() => removeArrayItem(setReels, reels, idx)}>Remove Reel</button>
                  </div>
                </div>
              ))}
              <button className="btn btn-outline-success btn-sm mt-2 rounded-pill fw-semibold" onClick={() => addArrayItem(setReels, reels)}>+ Upload Another Reel Video</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
