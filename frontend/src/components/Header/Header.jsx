"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '../../context/StoreContext';
import { Search, Heart, ShoppingBag, Sun, Moon, Menu, X, Trash2 } from 'lucide-react';
import styles from './Header.module.css';

export default function Header() {
  const {
    cart,
    wishlist,
    theme,
    toggleTheme,
    removeFromCart,
    openQuickView
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showCartDropdown, setShowCartDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const searchRef = useRef(null);
  const cartRef = useRef(null);

  // Debounced/Live search fetch from Flask Backend
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/products/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
        }
      } catch (err) {
        console.error("Failed to search products:", err);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle clicking outside elements to close dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        setShowCartDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Calculate cart metrics
  const cartTotalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotalPrice = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);

  return (
    <header className={styles.header}>
      {/* Top Announcement Bar */}
      <div className={styles.topbar}>
        <div className="container">
          <div className={styles.topbarContent}>
            <div className={styles.topbarRight}>
              <a href="#" className={styles.topbarLink}>USD ($)</a>
              <a href="#" className={styles.topbarLink}>English</a>
              <a href="#" className={styles.topbarLink}>Track Order</a>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Bar */}
      <div className="container">
        <div className={styles.middleHeader}>
          {/* Mobile Menu Icon */}
          <button 
            className={`${styles.actionButton} ${styles.mobileMenuToggle}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Search Wrapper */}
          <div className={styles.searchWrapper} ref={searchRef}>
            <input
              type="text"
              placeholder="Search fine jewelry..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => setShowSearchDropdown(true)}
            />
            <Search size={18} className={styles.searchIcon} />

            {/* Live Search Dropdown */}
            {showSearchDropdown && searchQuery.trim() !== '' && (
              <div className={styles.searchResultsDropdown}>
                {searchResults.length > 0 ? (
                  searchResults.map((product) => (
                    <div 
                      key={product.id} 
                      className={styles.searchResultItem}
                      onClick={() => {
                        openQuickView(product);
                        setShowSearchDropdown(false);
                        setSearchQuery('');
                      }}
                    >
                      <img 
                        src={product.images[0]} 
                        alt={product.name} 
                        className={styles.resultImage} 
                      />
                      <div className={styles.resultInfo}>
                        <div className={styles.resultName}>{product.name}</div>
                        <div className={styles.resultPrice}>${product.price}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.noResults}>No jewelry pieces found</div>
                )}
              </div>
            )}
          </div>

          {/* Centered Logo */}
          <div className={styles.logoContainer}>
            <Link href="/" className={styles.logo}>
              SD Trends Design
              <span className={styles.logoSub}>Jubilee Collection</span>
            </Link>
          </div>

          {/* Actions Row */}
          <div className={styles.actions}>
            {/* Theme Toggle Button */}
            <button 
              className={styles.actionButton} 
              onClick={toggleTheme} 
              aria-label="Toggle theme mode"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {/* Wishlist Button */}
            <Link href="#" className={styles.actionButton} aria-label="Wishlist">
              <Heart size={20} />
              {wishlist.length > 0 && <span className={styles.badge}>{wishlist.length}</span>}
            </Link>

            {/* Cart Button */}
            <div className="relative" ref={cartRef} style={{ position: 'relative' }}>
              <button 
                className={styles.actionButton} 
                onClick={() => setShowCartDropdown(!showCartDropdown)}
                aria-label="Cart"
              >
                <ShoppingBag size={20} />
                {cartTotalItems > 0 && <span className={styles.badge}>{cartTotalItems}</span>}
              </button>

              {/* Cart Dropdown Menu */}
              {showCartDropdown && (
                <div className={styles.cartDropdown}>
                  <div className={styles.cartHeader}>
                    <span>Shopping Cart</span>
                    <span>{cartTotalItems} Items</span>
                  </div>

                  <div className={styles.cartList}>
                    {cart.length > 0 ? (
                      cart.map((item, idx) => (
                        <div key={`${item.product.id}-${item.metal}-${idx}`} className={styles.cartDropdownItem}>
                          <img 
                            src={item.product.images[0]} 
                            alt={item.product.name} 
                            className={styles.cartItemImage} 
                          />
                          <div className={styles.cartItemDetails}>
                            <div className={styles.cartItemName}>{item.product.name}</div>
                            <div className={styles.cartItemMeta}>
                              Qty: {item.quantity} | {item.metal.split(' ')[0]}
                            </div>
                            <div className={styles.cartItemPrice}>
                              ${item.product.price * item.quantity}
                            </div>
                          </div>
                          <button 
                            className={styles.removeCartItem}
                            onClick={() => removeFromCart(item.product.id, item.metal)}
                            aria-label="Remove item"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className={styles.emptyCart}>Your shopping cart is empty</div>
                    )}
                  </div>

                  {cart.length > 0 && (
                    <>
                      <div className={styles.cartTotal}>
                        <span>Total:</span>
                        <span>${cartTotalPrice}</span>
                      </div>
                      <button 
                        className={styles.cartCheckoutBtn}
                        onClick={() => {
                          alert("Proceeding to checkout with total: $" + cartTotalPrice);
                          setShowCartDropdown(false);
                        }}
                      >
                        Checkout
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Nav Links Bar */}
      <nav className={styles.navbar}>
        <div className="container">
          <ul className={styles.navLinks}>
            <li>
              <Link href="/" className={`${styles.navLink} ${styles.activeNavLink}`}>
                Home
              </Link>
            </li>
            <li><Link href="#categories" className={styles.navLink}>Shop Categories</Link></li>
            <li><Link href="#featured" className={styles.navLink}>Featured</Link></li>
            <li><Link href="#deal" className={styles.navLink}>Deal of the Day</Link></li>
            <li><Link href="#blog" className={styles.navLink}>Editorial Blog</Link></li>
            <li><Link href="#newsletter" className={styles.navLink}>Newsletter</Link></li>
          </ul>
        </div>
      </nav>

      {/* Mobile Menu Dropdown Overlay */}
      {mobileMenuOpen && (
        <div className="animate-fade-in" style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          width: '100%',
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-color)',
          padding: '1.5rem',
          zIndex: 90,
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          boxShadow: 'var(--card-shadow)'
        }}>
          <Link href="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <Link href="#categories" onClick={() => setMobileMenuOpen(false)}>Shop Categories</Link>
          <Link href="#featured" onClick={() => setMobileMenuOpen(false)}>Featured</Link>
          <Link href="#deal" onClick={() => setMobileMenuOpen(false)}>Deal of the Day</Link>
          <Link href="#blog" onClick={() => setMobileMenuOpen(false)}>Editorial Blog</Link>
          <Link href="#newsletter" onClick={() => setMobileMenuOpen(false)}>Newsletter</Link>
        </div>
      )}
    </header>
  );
}
