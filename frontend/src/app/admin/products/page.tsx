"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit2 } from 'lucide-react';
import styles from './AdminProducts.module.css';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Settings State
  const [settings, setSettings] = useState({
    latest_products_title: '',
    latest_products_subtitle: '',
    featured_products_title: '',
    featured_products_subtitle: ''
  });
  const [savingSettings, setSavingSettings] = useState(false);
  
  const fetchProductsAndSettings = async () => {
    try {
      const [prodRes, setRes] = await Promise.all([
        fetch('http://localhost:5000/api/products'),
        fetch('http://localhost:5000/api/settings')
      ]);
      
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData);
      }
      
      if (setRes.ok) {
        const setData = await setRes.json();
        setSettings({
          latest_products_title: setData.latest_products_title || '',
          latest_products_subtitle: setData.latest_products_subtitle || '',
          featured_products_title: setData.featured_products_title || '',
          featured_products_subtitle: setData.featured_products_subtitle || ''
        });
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsAndSettings();
  }, []);

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const res = await fetch('http://localhost:5000/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        alert("Settings saved successfully!");
      } else {
        alert("Failed to save settings.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error.");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleToggleLatest = async (product: any) => {
    const isCurrentlyLatest = product.is_latest;
    
    try {
      const res = await fetch(`http://localhost:5000/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_latest: !isCurrentlyLatest })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        alert(data.error || "Failed to update product.");
        return;
      }
      
      // Update local state to reflect change without refetching everything
      setProducts(products.map(p => p.id === product.id ? data : p));
      
    } catch (err) {
      alert("Network error.");
    }
  };

  const handleToggleFeatured = async (product: any) => {
    const isCurrentlyFeatured = product.isFeatured;
    
    try {
      const res = await fetch(`http://localhost:5000/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_featured: !isCurrentlyFeatured })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        alert(data.error || "Failed to update product.");
        return;
      }
      
      setProducts(products.map(p => p.id === product.id ? data : p));
      
    } catch (err) {
      alert("Network error.");
    }
  };

  const filteredProducts = products.filter(p =>  
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const latestCount = products.filter(p => p.is_latest).length;
  const featuredCount = products.filter(p => p.isFeatured).length;

  if (loading) return <div className={styles.loading}>Loading data...</div>;

  return (
    <div className={styles.container}>
      
      {/* Settings Panel */}
      <div className={styles.settingsPanel}>
        <div className={styles.settingsHeader}>
          <h3>Latest & Featured Products Settings</h3>
          <button onClick={handleSaveSettings} className={styles.saveSettingsBtn} disabled={savingSettings}>
            {savingSettings ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
        <div className={styles.settingsGrid}>
          <div className={styles.formGroup}>
            <label>Latest Section Title</label>
            <input 
              type="text" 
              value={settings.latest_products_title} 
              onChange={e => setSettings({...settings, latest_products_title: e.target.value})} 
            />
          </div>
          <div className={styles.formGroup}>
            <label>Latest Section Subtitle</label>
            <input 
              type="text" 
              value={settings.latest_products_subtitle} 
              onChange={e => setSettings({...settings, latest_products_subtitle: e.target.value})} 
            />
          </div>
          <div className={styles.formGroup}>
            <label>Featured Section Title</label>
            <input 
              type="text" 
              value={settings.featured_products_title} 
              onChange={e => setSettings({...settings, featured_products_title: e.target.value})} 
            />
          </div>
          <div className={styles.formGroup}>
            <label>Featured Section Subtitle</label>
            <input 
              type="text" 
              value={settings.featured_products_subtitle} 
              onChange={e => setSettings({...settings, featured_products_subtitle: e.target.value})} 
            />
          </div>
        </div>
      </div>

      <div className={styles.header}>
        <div>
          <h2>Products Catalog</h2>
          <p className={styles.description}>
            Manage your entire product inventory. You can mark products to appear in the "Latest Products" or "Featured Products" sections on the homepage.
            <br />
            <strong>Latest:</strong> {latestCount} / 8 &nbsp;&nbsp;|&nbsp;&nbsp; <strong>Featured:</strong> {featuredCount} / 4
          </p>
        </div>
        
        <div className={styles.actions}>
          <div className={styles.searchBar}>
            <Search size={18} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Link href="/admin/products/new" className={styles.addBtn}>
            <Plus size={18} />
            Add Product
          </Link>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Image</th>
              <th>Product Details</th>
              <th>Category</th>
              <th>Price</th>
              <th>Latest?</th>
              <th>Featured?</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map(p => (
                <tr key={p.id}>
                  <td>
                    {p.images && p.images.length > 0 ? (
                      <img src={p.images[0]} alt={p.name} className={styles.productThumbnail} />
                    ) : (
                      <div className={styles.noImageThumbnail}>No Img</div>
                    )}
                  </td>
                  <td>
                    <div className={styles.productDetails}>
                      <span className={styles.productName}>{p.name}</span>
                      <span className={styles.productId}>ID: {p.id}</span>
                    </div>
                  </td>
                  <td>
                    <span className={styles.categoryBadge}>{p.category}</span>
                  </td>
                  <td>₹{p.price.toFixed(2)}</td>
                  <td>
                    <label className={styles.switch}>
                      <input 
                        type="checkbox" 
                        checked={p.is_latest}
                        onChange={() => handleToggleLatest(p)}
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </td>
                  <td>
                    <label className={styles.switch}>
                      <input 
                        type="checkbox" 
                        checked={p.isFeatured}
                        onChange={() => handleToggleFeatured(p)}
                      />
                      <span className={`${styles.slider} ${styles.featuredSlider}`}></span>
                    </label>
                  </td>
                  <td>
                    <Link href={`/admin/products/${p.id}`} className={styles.editBtn}>
                      <Edit2 size={16} /> Edit
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className={styles.noResults}>
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
