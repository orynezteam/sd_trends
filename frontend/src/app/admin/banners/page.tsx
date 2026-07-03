"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabase';
import { Save, Image as ImageIcon } from 'lucide-react';
import styles from './AdminBanners.module.css';
import { API_BASE_URL, BASE_URL } from '@/config';


export default function AdminBannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Track files being uploaded: bannerId -> File
  const [files, setFiles] = useState<{ [key: number]: File }>({});
  // Track local previews: bannerId -> url string
  const [previews, setPreviews] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    fetch(`${API_BASE_URL}/content/promotion-banners`)
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data)) {
          setBanners(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load banners:", err);
        setLoading(false);
      });
  }, []);

  const handleUpdate = (id: number, field: string, value: string) => {
    setBanners(banners.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const handleImageChange = (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFiles({ ...files, [id]: file });
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews({ ...previews, [id]: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImageToSupabase = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `banners/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from('sd_assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('sd_assets')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err: any) {
      console.error('Upload Error:', err);
      alert('Error uploading image to Supabase.');
      return null;
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // First, handle all uploads
      const updatedBanners = [...banners];
      for (let i = 0; i < updatedBanners.length; i++) {
        const banner = updatedBanners[i];
        if (files[banner.id]) {
          const uploadedUrl = await uploadImageToSupabase(files[banner.id]);
          if (uploadedUrl) {
            banner.image_url = uploadedUrl;
          }
        }
      }

      // Then save the data to backend
      const res = await fetch(`${API_BASE_URL}/content/promotion-banners`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedBanners)
      });
      
      if (res.ok) {
        alert("Banners updated successfully!");
        const data = await res.json();
        setBanners(data.banners);
        setFiles({}); // Clear pending uploads
        setPreviews({}); // Clear previews
      } else {
        alert("Failed to update banners.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error saving banners.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2>Promotion Banners</h2>
          <p className={styles.description}>
            Update the 3 promotion banners displayed on the homepage grid. You can type `{"<br />"}` in the Title field to force a line break.
          </p>
        </div>
        <button onClick={handleSave} className={styles.saveBtn} disabled={saving}>
          <Save size={18} />
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>

      <div className={styles.grid}>
        {banners.map((banner) => (
          <div key={banner.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>{banner.slot_name}</h3>
            </div>
            
            <div className={styles.imageUploadWrapper}>
              <div 
                className={styles.imagePreview} 
                style={{ 
                  backgroundImage: `url(${previews[banner.id] || banner.image_url})` 
                }}
              >
                {!previews[banner.id] && !banner.image_url && (
                  <div className={styles.noImage}>
                    <ImageIcon size={40} />
                    <span>No Image</span>
                  </div>
                )}
              </div>
              <input 
                type="file" 
                id={`upload-${banner.id}`}
                className={styles.fileInput}
                accept="image/*"
                onChange={(e) => handleImageChange(banner.id, e)}
              />
              <label htmlFor={`upload-${banner.id}`} className={styles.uploadBtn}>
                Select New Image
              </label>
            </div>

            <div className={styles.formGroup}>
              <label>Subtitle</label>
              <input 
                type="text" 
                value={banner.subtitle || ''} 
                onChange={(e) => handleUpdate(banner.id, 'subtitle', e.target.value)}
                placeholder="e.g. Diamond Rings"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Title</label>
              <input 
                type="text" 
                value={banner.title || ''} 
                onChange={(e) => handleUpdate(banner.id, 'title', e.target.value)}
                placeholder="e.g. Yellow Gold & <br /> Diamond Ring"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Link URL</label>
              <input 
                type="text" 
                value={banner.link_url || ''} 
                onChange={(e) => handleUpdate(banner.id, 'link_url', e.target.value)}
                placeholder="e.g. #featured-section or /shop"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
