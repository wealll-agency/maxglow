"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { FiCheckCircle, FiAlertCircle, FiAlertTriangle, FiInfo, FiX } from 'react-icons/fi';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [confirmModal, setConfirmModal] = useState({ show: false, message: '' });
  
  const confirmResolver = useRef(null);
  const toastTimer = useRef(null);

  const showAlert = useCallback((message, type = 'info') => {
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }
    setToast({ show: true, message, type });
    toastTimer.current = setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  }, []);

  const hideAlert = useCallback(() => {
    setToast(prev => ({ ...prev, show: false }));
  }, []);

  const showConfirm = useCallback((message) => {
    setConfirmModal({ show: true, message });
    return new Promise((resolve) => {
      confirmResolver.current = resolve;
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setConfirmModal({ show: false, message: '' });
    if (confirmResolver.current) {
      confirmResolver.current(true);
      confirmResolver.current = null;
    }
  }, []);

  const handleCancel = useCallback(() => {
    setConfirmModal({ show: false, message: '' });
    if (confirmResolver.current) {
      confirmResolver.current(false);
      confirmResolver.current = null;
    }
  }, []);

  const getToastConfig = (type) => {
    switch (type) {
      case 'error':
      case 'danger':
        return {
          icon: <FiAlertCircle size={20} color="#EF4444" />,
          bg: '#FFFFFF',
          border: '1px solid #FEE2E2',
          borderLeft: '4px solid #EF4444',
          iconBg: '#FEF2F2',
          textColor: '#1f2937',
        };
      case 'success':
        return {
          icon: <FiCheckCircle size={20} color="#10B981" />,
          bg: '#FFFFFF',
          border: '1px solid #D1FAE5',
          borderLeft: '4px solid #10B981',
          iconBg: '#ECFDF5',
          textColor: '#1f2937',
        };
      case 'warning':
        return {
          icon: <FiAlertTriangle size={20} color="#F59E0B" />,
          bg: '#FFFFFF',
          border: '1px solid #FEF3C7',
          borderLeft: '4px solid #F59E0B',
          iconBg: '#FFFBEB',
          textColor: '#1f2937',
        };
      default: // info
        return {
          icon: <FiInfo size={20} color="#3B82F6" />,
          bg: '#FFFFFF',
          border: '1px solid #DBEAFE',
          borderLeft: '4px solid #3B82F6',
          iconBg: '#EFF6FF',
          textColor: '#1f2937',
        };
    }
  };

  return (
    <NotificationContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      
      {/* Industry Standard Toast Notification */}
      {toast.show && (() => {
        const config = getToastConfig(toast.type);
        return (
          <div
            style={{
              position: 'fixed',
              top: '24px',
              right: '24px',
              zIndex: 99999,
              animation: 'toastSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: config.bg,
                border: config.border,
                borderLeft: config.borderLeft,
                borderRadius: '14px',
                padding: '14px 18px',
                boxShadow: '0 12px 36px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.04)',
                minWidth: '280px',
                maxWidth: '420px',
              }}
            >
              {/* Icon Badge */}
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: config.iconBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {config.icon}
              </div>

              {/* Message */}
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: '13.5px',
                    fontWeight: '600',
                    color: config.textColor,
                    lineHeight: '1.4',
                    fontFamily: 'var(--font-outfit), sans-serif',
                  }}
                >
                  {toast.message}
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={hideAlert}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#374151')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
              >
                <FiX size={16} />
              </button>
            </div>
          </div>
        );
      })()}

      {/* Confirmation Modal */}
      {confirmModal.show && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100000,
            background: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '20px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
              padding: '28px 32px',
              maxWidth: '420px',
              width: '100%',
              textAlign: 'center',
              border: '1px solid rgba(221,244,255,0.8)',
            }}
          >
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%', background: '#FEF3C7',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto'
            }}>
              <FiAlertTriangle size={24} color="#F59E0B" />
            </div>
            <h3 style={{ fontFamily: 'var(--font-outfit)', fontSize: '18px', fontWeight: '800', color: '#1a2332', marginBottom: '10px' }}>
              Confirmation Required
            </h3>
            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6', marginBottom: '24px' }}>
              {confirmModal.message}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={handleCancel}
                className="btn-mg-outline"
                style={{ flex: 1, padding: '10px 20px', fontSize: '14px', justifyContent: 'center' }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="btn-mg-primary"
                style={{ flex: 1, padding: '10px 20px', fontSize: '14px', justifyContent: 'center' }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};
