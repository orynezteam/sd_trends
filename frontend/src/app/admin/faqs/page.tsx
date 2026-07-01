"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Save, X } from 'lucide-react';
import styles from './FAQsAdmin.module.css';

export default function FAQsAdminPage() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentFaq, setCurrentFaq] = useState<any>({
    id: null,
    question: '',
    answer: '',
    display_order: 0,
    is_active: true
  });

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/faqs');
      if (res.ok) {
        const data = await res.json();
        setFaqs(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (faq: any) => {
    setCurrentFaq(faq);
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setCurrentFaq({
      id: null,
      question: '',
      answer: '',
      display_order: faqs.length > 0 ? Math.max(...faqs.map(f => f.display_order)) + 1 : 1,
      is_active: true
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setCurrentFaq({ id: null, question: '', answer: '', display_order: 0, is_active: true });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentFaq.question.trim() || !currentFaq.answer.trim()) {
      alert("Question and Answer are required.");
      return;
    }

    const url = currentFaq.id 
      ? `http://localhost:5000/api/faqs/${currentFaq.id}`
      : `http://localhost:5000/api/faqs`;
    
    const method = currentFaq.id ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentFaq)
      });
      if (res.ok) {
        fetchFaqs();
        setIsEditing(false);
      } else {
        alert("Failed to save FAQ");
      }
    } catch (err) {
      alert("Error saving FAQ");
    }
  };

  const toggleActive = async (faq: any) => {
    try {
      const res = await fetch(`http://localhost:5000/api/faqs/${faq.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !faq.is_active })
      });
      if (res.ok) {
        fetchFaqs();
      }
    } catch (err) {
      alert("Error toggling status");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/faqs/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setFaqs(faqs.filter(f => f.id !== id));
      }
    } catch (err) {
      alert("Error deleting FAQ");
    }
  };

  if (loading) return <div className={styles.loading}>Loading FAQs...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2>Manage FAQs</h2>
          <p className={styles.description}>Add, edit, or reorder the Frequently Asked Questions.</p>
        </div>
        {!isEditing && (
          <button className={styles.addBtn} onClick={handleAddNew}>
            <Plus size={18} /> Add New FAQ
          </button>
        )}
      </div>

      {isEditing ? (
        <div className={styles.formCard}>
          <div className={styles.cardHeader}>
            <h3>{currentFaq.id ? 'Edit FAQ' : 'New FAQ'}</h3>
          </div>
          <form onSubmit={handleSave} className={styles.form}>
            <div className={styles.formGroup}>
              <label>Question</label>
              <input 
                type="text" 
                value={currentFaq.question}
                onChange={e => setCurrentFaq({...currentFaq, question: e.target.value})}
                placeholder="e.g. What is your return policy?"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Answer</label>
              <textarea 
                rows={4}
                value={currentFaq.answer}
                onChange={e => setCurrentFaq({...currentFaq, answer: e.target.value})}
                placeholder="Write the full answer here..."
                required
              />
            </div>
            
            <div className={styles.rowGrid}>
              <div className={styles.formGroup}>
                <label>Display Order (Lower numbers appear first)</label>
                <input 
                  type="number" 
                  value={currentFaq.display_order}
                  onChange={e => setCurrentFaq({...currentFaq, display_order: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Status</label>
                <div className={styles.toggleWrapper}>
                  <label className={styles.switch}>
                    <input 
                      type="checkbox" 
                      checked={currentFaq.is_active}
                      onChange={e => setCurrentFaq({...currentFaq, is_active: e.target.checked})}
                    />
                    <span className={styles.slider}></span>
                  </label>
                  <span>{currentFaq.is_active ? 'Active (Visible)' : 'Inactive (Hidden)'}</span>
                </div>
              </div>
            </div>

            <div className={styles.formActions}>
              <button type="button" className={styles.cancelBtn} onClick={handleCancel}>
                <X size={18} /> Cancel
              </button>
              <button type="submit" className={styles.saveBtn}>
                <Save size={18} /> Save FAQ
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{width: '60px'}}>Order</th>
                <th style={{width: '35%'}}>Question</th>
                <th>Answer Preview</th>
                <th style={{width: '100px'}}>Status</th>
                <th style={{width: '120px', textAlign: 'right'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {faqs.length === 0 ? (
                <tr>
                  <td colSpan={5} className={styles.emptyState}>No FAQs found.</td>
                </tr>
              ) : (
                faqs.map(faq => (
                  <tr key={faq.id} className={!faq.is_active ? styles.inactiveRow : ''}>
                    <td className={styles.orderCell}>{faq.display_order}</td>
                    <td className={styles.questionCell}>
                      <strong>{faq.question}</strong>
                    </td>
                    <td className={styles.answerCell}>
                      <div className={styles.truncate}>{faq.answer}</div>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${faq.is_active ? styles.active : styles.inactive}`}>
                        {faq.is_active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className={styles.actionsCell}>
                      <button 
                        className={styles.iconBtn} 
                        onClick={() => toggleActive(faq)}
                        title={faq.is_active ? "Hide FAQ" : "Show FAQ"}
                      >
                        {faq.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                      <button className={styles.iconBtn} onClick={() => handleEdit(faq)} title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button className={`${styles.iconBtn} ${styles.deleteIcon}`} onClick={() => handleDelete(faq.id)} title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
