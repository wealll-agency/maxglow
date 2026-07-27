"use client";
import Link from 'next/link';
import Image from 'next/image';
import React, { useState, useEffect, memo } from 'react';
import api from '../utils/axiosConfig';
import HeroSlider from '../components/HeroSlider';
import CategoryIconRow from '../components/CategoryIconRow';
import ProductCarouselSection from '../components/ProductCarouselSection';
import ShopByPurpose from '../components/ShopByPurpose';
import CashewsBanner from '../components/CashewsBanner';
import Testimonials from '../components/Testimonials';
import ReelsSection from '../components/ReelsSection';
import NewArrivalBanner from '../components/NewArrivalBanner';
import {
  NuttyDelightOffers,
  ShopByCategoryCards,
  RecentBlogs,
  Faqs,
  TagsSection,
} from '../components/HomeSections';

export default function Home() {
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const [healthyProducts, setHealthyProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomepageProducts = async () => {
      try {
        const [topRes, newRes] = await Promise.all([
          api.get(`/products?topSelling=true&limit=8&inStock=true`),
          api.get(`/products?healthyProduct=true&limit=8&inStock=true`),
        ]);
        if (topRes.data.success) setTopSellingProducts(topRes.data.products || []);
        if (newRes.data.success) setHealthyProducts(newRes.data.products || []);
      } catch (error) {
        console.error("Error fetching homepage products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHomepageProducts();
  }, []);

  return (
    <main>
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

      {/* Healthy Products */}
      {healthyProducts.length > 0 && (
        <div style={{ background: 'linear-gradient(180deg, #F7FBFD 0%, #EAF8FF 100%)' }}>
          <ProductCarouselSection title="Healthy Picks" products={healthyProducts} />
        </div>
      )}

      {/* New Arrival Ad Banner */}
      <NewArrivalBanner />

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
