import React from 'react';
import { Gem } from 'lucide-react';
import styles from './JewelryLoader.module.css';

interface JewelryLoaderProps {
  text?: string;
  fullScreen?: boolean;
}

export const JewelryLoader: React.FC<JewelryLoaderProps> = ({ 
  text = 'Curating...', 
  fullScreen = false 
}) => {
  return (
    <div 
      className={styles.loaderContainer} 
      style={fullScreen ? { height: '100vh', minHeight: '100vh' } : {}}
    >
      <div className={styles.loaderWrapper}>
        <div className={styles.spinningRing}></div>
        <Gem className={styles.diamondIcon} size={28} strokeWidth={1.5} />
      </div>
      {text && <div className={styles.loadingText}>{text}</div>}
    </div>
  );
};
