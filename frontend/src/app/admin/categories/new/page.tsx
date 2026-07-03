"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import styles from '../../products/new/NewProduct.module.css';
import { API_BASE_URL, BASE_URL } from '@/config';


export default function NewCategoryPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    display_order: 0
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'display_order' ? parseInt(value) || 0 : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return alert("Please fill in Category Name");

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/content/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        alert("Category created!");
        router.push('/admin/categories');
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create category.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/admin/categories" className={styles.backBtn}>
            <ArrowLeft size={18} />
          </Link>
          <h2>Add New Category</h2>
        </div>
        <button onClick={handleSubmit} className={styles.saveBtn} disabled={saving}>
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Category'}
        </button>
      </div>

      <form className={styles.formContainer} onSubmit={handleSubmit}>
        <div className={styles.mainCol}>
          <div className={styles.section}>
            <h3>Category Details</h3>
            <div className={styles.formGroup}>
              <label>Name (e.g. Rings) *</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
            </div>
            <div className={styles.formGroup}>
              <label>Display Order</label>
              <input type="number" name="display_order" value={formData.display_order} onChange={handleInputChange} />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
