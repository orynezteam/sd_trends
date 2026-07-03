"use client";

import React from 'react';
import Link from 'next/link';
import { Megaphone, Image as ImageIcon, Users, ShoppingBag, Briefcase, Layers, Box } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import styles from './AdminDashboard.module.css';

export default function AdminDashboardPage() {
  const { user } = useStore();

  const cards = [
    { title: 'Products', icon: <Box size={24} />, href: '/admin/products', description: 'Manage catalog, pricing, and Latest Products' },
    { title: 'Services', icon: <Briefcase size={24} />, href: '/admin/services', description: 'Manage the 4 services cards on the homepage' },
    { title: 'Promotion Banners', icon: <Layers size={24} />, href: '/admin/banners', description: 'Manage the 3 homepage grid banners' },
    { title: 'Promo Banner', icon: <Megaphone size={24} />, href: '/admin/promo', description: 'Update the top header announcement' },
    { title: 'Hero Slider', icon: <ImageIcon size={24} />, href: '/admin/hero', description: 'Manage homepage hero images' },
    { title: 'Orders', icon: <ShoppingBag size={24} />, href: '/admin/orders', description: 'Verify and manage customer payments and orders' },
    { title: 'Users', icon: <Users size={24} />, href: '/admin/users', description: 'Manage registered accounts and profiles' },
  ];

  return (
    <div className={styles.dashboard}>
      <div className={styles.welcomeBanner}>
        <h2>Welcome back, {user?.name || 'Admin'}!</h2>
        <p>Here is an overview of your store. Select a module below to start managing content.</p>
      </div>

      <div className={styles.grid}>
        {cards.map((card, idx) => (
          <Link key={idx} href={card.href} className={styles.card}>
            <div className={styles.cardIcon}>{card.icon}</div>
            <h3>{card.title}</h3>
            <p>{card.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
