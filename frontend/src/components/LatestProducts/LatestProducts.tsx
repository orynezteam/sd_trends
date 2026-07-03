"use client";

import React, { useState, useEffect } from 'react';
import ProductCard from '../ProductCard/ProductCard';
import styles from './LatestProducts.module.css';



interface LatestProductsProps {
  products?: any[];
}

export default function LatestProducts({ products = [] }: LatestProductsProps) {
  const settings = { title: 'Latest Products', subtitle: '' };

  if (products.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <h2 className={styles.title}>{settings.title}</h2>
          {settings.subtitle && (
            <p className={styles.subtitle}>{settings.subtitle}</p>
          )}
        </div>
        <div className={styles.grid}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} hideBadges={true} />
          ))}
        </div>
      </div>
    </section>
  );
}
