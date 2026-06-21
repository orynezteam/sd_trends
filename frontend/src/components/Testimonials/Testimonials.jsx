"use client";

import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import styles from './Testimonials.module.css';

const TESTIMONIALS = [
  {
    id: 1,
    rating: 5,
    quote: "The Vintage Emerald Band exceeded my expectations. The craftsmanship is flawless and the diamond clarity is brilliant. SD Trends Design was extremely helpful in sizing.",
    author: "Sophia R. Sterling",
    title: "Verified Buyer"
  },
  {
    id: 2,
    rating: 5,
    quote: "Buying fine jewelry online can be daunting, but the hallmarked purity guarantee and the customer support team made it seamless. The solitaire engagement ring is breathtaking.",
    author: "Christopher Vance",
    title: "Groom-To-Be"
  },
  {
    id: 3,
    rating: 5,
    quote: "I bought the Duchess Diamond Tiara Necklace for my daughter's wedding. It was a showstopper. Insured shipping was fast and the luxury packaging was exquisite.",
    author: "Marissa Montgomery",
    title: "VIP Collector"
  }
];

export default function Testimonials() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev === TESTIMONIALS.length - 1 ? 0 : prev + 1));
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const renderStars = (count) => {
    return Array.from({ length: count }).map((_, idx) => (
      <Star key={idx} size={14} fill="var(--accent-gold)" stroke="var(--accent-gold)" />
    ));
  };

  return (
    <section className={styles.section}>
      <div className="container">
        <span className="uppercase-subtitle">Customer Voices</span>
        <h2 className="serif-title" style={{ marginBottom: '2rem', marginTop: '0.25rem', fontSize: '2rem' }}>
          Loved by Collectors
        </h2>

        <div className={styles.carousel}>
          {TESTIMONIALS.map((item, index) => (
            <div
              key={item.id}
              className={`${styles.slide} ${index === active ? styles.activeSlide : ''}`}
            >
              <div className={styles.stars}>{renderStars(item.rating)}</div>
              <p className={styles.quote}>"{item.quote}"</p>
              <div className={styles.author}>
                <span className={styles.authorName}>{item.author}</span>
                <span className={styles.authorTitle}>{item.title}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Carousel indicator dots */}
        <div className={styles.dots}>
          {TESTIMONIALS.map((_, index) => (
            <button
              key={index}
              className={`carousel-dot ${index === active ? 'active' : ''}`}
              onClick={() => setActive(index)}
              aria-label={`Go to slide ${index + 1}`}
            ></button>
          ))}
        </div>
      </div>
    </section>
  );
}
