"use client";

import React from 'react';
import Link from 'next/link';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import { useStore } from '../../context/StoreContext';
import { PRODUCTS } from '../../data/products';
import { ChevronRight, X, Heart, ShoppingBag } from 'lucide-react';
import styles from './wishlist.module.css';

export default function WishlistPage() {
  const { wishlist, toggleWishlist, addToCart } = useStore();

  // Find products that are currently in the wishlist
  const wishlistedProducts = PRODUCTS.filter((p) => wishlist.includes(p.id));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />

      <main style={{ flex: '1', backgroundColor: '#FFFFFF' }}>
        
        {/* Banner with Breadcrumb */}
        <section className={styles.wishlistBanner}>
          <div className={styles.bannerOverlay}>
            <div className={styles.bannerContent}>
              <nav className={styles.breadcrumb} aria-label="Breadcrumb">
                <Link href="/">Home</Link>
                <ChevronRight size={12} className={styles.separator} />
                <span className={styles.activeCrumb}>Wishlist</span>
              </nav>
              <h1 className={styles.bannerTitle}>My Wishlist</h1>
            </div>
          </div>
        </section>

        {/* Wishlist Content Section */}
        <section className={styles.section}>
          <div className={styles.container}>
            {wishlistedProducts.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIconWrapper}>
                  <Heart size={40} strokeWidth={1.5} />
                </div>
                <h2 className={styles.emptyTitle}>Your Wishlist is Empty</h2>
                <p className={styles.emptyText}>
                  You have not added any exquisite jewelry items to your wishlist yet.
                </p>
                <Link href="/shop" className={styles.shopLink}>
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <div className={styles.wishlistWrapper}>
                {/* Desktop View Table */}
                <div className={styles.tableResponsive}>
                  <table className={styles.wishlistTable}>
                    <thead>
                      <tr>
                        <th style={{ width: '50px' }}></th>
                        <th style={{ width: '100px' }}>Product</th>
                        <th>Name</th>
                        <th>Unit Price</th>
                        <th>Stock Status</th>
                        <th style={{ width: '200px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {wishlistedProducts.map((product) => {
                        const isOutOfStock = product.stock <= 0;
                        const hasDiscount = product.originalPrice > product.price;

                        return (
                          <tr key={product.id}>
                            <td className={styles.removeCell}>
                              <button
                                className={styles.removeBtn}
                                onClick={() => toggleWishlist(product.id)}
                                aria-label="Remove item from wishlist"
                              >
                                <X size={18} />
                              </button>
                            </td>
                            <td className={styles.imageCell}>
                              <Link href={`/product/${product.id}`}>
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className={styles.productImage}
                                />
                              </Link>
                            </td>
                            <td className={styles.nameCell}>
                              <Link href={`/product/${product.id}`} className={styles.productNameLink}>
                                {product.name}
                              </Link>
                              <div className={styles.mobileCategory}>{product.category}</div>
                            </td>
                            <td className={styles.priceCell}>
                              {product.priceRange ? (
                                <span className={styles.price}>{product.priceRange}</span>
                              ) : (
                                <div className={styles.priceWrapper}>
                                  <span className={styles.price}>₹{product.price}</span>
                                  {hasDiscount && (
                                    <span className={styles.originalPrice}>₹{product.originalPrice}</span>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className={styles.stockCell}>
                              <span className={`${styles.stockBadge} ${isOutOfStock ? styles.outOfStock : styles.inStock}`}>
                                {isOutOfStock ? 'Out of stock' : 'In stock'}
                              </span>
                            </td>
                            <td className={styles.actionCell}>
                              <button
                                className={`${styles.addToCartBtn} btn-gold`}
                                onClick={() => addToCart(product, 1)}
                                disabled={isOutOfStock}
                              >
                                ADD TO CART
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View Cards */}
                <div className={styles.mobileGrid}>
                  {wishlistedProducts.map((product) => {
                    const isOutOfStock = product.stock <= 0;
                    const hasDiscount = product.originalPrice > product.price;

                    return (
                      <div key={product.id} className={styles.wishlistCard}>
                        <button
                          className={styles.cardRemoveBtn}
                          onClick={() => toggleWishlist(product.id)}
                          aria-label="Remove item from wishlist"
                        >
                          <X size={16} />
                        </button>
                        
                        <div className={styles.cardHeader}>
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className={styles.cardImage}
                          />
                          <div className={styles.cardMeta}>
                            <span className={styles.cardCategory}>{product.category}</span>
                            <Link href={`/product/${product.id}`} className={styles.cardNameLink}>
                              <h3>{product.name}</h3>
                            </Link>
                            
                            <div className={styles.cardPriceRow}>
                              {product.priceRange ? (
                                <span className={styles.cardPrice}>{product.priceRange}</span>
                              ) : (
                                <>
                                  <span className={styles.cardPrice}>₹{product.price}</span>
                                  {hasDiscount && (
                                    <span className={styles.cardOriginalPrice}>₹{product.originalPrice}</span>
                                  )}
                                </>
                              )}
                            </div>

                            <span className={`${styles.cardStock} ${isOutOfStock ? styles.outOfStock : styles.inStock}`}>
                              {isOutOfStock ? 'Out of stock' : 'In stock'}
                            </span>
                          </div>
                        </div>

                        <div className={styles.cardActions}>
                          <button
                            className={`${styles.cardAddToCartBtn} btn-gold`}
                            onClick={() => addToCart(product, 1)}
                            disabled={isOutOfStock}
                          >
                            <ShoppingBag size={14} style={{ marginRight: '8px' }} /> ADD TO CART
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
