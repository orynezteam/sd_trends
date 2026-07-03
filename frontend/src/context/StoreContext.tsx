"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PRODUCTS } from '../data/products';

export interface StoreContextValue {
  cart: any[];
  wishlist: any[];
  theme: string;
  toggleTheme: () => void;
  addToCart: (product: any, quantity?: number, metal?: string) => void;
  removeFromCart: (productId: any, metal: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: any) => void;
  activeQuickViewProduct: any;
  openQuickView: (product: any) => void;
  closeQuickView: () => void;
  user: any;
  login: (userData: any) => void;
  logout: () => void;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [theme, setTheme] = useState('light');
  const [activeQuickViewProduct, setActiveQuickViewProduct] = useState(null);
  const [notification, setNotification] = useState<{ id: number; title: string; message: string; type: 'success' | 'info' | 'wishlist' } | null>(null);
  const [user, setUser] = useState(null);

  // Load initial state from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('sdt_cart');
    if (savedCart) {
      try { setCart(JSON.parse(savedCart)); } catch (e) { console.error(e); }
    }

    const savedWishlist = localStorage.getItem('sdt_wishlist');
    if (savedWishlist) {
      try { setWishlist(JSON.parse(savedWishlist)); } catch (e) { console.error(e); }
    }

    const savedTheme = localStorage.getItem('sdt_theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    const savedUser = localStorage.getItem('sdt_user');
    if (savedUser) {
      try { setUser(JSON.parse(savedUser)); } catch (e) { console.error(e); }
    }
  }, []);

  // Save state to localStorage when it changes
  const saveCartToStorage = (newCart) => {
    setCart(newCart);
    localStorage.setItem('sdt_cart', JSON.stringify(newCart));
  };

  const saveWishlistToStorage = (newWishlist) => {
    setWishlist(newWishlist);
    localStorage.setItem('sdt_wishlist', JSON.stringify(newWishlist));
  };

  // Helper to show notification
  const showNotification = (title: string, message: string, type: 'success' | 'info' | 'wishlist' = 'success') => {
    setNotification({ id: Date.now(), title, message, type });
  };

  // Auto-dismiss notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Toggle Theme
  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('sdt_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  // Add to Cart
  const addToCart = (product, quantity = 1, metal = '18k Yellow Gold') => {
    const existingIndex = cart.findIndex(
      (item) => item.product.id === product.id && item.metal === metal
    );

    let newCart = [...cart];
    if (existingIndex > -1) {
      newCart[existingIndex].quantity += quantity;
    } else {
      newCart.push({ product, quantity, metal });
    }
    saveCartToStorage(newCart);
    showNotification('Added to Cart', product.name, 'success');
  };

  // Remove from Cart
  const removeFromCart = (productId, metal) => {
    const newCart = cart.filter(
      (item) => !(item.product.id === productId && item.metal === metal)
    );
    saveCartToStorage(newCart);
  };

  // Clear Cart
  const clearCart = () => {
    saveCartToStorage([]);
  };

  // Toggle Wishlist
  const toggleWishlist = async (productId) => {
    let newWishlist = [...wishlist];
    const index = newWishlist.indexOf(productId);
    
    const name = 'Item';
    
    if (index > -1) {
      newWishlist.splice(index, 1);
      showNotification('Removed from Wishlist', name, 'info');
    } else {
      newWishlist.push(productId);
      showNotification('Added to Wishlist', name, 'wishlist');
    }
    setWishlist(newWishlist);
    localStorage.setItem('sdt_wishlist', JSON.stringify(newWishlist));

    if (user) {
      try {
        await fetch(`https://sd-trends.onrender.com/api/users/${user.id}/wishlist`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wishlist: newWishlist })
        });
      } catch (e) {
        console.error("Failed to sync wishlist", e);
      }
    }
  };

  // Quick View controls
  const openQuickView = (product) => {
    setActiveQuickViewProduct(product);
  };

  const closeQuickView = () => {
    setActiveQuickViewProduct(null);
  };

  // Auth controls
  const login = async (userData) => {
    setUser(userData);
    localStorage.setItem('sdt_user', JSON.stringify(userData));

    // Sync wishlist from backend merging with local
    let mergedWishlist = [...wishlist];
    if (userData.wishlist && Array.isArray(userData.wishlist)) {
      userData.wishlist.forEach((id: string) => {
        if (!mergedWishlist.includes(id)) {
          mergedWishlist.push(id);
        }
      });
    }

    setWishlist(mergedWishlist);
    localStorage.setItem('sdt_wishlist', JSON.stringify(mergedWishlist));
    
    try {
      await fetch(`https://sd-trends.onrender.com/api/users/${userData.id}/wishlist`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wishlist: mergedWishlist })
      });
    } catch (e) {
      console.error(e);
    }

    showNotification('Welcome back', `Signed in as ${userData.name || userData.email}`, 'success');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sdt_user');
    showNotification('Signed out', 'You have been successfully signed out.', 'info');
  };

  return (
    <StoreContext.Provider
      value={{
        cart,
        wishlist,
        theme,
        toggleTheme,
        addToCart,
        removeFromCart,
        clearCart,
        toggleWishlist,
        activeQuickViewProduct,
        openQuickView,
        closeQuickView,
        user,
        login,
        logout,
      }}
    >
      {children}
      {notification && (
        <div key={notification.id} className="global-toast-notification">
          <div className="toast-icon-wrapper">
            {notification.type === 'success' && (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            )}
            {notification.type === 'wishlist' && (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
              </svg>
            )}
            {notification.type === 'info' && (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            )}
          </div>
          <div className="toast-content">
            <div className="toast-title">{notification.title}</div>
            <div className="toast-message">{notification.message}</div>
          </div>
        </div>
      )}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
