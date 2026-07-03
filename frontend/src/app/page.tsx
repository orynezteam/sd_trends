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
import { JewelryLoader } from '../components/JewelryLoader/JewelryLoader';
import { API_BASE_URL, BASE_URL } from '@/config';


export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [homeData, setHomeData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/home-data`);
        if (!res.ok) throw new Error('Failed to fetch home data');
        const data = await res.json();
        
        setHomeData({
          hero: Array.isArray(data.hero) ? data.hero : [],
          services: Array.isArray(data.services) ? data.services : [],
          banners: Array.isArray(data.banners) ? data.banners : [],
          latest: Array.isArray(data.latest) ? data.latest : [],
          categories: Array.isArray(data.categories) ? data.categories : [],
          bracelet: data.bracelet || {},
          featured: Array.isArray(data.featured) ? data.featured : [],
          highlights: data.highlights || {},
          testimonials: Array.isArray(data.testimonials) ? data.testimonials : [],
          settings: data.settings || {},
          footerLinks: Array.isArray(data.footerLinks) ? data.footerLinks : []
        });
      } catch (err) {
        console.error("Failed to load home data", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHomeData();
  }, []);

  const handleSelectCategory = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handleClearCategory = () => {
    setSelectedCategory(null);
  };

  if (isLoading) {
    return <JewelryLoader fullScreen text="Polishing your experience..." />;
  }

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Premium Header Bar (CORS and live search enabled) */}
      <Header />

      {/* Main Homepage Flow */}
      <main style={{ flex: '1' }}>
        {/* Dynamic Hero Slider */}
        <HeroSlider hero={homeData?.hero} />

        {/* Premium services/values grid */}
        <Services services={homeData?.services} />

        {/* Promotion Banners - Rings, Bracelet, Pendant */}
        <Banners banners={homeData?.banners} />

        {/* Latest Products Section (Mockup Replica) */}
        <LatestProducts products={homeData?.latest} />

        {/* Categories Grid - triggers scroll and category filters */}
        <CCategories categories={homeData?.categories} onSelectCategory={handleSelectCategory} />

        {/* Bracelet Promo Banner Section */}
        <BraceletBanner bannerData={homeData?.bracelet} />

        {/* Featured Products Section */}
        <FeaturedProducts products={homeData?.featured} />

        {/* Weekly Highlights Banner Section */}
        <HighlightsBanner bannerData={homeData?.highlights} />

        {/* Testimonials (What Our Clients Say) Slider Section */}
        <Testimonials testimonials={homeData?.testimonials} />
      </main>

      {/* Footer with active newsletter form */}
      <Footer settings={homeData?.settings} footerLinks={homeData?.footerLinks} />

      {/* Floating Dialog Modals */}
      <QuickView />
    </div>
  );
}
