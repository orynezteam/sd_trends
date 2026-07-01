"use client";

import React, { useState, useEffect } from 'react';
import styles from './HighlightsBanner.module.css';

export default function HighlightsBanner() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/content/mid_banners/highlights')
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
