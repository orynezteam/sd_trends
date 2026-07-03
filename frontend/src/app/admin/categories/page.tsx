"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit2, Trash2, List } from 'lucide-react';
import styles from '../products/AdminProducts.module.css';

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = () => {
    fetch('https://sd-trends.onrender.com/api/content/categories/hierarchy')
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this Category and ALL its Subcategories?")) return;

    try {
      const res = await fetch(`https://sd-trends.onrender.com/api/content/categories/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchCategories();
      } else {
        alert("Failed to delete category");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className={styles.loading}>Loading categories...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2>Product Categories</h2>
          <p className={styles.description}>Manage header navigation categories and homepage featured items.</p>
        </div>
        <Link href="/admin/categories/new" className={styles.addBtn}>
          <Plus size={20} />
          New Category
        </Link>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Order</th>
              <th>Subcategories</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length > 0 ? (
              categories.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td>{c.display_order}</td>
                  <td>
                    <span style={{ 
                      backgroundColor: 'var(--surface-color)', 
                      padding: '4px 8px', 
                      borderRadius: '12px', 
                      fontSize: '12px' 
                    }}>
                      {c.subcategories?.length || 0} items
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <Link href={`/admin/categories/${c.id}`} className={styles.iconBtn} title="Manage Subcategories & Edit">
                        <List size={18} />
                      </Link>
                      <button className={`${styles.iconBtn} ${styles.deleteBtn}`} onClick={() => handleDelete(c.id)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>No categories found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
