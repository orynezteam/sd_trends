"use client";

import React, { useState, useEffect } from 'react';
import { Save, ArrowUp, ArrowDown } from 'lucide-react';
import * as Icons from 'lucide-react';
import styles from './AdminServices.module.css';
import { API_BASE_URL, BASE_URL } from '@/config';


export default function AdminServicesPage() {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/content/services`)
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data)) {
          setCards(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load services:", err);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/content/services`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cards.map((c, idx) => ({ ...c, display_order: idx + 1 })))
      });
      if (res.ok) {
        alert("Services updated successfully!");
        const data = await res.json();
        setCards(data.cards);
      } else {
        alert("Failed to update services.");
      }
    } catch (err) {
      alert("Network error saving services.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = (id: number, field: string, value: string) => {
    setCards(cards.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newCards = [...cards];
    const temp = newCards[index];
    newCards[index] = newCards[index - 1];
    newCards[index - 1] = temp;
    setCards(newCards);
  };

  const moveDown = (index: number) => {
    if (index === cards.length - 1) return;
    const newCards = [...cards];
    const temp = newCards[index];
    newCards[index] = newCards[index + 1];
    newCards[index + 1] = temp;
    setCards(newCards);
  };

  const renderIcon = (iconName: string) => {
    const IconComponent = Icons[iconName as keyof typeof Icons] as React.ElementType;
    if (!IconComponent) return <Icons.HelpCircle size={24} />;
    return <IconComponent size={24} strokeWidth={1.5} />;
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2>Manage Services Cards</h2>
          <p className={styles.description}>
            Update the title, description, and order of the 4 service cards displayed on the homepage.
          </p>
        </div>
        <button onClick={handleSave} className={styles.saveBtn} disabled={saving}>
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
      
      <div className={styles.cardsList}>
        {cards.map((card, idx) => (
          <div key={card.id} className={styles.cardItem}>
            <div className={styles.cardControls}>
              <button 
                onClick={() => moveUp(idx)} 
                disabled={idx === 0}
                className={styles.moveBtn}
                title="Move Up"
              >
                <ArrowUp size={18} />
              </button>
              <button 
                onClick={() => moveDown(idx)} 
                disabled={idx === cards.length - 1}
                className={styles.moveBtn}
                title="Move Down"
              >
                <ArrowDown size={18} />
              </button>
            </div>
            
            <div className={styles.iconPreview}>
              {renderIcon(card.icon_name)}
              <span className={styles.iconName}>{card.icon_name}</span>
            </div>
            
            <div className={styles.cardForm}>
              <div className={styles.formGroup}>
                <label>Title</label>
                <input 
                  type="text" 
                  value={card.title}
                  onChange={(e) => handleUpdate(card.id, 'title', e.target.value)}
                  placeholder="e.g. Worldwide Shipping"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Description</label>
                <input 
                  type="text" 
                  value={card.description}
                  onChange={(e) => handleUpdate(card.id, 'description', e.target.value)}
                  placeholder="e.g. For all Orders Over ₹100"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
