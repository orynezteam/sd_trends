"use client";

import React, { useState, useEffect } from 'react';
import { Save, CreditCard, Info } from 'lucide-react';
import styles from './PaymentSetup.module.css';
import { API_BASE_URL, BASE_URL } from '@/config';


export default function PaymentSetupPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    upi_id: '',
    upi_merchant_name: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/settings`);
      if (res.ok) {
        const data = await res.json();
        setSettings({
          upi_id: data.upi_id || 'mythu2124@oksbi',
          upi_merchant_name: data.upi_merchant_name || 'SD Trends'
        });
      }
    } catch (err) {
      console.error("Error loading settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings.upi_id.trim() || !settings.upi_merchant_name.trim()) {
      alert('Please fill out all settings.');
      return;
    }
    
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        alert('Payment settings saved successfully!');
      } else {
        alert('Failed to save settings.');
      }
    } catch (err) {
      console.error("Error saving settings:", err);
      alert('Error saving settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading settings...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Payment Gateway Setup</h2>
        <p className={styles.description}>Configure details for direct, zero-commission UPI payments from your customers.</p>
      </div>

      <form onSubmit={handleSave} className={styles.form}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <CreditCard size={20} />
            <h3>UPI Payment Details</h3>
          </div>
          
          <div className={styles.cardBody}>
            <div className={styles.grid2}>
              <div className={styles.formGroup}>
                <label htmlFor="upi_id">Merchant UPI ID</label>
                <input 
                  type="text" 
                  id="upi_id"
                  placeholder="e.g. yourupi@oksbi"
                  value={settings.upi_id}
                  onChange={e => setSettings({...settings, upi_id: e.target.value})}
                  required
                />
                <span className={styles.helpText}>
                  Payments will be sent directly to the bank account linked with this UPI ID.
                </span>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="upi_merchant_name">Merchant Display Name</label>
                <input 
                  type="text" 
                  id="upi_merchant_name"
                  placeholder="e.g. SD Trends"
                  value={settings.upi_merchant_name}
                  onChange={e => setSettings({...settings, upi_merchant_name: e.target.value})}
                  required
                />
                <span className={styles.helpText}>
                  The name that customers will see in their UPI app (Google Pay, PhonePe, etc.) when paying.
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader} style={{ background: '#f8fafc' }}>
            <Info size={20} style={{ color: '#475569' }} />
            <h3 style={{ color: '#475569' }}>About UPI Deep Links</h3>
          </div>
          <div className={styles.cardBody}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', lineHeight: '1.6' }}>
              UPI (Unified Payments Interface) deep linking allows customers to pay directly from their preferred UPI app (Google Pay, PhonePe, Paytm, BHIM, etc.) without paying payment gateway commission. 
              On desktop, the site generates a dynamic QR code for customers to scan, and on mobile, it initiates a quick app redirect.
            </p>
          </div>
        </div>

        <button type="submit" className={styles.saveBtn} disabled={saving}>
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
