"use client";

import React, { useState, useEffect } from 'react';
import ProductCard from '../ProductCard/ProductCard';
import styles from './FeaturedProducts.module.css';

export default function FeaturedProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [settings, setSettings] = useState({ title: 'Featured Products', subtitle: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [prodRes, setRes] = await Promise.all([
          fetch('http://localhost:5000/api/products?tab=featured'),
          fetch('http://localhost:5000/api/settings')
        ]);
        
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          setProducts(prodData);
        }
        
        if (setRes.ok) {
          const setData = await setRes.json();
          setSettings({
            title: setData.featured_products_title || 'Featured Products',
            subtitle: setData.featured_products_subtitle || ''
          });
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading || products.length === 0) return null;

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
