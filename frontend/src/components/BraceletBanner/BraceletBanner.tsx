"use client";

import React, { useState, useEffect } from 'react';
import styles from './BraceletBanner.module.css';

interface BraceletBannerProps {
  bannerData?: any;
}

export default function BraceletBanner({ bannerData = null }: BraceletBannerProps) {
  const data = bannerData;

  if (!data || Object.keys(data).length === 0) return null;

  return (
    <section 
      className={styles.section}
      style={{ backgroundImage: data.image_url ? `url(${data.image_url})` : 'none' }}
    >
      <div className="container">
        <div className={styles.content}>
          <div className={styles.textBlock}>
            {data.subtitle && <span className={styles.subtitle}>{data.subtitle}</span>}
            <h2 
              className={styles.title} 
              dangerouslySetInnerHTML={{ __html: data.title }} 
            />
            {data.link_url && (
              <a href={data.link_url} className={styles.link}>
                Shop Now
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
