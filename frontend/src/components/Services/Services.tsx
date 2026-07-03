"use client";

import React from 'react';
import { Truck, PiggyBank, Percent, Headphones } from 'lucide-react';
import styles from './Services.module.css';

import * as Icons from 'lucide-react';

export default function Services() {
  const [services, setServices] = React.useState<any[]>([]);
  const [scrollProgress, setScrollProgress] = React.useState(0);
  const gridRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    fetch('https://sd-trends.onrender.com/api/content/services')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data)) {
          setServices(data);
        }
      })
      .catch(err => console.error("Failed to load services:", err));
  }, []);

  const renderIcon = (iconName: string) => {
    const IconComponent = Icons[iconName as keyof typeof Icons] as React.ElementType;
    if (!IconComponent) return <Icons.HelpCircle size={36} strokeWidth={1.5} />;
    return <IconComponent size={36} strokeWidth={1.5} />;
  };

  const handleScroll = () => {
    if (gridRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = gridRef.current;
      const totalScroll = scrollWidth - clientWidth;
      const progress = totalScroll > 0 ? (scrollLeft / totalScroll) * 100 : 0;
      setScrollProgress(progress);
    }
  };

  return (
    <section className={styles.section}>
      <div className="container">
        <div 
          ref={gridRef}
          onScroll={handleScroll}
          className={styles.grid}
        >
          {services.map((srv, idx) => (
            <div key={srv.id || idx} className={styles.item}>
              <div className={styles.iconWrapper}>{renderIcon(srv.icon_name)}</div>
              <div className={styles.info}>
                <h4 className={styles.title}>{srv.title}</h4>
                <p className={styles.desc}>{srv.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Slider Progress Bar for Mobile */}
        <div className={styles.progressBarWrapper}>
          <div 
            className={styles.progressBar} 
            style={{ left: `${scrollProgress * 0.7}%` }} 
          />
        </div>
      </div>
    </section>
  );
}
