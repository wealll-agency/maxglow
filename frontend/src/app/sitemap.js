export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.maxglow.in';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://www.maxglow.in/api';
  
  let products = [];
  try {
    const res = await fetch(`${apiUrl}/products?limit=1000`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      products = data.products || [];
    }
  } catch (error) {
    console.error('Error fetching products for sitemap:', error);
  }

  const staticRoutes = [
    '',
    '/shop',
    '/contact',
    '/about',
    '/privacy-policy',
    '/refund-policy',
    '/shipping-policy',
    '/terms',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));

  const productRoutes = products.map((product) => ({
    url: `${baseUrl}/product/${product.slug || product._id}`,
    lastModified: new Date(product.updatedAt || new Date()).toISOString(),
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  return [...staticRoutes, ...productRoutes];
}
