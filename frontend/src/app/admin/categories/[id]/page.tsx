"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Save, ArrowLeft, Plus, Edit2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import styles from '../../products/new/NewProduct.module.css';
import tableStyles from '../../products/AdminProducts.module.css';

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    display_order: 0
  });

  const catId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const fetchCategory = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/content/categories/hierarchy');
      if (res.ok) {
        const data = await res.json();
        const category = data.find((c: any) => c.id.toString() === catId);
        if (category) {
          setFormData({
            name: category.name || '',
            display_order: category.display_order || 0
          });
          setSubcategories(category.subcategories || []);
        } else {
          alert("Category not found");
          router.push('/admin/categories');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategory();
  }, [catId, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'display_order' ? parseInt(value) || 0 : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return alert("Please fill in Category Name");

    setSaving(true);
    try {
      const res = await fetch(`http://localhost:5000/api/content/categories/${catId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        alert("Category updated!");
      } else {
        alert("Failed to update category.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSubcategory = async (subId: number) => {
    if (!confirm("Delete this subcategory?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/content/subcategories/${subId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchCategory();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/admin/categories" className={styles.backBtn}>
            <ArrowLeft size={18} />
          </Link>
          <h2>Manage Category: {formData.name}</h2>
        </div>
        <button onClick={handleSubmit} className={styles.saveBtn} disabled={saving}>
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Category Details'}
        </button>
      </div>

      <div className={styles.formContainer}>
        {/* Parent Details */}
        <form className={styles.mainCol} onSubmit={handleSubmit} style={{ flex: 'none', width: '100%' }}>
          <div className={styles.section}>
            <h3>Category Details</h3>
            <div className={styles.row}>
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

        {/* Subcategories List */}
        <div className={styles.mainCol} style={{ flex: 'none', width: '100%', marginTop: '1rem' }}>
          <div className={styles.section}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>Subcategories (Header Links)</h3>
              <Link href={`/admin/categories/${catId}/subcategories/new`} className={tableStyles.addBtn} style={{ padding: '8px 16px', fontSize: '14px' }}>
                <Plus size={16} />
                Add Subcategory
              </Link>
            </div>
            
            <div className={tableStyles.tableContainer}>
              <table className={tableStyles.table}>
                <thead>
                  <tr>
                    <th>Subcategory Name</th>
                    <th>Featured on Home?</th>
                    <th>Order</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subcategories.length > 0 ? (
                    subcategories.map(sub => (
                      <tr key={sub.id}>
                        <td style={{ fontWeight: 600 }}>{sub.name}</td>
                        <td>
                          {sub.is_home_featured ? (
                            <span style={{ color: 'green', fontWeight: 'bold' }}>Yes</span>
                          ) : (
                            <span style={{ color: 'gray' }}>No</span>
                          )}
                        </td>
                        <td>{sub.display_order}</td>
                        <td>
                          <div className={tableStyles.actions}>
                            <Link href={`/admin/categories/${catId}/subcategories/${sub.id}`} className={tableStyles.iconBtn}>
                              <Edit2 size={18} />
                            </Link>
                            <button className={`${tableStyles.iconBtn} ${tableStyles.deleteBtn}`} onClick={() => handleDeleteSubcategory(sub.id)}>
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '1rem' }}>No subcategories found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
