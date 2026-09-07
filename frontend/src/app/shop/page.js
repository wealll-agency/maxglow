import { Suspense } from 'react';
import ShopClient from './ShopClient';

export async function generateMetadata({ searchParams }) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const canonicalUrl = new URL(`${appUrl}/shop`);
  
  if (searchParams.category) {
    canonicalUrl.searchParams.set('category', searchParams.category);
  }
  
  return {
    title: 'MaxGlow — Premium Herbal Wellness | Shop',
    description: 'Browse our collection of premium herbal wellness products. Natural, pure, and effective.',
    alternates: {
      canonical: canonicalUrl.toString(),
    },
  };
}

function resolveApiUrl() {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (process.env.NODE_ENV === 'production' && !url) {
    throw new Error('FATAL CONFIGURATION ERROR: NEXT_PUBLIC_API_URL is missing in production environment. Refusing to fallback to localhost silently.');
  }
  return url || 'http://localhost:7052/api';
}

async function getProducts(searchParams) {
  const queryParams = new URLSearchParams();
  
  // Map frontend URL params to backend API params
  if (searchParams.category) queryParams.set('category', searchParams.category);
  if (searchParams.keyword) queryParams.set('keyword', searchParams.keyword);
  if (searchParams.minPrice) queryParams.set('minPrice', searchParams.minPrice);
  if (searchParams.maxPrice) queryParams.set('maxPrice', searchParams.maxPrice);
  if (searchParams.brand) queryParams.set('brand', searchParams.brand);
  
  // Pagination
  const page = searchParams.page || '1';
  queryParams.set('page', page);
  queryParams.set('limit', '12');

  // Sorting
  if (searchParams.sort) {
    if (searchParams.sort === 'Price: Low to High') queryParams.set('sort', 'priceAsc');
    else if (searchParams.sort === 'Price: High to Low') queryParams.set('sort', 'priceDesc');
    else if (searchParams.sort === 'Newest') queryParams.set('sort', 'newest');
  }

  const baseUrl = resolveApiUrl();
  
  const res = await fetch(`${baseUrl}/products?${queryParams.toString()}`, {
    cache: 'no-store' // Always fetch fresh data based on URL params
  });
  
  if (!res.ok) {
    throw new Error(`Failed to fetch products: ${res.status} ${res.statusText}`);
  }
  
  const data = await res.json();
  return {
    products: data.products || [],
    totalPages: data.pages || 1,
    currentPage: data.currentPage || 1,
    totalProducts: data.total || 0
  };
}

async function getCategories() {
  const baseUrl = resolveApiUrl();
  try {
    const res = await fetch(`${baseUrl}/categories`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.categories || [];
  } catch (error) {
    return [];
  }
}

async function getSettings() {
  const baseUrl = resolveApiUrl();
  try {
    const res = await fetch(`${baseUrl}/auth/settings`, { next: { revalidate: 3600 } });
    if (!res.ok) return {};
    const data = await res.json();
    return data.settings || {};
  } catch (error) {
    return {};
  }
}

export default async function ShopPage({ searchParams }) {
  const [productsData, categories, settings] = await Promise.all([
    getProducts(searchParams),
    getCategories(),
    getSettings()
  ]);

  const breadcrumbList = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: process.env.NEXT_PUBLIC_APP_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Shop',
        item: `${process.env.NEXT_PUBLIC_APP_URL}/shop`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbList) }}
      />
      <Suspense fallback={
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #3BAE56', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      }>
        <ShopClient 
          initialParams={searchParams}
          initialProducts={productsData.products} 
          pagination={{
            totalPages: productsData.totalPages,
            currentPage: productsData.currentPage,
            totalProducts: productsData.totalProducts
          }}
          serverCategories={categories.map(c => c.name)}
          serverSettings={settings}
        />
      </Suspense>
    </>
  );
}
