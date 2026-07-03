"use client";

import React, { useState, useEffect } from 'react';
import { Send, Image as ImageIcon, Search, CheckCircle } from 'lucide-react';
import styles from './Newsletter.module.css';

export default function NewsletterPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [customMessage, setCustomMessage] = useState('Check out our newest arrivals! We think you might love these handpicked items just for you.');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('https://sd-trends.onrender.com/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleProduct = (id: number) => {
    if (selectedProductIds.includes(id)) {
      setSelectedProductIds(prev => prev.filter(pId => pId !== id));
    } else {
      setSelectedProductIds(prev => [...prev, id]);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedProductsData = products.filter(p => selectedProductIds.includes(p.id));

  const handleSend = async () => {
    if (selectedProductIds.length === 0) {
      alert('Please select at least one product to include in the newsletter.');
      return;
    }
    
    if (!confirm(`Are you sure you want to send this newsletter to ALL subscribers?`)) return;

    setSending(true);
    try {
      const res = await fetch('https://sd-trends.onrender.com/api/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productIds: selectedProductIds,
          customMessage: customMessage
        })
      });

      if (res.ok) {
        alert('Newsletter sent successfully!');
        setSelectedProductIds([]);
        setCustomMessage('');
      } else {
        alert('Failed to send newsletter.');
      }
    } catch (err) {
      alert('Error sending newsletter.');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading products...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Newsletter Campaign</h2>
        <p className={styles.description}>Select products and send a custom email template to all your subscribers.</p>
      </div>

      <div className={styles.layout}>
        {/* Left Column: Product Selection */}
        <div className={styles.leftCol}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>Select Products</h3>
              <span className={styles.selectedCount}>{selectedProductIds.length} Selected</span>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.searchBox}>
                <Search size={18} className={styles.searchIcon} />
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className={styles.searchInput}
                />
              </div>

              <div className={styles.productList}>
                {filteredProducts.map(product => {
                  const isSelected = selectedProductIds.includes(product.id);
                  const primaryImage = product.images?.find((img: any) => img.is_primary) || product.images?.[0];
                  
                  return (
                    <div 
                      key={product.id} 
                      className={`${styles.productItem} ${isSelected ? styles.selected : ''}`}
                      onClick={() => toggleProduct(product.id)}
                    >
                      <div className={styles.productImgWrapper}>
                        {primaryImage ? (
                          <img src={`https://sd-trends.onrender.com${primaryImage.image_url}`} alt={product.name} />
                        ) : (
                          <ImageIcon size={24} color="#ccc" />
                        )}
                        {isSelected && (
                          <div className={styles.checkIcon}>
                            <CheckCircle size={20} />
                          </div>
                        )}
                      </div>
                      <div className={styles.productInfo}>
                        <p className={styles.productName}>{product.name}</p>
                        <p className={styles.productPrice}>${product.price.toFixed(2)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Template Preview & Send */}
        <div className={styles.rightCol}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>Email Template Preview</h3>
            </div>
            <div className={styles.cardBody}>
              
              <div className={styles.formGroup}>
                <label>Custom Message (Optional)</label>
                <textarea 
                  rows={3} 
                  value={customMessage}
                  onChange={e => setCustomMessage(e.target.value)}
                  placeholder="Type a message to your subscribers..."
                />
              </div>

              <div className={styles.previewBox}>
                <div className={styles.previewHeader}>
                  <h1>SD Trends Newsletter</h1>
                </div>
                <div className={styles.previewBody}>
                  {customMessage && <p className={styles.previewMessage}>{customMessage}</p>}
                  
                  {selectedProductsData.length > 0 ? (
                    <div className={styles.previewGrid}>
                      {selectedProductsData.map(p => {
                        const img = p.images?.find((i: any) => i.is_primary) || p.images?.[0];
                        return (
                          <div key={p.id} className={styles.previewProduct}>
                            <div className={styles.previewImg}>
                              {img ? (
                                <img src={`https://sd-trends.onrender.com${img.image_url}`} alt={p.name} />
                              ) : (
                                <ImageIcon size={20} color="#ccc" />
                              )}
                            </div>
                            <p className={styles.pName}>{p.name}</p>
                            <p className={styles.pPrice}>${p.price.toFixed(2)}</p>
                            <div className={styles.pBtn}>Shop Now</div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className={styles.previewEmpty}>
                      Select products from the left to see them in the template.
                    </div>
                  )}
                </div>
                <div className={styles.previewFooter}>
                  You are receiving this email because you subscribed to SD Trends.<br/>
                  <a href="#">Unsubscribe</a>
                </div>
              </div>

              <button 
                className={styles.sendBtn} 
                onClick={handleSend}
                disabled={sending || selectedProductIds.length === 0}
              >
                <Send size={18} />
                {sending ? 'Sending Campaign...' : 'Send Newsletter to Subscribers'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
