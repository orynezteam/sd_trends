"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Package, CheckCircle, Truck, XCircle } from 'lucide-react';
import styles from './TrackOrder.module.css';
import { API_BASE_URL } from '@/config';

import { Suspense } from 'react';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get('order_id') || '';
  
  const [orderId, setOrderId] = useState(initialOrderId);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialOrderId) {
      handleSearch(initialOrderId);
    }
  }, [initialOrderId]);

  const handleSearch = async (searchId: string = orderId) => {
    if (!searchId.trim()) return;
    
    setLoading(true);
    setError('');
    setOrder(null);
    
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${searchId}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      } else {
        setError("Order not found. Please check your Order ID and try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to connect to the server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

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

  // Timeline logic
  const isOrdered = order !== null;
  const isVerified = order?.status === 'Processing' || order?.status === 'Shipped';
  const isShipped = order?.status === 'Shipped';
  const isDeclined = order?.status === 'Declined';

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Track Your Order</h1>
      <p className={styles.subtitle}>Enter your Order ID below to see the real-time status of your delivery.</p>

      <form 
        className={styles.searchBox} 
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
      >
        <input 
          type="text" 
          placeholder="e.g., 1024" 
          className={styles.input}
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
        />
        <button type="submit" className={styles.searchBtn} disabled={loading}>
          {loading ? 'SEARCHING...' : 'TRACK'}
        </button>
      </form>

      {error && <div className={styles.error}>{error}</div>}

      {order && (
        <div className={styles.resultCard}>
          <div className={styles.orderHeader}>
            <div>
              <h2 className={styles.orderId}>Order #{order.id}</h2>
              <div className={styles.orderDate}>Placed on {formatDate(order.created_at)}</div>
            </div>
            <div className={styles.orderAmount}>₹{order.total_amount}</div>
          </div>

          <div className={styles.timeline}>
            {/* Step 1: Ordered */}
            <div className={`${styles.timelineItem} ${isOrdered && !isDeclined ? styles.completed : ''} ${!isVerified && !isDeclined ? styles.active : ''}`}>
              <div className={styles.timelineIcon}>
                <Package size={24} />
              </div>
              <div className={styles.timelineContent}>
                <h3 className={styles.timelineTitle}>Ordered</h3>
                <p className={styles.timelineDesc}>
                  We have received your order and payment is pending verification.
                </p>
              </div>
            </div>

            {/* Step 2: Verified (Or Declined) */}
            {isDeclined ? (
              <div className={`${styles.timelineItem} ${styles.cancelled} ${styles.active}`}>
                <div className={styles.timelineIcon}>
                  <XCircle size={24} />
                </div>
                <div className={styles.timelineContent}>
                  <h3 className={styles.timelineTitle}>Declined / Cancelled</h3>
                  <p className={styles.timelineDesc}>
                    Your payment could not be verified or the order was cancelled.
                  </p>
                </div>
              </div>
            ) : (
              <div className={`${styles.timelineItem} ${isVerified ? styles.completed : ''} ${isVerified && !isShipped ? styles.active : ''}`}>
                <div className={styles.timelineIcon}>
                  <CheckCircle size={24} />
                </div>
                <div className={styles.timelineContent}>
                  <h3 className={styles.timelineTitle}>Verified & Processing</h3>
                  <p className={styles.timelineDesc}>
                    {isVerified 
                      ? "Your payment was verified. We are now preparing your items for shipment." 
                      : "Waiting for payment verification."}
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Shipped */}
            {!isDeclined && (
              <div className={`${styles.timelineItem} ${isShipped ? styles.active : ''}`}>
                <div className={styles.timelineIcon}>
                  <Truck size={24} />
                </div>
                <div className={styles.timelineContent}>
                  <h3 className={styles.timelineTitle}>Shipped</h3>
                  <p className={styles.timelineDesc}>
                    {isShipped 
                      ? "Your order has been handed over to our delivery partners and is on its way!" 
                      : "Pending shipment."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className={styles.container}>Loading tracking data...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
