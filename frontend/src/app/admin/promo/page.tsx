"use client";

import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import styles from './AdminPromo.module.css';
import { API_BASE_URL, BASE_URL } from '@/config';


export default function AdminPromoPage() {
  const [promo, setPromo] = useState({
    text: '',
    link_text: '',
    link_url: '',
    is_active: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/content/promo`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          setPromo(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load promo:", err);
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/content/promo`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promo)
      });
      if (res.ok) {
        alert("Promo banner updated successfully!");
      } else {
        alert("Failed to update promo banner.");
      }
    } catch (err) {
      alert("Network error saving promo banner.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.editorCard}>
        <h2>Edit Promo Banner</h2>
        <p className={styles.description}>
          This text appears at the very top of your website.
        </p>
        
        <form onSubmit={handleSave} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Promo Text (Required)</label>
            <input 
              type="text" 
              value={promo.text}
              onChange={e => setPromo({...promo, text: e.target.value})}
              required
              placeholder="e.g. Free shipping world wide for all orders over ₹199"
            />
          </div>
          
          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label>Link Text</label>
              <input 
                type="text" 
                value={promo.link_text}
                onChange={e => setPromo({...promo, link_text: e.target.value})}
                placeholder="e.g. Shop Now"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>Link URL</label>
              <input 
                type="text" 
                value={promo.link_url}
                onChange={e => setPromo({...promo, link_url: e.target.value})}
                placeholder="e.g. /shop"
              />
            </div>
          </div>
          
          <div className={styles.checkboxGroup}>
            <input 
              type="checkbox" 
              id="isActive"
              checked={promo.is_active}
              onChange={e => setPromo({...promo, is_active: e.target.checked})}
            />
            <label htmlFor="isActive">Show Banner on Website</label>
          </div>
          
          <button type="submit" className={styles.saveBtn} disabled={saving}>
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
