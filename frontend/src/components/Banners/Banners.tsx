"use client";

import React from 'react';
import styles from './Banners.module.css';

export default function Banners() {
  const [banners, setBanners] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetch('https://sd-trends.onrender.com/api/content/promotion-banners')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data)) {
          setBanners(data);
        }
      })
      .catch(err => console.error("Failed to load banners:", err));
  }, []);

  // Helper to find banner by ID (1=Left, 2=Top Right, 3=Bottom Right)
  const getBanner = (id: number) => {
    return banners.find(b => b.id === id) || {
      image_url: '',
      subtitle: '',
      title: '',
      link_url: '#'
    };
  };

  const leftBanner = getBanner(1);
  const topRightBanner = getBanner(2);
  const bottomRightBanner = getBanner(3);

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.grid}>
          {/* Left Column: Rings Banner */}
          <div className={`${styles.banner} ${styles.leftBanner}`}>
            <img 
              src={leftBanner.image_url || "/images/banner_rings.png"} 
              alt={leftBanner.subtitle} 
              className={styles.image} 
            />
            <div className={`${styles.overlay} ${styles.alignRight}`}>
              <div className={styles.textBlock}>
                <span className={styles.subtitle}>{leftBanner.subtitle}</span>
                <h3 
                  className={styles.title} 
                  dangerouslySetInnerHTML={{ __html: leftBanner.title || '' }} 
                />
                <a href={leftBanner.link_url || '#'} className={styles.link}>
                  SHOP NOW
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Stacked Banners */}
          <div className={styles.rightStack}>
            {/* Top Right: Bracelet Banner */}
            <div className={`${styles.banner} ${styles.rightBannerTop}`}>
              <img 
                src={topRightBanner.image_url || "/images/banner_bracelet_684.png"} 
                alt={topRightBanner.subtitle} 
                className={styles.image} 
              />
              <div className={`${styles.overlay} ${styles.alignRight}`}>
                <div className={styles.textBlock}>
                  <span className={styles.subtitle}>{topRightBanner.subtitle}</span>
                  <h3 
                    className={styles.title}
                    dangerouslySetInnerHTML={{ __html: topRightBanner.title || '' }}
                  />
                  <a href={topRightBanner.link_url || '#'} className={styles.link}>
                    SHOP NOW
                  </a>
                </div>
              </div>
            </div>

            {/* Bottom Right: Pendant Banner */}
            <div className={`${styles.banner} ${styles.rightBannerBottom}`}>
              <img 
                src={bottomRightBanner.image_url || "/images/banner_pendant.png"} 
                alt={bottomRightBanner.subtitle} 
                className={styles.image} 
              />
              <div className={`${styles.overlay} ${styles.alignLeft}`}>
                <div className={styles.textBlock}>
                  <span className={styles.subtitle}>{bottomRightBanner.subtitle}</span>
                  <h3 
                    className={styles.title}
                    dangerouslySetInnerHTML={{ __html: bottomRightBanner.title || '' }}
                  />
                  <a href={bottomRightBanner.link_url || '#'} className={styles.link}>
                    SHOP NOW
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
