"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

const StoreContext = createContext();

export function StoreProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [theme, setTheme] = useState('light');
  const [activeQuickViewProduct, setActiveQuickViewProduct] = useState(null);

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
  const toggleWishlist = (productId) => {
    let newWishlist = [...wishlist];
    const index = newWishlist.indexOf(productId);
    if (index > -1) {
      newWishlist.splice(index, 1);
    } else {
      newWishlist.push(productId);
    }
    saveWishlistToStorage(newWishlist);
  };

  // Quick View controls
  const openQuickView = (product) => {
    setActiveQuickViewProduct(product);
  };

  const closeQuickView = () => {
    setActiveQuickViewProduct(null);
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
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}
