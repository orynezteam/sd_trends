"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import QuickView from '../../components/QuickView/QuickView';
import { ChevronRight, Clock } from 'lucide-react';
import styles from './top-deals.module.css';
import { API_BASE_URL, BASE_URL } from '@/config';


interface DealCategory {
  name: string;
  imageUrl: string;
  link: string;
}

export default function TopDealsPage() {
  const [categories, setCategories] = useState<DealCategory[]>([]);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [targetDate, setTargetDate] = useState<Date | null>(null);
  
  useEffect(() => {
    // Fetch top deals configuration
    const fetchConfig = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/settings/top-deals`);
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories || []);
          if (data.timer) {
            setTargetDate(new Date(data.timer));
          }
        }
      } catch (err) {
        console.error('Failed to load top deals config', err);
      }
    };
    fetchConfig();
  }, []);

  useEffect(() => {
    if (!targetDate) {
      setTimeLeft('');
      return;
    }
    
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime();
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        
        return `${days}d : ${hours}h : ${minutes}m : ${seconds}s`;
      }
      return 'Deal Expired';
    };

    // Initial setting
    setTimeLeft(calculateTimeLeft());
    
    // Update every second
    const timerId = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    
    return () => clearInterval(timerId);
  }, [targetDate]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header component */}
      <Header />

      {/* Main content flow */}
      <main style={{ flex: '1', backgroundColor: '#FFFFFF' }}>
        
        {/* Banner with Breadcrumb */}
        <section className={styles.shopBanner}>
          <div className={styles.bannerOverlay}>
            <div className={styles.bannerContent}>
              <nav className={styles.breadcrumb} aria-label="Breadcrumb">
                <Link href="/">Home</Link>
                <ChevronRight size={12} className={styles.separator} />
                <span className={styles.activeCrumb}>Top Deals</span>
              </nav>
              <h1 className={styles.bannerTitle}>Top Deals</h1>
              
              {/* Dynamic Countdown Timer */}
              {timeLeft && (
                <div style={{ 
                  marginTop: '1.5rem', 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.75rem',
                  background: 'rgba(0, 0, 0, 0.6)',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '30px',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <Clock size={20} color="#fff" />
                  <span style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 600, letterSpacing: '1px' }}>
                    Ends In: {timeLeft}
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.titleSection}>
              <h2 className={styles.mainTitle}>Shop By</h2>
            </div>
            
            <div className={styles.grid}>
              {categories.map((category, idx) => (
                <Link 
                  href={category.link} 
                  key={`${category.name}-${idx}`} 
                  className={styles.card}
                >
                  <div className={styles.imageWrapper}>
                    {timeLeft && (
                      <div className={styles.cardTimer}>
                        <Clock size={14} color="var(--accent-gold)" />
                        <span className={styles.timerText}>{timeLeft}</span>
                      </div>
                    )}
                    <img 
                      src={category.imageUrl} 
                      alt={category.name} 
                      className={styles.image}
                    />
                  </div>
                  <div className={styles.cardContent}>
                    <h3 className={styles.cardTitle}>{category.name}</h3>
                    <div className={styles.shopNowBtn}>Shop Deal</div>
                  </div>
                </Link>
              ))}
              
              {categories.length === 0 && (
                <div style={{ padding: '3rem', textAlign: 'center', gridColumn: '1 / -1', color: '#666' }}>
                  No top deals categories configured yet.
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <QuickView />
    </div>
  );
}
