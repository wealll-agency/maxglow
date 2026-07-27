import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://www.maxglowon.com/api',
  withCredentials: true
});

export default api;
