export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/checkout/',
        '/cart',
        '/user/',
        '/api/',
        '/login',
        '/register',
        '/wishlist',
      ],
    },
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL}/sitemap.xml`,
  };
}
