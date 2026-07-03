'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<{
    success: boolean | null;
    message: string;
  }>({ success: null, message: '' });
  const [loading, setLoading] = useState(false);

  const [settings, setSettings] = useState({
    footer_about_text: 'Loading...',
    footer_address: 'Loading...',
    footer_phone: 'Loading...',
    footer_email: 'Loading...',
  });

  const [links, setLinks] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [setRes, linkRes] = await Promise.all([
          fetch('https://sd-trends.onrender.com/api/settings', { cache: 'no-store' }),
          fetch('https://sd-trends.onrender.com/api/footer-links', { cache: 'no-store' }),
        ]);
        if (setRes.ok) {
          const s = await setRes.json();
          setSettings({
            footer_about_text: s.footer_about_text || '',
            footer_address: s.footer_address || '',
            footer_phone: s.footer_phone || '',
            footer_email: s.footer_email || '',
          });
        }
        if (linkRes.ok) {
          setLinks(await linkRes.json());
        }
      } catch (err) {
        console.error('Failed to fetch footer data', err);
      }
    }
    fetchData();
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setStatus({
        success: false,
        message: 'Please enter a valid email address.',
      });
      return;
    }

    setLoading(true);
    setStatus({ success: null, message: '' });

    try {
      const res = await fetch('https://sd-trends.onrender.com/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus({ success: true, message: data.message });
        setEmail('');
      } else {
        setStatus({
          success: false,
          message: data.error || 'Subscription failed.',
        });
      }
    } catch (err) {
      setStatus({
        success: false,
        message: 'Server is currently offline. Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  };

  const quickLinks = links.filter((l) => l.column_name === 'Quick Links');
  const servicesLinks = links.filter((l) => l.column_name === 'Services');
  const accountLinks = links.filter((l) => l.column_name === 'Your Account');

  return (
    <footer id="newsletter" className={styles.footer}>
      {/* Upper Newsletter Subscription */}
      <div className={styles.newsletterSection}>
        <div className={styles.newsletterContainer}>
          <div className={styles.newsletterLeft}>
            <h2 className={styles.newsTitle}>Subscribe To Our Newsletter</h2>
            <p className={styles.newsSubtitle}>
              Subscribe to our latest newsletter to get news about special
              discounts.
            </p>
            <form className={styles.form} onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="Email"
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
              <button
                type="submit"
                className={styles.subBtn}
                disabled={loading}>
                {loading ? 'SUBSCRIBING...' : 'SUBSCRIBE'}
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
      </div>

      {/* Lower Footer Content */}
      <div className="container">
        <div className={styles.lowerFooterContent}>
          {/* Middle Columns */}
          <div className={styles.columns}>
            {/* Column 1: About Our Store */}
            <div className={styles.col}>
              <h3 className={styles.colTitle}>About Our Store</h3>
              <p className={styles.aboutText}>{settings.footer_about_text}</p>
            </div>

            {/* Column 2: Quick Links */}
            <div className={styles.col}>
              <h3 className={styles.colTitle}>Quick Links</h3>
              <ul className={styles.linksList}>
                {quickLinks.map((link) => (
                  <li key={link.id}>
                    <Link href={link.url}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Services */}
            <div className={styles.col}>
              <h3 className={styles.colTitle}>Services</h3>
              <ul className={styles.linksList}>
                {servicesLinks.map((link) => (
                  <li key={link.id}>
                    <Link href={link.url}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Your Account */}
            <div className={styles.col}>
              <h3 className={styles.colTitle}>Your Account</h3>
              <ul className={styles.linksList}>
                {accountLinks.map((link) => (
                  <li key={link.id}>
                    <Link href={link.url}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 5: Contact Info */}
            <div className={styles.col}>
              <h3 className={styles.colTitle}>Contact Us</h3>
              <ul className={styles.contactDetailsList}>
                <li className={styles.contactItem}>
                  <MapPin className={styles.contactIcon} />
                  <span>{settings.footer_address}</span>
                </li>
                {settings.footer_phone.split('\n').map((phone, i) => (
                  <li key={i} className={styles.contactItem}>
                    <Phone className={styles.contactIcon} />
                    <span>{phone}</span>
                  </li>
                ))}
                <li className={styles.contactItem}>
                  <Mail className={styles.contactIcon} />
                  <span>{settings.footer_email}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className={styles.footerBottom}>
        <div className="container">
          <div className={styles.footerBottomInner}>
            <p className={styles.copyright}>
              © {new Date().getFullYear()} SD Trends. All Rights Reserved. Built by <a href="https://www.orynez.com/contact" target="_blank" rel="noopener noreferrer" className={styles.orynezLink}>orynez</a>
            </p>
            {/* <div className={styles.paymentMethods}>
              <img src="/images/visa.png" alt="Visa" className={styles.paymentIcon} />
              <img src="/images/mastercard.png" alt="Mastercard" className={styles.paymentIcon} />
              <img src="/images/paypal.png" alt="PayPal" className={styles.paymentIcon} />
              <img src="/images/amex.png" alt="Amex" className={styles.paymentIcon} />
            </div> */}
          </div>
        </div>
      </div>
    </footer>
  );
}
