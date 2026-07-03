"use client";

import React, { useState, useEffect } from 'react';
import { Mail, MailOpen, Trash2, Calendar, User } from 'lucide-react';
import styles from './Messages.module.css';
import { API_BASE_URL, BASE_URL } from '@/config';


export default function MessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/contact-messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleReadStatus = async (id: number, currentStatus: boolean) => {
    try {
      const res = await fetch(`${API_BASE_URL}/contact-messages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_read: !currentStatus })
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(messages.map(m => m.id === id ? data.msg : m));
      }
    } catch (err) {
      alert('Error updating status');
    }
  };

  const deleteMessage = async (id: number) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/contact-messages/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setMessages(messages.filter(m => m.id !== id));
      }
    } catch (err) {
      alert('Error deleting message');
    }
  };

  if (loading) return <div className={styles.loading}>Loading messages...</div>;

  const unreadCount = messages.filter(m => !m.is_read).length;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Contact Messages</h2>
        <p className={styles.description}>You have {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}.</p>
      </div>

      <div className={styles.messageList}>
        {messages.length === 0 ? (
          <div className={styles.emptyState}>No messages found.</div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className={`${styles.messageCard} ${!msg.is_read ? styles.unread : ''}`}>
              <div className={styles.cardHeader}>
                <div className={styles.senderInfo}>
                  <div className={styles.avatar}>
                    {msg.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className={styles.senderName}>{msg.name}</h3>
                    <a href={`mailto:${msg.email}`} className={styles.senderEmail}>{msg.email}</a>
                  </div>
                </div>
                <div className={styles.metaInfo}>
                  <span className={styles.date}>
                    <Calendar size={14} /> 
                    {new Date(msg.created_at).toLocaleDateString()} at {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              </div>
              
              <div className={styles.cardBody}>
                <p className={styles.messageText}>{msg.message}</p>
              </div>

              <div className={styles.cardFooter}>
                <button 
                  onClick={() => toggleReadStatus(msg.id, msg.is_read)}
                  className={styles.actionBtn}
                >
                  {msg.is_read ? (
                    <><Mail size={16} /> Mark as Unread</>
                  ) : (
                    <><MailOpen size={16} /> Mark as Read</>
                  )}
                </button>
                
                <button 
                  onClick={() => deleteMessage(msg.id)}
                  className={styles.deleteBtn}
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
