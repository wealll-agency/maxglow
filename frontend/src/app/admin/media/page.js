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
  const [reels, setReels] = useState([
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
  ]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/auth/settings');
      if (res.data.success && res.data.settings) {
        const { media_hero, media_new_arrivals, media_offers, media_category_banner, media_reels } = res.data.settings;
        if (Array.isArray(media_hero) && media_hero.length) setHeroImages(media_hero);
        if (media_new_arrivals) setNewArrivals(media_new_arrivals);
        if (Array.isArray(media_offers) && media_offers.length) setOffers(media_offers);
        if (media_category_banner) setCategoryBanner(media_category_banner);
        if (Array.isArray(media_reels) && media_reels.length) setReels(media_reels);
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
    showAlert('Uploading media... Please wait.', 'info');

    try {
      const res = await api.post('/upload', formData, {
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

  const handleArrayChange = (setter, array, index, value) => {
    const newArr = [...array];
    newArr[index] = value;
    setter(newArr);
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

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold m-0" style={{ fontFamily: 'var(--font-outfit)' }}>Media Manager</h2>
      </div>

      <div className="row g-4">
        {/* Hero Slider */}
        <div className="col-12">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
              <div>
                <h5 className="fw-bold text-brand mb-1">1. Hero Slider Images</h5>
                <p className="text-muted small mb-0">Required Size: 1920x800px (21:9 Aspect Ratio). These images will auto-slide on the homepage.</p>
              </div>
              <button className="btn btn-sm btn-brand" onClick={() => handleSaveSection('Hero Images', { media_hero: heroImages })} disabled={saving || uploading}>
                Save
              </button>
            </div>
            <div className="card-body">
              {(Array.isArray(heroImages) ? heroImages : []).map((img, idx) => (
                <div key={idx} className="mb-3 d-flex gap-2 align-items-center">
                  <input
                    type="text"
                    className="form-control"
                    value={img}
                    onChange={(e) => handleArrayChange(setHeroImages, heroImages, idx, e.target.value)}
                    placeholder="Enter Image URL or path (e.g. /hero1.jpg)"
                  />
                  <span className="text-muted small">OR</span>
                  <input 
                    type="file" 
                    className="form-control" 
                    style={{ maxWidth: '250px' }} 
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, setHeroImages, true, heroImages, idx)} 
                  />
                  <button className="btn btn-outline-danger" onClick={() => removeArrayItem(setHeroImages, heroImages, idx)}>Remove</button>
                </div>
              ))}
              <button className="btn btn-outline-success btn-sm mt-2" onClick={() => addArrayItem(setHeroImages, heroImages)}>+ Add Another Image</button>
            </div>
          </div>
        </div>

        {/* New Arrivals */}
        <div className="col-12">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
              <div>
                <h5 className="fw-bold text-brand mb-1">2. New Arrivals Banner</h5>
                <p className="text-muted small mb-0">Required Size: 1400x400px. Displayed in the New Arrivals section.</p>
              </div>
              <button className="btn btn-sm btn-brand" onClick={() => handleSaveSection('New Arrivals', { media_new_arrivals: newArrivals })} disabled={saving || uploading}>
                Save
              </button>
            </div>
            <div className="card-body d-flex gap-2 align-items-center">
              <input
                type="text"
                className="form-control"
                value={newArrivals}
                onChange={(e) => setNewArrivals(e.target.value)}
                placeholder="Enter Image URL or path"
              />
              <span className="text-muted small">OR</span>
              <input 
                type="file" 
                className="form-control" 
                style={{ maxWidth: '250px' }} 
                accept="image/*"
                onChange={(e) => handleFileUpload(e, setNewArrivals)} 
              />
            </div>
          </div>
        </div>

        {/* Offers Banners */}
        <div className="col-12">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
              <div>
                <h5 className="fw-bold text-brand mb-1">3. Exclusive Offers Banners</h5>
                <p className="text-muted small mb-0">Required Size: 800x400px per image. (Currently supports 3 images side-by-side).</p>
              </div>
              <button className="btn btn-sm btn-brand" onClick={() => handleSaveSection('Offers Banners', { media_offers: offers })} disabled={saving || uploading}>
                Save
              </button>
            </div>
            <div className="card-body">
              {(Array.isArray(offers) ? offers : []).map((img, idx) => (
                <div key={idx} className="mb-3 d-flex gap-2 align-items-center">
                  <input
                    type="text"
                    className="form-control"
                    value={img}
                    onChange={(e) => handleArrayChange(setOffers, offers, idx, e.target.value)}
                    placeholder={`Offer Image URL ${idx + 1}`}
                  />
                  <span className="text-muted small">OR</span>
                  <input 
                    type="file" 
                    className="form-control" 
                    style={{ maxWidth: '250px' }} 
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, setOffers, true, offers, idx)} 
                  />
                  <button className="btn btn-outline-danger" onClick={() => removeArrayItem(setOffers, offers, idx)}>Remove</button>
                </div>
              ))}
              <button className="btn btn-outline-success btn-sm mt-2" onClick={() => addArrayItem(setOffers, offers)}>+ Add Another Offer</button>
            </div>
          </div>
        </div>

        {/* Category Banner */}
        <div className="col-12">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
              <div>
                <h5 className="fw-bold text-brand mb-1">4. Category Specific Banner (e.g., Luxury Hair Care)</h5>
                <p className="text-muted small mb-0">Required Size: 1920x300px. Shown on specific category pages.</p>
              </div>
              <button className="btn btn-sm btn-brand" onClick={() => handleSaveSection('Category Banner', { media_category_banner: categoryBanner })} disabled={saving || uploading}>
                Save
              </button>
            </div>
            <div className="card-body d-flex gap-2 align-items-center">
              <input
                type="text"
                className="form-control"
                value={categoryBanner}
                onChange={(e) => setCategoryBanner(e.target.value)}
                placeholder="Enter Image URL or path"
              />
              <span className="text-muted small">OR</span>
              <input 
                type="file" 
                className="form-control" 
                style={{ maxWidth: '250px' }} 
                accept="image/*"
                onChange={(e) => handleFileUpload(e, setCategoryBanner)} 
              />
            </div>
          </div>
        </div>

        {/* Reels Section */}
        <div className="col-12 mb-5">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
              <div>
                <h5 className="fw-bold text-brand mb-1">5. Reels / Watch & Buy</h5>
                <p className="text-muted small mb-0">Required Size: 1080x1920px (9:16). Maximum Duration: 10 Seconds per reel. Provide a Video URL.</p>
              </div>
              <button className="btn btn-sm btn-brand" onClick={() => handleSaveSection('Reels', { media_reels: reels })} disabled={saving || uploading}>
                Save
              </button>
            </div>
            <div className="card-body">
              {(Array.isArray(reels) ? reels : []).map((vid, idx) => (
                <div key={idx} className="mb-3 d-flex gap-2 align-items-center">
                  <input
                    type="text"
                    className="form-control"
                    value={vid}
                    onChange={(e) => handleArrayChange(setReels, reels, idx, e.target.value)}
                    placeholder={`Reel Video URL ${idx + 1}`}
                  />
                  <span className="text-muted small">OR</span>
                  <input 
                    type="file" 
                    className="form-control" 
                    style={{ maxWidth: '250px' }} 
                    accept="video/*"
                    onChange={(e) => handleFileUpload(e, setReels, true, reels, idx)} 
                  />
                  <button className="btn btn-outline-danger" onClick={() => removeArrayItem(setReels, reels, idx)}>Remove</button>
                </div>
              ))}
              <button className="btn btn-outline-success btn-sm mt-2" onClick={() => addArrayItem(setReels, reels)}>+ Add Another Reel</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
