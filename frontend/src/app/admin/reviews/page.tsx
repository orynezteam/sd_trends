"use client";

import React, { useState, useEffect } from 'react';
import styles from './AdminReviews.module.css';
import { Trash2, Edit, CheckCircle, XCircle } from 'lucide-react';

interface Review {
  id: number;
  product_id: string;
  author: string;
  rating: number;
  review_text: string;
  status: string;
  created_at: string;
}

interface Product {
  id: string;
  name: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newReview, setNewReview] = useState({
    product_id: '',
    author: '',
    rating: 5,
    review_text: '',
    status: 'approved'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [revRes, prodRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/reviews'),
        fetch('http://localhost:5000/api/products')
      ]);
      const revData = await revRes.json();
      const prodData = await prodRes.json();
      setReviews(revData);
      setProducts(prodData);
      if (prodData.length > 0) {
        setNewReview(prev => ({ ...prev, product_id: prodData[0].id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/reviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setReviews(reviews.map(r => r.id === id ? { ...r, status } : r));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteReview = async (id: number) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/reviews/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setReviews(reviews.filter(r => r.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.product_id || !newReview.author || !newReview.review_text) return;
    try {
      const res = await fetch('http://localhost:5000/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview)
      });
      if (res.ok) {
        const added = await res.json();
        setReviews([added, ...reviews]);
        setShowAddModal(false);
        setNewReview({
          product_id: products[0]?.id || '',
          author: '',
          rating: 5,
          review_text: '',
          status: 'approved'
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getProductName = (id: string) => {
    const p = products.find(p => p.id === id);
    return p ? p.name : id;
  };

  return (
    <div className={styles.adminLayout}>
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1>Manage Product Reviews</h1>
          <button className={styles.addBtn} onClick={() => setShowAddModal(true)}>+ Add Review</button>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Author</th>
                <th>Product</th>
                <th>Rating</th>
                <th>Review</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center' }}>Loading...</td></tr>
              ) : reviews.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center' }}>No reviews found</td></tr>
              ) : (
                reviews.map(review => (
                  <tr key={review.id}>
                    <td><strong>{review.author}</strong></td>
                    <td>{getProductName(review.product_id)}</td>
                    <td>{review.rating} / 5</td>
                    <td className={styles.reviewTextCell}>{review.review_text}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[review.status]}`}>
                        {review.status}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionBtns}>
                        {review.status !== 'approved' && (
                          <button onClick={() => updateStatus(review.id, 'approved')} className={styles.approveBtn} title="Approve">
                            <CheckCircle size={16} />
                          </button>
                        )}
                        {review.status !== 'rejected' && (
                          <button onClick={() => updateStatus(review.id, 'rejected')} className={styles.rejectBtn} title="Reject">
                            <XCircle size={16} />
                          </button>
                        )}
                        <button onClick={() => deleteReview(review.id)} className={styles.deleteBtn} title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {showAddModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <h2>Add Manual Review</h2>
              <form onSubmit={handleAddSubmit}>
                <div className={styles.formGroup}>
                  <label>Product</label>
                  <select 
                    value={newReview.product_id} 
                    onChange={e => setNewReview({...newReview, product_id: e.target.value})}
                  >
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Author Name</label>
                  <input 
                    type="text" 
                    value={newReview.author} 
                    onChange={e => setNewReview({...newReview, author: e.target.value})}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Rating (1-5)</label>
                  <input 
                    type="number" 
                    min="1" max="5" 
                    value={newReview.rating} 
                    onChange={e => setNewReview({...newReview, rating: parseInt(e.target.value)})}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Review Text</label>
                  <textarea 
                    rows={4} 
                    value={newReview.review_text} 
                    onChange={e => setNewReview({...newReview, review_text: e.target.value})}
                    required
                  />
                </div>
                <div className={styles.modalActions}>
                  <button type="button" className={styles.cancelBtn} onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className={styles.submitBtn}>Add Review</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
