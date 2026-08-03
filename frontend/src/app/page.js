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
