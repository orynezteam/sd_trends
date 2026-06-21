"use client";

import React, { useState } from 'react';
import Header from '../components/Header/Header';
import HeroSlider from '../components/HeroSlider/HeroSlider';
import Categories from '../components/Categories/Categories';
import ProductTabs from '../components/ProductTabs/ProductTabs';
import DealOfTheDay from '../components/DealOfTheDay/DealOfTheDay';
import Banners from '../components/Banners/Banners';
import Services from '../components/Services/Services';
import Testimonials from '../components/Testimonials/Testimonials';
import BlogGrid from '../components/BlogGrid/BlogGrid';
import Footer from '../components/Footer/Footer';
import QuickView from '../components/QuickView/QuickView';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleSelectCategory = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handleClearCategory = () => {
    setSelectedCategory(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Premium Header Bar (CORS and live search enabled) */}
      <Header />

      {/* Main Homepage Flow */}
      <main style={{ flex: '1' }}>
        {/* Dynamic Hero Slider */}
        <HeroSlider />

        {/* Categories Grid - triggers scroll and category filters */}
        <Categories onSelectCategory={handleSelectCategory} />

        {/* Promotion Banners - Bridal vs Daily luxury */}
        <Banners />

        {/* Tabbed Products Grid (New, Best Sellers, Featured) */}
        <ProductTabs 
          selectedCategory={selectedCategory} 
          onClearCategory={handleClearCategory} 
        />

        {/* Ticking countdown special offer Deal of the Day */}
        <DealOfTheDay />

        {/* Customer testimonial carousel slider */}
        <Testimonials />

        {/* Premium services/values grid */}
        <Services />

        {/* Editorial news blog grid */}
        <BlogGrid />
      </main>

      {/* Footer with active newsletter form */}
      <Footer />

      {/* Floating Dialog Modals */}
      <QuickView />
    </div>
  );
}
