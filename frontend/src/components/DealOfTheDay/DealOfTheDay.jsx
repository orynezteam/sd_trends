"use client";

import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import styles from './DealOfTheDay.module.css';

const DEAL_PRODUCT = {
  id: "necklace-duchess",
  name: "Duchess Diamond Tiara Necklace",
  category: "necklaces",
  price: 4500,
  originalPrice: 5500,
  isNew: true,
  isBestSeller: true,
  isFeatured: true,
  rating: 5.0,
  reviewCount: 8,
  images: [
    "/images/products/necklace_duchess_1.png",
    "/images/products/necklace_duchess_2.png"
  ],
  description: "A magnificent statement piece with a pear-cut diamond pendant dropping from a royal tiara-inspired cluster of marquise and brilliant diamonds, cast in 18k white gold.",
  details: {
    metal: "18k White Gold",
    purity: "75% Pure Gold with Rhodium plating",
    gemstone: "Pear and Round Brilliant Diamonds (3.5 ct)",
    weight: "12.4 grams",
    length: "18 inches"
  },
  stock: 2
};

export default function DealOfTheDay() {
  const { openQuickView } = useStore();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // Set target date to 3 days from when this component loads (to keep it active in demo)
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 3);
    targetDate.setHours(23, 59, 59, 999);

    const timer = setInterval(() => {
      const difference = targetDate.getTime() - new Date().getTime();
      
      if (difference <= 0) {
        clearInterval(timer);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num) => {
    return num.toString().padStart(2, '0');
  };

  return (
    <section id="deal" className={styles.section}>
      <div className="container">
        <div className={styles.grid}>
          {/* Image Pane */}
          <div className={styles.imageWrapper} onClick={() => openQuickView(DEAL_PRODUCT)}>
            <span className={styles.badge}>Deal of the Day</span>
            <img 
              src={DEAL_PRODUCT.images[0]} 
              alt={DEAL_PRODUCT.name} 
              className={styles.image} 
            />
          </div>

          {/* Details & Ticking Countdown Pane */}
          <div className={styles.info}>
            <span className="uppercase-subtitle">Limited Time Offer</span>
            <h2 className={styles.dealTitle}>{DEAL_PRODUCT.name}</h2>
            
            <div className={styles.priceContainer}>
              <span className={styles.price}>${DEAL_PRODUCT.price}</span>
              <span className={styles.originalPrice}>${DEAL_PRODUCT.originalPrice}</span>
            </div>

            <p className={styles.description}>{DEAL_PRODUCT.description}</p>

            {/* Countdown Blocks */}
            <div className={styles.countdown}>
              <div className={styles.timeBox}>
                <span className={styles.timeVal}>{formatNumber(timeLeft.days)}</span>
                <span className={styles.timeLabel}>Days</span>
              </div>
              <div className={styles.timeBox}>
                <span className={styles.timeVal}>{formatNumber(timeLeft.hours)}</span>
                <span className={styles.timeLabel}>Hrs</span>
              </div>
              <div className={styles.timeBox}>
                <span className={styles.timeVal}>{formatNumber(timeLeft.minutes)}</span>
                <span className={styles.timeLabel}>Mins</span>
              </div>
              <div className={styles.timeBox}>
                <span className={styles.timeVal}>{formatNumber(timeLeft.seconds)}</span>
                <span className={styles.timeLabel}>Secs</span>
              </div>
            </div>

            {/* Stock Progress Bar */}
            <div className={styles.stockBarContainer}>
              <div className={styles.stockLabel}>
                <span>Hurry! Only a few pieces remaining.</span>
                <span>Stock left: <span className={styles.stockCount}>{DEAL_PRODUCT.stock}</span></span>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: '20%' }}></div>
              </div>
            </div>

            <div>
              <button 
                className="btn-gold" 
                onClick={() => openQuickView(DEAL_PRODUCT)}
              >
                Claim Deal Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
