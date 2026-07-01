"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '../../../../utils/supabase';
import { Save, ArrowLeft, Upload, X } from 'lucide-react';
import Link from 'next/link';
import styles from '../../products/new/NewProduct.module.css';

export default function EditTestimonialPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [formData, setFormData] = useState({
    title: '',
    quote: '',
    author: '',
    role: '',
    status: 'pending',
    image_url: ''
  });

  const [loading, setLoading] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchTestimonial() {
      try {
        const res = await fetch(`http://localhost:5000/api/testimonials`);
        if (res.ok) {
          const data = await res.json();
          const testimonial = data.find((t: any) => t.id.toString() === id);
          if (testimonial) {
            setFormData({
              title: testimonial.title || '',
              quote: testimonial.quote || '',
              author: testimonial.author || '',
              role: testimonial.role || '',
              status: testimonial.status || 'pending',
              image_url: testimonial.image_url || ''
            });
            if (testimonial.image_url) {
              setImagePreview(testimonial.image_url);
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchTestimonial();
  }, [id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `testimonial_${Date.now()}.${fileExt}`;
    const filePath = `testimonials/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('sd-trends-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('sd-trends-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let finalImageUrl = formData.image_url;
      
      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile);
      }

      const payload = {
        ...formData,
        image_url: finalImageUrl
      };

      const res = await fetch(`http://localhost:5000/api/testimonials/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        router.push('/admin/testimonials');
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to update testimonial');
      }
    } catch (err: any) {
      alert(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading data...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/admin/testimonials" className={styles.backBtn}>
            <ArrowLeft size={20} />
          </Link>
          <h2>Edit Testimonial</h2>
        </div>
        <div className={styles.actions}>
          <button 
            className={styles.saveBtn} 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            <Save size={18} />
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.formGrid}>
        <div className={styles.mainColumn}>
          {/* Basic Info */}
          <div className={styles.card}>
            <h3>Testimonial Details</h3>
            
            <div className={styles.formGroup}>
              <label>Customer Name *</label>
              <input 
                type="text" 
                required
                value={formData.author}
                onChange={e => setFormData({...formData, author: e.target.value})}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Customer Role (Optional)</label>
              <input 
                type="text" 
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value})}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Review Title (Optional)</label>
              <input 
                type="text" 
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Quote / Review Text *</label>
              <textarea 
                required
                value={formData.quote}
                onChange={e => setFormData({...formData, quote: e.target.value})}
                rows={4}
              />
            </div>
          </div>
        </div>

        <div className={styles.sideColumn}>
          {/* Status */}
          <div className={styles.card}>
            <h3>Status</h3>
            <div className={styles.formGroup}>
              <select 
                value={formData.status} 
                onChange={e => setFormData({...formData, status: e.target.value})}
              >
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Customer Image */}
          <div className={styles.card}>
            <h3>Customer Photo</h3>
            <div className={styles.imageUploadBox}>
              {imagePreview ? (
                <div className={styles.previewContainer}>
                  <img src={imagePreview} alt="Preview" className={styles.previewImage} style={{ borderRadius: '50%' }} />
                  <button 
                    type="button"
                    className={styles.removeImageBtn}
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                      setFormData({...formData, image_url: ''});
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className={styles.uploadLabel}>
                  <Upload size={24} />
                  <span>Upload Photo</span>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                    className={styles.hiddenInput}
                  />
                </label>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
