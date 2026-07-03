"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import styles from './contact.module.css';
import { API_BASE_URL, BASE_URL } from '@/config';


export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ success: boolean | null; message: string }>({
    success: null,
    message: ''
  });
  const [settings, setSettings] = useState<any>({});
  const [settingsLoading, setSettingsLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/settings`)
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        setSettingsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setSettingsLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setStatus({ success: false, message: 'Please fill out all fields.' });
      return;
    }

    setLoading(true);
    setStatus({ success: null, message: '' });

    try {
      const res = await fetch(`${API_BASE_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok) {
        setStatus({ success: true, message: data.message });
        setFormData({ name: '', email: '', message: '' });
      } else {
        setStatus({ success: false, message: data.error || 'Failed to send message.' });
      }
    } catch (err) {
      console.error(err);
      setStatus({ success: false, message: 'Server is currently offline. Please try again later.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />

      <main style={{ flex: '1' }}>
        {/* Breadcrumb Banner */}
        <section className={styles.banner}>
          <div className={styles.bannerOverlay}></div>
          <div className={styles.bannerContent}>
            <div className={styles.breadcrumb}>
              <Link href="/">Home</Link> / <span>Contact Us</span>
            </div>
            <h1 className={styles.bannerTitle}>{settings.contact_page_title || 'Contact Us'}</h1>
          </div>
        </section>

        {/* Main Map & Form Grid */}
        <section id="map" className={styles.mainSection}>
          <div className="container">
            <div className={styles.grid}>
              {/* Left Column: Google Maps Iframe */}
              <div className={styles.mapColumn}>
                <div className={styles.mapContainer}>
                  <iframe
                    src={settings.contact_page_map_url || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2483.056633633887!2d-0.12181742338167998!3d51.50318637181313!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487604b900d26973%3A0x4291f3172409ea92!2sLastminute.com%20London%20Eye!5e0!3m2!1sen!2suk!4v1719220000000!5m2!1sen!2suk"}
                    className={styles.mapIframe}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Location Map"
                  ></iframe>
                </div>
              </div>

              {/* Right Column: Contact Form */}
              <div className={styles.formColumn}>
                <h2 className={styles.formTitle}>{settings.contact_page_title || 'Get In Touch With Us'}</h2>
                <p className={styles.formSubtitle}>
                  {settings.contact_page_subtitle || 'If you wish to directly reach us, Please fill out the form below -'}
                </p>

                <form onSubmit={handleSubmit}>
                  <div className={styles.formGroup}>
                    <label htmlFor="name" className={styles.label}>Your name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className={styles.input}
                      value={formData.name}
                      onChange={handleChange}
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="email" className={styles.label}>Your email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className={styles.input}
                      value={formData.email}
                      onChange={handleChange}
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="message" className={styles.label}>Your message</label>
                    <textarea
                      id="message"
                      name="message"
                      className={styles.textarea}
                      value={formData.message}
                      onChange={handleChange}
                      disabled={loading}
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={loading}
                  >
                    {loading ? 'SENDING...' : 'SEND MESSAGE'}
                  </button>
                </form>

                {status.success === true && (
                  <p className={styles.successMsg}>{status.message}</p>
                )}
                {status.success === false && (
                  <p className={styles.errorMsg}>{status.message}</p>
                )}
              </div>
            </div>

            {/* Horizontal Contact Info Bar */}
            <div className={styles.infoBar}>
              <div className={styles.infoItem}>
                <span className={styles.iconWrapper}>
                  <MapPin size={22} strokeWidth={1.5} />
                </span>
                <div className={styles.infoTexts}>
                  <span className={styles.infoValue}>{settings.contact_page_address_1 || '60 29th San Francisco,'}</span>
                  <span className={styles.infoValue}>{settings.contact_page_address_2 || '507 - Union Trade Center'}</span>
                </div>
              </div>

              <div className={styles.infoItem}>
                <span className={styles.iconWrapper}>
                  <Phone size={22} strokeWidth={1.5} />
                </span>
                <div className={styles.infoTexts}>
                  <span className={styles.infoLabel}>Call us :</span>
                  <span className={styles.infoValue}>{settings.contact_page_phone || '(+01) 987-654-3210'}</span>
                </div>
              </div>

              <div className={styles.infoItem}>
                <span className={styles.iconWrapper}>
                  <Mail size={22} strokeWidth={1.5} />
                </span>
                <div className={styles.infoTexts}>
                  <span className={styles.infoLabel}>Mail us :</span>
                  <span className={styles.infoValue}>{settings.contact_page_email || 'demo@example.com'}</span>
                </div>
              </div>

              <div className={styles.infoItem}>
                <span className={styles.iconWrapper}>
                  <Clock size={22} strokeWidth={1.5} />
                </span>
                <div className={styles.infoTexts}>
                  <span className={styles.infoLabel}>Open time :</span>
                  <span className={styles.infoValue}>{settings.contact_page_hours || '10:00AM – 6:00PM'}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
