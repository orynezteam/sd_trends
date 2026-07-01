"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '../../../../utils/supabase';
import { Save, ArrowLeft, Upload, X } from 'lucide-react';
import Link from 'next/link';
import styles from '../../products/new/NewProduct.module.css';

export default function EditMidBannerPage() {
  const router = useRouter();
  const params = useParams();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [existingImage, setExistingImage] = useState<string>('');
  
  const slot_name = Array.isArray(params?.slot) ? params.slot[0] : params?.slot;

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    link_url: ''
  });

  useEffect(() => {
    fetch(`http://localhost:5000/api/content/mid_banners/${slot_name}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setFormData({
            title: data.title || '',
            subtitle: data.subtitle || '',
            description: data.description || '',
            link_url: data.link_url || ''
          });
          setExistingImage(data.image_url || '');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [slot_name]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    if (!formData.title) return alert("Title is required");

    setSaving(true);
    try {
      let publicUrl = existingImage;

      // Upload image to Supabase Storage if changed
      if (image) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `banners/${fileName}`;

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
        image_url: publicUrl || null
      };

      const res = await fetch(`http://localhost:5000/api/content/mid_banners/${slot_name}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        alert("Banner updated!");
        router.push('/admin/mid-banners');
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update banner");
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
          <Link href="/admin/mid-banners" className={styles.backBtn}>
            <ArrowLeft size={18} />
          </Link>
          <h2 style={{ textTransform: 'capitalize' }}>Edit {slot_name} Banner</h2>
        </div>
        <button onClick={handleSubmit} className={styles.saveBtn} disabled={saving}>
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Banner'}
        </button>
      </div>

      <form className={styles.formContainer} onSubmit={handleSubmit}>
        <div className={styles.mainCol}>
          <div className={styles.section}>
            <h3>Banner Content</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Note: You can use HTML tags like <code>&lt;br /&gt;</code> for line breaks in the title.
            </p>
            <div className={styles.formGroup}>
              <label>Title *</label>
              <input type="text" name="title" value={formData.title} onChange={handleInputChange} required />
            </div>
            
            <div className={styles.formGroup}>
              <label>Subtitle</label>
              <input type="text" name="subtitle" value={formData.subtitle} onChange={handleInputChange} />
            </div>

            {slot_name === 'highlights' && (
              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleInputChange} 
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--bg-primary)', fontFamily: 'var(--font-sans)', minHeight: '80px' }}
                />
              </div>
            )}
            
            <div className={styles.formGroup}>
              <label>Button Link URL</label>
              <input type="text" name="link_url" value={formData.link_url} onChange={handleInputChange} />
            </div>
          </div>
        </div>

        <div className={styles.sideCol}>
          <div className={styles.section}>
            <h3>Background Image</h3>
            <div className={styles.imageGrid}>
              {(preview || existingImage) ? (
                <div className={styles.imagePreviewWrapper}>
                  <img src={preview || existingImage} alt="Preview" className={styles.imagePreview} style={{ objectFit: 'contain' }} />
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
      </form>
    </div>
  );
}
