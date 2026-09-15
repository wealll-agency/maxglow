'use client';

import React, { useState, useEffect } from 'react';
import api from '../../../utils/axiosConfig';
import { useNotification } from '../../../context/NotificationContext';
import { 
  Trash2, Plus, Edit2, ArrowLeft, Home, Gift, Info, 
  ShoppingBag, Check, Sparkles, Layers, FileText,
  ChevronRight, UploadCloud, RefreshCw
} from 'lucide-react';
import Image from 'next/image';

export default function ThemeManagerPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPageId, setSelectedPageId] = useState(null); // null = overview page selector
  const [catalogPdf, setCatalogPdf] = useState('');
  const [catalogPdfDirty, setCatalogPdfDirty] = useState(false);
  const [savingPdf, setSavingPdf] = useState(false);
  const { showAlert, showConfirm } = useNotification();

  // Master definition of website pages and their corresponding theme sections
  const PAGES = [
    {
      id: 'home',
      title: 'Home Page Theme',
      subtitle: 'Manage Hero Sliders, Trending Now, Promo Banners, Combo Promos & Mobile Banners',
      badge: '5 Banner Sections',
      icon: Home,
      color: '#2e7d32',
      bgLight: '#e8f5e9',
      borderColor: '#a5d6a7',
      sections: ['Hero', 'Promotional', 'ComboBox', 'Middle', 'Bottom']
    },
    {
      id: 'combos',
      title: 'Combo Page Theme',
      subtitle: 'Manage Combo Box Banners & Promotional Media',
      badge: '1 Banner Section',
      icon: Gift,
      color: '#e65100',
      bgLight: '#fff3e0',
      borderColor: '#ffcc80',
      sections: ['ComboBox']
    },
    {
      id: 'about',
      title: 'About Us Page Theme',
      subtitle: 'Manage About Hero Banner, Our Story, Mission & Vision Media, Wholesale Banner & Catalog PDF',
      badge: '5 Theme Sections',
      icon: Info,
      color: '#0288d1',
      bgLight: '#e1f5fe',
      borderColor: '#81d4fa',
      sections: ['AboutHero', 'AboutStory', 'AboutMission', 'AboutVision', 'AboutCta']
    },
    {
      id: 'shop',
      title: 'Shop / Products Page Theme',
      subtitle: 'Manage Shop Header Banners & Store Promotional Badges',
      badge: '1 Banner Section',
      icon: ShoppingBag,
      color: '#7b1fa2',
      bgLight: '#f3e5f5',
      borderColor: '#ce93d8',
      sections: ['ShopBanner']
    }
  ];

  // Define section specifications
  const ALL_SECTIONS = [
    { 
      id: 'Hero', 
      pageId: 'home',
      title: 'Homepage Hero Banner Slider', 
      subtitle: 'Recommended: 1920 × 750 px | Aspect Ratio: 1920:750 | Format: WebP / JPG / PNG', 
      expectedRatio: 1920/750, 
      recWidth: 1920, 
      recHeight: 750,
      previewClass: 'ratio-hero',
      previewMaxWidth: '100%',
      allowMultiple: true 
    },
    { 
      id: 'Promotional', 
      pageId: 'home',
      title: 'Trending Now Banner', 
      subtitle: 'Recommended: 600 × 600 px | Aspect Ratio: 1:1 | Format: WebP / JPG / PNG', 
      expectedRatio: 1, 
      recWidth: 600, 
      recHeight: 600,
      previewClass: 'ratio-1x1',
      previewMaxWidth: '300px',
      allowMultiple: true 
    },
    { 
      id: 'ComboBox', 
      pageId: 'combos',
      title: 'Combo Box Banner', 
      subtitle: 'Recommended: 2172 × 724 px | Aspect Ratio: 3:1 | Format: WebP / JPG / PNG', 
      expectedRatio: 3/1, 
      recWidth: 2172, 
      recHeight: 724,
      previewClass: 'ratio-trending',
      previewMaxWidth: '100%',
      allowMultiple: true 
    },
    { 
      id: 'Middle', 
      pageId: 'home',
      title: 'Middle Promotional Banner', 
      subtitle: 'Recommended: 1400 × 400 px | Aspect Ratio: 7:2 | Format: WebP / JPG / PNG', 
      expectedRatio: 7/2, 
      recWidth: 1400, 
      recHeight: 400,
      previewClass: 'ratio-promo',
      previewMaxWidth: '100%',
      allowMultiple: true 
    },
    { 
      id: 'Bottom', 
      pageId: 'home',
      title: 'Mobile Hero Banner', 
      subtitle: 'Recommended: 382 × 286 px | Aspect Ratio: 4:3 | Format: WebP / JPG / PNG', 
      expectedRatio: 4/3, 
      recWidth: 382, 
      recHeight: 286,
      previewClass: 'ratio-4x3',
      previewMaxWidth: '300px',
      allowMultiple: true 
    },
    { 
      id: 'AboutHero', 
      pageId: 'about',
      title: 'About Page Hero Banner', 
      subtitle: 'Recommended: 1920 × 750 px | Aspect Ratio: 1920:750 | Format: WebP / JPG / PNG', 
      expectedRatio: 1920/750, 
      recWidth: 1920, 
      recHeight: 750,
      previewClass: 'ratio-hero',
      previewMaxWidth: '100%',
      allowMultiple: false 
    },
    { 
      id: 'AboutStory', 
      pageId: 'about',
      title: 'About Our Story Banner', 
      subtitle: 'Recommended: 800 × 600 px | Aspect Ratio: 4:3 | Format: WebP / JPG / PNG', 
      expectedRatio: 4/3, 
      recWidth: 800, 
      recHeight: 600,
      previewClass: 'ratio-4x3',
      previewMaxWidth: '400px',
      allowMultiple: false 
    },
    { 
      id: 'AboutMission', 
      pageId: 'about',
      title: 'About Mission Banner', 
      subtitle: 'Recommended: 800 × 600 px | Aspect Ratio: 4:3 | Format: WebP / JPG / PNG', 
      expectedRatio: 4/3, 
      recWidth: 800, 
      recHeight: 600,
      previewClass: 'ratio-4x3',
      previewMaxWidth: '400px',
      allowMultiple: false 
    },
    { 
      id: 'AboutVision', 
      pageId: 'about',
      title: 'About Vision Banner', 
      subtitle: 'Recommended: 800 × 600 px | Aspect Ratio: 4:3 | Format: WebP / JPG / PNG', 
      expectedRatio: 4/3, 
      recWidth: 800, 
      recHeight: 600,
      previewClass: 'ratio-4x3',
      previewMaxWidth: '400px',
      allowMultiple: false 
    },
    { 
      id: 'AboutCta', 
      pageId: 'about',
      title: 'About Corporate Gifting & Wholesale Banner', 
      subtitle: 'Recommended: 1400 × 500 px | Aspect Ratio: 14:5 | Format: WebP / JPG / PNG', 
      expectedRatio: 14/5, 
      recWidth: 1400, 
      recHeight: 500,
      previewClass: 'ratio-promo',
      previewMaxWidth: '100%',
      allowMultiple: false 
    },
    { 
      id: 'ShopBanner', 
      pageId: 'shop',
      title: 'Shop Page Header Banner', 
      subtitle: 'Recommended: 2172 × 724 px | Aspect Ratio: 3:1 | Format: WebP / JPG / PNG', 
      expectedRatio: 3/1, 
      recWidth: 2172, 
      recHeight: 724,
      previewClass: 'ratio-shop-banner',
      previewMaxWidth: '100%',
      allowMultiple: true 
    }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resBanners, resSettings] = await Promise.all([
        api.get('/banners?all=true'),
        api.get('/auth/settings')
      ]);
      if (resBanners.data.success) setBanners(resBanners.data.banners);
      if (resSettings.data.success && resSettings.data.settings?.catalogPdf) {
        setCatalogPdf(resSettings.data.settings.catalogPdf);
      }
    } catch (error) {
      showAlert('Failed to fetch theme banners', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchBanners = async () => {
    try {
      const res = await api.get('/banners?all=true');
      if (res.data.success) setBanners(res.data.banners);
    } catch (error) {
      console.error(error);
    }
  };

  // Catalog PDF handlers
  const handleCatalogPdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      showAlert('Please select a valid PDF document file', 'error');
      return;
    }

    const form = new FormData();
    form.append('file', file);

    try {
      const res = await api.post('/uploads', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const uploadedUrl = res.data.url || res.data.path || res.data;
      setCatalogPdf(uploadedUrl);
      setCatalogPdfDirty(true);
      showAlert('Catalog PDF uploaded to draft! Click "Save Catalog PDF" to apply.', 'info');
    } catch (error) {
      console.error('PDF Upload Error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to upload PDF';
      showAlert(errorMessage, 'error');
    }
  };

  const handleSaveCatalogPdf = async () => {
    try {
      setSavingPdf(true);
      const res = await api.put('/auth/settings', {
        settings: { catalogPdf }
      });
      if (res.data.success) {
        showAlert('Catalog PDF saved successfully!', 'success');
        setCatalogPdfDirty(false);
      }
    } catch (error) {
      showAlert('Failed to save Catalog PDF', 'error');
    } finally {
      setSavingPdf(false);
    }
  };

  const handleRemoveCatalogPdf = async () => {
    const confirmed = await showConfirm('Are you sure you want to remove the Catalog PDF?');
    if (confirmed) {
      setCatalogPdf('');
      setCatalogPdfDirty(true);
      try {
        await api.put('/auth/settings', {
          settings: { catalogPdf: '' }
        });
        showAlert('Catalog PDF removed successfully!', 'success');
        setCatalogPdfDirty(false);
      } catch (error) {
        showAlert('Failed to update Catalog PDF setting', 'error');
      }
    }
  };

  // Upload handler
  const handleFileUpload = async (e, placement, bannerId = null) => {
    const file = e.target.files[0];
    if (!file) return;

    const sectionDef = ALL_SECTIONS.find(s => s.id === placement);
    let warningMsg = null;

    const validateDimensions = () => new Promise((resolve) => {
      const img = new window.Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const actualRatio = img.width / img.height;
        const expectedRatio = sectionDef?.expectedRatio || 1;
        if (Math.abs(actualRatio - expectedRatio) / expectedRatio > 0.05) {
          warningMsg = `⚠ Warning: Uploaded image is ${img.width}x${img.height} px (${actualRatio.toFixed(2)}:1). Recommended is ${sectionDef.recWidth}x${sectionDef.recHeight} px. Image will be cropped automatically.`;
        }
        resolve();
      };
      img.onerror = resolve;
    });

    await validateDimensions();

    const form = new FormData();
    form.append('file', file);
    
    try {
      const res = await api.post('/uploads', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const uploadedUrl = res.data.url || res.data.imageUrl || res.data.path || res.data;
      
      if (bannerId) {
        setBanners(prev => prev.map(b => b._id === bannerId ? { ...b, image: uploadedUrl, warning: warningMsg, isDirty: true } : b));
      } else {
        const newTempBanner = {
          _id: `temp_${Date.now()}`,
          title: `${placement} Banner`,
          subtitle: '',
          description: '',
          image: uploadedUrl,
          warning: warningMsg,
          placement: placement,
          isActive: true,
          isDirty: true,
          isNew: true
        };
        setBanners(prev => [...prev, newTempBanner]);
      }
    } catch (error) {
      console.error('Upload Error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to upload image';
      showAlert(errorMessage, 'error');
    }
  };

  const handleAddEmptyRow = (placement) => {
    const newTempBanner = {
      _id: `temp_${Date.now()}`,
      title: `${placement} Banner`,
      subtitle: '',
      description: '',
      image: '',
      placement: placement,
      isActive: true,
      isDirty: true,
      isNew: true
    };
    setBanners(prev => [...prev, newTempBanner]);
  };

  const handleRemove = async (banner) => {
    if (banner.isNew) {
      setBanners(prev => prev.filter(b => b._id !== banner._id));
    } else {
      const confirmed = await showConfirm('Are you sure you want to remove this theme banner?');
      if (confirmed) {
        try {
          const res = await api.delete(`/banners/${banner._id}`);
          if (res.data.success) {
            setBanners(prev => prev.filter(b => b._id !== banner._id));
            showAlert('Theme banner removed successfully', 'success');
          }
        } catch (error) {
          showAlert('Failed to remove banner', 'error');
        }
      }
    }
  };

  const handleSaveSection = async (placement) => {
    const sectionBanners = banners.filter(b => b.placement === placement && b.isDirty);
    
    if (sectionBanners.length === 0) {
      showAlert('No pending changes to save in this section', 'info');
      return;
    }

    try {
      for (const banner of sectionBanners) {
        if (!banner.image) continue;

        if (banner.isNew) {
          await api.post('/banners', {
            title: banner.title,
            subtitle: banner.subtitle,
            description: banner.description,
            image: banner.image,
            placement: banner.placement,
            isActive: banner.isActive
          });
        } else {
          await api.put(`/banners/${banner._id}`, {
            title: banner.title,
            subtitle: banner.subtitle,
            description: banner.description,
            image: banner.image,
            placement: banner.placement,
            isActive: banner.isActive
          });
        }
      }
      showAlert(`${placement} theme section saved successfully!`, 'success');
      fetchBanners(); 
    } catch (error) {
      showAlert(`Error saving ${placement} section`, 'error');
    }
  };

  const getImageUrl = (url) => {
    if (!url) return '';
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : '';
    if (url.startsWith('http') || url.startsWith('/')) return url;
    return `${baseUrl}${url}`;
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center p-5 min-vh-100 bg-light">
        <div className="spinner-border text-success me-3" role="status" style={{ width: '2.5rem', height: '2.5rem' }}></div>
        <span className="fs-5 fw-semibold text-dark">Loading Theme Manager...</span>
      </div>
    );
  }

  const selectedPage = PAGES.find(p => p.id === selectedPageId);
  const currentSections = selectedPage 
    ? ALL_SECTIONS.filter(s => selectedPage.sections.includes(s.id))
    : [];

  return (
    <div className="container-fluid py-4 px-lg-5 animate-fade-in" style={{ backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      
      {/* Overview Dashboard Header (When no page selected) */}
      {!selectedPageId ? (
        <>
          <div className="mb-4 bg-white p-4 rounded-4 shadow-sm border border-light">
            <div className="d-flex align-items-center gap-3 mb-2">
              <div className="p-3 rounded-3" style={{ backgroundColor: '#e8f5e9', color: '#2e7d32' }}>
                <Layers size={28} />
              </div>
              <div>
                <h3 className="fw-bold mb-1" style={{ color: '#162C18' }}>Theme & Media Manager</h3>
                <p className="text-muted mb-0 fs-7">Select a page below to update banners, hero sliders, promo media, and layout themes page by page.</p>
              </div>
            </div>
          </div>

          {/* Grid of Page Selection Cards */}
          <div className="row g-4">
            {PAGES.map(page => {
              const Icon = page.icon;
              // Count active banners across sections in this page
              const pageBannerCount = banners.filter(b => page.sections.includes(b.placement)).length;

              return (
                <div key={page.id} className="col-md-6 col-lg-4">
                  <div 
                    className="card h-100 border-0 shadow-sm rounded-4 transition-all hover-shadow cursor-pointer position-relative overflow-hidden"
                    onClick={() => setSelectedPageId(page.id)}
                    style={{ 
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      borderTop: `4px solid ${page.color}`
                    }}
                  >
                    <div className="card-body p-4 d-flex flex-column justify-content-between">
                      <div>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <div className="p-3 rounded-3" style={{ backgroundColor: page.bgLight, color: page.color }}>
                            <Icon size={24} />
                          </div>
                          <span className="badge px-3 py-2 rounded-pill fs-8 fw-semibold" style={{ backgroundColor: page.bgLight, color: page.color, border: `1px solid ${page.borderColor}` }}>
                            {page.badge} ({pageBannerCount} Active)
                          </span>
                        </div>

                        <h5 className="fw-bold text-dark mb-2" style={{ fontSize: '18px' }}>{page.title}</h5>
                        <p className="text-muted fs-7 mb-4" style={{ minHeight: '42px', lineHeight: '1.5' }}>{page.subtitle}</p>
                      </div>

                      <div className="pt-3 border-top d-flex align-items-center justify-content-between">
                        <span className="fw-semibold fs-7" style={{ color: page.color }}>Update {page.title}</span>
                        <div className="rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ backgroundColor: page.bgLight, color: page.color }}>
                          <ChevronRight size={18} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* Selected Page Theme Editor View */
        <>
          {/* Header Controls & Navigation */}
          <div className="mb-4 bg-white p-4 rounded-4 shadow-sm border border-light">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
              <div className="d-flex align-items-center gap-3">
                <button 
                  className="btn btn-outline-secondary rounded-pill px-3 py-2 d-flex align-items-center gap-2 fs-7 fw-semibold"
                  onClick={() => setSelectedPageId(null)}
                >
                  <ArrowLeft size={16} /> Back to Page Selector
                </button>
                <div>
                  <h4 className="fw-bold m-0 text-dark d-flex align-items-center gap-2">
                    {React.createElement(selectedPage.icon, { size: 22, color: selectedPage.color })}
                    {selectedPage.title}
                  </h4>
                  <small className="text-muted fs-7">{selectedPage.subtitle}</small>
                </div>
              </div>

              {/* Quick Page Switcher Dropdown */}
              <div className="d-flex align-items-center gap-2">
                <label className="fs-7 fw-medium text-muted">Switch Page Theme:</label>
                <select 
                  className="form-select form-select-sm rounded-3 fw-semibold border-secondary-subtle"
                  value={selectedPageId}
                  onChange={(e) => setSelectedPageId(e.target.value)}
                  style={{ minWidth: '220px' }}
                >
                  {PAGES.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Sections List belonging to the selected page */}
          {currentSections.map(section => {
            const sectionBanners = banners.filter(b => b.placement === section.id);
            
            return (
              <div key={section.id} className="mb-4">
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-4">
                  <div className="card-header bg-white p-4 border-bottom d-flex flex-wrap align-items-center justify-content-between gap-2">
                    <div>
                      <h6 className="fw-bold mb-1 text-dark fs-6 d-flex align-items-center gap-2">
                        <Sparkles size={16} style={{ color: selectedPage.color }} />
                        {section.title}
                      </h6>
                      <small className="text-muted" style={{ fontSize: '11px' }}>{section.subtitle}</small>
                    </div>
                    <button 
                      className="btn btn-sm px-4 py-2 fw-semibold rounded-3 shadow-2xs d-flex align-items-center gap-2" 
                      style={{ backgroundColor: '#2e7d32', color: '#ffffff', border: 'none' }}
                      onClick={() => handleSaveSection(section.id)}
                    >
                      <Check size={16} /> Save Section
                    </button>
                  </div>

                  <div className="card-body p-4">
                    {sectionBanners.length === 0 ? (
                      <div className="p-4 text-center border rounded-3 bg-light text-muted">
                        <UploadCloud size={28} className="mb-2 text-secondary opacity-50" />
                        <p className="mb-0 small fw-medium">No banners uploaded for this section yet.</p>
                      </div>
                    ) : (
                      sectionBanners.map((banner, idx) => (
                        <div key={banner._id} className="mb-4 pb-4 border-bottom last-border-none">
                          <div className="row g-4">
                            {/* Left Column: Upload & Text Inputs */}
                            <div className="col-lg-6">
                              <div className="d-flex align-items-start mb-3">
                                <div className="flex-grow-1">
                                  <label className="fw-semibold mb-1" style={{ fontSize: '13px', color: '#4B5563' }}>
                                    Banner Image File <span className="text-danger ms-2 fw-bold" style={{fontSize: '11px'}}>EXACT REQUIRED SIZE: {section.recWidth}x{section.recHeight} px (Otherwise image will be cropped)</span>
                                  </label>
                                  <div className="d-flex align-items-center gap-3 mt-1">
                                    <input 
                                      type="file" 
                                      className="form-control form-control-sm rounded-3" 
                                      style={{ maxWidth: '350px' }}
                                      accept="image/*"
                                      onChange={(e) => handleFileUpload(e, section.id, banner._id)}
                                    />
                                    <button 
                                      className="btn btn-sm btn-outline-danger px-3 py-1 d-flex align-items-center gap-1 fs-7 fw-semibold rounded-3" 
                                      onClick={() => handleRemove(banner)}
                                    >
                                      <Trash2 size={14} /> Remove
                                    </button>
                                  </div>
                                  
                                  {banner.warning && (
                                    <div className="mt-2 p-2 rounded-3" style={{ backgroundColor: '#FFFBEB', color: '#B45309', fontSize: '12px', border: '1px solid #FDE68A', display: 'inline-block' }}>
                                      {banner.warning}
                                    </div>
                                  )}
                                  
                                  {['AboutStory', 'AboutMission', 'AboutVision'].includes(section.id) && (
                                    <div className="mt-3 p-3 bg-light rounded-3 border border-light" style={{ maxWidth: '600px' }}>
                                      <label className="fw-semibold mb-2 text-dark" style={{ fontSize: '13px' }}>Story Text Content</label>
                                      
                                      <div className="mb-2">
                                        <input 
                                          type="text" 
                                          className="form-control form-control-sm shadow-none border-secondary-subtle" 
                                          value={banner.subtitle || ''}
                                          onChange={(e) => setBanners(prev => prev.map(b => b._id === banner._id ? { ...b, subtitle: e.target.value, isDirty: true } : b))}
                                        />
                                      </div>
                                      <div className="mb-2">
                                        <input 
                                          type="text" 
                                          className="form-control form-control-sm shadow-none border-secondary-subtle fw-semibold" 
                                          value={banner.title || ''}
                                          onChange={(e) => setBanners(prev => prev.map(b => b._id === banner._id ? { ...b, title: e.target.value, isDirty: true } : b))}
                                        />
                                      </div>
                                      <div>
                                        <textarea 
                                          className="form-control form-control-sm shadow-none border-secondary-subtle" 
                                          rows="5"
                                          value={banner.description || ''}
                                          onChange={(e) => setBanners(prev => prev.map(b => b._id === banner._id ? { ...b, description: e.target.value, isDirty: true } : b))}
                                        ></textarea>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {/* Right Column: Live Banner Preview */}
                            <div className="col-lg-6">
                              <label className="fw-semibold mb-1 fs-8 text-uppercase tracking-wider" style={{ color: '#6B7280' }}>LIVE BANNER PREVIEW</label>
                              <div 
                                className={`banner-img-container ${section.previewClass} rounded-3 shadow-2xs`} 
                                style={{ border: '2px dashed #E5E7EB', backgroundColor: '#F9FAFB', maxWidth: section.previewMaxWidth || '100%' }}
                              >
                                {banner.image ? (
                                  <img src={getImageUrl(banner.image)} alt="Preview" />
                                ) : (
                                  <div className="d-flex w-100 h-100 align-items-center justify-content-center text-muted" style={{ fontSize: '12px' }}>
                                    No Image Selected
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    
                    {(section.allowMultiple || sectionBanners.length === 0) && (
                      <div className="mt-3">
                        <button 
                          className="btn btn-sm btn-outline-success px-4 py-2 fw-semibold rounded-3 d-flex align-items-center gap-2"
                          onClick={() => handleAddEmptyRow(section.id)}
                        >
                          <Plus size={16} /> Upload {section.allowMultiple ? `Another ${section.id === 'Hero' ? 'Slider Image' : 'Banner'}` : 'Banner'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* About Us Page Catalog PDF Manager */}
          {selectedPageId === 'about' && (
            <div className="mb-4">
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                <div className="card-header bg-white p-4 border-bottom d-flex flex-wrap align-items-center justify-content-between gap-2">
                  <div>
                    <h6 className="fw-bold mb-1 text-dark fs-6 d-flex align-items-center gap-2">
                      <FileText size={18} style={{ color: selectedPage.color }} />
                      About Page Catalog PDF Manager
                    </h6>
                    <small className="text-muted" style={{ fontSize: '11px' }}>
                      Upload the product catalog PDF. Customers can download it by clicking the "Download Catalog" button on the About Us page.
                    </small>
                  </div>
                  <button 
                    className="btn btn-sm px-4 py-2 fw-semibold rounded-3 shadow-2xs d-flex align-items-center gap-2" 
                    style={{ backgroundColor: '#2e7d32', color: '#ffffff', border: 'none' }}
                    onClick={handleSaveCatalogPdf}
                    disabled={savingPdf}
                  >
                    <Check size={16} /> Save Catalog PDF
                  </button>
                </div>

                <div className="card-body p-4">
                  <div className="mb-3">
                    <label className="fw-semibold mb-1" style={{ fontSize: '13px', color: '#4B5563' }}>
                      Select Catalog PDF File <span className="text-primary ms-2" style={{fontSize: '11px'}}>(Format: PDF | Max size: 50MB)</span>
                    </label>
                    <div className="d-flex align-items-center gap-3 mt-1">
                      <input 
                        type="file" 
                        className="form-control form-control-sm rounded-3" 
                        style={{ maxWidth: '400px' }}
                        accept="application/pdf,.pdf"
                        onChange={handleCatalogPdfUpload}
                      />
                      {catalogPdf && (
                        <button 
                          className="btn btn-sm btn-outline-danger px-3 py-1 d-flex align-items-center gap-1 fs-7 fw-semibold rounded-3" 
                          onClick={handleRemoveCatalogPdf}
                        >
                          <Trash2 size={14} /> Remove PDF
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Current Catalog Status & Test Link */}
                  <div className="p-3 rounded-3 mt-3" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                      <div className="d-flex align-items-center gap-2">
                        <FileText size={20} className={catalogPdf ? 'text-success' : 'text-secondary'} />
                        <div>
                          <span className="fw-semibold fs-7 d-block text-dark">
                            {catalogPdf ? 'Uploaded Catalog PDF:' : 'No Catalog PDF Uploaded Yet'}
                          </span>
                          {catalogPdf && (
                            <small className="text-muted text-break" style={{ fontSize: '11px' }}>
                              {catalogPdf}
                            </small>
                          )}
                        </div>
                      </div>
                      {catalogPdf && (
                        <a 
                          href={getImageUrl(catalogPdf)} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="btn btn-sm btn-outline-primary rounded-pill px-3 fs-8 fw-semibold d-flex align-items-center gap-1"
                        >
                          <UploadCloud size={14} /> View / Test PDF
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
}
