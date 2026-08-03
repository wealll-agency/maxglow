export const getImageUrl = (url) => {
  if (!url) return '/placeholder.png';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/uploads/')) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'https://maxglow.in';
    return `${baseUrl}${url}`;
  }
  if (url.startsWith('/assets/images/')) {
    return url.replace('/assets/images/', '/');
  }
  return url;
};
