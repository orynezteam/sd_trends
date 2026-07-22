import React from 'react';
import HeroSlider from '../components/HeroSlider/HeroSlider';
import LatestProducts from '../components/LatestProducts/LatestProducts';
import FeaturedProducts from '../components/FeaturedProducts/FeaturedProducts';
import HighlightsBanner from '../components/HighlightsBanner/HighlightsBanner';
import BraceletBanner from '../components/BraceletBanner/BraceletBanner';
import Banners from '../components/Banners/Banners';
import Services from '../components/Services/Services';
import Testimonials from '../components/Testimonials/Testimonials';
import QuickView from '../components/QuickView/QuickView';
import CCategories from '../components/Categories/Categories';
import { API_BASE_URL } from '@/config';

async function fetchHomeData() {
  try {
    const res = await fetch(`${API_BASE_URL}/home-data?t=${Date.now()}`, {
      cache: 'no-store'
    });
    if (!res.ok) throw new Error('Failed to fetch home data');
    const data = await res.json();
    return {
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
    };
  } catch (err) {
    console.error("Failed to load home data", err);
    return null;
  }
}

export default async function Home() {
  const homeData = await fetchHomeData();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Premium Header Bar (CORS and live search enabled) */}
      

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
        <CCategories categories={homeData?.categories} />

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
      

      {/* Floating Dialog Modals */}
      <QuickView />
    </div>
  );
}
