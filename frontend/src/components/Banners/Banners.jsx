"use client";

import React from 'react';
import { ChevronRight } from 'lucide-react';
import styles from './Banners.module.css';

export default function Banners() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.grid}>
          {/* Banner 1: Bridal */}
          <div className={styles.banner}>
            <img 
              src="/images/hero_bridal.png" 
              alt="Bridal Collection" 
              className={styles.image} 
            />
            <div className={styles.overlay}>
              <span className={styles.subtitle}>Royal Splendor</span>
              <h3 className={styles.title}>The Bridal Collection</h3>
              <p className={styles.description}>
                Find matching diamond necklaces, tiara drops, and engagement rings crafted to elevate your bridal glow.
              </p>
              <a href="#featured-section" className={styles.link}>
                Discover Bridal <ChevronRight size={14} />
              </a>
            </div>
          </div>

          {/* Banner 2: Daily wear */}
          <div className={styles.banner}>
            <img 
              src="/images/category_rings.png" 
              alt="Daily Gold Wear" 
              className={styles.image} 
            />
            <div className={styles.overlay}>
              <span className={styles.subtitle}>Everyday Elegance</span>
              <h3 className={styles.title}>Minimalist Daily Wear</h3>
              <p className={styles.description}>
                Chic solid gold bands, stacked rings, and delicate helix hoop earrings for subtle, refined luxury.
              </p>
              <a href="#featured-section" className={styles.link}>
                Shop Daily Wear <ChevronRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
