"use client";

import React from 'react';
import { ChevronRight } from 'lucide-react';
import styles from './BlogGrid.module.css';

const ARTICLES = [
  {
    id: 1,
    category: "Styling Guides",
    date: "June 15, 2026",
    title: "The Art of Layering: Styling Solid Gold Chains & Necklaces",
    excerpt: "Learn how to stack different lengths, weights, and styles of gold necklaces to create a sophisticated, textured look for any neckline.",
    imageUrl: "/images/category_necklaces.png"
  },
  {
    id: 2,
    category: "Gemstone Guides",
    date: "June 08, 2026",
    title: "Understanding Diamond Cuts: Round vs Marquise Cut",
    excerpt: "Demystifying cuts: explore how a stone's geometry alters its sparkle, brilliance, and perceived carat weight on different bands.",
    imageUrl: "/images/hero_diamond.png"
  },
  {
    id: 3,
    category: "Jewelry Care",
    date: "May 28, 2026",
    title: "Jewelry Care 101: Keeping Gold & Platinum Radiantly Bright",
    excerpt: "Discover simple professional maintenance practices, storage guidelines, and safe cleaning solutions to preserve your heirloom pieces.",
    imageUrl: "/images/category_rings.png"
  }
];

export default function BlogGrid() {
  return (
    <section id="blog" className={styles.section}>
      <div className="container">
        <div className="section-header">
          <span className="uppercase-subtitle">SD Trends Editorial</span>
          <h2 className="serif-title">The Jewelry Journal</h2>
        </div>

        <div className={styles.grid}>
          {ARTICLES.map((article) => (
            <article key={article.id} className={styles.card}>
              <div className={styles.imageWrapper}>
                <img 
                  src={article.imageUrl} 
                  alt={article.title} 
                  className={styles.image} 
                />
              </div>
              
              <div className={styles.content}>
                <div className={styles.meta}>
                  <span className={styles.category}>{article.category}</span>
                  <span>{article.date}</span>
                </div>
                
                <h3 className={styles.title}>{article.title}</h3>
                <p className={styles.excerpt}>{article.excerpt}</p>
                
                <a href="#" className={styles.link} onClick={(e) => { e.preventDefault(); alert("Article reading mode coming soon!"); }}>
                  Read Article <ChevronRight size={12} />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
