import sys

filepath = r'd:\sd\sd_trends\frontend\src\app\product\[id]\ProductClientPage.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. State Additions
state_anchor = "  const [toastMsg, setToastMsg] = useState('');"
state_new = """  const [toastMsg, setToastMsg] = useState('');
  const [reviews, setReviews] = useState<any[]>([]);
  const [newReview, setNewReview] = useState({ author: '', rating: 5, review_text: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (productId) {
      fetch(`http://localhost:5000/api/products/${productId}/reviews`)
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
      const res = await fetch(`http://localhost:5000/api/products/${productId}/reviews`, {
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
  };"""

content = content.replace(state_anchor, state_new)

# 2. Dynamic Description & Shipping
about_old = """                <div className={styles.descriptionTab}>
                  <h3 className={styles.aboutTitle}>About this item</h3>
                  <p className={styles.aboutText}>
                    Indulge in the allure of timeless elegance with our fine jewelry. Whether worn as a symbol of love, a celebration of achievements, or simply as a daily indulgence, this piece is a testament to enduring beauty and refined style. Arriving in an elegant signature jewelry box, it makes the perfect gift for a loved one or a treasured addition to your own collection. Each piece is accompanied by a certificate of authenticity, guaranteeing the highest quality of gemstones and gold purity.
                  </p>
                  <div className={styles.tabImageWrapper}>
                    <img 
                      src={product.images[1] || product.images[0]} 
                      alt={`${product.name} detail view`} 
                      className={styles.tabImage}
                    />
                  </div>
                </div>"""
about_new = """                <div className={styles.descriptionTab}>
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
                  <div className={styles.tabImageWrapper}>
                    <img 
                      src={product.images[1] || product.images[0]} 
                      alt={`${product.name} detail view`} 
                      className={styles.tabImage}
                    />
                  </div>
                </div>"""

content = content.replace(about_old, about_new)

shipping_old = """                <div className={styles.shippingTab}>
                  <h3 className={styles.aboutTitle}>Shipping & Returns Policy</h3>
                  <ul className={styles.shippingList}>
                    <li><strong>Free Shipping:</strong> Free insured shipping worldwide on all orders.</li>
                    <li><strong>Estimated Delivery:</strong> Typically delivers in 3-5 business days. Tracking details will be emailed immediately.</li>
                    <li><strong>Returns Policy:</strong> Hassle-free 30-day returns. If you are not 100% satisfied, contact us for a full refund or exchange.</li>
                  </ul>
                </div>"""
shipping_new = """                <div className={styles.shippingTab}>
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
                </div>"""

content = content.replace(shipping_old, shipping_new)

# 3. Dynamic Reviews
reviews_old = """              {activeTab === 'reviews' && (
                <div className={styles.reviewsTab}>
                  <h3 className={styles.aboutTitle}>Customer Review</h3>
                  <div className={styles.reviewCard}>
                    <div className={styles.reviewHeader}>
                      <div className={styles.reviewAuthor}>Clara M.</div>
                      <div className={styles.reviewStars}>{renderStars(5)}</div>
                    </div>
                    <p className={styles.reviewText}>
                      "Beautiful craftsmanship, my wife absolutely loved it! The gold is highly polished and the stones shine brilliantly in the light. Delivery was fast and came in a very premium box."
                    </p>
                  </div>
                </div>
              )}"""
reviews_new = """              {activeTab === 'reviews' && (
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
              )}"""

content = content.replace(reviews_old, reviews_new)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print('ProductClientPage.tsx updated successfully!')
