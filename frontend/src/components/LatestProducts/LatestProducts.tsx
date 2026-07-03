"use client";

import React, { useState, useEffect } from 'react';
import ProductCard from '../ProductCard/ProductCard';
import styles from './LatestProducts.module.css';



export default function LatestProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [settings, setSettings] = useState({ title: 'Latest Products', subtitle: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [prodRes, setRes] = await Promise.all([
          fetch('https://sd-trends.onrender.com/api/products?is_latest=true'),
          fetch('https://sd-trends.onrender.com/api/settings')
        ]);
        
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          setProducts(prodData);
        }
        
        if (setRes.ok) {
          const setData = await setRes.json();
          setSettings({
            title: setData.latest_products_title || 'Latest Products',
            subtitle: setData.latest_products_subtitle || ''
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
