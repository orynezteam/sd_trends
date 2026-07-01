"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Image as ImageIcon, Megaphone, Store, LogOut, Users, Briefcase, Layers, Box, List, Package, Layout, MessageSquare, Map, Mail, HelpCircle } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import styles from './AdminLayout.module.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useStore();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Basic client-side protection
  useEffect(() => {
    if (user === null) return; // Still loading or no user
    if (user.is_admin !== true) {
      router.push('/');
    }
  }, [user, router]);

  if (!user || !user.is_admin) {
    return <div className={styles.loadingState}>Loading Admin Dashboard...</div>;
  }

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard size={20} /> },
    { label: 'Products', href: '/admin/products', icon: <Package size={20} /> },
    { label: 'Product Categories', href: '/admin/categories', icon: <List size={20} /> },
    { label: 'Users', href: '/admin/users', icon: <Users size={20} /> },
    { label: 'Services', href: '/admin/services', icon: <Briefcase size={20} /> },
    { label: 'Testimonials', href: '/admin/testimonials', icon: <Megaphone size={20} /> },
    { label: 'Top Deals', href: '/admin/top-deals', icon: <Megaphone size={20} /> },
    { label: 'Messages', href: '/admin/messages', icon: <MessageSquare size={20} /> },
    { label: 'Newsletter', href: '/admin/newsletter', icon: <Mail size={20} /> },
    { label: 'FAQs Setup', href: '/admin/faqs', icon: <HelpCircle size={20} /> },
    { label: 'Contact Setup', href: '/admin/contact-setup', icon: <Map size={20} /> },
    { label: 'Footer Setup', href: '/admin/footer', icon: <Layout size={20} /> },
    { label: 'Promotion Banners', href: '/admin/banners', icon: <Layers size={20} /> },
    { label: 'Mid-Page Banners', href: '/admin/mid-banners', icon: <Box size={20} /> },
    { label: 'Promo Banner', href: '/admin/promo', icon: <Megaphone size={20} /> },
    { label: 'Hero Slider', href: '/admin/hero', icon: <ImageIcon size={20} /> },
  ];

  return (
    <div className={styles.adminLayout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2>SD-Trends</h2>
          <span className={styles.adminBadge}>Admin</span>
        </div>
        
        <nav className={styles.sidebarNav}>
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={`${styles.navItem} ${pathname === item.href ? styles.active : ''}`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className={styles.mainContent}>
        {/* Top Header */}
        <header className={styles.topHeader}>
          <div className={styles.topHeaderLeft}>
            <h1 className={styles.pageTitle}>
              {navItems.find(i => i.href === pathname)?.label || 'Admin Panel'}
            </h1>
          </div>
          <div className={styles.topHeaderRight}>
            <Link href="/" className={styles.viewStoreBtn}>
              <Store size={18} />
              View Store
            </Link>
            <div className={styles.userProfile}>
              <span>{user.name || user.email}</span>
            </div>
            <button onClick={handleLogout} className={styles.logoutBtn} title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className={styles.pageWrapper}>
          {children}
        </main>
      </div>
    </div>
  );
}
