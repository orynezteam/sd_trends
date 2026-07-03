"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import ProductCard from '../../components/ProductCard/ProductCard';
import ProductListTable from '../../components/ProductCard/ProductListTable';
import QuickView from '../../components/QuickView/QuickView';
import { Product } from '../../data/products';
import { ChevronRight, Grid, List, SlidersHorizontal, CheckSquare, Square, ChevronDown } from 'lucide-react';
import styles from './shop.module.css';

function ShopContent() {
  const searchParams = useSearchParams();
  const subcategoryParam = searchParams.get('subcategory');
  const categoryParam = searchParams.get('category');

  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<string>('default');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [maxPossiblePrice, setMaxPossiblePrice] = useState<number>(5000);

  const itemsPerPage = 15;

  useEffect(() => {
    Promise.all([
      fetch('https://sd-trends.onrender.com/api/content/categories/hierarchy').then(r => r.json()),
      fetch('https://sd-trends.onrender.com/api/products').then(r => r.json())
    ]).then(([cats, prods]) => {
      setCategories(cats || []);
      setProducts(prods || []);
      
      let maxP = 100;
      if (prods && prods.length > 0) {
        maxP = Math.max(...prods.map((p: any) => p.price || 0));
      }
      setMaxPossiblePrice(Math.ceil(maxP / 50) * 50);
      setMaxPrice(Math.ceil(maxP / 50) * 50);

      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam.toLowerCase());
      setExpandedCategories(prev => [...prev, categoryParam.toLowerCase()]);
    }
    if (subcategoryParam) {
      setSelectedSubcategory(subcategoryParam);
    }
  }, [categoryParam, subcategoryParam]);

  const toggleCategoryExpand = (catId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCategories(prev => 
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  const handleCategorySelect = (catName: string) => {
    setSelectedCategory(catName.toLowerCase());
    setSelectedSubcategory(null);
    setCurrentPage(1);
  };

  const handleSubcategorySelect = (subName: string, parentCatName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCategory(parentCatName.toLowerCase());
    setSelectedSubcategory(subName);
    setCurrentPage(1);
  };

  const matchSubcategory = (product: any, subcategory: string): boolean => {
    if (product.subcategory) {
      return product.subcategory.toLowerCase() === subcategory.toLowerCase();
    }
    const name = product.name.toLowerCase();
    const desc = (product.description || '').toLowerCase();
    const sub = subcategory.toLowerCase();
    
    const keywords = sub.split(' ').filter(k => k !== 'and' && k !== 'or' && k.length > 2);
    if (keywords.length === 0) return name.includes(sub) || desc.includes(sub);
    
    return keywords.some(keyword => name.includes(keyword) || desc.includes(keyword));
  };

  // Filter Logic
  let filteredProducts = products.filter(p => {
    if (selectedCategory !== 'all') {
      if ((p.category || '').toLowerCase() !== selectedCategory) return false;
    }
    if (selectedSubcategory) {
      if (!matchSubcategory(p, selectedSubcategory)) return false;
    }
    if (p.price > maxPrice) return false;
    return true;
  });

  // Sort Logic
  if (sortOption === 'price-asc') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortOption === 'price-desc') {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortOption === 'rating') {
    filteredProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  // Pagination Logic
  const totalProducts = filteredProducts.length;
  const totalPages = Math.ceil(totalProducts / itemsPerPage);
  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'var(--font-roboto), sans-serif' }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid var(--accent-gold-light)',
          borderTopColor: 'var(--accent-gold)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className={styles.shopPage}>
      <Header />
      <main style={{ flex: '1', backgroundColor: '#FFFFFF' }}>
        
        <section className={styles.shopBanner}>
          <div className={styles.bannerOverlay}>
            <div className={styles.bannerContent}>
              <nav className={styles.breadcrumb} aria-label="Breadcrumb">
                <Link href="/">Home</Link>
                <ChevronRight size={12} className={styles.separator} />
                <span className={styles.activeCrumb}>Shop</span>
              </nav>
              <h1 className={styles.bannerTitle}>Shop</h1>
            </div>
          </div>
        </section>

        <section className={styles.shopMain}>
          <div className={styles.container}>
            <div className={styles.shopLayoutGrid}>
              
              <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
                <div className={styles.filterSection}>
                  <div 
                    className={styles.filterHeader}
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  >
                    <h2 className={styles.filterTitle}>Filter By Categories</h2>
                    <span className={styles.toggleIcon}>{isSidebarOpen ? '-' : '+'}</span>
                  </div>
                  
                  {isSidebarOpen && (
                    <ul className={styles.categoryList}>
                      <li 
                        className={`${styles.categoryItemWrapper}`}
                      >
                        <div 
                          className={`${styles.categoryItem} ${selectedCategory === 'all' ? styles.categoryActive : ''}`}
                          onClick={() => handleCategorySelect('all')}
                        >
                          <div className={styles.checkboxWrapper}>
                            {selectedCategory === 'all' ? (
                              <CheckSquare size={18} className={styles.checkedIcon} />
                            ) : (
                              <Square size={18} className={styles.uncheckedIcon} />
                            )}
                          </div>
                          <span className={styles.categoryLabel}>All Products</span>
                          <span className={styles.categoryCount}>({products.length})</span>
                        </div>
                      </li>

                      {categories.map((cat) => {
                        const catKey = cat.name.toLowerCase();
                        const isActive = selectedCategory === catKey;
                        const isExpanded = expandedCategories.includes(catKey);
                        const catProducts = products.filter(p => (p.category || '').toLowerCase() === catKey);
                        
                        return (
                          <li key={cat.id} className={styles.categoryItemWrapper}>
                            <div 
                              className={`${styles.categoryItem} ${isActive ? styles.categoryActive : ''}`}
                              onClick={() => handleCategorySelect(cat.name)}
                            >
                              <div className={styles.checkboxWrapper}>
                                {isActive && !selectedSubcategory ? (
                                  <CheckSquare size={18} className={styles.checkedIcon} />
                                ) : (
                                  <Square size={18} className={styles.uncheckedIcon} />
                                )}
                              </div>
                              <span className={styles.categoryLabel}>{cat.name}</span>
                              <span className={styles.categoryCount}>({catProducts.length})</span>
                              
                              {cat.subcategories && cat.subcategories.length > 0 && (
                                <button 
                                  className={styles.expandBtn}
                                  onClick={(e) => toggleCategoryExpand(catKey, e)}
                                >
                                  <ChevronDown size={14} className={`${styles.chevron} ${isExpanded ? styles.chevronUp : ''}`} />
                                </button>
                              )}
                            </div>

                            {isExpanded && cat.subcategories && (
                              <ul className={styles.subcategoryList}>
                                {cat.subcategories.map((sub: any) => {
                                  const isSubActive = selectedSubcategory === sub.name;
                                  // Estimate count
                                  const subCount = catProducts.filter(p => matchSubcategory(p, sub.name)).length;
                                  return (
                                    <li 
                                      key={sub.id}
                                      className={`${styles.subcategoryItem} ${isSubActive ? styles.subcategoryActive : ''}`}
                                      onClick={(e) => handleSubcategorySelect(sub.name, cat.name, e)}
                                    >
                                      <div className={styles.checkboxWrapper}>
                                        {isSubActive ? (
                                          <CheckSquare size={14} className={styles.checkedIcon} />
                                        ) : (
                                          <Square size={14} className={styles.uncheckedIcon} />
                                        )}
                                      </div>
                                      <span className={styles.subcategoryLabel}>{sub.name}</span>
                                      <span className={styles.categoryCount}>({subCount})</span>
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                <div className={styles.filterSection} style={{ marginTop: '2.5rem' }}>
                  <h2 className={styles.filterTitle}>Filter By Price</h2>
                  <div className={styles.priceFilterContainer}>
                    <input 
                      type="range" 
                      min="0" 
                      max={maxPossiblePrice} 
                      step="50"
                      value={maxPrice} 
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className={styles.priceSlider}
                      aria-label="Price range filter slider"
                    />
                    <div className={styles.priceRangeLabels}>
                      <span>₹0</span>
                      <span>Max: ₹{maxPrice}</span>
                    </div>
                  </div>
                </div>
              </aside>

              <div className={styles.catalogArea}>
                <div className={styles.controlsHeader}>
                  <div className={styles.resultsCount}>
                    Showing {totalProducts === 0 ? 0 : indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, totalProducts)} of {totalProducts} results
                  </div>
                  
                  <div className={styles.displayOptions}>
                    <div className={styles.sortWrapper}>
                      <select 
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value)}
                        className={styles.sortSelect}
                        aria-label="Sort products dropdown"
                      >
                        <option value="default">Default sorting</option>
                        <option value="price-asc">Sort by price: low to high</option>
                        <option value="price-desc">Sort by price: high to low</option>
                        <option value="rating">Sort by popularity/rating</option>
                      </select>
                      <ChevronDown size={14} className={styles.selectChevron} />
                    </div>

                    <div className={styles.viewToggles}>
                      <button 
                        onClick={() => setViewMode('grid')}
                        className={`${styles.toggleBtn} ${viewMode === 'grid' ? styles.toggleActive : ''}`}
                        aria-label="Grid layout view"
                      >
                        <Grid size={16} />
                      </button>
                      <button 
                        onClick={() => setViewMode('list')}
                        className={`${styles.toggleBtn} ${viewMode === 'list' ? styles.toggleActive : ''}`}
                        aria-label="List layout view"
                      >
                        <List size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {currentProducts.length === 0 ? (
                  <div className={styles.noResults}>
                    <h3>No products found</h3>
                    <p>There are no products matching this category filter.</p>
                  </div>
                ) : viewMode === 'list' ? (
                  <ProductListTable products={currentProducts} />
                ) : (
                  <div className={styles.productsGrid}>
                    {currentProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}

                {totalPages > 1 && (
                  <div className={styles.pagination}>
                    {Array.from({ length: totalPages }).map((_, idx) => (
                      <button
                        key={idx}
                        className={`${styles.pageBtn} ${currentPage === idx + 1 ? styles.pageActive : ''}`}
                        onClick={() => setCurrentPage(idx + 1)}
                      >
                        {idx + 1}
                      </button>
                    ))}
                    {currentPage < totalPages && (
                      <button
                        className={styles.pageBtn}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                      >
                        Next
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <QuickView />
    </div>
  );
}


export default function ShopPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'var(--font-roboto), sans-serif' }}>
        Loading Shop...
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
