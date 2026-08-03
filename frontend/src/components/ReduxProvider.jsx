'use client';

import { Provider, useDispatch } from 'react-redux';
import { store } from '../store/index.js';
import { useEffect, useRef } from 'react';
import { setCredentials } from '../store/authSlice.js';
import { hydrateCart } from '../store/cartSlice.js';
import { hydrateWishlist } from '../store/wishlistSlice.js';

import axios from 'axios';
import api from '../utils/axiosConfig.js';

function StateHydrator() {
  const dispatch = useDispatch();

  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    
    // Cart Hydration
    const cart = localStorage.getItem('maxglow_cart');
    if (cart) {
      try {
        const parsedCart = JSON.parse(cart);
        // Only keep items that have a valid 24-character hex ID for the product
        const validCart = parsedCart.filter(item => typeof item.product === 'string' && /^[0-9a-fA-F]{24}$/.test(item.product));
        
        if (validCart.length !== parsedCart.length) {
          localStorage.setItem('maxglow_cart', JSON.stringify(validCart));
        }
        dispatch(hydrateCart(validCart));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
    
    // Wishlist Hydration
    const wishlist = localStorage.getItem('maxglow_wishlist');
    if (wishlist) {
      dispatch(hydrateWishlist(JSON.parse(wishlist)));
    }

    // Session Restoration on Startup
    const initAuth = async () => {
      // Optimistic session restoration from localStorage
      const localUser = localStorage.getItem('maxglow_user');
      if (localUser) {
        try {
          dispatch(setCredentials(JSON.parse(localUser)));
        } catch (e) {
          localStorage.removeItem('maxglow_user');
        }
      } else {
        dispatch(setCredentials(null));
      }

      try {
        const profileRes = await axios.get(`${api.defaults.baseURL}/auth/profile`, { withCredentials: true });
        dispatch(setCredentials(profileRes.data.user));
      } catch (e) {
        // Only clear session if server explicitly says unauthorized (401/403)
        // If it's a network error (no response) or 500 error, keep the user logged in
        if (e.response && (e.response.status === 401 || e.response.status === 403)) {
          dispatch(setCredentials(null));
        }
      }
    };
    initAuth();
  }, [dispatch]);

  // Global Axios 401 Interceptor - Kept in a separate useEffect so it properly 
  // survives React 18 Strict Mode unmount/remount cycles.
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
          // Don't retry if it's the login or refresh endpoint itself
          if (originalRequest.url && (originalRequest.url.includes('/login') || originalRequest.url.includes('/refresh'))) {
            return Promise.reject(error);
          }
          
          originalRequest._retry = true;
          try {
             await axios.post(`${api.defaults.baseURL}/auth/refresh`, {}, { withCredentials: true });
             // The backend set a new HttpOnly access token cookie, so retry the original request
             return api(originalRequest);
          } catch(err) {
             // Only log out if the server explicitly says the refresh token is invalid/expired (401/403)
             if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                dispatch(setCredentials(null));
                if (typeof window !== 'undefined') {
                   window.location.href = '/login?session_expired=true';
                }
             }
             return Promise.reject(err);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, [dispatch]);

  return null;
}

export default function ReduxProvider({ children }) {
  return (
    <Provider store={store}>
      <StateHydrator />
      {children}
    </Provider>
  );
}
