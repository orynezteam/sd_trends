"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp } from 'lucide-react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import styles from './faqs.module.css';

export default function FAQs() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [faqData, setFaqData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/faqs');
      if (res.ok) {
        const data = await res.json();
        // Only show active FAQs
        setFaqData(data.filter((f: any) => f.is_active));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleIndex = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
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
              <Link href="/">Home</Link> / <span>FAQs</span>
            </div>
            <h1 className={styles.bannerTitle}>FAQs</h1>
          </div>
        </section>

        {/* Main FAQ Content Grid */}
        <section className={styles.mainSection}>
          <div className="container">
            <div className={styles.grid}>
              
              {/* Left Column: Heading & Illustration */}
              <div className={styles.leftColumn}>
                <span className={styles.subtitle}>FAQs</span>
                <h2 className={styles.title}>Frequently Asked Question</h2>
                <p className={styles.description}>
                  Have questions about our fine jewelry? Find answers to frequently asked questions about orders, shipping, customization, and care.
                </p>
                <div className={styles.illustrationWrapper}>
                  <img 
                    src="/images/faq_illustration.png" 
                    alt="FAQ Illustration" 
                    className={styles.illustration}
                  />
                </div>
              </div>

              {/* Right Column: FAQ List */}
              <div className={styles.rightColumn}>
                {loading ? (
                  <p className={styles.description}>Loading FAQs...</p>
                ) : faqData.length === 0 ? (
                  <p className={styles.description}>No FAQs available at this time.</p>
                ) : (
                  faqData.map((faq, index) => {
                    const isOpen = openIndex === index;
                    return (
                      <div key={faq.id} className={styles.faqItem}>
                        <button 
                          className={styles.faqQuestionButton}
                          onClick={() => toggleIndex(index)}
                          aria-expanded={isOpen}
                        >
                          <h3 className={styles.faqQuestion}>{faq.question}</h3>
                          <span className={styles.faqIcon}>
                            {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </span>
                        </button>
                        
                        <div className={`${styles.faqAnswerWrapper} ${isOpen ? styles.answerOpen : ''}`}>
                          <p className={styles.faqAnswer}>{faq.answer}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
