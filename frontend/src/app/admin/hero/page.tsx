"use client";

import React, { useState, useEffect } from 'react';
import { useStore } from '../../../context/StoreContext';
import { supabase } from '../../../utils/supabase';
import { Plus, Edit2, Trash2, Save, X, Image as ImageIcon } from 'lucide-react';
import styles from './AdminHero.module.css';

export default function AdminHeroPage() {
  const { user } = useStore();
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Editor State
  const [isEditing, setIsEditing] = useState(false);
  const [currentSlide, setCurrentSlide] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');

  // Protect route
  useEffect(() => {
    if (!user) {
      // Allow viewing for dev purposes but usually we'd redirect to /profile
      console.warn("User not logged in");
    } else if (!user.is_admin) {
      setError("You do not have permission to access the admin dashboard.");
    }
  }, [user]);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/content/hero');
      if (res.ok) {
        const data = await res.json();
        setSlides(data);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch slides");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setCurrentSlide({
      title: '',
      subtitle: '',
      description: '',
      button_text: 'SHOP NOW',
      link: '/shop',
      image_url: '',
      object_position: 'center',
      is_active: true,
      display_order: slides.length
    });
    setImageFile(null);
    setPreviewUrl('');
    setIsEditing(true);
  };

  const handleEdit = (slide: any) => {
    setCurrentSlide({ ...slide });
    setImageFile(null);
    setPreviewUrl(slide.image_url);
    setIsEditing(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this slide?")) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/content/hero/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchSlides();
      }
    } catch (err) {
      alert("Failed to delete slide");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const uploadImageToSupabase = async (file: File) => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `hero/${fileName}`;

      // Assuming a public bucket named 'sd_assets' or 'hero_images'. We'll use 'sd_assets'
      const { data, error: uploadError } = await supabase.storage
        .from('sd_assets')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('sd_assets')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err: any) {
      console.error('Upload Error:', err);
      alert('Error uploading image. Is your Supabase configured and the sd_assets bucket public?');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSlide) return;

    let finalImageUrl = currentSlide.image_url;

    // If there's a new file selected, upload it first
    if (imageFile) {
      const uploadedUrl = await uploadImageToSupabase(imageFile);
      if (!uploadedUrl) return; // Stop if upload failed
      finalImageUrl = uploadedUrl;
    }

    if (!finalImageUrl) {
      alert("Please select an image");
      return;
    }

    const payload = { ...currentSlide, image_url: finalImageUrl };

    try {
      const url = payload.id 
        ? `http://localhost:5000/api/content/hero/${payload.id}`
        : `http://localhost:5000/api/content/hero`;
        
      const method = payload.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsEditing(false);
        fetchSlides();
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to save slide");
      }
    } catch (err) {
      alert("Network error saving slide");
    }
  };

  if (error) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: 'red' }}>
        <h2>Access Denied</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Manage Hero Slides</h1>
            {!isEditing && (
              <button className={styles.addBtn} onClick={handleAddNew}>
                <Plus size={18} /> Add New Slide
              </button>
            )}
          </div>

          {isEditing ? (
            <div className={styles.editorCard}>
              <div className={styles.editorHeader}>
                <h2>{currentSlide.id ? 'Edit Slide' : 'New Slide'}</h2>
                <button className={styles.iconBtn} onClick={() => setIsEditing(false)}>
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleSave} className={styles.formGrid}>
                <div className={styles.imageColumn}>
                  <div className={styles.imagePreview}>
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" style={{ objectPosition: currentSlide.object_position }} />
                    ) : (
                      <div className={styles.placeholder}>
                        <ImageIcon size={48} />
                        <p>No image selected</p>
                      </div>
                    )}
                  </div>
                  <div className={styles.formGroup}>
                    <label>Upload Image</label>
                    <input type="file" accept="image/*" onChange={handleImageChange} />
                    <small>Upload to Supabase Storage</small>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Or Image URL (Fallback)</label>
                    <input 
                      type="text" 
                      value={currentSlide.image_url || ''}
                      onChange={e => {
                        setCurrentSlide({...currentSlide, image_url: e.target.value});
                        setPreviewUrl(e.target.value);
                      }}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Image Position (CSS object-position)</label>
                    <input 
                      type="text" 
                      value={currentSlide.object_position || ''}
                      onChange={e => setCurrentSlide({...currentSlide, object_position: e.target.value})}
                      placeholder="e.g. center, right center, top"
                    />
                  </div>
                </div>

                <div className={styles.textColumn}>
                  <div className={styles.formGroup}>
                    <label>Subtitle (e.g. THIS WEEK'S HIGHLIGHTS)</label>
                    <input 
                      type="text" 
                      value={currentSlide.subtitle || ''}
                      onChange={e => setCurrentSlide({...currentSlide, subtitle: e.target.value})}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Title (Required)</label>
                    <input 
                      type="text" 
                      value={currentSlide.title || ''}
                      onChange={e => setCurrentSlide({...currentSlide, title: e.target.value})}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Description</label>
                    <textarea 
                      value={currentSlide.description || ''}
                      onChange={e => setCurrentSlide({...currentSlide, description: e.target.value})}
                      rows={4}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Button Text</label>
                    <input 
                      type="text" 
                      value={currentSlide.button_text || ''}
                      onChange={e => setCurrentSlide({...currentSlide, button_text: e.target.value})}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Button Link</label>
                    <input 
                      type="text" 
                      value={currentSlide.link || ''}
                      onChange={e => setCurrentSlide({...currentSlide, link: e.target.value})}
                    />
                  </div>
                  <div className={styles.checkboxGroup}>
                    <input 
                      type="checkbox" 
                      id="isActive"
                      checked={currentSlide.is_active}
                      onChange={e => setCurrentSlide({...currentSlide, is_active: e.target.checked})}
                    />
                    <label htmlFor="isActive">Slide is Active (Visible on homepage)</label>
                  </div>
                  
                  <button type="submit" className={styles.saveBtn} disabled={uploading}>
                    {uploading ? 'Uploading Image...' : <><Save size={18} /> Save Slide</>}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className={styles.slidesList}>
              {loading ? (
                <p>Loading slides...</p>
              ) : slides.length === 0 ? (
                <div className={styles.emptyState}>No hero slides found. Add one!</div>
              ) : (
                slides.map((slide: any) => (
                  <div key={slide.id} className={`${styles.slideCard} ${!slide.is_active ? styles.inactive : ''}`}>
                    <div className={styles.slideThumbnail}>
                      <img src={slide.image_url} alt={slide.title} style={{ objectPosition: slide.object_position }} />
                    </div>
                    <div className={styles.slideInfo}>
                      <span className={styles.statusBadge}>{slide.is_active ? 'Active' : 'Draft'}</span>
                      <h3>{slide.title}</h3>
                      <p>{slide.subtitle}</p>
                    </div>
                    <div className={styles.slideActions}>
                      <button className={styles.editBtn} onClick={() => handleEdit(slide)}>
                        <Edit2 size={16} /> Edit
                      </button>
                      <button className={styles.deleteBtn} onClick={() => handleDelete(slide.id)}>
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
        )}
    </div>
  );
}
