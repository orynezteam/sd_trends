"use client";

import React, { useState, useEffect } from 'react';
import { ShoppingBag, Check, X, Eye, ShieldCheck, Mail, Calendar, ArrowRight } from 'lucide-react';
import styles from './OrdersAdmin.module.css';
import { API_BASE_URL, BASE_URL } from '@/config';


export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending_verification' | 'processing' | 'shipped' | 'declined'>('all');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/orders`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: number, newStatus: 'Processing' | 'Shipped' | 'Declined') => {
    let confirmMsg = `Are you sure you want to mark this payment as ${newStatus}?`;
    if (newStatus === 'Processing') confirmMsg = 'Are you sure you want to mark this payment as VERIFIED? This will notify the customer via email.';
    if (newStatus === 'Declined') confirmMsg = 'Are you sure you want to DECLINE this payment? This will notify the customer via email.';
    if (newStatus === 'Shipped') confirmMsg = 'Are you sure you want to mark this order as SHIPPED? This will notify the customer via email.';
    
    if (!window.confirm(confirmMsg)) {
      return;
    }
    
    setUpdatingId(orderId);
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.ok) {
        // Update local state
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev: any) => ({ ...prev, status: newStatus }));
        }
        alert(`Payment status successfully updated to ${newStatus}. Notification email sent.`);
      } else {
        alert("Failed to update status on server.");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating order status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return <span className={`${styles.badge} ${styles.pending}`}>Pending Checkout</span>;
      case 'Pending Verification':
        return <span className={`${styles.badge} ${styles.pending_verification}`}>Verify Payment</span>;
      case 'Processing':
        return <span className={`${styles.badge} ${styles.processing}`}>Verified</span>;
      case 'Shipped':
        return <span className={`${styles.badge} ${styles.processing}`} style={{backgroundColor: '#e0e7ff', color: '#4338ca'}}>Shipped</span>;
      case 'Declined':
        return <span className={`${styles.badge} ${styles.declined}`}>Declined</span>;
      default:
        return <span className={styles.badge}>{status}</span>;
    }
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status.toLowerCase().replace(' ', '_') === filter;
  });

  const formatDate = (isoStr: string) => {
    if (!isoStr) return '';
    try {
      const date = new Date(isoStr);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return isoStr;
    }
  };

  if (loading) return <div className={styles.loading}>Loading customer orders...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2>Customer Orders</h2>
          <p className={styles.description}>Review, verify, or decline incoming payments for orders placed using UPI and Bank Transfers.</p>
        </div>
      </div>

      <div className={styles.filters}>
        <button 
          onClick={() => setFilter('all')} 
          className={`${styles.filterBtn} ${filter === 'all' ? styles.activeFilterBtn : ''}`}
        >
          All Orders ({orders.length})
        </button>
        <button 
          onClick={() => setFilter('pending_verification')} 
          className={`${styles.filterBtn} ${filter === 'pending_verification' ? styles.activeFilterBtn : ''}`}
        >
          Pending Verification ({orders.filter(o => o.status === 'Pending Verification').length})
        </button>
        <button 
          onClick={() => setFilter('processing')} 
          className={`${styles.filterBtn} ${filter === 'processing' ? styles.activeFilterBtn : ''}`}
        >
          Verified ({orders.filter(o => o.status === 'Processing').length})
        </button>
        <button 
          onClick={() => setFilter('shipped')} 
          className={`${styles.filterBtn} ${filter === 'shipped' ? styles.activeFilterBtn : ''}`}
        >
          Shipped ({orders.filter(o => o.status === 'Shipped').length})
        </button>
        <button 
          onClick={() => setFilter('declined')} 
          className={`${styles.filterBtn} ${filter === 'declined' ? styles.activeFilterBtn : ''}`}
        >
          Declined ({orders.filter(o => o.status === 'Declined').length})
        </button>
      </div>

      {filteredOrders.length === 0 ? (
        <div className={styles.card}>
          <div className={styles.emptyState}>
            <ShoppingBag size={48} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
            <h3>No Orders Found</h3>
            <p>There are no customer orders matching the selected filter.</p>
          </div>
        </div>
      ) : (
        <div className={styles.card}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Order ID</th>
                  <th className={styles.th}>Customer</th>
                  <th className={styles.th}>Date</th>
                  <th className={styles.th}>Amount</th>
                  <th className={styles.th}>Payment Method</th>
                  <th className={styles.th}>Status</th>
                  <th className={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className={styles.tr}>
                    <td className={styles.td} style={{ fontWeight: 600 }}>#{order.id}</td>
                    <td className={styles.td}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 500 }}>{order.user?.name || 'Guest'}</span>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{order.user?.email}</span>
                      </div>
                    </td>
                    <td className={styles.td}>{formatDate(order.created_at)}</td>
                    <td className={styles.td} style={{ fontWeight: 600 }}>₹{order.total_amount}</td>
                    <td className={styles.td}>{order.payment_method || 'Direct Bank Transfer'}</td>
                    <td className={styles.td}>{getStatusBadge(order.status)}</td>
                    <td className={styles.td}>
                      <div className={styles.actionCell}>
                        <button 
                          className={styles.detailsBtn} 
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye size={14} style={{ display: 'inline', marginRight: '4px' }} />
                          Details
                        </button>
                        
                        {order.status === 'Pending Verification' && (
                          <>
                            <button 
                              className={styles.verifyBtn}
                              disabled={updatingId !== null}
                              onClick={() => handleUpdateStatus(order.id, 'Processing')}
                            >
                              <Check size={14} />
                              Verify
                            </button>
                            <button 
                              className={styles.declineBtn}
                              disabled={updatingId !== null}
                              onClick={() => handleUpdateStatus(order.id, 'Declined')}
                            >
                              <X size={14} />
                              Decline
                            </button>
                          </>
                        )}
                        {order.status === 'Processing' && (
                          <button 
                            className={styles.verifyBtn}
                            style={{ backgroundColor: '#4f46e5' }}
                            disabled={updatingId !== null}
                            onClick={() => handleUpdateStatus(order.id, 'Shipped')}
                          >
                            <ArrowRight size={14} />
                            Ship Order
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details View Modal */}
      {selectedOrder && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Order Details - #{selectedOrder.id}</h3>
              <button className={styles.modalClose} onClick={() => setSelectedOrder(null)}>
                <X size={20} />
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <h4 className={styles.sectionTitle}>Customer Information</h4>
              <div className={styles.infoGrid}>
                <div className={styles.infoBlock}>
                  <label>Name</label>
                  <span>{selectedOrder.user?.name || 'Guest'}</span>
                </div>
                <div className={styles.infoBlock}>
                  <label>Email Address</label>
                  <span>{selectedOrder.user?.email || 'N/A'}</span>
                </div>
                <div className={styles.infoBlock}>
                  <label>Phone Number</label>
                  <span>{selectedOrder.user?.phone || 'N/A'}</span>
                </div>
                <div className={styles.infoBlock}>
                  <label>Shipping Address</label>
                  <span>
                    {selectedOrder.user?.street_name || 'N/A'}
                    {selectedOrder.user?.city && `, ${selectedOrder.user.city}`}
                    {selectedOrder.user?.state && `, ${selectedOrder.user.state}`}
                    {selectedOrder.user?.pincode && ` - ${selectedOrder.user.pincode}`}
                  </span>
                </div>
              </div>

              <h4 className={styles.sectionTitle}>Payment Information</h4>
              <div className={styles.infoGrid}>
                <div className={styles.infoBlock}>
                  <label>Payment Method</label>
                  <span>{selectedOrder.payment_method || 'Direct Bank Transfer'}</span>
                </div>
                <div className={styles.infoBlock}>
                  <label>Total Amount</label>
                  <span style={{ color: '#d93025' }}>₹{selectedOrder.total_amount}</span>
                </div>
                <div className={styles.infoBlock}>
                  <label>Order Date</label>
                  <span>{formatDate(selectedOrder.created_at)}</span>
                </div>
                <div className={styles.infoBlock}>
                  <label>Verification Status</label>
                  <span>{selectedOrder.status}</span>
                </div>
              </div>

              <h4 className={styles.sectionTitle}>Order Items</h4>
              <div className={styles.itemsList}>
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  selectedOrder.items.map((item: any, idx: number) => (
                    <div key={idx} className={styles.itemRow}>
                      <div className={styles.itemLeft}>
                        <span className={styles.itemName}>{item.name}</span>
                        <span className={styles.itemMeta}>Metal: {item.metal} | Qty: {item.quantity}</span>
                      </div>
                      <div className={styles.itemRight}>
                        ₹{item.price * item.quantity}
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic', margin: 0 }}>
                    No product details stored in database for this order.
                  </p>
                )}
              </div>

              {selectedOrder.status === 'Pending Verification' && (
                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
                  <button 
                    className={styles.verifyBtn}
                    style={{ flex: 1, padding: '0.75rem', justifyContent: 'center' }}
                    disabled={updatingId !== null}
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'Processing')}
                  >
                    <Check size={16} />
                    Verify Payment (Approve)
                  </button>
                  <button 
                    className={styles.declineBtn}
                    style={{ flex: 1, padding: '0.75rem', justifyContent: 'center' }}
                    disabled={updatingId !== null}
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'Declined')}
                  >
                    <X size={16} />
                    Decline Payment (Reject)
                  </button>
                </div>
              )}
              {selectedOrder.status === 'Processing' && (
                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
                  <button 
                    className={styles.verifyBtn}
                    style={{ flex: 1, padding: '0.75rem', justifyContent: 'center', backgroundColor: '#4f46e5' }}
                    disabled={updatingId !== null}
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'Shipped')}
                  >
                    <ArrowRight size={16} />
                    Mark Order as Shipped
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
