"use client";

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './HeroSlider.module.css';

const SLIDE_DATA = [
  {
    id: 1,
    subtitle: "Exquisite Craftsmanship",
    title: "The Solitaire Diamond Collection",
    description: "Discover handcrafted engagement rings, certified natural diamonds, and classic anniversary bands that symbolize everlasting love.",
    buttonText: "Shop The Collection",
    imageUrl: "/images/hero_diamond.png",
    link: "#featured"
  },
  {
    id: 2,
    subtitle: "Timeless Sophistication",
    title: "Eternal Bridal jewelry Sets",
    description: "Bespoke tiara-cut diamond necklaces and cascading ruby drops designed to render your special day absolutely unforgettable.",
    buttonText: "Explore Bridal",
    imageUrl: "/images/hero_bridal.png",
    link: "#featured"
  }
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === SLIDE_DATA.length - 1 ? 0 : prev + 1));
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrent((prev) => (prev === SLIDE_DATA.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? SLIDE_DATA.length - 1 : prev - 1));
  };

  return (
    <section className={styles.slider}>
      {SLIDE_DATA.map((slide, index) => (
        <div
          key={slide.id}
          className={`${styles.slide} ${index === current ? styles.slideActive : ''}`}
        >
          <img
            src={slide.imageUrl}
            alt={slide.title}
            className={styles.slideImage}
          />
          <div className={styles.overlay}></div>
          <div className={styles.content}>
            <span className={styles.subtitle}>{slide.subtitle}</span>
            <h1 className={styles.title}>{slide.title}</h1>
            <p className={styles.description}>{slide.description}</p>
            <div className={styles.buttonWrapper}>
              <a href={slide.link} className="btn-gold">
                {slide.buttonText}
              </a>
            </div>
          </div>
        </div>
      ))}

      {/* Nav Arrows */}
      <button 
        className={`${styles.arrow} ${styles.leftArrow}`} 
        onClick={prevSlide}
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} />
      </button>
      <button 
        className={`${styles.arrow} ${styles.rightArrow}`} 
        onClick={nextSlide}
        aria-label="Next slide"
      >
        <ChevronRight size={24} />
      </button>

      {/* Control Dots */}
      <div className={styles.dotsContainer}>
        {SLIDE_DATA.map((_, index) => (
          <button
            key={index}
            className={`${styles.dot} ${index === current ? styles.dotActive : ''}`}
            onClick={() => setCurrent(index)}
            aria-label={`Go to slide ${index + 1}`}
          ></button>
        ))}
      </div>
    </section>
  );
}
