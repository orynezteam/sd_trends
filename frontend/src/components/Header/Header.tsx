"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useStore } from '../../context/StoreContext';
import { Search, Heart, ShoppingCart, User, ChevronDown, Sun, Moon, Menu, X, Trash2 } from 'lucide-react';
import styles from './Header.module.css';
import { API_BASE_URL, BASE_URL } from '@/config';


export default function Header() {
  const pathname = usePathname();
  const {
    cart,
    wishlist,
    theme,
    toggleTheme,
    removeFromCart,
    openQuickView,
    user
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [showCartDropdown, setShowCartDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const [promo, setPromo] = useState<any>(null);

  const searchRef = useRef(null);
  const cartRef = useRef(null);

  // Fetch Category Hierarchy
  useEffect(() => {
    fetch(`${API_BASE_URL}/content/categories/hierarchy`)
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error(err));
  }, []);

  // Debounced/Live search fetch from Flask Backend
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/products/search?q=${encodeURIComponent(searchQuery)}`);
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

  // Fetch Promo Banner
  useEffect(() => {
    fetch(`${API_BASE_URL}/content/promo`)
      .then(res => res.json())
      .then(data => {
        if (data && data.is_active) {
          setPromo(data);
        }
      })
      .catch(err => console.error("Failed to load promo:", err));
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
            <div className={styles.topbarLeft}>
              <span>Welcome to SD Trends</span>
            </div>
            <div className={styles.topbarRight}>
              {user?.is_admin && (
                <>
                  <Link href="/admin" className={styles.adminPanelLink}>Admin Panel</Link>
                  <span className={styles.divider}>|</span>
                </>
              )}
              <Link href="#track-order" className={styles.topbarLink}>Track Order</Link>
              <span className={styles.divider}>|</span>
              <Link href="/contact-us" className={`${styles.topbarLink} ${pathname === '/contact-us' ? styles.activeTopbarLink : ''}`}>Contact Us</Link>
              <span className={styles.divider}>|</span>
              <Link href="/faqs" className={`${styles.topbarLink} ${pathname === '/faqs' ? styles.activeTopbarLink : ''}`}>FAQs</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="container">
        <div className={styles.mainHeader}>
          {/* Mobile Menu Icon */}
          <button 
            className={`${styles.actionButton} ${styles.mobileMenuToggle}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Logo (left-aligned) */}
          <div className={styles.logoContainer}>
            <Link href="/" className={styles.logo}>
              SD-Trends
            </Link>
          </div>

          {/* Nav Menu (center-aligned) */}
          <nav className={styles.navbar}>
            <ul className={styles.navLinks}>
              <li>
                <Link href="/" className={`${styles.navLink} ${pathname === '/' ? styles.activeNavLink : ''}`}>
                  HOME
                </Link>
              </li>
              <li>
                <Link href="/shop" className={`${styles.navLink} ${pathname === '/shop' ? styles.activeNavLink : ''}`}>
                  SHOP
                </Link>
              </li>
              <li className={styles.navItemDropdown}>
                <Link href="/shop" className={styles.navLink}>
                  CATEGORIES <span className={styles.saleBadge}>SALE</span> <ChevronDown size={14} className={styles.chevron} />
                </Link>
                {/* Mega Dropdown menu */}
                <div className={styles.megaDropdown}>
                  <div className={styles.megaDropdownContainer}>
                    {categories.map((cat, idx) => (
                      <div key={cat.id} className={styles.megaColumn}>
                        <h3 className={styles.megaTitle}>{cat.name}</h3>
                        <ul className={styles.megaList}>
                          {cat.subcategories.map((sub: any) => (
                            <li key={sub.id}>
                              <Link href={`/shop?subcategory=${encodeURIComponent(sub.name)}`}>
                                {sub.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </li>
              <li>
                <Link href="/top-deals" className={`${styles.navLink} ${pathname === '/top-deals' ? styles.activeNavLink : ''}`}>
                  TOP DEALS
                </Link>
              </li>
            </ul>
          </nav>

          {/* Actions Row (right-aligned) */}
          <div className={styles.actions}>
            {/* Search Icon & Toggleable Dropdown */}
            <div className={styles.searchContainer} ref={searchRef}>
              <button 
                className={styles.actionButton} 
                onClick={() => setShowSearchDropdown(!showSearchDropdown)}
                aria-label="Search"
              >
                <Search size={20} />
              </button>

              {showSearchDropdown && (
                <div className={styles.searchDropdown}>
                  <div className={styles.searchFieldWrapper}>
                    <input
                      type="text"
                      placeholder="Search fine jewelry..."
                      className={styles.searchInput}
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                      }}
                      autoFocus
                    />
                    <Search size={16} className={styles.searchInnerIcon} />
                  </div>

                  {/* Live Search Results */}
                  {searchQuery.trim() !== '' && (
                    <div className={styles.searchResultsContainer}>
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
                              <div className={styles.resultPrice}>₹{product.price}</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className={styles.noResults}>No jewelry pieces found</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Account Icon */}
            <Link href="/profile" className={styles.actionButton} aria-label="Account">
              <User size={20} />
            </Link>

            {/* Wishlist Button */}
            <Link href="/wishlist" className={`${styles.actionButton} ${styles.headerWishlist}`} aria-label="Wishlist">
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
                <ShoppingCart size={20} />
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
                            <div className={styles.cartItemPrice}>₹{item.product.price * item.quantity}
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
                        <span>₹{cartTotalPrice}</span>
                      </div>
                      <Link 
                        href="/checkout"
                        className={styles.cartCheckoutBtn}
                        onClick={() => setShowCartDropdown(false)}
                      >
                        Checkout
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown Overlay */}
      {mobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <Link 
            href="/" 
            className={`${styles.mobileNavLink} ${pathname === '/' ? styles.mobileNavActive : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            HOME
          </Link>
          <Link 
            href="/shop" 
            className={`${styles.mobileNavLink} ${pathname === '/shop' ? styles.mobileNavActive : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            SHOP
          </Link>
          <button 
            type="button"
            className={styles.mobileNavLink}
            onClick={() => setMobileCategoriesOpen(!mobileCategoriesOpen)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '0.5rem' }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              CATEGORIES <span className={styles.saleBadge}>SALE</span>
            </span>
            <ChevronDown size={14} style={{ 
              transform: mobileCategoriesOpen ? 'rotate(180deg)' : 'none', 
              transition: 'transform var(--transition-fast)' 
            }} />
          </button>

          {mobileCategoriesOpen && (
            <div className={styles.mobileCategoriesDropdown}>
              {categories.map((cat, idx) => (
                <div key={cat.id} className={styles.mobileCategoryGroup}>
                  <h4 className={styles.mobileCategoryTitle}>{cat.name}</h4>
                  <ul className={styles.mobileCategoryList}>
                    {cat.subcategories.map((sub: any) => (
                      <li key={sub.id}>
                        <Link 
                          href={`/shop?subcategory=${encodeURIComponent(sub.name)}`}
                          onClick={() => {
                            setMobileMenuOpen(false);
                            setMobileCategoriesOpen(false);
                          }}
                          className={styles.mobileCategoryLink}
                        >
                          {sub.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
          <Link 
            href="/top-deals" 
            className={`${styles.mobileNavLink} ${pathname === '/top-deals' ? styles.mobileNavActive : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            TOP DEALS
          </Link>
          <Link 
            href="/wishlist" 
            className={`${styles.mobileNavLink} ${pathname === '/wishlist' ? styles.mobileNavActive : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            WISHLIST {wishlist.length > 0 && `(${wishlist.length})`}
          </Link>
          <Link 
            href="/checkout" 
            className={`${styles.mobileNavLink} ${pathname === '/checkout' ? styles.mobileNavActive : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            CART / CHECKOUT {cartTotalItems > 0 && `(${cartTotalItems})`}
          </Link>
          <Link 
            href="/profile" 
            className={`${styles.mobileNavLink} ${pathname === '/profile' ? styles.mobileNavActive : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            MY ACCOUNT {user ? `(${user.name || user.email})` : ''}
          </Link>
          <hr className={styles.mobileNavDivider} />
          <Link 
            href="/shop" 
            className={styles.mobileNavLink}
            onClick={() => setMobileMenuOpen(false)}
          >
            Track Order
          </Link>
          <Link 
            href="/contact-us" 
            className={`${styles.mobileNavLink} ${pathname === '/contact-us' ? styles.mobileNavActive : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Contact Us
          </Link>
          <Link 
            href="/faqs" 
            className={`${styles.mobileNavLink} ${pathname === '/faqs' ? styles.mobileNavActive : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            FAQs
          </Link>
        </div>
      )}
    </header>
  );
}
