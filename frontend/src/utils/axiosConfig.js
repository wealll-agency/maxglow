import axios from 'axios';

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://127.0.0.1:7052/api';
    }
    return `${window.location.origin}/api`;
  }
  return 'https://maxglow.in/api';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true
});

export default api;
