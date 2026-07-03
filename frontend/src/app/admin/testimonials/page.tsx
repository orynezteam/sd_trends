"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import styles from '../products/AdminProducts.module.css';
import { API_BASE_URL, BASE_URL } from '@/config';


export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTestimonials = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/testimonials`);
      if (res.ok) {
        const data = await res.json();
        setTestimonials(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/testimonials/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTestimonials(testimonials.filter(t => t.id !== id));
      } else {
        alert("Failed to delete testimonial.");
      }
    } catch (err) {
      alert("Network error.");
    }
  };

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/testimonials/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setTestimonials(testimonials.map(t => t.id === id ? { ...t, status: newStatus } : t));
      } else {
        alert("Failed to update status.");
      }
    } catch (err) {
      alert("Network error.");
    }
  };

  if (loading) return <div className={styles.loading}>Loading data...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2>Testimonials Management</h2>
          <p className={styles.description}>
            Approve, edit, or delete customer testimonials. Only "approved" testimonials appear on the storefront.
          </p>
        </div>
        <div className={styles.actions}>
          <Link href="/admin/testimonials/new" className={styles.addBtn}>
            <Plus size={18} />
            Add Testimonial
          </Link>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Image</th>
              <th>Customer</th>
              <th>Quote</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {testimonials.length > 0 ? (
              testimonials.map(t => (
                <tr key={t.id}>
                  <td>
                    {t.image_url ? (
                      <img src={t.image_url} alt={t.author} className={styles.productThumbnail} style={{ borderRadius: '50%' }} />
                    ) : (
                      <div className={styles.noImageThumbnail} style={{ borderRadius: '50%' }}>No Img</div>
                    )}
                  </td>
                  <td>
                    <div className={styles.productDetails}>
                      <span className={styles.productName}>{t.author}</span>
                      <span className={styles.productId}>{t.role}</span>
                    </div>
                  </td>
                  <td style={{ maxWidth: '300px' }}>
                    <div className={styles.productDetails}>
                      <span className={styles.productName} style={{ fontSize: '0.85rem', WebkitLineClamp: 1 }}>{t.title}</span>
                      <span className={styles.productId} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.quote}</span>
                    </div>
                  </td>
                  <td>
                    <span className={styles.categoryBadge} style={{ 
                      backgroundColor: t.status === 'approved' ? '#dcfce7' : t.status === 'rejected' ? '#fee2e2' : '#fef9c3',
                      color: t.status === 'approved' ? '#166534' : t.status === 'rejected' ? '#991b1b' : '#854d0e',
                      borderColor: t.status === 'approved' ? '#bbf7d0' : t.status === 'rejected' ? '#fecaca' : '#fef08a'
                    }}>
                      {t.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      {t.status !== 'approved' && (
                        <button 
                          onClick={() => handleUpdateStatus(t.id, 'approved')} 
                          className={styles.editBtn} 
                          style={{ backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' }}
                          title="Approve"
                        >
                          <CheckCircle size={16} /> Approve
                        </button>
                      )}
                      {t.status !== 'rejected' && (
                        <button 
                          onClick={() => handleUpdateStatus(t.id, 'rejected')} 
                          className={styles.editBtn} 
                          style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' }}
                          title="Reject"
                        >
                          <XCircle size={16} /> Reject
                        </button>
                      )}
                      <Link href={`/admin/testimonials/${t.id}`} className={styles.editBtn}>
                        <Edit2 size={16} /> Edit
                      </Link>
                      <button onClick={() => handleDelete(t.id)} className={styles.deleteBtn}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className={styles.noResults}>
                  No testimonials found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
