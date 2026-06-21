"use client";

import React from 'react';
import styles from './Categories.module.css';

const CATEGORIES = [
  {
    id: 'rings',
    name: 'Rings',
    count: '3 Products',
    imageUrl: '/images/category_rings.png'
  },
  {
    id: 'necklaces',
    name: 'Necklaces',
    count: '3 Products',
    imageUrl: '/images/category_necklaces.png'
  },
  {
    id: 'earrings',
    name: 'Earrings',
    count: '3 Products',
    imageUrl: '/images/category_earrings.png'
  },
  {
    id: 'bracelets',
    name: 'Bracelets',
    count: '3 Products',
    imageUrl: '/images/category_bracelets.png'
  }
];

export default function Categories({ onSelectCategory }) {
  const handleCategoryClick = (categoryId) => {
    if (onSelectCategory) {
      onSelectCategory(categoryId);
    }
    // Scroll to the product grid section smoothly
    const section = document.getElementById('featured-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="categories" className={styles.section}>
      <div className="container">
        <div className="section-header">
          <span className="uppercase-subtitle">Curated Selection</span>
          <h2 className="serif-title">Shop by Category</h2>
        </div>

        <div className={styles.grid}>
          {CATEGORIES.map((category) => (
            <div 
              key={category.id} 
              className={styles.card}
              onClick={() => handleCategoryClick(category.id)}
            >
              <img 
                src={category.imageUrl} 
                alt={category.name} 
                className={styles.cardImage} 
              />
              <div className={styles.overlay}>
                <div className={styles.infoBox}>
                  <h3 className={styles.name}>{category.name}</h3>
                  <span className={styles.count}>{category.count}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
