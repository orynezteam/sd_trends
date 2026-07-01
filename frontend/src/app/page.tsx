'use client';

import React, { useState } from 'react';
import Header from '../components/Header/Header';
import HeroSlider from '../components/HeroSlider/HeroSlider';
import LatestProducts from '../components/LatestProducts/LatestProducts';
import FeaturedProducts from '../components/FeaturedProducts/FeaturedProducts';
import HighlightsBanner from '../components/HighlightsBanner/HighlightsBanner';
import BraceletBanner from '../components/BraceletBanner/BraceletBanner';
import Banners from '../components/Banners/Banners';
import Services from '../components/Services/Services';
import Testimonials from '../components/Testimonials/Testimonials';
import Footer from '../components/Footer/Footer';
import QuickView from '../components/QuickView/QuickView';
import CCategories from '../components/Categories/Categories';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleSelectCategory = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handleClearCategory = () => {
    setSelectedCategory(null);
  };

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Premium Header Bar (CORS and live search enabled) */}
      <Header />

      {/* Main Homepage Flow */}
      <main style={{ flex: '1' }}>
        {/* Dynamic Hero Slider */}
        <HeroSlider />

        {/* Premium services/values grid */}
        <Services />

        {/* Promotion Banners - Rings, Bracelet, Pendant */}
        <Banners />

        {/* Latest Products Section (Mockup Replica) */}
        <LatestProducts />

        {/* Categories Grid - triggers scroll and category filters */}
        <CCategories onSelectCategory={handleSelectCategory} />

        {/* Bracelet Promo Banner Section */}
        <BraceletBanner />

        {/* Featured Products Section */}
        <FeaturedProducts />

        {/* Weekly Highlights Banner Section */}
        <HighlightsBanner />

        {/* Testimonials (What Our Clients Say) Slider Section */}
        <Testimonials />
      </main>

      {/* Footer with active newsletter form */}
      <Footer />

      {/* Floating Dialog Modals */}
      <QuickView />
    </div>
  );
}
