"use client";

import React, { useState, useEffect } from 'react';
import styles from './HighlightsBanner.module.css';

interface HighlightsBannerProps {
  bannerData?: any;
}

export default function HighlightsBanner({ bannerData = null }: HighlightsBannerProps) {
  const data = bannerData;

  if (!data || Object.keys(data).length === 0) return null;

  return (
    <section 
      className={styles.section}
      style={{ backgroundImage: data.image_url ? `url(${data.image_url})` : 'none' }}
    >
      <div className="container h-full">
        <div className={styles.content}>
          <div className={styles.textBlock}>
            {data.subtitle && <span className={styles.subtitle}>{data.subtitle}</span>}
            <h2 
              className={styles.title}
              dangerouslySetInnerHTML={{ __html: data.title }}
            />
            {data.description && (
              <p className={styles.description}>
                {data.description}
              </p>
            )}
            {data.link_url && (
              <a href={data.link_url} className={styles.btn}>
                Shop Now
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
