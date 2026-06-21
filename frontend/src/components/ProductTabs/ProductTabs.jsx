"use client";

import React, { useState, useEffect } from 'react';
import ProductCard from '../ProductCard/ProductCard';
import { X } from 'lucide-react';
import styles from './ProductTabs.module.css';

const TABS = [
  { id: 'new', label: 'New Arrivals' },
  { id: 'bestseller', label: 'Best Sellers' },
  { id: 'featured', label: 'Featured Pieces' }
];

export default function ProductTabs({ selectedCategory, onClearCategory }) {
  const [activeTab, setActiveTab] = useState('new');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        let url = `http://localhost:5000/api/products?tab=${activeTab}`;
        if (selectedCategory) {
          url += `&category=${selectedCategory}`;
        }
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [activeTab, selectedCategory]);

  return (
    <section id="featured-section" className={styles.section}>
      <div className="container">
        {/* Tab Controls */}
        <div className={styles.tabsContainer}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.tabButton} ${activeTab === tab.id ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filter Summary Bar if a Category is Filtered */}
        {selectedCategory && (
          <div className={styles.filterBar}>
            <div className={styles.activeFilters}>
              <span>Filtered by:</span>
              <span className={styles.filterBadge}>
                {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
                <button 
                  className={styles.clearFilterBtn} 
                  onClick={onClearCategory}
                  aria-label="Clear category filter"
                >
                  <X size={14} />
                </button>
              </span>
            </div>
            <div className={styles.resultCount}>
              {products.length} jewelry pieces found
            </div>
          </div>
        )}

        {/* Products Grid / Skeletons */}
        {loading ? (
          <div className={styles.skeletonGrid}>
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className={styles.skeletonCard} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className={styles.grid}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '4rem 0',
            color: 'var(--text-secondary)'
          }}>
            No products found matching these criteria.
          </div>
        )}
      </div>
    </section>
  );
}
