"use client";
import Link from 'next/link';
import Image from 'next/image';
import React, { useState, useEffect, memo } from 'react';
import api from '../utils/axiosConfig';
import dynamic from 'next/dynamic';
import HeroSlider from '../components/HeroSlider';
import CategoryIconRow from '../components/CategoryIconRow';
import { NuttyDelightOffers } from '../components/HomeSections';

const ProductCarouselSection = dynamic(() => import('../components/ProductCarouselSection'), { ssr: true });
const ShopByPurpose = dynamic(() => import('../components/ShopByPurpose'), { ssr: true });
const CashewsBanner = dynamic(() => import('../components/CashewsBanner'), { ssr: false });
const Testimonials = dynamic(() => import('../components/Testimonials'), { ssr: false });
const ReelsSection = dynamic(() => import('../components/ReelsSection'), { ssr: false });
const NewArrivalBanner = dynamic(() => import('../components/NewArrivalBanner'), { ssr: true });
const ShopByCategoryCards = dynamic(() => import('../components/HomeSections').then(mod => mod.ShopByCategoryCards), { ssr: true });
const RecentBlogs = dynamic(() => import('../components/HomeSections').then(mod => mod.RecentBlogs), { ssr: false });
const Faqs = dynamic(() => import('../components/HomeSections').then(mod => mod.Faqs), { ssr: false });
const TagsSection = dynamic(() => import('../components/HomeSections').then(mod => mod.TagsSection), { ssr: false });

export default function Home() {
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const [newArrivalProducts, setNewArrivalProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomepageProducts = async () => {
      try {
        const [topRes, arrivalRes] = await Promise.all([
          api.get(`/products?topSelling=true&limit=8&inStock=true`),
          api.get(`/products?newArrival=true&limit=8&inStock=true`),
        ]);
        if (topRes.data.success) setTopSellingProducts(topRes.data.products || []);
        if (arrivalRes.data.success) setNewArrivalProducts(arrivalRes.data.products || []);
      } catch (error) {
        console.error("Error fetching homepage products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHomepageProducts();
  }, []);

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
