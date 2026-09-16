"use client";

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
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedPageId, setSelectedPageId] = useState(null);
  const { showAlert, showConfirm } = useNotification();

  const PAGES = [
    {
      id: 'home',
      title: 'Home Page Theme',
      subtitle: 'Manage Hero Sliders, Trending Now, New Arrivals, Promo Offers & Mobile Banners',
      badge: '5 Theme Sections',
      icon: Home,
      color: '#2e7d32',
      bgLight: '#e8f5e9',
      borderColor: '#a5d6a7',
      sections: ['HeroDesktop', 'HeroMobile', 'Trending', 'NewArrivals', 'Offers']
    },
    {
      id: 'about',
      title: 'About Us Page Theme',
      subtitle: 'Manage About Hero Banner, Our Story, Mission & Vision Media',
      badge: '4 Theme Sections',
      icon: Info,
      color: '#0288d1',
      bgLight: '#e1f5fe',
      borderColor: '#81d4fa',
      sections: ['AboutHero', 'AboutStory', 'AboutMission', 'AboutVision']
    },
    {
      id: 'combos',
      title: 'Combo Page Theme',
      subtitle: 'Manage Combo Box Banners & Promotional Media',
      badge: '1 Theme Section',
      icon: Gift,
      color: '#e65100',
      bgLight: '#fff3e0',
      borderColor: '#ffcc80',
      sections: ['ComboBanner']
    },
    {
      id: 'shop',
      title: 'Shop / Products Page Theme',
      subtitle: 'Manage Shop Header Banners & Store Promotional Badges',
      badge: '1 Theme Section',
      icon: ShoppingBag,
      color: '#7b1fa2',
      bgLight: '#f3e5f5',
      borderColor: '#ce93d8',
      sections: ['ShopBanner']
    }
  ];

  const ALL_SECTIONS = [
    // HOME PAGE
    { 
      id: 'HeroDesktop', title: 'Desktop Hero Slider', subtitle: 'Recommended: 1920 × 750 px | Aspect Ratio: 1920:750', 
      recWidth: 1920, recHeight: 750, previewClass: 'ratio-hero', previewMaxWidth: '100%', allowMultiple: true,
      key: 'media_hero', isArray: true
    },
    { 
      id: 'HeroMobile', title: 'Mobile Hero Slider', subtitle: 'Recommended: 600 × 600 px | Aspect Ratio: 1:1', 
      recWidth: 600, recHeight: 600, previewClass: 'ratio-1x1', previewMaxWidth: '300px', allowMultiple: true,
      key: 'media_hero_mobile', isArray: true
    },
    { 
      id: 'Trending', title: 'Trending Banner (Desktop & Mobile)', subtitle: 'Recommended: 1400 × 400 px', 
      recWidth: 1400, recHeight: 400, previewClass: 'ratio-promo', previewMaxWidth: '100%', allowMultiple: false,
      key: 'media_trending_banner', keyMobile: 'media_trending_banner_mobile', isArray: false, hasMobile: true
    },
    { 
      id: 'NewArrivals', title: 'New Arrivals Banner (Desktop & Mobile)', subtitle: 'Recommended: 1400 × 400 px', 
      recWidth: 1400, recHeight: 400, previewClass: 'ratio-promo', previewMaxWidth: '100%', allowMultiple: false,
      key: 'media_new_arrivals', keyMobile: 'media_new_arrivals_mobile', isArray: false, hasMobile: true
    },
    { 
      id: 'Offers', title: 'Promotional Offers', subtitle: 'Recommended: 800 × 600 px', 
      recWidth: 800, recHeight: 600, previewClass: 'ratio-4x3', previewMaxWidth: '400px', allowMultiple: true,
      key: 'media_offers', isArray: true
    },
    // ABOUT US PAGE
    { 
      id: 'AboutHero', title: 'About Page Hero Banner', subtitle: 'Recommended: 1920 × 750 px', 
      recWidth: 1920, recHeight: 750, previewClass: 'ratio-hero', previewMaxWidth: '100%', allowMultiple: false,
      aboutKey: 'hero'
    },
    { 
      id: 'AboutStory', title: 'Our Story Media', subtitle: 'Recommended: 800 × 600 px', 
      recWidth: 800, recHeight: 600, previewClass: 'ratio-4x3', previewMaxWidth: '400px', allowMultiple: false,
      aboutKey: 'story', hasText: true
    },
    { 
      id: 'AboutMission', title: 'Mission Media', subtitle: 'Recommended: 800 × 600 px', 
      recWidth: 800, recHeight: 600, previewClass: 'ratio-4x3', previewMaxWidth: '400px', allowMultiple: false,
      aboutKey: 'mission', hasText: true
    },
    { 
      id: 'AboutVision', title: 'Vision Media', subtitle: 'Recommended: 800 × 600 px', 
      recWidth: 800, recHeight: 600, previewClass: 'ratio-4x3', previewMaxWidth: '400px', allowMultiple: false,
      aboutKey: 'vision', hasText: true
    },
    // SHOP PAGE
    { 
      id: 'ShopBanner', title: 'Shop Page Header Banner', subtitle: 'Recommended: 1920 × 400 px', 
      recWidth: 1920, recHeight: 400, previewClass: 'ratio-shop-banner', previewMaxWidth: '100%', allowMultiple: false,
      key: 'media_category_banner', isArray: false
    },
    // COMBO PAGE
    { 
      id: 'ComboBanner', title: 'Combo Page Header Banner', subtitle: 'Recommended: 1920 × 400 px', 
      recWidth: 1920, recHeight: 400, previewClass: 'ratio-shop-banner', previewMaxWidth: '100%', allowMultiple: false,
      key: 'media_combo_banner', isArray: false
    }
  ];

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getImageUrl = (url) => {
    if (!url) return '';
    let cleanedUrl = url;
    if (typeof cleanedUrl === 'string' && cleanedUrl.includes('/uploads/')) {
      cleanedUrl = cleanedUrl.substring(cleanedUrl.indexOf('/uploads/'));
    }
    if (cleanedUrl.startsWith('http') || cleanedUrl.startsWith('blob:')) return cleanedUrl;
    if (cleanedUrl.startsWith('/uploads/')) {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : '';
      return `${baseUrl}${cleanedUrl}`;
    }
    return cleanedUrl;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/settings');
      if (res.data.success && res.data.settings) {
        
        const st = res.data.settings;
        // Ensure arrays and objects exist
        if (!st.about_page_content) {
           st.about_page_content = {
             hero: { image: '', heading: '' },
             story: { image: '', tagline: '', heading: '', paragraphs: [''] },
             mission: { image: '', tagline: '', heading: '', paragraphs: [''] },
             vision: { image: '', tagline: '', heading: '', paragraphs: [''] }
           };
        }
        setSettings(st);
      }
    } catch (error) {
      showAlert('Failed to fetch settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e, section, idx = null, isMobile = false) => {
    const file = e.target.files[0];
    if (!file) return;

    const form = new FormData();
    form.append('file', file);
    
    try {
      showAlert('Uploading image...', 'info');
      const res = await api.post('/uploads', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const uploadedUrl = res.data.url || res.data.path || res.data;
      
      const newSettings = { ...settings };

      if (section.aboutKey) {
        newSettings.about_page_content = { ...newSettings.about_page_content };
        newSettings.about_page_content[section.aboutKey] = { 
          ...newSettings.about_page_content[section.aboutKey], 
          image: uploadedUrl 
        };
      } else if (section.isArray) {
        if (idx !== null) {
          if (!newSettings[section.key]) newSettings[section.key] = [];
          newSettings[section.key][idx] = uploadedUrl;
        } else {
          if (!newSettings[section.key]) newSettings[section.key] = [];
          newSettings[section.key].push(uploadedUrl);
        }
      } else {
        const keyToUpdate = isMobile ? section.keyMobile : section.key;
        newSettings[keyToUpdate] = uploadedUrl;
      }

      setSettings(newSettings);
      showAlert('Uploaded to draft. Please save section.', 'success');
    } catch (error) {
      showAlert('Upload failed', 'error');
    }
  };

  const handleRemoveItem = (section, idx = null, isMobile = false) => {
    const newSettings = { ...settings };
    if (section.aboutKey) {
        newSettings.about_page_content[section.aboutKey].image = '';
    } else if (section.isArray) {
        newSettings[section.key].splice(idx, 1);
    } else {
        const keyToUpdate = isMobile ? section.keyMobile : section.key;
        newSettings[keyToUpdate] = '';
    }
    setSettings(newSettings);
  };

  const handleAddEmpty = (section) => {
    const newSettings = { ...settings };
    if (!newSettings[section.key]) newSettings[section.key] = [];
    newSettings[section.key].push('');
    setSettings(newSettings);
  };

  const handleSaveSection = async (section) => {
    setSaving(true);
    try {
      const payload = { ...settings };
      const res = await api.put('/auth/settings', { settings: payload });
      if (res.data.success) {
        showAlert(`${section.title} saved successfully!`, 'success');
      }
    } catch (err) {
      showAlert('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
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

          <div className="row g-4">
            {PAGES.map(page => {
              const Icon = page.icon;
              return (
                <div key={page.id} className="col-md-6 col-lg-4">
                  <div 
                    className="card h-100 border-0 shadow-sm rounded-4 transition-all cursor-pointer overflow-hidden"
                    onClick={() => setSelectedPageId(page.id)}
                    style={{ borderTop: `4px solid ${page.color}` }}
                  >
                    <div className="card-body p-4 d-flex flex-column justify-content-between">
                      <div>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <div className="p-3 rounded-3" style={{ backgroundColor: page.bgLight, color: page.color }}>
                            <Icon size={24} />
                          </div>
                          <span className="badge px-3 py-2 rounded-pill fs-8 fw-semibold" style={{ backgroundColor: page.bgLight, color: page.color, border: `1px solid ${page.borderColor}` }}>
                            {page.badge}
                          </span>
                        </div>
                        <h5 className="fw-bold text-dark mb-2" style={{ fontSize: '18px' }}>{page.title}</h5>
                        <p className="text-muted fs-7 mb-4">{page.subtitle}</p>
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
        <>
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
            </div>
          </div>

          {currentSections.map(section => {
            
            // Extract items to render based on section type
            let items = [];
            
            if (section.aboutKey) {
                const img = settings.about_page_content?.[section.aboutKey]?.image || '';
                items = [{ image: img }];
            } else if (section.isArray) {
                items = (settings[section.key] || []).map((img, i) => ({ image: img, idx: i }));
            } else {
                items = [{ image: settings[section.key] || '' }];
                if (section.hasMobile) {
                    items.push({ image: settings[section.keyMobile] || '', isMobileLabel: true });
                }
            }

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
                      onClick={() => handleSaveSection(section)}
                      disabled={saving}
                    >
                      <Check size={16} /> Save Section
                    </button>
                  </div>

                  <div className="card-body p-4">
                    {items.length === 0 && !section.hasMobile && !section.aboutKey && !section.isArray ? (
                      <div className="p-4 text-center border rounded-3 bg-light text-muted">
                        <UploadCloud size={28} className="mb-2 text-secondary opacity-50" />
                        <p className="mb-0 small fw-medium">No banner uploaded.</p>
                      </div>
                    ) : (
                      items.map((item, index) => (
                        <div key={index} className="mb-4 pb-4 border-bottom last-border-none">
                          <div className="row g-4">
                            <div className="col-lg-6">
                              <div className="d-flex align-items-start mb-3">
                                <div className="flex-grow-1">
                                  <label className="fw-semibold mb-1" style={{ fontSize: '13px', color: '#4B5563' }}>
                                    {item.isMobileLabel ? 'Mobile Banner File' : 'Banner Image File'}
                                  </label>
                                  <div className="d-flex align-items-center gap-3 mt-1">
                                    <input 
                                      type="file" 
                                      className="form-control form-control-sm rounded-3" 
                                      style={{ maxWidth: '350px' }}
                                      accept="image/*"
                                      onChange={(e) => handleFileUpload(e, section, section.isArray ? item.idx : null, item.isMobileLabel)}
                                    />
                                    <button 
                                      className="btn btn-sm btn-outline-danger px-3 py-1 d-flex align-items-center gap-1 fs-7 fw-semibold rounded-3" 
                                      onClick={() => handleRemoveItem(section, section.isArray ? item.idx : null, item.isMobileLabel)}
                                    >
                                      <Trash2 size={14} /> Remove
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="col-lg-6">
                              <label className="fw-semibold mb-1 fs-8 text-uppercase tracking-wider" style={{ color: '#6B7280' }}>LIVE PREVIEW</label>
                              <div 
                                className={`banner-img-container ${item.isMobileLabel ? 'ratio-4x3' : section.previewClass} rounded-3 shadow-2xs`} 
                                style={{ border: '2px dashed #E5E7EB', backgroundColor: '#F9FAFB', maxWidth: item.isMobileLabel ? '300px' : section.previewMaxWidth }}
                              >
                                {item.image ? (
                                  <img src={getImageUrl(item.image)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                    
                    {section.isArray && (
                      <div className="mt-3">
                        <button 
                          className="btn btn-sm btn-outline-success px-4 py-2 fw-semibold rounded-3 d-flex align-items-center gap-2"
                          onClick={() => handleAddEmpty(section)}
                        >
                          <Plus size={16} /> Add Another
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
