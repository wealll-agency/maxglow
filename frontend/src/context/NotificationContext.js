"use client";


import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

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
  
  // We need a ref to store the resolver function so we can resolve the Promise
  // when the user clicks Confirm or Cancel
  const confirmResolver = useRef(null);
  
  // Timer for toast auto-hide
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

  // Map our simple types to bootstrap classes
  const getToastClass = (type) => {
    if (type === 'error' || type === 'danger') return 'text-bg-danger';
    if (type === 'success') return 'text-bg-success';
    if (type === 'warning') return 'text-bg-warning';
    return 'text-bg-dark'; // default
  };

  return (
    <NotificationContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      
      {/* Bootstrap Toast */}
      <div 
        className="toast-container position-fixed top-0 end-0 p-3" 
        style={{ zIndex: 9999 }}
      >
        <div 
          className={`toast align-items-center border-0 ${toast.show ? 'show' : 'hide'} ${getToastClass(toast.type)}`} 
          role="alert" 
          aria-live="assertive" 
          aria-atomic="true"
        >
          <div className="d-flex">
            <div className="toast-body fw-medium">
              {toast.message}
            </div>
            <button 
              type="button" 
              className={`btn-close btn-close-white me-2 m-auto`} 
              onClick={hideAlert} 
              aria-label="Close"
            ></button>
          </div>
        </div>
      </div>

      {/* Bootstrap Modal for Confirm */}
      {confirmModal.show && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 10000, backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content shadow border-0 rounded-4">
                <div className="modal-header border-bottom-0 pb-0">
                  <h5 className="modal-title fw-bold text-dark">Confirmation</h5>
                  <button type="button" className="btn-close" onClick={handleCancel}></button>
                </div>
                <div className="modal-body py-4">
                  <p className="mb-0 fs-5 text-center text-muted">{confirmModal.message}</p>
                </div>
                <div className="modal-footer border-top-0 d-flex justify-content-center gap-3 pb-4">
                  <button type="button" className="btn btn-light px-4 py-2 fw-medium rounded-3" onClick={handleCancel}>Cancel</button>
                  <button type="button" className="btn btn-brand px-4 py-2 fw-medium rounded-3" onClick={handleConfirm}>Confirm</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </NotificationContext.Provider>
  );
};
