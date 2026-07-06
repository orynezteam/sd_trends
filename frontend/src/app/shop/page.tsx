import React, { Suspense } from 'react';
import ShopClient from './ShopClient';
import { API_BASE_URL } from '@/config';

async function fetchShopData() {
  try {
    const [catsRes, prodsRes] = await Promise.all([
      fetch(`${API_BASE_URL}/content/categories/hierarchy`, { next: { revalidate: 300 } }),
      fetch(`${API_BASE_URL}/products`, { next: { revalidate: 300 } })
    ]);
    
    const categories = catsRes.ok ? await catsRes.json() : [];
    const products = prodsRes.ok ? await prodsRes.json() : [];
    
    return { categories, products };
  } catch (err) {
    console.error("Failed to fetch shop data", err);
    return { categories: [], products: [] };
  }
}

export default async function ShopPage() {
  const { categories, products } = await fetchShopData();

  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'var(--font-roboto), sans-serif' }}>
        Loading Shop...
      </div>
    }>
      <ShopClient initialCategories={categories} initialProducts={products} />
    </Suspense>
  );
}
