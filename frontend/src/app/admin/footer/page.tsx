"use client";

import React, { useState, useEffect } from 'react';
import { Save, Plus, Edit2, Trash2, X } from 'lucide-react';
import styles from './FooterAdmin.module.css';
import { API_BASE_URL, BASE_URL } from '@/config';


export default function AdminFooterPage() {
  const [activeTab, setActiveTab] = useState<'settings' | 'links'>('settings');
  const [loading, setLoading] = useState(true);

  // Settings State
  const [settings, setSettings] = useState({
    footer_about_text: '',
    footer_address: '',
    footer_phone: '',
    footer_email: ''
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Links State
  const [links, setLinks] = useState<any[]>([]);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [editingLink, setEditingLink] = useState<any>(null);
  const [linkForm, setLinkForm] = useState({
    column_name: 'Quick Links',
    label: '',
    url: '',
    display_order: 0
  });

  const columns = ['Quick Links', 'Services', 'Your Account'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [settingsRes, linksRes] = await Promise.all([
        fetch(`${API_BASE_URL}/settings`, { cache: 'no-store' }),
        fetch(`${API_BASE_URL}/footer-links`, { cache: 'no-store' })
      ]);

      if (settingsRes.ok) {
        const data = await settingsRes.json();
        setSettings({
          footer_about_text: data.footer_about_text || '',
          footer_address: data.footer_address || '',
          footer_phone: data.footer_phone || '',
          footer_email: data.footer_email || ''
        });
      }

      if (linksRes.ok) {
        const data = await linksRes.json();
        setLinks(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- Settings Handlers ---
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch(`${API_BASE_URL}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) alert('Settings saved successfully!');
      else alert('Failed to save settings.');
    } catch (err) {
      alert('Error saving settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  // --- Links Handlers ---
  const handleOpenLinkModal = (link: any = null) => {
    if (link) {
      setEditingLink(link);
      setLinkForm({
        column_name: link.column_name,
        label: link.label,
        url: link.url,
        display_order: link.display_order
      });
    } else {
      setEditingLink(null);
      setLinkForm({ column_name: 'Quick Links', label: '', url: '', display_order: 0 });
    }
    setShowLinkModal(true);
  };

  const handleSaveLink = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingLink 
        ? `${API_BASE_URL}/footer-links/${editingLink.id}`
        : `${API_BASE_URL}/footer-links`;
      const method = editingLink ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(linkForm)
      });

      if (res.ok) {
        const data = await res.json();
        if (editingLink) {
          setLinks(links.map(l => l.id === editingLink.id ? data.link : l));
        } else {
          setLinks([...links, data.link]);
        }
        setShowLinkModal(false);
      }
    } catch (err) {
      alert('Error saving link');
    }
  };

  const handleDeleteLink = async (id: number) => {
    if (!confirm('Are you sure you want to delete this link?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/footer-links/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setLinks(links.filter(l => l.id !== id));
      }
    } catch (err) {
      alert('Error deleting link');
    }
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Footer Setup</h2>
        <p className={styles.description}>Manage global footer text, contact information, and navigation links.</p>
      </div>

      <div className={styles.tabs}>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'settings' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Contact & About Info
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'links' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('links')}
        >
          Footer Menus
        </button>
      </div>

      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className={styles.settingsForm}>
          <div className={styles.card}>
            <h3>About Store Text</h3>
            <div className={styles.formGroup}>
              <label>Description shown in the first column</label>
              <textarea 
                rows={4}
                value={settings.footer_about_text}
                onChange={e => setSettings({...settings, footer_about_text: e.target.value})}
              />
            </div>
          </div>

          <div className={styles.card}>
            <h3>Contact Information</h3>
            <div className={styles.formGroup}>
              <label>Address</label>
              <input 
                type="text" 
                value={settings.footer_address}
                onChange={e => setSettings({...settings, footer_address: e.target.value})}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Phone Number</label>
              <input 
                type="text" 
                value={settings.footer_phone}
                onChange={e => setSettings({...settings, footer_phone: e.target.value})}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Email Address</label>
              <input 
                type="text" 
                value={settings.footer_email}
                onChange={e => setSettings({...settings, footer_email: e.target.value})}
              />
            </div>
          </div>

          <button type="submit" className={styles.saveBtn} disabled={savingSettings}>
            <Save size={18} />
            {savingSettings ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      )}

      {activeTab === 'links' && (
        <div className={styles.linksContainer}>
          <div className={styles.linksHeader}>
            <h3>Footer Menus</h3>
            <button className={styles.addBtn} onClick={() => handleOpenLinkModal()}>
              <Plus size={18} /> Add Link
            </button>
          </div>

          <div className={styles.columnsGrid}>
            {columns.map(col => (
              <div key={col} className={styles.columnCard}>
                <h4>{col}</h4>
                <div className={styles.linkList}>
                  {links.filter(l => l.column_name === col).sort((a,b) => a.display_order - b.display_order).map(link => (
                    <div key={link.id} className={styles.linkItem}>
                      <div className={styles.linkInfo}>
                        <span className={styles.linkLabel}>{link.label}</span>
                        <span className={styles.linkUrl}>{link.url}</span>
                      </div>
                      <div className={styles.linkActions}>
                        <button onClick={() => handleOpenLinkModal(link)} className={styles.iconBtn}><Edit2 size={14} /></button>
                        <button onClick={() => handleDeleteLink(link.id)} className={styles.iconBtnDelete}><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                  {links.filter(l => l.column_name === col).length === 0 && (
                    <p className={styles.emptyText}>No links added yet.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal for Add/Edit Link */}
      {showLinkModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button className={styles.closeBtn} onClick={() => setShowLinkModal(false)}><X size={20} /></button>
            <h3>{editingLink ? 'Edit Link' : 'Add Footer Link'}</h3>
            
            <form onSubmit={handleSaveLink} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label>Column</label>
                <select 
                  value={linkForm.column_name} 
                  onChange={e => setLinkForm({...linkForm, column_name: e.target.value})}
                >
                  {columns.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Label text</label>
                <input 
                  type="text" required 
                  value={linkForm.label} 
                  onChange={e => setLinkForm({...linkForm, label: e.target.value})} 
                />
              </div>
              <div className={styles.formGroup}>
                <label>URL / Destination</label>
                <input 
                  type="text" required 
                  value={linkForm.url} 
                  onChange={e => setLinkForm({...linkForm, url: e.target.value})} 
                  placeholder="/category/rings or https://..."
                />
              </div>
              <div className={styles.formGroup}>
                <label>Display Order</label>
                <input 
                  type="number" 
                  value={linkForm.display_order} 
                  onChange={e => setLinkForm({...linkForm, display_order: parseInt(e.target.value)})} 
                />
              </div>
              <button type="submit" className={styles.saveBtn}>
                {editingLink ? 'Update Link' : 'Add Link'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
