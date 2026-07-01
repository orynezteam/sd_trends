"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '../../context/StoreContext';
import { ShoppingBag, Heart, Eye, Star } from 'lucide-react';
import styles from './ProductCard.module.css';

export default function ProductCard({ product, hideBadges = false, viewMode = 'grid' }) {
  const router = useRouter();
  const { wishlist, toggleWishlist, addToCart, openQuickView } = useStore();

  const isWishlisted = wishlist.includes(product.id);
  const discount = product.originalPrice && product.originalPrice > product.price 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;

  // Render stars based on rating
  const renderStars = (rating) => {
    const stars = [];
    const floorRating = Math.floor(rating || 0);
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

  const getTruncatedDesc = (desc) => {
    if (!desc) return "No description available.";
    return desc.length > 120 ? desc.substring(0, 120) + "..." : desc;
  };

  return (
    <div className={`${styles.card} ${viewMode === 'list' ? styles.cardList : ''}`}>
      {/* Image Container */}
      <div 
        className={`${styles.imageContainer} ${product.images.length === 1 ? styles.singleImage : ''}`} 
        onClick={() => router.push(`/product/${product.id}`)}
      >
        {/* Badges */}
        {!hideBadges && (
          <div className={styles.badgeContainer}>
            {product.isNew && <span className={`${styles.badge} ${styles.badgeNew}`}>New</span>}
            {discount > 0 && <span className={`${styles.badge} ${styles.badgeSale}`}>-{discount}%</span>}
            {product.isBestseller && <span className={`${styles.badge} ${styles.badgeBestseller}`}>Bestseller</span>}
            {product.customBadge && <span className={`${styles.badge} ${styles.badgeCustom}`}>{product.customBadge}</span>}
          </div>
        )}

        <img
          src={product.images[0]}
          alt={product.name}
          className={`${styles.productImage} ${styles.primaryImage}`}
        />
        
        {product.images.length > 1 && (
          <img
            src={product.images[1]}
            alt={`${product.name} alternate view`}
            className={`${styles.productImage} ${styles.hoverImage}`}
          />
        )}

        {product.timer && (
          <div className={styles.timerContainer} onClick={(e) => e.stopPropagation()}>
            {product.timer}
          </div>
        )}

        {/* Hover Actions - Only show on Grid Mode */}
        {viewMode === 'grid' && (
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
        )}
      </div>

      {/* Info details */}
      <div className={styles.details}>
        <div className={styles.detailsHeader}>
          <div className={styles.categoryName}>{product.category}</div>
          <h3 className={styles.productName} onClick={() => router.push(`/product/${product.id}`)}>
            {product.name}
          </h3>
          <div className={styles.ratingContainer}>
            <div className={styles.stars}>{renderStars(product.rating)}</div>
            <span className={styles.reviewCount}>({product.reviewCount || 0})</span>
          </div>
          
          {/* Description - Only show on List Mode */}
          {viewMode === 'list' && (
            <p className={styles.listDescription}>
              {getTruncatedDesc(product.description)}
            </p>
          )}
        </div>

        <div className={styles.priceAndActions}>
          <div className={styles.priceContainer}>
            {product.priceRange ? (
              <span className={styles.price}>{product.priceRange}</span>
            ) : (
              <>
                <span className={styles.price}>₹{product.price}</span>
                {discount > 0 && (
                  <span className={styles.originalPrice}>₹{product.originalPrice}</span>
                )}
              </>
            )}
          </div>
          
          {/* Inline Actions - Only show on List Mode */}
          {viewMode === 'list' && (
            <div className={styles.listActions}>
               <button 
                className={styles.listAddToCart}
                onClick={(e) => { e.stopPropagation(); addToCart(product, 1); }}
              >
                <ShoppingBag size={16} />
                <span>Add to Cart</span>
              </button>
              <div className={styles.listIconActions}>
                <button
                  className={`${styles.listIconBtn} ${isWishlisted ? styles.listIconBtnActive : ''}`}
                  onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                >
                  <Heart size={18} fill={isWishlisted ? "var(--accent-gold)" : "none"} />
                </button>
                <button
                  className={styles.listIconBtn}
                  onClick={(e) => { e.stopPropagation(); openQuickView(product); }}
                >
                  <Eye size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
