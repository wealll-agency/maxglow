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
    const [topRes, arrivalRes] = await Promise.all([
      fetch(`${baseUrl}/products?topSelling=true&limit=8&inStock=true`, { next: { revalidate: 60 } }),
      fetch(`${baseUrl}/products?newArrival=true&limit=8&inStock=true`, { next: { revalidate: 60 } }),
    ]);
    const topData = await topRes.json();
    const arrivalData = await arrivalRes.json();
    return {
      topSellingProducts: topData.success ? topData.products || [] : [],
      newArrivalProducts: arrivalData.success ? arrivalData.products || [] : []
    };
  } catch (error) {
    console.error("Error fetching homepage products:", error);
    return { topSellingProducts: [], newArrivalProducts: [] };
  }
}

export default async function Home() {
  const { topSellingProducts, newArrivalProducts } = await getHomepageProducts();

  return (
    <main style={{ display: 'flex', flexDirection: 'column' }}>
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

      {/* Faqs */}
      <Faqs />

      {/* Testimonials */}
      <Testimonials />

      {/* Tags */}
      <TagsSection />
    </main>
  );
}
