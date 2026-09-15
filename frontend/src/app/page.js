import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import HeroSlider from '../components/HeroSlider';
import CategoryIconRow from '../components/CategoryIconRow';
import { NuttyDelightOffers, ShopByCategoryCards, Faqs, TagsSection } from '../components/HomeSections';
import ProductCarouselSection from '../components/ProductCarouselSection';
import NewArrivalBanner from '../components/NewArrivalBanner';

// Dynamic imports for standalone below-the-fold components
const ShopByPurpose = dynamic(() => import('../components/ShopByPurpose'));
const ReelsSection = dynamic(() => import('../components/ReelsSection'));
const CashewsBanner = dynamic(() => import('../components/CashewsBanner'));
const Testimonials = dynamic(() => import('../components/Testimonials'));

async function getHomepageProducts() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://maxglow.in/api';
  try {
    const [topRes, arrivalRes, trendingRes, customRes] = await Promise.all([
      fetch(`${baseUrl}/products?topSelling=true&limit=8&inStock=true`, { cache: 'no-store' }),
      fetch(`${baseUrl}/products?newArrival=true&limit=8&inStock=true`, { cache: 'no-store' }),
      fetch(`${baseUrl}/products?featured=true&limit=8&inStock=true`, { cache: 'no-store' }),
      fetch(`${baseUrl}/custom-sections?isActive=true`, { cache: 'no-store' }),
    ]);
    const topData = await topRes.json();
    const arrivalData = await arrivalRes.json();
    const trendingData = await trendingRes.json();
    const customData = await customRes.json();
    return {
      topSellingProducts: topData.success ? topData.products || [] : [],
      newArrivalProducts: arrivalData.success ? arrivalData.products || [] : [],
      trendingProducts: trendingData.success ? trendingData.products || [] : [],
      customSections: customData.success ? customData.sections || [] : []
    };
  } catch (error) {
    console.error("Error fetching homepage products:", error);
    return { topSellingProducts: [], newArrivalProducts: [], trendingProducts: [], customSections: [] };
  }
}

export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function generateMetadata() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  return {
    alternates: {
      canonical: `${appUrl}/`,
    },
  };
}

export default async function Home() {
  const { topSellingProducts, newArrivalProducts, trendingProducts, customSections } = await getHomepageProducts();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'MaxGlow',
    url: process.env.NEXT_PUBLIC_APP_URL,
    logo: `${process.env.NEXT_PUBLIC_APP_URL}/icon.png`,
    description: 'Premium herbal products for Healthy Skin, Hair & Life.',
  };

  return (
    <main style={{ display: 'flex', flexDirection: 'column' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero Section */}
      <HeroSlider />

      {/* Category Icons Row */}
      <CategoryIconRow />

      {/* Offer Banners */}
      <NuttyDelightOffers />

      {/* Top Selling Products */}
      {topSellingProducts.length > 0 && (
        <ProductCarouselSection title="Top Selling Products" products={topSellingProducts} />
      )}

      {/* Shop By Categories — card grid matching reference */}
      <ShopByCategoryCards />



      {/* New Arrival Ad Banner */}
      <NewArrivalBanner />

      {/* New Arrivals Product Carousel */}
      {newArrivalProducts.length > 0 && (
        <ProductCarouselSection title="New Arrivals" products={newArrivalProducts} />
      )}

      {/* Shop By Purpose */}
      <ShopByPurpose />

      {/* Reels / Watch & Buy */}
      <ReelsSection />

      {/* Banner */}
      <CashewsBanner />

      {/* Trending Products Carousel */}
      {trendingProducts.length > 0 && (
        <ProductCarouselSection title="Trending Products" products={trendingProducts} />
      )}

      {/* Custom Dynamic Sections */}
      {customSections && customSections.map((section, idx) => (
        section.products && section.products.length > 0 && (
          <ProductCarouselSection key={section._id || idx} title={section.title} products={section.products} />
        )
      ))}

      {/* Faqs */}
      <Faqs />

      {/* Testimonials */}
      <Testimonials />

      {/* Tags */}
      <TagsSection />
    </main>
  );
}
