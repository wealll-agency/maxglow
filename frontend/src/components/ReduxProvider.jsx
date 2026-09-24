'use client';

import { Provider, useDispatch } from 'react-redux';
import { store } from '../store/index.js';
import { useEffect, useRef } from 'react';
import { setCredentials } from '../store/authSlice.js';
import { hydrateCart, setCartSyncing, setShippingTiers } from '../store/cartSlice.js';
import { hydrateWishlist } from '../store/wishlistSlice.js';
import { hydrateProducts } from '../store/productsSlice.js';

import axios from 'axios';
import api from '../utils/axiosConfig.js';

function StateHydrator() {
  const dispatch = useDispatch();

  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    // Delay hydration to ensure it happens strictly AFTER React's initial hydration phase
    const timer = setTimeout(() => {
      
    // Clean up old Razorpay garbage from local storage
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('rzp_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {}
      // Products Hydration (Instant Shop Catalog rendering from Cache)
    const cachedProducts = localStorage.getItem('maxglow_cached_products');
    if (cachedProducts) {
      try {
        const parsed = JSON.parse(cachedProducts);
        if (Array.isArray(parsed) && parsed.length > 0) {
          dispatch(hydrateProducts(parsed));
        }
      } catch (e) {
        console.error("Failed to parse cached products", e);
      }
    }
    
    // Cart Hydration
    const cart = localStorage.getItem('maxglow_cart');
    let validCart = [];
    if (cart) {
      try {
        const parsedCart = JSON.parse(cart);
        if (Array.isArray(parsedCart)) {
          validCart = parsedCart.filter(item => {
            const prodId = typeof item.product === 'object' ? item.product?._id : item.product;
            const comboId = typeof item.combo === 'object' ? item.combo?._id : item.combo;
            const targetId = prodId || comboId;
            return typeof targetId === 'string' && /^[0-9a-fA-F]{24}$/.test(targetId);
          });
          
          if (validCart.length !== parsedCart.length) {
            localStorage.setItem('maxglow_cart', JSON.stringify(validCart));
          }
        }
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
    dispatch(hydrateCart(validCart));
    
    // Wishlist Hydration
    const wishlist = localStorage.getItem('maxglow_wishlist');
    if (wishlist) {
      dispatch(hydrateWishlist(JSON.parse(wishlist)));
    }

    // Fetch Global Settings (Shipping Tiers)
    const fetchSettings = async () => {
      try {
        const res = await api.get('/auth/settings');
        if (res.data.success && res.data.settings?.shipping_tiers) {
          dispatch(setShippingTiers(res.data.settings.shipping_tiers));
        }
      } catch (err) {
        console.error("Failed to fetch settings", err);
      }
    };
    fetchSettings();

    // Session Restoration on Startup
    const initAuth = async () => {
      // Optimistic session restoration from localStorage
        const localUser = localStorage.getItem('maxglow_user');
        let parsedUser = null;
        if (localUser) {
          try {
            const rawParsed = JSON.parse(localUser);
            if (typeof rawParsed === 'string' && typeof atob !== 'undefined') {
              parsedUser = JSON.parse(decodeURIComponent(atob(rawParsed)));
            } else {
              parsedUser = rawParsed; // Fallback for old unencoded data
            }
            dispatch(setCredentials(parsedUser));
          } catch (e) {
            localStorage.removeItem('maxglow_user');
          }
        }
        
        if (!parsedUser) {
          dispatch(setCredentials(null));
          dispatch(setCartSyncing(false));
          return;
        }

        // Only fetch profile to validate session if we have a localUser,
        // otherwise we unnecessarily trigger a 401 Unauthorized log in the console for guests.
        try {
          const profileRes = await api.get(`/auth/profile`);
          dispatch(setCredentials(profileRes.data.user));

          try {
            const userDataRes = await api.get(`/user/data`);
            if (userDataRes.data.cart) dispatch(hydrateCart(userDataRes.data.cart));
            if (userDataRes.data.wishlist) dispatch(hydrateWishlist(userDataRes.data.wishlist));
          } catch (err) {
            console.error("Failed to fetch user cart and wishlist", err);
          }
        } catch (e) {
          // If the server explicitly rejects the token as invalid/expired (401), log them out.
          // We DO NOT log out on 403 (Forbidden) because that just means lack of role permission, not expired session!
          if (e.response && e.response.status === 401) {
            localStorage.removeItem('maxglow_user');
            dispatch(setCredentials(null));
          }
        } finally {
          // Tell the rest of the app (like checkout) that sync is complete
          dispatch(setCartSyncing(false));
        }
      };
      initAuth();
    }, 10);

    return () => clearTimeout(timer);
  }, [dispatch]);

  // Global Axios 401 Interceptor
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
             const refreshResponse = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {}, { withCredentials: true });
             if (refreshResponse.data && refreshResponse.data.token && typeof window !== 'undefined') {
                localStorage.setItem('maxglow_token', refreshResponse.data.token);
             }
             return api(originalRequest);
          } catch(err) {
             if (err.response && err.response.status === 401) {
                dispatch(setCredentials(null));
                if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
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
