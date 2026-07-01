"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import { useStore } from '../../context/StoreContext';
import { ChevronRight, Check, ShieldCheck, CreditCard, ShoppingBag, CheckCircle } from 'lucide-react';
import styles from './checkout.module.css';

export default function CheckoutPage() {
  const { cart, clearCart } = useStore();
  
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
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'cod'>('bank');
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Cart total calculations
  const cartSubtotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  
  let shippingCost = 0;
  if (shippingOption === 'pickup') shippingCost = 5;
  if (shippingOption === 'flat') shippingCost = 10;
  
  const cartTotal = cartSubtotal + shippingCost;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!firstName.trim() || !phone.trim() || !address.trim() || !postcode.trim()) {
      setValidationError('Please fill in all the required billing details (*).');
      window.scrollTo({ top: 300, behavior: 'smooth' });
      return;
    }
    
    setValidationError('');
    setIsOrderPlaced(true);
    clearCart();
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
            <h1 className={styles.successTitle}>Thank You!</h1>
            <p className={styles.successText}>
              Your order has been placed successfully. We have sent a confirmation email containing your order details and shipping tracking info.
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
              Returning customer? <span className={styles.loginLink}>Click here to login</span>
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
                  <div className={styles.summaryRow} style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                    <span className={styles.shippingTitle}>Shipping</span>
                    <div className={styles.shippingOptions}>
                      <label className={styles.shippingOption}>
                        <input 
                          type="radio" 
                          name="shipping" 
                          className={styles.radio}
                          checked={shippingOption === 'free'}
                          onChange={() => setShippingOption('free')}
                        />
                        <span>Free shipping</span>
                      </label>
                      <label className={styles.shippingOption}>
                        <input 
                          type="radio" 
                          name="shipping" 
                          className={styles.radio}
                          checked={shippingOption === 'pickup'}
                          onChange={() => setShippingOption('pickup')}
                        />
                        <span>Local pickup: ₹5</span>
                      </label>
                      <label className={styles.shippingOption}>
                        <input 
                          type="radio" 
                          name="shipping" 
                          className={styles.radio}
                          checked={shippingOption === 'flat'}
                          onChange={() => setShippingOption('flat')}
                        />
                        <span>Flat rate: ₹10</span>
                      </label>
                    </div>
                  </div>

                  {/* Total price Row */}
                  <div className={styles.totalPriceRow}>
                    <span>Total</span>
                    <span className={styles.totalPrice}>₹{cartTotal}</span>
                  </div>

                  {/* Payment Gateway Selections */}
                  <div className={styles.paymentSection}>
                    <div className={styles.paymentOption}>
                      <label className={styles.paymentLabel}>
                        <input 
                          type="radio" 
                          name="payment" 
                          className={styles.radio}
                          checked={paymentMethod === 'bank'}
                          onChange={() => setPaymentMethod('bank')}
                        />
                        <span>Direct Bank Transfer</span>
                      </label>
                      {paymentMethod === 'bank' && (
                        <p className={styles.paymentDesc}>
                          Make your payment directly into our bank account. Please use your Order ID as the payment reference. Your order will not be shipped until the funds have cleared in our account.
                        </p>
                      )}
                    </div>
                    <div className={styles.paymentOption}>
                      <label className={styles.paymentLabel}>
                        <input 
                          type="radio" 
                          name="payment" 
                          className={styles.radio}
                          checked={paymentMethod === 'cod'}
                          onChange={() => setPaymentMethod('cod')}
                        />
                        <span>Cash on Delivery</span>
                      </label>
                      {paymentMethod === 'cod' && (
                        <p className={styles.paymentDesc}>
                          Pay with cash upon delivery of your package to your doorstep.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Place Order CTA */}
                  <button type="submit" className={styles.placeOrderBtn}>
                    Place Order
                  </button>

                </div>

              </div>

            </form>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
