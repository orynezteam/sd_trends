"use client";
import { API_BASE_URL, BASE_URL } from '@/config';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ProductCard from '../../../components/ProductCard/ProductCard';
import { useStore } from '../../../context/StoreContext';
import { PRODUCTS, Product } from '../../../data/products';
import { 
  Star, 
  Heart, 
  ShoppingBag, 
  ChevronRight, 
  Minus, 
  Plus,
  Flame,
  Eye,
  Check,
  Shuffle,
  HelpCircle,
  Share2,
  ShieldCheck,
  Coins,
  Truck
} from 'lucide-react';
import styles from './product.module.css';

interface ProductClientPageProps {
  productId: string;
}

export default function ProductClientPage({ productId }: ProductClientPageProps) {
  const router = useRouter();
  const { wishlist, toggleWishlist, addToCart } = useStore();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews' | 'shipping'>('description');
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomStyle, setZoomStyle] = useState<{backgroundPosition?: string}>({});

  const [toastMsg, setToastMsg] = useState('');
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [newReview, setNewReview] = useState({ author: '', rating: 5, review_text: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (productId) {
      fetch(`${API_BASE_URL}/products/${productId}/reviews`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setReviews(data);
        })
        .catch(console.error);
    }
  }, [productId]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.author || !newReview.review_text) return;
    setSubmittingReview(true);
    try {
      const res = await fetch(`${API_BASE_URL}/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview)
      });
      if (res.ok) {
        const added = await res.json();
        setReviews([added, ...reviews]);
        setNewReview({ author: '', rating: 5, review_text: '' });
        showToast('Review submitted successfully!');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  useEffect(() => {
    async function getProduct() {
      try {
        const res = await fetch(`${API_BASE_URL}/products`);
        if (res.ok) {
          const data: Product[] = await res.json();
          setAllProducts(data);
          const found = data.find(p => p.id === productId);
          if (found) {
            setProduct(found);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error("Backend fetch failed, searching locally:", err);
      }

      setAllProducts(PRODUCTS);
      const localFound = PRODUCTS.find(p => p.id === productId);
      if (localFound) {
        setProduct(localFound);
      }
      setLoading(false);
    }
    
    getProduct();
  }, [productId]);

  // Scroll handler for sticky bottom checkout bar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 550) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        
        <main style={{ flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid var(--border-color)',
            borderTopColor: 'rgb(206, 150, 126)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <style jsx global>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </main>
        
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        
        <main style={{ flex: '1' }}>
          <div className={styles.errorWrapper}>
            <h1 className={styles.errorTitle}>Product Not Found</h1>
            <p className={styles.errorText}>
              We're sorry, but the jewelry piece you are looking for does not exist or has been removed.
            </p>
            <Link href="/" className={styles.errorLink}>
              Return to Homepage
            </Link>
          </div>
        </main>
        
      </div>
    );
  }

  const isWishlisted = wishlist.includes(product.id);
  const discount = product.originalPrice > product.price 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;

  // Render stars based on rating
  const renderStars = (rating: number) => {
    const stars = [];
    const floorRating = Math.floor(rating);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={16}
          fill={i <= floorRating ? "var(--accent-gold)" : "none"}
          stroke="var(--accent-gold)"
        />
      );
    }
    return stars;
  };

  const handleQtyMinus = () => {
    if (quantity > 1) setQuantity(prev => prev - 1);
  };

  const handleQtyPlus = () => {
    const maxStock = product.stock || 10;
    if (quantity < maxStock) setQuantity(prev => prev + 1);
  };

  const handleAddToCartSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addToCart(product, quantity);
  };

  const handleAddToCartClick = () => {
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    router.push('/checkout');
  };

  // Get suggested products: same category, excluding current product
  const suggestedProducts = PRODUCTS
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  // Fallback to fill suggestions grid to exactly 4 items
  if (suggestedProducts.length < 4) {
    const ids = new Set(suggestedProducts.map(p => p.id));
    ids.add(product.id);
    const extra = PRODUCTS.filter(p => !ids.has(p.id)).slice(0, 4 - suggestedProducts.length);
    suggestedProducts.push(...extra);
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      backgroundPosition: `${x}% ${y}%`
    });
  };

  const colorVariants = allProducts.filter(p => 
    p.color_group && 
    product.color_group && 
    p.color_group.toLowerCase() === product.color_group.toLowerCase() && 
    p.id !== product.id
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      

      <main style={{ flex: '1', backgroundColor: '#FFFFFF' }}>
        <div className={styles.container}>
          
          {/* Breadcrumb Navigation */}
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <ChevronRight size={12} className={styles.separator} />
            <Link href="/shop">Shop</Link>
            <ChevronRight size={12} className={styles.separator} />
            <span className={styles.activeCrumb}>{product.name}</span>
          </nav>

          {/* Product Details Section */}
          <div className={styles.productLayout}>
            
            {/* Left side: Double-column Gallery (thumbnails stack on left) */}
            <div className={styles.gallerySection}>
              {product.images.length > 1 && (
                <div className={styles.thumbnailStrip}>
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      className={`${styles.thumbnailBtn} ${activeImageIndex === idx ? styles.thumbnailActive : ''}`}
                      onClick={() => setActiveImageIndex(idx)}
                      aria-label={`View thumbnail ${idx + 1}`}
                    >
                      <img src={img} alt={`Thumbnail view ${idx + 1}`} />
                    </button>
                  ))}
                </div>
              )}
              
              <div 
                className={styles.mainImageWrapper}
                onMouseEnter={() => setIsZooming(true)}
                onMouseLeave={() => setIsZooming(false)}
                onMouseMove={handleMouseMove}
              >
                <img
                  src={product.images[activeImageIndex] || product.images[0]}
                  alt={product.name}
                  className={styles.mainImage}
                />
                {isZooming && (
                  <div className={styles.zoomLensOverlay} style={{ left: zoomStyle.backgroundPosition?.split(' ')[0], top: zoomStyle.backgroundPosition?.split(' ')[1] }} />
                )}
              </div>
            </div>

            {/* Right side: Product Metadata & Buy Form */}
            <div className={styles.detailsSection}>
              {isZooming && (
                <div 
                  className={styles.zoomResult}
                  style={{
                    backgroundImage: `url(${product.images[activeImageIndex] || product.images[0]})`,
                    ...zoomStyle
                  }}
                />
              )}

              <div>
                <h1 className={styles.title}>{product.name}</h1>
              </div>

                  <div className={styles.priceRow}>
                    {product.priceRange ? (
                      <span className={styles.salePrice}>{product.priceRange}</span>
                    ) : (
                      <>
                        <span className={styles.salePrice}>₹{product.price}</span>
                        {discount > 0 && (
                          <span className={styles.originalPrice}>₹{product.originalPrice}</span>
                        )}
                      </>
                    )}
                  </div>

                  <div className={styles.ratingRow}>
                    <div className={styles.stars}>{renderStars(product.rating)}</div>
                    <span className={styles.reviewCount}>({product.reviewCount} reviews)</span>
                  </div>

              {/* sold count with fire icon */}
              <div className={styles.fireTag}>
                <Flame size={16} className={styles.fireIcon} />
                <span>{(product as any).soldCount || 15} products sold in last 1 hour</span>
              </div>

              <p className={styles.description}>{product.description}</p>

              {/* stock count badge */}
              <div className={styles.stockRow}>
                <span className={styles.stockBadge}>
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>

              {/* Color variants selector */}
              {colorVariants.length > 0 && (
                <div className={styles.colorVariantsSection} style={{ marginBottom: '20px' }}>
                  <span className={styles.variantLabel} style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Available Colors:
                  </span>
                  <div className={styles.colorBadgeGrid} style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {/* Current color */}
                    <span 
                      className={`${styles.colorBadge} ${styles.colorBadgeActive}`}
                      style={{
                        padding: '6px 16px',
                        border: '2px solid var(--text-primary, #000)',
                        backgroundColor: '#fff',
                        color: 'var(--text-primary, #000)',
                        fontSize: '12px',
                        fontWeight: 600,
                        borderRadius: '4px',
                        cursor: 'default'
                      }}
                    >
                      {product.color || 'Default'}
                    </span>
                    {/* Other colors */}
                    {colorVariants.map(v => (
                      <Link 
                        key={v.id} 
                        href={`/product/${v.id}`} 
                        className={styles.colorBadge}
                        style={{
                          padding: '6px 16px',
                          border: '1px solid #ddd',
                          backgroundColor: '#fff',
                          color: '#555',
                          fontSize: '12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          textDecoration: 'none',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {v.color || 'Other'}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <form className={styles.actionForm} onSubmit={handleAddToCartSubmit}>
                <div className={styles.purchaseActions}>
                  <div className={styles.quantityWrapper}>
                    <button
                      type="button"
                      className={styles.qtyBtn}
                      onClick={handleQtyMinus}
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className={styles.qtyVal}>{quantity}</span>
                    <button
                      type="button"
                      className={styles.qtyBtn}
                      onClick={handleQtyPlus}
                      disabled={quantity >= (product.stock || 10)}
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  
                  <button
                    type="submit"
                    className={styles.addToCartBtn}
                    disabled={product.stock <= 0}
                  >
                    ADD TO CART
                  </button>
                </div>

                <button
                  type="button"
                  className={styles.buyNowBtn}
                  onClick={handleBuyNow}
                  disabled={product.stock <= 0}
                >
                  BUY NOW
                </button>
              </form>

              {/* Utility Row Links */}
              <div className={styles.utilityRow}>
                <button type="button" className={styles.utilityBtn} onClick={() => showToast('Compare feature coming soon!')}>
                  <Shuffle size={14} /> COMPARE
                </button>
                <button 
                  type="button" 
                  className={`${styles.utilityBtn} ${isWishlisted ? styles.utilityBtnActive : ''}`}
                  onClick={() => {
                    if (isWishlisted) {
                      router.push('/wishlist');
                    } else {
                      toggleWishlist(product.id);
                      showToast('Added to Wishlist!');
                    }
                  }}
                >
                  <Heart size={14} fill={isWishlisted ? "currentColor" : "none"} /> {isWishlisted ? 'VIEW WISHLIST' : 'ADD TO WISHLIST'}
                </button>
                <button type="button" className={styles.utilityBtn} onClick={() => router.push('/contact-us')}>
                  <HelpCircle size={14} /> ASK US
                </button>
                <button type="button" className={styles.utilityBtn} onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  showToast('Link copied to clipboard!');
                }}>
                  <Share2 size={14} /> SHARE
                </button>
              </div>

              {/* Viewer counter */}
              <div className={styles.eyeTag}>
                <Eye size={16} className={styles.eyeIcon} />
                <span>{(product as any).viewerCount || 18} people are viewing this right now</span>
              </div>

              {/* Delivery list */}
              <div className={styles.deliveryList}>
                <div className={styles.deliveryItem}>
                  <Check size={16} className={styles.checkIcon} />
                  <span>Estimated Delivery : Up to 4 business days</span>
                </div>
                <div className={styles.deliveryItem}>
                  <Check size={16} className={styles.checkIcon} />
                  <span>Free Shipping & Returns : On all orders over ₹999</span>
                </div>
              </div>

            </div>
          </div>

          {/* Trust Badges & Secure Checkout Row */}
          <div className={styles.trustCheckoutSection}>
            <div className={styles.trustBadgesGrid}>
              <div className={styles.trustBadge}>
                <ShieldCheck size={28} className={styles.trustIcon} />
                <span>101% Original</span>
              </div>
              <div className={styles.trustBadge}>
                <Coins size={28} className={styles.trustIcon} />
                <span>Lowest Price</span>
              </div>
              <div className={styles.trustBadge}>
                <Truck size={28} className={styles.trustIcon} />
                <span>Free Shipping</span>
              </div>
            </div>

            <div className={styles.checkoutBox}>
              <span className={styles.checkoutTitle}>Guaranteed Safe And Secure Checkout</span>
              <div className={styles.paymentBadges}>
                <div className={`${styles.paymentBadge} ${styles.visa}`}>Visa</div>
                <div className={`${styles.paymentBadge} ${styles.mastercard}`}>
                  <span className={styles.mcCircleRed}></span>
                  <span className={styles.mcCircleOrange}></span>
                  <span className={styles.paymentText}>mastercard</span>
                </div>
                <div className={`${styles.paymentBadge} ${styles.amex}`}>Amex</div>
                <div className={`${styles.paymentBadge} ${styles.discover}`}>Discover</div>
                <div className={`${styles.paymentBadge} ${styles.paypal}`}>PayPal</div>
                <div className={`${styles.paymentBadge} ${styles.applepay}`}> Pay</div>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className={styles.tabsSection}>
            <div className={styles.tabsNav}>
              <button 
                className={`${styles.tabBtn} ${activeTab === 'description' ? styles.tabBtnActive : ''}`}
                onClick={() => setActiveTab('description')}
              >
                Description
              </button>
              <button 
                className={`${styles.tabBtn} ${activeTab === 'reviews' ? styles.tabBtnActive : ''}`}
                onClick={() => setActiveTab('reviews')}
              >
                Reviews(1)
              </button>
              <button 
                className={`${styles.tabBtn} ${activeTab === 'shipping' ? styles.tabBtnActive : ''}`}
                onClick={() => setActiveTab('shipping')}
              >
                Shipping & Return
              </button>
            </div>

            <div className={styles.tabContent}>
              {activeTab === 'description' && (
                <div className={styles.descriptionTab}>
                  <h3 className={styles.aboutTitle}>About this item</h3>
                  {(product as any).aboutText ? (
                    <div 
                      className={styles.aboutText} 
                      dangerouslySetInnerHTML={{ __html: (product as any).aboutText }} 
                    />
                  ) : (
                    <p className={styles.aboutText}>
                      Indulge in the allure of timeless elegance with our fine jewelry. Whether worn as a symbol of love, a celebration of achievements, or simply as a daily indulgence, this piece is a testament to enduring beauty and refined style. Arriving in an elegant signature jewelry box, it makes the perfect gift for a loved one or a treasured addition to your own collection. Each piece is accompanied by a certificate of authenticity, guaranteeing the highest quality of gemstones and gold purity.
                    </p>
                  )}

                  {product.details && Object.keys(product.details).filter(k => k !== 'description_image_url').length > 0 && (
                    <ul className={styles.detailsList} style={{ marginTop: '20px', paddingLeft: '20px', listStyleType: 'disc', lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                      {Object.entries(product.details).map(([key, value]) => {
                        if (key === 'description_image_url') return null;
                        const formattedKey = key.charAt(0).toUpperCase() + key.slice(1);
                        return (
                          <li key={key}>
                            <strong style={{ color: 'var(--text-primary)' }}>{formattedKey}:</strong> {value as string}
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  <div className={styles.tabImageWrapper} style={{ marginTop: '30px' }}>
                    <img 
                      src={(product.details as any)?.description_image_url || product.images[1] || product.images[0]} 
                      alt={`${product.name} detail view`} 
                      className={styles.tabImage}
                    />
                  </div>
                </div>
              )}
              {activeTab === 'reviews' && (
                <div className={styles.reviewsTab}>
                  <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1', minWidth: '300px' }}>
                      <h3 className={styles.aboutTitle}>Customer Reviews ({reviews.length})</h3>
                      {reviews.length === 0 ? (
                        <p style={{ color: '#666', marginTop: '10px' }}>No reviews yet. Be the first to review!</p>
                      ) : (
                        reviews.map((r, i) => (
                          <div key={i} className={styles.reviewCard} style={{ marginBottom: '15px' }}>
                            <div className={styles.reviewHeader}>
                              <div className={styles.reviewAuthor}>{r.author}</div>
                              <div className={styles.reviewStars}>{renderStars(r.rating)}</div>
                            </div>
                            <p className={styles.reviewText}>{r.review_text}</p>
                            <small style={{ color: '#aaa', fontSize: '12px' }}>
                              {new Date(r.created_at).toLocaleDateString()}
                            </small>
                          </div>
                        ))
                      )}
                    </div>
                    
                    <div style={{ flex: '1', minWidth: '300px', background: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
                      <h3 className={styles.aboutTitle} style={{ marginTop: 0 }}>Write a Review</h3>
                      <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Your Name</label>
                          <input 
                            type="text" 
                            required 
                            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                            value={newReview.author}
                            onChange={(e) => setNewReview({...newReview, author: e.target.value})}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Rating</label>
                          <select 
                            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                            value={newReview.rating}
                            onChange={(e) => setNewReview({...newReview, rating: parseInt(e.target.value)})}
                          >
                            <option value="5">5 - Excellent</option>
                            <option value="4">4 - Good</option>
                            <option value="3">3 - Average</option>
                            <option value="2">2 - Fair</option>
                            <option value="1">1 - Poor</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Your Review</label>
                          <textarea 
                            required 
                            rows={4}
                            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                            value={newReview.review_text}
                            onChange={(e) => setNewReview({...newReview, review_text: e.target.value})}
                          />
                        </div>
                        <button 
                          type="submit" 
                          disabled={submittingReview}
                          style={{ 
                            background: '#333', color: 'white', padding: '12px', 
                            border: 'none', borderRadius: '4px', cursor: 'pointer', 
                            fontWeight: 600, opacity: submittingReview ? 0.7 : 1 
                          }}
                        >
                          {submittingReview ? 'Submitting...' : 'Submit Review'}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'shipping' && (
                <div className={styles.shippingTab}>
                  <h3 className={styles.aboutTitle}>Shipping & Returns Policy</h3>
                  {(product as any).shippingText ? (
                    <div 
                      className={styles.shippingList} 
                      dangerouslySetInnerHTML={{ __html: (product as any).shippingText }} 
                    />
                  ) : (
                    <ul className={styles.shippingList}>
                      <li><strong>Free Shipping:</strong> Free insured shipping worldwide on all orders.</li>
                      <li><strong>Estimated Delivery:</strong> Typically delivers in 3-5 business days. Tracking details will be emailed immediately.</li>
                      <li><strong>Returns Policy:</strong> Hassle-free 30-day returns. If you are not 100% satisfied, contact us for a full refund or exchange.</li>
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Suggested Products */}
          <div className={styles.suggestedSection}>
            <h2 className={styles.suggestedTitle}>Suggested Products</h2>
            <div className={styles.suggestedGrid}>
              {suggestedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>

        </div>
      </main>

      

      {/* Sticky Bottom Checkout Bar */}
      <div className={`${styles.stickyBar} ${showStickyBar ? styles.stickyBarActive : ''}`}>
        <div className={styles.stickyContainer}>
          <div className={styles.stickyLeft}>
            <img 
              src={product.images[0]} 
              alt={product.name} 
              className={styles.stickyThumb} 
            />
            <span className={styles.stickyName}>{product.name}</span>
          </div>
          <div className={styles.stickyRight}>
            <span className={styles.stickyPrice}>₹{product.price}</span>
            
            <div className={styles.stickyQty}>
              <button 
                type="button" 
                className={styles.stickyQtyBtn}
                onClick={handleQtyMinus}
                disabled={quantity <= 1}
              >
                <Minus size={12} />
              </button>
              <span className={styles.stickyQtyVal}>{quantity}</span>
              <button 
                type="button" 
                className={styles.stickyQtyBtn}
                onClick={handleQtyPlus}
                disabled={quantity >= (product.stock || 10)}
              >
                <Plus size={12} />
              </button>
            </div>

            <button 
              type="button" 
              className={styles.stickyAddBtn}
              onClick={handleAddToCartClick}
              disabled={product.stock <= 0}
            >
              ADD TO CART
            </button>
            <button 
              type="button" 
              className={styles.stickyBuyBtn}
              onClick={handleBuyNow}
              disabled={product.stock <= 0}
            >
              BUY NOW
            </button>
          </div>
        </div>
      </div>

      {toastMsg && (
        <div style={{
          position: 'fixed',
          bottom: '100px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#333',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '4px',
          zIndex: 9999,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          fontSize: '0.9rem',
          fontWeight: 500,
          animation: 'fadeInOut 3s forwards'
        }}>
          {toastMsg}
          <style jsx>{`
            @keyframes fadeInOut {
              0% { opacity: 0; transform: translate(-50%, 20px); }
              10% { opacity: 1; transform: translate(-50%, 0); }
              90% { opacity: 1; transform: translate(-50%, 0); }
              100% { opacity: 0; transform: translate(-50%, -20px); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
