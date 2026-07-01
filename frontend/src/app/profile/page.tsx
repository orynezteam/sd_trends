"use client";

import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import { User, MapPin, Mail, Package, LogOut, ChevronRight } from 'lucide-react';
import styles from './Profile.module.css';

export default function ProfilePage() {
  const { user, login, logout } = useStore();
  
  // Auth state
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [streetName, setStreetName] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [otp, setOtp] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Profile state
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState([]);

  // Fetch orders when user loads
  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/user/profile?email=${encodeURIComponent(user.email)}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error("Failed to fetch orders", err);
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const res = await fetch('http://localhost:5000/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, is_login: isLoginTab })
      });
      
      const data = await res.json();
      if (res.ok) {
        setStep('otp');
        // In local dev, backend sends dev_otp in response for easy testing
        if (data.dev_otp) {
           console.log("DEV OTP: ", data.dev_otp);
        }
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Network error. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const payload: any = { email, otp_code: otp };
      if (!isLoginTab) {
        payload.name = name;
        payload.phone = phone;
        payload.street_name = streetName;
        payload.landmark = landmark;
        payload.city = city;
        payload.state = state;
        payload.pincode = pincode;
      }

      const res = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (res.ok && data.user) {
        login(data.user);
      } else {
        setError(data.error || 'Invalid OTP');
      }
    } catch (err) {
      setError('Network error. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  // Switch tabs and reset state
  const toggleAuthMode = (mode: boolean) => {
    setIsLoginTab(mode);
    setStep('email');
    setError('');
    setOtp('');
  };

  const handleLogout = () => {
    logout();
    setStep('email');
    setOtp('');
  };

  const renderAuthForm = () => (
    <div className={styles.container}>
      <div className={styles.authCard}>
        <div className={styles.authTabs}>
          <div 
            className={`${styles.authTab} ${isLoginTab ? styles.active : ''}`}
            onClick={() => toggleAuthMode(true)}
          >
            Sign In
          </div>
          <div 
            className={`${styles.authTab} ${!isLoginTab ? styles.active : ''}`}
            onClick={() => toggleAuthMode(false)}
          >
            Sign Up
          </div>
        </div>

        {step === 'email' ? (
          <form onSubmit={handleRequestOtp}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Email Address</label>
              <input 
                type="email" 
                className={styles.input} 
                placeholder="Enter your email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            
            {!isLoginTab && (
              <>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Full Name</label>
                  <input 
                    type="text" 
                    className={styles.input} 
                    placeholder="Enter your full name" 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Phone Number</label>
                  <input 
                    type="tel" 
                    className={styles.input} 
                    placeholder="Enter your phone number" 
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Street Name</label>
                  <input 
                    type="text" 
                    className={styles.input} 
                    placeholder="Enter street name" 
                    value={streetName}
                    onChange={e => setStreetName(e.target.value)}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Nearby Landmark (Optional)</label>
                  <input 
                    type="text" 
                    className={styles.input} 
                    placeholder="Enter nearby landmark" 
                    value={landmark}
                    onChange={e => setLandmark(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div className={styles.formGroup} style={{ flex: 1 }}>
                    <label className={styles.label}>City/Town</label>
                    <input 
                      type="text" 
                      className={styles.input} 
                      placeholder="City" 
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      required
                    />
                  </div>
                  <div className={styles.formGroup} style={{ flex: 1 }}>
                    <label className={styles.label}>State</label>
                    <input 
                      type="text" 
                      className={styles.input} 
                      placeholder="State" 
                      value={state}
                      onChange={e => setState(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Pincode</label>
                  <input 
                    type="text" 
                    className={styles.input} 
                    placeholder="Pincode" 
                    value={pincode}
                    onChange={e => setPincode(e.target.value)}
                    required
                  />
                </div>
              </>
            )}
            
            {error && <div className={styles.errorText}>{error}</div>}
            
            <button type="submit" className={styles.submitBtn} disabled={loading || !email}>
              {loading ? 'Sending...' : 'Send Verification Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <div className={styles.otpMessage}>
              We've sent a 6-digit verification code to <strong>{email}</strong>
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Verification Code</label>
              <input 
                type="text" 
                className={styles.input} 
                placeholder="Enter 6-digit code" 
                value={otp}
                onChange={e => setOtp(e.target.value)}
                maxLength={6}
                required
              />
            </div>

            {error && <div className={styles.errorText}>{error}</div>}
            
            <button type="submit" className={styles.submitBtn} disabled={loading || otp.length < 6}>
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>
            
            <div 
              style={{ textAlign: 'center', marginTop: '1rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-secondary)' }}
              onClick={() => setStep('email')}
            >
              Back to email
            </div>
          </form>
        )}
      </div>
    </div>
  );

  const renderDashboard = () => {
    const initials = user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase();

    return (
      <div className={styles.container}>
        <div className={styles.dashboard}>
          {/* Sidebar */}
          <div className={styles.sidebar}>
            <div className={styles.userInfo}>
              <div className={styles.avatar}>{initials}</div>
              <div className={styles.userName}>{user.name || 'Valued Client'}</div>
              <div className={styles.userEmail}>{user.email}</div>
            </div>
            <ul className={styles.menu}>
              <li 
                className={`${styles.menuItem} ${activeTab === 'profile' ? styles.active : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <User size={18} /> My Profile
              </li>
              <li 
                className={`${styles.menuItem} ${activeTab === 'orders' ? styles.active : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                <Package size={18} /> Order History
              </li>
              <li className={`${styles.menuItem} ${styles.logout}`} onClick={handleLogout}>
                <LogOut size={18} /> Sign Out
              </li>
            </ul>
          </div>

          {/* Main Content */}
          <div className={styles.content}>
            {activeTab === 'profile' && (
              <>
                <h2 className={styles.contentTitle}>My Profile</h2>
                <div className={styles.profileDetails}>
                  <div className={styles.detailGroup}>
                    <div className={styles.detailLabel}>Full Name</div>
                    <div className={styles.detailValue}>{user.name || 'Not provided'}</div>
                  </div>
                  <div className={styles.detailGroup}>
                    <div className={styles.detailLabel}>Email Address</div>
                    <div className={styles.detailValue}>{user.email}</div>
                  </div>
                  <div className={styles.detailGroup}>
                    <div className={styles.detailLabel}>Phone Number</div>
                    <div className={styles.detailValue}>{user.phone || 'Not provided'}</div>
                  </div>
                  <div className={styles.detailGroup}>
                    <div className={styles.detailLabel}>Street Address</div>
                    <div className={styles.detailValue}>{user.street_name || 'Not provided'}</div>
                  </div>
                  <div className={styles.detailGroup}>
                    <div className={styles.detailLabel}>Landmark</div>
                    <div className={styles.detailValue}>{user.landmark || 'None'}</div>
                  </div>
                  <div className={styles.detailGroup}>
                    <div className={styles.detailLabel}>City & State</div>
                    <div className={styles.detailValue}>
                      {user.city ? `${user.city}, ` : ''}{user.state || 'Not provided'}
                    </div>
                  </div>
                  <div className={styles.detailGroup}>
                    <div className={styles.detailLabel}>Pincode</div>
                    <div className={styles.detailValue}>{user.pincode || 'Not provided'}</div>
                  </div>
                  <div className={styles.detailGroup}>
                    <div className={styles.detailLabel}>Member Since</div>
                    <div className={styles.detailValue}>
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Today'}
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'orders' && (
              <>
                <h2 className={styles.contentTitle}>Order History</h2>
                {orders.length > 0 ? (
                  <div className={styles.ordersList}>
                    {orders.map((order, idx) => (
                      <div key={idx} className={styles.orderCard}>
                        <div>
                          <div className={styles.orderId}>Order #{order.id || `1000${idx}`}</div>
                          <div className={styles.orderDate}>
                            {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'Recent'}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div className={styles.orderAmount}>₹{order.total_amount?.toFixed(2) || '0.00'}</div>
                          <div className={styles.orderStatus}>{order.status || 'Processing'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.emptyState}>
                    <Package size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.2 }} />
                    <p>You haven't placed any orders yet.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <main style={{ flex: '1', backgroundColor: 'var(--bg-secondary)' }}>
        {user ? renderDashboard() : renderAuthForm()}
      </main>
      <Footer />
    </div>
  );
}
