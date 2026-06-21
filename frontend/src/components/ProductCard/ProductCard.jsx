"use client";

import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ShoppingBag, Heart, Eye, Star } from 'lucide-react';
import styles from './ProductCard.module.css';

export default function ProductCard({ product }) {
  const { wishlist, toggleWishlist, addToCart, openQuickView } = useStore();

  const isWishlisted = wishlist.includes(product.id);
  const discount = product.originalPrice > product.price 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;

  // Render stars based on rating
  const renderStars = (rating) => {
    const stars = [];
    const floorRating = Math.floor(rating);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={12}
          fill={i <= floorRating ? "var(--accent-gold)" : "none"}
          stroke="var(--accent-gold)"
        />
      );
    }
    return stars;
  };

  return (
    <div className={styles.card}>
      {/* Image Container with Hover Swap */}
      <div className={styles.imageContainer} onClick={() => openQuickView(product)}>
        {/* Badges Overlay */}
        <div className={styles.badgeContainer}>
          {product.isNew && <span className={`${styles.badge} ${styles.badgeNew}`}>New</span>}
          {discount > 0 && <span className={`${styles.badge} ${styles.badgeSale}`}>-{discount}%</span>}
          {product.isBestSeller && <span className={`${styles.badge} ${styles.badgeBestseller}`}>Best Seller</span>}
        </div>

        {/* Product Images */}
        <img
          src={product.images[0]}
          alt={product.name}
          className={`${styles.productImage} ${styles.primaryImage}`}
        />
        <img
          src={product.images[1] || product.images[0]}
          alt={`${product.name} alternate view`}
          className={`${styles.productImage} ${styles.hoverImage}`}
        />

        {/* Action Button Overlays */}
        <div className={styles.actionOverlay} onClick={(e) => e.stopPropagation()}>
          <button
            className={`${styles.actionBtn} ${isWishlisted ? styles.actionBtnActive : ''}`}
            onClick={() => toggleWishlist(product.id)}
            aria-label="Add to Wishlist"
          >
            <Heart size={16} fill={isWishlisted ? "var(--text-primary)" : "none"} />
          </button>
          <button
            className={styles.actionBtn}
            onClick={() => addToCart(product, 1)}
            aria-label="Add to Cart"
          >
            <ShoppingBag size={16} />
          </button>
          <button
            className={styles.actionBtn}
            onClick={() => openQuickView(product)}
            aria-label="Quick View Details"
          >
            <Eye size={16} />
          </button>
        </div>
      </div>

      {/* Info details */}
      <div className={styles.details}>
        <div>
          <div className={styles.categoryName}>{product.category}</div>
          <h3 className={styles.productName} onClick={() => openQuickView(product)}>
            {product.name}
          </h3>
          <div className={styles.ratingContainer}>
            <div className={styles.stars}>{renderStars(product.rating)}</div>
            <span className={styles.reviewCount}>({product.reviewCount})</span>
          </div>
        </div>

        <div className={styles.priceContainer}>
          <span className={styles.price}>${product.price}</span>
          {discount > 0 && (
            <span className={styles.originalPrice}>${product.originalPrice}</span>
          )}
        </div>
      </div>
    </div>
  );
}
