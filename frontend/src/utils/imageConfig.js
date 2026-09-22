export const getImageUrl = (url) => {
  if (!url || url === 'null' || url === 'undefined') return '/placeholder.png';
  let cleanedUrl = url;
  if (typeof cleanedUrl === 'string' && cleanedUrl.includes('/uploads/')) {
    cleanedUrl = cleanedUrl.substring(cleanedUrl.indexOf('/uploads/'));
  }
  if (cleanedUrl.startsWith('http') || cleanedUrl.startsWith('blob:')) return cleanedUrl;
  if (cleanedUrl.startsWith('/uploads/')) {
    if (cleanedUrl.toLowerCase().endsWith('.mp4') || cleanedUrl.toLowerCase().endsWith('.webm')) {
      return `/api${cleanedUrl}`;
    }
    return cleanedUrl;
  }
  if (cleanedUrl.startsWith('/assets/images/')) {
    return cleanedUrl.replace('/assets/images/', '/');
  }
  return cleanedUrl;
};
