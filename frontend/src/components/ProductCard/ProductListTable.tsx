"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '../../context/StoreContext';
import { ShoppingBag, Heart, Eye, Star } from 'lucide-react';
import styles from './ProductListTable.module.css';

export default function ProductListTable({ products }) {
  const router = useRouter();
  const { wishlist, toggleWishlist, addToCart, openQuickView } = useStore();

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

  if (!products || products.length === 0) return null;

  return (
    <div className={styles.tableContainer}>
      <table className={styles.productTable}>
        <thead>
          <tr>
            <th className={styles.thAvatar}>Product</th>
            <th className={styles.thDetails}>Details</th>
            <th className={styles.thPrice}>Price</th>
            <th className={styles.thRating}>Rating</th>
            <th className={styles.thActions}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => {
            const isWishlisted = wishlist.includes(product.id);
            const discount = product.originalPrice && product.originalPrice > product.price 
              ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
              : 0;

            return (
              <tr key={product.id} className={styles.tableRow} onClick={() => router.push(`/product/${product.id}`)}>
                <td className={styles.tdAvatar}>
                  <div className={styles.avatarWrapper}>
                    <img src={product.images[0]} alt={product.name} className={styles.avatarImg} />
                    {product.isNew && <span className={styles.tinyBadge}>New</span>}
                  </div>
                </td>
                <td className={styles.tdDetails}>
                  <div className={styles.categoryName}>{product.category}</div>
                  <div className={styles.productName}>{product.name}</div>
                </td>
                <td className={styles.tdPrice}>
                  {product.priceRange ? (
                    <span className={styles.price}>{product.priceRange}</span>
                  ) : (
                    <div className={styles.priceBlock}>
                      <span className={styles.price}>₹{product.price}</span>
                      {discount > 0 && <span className={styles.originalPrice}>₹{product.originalPrice}</span>}
                    </div>
                  )}
                </td>
                <td className={styles.tdRating}>
                  <div className={styles.ratingContainer}>
                    <div className={styles.stars}>{renderStars(product.rating)}</div>
                    <span className={styles.reviewCount}>({product.reviewCount || 0})</span>
                  </div>
                </td>
                <td className={styles.tdActions} onClick={(e) => e.stopPropagation()}>
                  <div className={styles.actionGroup}>
                    <button 
                      className={styles.cartBtn}
                      onClick={() => addToCart(product, 1)}
                      title="Add to Cart"
                    >
                      <ShoppingBag size={16} />
                      <span className={styles.cartText}>Add</span>
                    </button>
                    <button
                      className={`${styles.iconBtn} ${isWishlisted ? styles.iconBtnActive : ''}`}
                      onClick={() => toggleWishlist(product.id)}
                      title="Wishlist"
                    >
                      <Heart size={16} fill={isWishlisted ? "var(--accent-gold)" : "none"} />
                    </button>
                    <button
                      className={styles.iconBtn}
                      onClick={() => openQuickView(product)}
                      title="Quick View"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
