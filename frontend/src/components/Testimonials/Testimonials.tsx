"use client";

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Upload } from 'lucide-react';
import styles from './Testimonials.module.css';
import { useStore } from '../../context/StoreContext';
import { supabase } from '../../utils/supabase';

export default function Testimonials() {
  const { user } = useStore();
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [visibleCards, setVisibleCards] = useState(3);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    quote: '',
    role: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchTestimonials() {
      try {
        const res = await fetch('https://sd-trends.onrender.com/api/testimonials?status=approved');
        if (res.ok) {
          const data = await res.json();
          setTestimonials(data);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchTestimonials();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setVisibleCards(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCards(2);
      } else {
        setVisibleCards(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => 
      Math.min(prev + 1, (testimonials.length + 1) - visibleCards)
    );
  };

  const showArrows = (testimonials.length + 1) > visibleCards;

  // Form handling
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `testimonial_${Date.now()}.${fileExt}`;
    const filePath = `testimonials/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('sd-trends-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from('sd-trends-images').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const payload = {
        author: user?.name || user?.email,
        title: formData.title,
        quote: formData.quote,
        role: formData.role,
        image_url: imageUrl,
        status: 'pending' // Always pending for user submissions
      };

      const res = await fetch('https://sd-trends.onrender.com/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert('Thank you for your testimonial! It has been submitted for review.');
        setShowModal(false);
        setFormData({ title: '', quote: '', role: '' });
        setImageFile(null);
        setImagePreview(null);
      } else {
        alert('Failed to submit testimonial. Please try again.');
      }
    } catch (err: any) {
      alert(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.section}>
      <div className="container">
        {/* Section Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>What Our Clients Say</h2>
          <p className={styles.subtitle}>
            Read testimonials from our satisfied customers.
          </p>
        </div>

        {testimonials.length === -1 ? (
          <div className={styles.noTestimonials}>No testimonials yet.</div>
        ) : (
          <div className={styles.sliderWrapper}>
            {showArrows && (
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className={`${styles.arrowBtn} ${styles.prevBtn}`}
                aria-label="Previous Testimonial"
              >
                <ChevronLeft size={20} />
              </button>
            )}

            <div className={styles.viewport}>
              <div
                className={styles.track}
                style={{
                  transform: `translateX(-${currentIndex * (100 / visibleCards)}%)`,
                  width: `${((testimonials.length + 1) / visibleCards) * 100}%`
                }}
              >
                {[...testimonials, { isLeaveCard: true, id: 'leave-card' }].map((item) => (
                  <div
                    key={item.id}
                    className={styles.cardWrapper}
                    style={{ width: `${100 / (testimonials.length + 1)}%` }}
                  >
                    {item.isLeaveCard ? (
                      <div 
                        className={`${styles.card} ${styles.leaveCard}`}
                        onClick={() => user ? setShowModal(true) : alert('Please log in to leave a testimonial.')}
                      >
                        <div className={styles.leaveCardContent}>
                          <h3 className={styles.cardTitle}>Share Your Experience</h3>
                          <p className={styles.quoteText}>We value your feedback. Let us know how we did!</p>
                          <button className={styles.leaveReviewBtn}>Leave a Testimonial</button>
                        </div>
                      </div>
                    ) : (
                      <div className={styles.card}>
                        <h3 className={styles.cardTitle}>{item.title}</h3>
                        <p className={styles.quoteText}>{item.quote}</p>
                        <div className={styles.authorBlock}>
                          <div className={styles.avatarWrapper}>
                            <img
                              src={item.image_url}
                              alt={item.author}
                              className={styles.avatar}
                            />
                          </div>
                          <div className={styles.authorInfo}>
                            <span className={styles.authorName}>{item.author}</span>
                            <span className={styles.authorRole}>{item.role}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {showArrows && (
              <button
                onClick={handleNext}
                disabled={currentIndex >= testimonials.length - visibleCards}
                className={`${styles.arrowBtn} ${styles.nextBtn}`}
                aria-label="Next Testimonial"
              >
                <ChevronRight size={20} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Submission Modal */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button className={styles.closeBtn} onClick={() => setShowModal(false)}>
              <X size={24} />
            </button>
            <h3 className={styles.modalTitle}>Leave a Testimonial</h3>
            <p className={styles.modalSubtitle}>Share your experience with us!</p>
            
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Name</label>
                <input type="text" value={user?.name || user?.email} disabled className={styles.disabledInput} />
              </div>
              
              <div className={styles.formGroup}>
                <label>Your Role/Title (Optional)</label>
                <input 
                  type="text" 
                  value={formData.role} 
                  onChange={e => setFormData({...formData, role: e.target.value})}
                  placeholder="e.g. Happy Customer, CEO" 
                />
              </div>

              <div className={styles.formGroup}>
                <label>Review Headline (Optional)</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. Amazing service!" 
                />
              </div>

              <div className={styles.formGroup}>
                <label>Your Review *</label>
                <textarea 
                  required
                  rows={4}
                  value={formData.quote}
                  onChange={e => setFormData({...formData, quote: e.target.value})}
                  placeholder="Tell us what you think..."
                />
              </div>

              <div className={styles.formGroup}>
                <label>Profile Picture (Optional)</label>
                <div className={styles.uploadArea}>
                  {imagePreview ? (
                    <div className={styles.previewContainer}>
                      <img src={imagePreview} alt="Preview" className={styles.previewImage} />
                      <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }} className={styles.removeImgBtn}>
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <label className={styles.uploadLabel}>
                      <Upload size={20} />
                      <span>Upload Photo</span>
                      <input type="file" accept="image/*" onChange={handleImageChange} className={styles.hiddenInput} />
                    </label>
                  )}
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
                {isSubmitting ? 'Submitting...' : 'Submit Testimonial'}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
