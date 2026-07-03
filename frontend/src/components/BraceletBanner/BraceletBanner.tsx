"use client";

import React, { useState, useEffect } from 'react';
import styles from './BraceletBanner.module.css';

export default function BraceletBanner() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('https://sd-trends.onrender.com/api/content/mid_banners/bracelet')
      .then(res => res.json())
      .then(resData => {
        if (!resData.error) setData(resData);
      })
      .catch(console.error);
  }, []);

  if (!data) return null;

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
