"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import { useStore } from '../../context/StoreContext';
import { ChevronRight, Check, ShieldCheck, CreditCard, ShoppingBag, CheckCircle, Copy, X } from 'lucide-react';
import styles from './checkout.module.css';

export default function CheckoutPage() {
  const { cart, clearCart, user } = useStore();
  
  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('India');
  const [address, setAddress] = useState('');
  const [state, setState] = useState('Gujarat');
  const [postcode, setPostcode] = useState('');

  // Checkout states
  const [shippingOption, setShippingOption] = useState<'free' | 'pickup' | 'flat'>('free');
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'cod' | 'upi'>('upi');
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // UPI payment gateway states
  const [upiId, setUpiId] = useState('mythu2124@oksbi');
  const [merchantName, setMerchantName] = useState('SD Trends');
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<number | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [loadingPayment, setLoadingPayment] = useState(false);

  // Auto-populate from logged-in user profile
  React.useEffect(() => {
    if (user) {
      setFirstName(user.name || '');
      setPhone(user.phone || '');
      setEmail(user.email || '');
    }
  }, [user]);

  // Load UPI merchant details from settings
  React.useEffect(() => {
    fetch('http://localhost:5000/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.upi_id) setUpiId(data.upi_id);
        if (data.upi_merchant_name) setMerchantName(data.upi_merchant_name);
      })
      .catch(err => console.error("Error loading UPI settings", err));
  }, []);

  // Cart total calculations
  const cartSubtotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  
  let shippingCost = 0;
  if (shippingOption === 'pickup') shippingCost = 5;
  if (shippingOption === 'flat') shippingCost = 10;
  
  const cartTotal = cartSubtotal + shippingCost;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!firstName.trim() || !phone.trim() || !address.trim() || !postcode.trim()) {
      setValidationError('Please fill in all the required billing details (*).');
      window.scrollTo({ top: 300, behavior: 'smooth' });
      return;
    }
    
    setValidationError('');
    setSubmitting(true);

    const orderEmail = email.trim() || `${phone.trim()}@sdtrends.com`;

    try {
      const orderPayload = {
        email: orderEmail,
        name: `${firstName} ${lastName}`.trim(),
        phone: phone,
        street_name: address,
        city: '',
        state: state,
        pincode: postcode,
        total_amount: cartTotal,
        status: paymentMethod === 'upi' ? 'Pending' : 'Pending Verification',
        payment_method: paymentMethod === 'upi' ? 'UPI' : 'Direct Bank Transfer',
        items: cart.map(item => ({
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          metal: item.metal
        }))
      };

      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      if (!res.ok) {
        throw new Error('Failed to create order on server');
      }

      const orderData = await res.json();
      const newOrderId = orderData.id;

      if (paymentMethod === 'upi') {
        setCurrentOrderId(newOrderId);
        // Construct deep link: upi://pay?pa=yourupi@oksbi&pn=Karthik%20Store&am=499&cu=INR&tn=Order12345
        const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${cartTotal}&cu=INR&tn=${encodeURIComponent('Order ' + newOrderId)}`;
        
        // Check if user is on mobile
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        if (isMobile) {
          // Open UPI app directly
          window.location.href = upiUrl;
        }
        // Show QR code / instructions modal on desktop, or as a fallback/confirmation on mobile
        setShowUpiModal(true);
      } else {
        setIsOrderPlaced(true);
        clearCart();
      }
    } catch (err) {
      console.error(err);
      setValidationError('An error occurred while placing the order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmUpiPayment = async () => {
    if (!currentOrderId) return;
    setLoadingPayment(true);
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${currentOrderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Pending Verification' })
      });

      if (res.ok) {
        setShowUpiModal(false);
        setIsOrderPlaced(true);
        clearCart();
      } else {
        alert('Could not verify payment status. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error verification failed.');
    } finally {
      setLoadingPayment(false);
    }
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  // If order was successfully placed
  if (isOrderPlaced) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        <main style={{ flex: '1', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className={styles.successScreen}>
            <div className={styles.successIconWrapper}>
              <CheckCircle size={40} />
            </div>
            <h1 className={styles.successTitle}>Thank You for Ordering!</h1>
            <p className={styles.successText}>
              We will check your payment and reach you shortly.
            </p>
            <div className={styles.successActions}>
              <Link href="/" className={styles.successHomeLink}>
                Back to Home
              </Link>
              <Link href="/shop" className={styles.shopLink}>
                Continue Shopping
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // If cart is empty
  if (cart.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        <main style={{ flex: '1', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className={styles.emptyState}>
            <div className={styles.successIconWrapper} style={{ backgroundColor: '#f9f9f9', color: '#888888' }}>
              <ShoppingBag size={40} />
            </div>
            <h1 className={styles.emptyTitle}>Your Cart is Empty</h1>
            <p className={styles.emptyText}>
              There are no jewelry items in your cart to checkout. Please visit our shop catalog to find exquisite jewelry pieces.
            </p>
            <Link href="/shop" className={styles.shopLink}>
              Return To Shop
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />

      <main style={{ flex: '1', backgroundColor: '#FFFFFF' }}>
        
        {/* Banner with Breadcrumb */}
        <section className={styles.shopBanner}>
          <div className={styles.bannerOverlay}>
            <div className={styles.bannerContent}>
              <nav className={styles.breadcrumb} aria-label="Breadcrumb">
                <Link href="/">Home</Link>
                <ChevronRight size={12} className={styles.separator} />
                <span className={styles.activeCrumb}>Checkout</span>
              </nav>
              <h1 className={styles.bannerTitle}>Checkout</h1>
            </div>
          </div>
        </section>

        {/* Checkout Main section */}
        <section className={styles.section}>
          <div className={styles.container}>
            
            {/* Returning customer prompt */}
            <div className={styles.loginPrompt}>
              Returning customer? <Link href="/profile?redirect=/checkout" className={styles.loginLink}>Click here to login</Link>
            </div>

            {validationError && (
              <div className={styles.loginPrompt} style={{ borderLeftColor: '#d93025', backgroundColor: '#fdf2f2', color: '#d93025' }}>
                {validationError}
              </div>
            )}

            <form onSubmit={handlePlaceOrder} className={styles.checkoutLayout}>
              
              {/* Left Column: Billing Details */}
              <div className={styles.leftColumn}>
                <h2 className={styles.billingTitle}>Billing details</h2>
                
                <div className={styles.form}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="firstName" className={styles.label}>First name <span className={styles.required}>*</span></label>
                      <input 
                        type="text" 
                        id="firstName"
                        className={styles.input} 
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="lastName" className={styles.label}>Last name (optional)</label>
                      <input 
                        type="text" 
                        id="lastName"
                        className={styles.input} 
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="phone" className={styles.label}>Phone <span className={styles.required}>*</span></label>
                    <input 
                      type="tel" 
                      id="phone"
                      className={styles.input} 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="email" className={styles.label}>Email Address (optional)</label>
                    <input 
                      type="email" 
                      id="email"
                      className={styles.input} 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="country" className={styles.label}>Country / Region <span className={styles.required}>*</span></label>
                    <select 
                      id="country" 
                      className={styles.select}
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                    >
                      <option value="India">India</option>
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Canada">Canada</option>
                      <option value="Australia">Australia</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="address" className={styles.label}>Address <span className={styles.required}>*</span></label>
                    <input 
                      type="text" 
                      id="address"
                      placeholder="House number, Area and Street"
                      className={styles.input} 
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="state" className={styles.label}>State / County <span className={styles.required}>*</span></label>
                      <select 
                        id="state" 
                        className={styles.select}
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                      >
                        <option value="Gujarat">Gujarat</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Delhi">Delhi</option>
                        <option value="Tamil Nadu">Tamil Nadu</option>
                        <option value="California">California</option>
                        <option value="London">London</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="postcode" className={styles.label}>Postcode / ZIP <span className={styles.required}>*</span></label>
                      <input 
                        type="text" 
                        id="postcode"
                        className={styles.input} 
                        value={postcode}
                        onChange={(e) => setPostcode(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {user && (
                    <div className={styles.formGroup} style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', marginTop: '0.5rem' }}>
                      <input 
                        type="checkbox" 
                        id="useSavedAddress" 
                        style={{ width: 'auto', margin: 0, cursor: 'pointer' }}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAddress(user.street_name || '');
                            setState(user.state || 'Gujarat');
                            setPostcode(user.pincode || '');
                          } else {
                            setAddress('');
                            setState('Gujarat');
                            setPostcode('');
                          }
                        }}
                      />
                      <label htmlFor="useSavedAddress" style={{ cursor: 'pointer', fontWeight: 500, fontSize: '0.9rem', color: '#1c1b19' }}>
                        Use my saved address
                      </label>
                    </div>
                  )}

                </div>
              </div>

              {/* Right Column: Checkout Breakdown */}
              <div className={styles.rightColumn}>
                
                {/* Dotted Eligibility Progress Box */}
                <div className={styles.eligibilityBox}>
                  <div className={styles.progressBarContainer}>
                    <div className={styles.progressBarFiller} style={{ width: '100%' }}></div>
                    <div className={styles.truckIconWrapper} style={{ left: 'calc(100% - 12px)' }}>
                      <Check size={12} />
                    </div>
                  </div>
                  <div className={styles.eligibilityText}>
                    Congratulations! Your order is eligible for FREE Delivery.
                  </div>
                </div>

                {/* Your Order box */}
                <div className={styles.orderBox}>
                  <h3 className={styles.orderTitle}>Your order</h3>
                  
                  {/* Cart Items List */}
                  <div className={styles.orderItemsList}>
                    {cart.map((item, idx) => (
                      <div key={`${item.product.id}-${idx}`} className={styles.orderItem}>
                        <div className={styles.itemInfo}>
                          <div className={styles.itemThumbWrapper}>
                            <img 
                              src={item.product.images[0]} 
                              alt={item.product.name} 
                              className={styles.itemThumb} 
                            />
                            <div className={styles.itemBadge}>{item.quantity}</div>
                          </div>
                          <span className={styles.itemName}>{item.product.name}</span>
                        </div>
                        <span className={styles.itemPrice}>₹{item.product.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  {/* Subtotal Row */}
                  <div className={styles.summaryRow}>
                    <span>Subtotal</span>
                    <span style={{ fontWeight: 600 }}>₹{cartSubtotal}</span>
                  </div>

                  {/* Shipping Section */}
                  <div className={styles.summaryRow}>
                    <span>Shipping</span>
                    <span style={{ fontWeight: 500, color: '#12b76a' }}>Free shipping</span>
                  </div>

                  {/* Total price Row */}
                  <div className={styles.totalPriceRow}>
                    <span>Total</span>
                    <span className={styles.totalPrice}>₹{cartTotal}</span>
                  </div>

                  {/* Payment Gateway Details */}
                  <div className={styles.paymentSection}>
                    <p style={{ fontWeight: 600, fontSize: '0.95rem', margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>
                      UPI Payment (Google Pay, PhonePe, Paytm, BHIM, etc.)
                    </p>
                    <p className={styles.paymentDesc} style={{ margin: 0 }}>
                      Pay seamlessly using any UPI app. Scan the QR code or pay directly with deep links (zero payment gateway commission).
                    </p>
                  </div>

                  {/* Place Order CTA */}
                  <button type="submit" className={styles.placeOrderBtn}>
                    Pay Now via UPI
                  </button>

                </div>

              </div>

            </form>
          </div>
        </section>

      </main>

      {/* UPI Payment Modal */}
      {showUpiModal && currentOrderId && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>UPI Payment</h3>
              <button className={styles.modalClose} onClick={() => setShowUpiModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <p className={styles.upiInstructions}>
                Scan the QR code below using any UPI App (Google Pay, PhonePe, Paytm, BHIM, etc.) to pay.
              </p>
              
              <div className={styles.qrContainer}>
                {/* Dynamic QR Code from public API using upi://pay link */}
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                    `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${cartTotal}&cu=INR&tn=${encodeURIComponent('Order ' + currentOrderId)}`
                  )}`} 
                  alt="UPI QR Code" 
                  className={styles.qrImage}
                />
              </div>

              {/* Mobile button to open UPI app directly */}
              <a 
                href={`upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${cartTotal}&cu=INR&tn=${encodeURIComponent('Order ' + currentOrderId)}`}
                className={styles.mobileUpiBtn}
              >
                <CreditCard size={18} />
                Pay via UPI App
              </a>
              
              <div className={styles.payDetailsCard}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Merchant:</span>
                  <span className={styles.detailVal}>{merchantName}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Amount:</span>
                  <span className={styles.detailVal} style={{ color: '#d93025' }}>₹{cartTotal}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Order ID:</span>
                  <span className={styles.detailVal}>#{currentOrderId}</span>
                </div>
                <div className={styles.detailRow} style={{ flexDirection: 'column', alignItems: 'stretch', gap: '4px', marginTop: '4px' }}>
                  <span className={styles.detailLabel}>UPI ID:</span>
                  <div className={styles.upiIdWrapper}>
                    <span className={styles.upiIdText}>{upiId}</span>
                    <button type="button" className={styles.copyBtn} onClick={handleCopyUpi}>
                      {copiedUpi ? (
                        <>
                          <Check size={12} style={{ display: 'inline', marginRight: '4px' }} />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy size={12} style={{ display: 'inline', marginRight: '4px' }} />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className={styles.stepsBlock}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#334155', fontWeight: 600 }}>How to complete payment:</h4>
                <ol className={styles.stepsList}>
                  <li>Open Google Pay, PhonePe, Paytm, or BHIM.</li>
                  <li>Scan the QR code, or click "Pay via UPI App" on mobile.</li>
                  <li>Authorize the payment of ₹{cartTotal} to {merchantName}.</li>
                  <li>After authorizing, click <strong>"Verify Payment"</strong> below to complete your order.</li>
                </ol>
              </div>
              
              <div className={styles.modalActions}>
                <button 
                  type="button" 
                  className={styles.verifyBtn} 
                  onClick={handleConfirmUpiPayment}
                  disabled={loadingPayment}
                >
                  {loadingPayment ? 'Verifying...' : 'Verify Payment'}
                </button>
                <button 
                  type="button" 
                  className={styles.cancelBtn} 
                  onClick={() => setShowUpiModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
