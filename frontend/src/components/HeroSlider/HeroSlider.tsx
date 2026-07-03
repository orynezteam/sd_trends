"use client";

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './HeroSlider.module.css';

interface HeroSliderProps {
  hero?: any[];
}

export default function HeroSlider({ hero = [] }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const slides = hero;

  useEffect(() => {
    if (slides.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 6000);

    return () => clearInterval(timer);
  }, [slides]);

  const nextSlide = () => {
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };


  // Fallback if no slides exist in DB
  if (slides.length === 0) {
    return (
      <section className={styles.slider}>
        <div className={styles.slide} style={{ backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p>Welcome to SD Trends. Please add a Hero Slide from the Admin Dashboard.</p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.slider}>
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`${styles.slide} ${index === current ? styles.slideActive : ''}`}
        >
          <img
            src={slide.image_url}
            alt={slide.title}
            className={styles.slideImage}
            style={{ objectPosition: slide.object_position || 'center' }}
          />
          <div className={styles.content}>
            <span className={styles.subtitle}>{slide.subtitle}</span>
            <h1 className={styles.title}>{slide.title}</h1>
            <p className={styles.description}>{slide.description}</p>
            <div className={styles.buttonWrapper}>
              {slide.button_text && (
                <a href={slide.link || '#'} className={styles.heroBtn}>
                  {slide.button_text}
                </a>
              )}
            </div>
            
            {/* Mobile dots placed inside slide content flow to align perfectly under the action button */}
            {slides.length > 1 && (
              <div className={styles.mobileDots}>
                {slides.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    className={`${styles.dot} ${dotIdx === current ? styles.dotActive : ''}`}
                    onClick={() => setCurrent(dotIdx)}
                    aria-label={`Go to slide ${dotIdx + 1}`}
                  ></button>
                ))}
              </div>
            )}
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

      {/* Control Dots (Desktop version) */}
      {slides.length > 1 && (
        <div className={styles.dotsContainer}>
          {slides.map((_, index) => (
            <button
              key={index}
              className={`${styles.dot} ${index === current ? styles.dotActive : ''}`}
              onClick={() => setCurrent(index)}
              aria-label={`Go to slide ${index + 1}`}
            ></button>
          ))}
        </div>
      )}
    </section>
  );
}
