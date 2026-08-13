import api from './axiosConfig';

let pendingSettingsPromise = null;
let cachedSettingsData = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 60000; // 1 minute client-side cache

/**
 * Deduplicated system settings fetcher.
 * Collapses concurrent calls across multiple components into 1 single HTTP request.
 */
export const fetchSystemSettings = async (forceRefresh = false) => {
  const now = Date.now();

  if (!forceRefresh && cachedSettingsData && (now - lastCacheTime < CACHE_TTL_MS)) {
    return cachedSettingsData;
  }

  if (pendingSettingsPromise && !forceRefresh) {
    return pendingSettingsPromise;
  }

  pendingSettingsPromise = (async () => {
    try {
      const res = await api.get(`/auth/settings?t=${now}`);
      if (res.data && res.data.success) {
        cachedSettingsData = res.data;
        lastCacheTime = Date.now();
        return cachedSettingsData;
      }
    } catch (err) {
      console.error('Failed to fetch system settings in cache wrapper:', err);
    } finally {
      pendingSettingsPromise = null;
    }
    return cachedSettingsData || { success: false, settings: {} };
  })();

  return pendingSettingsPromise;
};

export const invalidateSettingsCache = () => {
  cachedSettingsData = null;
  lastCacheTime = 0;
  pendingSettingsPromise = null;
};
