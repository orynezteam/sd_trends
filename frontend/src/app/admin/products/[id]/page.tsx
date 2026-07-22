"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../../../utils/supabase';
import { Save, ArrowLeft, Upload, X } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { API_BASE_URL, BASE_URL } from '@/config';


const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';
import styles from '../new/NewProduct.module.css';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [specifications, setSpecifications] = useState<{key: string, value: string}[]>([]);
  const [descriptionImage, setDescriptionImage] = useState<File | null>(null);
  const [descriptionImagePreview, setDescriptionImagePreview] = useState<string | null>(null);
  const [existingDescriptionImage, setExistingDescriptionImage] = useState<string | null>(null);
  
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [variantForm, setVariantForm] = useState({
    id: '',
    name: '',
    color: '',
    price: ''
  });
  const [variantImages, setVariantImages] = useState<File[]>([]);
  const [variantPreviews, setVariantPreviews] = useState<string[]>([]);
  const [addingVariant, setAddingVariant] = useState(false);
  const [variantPrices, setVariantPrices] = useState<Record<string, string>>({});

  const handleVariantPriceChange = (variantId: string, value: string) => {
    setVariantPrices(prev => ({ ...prev, [variantId]: value }));
  };

  const handleSaveVariantPrice = async (variantId: string) => {
    const pVal = variantPrices[variantId];
    if (pVal === undefined) return;
    const newPrice = parseFloat(pVal);
    if (isNaN(newPrice)) {
      alert("Please enter a valid price.");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/products/${variantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: newPrice })
      });
      if (res.ok) {
        alert("Variant price updated successfully!");
        fetchAllProducts();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update variant price.");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating variant price.");
    }
  };

  const fetchAllProducts = () => {
    fetch(`${API_BASE_URL}/products`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAllProducts(data);
      })
      .catch(err => console.error("Error fetching all products:", err));
  };

  useEffect(() => {
    fetchAllProducts();
  }, []);

  useEffect(() => {
    fetch(`${API_BASE_URL}/content/categories`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setDbCategories(data);
      })
      .catch(err => console.error("Error fetching categories:", err));
  }, []);

  const [formData, setFormData] = useState({
    id: '', // slug (readonly)
    name: '',
    category: 'rings',
    subcategory: '',
    price: '',
    originalPrice: '',
    description: '',
    color: '',
    color_group: '',
    isNew: false,
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

  useEffect(() => {
    const productId = Array.isArray(params?.id) ? params.id[0] : params?.id;
    if (!productId) return;
    
    const decodedId = decodeURIComponent(productId);

    fetch(`${API_BASE_URL}/products`)
      .then(res => res.json())
      .then(data => {
        const product = data.find((p: any) => p.id === decodedId);
        if (product) {
          setFormData({
            id: product.id,
            name: product.name || '',
            category: product.category || 'rings',
            subcategory: product.subcategory || '',
            price: product.price?.toString() || '',
            originalPrice: product.originalPrice?.toString() || '',
            description: product.description || '',
            isNew: product.isNew || false,
            isBestSeller: product.isBestSeller || false,
            isFeatured: product.isFeatured || false,
            is_latest: product.is_latest || false,
            rating: product.rating?.toString() || '0',
            reviewCount: product.reviewCount?.toString() || '0',
            stock: product.stock?.toString() || '10',
            viewerCount: product.viewerCount?.toString() || '18',
            soldCount: product.soldCount?.toString() || '15',
            about_text: product.aboutText || '',
            shipping_text: product.shippingText || '',
            color: product.color || '',
            color_group: product.color_group || ''
          });
          setExistingImages(product.images || []);
          if (product.details) {
            const specArr: {key: string, value: string}[] = [];
            for (const [k, v] of Object.entries(product.details)) {
              if (k === 'description_image_url') {
                setExistingDescriptionImage(v as string);
              } else {
                specArr.push({ key: k, value: v as string });
              }
            }
            setSpecifications(specArr);
          }
        } else {
          alert("Product not found");
          router.push('/admin/products');
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [params.id, router]);

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

  const removeNewImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
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

  const handleVariantInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVariantForm(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'name') {
        const oldSlug = prev.name ? prev.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : '';
        if (!prev.id || prev.id === oldSlug) {
          updated.id = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        }
      }
      return updated;
    });
  };

  const handleVariantImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setVariantImages(prev => [...prev, ...newFiles]);
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setVariantPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeVariantImage = (index: number) => {
    setVariantImages(prev => prev.filter((_, i) => i !== index));
    setVariantPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.color_group) {
      alert("Please save this product with a 'Color Group ID' first before adding variants!");
      return;
    }
    if (!variantForm.id || !variantForm.name || !variantForm.color || !variantForm.price) {
      alert("Please fill in Slug, Name, Color, and Price for the variant!");
      return;
    }

    setAddingVariant(true);
    try {
      // 1. Upload variant images to Supabase
      const uploadedUrls: string[] = [];
      for (const file of variantImages) {
        try {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `products/${fileName}`;
          const { error } = await supabase.storage.from('sd_assets').upload(filePath, file);
          if (error) throw error;
          const { data: { publicUrl } } = supabase.storage.from('sd_assets').getPublicUrl(filePath);
          uploadedUrls.push(publicUrl);
        } catch (err) {
          console.error("Upload Error:", err);
        }
      }

      // 2. Prepare variant product payload (inherits fields from current product)
      const payload = {
        id: variantForm.id,
        name: variantForm.name,
        color: variantForm.color,
        color_group: formData.color_group,
        price: parseFloat(variantForm.price),
        category: formData.category,
        subcategory: formData.subcategory,
        description: formData.description,
        about_text: formData.about_text,
        shipping_text: formData.shipping_text,
        details_json: formData.details_json || '{}',
        images: uploadedUrls,
        stock: 10,
        isNew: true,
        isBestSeller: false,
        isFeatured: false,
        is_latest: false
      };

      // 3. POST request to create product
      const res = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        alert("Color variant product created and linked successfully!");
        setVariantForm({ id: '', name: '', color: '', price: '' });
        setVariantImages([]);
        setVariantPreviews([]);
        fetchAllProducts();
      } else {
        alert(data.error || "Failed to create variant product.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error creating variant product.");
    } finally {
      setAddingVariant(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      alert("Please fill in Name and Price");
      return;
    }

    setSaving(true);
    
    try {
      // 1. Upload new images
      const newImageUrls = await uploadImagesToSupabase();
      const newDescImageUrl = await uploadDescriptionImageToSupabase();
      
      const finalDescImageUrl = newDescImageUrl || existingDescriptionImage;

      const detailsObj: Record<string, string> = {};
      specifications.forEach(spec => {
        if (spec.key.trim() && spec.value.trim()) {
          detailsObj[spec.key.trim()] = spec.value.trim();
        }
      });
      if (finalDescImageUrl) {
        detailsObj['description_image_url'] = finalDescImageUrl;
      }
      
      // Combine existing images (that weren't deleted) + new uploaded images
      const finalImages = [...existingImages, ...newImageUrls];

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
        images: finalImages
      };
      
      // We will send a PUT request to /api/products/<id>
      // Wait, let's update app.py to handle updating all fields and images in PUT.
      const res = await fetch(`${API_BASE_URL}/products/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        alert("Product updated successfully!");
        router.push('/admin/products');
      } else {
        alert(data.error || "Failed to update product.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error updating product.");
    } finally {
      setSaving(false);
    }
  };

  const selectedCatObj = dbCategories.find(cat => cat.name.toLowerCase() === formData.category.toLowerCase());
  const currentSubcategories = selectedCatObj ? selectedCatObj.subcategories : [];

  const colorVariants = allProducts.filter((p: any) => 
    p.color_group && 
    formData.color_group && 
    p.color_group.toLowerCase() === formData.color_group.toLowerCase() && 
    p.id !== formData.id
  );

  if (loading) return <div>Loading...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/admin/products" className={styles.backBtn}>
            <ArrowLeft size={18} />
          </Link>
          <h2>Edit Product</h2>
        </div>
        <button onClick={handleSubmit} className={styles.saveBtn} disabled={saving}>
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Changes'}
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
                <label>Product ID (Slug)</label>
                <input type="text" name="id" value={formData.id} disabled />
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
                <label>Subcategory {currentSubcategories.length > 0 ? '*' : '(Optional)'}</label>
                <select 
                  name="subcategory" 
                  value={formData.subcategory} 
                  onChange={handleInputChange} 
                  required={currentSubcategories.length > 0}
                >
                  <option value="">-- Select Subcategory --</option>
                  {currentSubcategories.map((sub: any) => (
                    <option key={sub.id} value={sub.name}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.formGroup}>
                <label>Color (e.g. Gold, Silver, Rose Gold)</label>
                <input type="text" name="color" value={formData.color} onChange={handleInputChange} placeholder="e.g. Rose Gold" />
              </div>
              <div className={styles.formGroup}>
                <label>Color Group ID (to link other color options)</label>
                <input type="text" name="color_group" value={formData.color_group} onChange={handleInputChange} placeholder="e.g. signature-choker-set" />
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
              
              {existingDescriptionImage && !descriptionImagePreview && (
                <div style={{ position: 'relative', width: '200px', marginBottom: '10px' }}>
                  <img src={existingDescriptionImage} alt="Existing Description" style={{ width: '100%', borderRadius: '4px' }} />
                  <button type="button" onClick={() => setExistingDescriptionImage(null)} style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(255,0,0,0.7)', color: 'white', border: 'none', borderRadius: '50%', padding: '2px', cursor: 'pointer' }}><X size={14} /></button>
                </div>
              )}
              
              {descriptionImagePreview && (
                <div style={{ position: 'relative', width: '200px', marginBottom: '10px' }}>
                  <img src={descriptionImagePreview} alt="Description Preview" style={{ width: '100%', borderRadius: '4px' }} />
                  <button type="button" onClick={() => { setDescriptionImage(null); setDescriptionImagePreview(null); }} style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(255,0,0,0.7)', color: 'white', border: 'none', borderRadius: '50%', padding: '2px', cursor: 'pointer' }}><X size={14} /></button>
                </div>
              )}

              {!descriptionImagePreview && !existingDescriptionImage && (
                <input type="file" accept="image/*" onChange={handleDescriptionImageChange} />
              )}
            </div>
          </div>

          {/* Images */}
          <div className={styles.section}>
            <h3>Product Images</h3>
            <div className={styles.imageGrid}>
              {existingImages.map((src, idx) => (
                <div key={`existing-${idx}`} className={styles.imagePreviewWrapper}>
                  <img src={src} alt="Existing" className={styles.imagePreview} />
                  <button type="button" className={styles.removeImageBtn} onClick={() => removeExistingImage(idx)}>
                    <X size={14} />
                  </button>
                </div>
              ))}

              {previews.map((src, idx) => (
                <div key={`new-${idx}`} className={styles.imagePreviewWrapper}>
                  <img src={src} alt="Preview" className={styles.imagePreview} />
                  <button type="button" className={styles.removeImageBtn} onClick={() => removeNewImage(idx)}>
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

          {/* Linked Color Variants & Quick Add */}
          <div className={styles.section} style={{ marginTop: '20px' }}>
            <h3>Color Variants (Linked Products)</h3>
            
            {/* List of current variants */}
            {formData.color_group ? (
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                  Products linked under group: <strong>{formData.color_group}</strong>
                </p>
                {colorVariants.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '15px' }}>
                    {/* Display this current product */}
                    <div style={{ border: '2px solid var(--accent-color, #1a73e8)', borderRadius: '6px', padding: '10px', position: 'relative', backgroundColor: 'rgba(26,115,232,0.05)' }}>
                      <span style={{ position: 'absolute', top: '5px', right: '5px', fontSize: '10px', background: 'var(--accent-color, #1a73e8)', color: 'white', padding: '2px 6px', borderRadius: '10px' }}>Current</span>
                      {existingImages[0] && (
                        <img src={existingImages[0]} alt={formData.name} style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '4px', marginBottom: '8px' }} />
                      )}
                      <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{formData.name}</div>
                      <div style={{ fontSize: '11px', color: '#555' }}>Color: {formData.color || 'Not specified'}</div>
                      <div style={{ fontSize: '12px', color: '#000', fontWeight: 'bold' }}>₹{formData.price}</div>
                    </div>
                    {/* Display other variants */}
                    {colorVariants.map((v: any) => (
                      <div key={v.id} style={{ border: '1px solid #ddd', borderRadius: '6px', padding: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          {v.images && v.images[0] && (
                            <img src={v.images[0]} alt={v.name} style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '4px', marginBottom: '8px' }} />
                          )}
                          <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{v.name}</div>
                          <div style={{ fontSize: '11px', color: '#555' }}>Color: {v.color || 'Not specified'}</div>
                          <div style={{ fontSize: '12px', color: '#000', fontWeight: 'bold', marginBottom: '6px' }}>₹{v.price}</div>
                          <div style={{ marginTop: '8px', borderTop: '1px dashed #eee', paddingTop: '8px' }}>
                            <label style={{ fontSize: '10px', color: '#666', display: 'block', marginBottom: '4px' }}>Quick Price (₹):</label>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <input 
                                type="number" 
                                value={variantPrices[v.id] !== undefined ? variantPrices[v.id] : (v.price?.toString() || '')} 
                                onChange={(e) => handleVariantPriceChange(v.id, e.target.value)} 
                                style={{ width: '70px', fontSize: '11px', padding: '3px 5px', border: '1px solid #ccc', borderRadius: '4px' }} 
                              />
                              <button 
                                type="button"
                                onClick={() => handleSaveVariantPrice(v.id)}
                                style={{ padding: '3px 6px', fontSize: '10px', background: '#000', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        </div>
                        <Link href={`/admin/products/${v.id}`} style={{ display: 'block', textAlign: 'center', marginTop: '10px', fontSize: '11px', color: '#1a73e8', textDecoration: 'underline' }}>
                          Edit Variant Details
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '13px', color: '#888' }}>No other variants linked under this group yet.</p>
                )}
              </div>
            ) : (
              <p style={{ fontSize: '13px', color: '#888', marginBottom: '20px' }}>
                Set a <strong>Color Group ID</strong> above and save to enable variant linking.
              </p>
            )}

            {/* Quick add sub-form */}
            {formData.color_group && (
              <div style={{ borderTop: '1px solid #eee', paddingTop: '20px', marginTop: '10px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '15px' }}>Quick Add Another Color Variant</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <div className={styles.formGroup}>
                    <label style={{ fontSize: '12px' }}>Variant Name *</label>
                    <input type="text" name="name" value={variantForm.name} onChange={handleVariantInputChange} placeholder="e.g. Necklace - Silver" />
                  </div>
                  <div className={styles.formGroup}>
                    <label style={{ fontSize: '12px' }}>Variant Slug (Product ID) *</label>
                    <input type="text" name="id" value={variantForm.id} onChange={handleVariantInputChange} placeholder="e.g. necklace-silver" />
                  </div>
                  <div className={styles.formGroup}>
                    <label style={{ fontSize: '12px' }}>Variant Color *</label>
                    <input type="text" name="color" value={variantForm.color} onChange={handleVariantInputChange} placeholder="e.g. Silver" />
                  </div>
                  <div className={styles.formGroup}>
                    <label style={{ fontSize: '12px' }}>Variant Price (₹) *</label>
                    <input type="number" step="0.01" name="price" value={variantForm.price} onChange={handleVariantInputChange} placeholder="e.g. 300" />
                  </div>
                </div>

                {/* Variant Images Upload */}
                <div className={styles.formGroup} style={{ marginBottom: '15px' }}>
                  <label style={{ fontSize: '12px' }}>Variant Product Images *</label>
                  <div className={styles.imageGrid} style={{ marginTop: '8px' }}>
                    {variantPreviews.map((src, idx) => (
                      <div key={`variant-new-${idx}`} className={styles.imagePreviewWrapper}>
                        <img src={src} alt="Preview" className={styles.imagePreview} />
                        <button type="button" className={styles.removeImageBtn} onClick={() => removeVariantImage(idx)}>
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    <div className={styles.uploadBox}>
                      <input type="file" id="variant-image-upload" multiple accept="image/*" onChange={handleVariantImageChange} className={styles.fileInput} />
                      <label htmlFor="variant-image-upload" className={styles.uploadLabel}>
                        <Upload size={20} />
                        <span style={{ fontSize: '11px' }}>Upload Images</span>
                      </label>
                    </div>
                  </div>
                </div>

                <button 
                  type="button" 
                  onClick={handleAddVariant} 
                  disabled={addingVariant}
                  style={{
                    backgroundColor: 'var(--text-primary, #000)',
                    color: 'var(--bg-primary, #fff)',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Upload size={14} />
                  {addingVariant ? 'Creating Variant...' : 'Upload & Create Variant Product'}
                </button>
              </div>
            )}
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
