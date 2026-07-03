"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '../../../../../../utils/supabase';
import { Save, ArrowLeft, Upload, X } from 'lucide-react';
import Link from 'next/link';
import styles from '../../../../products/new/NewProduct.module.css';

export default function EditSubcategoryPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [existingImage, setExistingImage] = useState<string>('');
  
  const [formData, setFormData] = useState({
    name: '',
    is_home_featured: false,
    home_count_text: '',
    display_order: 0,
    category_id: 0
  });

  const catId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const subId = Array.isArray(params?.subId) ? params.subId[0] : params?.subId;

  useEffect(() => {
    const fetchSubcategory = async () => {
      try {
        const res = await fetch('https://sd-trends.onrender.com/api/content/categories/hierarchy');
        if (res.ok) {
          const data = await res.json();
          const category = data.find((c: any) => c.id.toString() === catId);
          if (category) {
            const sub = category.subcategories.find((s: any) => s.id.toString() === subId);
            if (sub) {
              setFormData({
                name: sub.name || '',
                is_home_featured: sub.is_home_featured || false,
                home_count_text: sub.home_count_text || '',
                display_order: sub.display_order || 0,
                category_id: sub.category_id || parseInt(catId as string)
              });
              setExistingImage(sub.home_image_url || '');
            } else {
              alert("Subcategory not found");
              router.push(`/admin/categories/${catId}`);
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubcategory();
  }, [catId, subId, router]);

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
      setExistingImage('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return alert("Please fill in Subcategory Name");
    if (formData.is_home_featured && !image && !existingImage) {
      return alert("You must upload an image if this subcategory is featured on the homepage.");
    }

    setSaving(true);
    
    try {
      let publicUrl = existingImage;

      // Upload image if provided and featured
      if (formData.is_home_featured && image) {
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
      } else if (!formData.is_home_featured) {
        publicUrl = '';
      }

      const payload = {
        ...formData,
        home_image_url: publicUrl || null
      };
      
      const res = await fetch(`https://sd-trends.onrender.com/api/content/subcategories/${subId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        alert("Subcategory updated!");
        router.push(`/admin/categories/${catId}`);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update subcategory.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href={`/admin/categories/${catId}`} className={styles.backBtn}>
            <ArrowLeft size={18} />
          </Link>
          <h2>Edit Subcategory</h2>
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
                  <label>Homepage Category Image *</label>
                  <div className={styles.imageGrid}>
                    {(preview || existingImage) ? (
                      <div className={styles.imagePreviewWrapper}>
                        <img src={preview || existingImage} alt="Preview" className={styles.imagePreview} />
                        <button type="button" className={styles.removeImageBtn} onClick={() => { setImage(null); setPreview(''); setExistingImage(''); }}>
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
