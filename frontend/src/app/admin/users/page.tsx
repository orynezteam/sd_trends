"use client";

import React, { useState, useEffect } from 'react';
import { Search, Heart, X, Send, Trash2, Eye } from 'lucide-react';
import styles from './AdminUsers.module.css';
import { useStore } from '../../../context/StoreContext';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [userWishlist, setUserWishlist] = useState<any[]>([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const { user } = useStore();

  useEffect(() => {
    fetch('https://sd-trends.onrender.com/api/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load users:", err);
        setLoading(false);
      });
  }, []);

  const openWishlistModal = async (u: any) => {
    setSelectedUser(u);
    setShowModal(true);
    setLoadingWishlist(true);
    setUserWishlist([]);
    
    if (user) {
      try {
        const res = await fetch(`https://sd-trends.onrender.com/api/admin/users/${u.id}/wishlist`);
        if (res.ok) {
          const data = await res.json();
          setUserWishlist(data);
        }
      } catch (err) {
        console.error("Failed to load user wishlist", err);
      }
    }
    setLoadingWishlist(false);
  };

  const sendReminder = async () => {
    if (!selectedUser || !user) return;
    setSendingEmail(true);
    try {
      const res = await fetch(`https://sd-trends.onrender.com/api/admin/users/${selectedUser.id}/send-wishlist-reminder`, {
        method: 'POST'
      });
      if (res.ok) {
        alert('Reminder email sent successfully!');
      } else {
        const data = await res.json();
        alert(`Failed: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Network error occurred while sending email.');
    }
    setSendingEmail(false);
  };

  const removeFavorite = async (productId: string) => {
    if (!selectedUser) return;
    
    // Optimistic update of the modal list
    const updatedWishlist = userWishlist.filter((prod: any) => prod.id !== productId);
    setUserWishlist(updatedWishlist);
    
    // Update the main users table count
    const updatedIds = updatedWishlist.map((p: any) => p.id);
    setUsers(users.map(u => u.id === selectedUser.id ? { ...u, wishlist: updatedIds } : u));
    
    try {
      await fetch(`https://sd-trends.onrender.com/api/users/${selectedUser.id}/wishlist`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wishlist: updatedIds })
      });
    } catch (e) {
      console.error("Failed to remove favorite", e);
    }
  };

  const filteredUsers = users.filter(u => 
    (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (u.phone && u.phone.includes(searchQuery))
  );

  const formatAddress = (u: any) => {
    const parts = [u.street_name, u.landmark, u.city, u.state, u.pincode].filter(Boolean);
    if (parts.length === 0) return <span className={styles.emptyField}>Not provided</span>;
    return parts.join(', ');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) return <div className={styles.loading}>Loading users...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Registered Users</h2>
        <div className={styles.searchBar}>
          <Search size={18} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search by name, email, or phone..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>User Details</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Role</th>
              <th>Newsletter</th>
              <th>Favorites</th>
              <th>Joined Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map(u => (
                <tr key={u.id}>
                  <td>
                    <div className={styles.userDetails}>
                      <span className={styles.userName}>{u.name || 'No Name'}</span>
                      <span className={styles.userEmail}>{u.email}</span>
                    </div>
                  </td>
                  <td>{u.phone || <span className={styles.emptyField}>N/A</span>}</td>
                  <td className={styles.addressCell}>{formatAddress(u)}</td>
                  <td>
                    {u.is_admin ? (
                      <span className={styles.badgeAdmin}>Admin</span>
                    ) : (
                      <span className={styles.badgeCustomer}>Customer</span>
                    )}
                  </td>
                  <td>
                    <span className={u.is_subscribed ? styles.badgeAdmin : styles.badgeCustomer}>
                      {u.is_subscribed ? 'Subscribed' : 'Not Subscribed'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className={styles.viewFavBtn}
                      onClick={() => openWishlistModal(u)}
                    >
                      <Heart size={14} className={styles.favIcon} />
                      View
                    </button>
                  </td>
                  <td>{formatDate(u.created_at)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className={styles.noResults}>
                  No users found matching "{searchQuery}".
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && selectedUser && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Favorites for {selectedUser.name || selectedUser.email}</h3>
              <button className={styles.closeModalBtn} onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              {loadingWishlist ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)' }}>
                  Loading favorites...
                </div>
              ) : userWishlist.length === 0 ? (
                <div className={styles.emptyFavorites}>
                  <Heart size={40} className={styles.emptyHeartIcon} />
                  <p>This user has no favorite items saved in the database.</p>
                </div>
              ) : (
                <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                  <table className={styles.table} style={{ width: '100%', marginBottom: 0 }}>
                    <thead>
                      <tr>
                        <th style={{ width: '60px' }}>Image</th>
                        <th>Product Details</th>
                        <th>Price</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userWishlist.map((prod: any) => (
                        <tr key={prod.id}>
                          <td>
                            <div style={{ width: '50px', height: '50px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                              {prod.image ? (
                                <img src={prod.image} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <div className={styles.noImage} style={{ fontSize: '10px' }}>No Img</div>
                              )}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{prod.name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', textTransform: 'uppercase' }}>{prod.category}</div>
                          </td>
                          <td style={{ fontWeight: 600 }}>₹{prod.price}</td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                              <a href={`/product/${prod.id}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                                <Eye size={16} />
                              </a>
                              <button 
                                onClick={() => removeFavorite(prod.id)}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#ffeeee', color: '#e74c3c', border: 'none', cursor: 'pointer' }}
                                title="Remove from favorites"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            {userWishlist.length > 0 && (
              <div className={styles.modalFooter} style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button 
                  onClick={sendReminder} 
                  disabled={sendingEmail}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.75rem 1.25rem', backgroundColor: 'var(--text-primary)',
                    color: 'var(--bg-primary)', border: 'none', borderRadius: '4px', cursor: sendingEmail ? 'not-allowed' : 'pointer'
                  }}
                >
                  <Send size={16} />
                  {sendingEmail ? 'Sending...' : 'Send Reminder Email'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
