"use client";

import React, { useState, useEffect } from 'react';
import ProductCard from '../ProductCard/ProductCard';
import styles from './FeaturedProducts.module.css';

interface FeaturedProductsProps {
  products?: any[];
}

export default function FeaturedProducts({ products = [] }: FeaturedProductsProps) {
  const settings = { title: 'Featured Products', subtitle: '' };

  if (products.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className="container">
        {/* Section Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>{settings.title}</h2>
          {settings.subtitle && (
            <p className={styles.subtitle}>{settings.subtitle}</p>
          )}
        </div>

        {/* Products Grid */}
        <div className={styles.grid}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} hideBadges={true} />
          ))}
        </div>
      </div>
    </section>
  );
}
