"use client";

import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { X, ShoppingBag, Star, Minus, Plus } from 'lucide-react';
import styles from './QuickView.module.css';

export default function QuickView() {
  const { activeQuickViewProduct, closeQuickView, addToCart } = useStore();
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedMetal, setSelectedMetal] = useState('18k Yellow Gold');
  const [quantity, setQuantity] = useState(1);

  // Reset local states when active product changes
  useEffect(() => {
    setSelectedImageIdx(0);
    setSelectedMetal('18k Yellow Gold');
    setQuantity(1);
  }, [activeQuickViewProduct]);

  if (!activeQuickViewProduct) return null;

  const product = activeQuickViewProduct;

  const handleQtyChange = (type) => {
    if (type === 'dec') {
      setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
    } else {
      setQuantity((prev) => (prev < product.stock ? prev + 1 : prev));
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedMetal);
    alert(`Successfully added ${quantity}x ${product.name} (${selectedMetal.split(' ')[0]}) to your cart!`);
    closeQuickView();
  };

  const renderStars = (rating) => {
    const stars = [];
    const floorRating = Math.floor(rating);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={14}
          fill={i <= floorRating ? "var(--accent-gold)" : "none"}
          stroke="var(--accent-gold)"
        />
      );
    }
    return stars;
  };

  const metals = ['18k Yellow Gold', '18k White Gold', '14k Rose Gold'];

  return (
    <div className={styles.modalBackdrop} onClick={closeQuickView}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button 
          className={styles.closeBtn} 
          onClick={closeQuickView}
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        <div className={styles.grid}>
          {/* Gallery left pane */}
          <div className={styles.gallery}>
            <div className={styles.mainImageWrapper}>
              <img
                src={product.images[selectedImageIdx] || product.images[0]}
                alt={product.name}
                className={styles.mainImage}
              />
            </div>
            
            <div className={styles.thumbnails}>
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  className={`${styles.thumbnailBtn} ${selectedImageIdx === idx ? styles.thumbnailActive : ''}`}
                  onClick={() => setSelectedImageIdx(idx)}
                >
                  <img src={img} alt="thumbnail" className={styles.thumbnailImage} />
                </button>
              ))}
            </div>
          </div>

          {/* Details right pane */}
          <div className={styles.details}>
            <h2 className={styles.title}>{product.name}</h2>
            
            <div className={styles.reviews}>
              <div className={styles.stars}>{renderStars(product.rating)}</div>
              <span>({product.reviewCount} customer reviews)</span>
            </div>

            <div className={styles.price}>₹{product.price}</div>

            <p className={styles.description}>{product.description}</p>

            {/* Metal Selector */}
            <div className={styles.optionTitle}>Metal Options</div>
            <div className={styles.metalSelector}>
              {metals.map((metal) => (
                <button
                  key={metal}
                  className={`${styles.metalBtn} ${selectedMetal === metal ? styles.metalActive : ''}`}
                  onClick={() => setSelectedMetal(metal)}
                >
                  {metal.replace('18k ', '').replace('14k ', '')}
                </button>
              ))}
            </div>

            {/* Specifications Box */}
            <div className={styles.specs}>
              {Object.entries(product.details as Record<string, any>).map(([label, val]) => (
                <div key={label} className={styles.specItem}>
                  <span className={styles.specLabel}>
                    {label.charAt(0).toUpperCase() + label.slice(1)}:
                  </span>
                  <span>{val as any}</span>
                </div>
              ))}
              <div className={styles.specItem}>
                <span className={styles.specLabel}>Availability:</span>
                <span style={{ 
                  color: product.stock > 0 ? 'var(--success)' : 'var(--error)',
                  fontWeight: '600'
                }}>
                  {product.stock > 0 ? `In Stock (${product.stock} items left)` : 'Out of Stock'}
                </span>
              </div>
            </div>

            {/* Add to Cart Actions */}
            <div className={styles.purchaseRow}>
              <div className={styles.qtyWrapper}>
                <button 
                  className={styles.qtyBtn} 
                  onClick={() => handleQtyChange('dec')}
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <div className={styles.qtyVal}>{quantity}</div>
                <button 
                  className={styles.qtyBtn} 
                  onClick={() => handleQtyChange('inc')}
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>

              <button 
                className={`${styles.addToCartBtn} btn-gold`}
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
              >
                <ShoppingBag size={16} style={{ marginRight: '8px' }} />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
