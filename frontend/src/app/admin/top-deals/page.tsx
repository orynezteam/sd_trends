"use client";

import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Clock } from 'lucide-react';
import styles from './AdminTopDeals.module.css';
import { useStore } from '../../../context/StoreContext';

interface DealCategory {
  name: string;
  imageUrl: string;
  link: string;
}

export default function AdminTopDeals() {
  const { user } = useStore();
  const [categories, setCategories] = useState<DealCategory[]>([]);
  const [timer, setTimer] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTopDeals();
  }, []);

  const fetchTopDeals = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/settings/top-deals');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
        
        // Timer comes from backend as a date string e.g. "2026-07-28T12:00"
        setTimer(data.timer || '');
      }
    } catch (err) {
      console.error("Failed to fetch top deals settings", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/settings/top-deals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          categories,
          timer
        })
      });
      if (res.ok) {
        alert('Top Deals settings saved successfully!');
      } else {
        alert('Failed to save settings');
      }
    } catch (err) {
      console.error(err);
      alert('Network error occurred.');
    }
    setSaving(false);
  };

  const addCategory = () => {
    setCategories([...categories, { name: 'New Category', imageUrl: '', link: '/shop?subcategory=New' }]);
  };

  const updateCategory = (index: number, field: keyof DealCategory, value: string) => {
    const newCategories = [...categories];
    newCategories[index] = { ...newCategories[index], [field]: value };
    setCategories(newCategories);
  };

  const removeCategory = (index: number) => {
    if (confirm('Remove this category?')) {
      const newCategories = [...categories];
      newCategories.splice(index, 1);
      setCategories(newCategories);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading settings...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Manage Top Deals Configuration</h2>
        <button 
          className={styles.saveBtn} 
          onClick={handleSave}
          disabled={saving}
        >
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className={styles.section}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <Clock size={20} color="var(--primary-color)" />
          <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Countdown Timer</h3>
        </div>
        
        <div className={styles.formGroup} style={{ maxWidth: '400px' }}>
          <label>End Date & Time</label>
          <input 
            type="datetime-local" 
            className={styles.input}
            value={timer}
            onChange={(e) => setTimer(e.target.value)}
          />
          <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '0.5rem' }}>
            The countdown on the Top Deals page will run until this exact date and time.
          </p>
        </div>
      </div>

      <div className={styles.section}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Top Deals Categories</h3>
        
        <div className={styles.grid}>
          {categories.map((cat, idx) => (
            <div key={idx} className={styles.categoryCard}>
              <button 
                className={styles.removeBtn} 
                onClick={() => removeCategory(idx)}
                title="Remove Category"
              >
                <Trash2 size={16} />
              </button>
              
              <div className={styles.imagePreview}>
                {cat.imageUrl ? (
                  <img src={cat.imageUrl} alt={cat.name} />
                ) : (
                  <span style={{ color: '#aaa', fontSize: '0.9rem' }}>No Image URL</span>
                )}
              </div>
              
              <div className={styles.formGroup}>
                <label>Category Name</label>
                <input 
                  type="text" 
                  className={styles.input}
                  value={cat.name}
                  onChange={(e) => updateCategory(idx, 'name', e.target.value)}
                  placeholder="e.g. Diamond Ring"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Image URL</label>
                <input 
                  type="text" 
                  className={styles.input}
                  value={cat.imageUrl}
                  onChange={(e) => updateCategory(idx, 'imageUrl', e.target.value)}
                  placeholder="/images/example.png"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Target Link</label>
                <input 
                  type="text" 
                  className={styles.input}
                  value={cat.link}
                  onChange={(e) => updateCategory(idx, 'link', e.target.value)}
                  placeholder="/shop?subcategory=..."
                />
              </div>
            </div>
          ))}
          
          <div className={styles.addCard} onClick={addCategory}>
            <Plus size={32} style={{ marginBottom: '1rem' }} />
            <span>Add Category</span>
          </div>
        </div>
      </div>
    </div>
  );
}
