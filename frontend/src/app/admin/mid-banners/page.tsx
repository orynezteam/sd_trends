"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Edit2 } from 'lucide-react';
import styles from '../banners/AdminBanners.module.css';
import tableStyles from '../products/AdminProducts.module.css';
import { API_BASE_URL, BASE_URL } from '@/config';


export default function AdminMidBanners() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/content/mid_banners`)
      .then(res => res.json())
      .then(data => {
        setBanners(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className={styles.loading}>Loading banners...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2>Mid-Page Banners</h2>
          <p className={styles.description}>Manage the full-width banners on the homepage.</p>
        </div>
      </div>

      <div className={tableStyles.tableContainer}>
        <table className={tableStyles.table}>
          <thead>
            <tr>
              <th>Image</th>
              <th>Banner Slot</th>
              <th>Title</th>
              <th>Subtitle</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {banners.length > 0 ? (
              banners.map(b => (
                <tr key={b.slot_name}>
                  <td>
                    {b.image_url ? (
                      <img src={b.image_url} alt={b.slot_name} className={tableStyles.productThumbnail} />
                    ) : (
                      <div className={tableStyles.noImageThumbnail}>No Img</div>
                    )}
                  </td>
                  <td style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                    {b.slot_name} Banner
                  </td>
                  <td><span dangerouslySetInnerHTML={{ __html: b.title }} /></td>
                  <td>{b.subtitle}</td>
                  <td>
                    <div className={tableStyles.actions}>
                      <Link href={`/admin/mid-banners/${b.slot_name}`} className={tableStyles.iconBtn} title="Edit Banner">
                        <Edit2 size={18} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No mid-page banners found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
