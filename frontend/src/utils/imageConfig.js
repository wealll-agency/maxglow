export const getImageUrl = (url) => {
  if (!url) return '/placeholder.png';
  let cleanedUrl = url;
  if (typeof cleanedUrl === 'string' && (cleanedUrl.includes('localhost') || cleanedUrl.includes('127.0.0.1'))) {
    if (cleanedUrl.includes('/uploads/')) {
      cleanedUrl = cleanedUrl.substring(cleanedUrl.indexOf('/uploads/'));
    }
  }
  if (cleanedUrl.startsWith('http') || cleanedUrl.startsWith('blob:')) return cleanedUrl;
  if (cleanedUrl.startsWith('/uploads/')) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : '';
    if (cleanedUrl.toLowerCase().endsWith('.mp4') || cleanedUrl.toLowerCase().endsWith('.webm')) {
      return `${baseUrl}/api${cleanedUrl}`;
    }
    return `${baseUrl}${cleanedUrl}`;
  }
  if (cleanedUrl.startsWith('/assets/images/')) {
    return cleanedUrl.replace('/assets/images/', '/');
  }
  return cleanedUrl;
};
