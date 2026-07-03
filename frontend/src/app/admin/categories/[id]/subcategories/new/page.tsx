"use client";

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '../../../../../../utils/supabase';
import { Save, ArrowLeft, Upload, X } from 'lucide-react';
import Link from 'next/link';
import styles from '../../../../products/new/NewProduct.module.css';
import { API_BASE_URL, BASE_URL } from '@/config';


export default function NewSubcategoryPage() {
  const router = useRouter();
  const params = useParams();
  const [saving, setSaving] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  
  const [formData, setFormData] = useState({
    name: '',
    is_home_featured: false,
    home_count_text: '',
    display_order: 0
  });

  const catId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : (name === 'display_order' ? parseInt(value) || 0 : value) 
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return alert("Please fill in Subcategory Name");
    if (formData.is_home_featured && !image) {
      return alert("You must upload a Homepage Image when featuring this subcategory on the homepage slider.");
    }

    setSaving(true);
    
    try {
      let publicUrl = '';

      // Upload image if provided
      if (image) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `categories/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('sd_assets')
          .upload(filePath, image);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('sd_assets')
          .getPublicUrl(filePath);
          
        publicUrl = data.publicUrl;
      }

      const payload = {
        ...formData,
        home_image_url: publicUrl || null
      };
      
      const res = await fetch(`${API_BASE_URL}/content/categories/${catId}/subcategories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        alert("Subcategory created successfully!");
        router.push(`/admin/categories/${catId}`);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create subcategory.");
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
          <Link href={`/admin/categories/${catId}`} className={styles.backBtn}>
            <ArrowLeft size={18} />
          </Link>
          <h2>Add New Subcategory</h2>
        </div>
        <button onClick={handleSubmit} className={styles.saveBtn} disabled={saving}>
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Subcategory'}
        </button>
      </div>

      <form className={styles.formContainer} onSubmit={handleSubmit}>
        <div className={styles.mainCol}>
          <div className={styles.section}>
            <h3>Subcategory Details</h3>
            <div className={styles.formGroup}>
              <label>Name (e.g. Diamond Rings) *</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
            </div>
            
            <div className={styles.formGroup}>
              <label>Display Order</label>
              <input type="number" name="display_order" value={formData.display_order} onChange={handleInputChange} />
            </div>
          </div>

          <div className={styles.section}>
            <div style={{ padding: '12px 16px', backgroundColor: 'rgba(206,150,126,0.1)', border: '1px solid rgba(206,150,126,0.4)', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>
                💡 <strong>To show this subcategory on the homepage slider</strong>: Enable the toggle below, fill in the count text, and upload a category image. The image is required for the slider to display.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <input 
                type="checkbox" 
                id="is_home_featured" 
                name="is_home_featured" 
                checked={formData.is_home_featured} 
                onChange={handleInputChange} 
                style={{ width: '20px', height: '20px' }}
              />
              <label htmlFor="is_home_featured" style={{ fontSize: '18px', fontWeight: 600, margin: 0, cursor: 'pointer' }}>
                Feature on Homepage Slider?
              </label>
            </div>
            
            {formData.is_home_featured && (
              <div style={{ marginTop: '1.5rem', padding: '1.5rem', backgroundColor: 'var(--bg-color)', borderRadius: '8px' }}>
                <div className={styles.formGroup}>
                  <label>Homepage Subtitle / Count Text (e.g. "8 Items")</label>
                  <input type="text" name="home_count_text" value={formData.home_count_text} onChange={handleInputChange} />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Homepage Category Image * <span style={{ fontWeight: 400, color: 'var(--text-secondary)', fontSize: '13px' }}>(Required for homepage slider)</span></label>
                  <div className={styles.imageGrid}>
                    {preview ? (
                      <div className={styles.imagePreviewWrapper}>
                        <img src={preview} alt="Preview" className={styles.imagePreview} />
                        <button type="button" className={styles.removeImageBtn} onClick={() => { setImage(null); setPreview(''); }}>
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className={styles.uploadBox}>
                        <input type="file" id="image-upload" accept="image/*" onChange={handleImageChange} className={styles.fileInput} />
                        <label htmlFor="image-upload" className={styles.uploadLabel}>
                          <Upload size={24} />
                          <span>Upload Image</span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
