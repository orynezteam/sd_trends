"use client";

import React, { useState } from 'react';
import styles from './Footer.module.css';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ success: null, message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setStatus({ success: false, message: 'Please enter a valid email address.' });
      return;
    }

    setLoading(true);
    setStatus({ success: null, message: '' });

    try {
      const res = await fetch('http://localhost:5000/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      if (res.ok) {
        setStatus({ success: true, message: data.message });
        setEmail('');
      } else {
        setStatus({ success: false, message: data.error || 'Subscription failed.' });
      }
    } catch (err) {
      console.error(err);
      setStatus({ success: false, message: 'Server is currently offline. Please try again later.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer id="newsletter" className={styles.footer}>
      <div className="container">
        {/* Upper Newsletter Subscription */}
        <div className={styles.newsletterSection}>
          <h2 className={styles.newsTitle}>Subscribe to our Newsletter</h2>
          <p className={styles.newsSubtitle}>
            Receive exclusive early access to new collection launches, editorial lookbooks, and private members-only offers.
          </p>
          <form className={styles.form} onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="Your email address..."
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
            <button 
              type="submit" 
              className={`${styles.subBtn} btn-gold`}
              disabled={loading}
            >
              {loading ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>

          {status.success === true && (
            <p className={styles.successMsg}>{status.message}</p>
          )}
          {status.success === false && (
            <p className={styles.errorMsg}>{status.message}</p>
          )}
        </div>

        {/* Middle Columns */}
        <div className={styles.columns}>
          <div className={styles.col}>
            <h3 className={styles.logoTitle}>SD Trends Design</h3>
            <p className={styles.aboutText}>
              Handcrafting fine heirloom-grade jewelry since 2012. We combine traditional artistry with sustainable sourcing to make precious moments timeless.
            </p>
            <ul className={styles.contactList}>
              <li>Phone: 000000</li>
              <li>Email: sdtrends@gmail.com</li>
            </ul>
          </div>

          <div className={styles.col}>
            <h4 className={styles.colTitle}>Customer Care</h4>
            <ul className={styles.linksList}>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Complimentary Appraisals</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Insured Shipping & Rates</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>30-Day Hassle-Free Returns</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Lifetime Ring Resizing</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Custom Jewelry Consultations</a></li>
            </ul>
          </div>

          <div className={styles.col}>
            <h4 className={styles.colTitle}>Shop Collection</h4>
            <ul className={styles.linksList}>
              <li><a href="#categories">Solitaire Rings</a></li>
              <li><a href="#categories">Tiara Necklaces</a></li>
              <li><a href="#categories">Halo Stud Earrings</a></li>
              <li><a href="#categories">Diamond Tennis Bracelets</a></li>
              <li><a href="#categories">Vintage Bands</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright details */}
        <div className={styles.bottomBar}>
          <div className={styles.copyright}>
            &copy; {new Date().getFullYear()} SD Trends Design. All Rights Reserved. Replicated Luxury E-Commerce design.
          </div>

          <div className={styles.payments}>
            <span className={styles.paymentBadge}>Visa</span>
            <span className={styles.paymentBadge}>Mastercard</span>
            <span className={styles.paymentBadge}>Amex</span>
            <span className={styles.paymentBadge}>Apple Pay</span>
            <span className={styles.paymentBadge}>PayPal</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
