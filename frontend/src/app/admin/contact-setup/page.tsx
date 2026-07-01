"use client";

import React, { useState, useEffect } from 'react';
import { Save, Map, Clock, Phone, Mail, MapPin } from 'lucide-react';
import styles from './ContactSetup.module.css';

export default function ContactSetupPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    contact_page_title: '',
    contact_page_subtitle: '',
    contact_page_map_url: '',
    contact_page_address_1: '',
    contact_page_address_2: '',
    contact_page_phone: '',
    contact_page_email: '',
    contact_page_hours: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings({
          contact_page_title: data.contact_page_title || '',
          contact_page_subtitle: data.contact_page_subtitle || '',
          contact_page_map_url: data.contact_page_map_url || '',
          contact_page_address_1: data.contact_page_address_1 || '',
          contact_page_address_2: data.contact_page_address_2 || '',
          contact_page_phone: data.contact_page_phone || '',
          contact_page_email: data.contact_page_email || '',
          contact_page_hours: data.contact_page_hours || ''
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('http://localhost:5000/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        alert('Contact page settings saved successfully!');
      } else {
        alert('Failed to save settings.');
      }
    } catch (err) {
      alert('Error saving settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading settings...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Contact Page Setup</h2>
        <p className={styles.description}>Manage the text, map location, and contact information displayed on your public Contact Us page.</p>
      </div>

      <form onSubmit={handleSave} className={styles.form}>
        
        {/* Top Text Settings */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Map size={20} />
            <h3>Page Headings</h3>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.formGroup}>
              <label>Main Title</label>
              <input 
                type="text" 
                value={settings.contact_page_title}
                onChange={e => setSettings({...settings, contact_page_title: e.target.value})}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Subtitle / Description</label>
              <textarea 
                rows={2}
                value={settings.contact_page_subtitle}
                onChange={e => setSettings({...settings, contact_page_subtitle: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Map Location */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <MapPin size={20} />
            <h3>Google Maps Embed Link</h3>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.formGroup}>
              <label>Map iframe `src` URL</label>
              <input 
                type="text" 
                value={settings.contact_page_map_url}
                onChange={e => setSettings({...settings, contact_page_map_url: e.target.value})}
                placeholder="https://www.google.com/maps/embed?pb=..."
              />
              <p className={styles.helpText}>Go to Google Maps, search your location, click Share &gt; Embed a map, and copy ONLY the `src="..."` URL from the iframe code.</p>
            </div>
          </div>
        </div>

        {/* Contact Information Bar */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Phone size={20} />
            <h3>Contact Details Box</h3>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.grid2}>
              <div className={styles.formGroup}>
                <label>Address Line 1</label>
                <input 
                  type="text" 
                  value={settings.contact_page_address_1}
                  onChange={e => setSettings({...settings, contact_page_address_1: e.target.value})}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Address Line 2</label>
                <input 
                  type="text" 
                  value={settings.contact_page_address_2}
                  onChange={e => setSettings({...settings, contact_page_address_2: e.target.value})}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Phone Number</label>
                <input 
                  type="text" 
                  value={settings.contact_page_phone}
                  onChange={e => setSettings({...settings, contact_page_phone: e.target.value})}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Email Address</label>
                <input 
                  type="email" 
                  value={settings.contact_page_email}
                  onChange={e => setSettings({...settings, contact_page_email: e.target.value})}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Open Time (Hours)</label>
                <input 
                  type="text" 
                  value={settings.contact_page_hours}
                  onChange={e => setSettings({...settings, contact_page_hours: e.target.value})}
                />
              </div>
            </div>
          </div>
        </div>

        <button type="submit" className={styles.saveBtn} disabled={saving}>
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>

      </form>
    </div>
  );
}
