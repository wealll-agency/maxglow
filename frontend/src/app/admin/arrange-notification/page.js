"use client";

import { useState, useEffect } from 'react';
import { useNotification } from '../../../context/NotificationContext';
import api from '../../../utils/axiosConfig';
import { invalidateSettingsCache } from '../../../utils/settingsCache';

export default function ArrangeNotification() {
  const { showAlert } = useNotification();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    text: '🌿 MaxGlow Grand Sale — Up to 60% OFF on Premium Herbal Products! Shop Now!',
    bgColor: '#DDF4FF',
    textColor: '#2d6a4f',
    speed: 30
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/auth/settings');
        if (res.data.success && res.data.settings.notification_settings) {
          setSettings(res.data.settings.notification_settings);
        }
      } catch (error) {
        showAlert('Failed to load settings', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, [showAlert]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/auth/settings', {
        settings: {
          notification_settings: settings
        }
      });
      invalidateSettingsCache();
      showAlert('Notification settings updated', 'success');
    } catch (error) {
      showAlert('Failed to update settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-5 text-center">Loading...</div>;

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fw-bold m-0 display-font">Arrange Notification</h1>
      </div>

      <div className="mg-card p-4">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="form-label fw-bold">Notification Text</label>
            <input 
              type="text" 
              className="mg-input" 
              name="text" 
              value={settings.text} 
              onChange={handleChange} 
              placeholder="Enter announcement text..."
              required
            />
            <small className="text-muted d-block mt-1">This text will scroll continuously on the top bar.</small>
          </div>

          <div className="mb-4">
            <label className="form-label fw-bold">Background Color</label>
            <input 
              type="color" 
              className="form-control form-control-color w-100 mg-input p-1" 
              name="bgColor" 
              value={settings.bgColor} 
              onChange={handleChange} 
              style={{ height: '50px', cursor: 'pointer' }}
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-bold">Text Color</label>
            <input 
              type="color" 
              className="form-control form-control-color w-100 mg-input p-1" 
              name="textColor" 
              value={settings.textColor} 
              onChange={handleChange} 
              style={{ height: '50px', cursor: 'pointer' }}
            />
          </div>

          <div className="mb-4 bg-light p-4 rounded-4 border border-light shadow-sm">
            <label className="form-label fw-bold d-flex justify-content-between align-items-center mb-3">
              <span>Sliding Speed</span>
              <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 fs-6 rounded-pill px-3 py-2">
                {settings.speed} seconds
              </span>
            </label>
            <input 
              type="range" 
              className="form-range w-100 py-2" 
              name="speed" 
              value={settings.speed} 
              onChange={handleChange} 
              min="1"
              max="120"
              step="1"
            />
            <div className="d-flex justify-content-between mt-2 text-muted small fw-medium">
              <span>🚀 Faster (1s)</span>
              <span>🐢 Slower (120s)</span>
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label fw-bold">Live Preview</label>
            <div 
              className="rounded overflow-hidden position-relative" 
              style={{ backgroundColor: settings.bgColor, border: '1px solid rgba(0,0,0,0.1)', height: '36px', display: 'flex', alignItems: 'center' }}
            >
               <div style={{ display: 'inline-flex', animation: `scroll-left ${settings.speed}s linear infinite` }}>
                 <div style={{ display: 'inline-flex', gap: '3rem', paddingRight: '3rem' }}>
                   {[...Array(10)].map((_, i) => (
                     <span key={`prev-a-${i}`} style={{ fontSize: '12px', fontWeight: '500', color: settings.textColor, whiteSpace: 'nowrap' }}>
                       {settings.text}
                     </span>
                   ))}
                 </div>
                 <div style={{ display: 'inline-flex', gap: '3rem', paddingRight: '3rem' }}>
                   {[...Array(10)].map((_, i) => (
                     <span key={`prev-b-${i}`} style={{ fontSize: '12px', fontWeight: '500', color: settings.textColor, whiteSpace: 'nowrap' }}>
                       {settings.text}
                     </span>
                   ))}
                 </div>
               </div>
            </div>
          </div>

          <button type="submit" className="btn-mg-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </div>
    </div>
  );
}
