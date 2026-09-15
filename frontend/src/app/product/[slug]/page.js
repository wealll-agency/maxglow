import ShopDetailsClient from './ShopDetailsClient';
import { Suspense } from 'react';

// Next.js server fetch cache behavior with ISR (60s revalidation)
export const revalidate = 60;

async function getProductData(id) {
  if (!id) return null;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://www.maxglow.in/api';
  try {
    const res = await fetch(`${baseUrl}/products/${id}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.success ? data.product : null;
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { slug } = params;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  
  const defaultMeta = {
    title: 'MaxGlow — Premium Herbal Wellness | Product',
    description: 'Premium herbal wellness product.',
    alternates: {
      canonical: `${appUrl}/product/${slug}`,
    },
  };

  if (!slug) {
    return defaultMeta;
  }

  const product = await getProductData(slug);
  
  if (!product) {
    return defaultMeta;
  }

  const canonicalUrl = `${appUrl}/product/${product.slug || product._id}`;

  return {
    title: product.metaTitle || `${product.name} | MaxGlow`,
    description: product.metaDescription || (product.description ? product.description.substring(0, 160) : defaultMeta.description),
    openGraph: {
      title: product.metaTitle || `${product.name} | MaxGlow`,
      description: product.metaDescription || (product.description ? product.description.substring(0, 160) : defaultMeta.description),
      images: product.images && product.images.length > 0 ? [{ url: product.images[0] }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.metaTitle || `${product.name} | MaxGlow`,
      description: product.metaDescription || (product.description ? product.description.substring(0, 160) : defaultMeta.description),
      images: product.images && product.images.length > 0 ? [product.images[0]] : [],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function Page({ params }) {
  const { slug } = params;
  const product = await getProductData(slug);
  
  let jsonLd = null;

  if (product) {
    // Strictly whitelist public fields for JSON-LD. 
    // Do NOT serialize the entire DB object.
    const price = product.discountedPrice || (product.discountType === 'Percent' ? Math.round(product.price * (1 - product.discount / 100)) : Math.max(0, product.price - (product.discount || 0)));

    jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      image: product.images && product.images.length > 0 ? product.images : [],
      description: product.description || '',
      brand: {
        '@type': 'Brand',
        name: product.brand || 'MaxGlow',
      },
      offers: {
        '@type': 'Offer',
        url: `${process.env.NEXT_PUBLIC_APP_URL}/product/${product.slug || product._id}`,
        priceCurrency: 'INR',
        price: price,
        availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      },
    };
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ShopDetailsClient initialProduct={product} />
    </>
  );
}
