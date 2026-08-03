import axios from 'axios';

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // If running locally, ALWAYS match the exact hostname the browser is on.
    // This prevents SameSite=lax from dropping cookies when .env has 127.0.0.1 but browser is on localhost (or vice versa).
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return `http://${window.location.hostname}:7052/api`;
    }
  }

  // Fallback for SSR or if explicitly set for production
  if (process.env.NEXT_PUBLIC_API_URL) {
    let url = process.env.NEXT_PUBLIC_API_URL;
    // Ensure SSR matching for Windows localhost quirks
    if (typeof window !== 'undefined' && url.includes('127.0.0.1') && window.location.hostname === 'localhost') {
      url = url.replace('127.0.0.1', 'localhost');
    }
    return url;
  }
  
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api`;
  }
  
  return 'https://maxglow.in/api';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true
});

export default api;
