"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../utils/supabase';
import { Save, ArrowLeft, Upload, X } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { API_BASE_URL, BASE_URL } from '@/config';


const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';
import styles from './NewProduct.module.css';

export default function NewProductPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [specifications, setSpecifications] = useState<{key: string, value: string}[]>([]);
  const [descriptionImage, setDescriptionImage] = useState<File | null>(null);
  const [descriptionImagePreview, setDescriptionImagePreview] = useState<string | null>(null);
  
  const [dbCategories, setDbCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/content/categories`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDbCategories(data);
          if (data.length > 0) {
            const firstCat = data[0];
            const firstSub = firstCat.subcategories && firstCat.subcategories.length > 0 ? firstCat.subcategories[0].name : '';
            setFormData(prev => ({ 
              ...prev, 
              category: firstCat.name.toLowerCase(),
              subcategory: firstSub
            }));
          }
        }
      })
      .catch(err => console.error("Error fetching categories:", err));
  }, []);

  const [formData, setFormData] = useState({
    id: '', // slug
    name: '',
    category: 'rings',
    subcategory: '',
    price: '',
    originalPrice: '',
    description: '',
    isNew: true,
    isBestSeller: false,
    isFeatured: false,
    is_latest: false,
    rating: '0',
    reviewCount: '0',
    stock: '10',
    viewerCount: '18',
    soldCount: '15',
    about_text: '',
    shipping_text: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => {
        const updated = { ...prev, [name]: value };
        if (name === 'category') {
          const catObj = dbCategories.find(cat => cat.name.toLowerCase() === value.toLowerCase());
          updated.subcategory = catObj && catObj.subcategories.length > 0 ? catObj.subcategories[0].name : '';
        }
        return updated;
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImages(prev => [...prev, ...newFiles]);
      
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddSpec = () => {
    setSpecifications(prev => [...prev, { key: '', value: '' }]);
  };

  const handleSpecChange = (index: number, field: 'key' | 'value', val: string) => {
    const newSpecs = [...specifications];
    newSpecs[index][field] = val;
    setSpecifications(newSpecs);
  };

  const handleRemoveSpec = (index: number) => {
    setSpecifications(prev => prev.filter((_, i) => i !== index));
  };

  const handleDescriptionImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDescriptionImage(file);
      setDescriptionImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImagesToSupabase = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    for (const file of images) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { data, error } = await supabase.storage
          .from('sd_assets')
          .upload(filePath, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('sd_assets')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      } catch (err) {
        console.error('Upload Error:', err);
        alert(`Failed to upload ${file.name}`);
      }
    }
    
    return uploadedUrls;
  };

  const uploadDescriptionImageToSupabase = async (): Promise<string | null> => {
    if (!descriptionImage) return null;
    try {
      const fileExt = descriptionImage.name.split('.').pop();
      const fileName = `desc_${Math.random()}.${fileExt}`;
      const filePath = `products/${fileName}`;
      const { error } = await supabase.storage.from('sd_assets').upload(filePath, descriptionImage);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('sd_assets').getPublicUrl(filePath);
      return publicUrl;
    } catch (err) {
      console.error('Upload Error:', err);
      alert(`Failed to upload description image`);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id || !formData.name || !formData.price) {
      alert("Please fill in ID, Name, and Price");
      return;
    }

    setSaving(true);
    
    try {
      // 1. Upload images
      const imageUrls = await uploadImagesToSupabase();
      const descImageUrl = await uploadDescriptionImageToSupabase();

      const detailsObj: Record<string, string> = {};
      specifications.forEach(spec => {
        if (spec.key.trim() && spec.value.trim()) {
          detailsObj[spec.key.trim()] = spec.value.trim();
        }
      });
      if (descImageUrl) {
        detailsObj['description_image_url'] = descImageUrl;
      }

      // 2. Prepare payload
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        rating: parseFloat(formData.rating) || 0,
        review_count: parseInt(formData.reviewCount) || 0,
        stock: parseInt(formData.stock) || 0,
        viewer_count: parseInt(formData.viewerCount) || 0,
        sold_count: parseInt(formData.soldCount) || 0,
        about_text: formData.about_text,
        shipping_text: formData.shipping_text,
        details_json: JSON.stringify(detailsObj),
        images: imageUrls
      };

      // 3. Save to database
      const res = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        alert("Product created successfully!");
        router.push('/admin/products');
      } else {
        alert(data.error || "Failed to create product.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error creating product.");
    } finally {
      setSaving(false);
    }
  };

  const selectedCatObj = dbCategories.find(cat => cat.name.toLowerCase() === formData.category.toLowerCase());
  const currentSubcategories = selectedCatObj ? selectedCatObj.subcategories : [];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/admin/products" className={styles.backBtn}>
            <ArrowLeft size={18} />
          </Link>
          <h2>Add New Product</h2>
        </div>
        <button onClick={handleSubmit} className={styles.saveBtn} disabled={saving}>
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Product'}
        </button>
      </div>

      <form className={styles.formContainer} onSubmit={handleSubmit}>
        <div className={styles.mainCol}>
          {/* Basic Info */}
          <div className={styles.section}>
            <h3>Basic Information</h3>
            <div className={styles.formGroup}>
              <label>Product Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
            </div>
            
            <div className={styles.row}>
              <div className={styles.formGroup}>
                <label>Product ID (Slug) *</label>
                <input type="text" name="id" value={formData.id} onChange={handleInputChange} placeholder="e.g. ring-solitaire-gold" required />
              </div>
              <div className={styles.formGroup}>
                <label>Category *</label>
                <select name="category" value={formData.category} onChange={handleInputChange} required>
                  {dbCategories.map(cat => (
                    <option key={cat.id} value={cat.name.toLowerCase()}>
                      {cat.name}
                    </option>
                  ))}
                  {dbCategories.length === 0 && (
                    <>
                      <option value="rings">Rings</option>
                      <option value="necklaces">Necklaces</option>
                      <option value="earrings">Earrings</option>
                      <option value="bracelets">Bracelets</option>
                    </>
                  )}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Subcategory *</label>
                <select name="subcategory" value={formData.subcategory} onChange={handleInputChange} required>
                  <option value="">-- Select Subcategory --</option>
                  {currentSubcategories.map((sub: any) => (
                    <option key={sub.id} value={sub.name}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Description (Short)</label>
              <textarea name="description" rows={4} value={formData.description} onChange={handleInputChange} />
            </div>
            
            <div className={styles.formGroup}>
              <label>About This Item (Rich Text)</label>
              <ReactQuill 
                value={formData.about_text} 
                onChange={(val) => setFormData(prev => ({ ...prev, about_text: val }))}
                style={{ backgroundColor: 'white', color: 'black' }}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Shipping & Returns (Rich Text)</label>
              <ReactQuill 
                value={formData.shipping_text} 
                onChange={(val) => setFormData(prev => ({ ...prev, shipping_text: val }))}
                style={{ backgroundColor: 'white', color: 'black' }}
              />
            </div>
          </div>

          {/* Specifications */}
          <div className={styles.section}>
            <h3>Specifications (Details Tab)</h3>
            <div className={styles.formGroup}>
              <label>Specifications (Key - Value)</label>
              {specifications.map((spec, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <input type="text" placeholder="e.g. Metal" value={spec.key} onChange={(e) => handleSpecChange(idx, 'key', e.target.value)} style={{ flex: 1 }} />
                  <input type="text" placeholder="e.g. 14k White Gold" value={spec.value} onChange={(e) => handleSpecChange(idx, 'value', e.target.value)} style={{ flex: 2 }} />
                  <button type="button" onClick={() => handleRemoveSpec(idx)} style={{ background: '#f44', color: 'white', border: 'none', padding: '0 10px', borderRadius: '4px', cursor: 'pointer' }}><X size={16} /></button>
                </div>
              ))}
              <button type="button" onClick={handleAddSpec} style={{ padding: '8px 12px', background: '#eee', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', display: 'inline-block', marginTop: '5px' }}>+ Add Specification</button>
            </div>
            
            <div className={styles.formGroup} style={{ marginTop: '20px' }}>
              <label>Description Image (Appears below About text)</label>
              {descriptionImagePreview && (
                <div style={{ position: 'relative', width: '200px', marginBottom: '10px' }}>
                  <img src={descriptionImagePreview} alt="Description Preview" style={{ width: '100%', borderRadius: '4px' }} />
                  <button type="button" onClick={() => { setDescriptionImage(null); setDescriptionImagePreview(null); }} style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(255,0,0,0.7)', color: 'white', border: 'none', borderRadius: '50%', padding: '2px', cursor: 'pointer' }}><X size={14} /></button>
                </div>
              )}
              {!descriptionImagePreview && (
                <input type="file" accept="image/*" onChange={handleDescriptionImageChange} />
              )}
            </div>
          </div>

          {/* Images */}
          <div className={styles.section}>
            <h3>Product Images</h3>
            <div className={styles.imageGrid}>
              {previews.map((src, idx) => (
                <div key={idx} className={styles.imagePreviewWrapper}>
                  <img src={src} alt="Preview" className={styles.imagePreview} />
                  <button type="button" className={styles.removeImageBtn} onClick={() => removeImage(idx)}>
                    <X size={14} />
                  </button>
                </div>
              ))}
              
              <div className={styles.uploadBox}>
                <input type="file" id="image-upload" multiple accept="image/*" onChange={handleImageChange} className={styles.fileInput} />
                <label htmlFor="image-upload" className={styles.uploadLabel}>
                  <Upload size={24} />
                  <span>Upload Images</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.sideCol}>
          {/* Pricing */}
          <div className={styles.section}>
            <h3>Pricing</h3>
            <div className={styles.formGroup}>
              <label>Price (Current) *</label>
              <input type="number" step="0.01" name="price" value={formData.price} onChange={handleInputChange} required />
            </div>
            <div className={styles.formGroup}>
              <label>Original Price (Compare at)</label>
              <input type="number" step="0.01" name="originalPrice" value={formData.originalPrice} onChange={handleInputChange} />
            </div>
          </div>

          {/* Product Page Settings */}
          <div className={styles.section}>
            <h3>Product Page Details</h3>
            <div className={styles.formGroup}>
              <label>Stock Quantity</label>
              <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} required />
            </div>
            <div className={styles.formGroup}>
              <label>Rating (0 to 5)</label>
              <input type="number" step="0.1" min="0" max="5" name="rating" value={formData.rating} onChange={handleInputChange} />
            </div>
            <div className={styles.formGroup}>
              <label>Review Count</label>
              <input type="number" name="reviewCount" value={formData.reviewCount} onChange={handleInputChange} />
            </div>
          </div>
          
          {/* Social Proof Analytics */}
          <div className={styles.section}>
            <h3>Social Proof Data</h3>
            <div className={styles.formGroup}>
              <label>Current Viewers</label>
              <input type="number" name="viewerCount" value={formData.viewerCount} onChange={handleInputChange} />
            </div>
            <div className={styles.formGroup}>
              <label>Products Sold (Last 1 Hr)</label>
              <input type="number" name="soldCount" value={formData.soldCount} onChange={handleInputChange} />
            </div>
          </div>

          {/* Visibility & Badges */}
          <div className={styles.section}>
            <h3>Badges & Visibility</h3>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" name="isNew" checked={formData.isNew} onChange={handleInputChange} />
              <span>Mark as "New"</span>
            </label>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" name="isBestSeller" checked={formData.isBestSeller} onChange={handleInputChange} />
              <span>Mark as "Best Seller"</span>
            </label>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleInputChange} />
              <span>Mark as "Featured"</span>
            </label>
            <hr className={styles.divider} />
            <label className={styles.checkboxLabel}>
              <input type="checkbox" name="is_latest" checked={formData.is_latest} onChange={handleInputChange} />
              <span><strong>Show in "Latest Products" (Max 8)</strong></span>
            </label>
          </div>
        </div>
      </form>
    </div>
  );
}
