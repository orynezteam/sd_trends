'use client';

import React, { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './Categories.module.css';

interface CategoryItem {
  id: string;
  name: string;
  count: string;
  imageUrl: string;
}

const CATEGORIES: CategoryItem[] = [
  {
    id: 'earrings',
    name: 'Drops Earring',
    count: '8',
    imageUrl: '/images/category_drops_earring.png',
  },
  {
    id: 'necklaces',
    name: 'Butterfly Pendant',
    count: '2',
    imageUrl: '/images/category_butterfly_pendant.png',
  },
  {
    id: 'necklaces',
    name: 'Flower Necklace',
    count: '4',
    imageUrl: '/images/category_flower_necklace.png',
  },
  {
    id: 'rings',
    name: 'Rose Gold Rings',
    count: '6',
    imageUrl: '/images/category_rose_gold_rings.png',
  },
  {
    id: 'rings',
    name: 'Solitaire Rings',
    count: '7',
    imageUrl: '/images/category_solitaire_rings.png',
  },
  {
    id: 'rings',
    name: 'Cocktail Rings',
    count: '5',
    imageUrl: '/images/category_cocktail_rings.png',
  },
];

interface CategoriesProps {
  onSelectCategory?: (categoryId: string) => void;
}

export default function CCategories({ onSelectCategory }: CategoriesProps) {
  const router = useRouter();
  const sliderRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch('http://localhost:5000/api/content/categories/home_featured')
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch categories", err);
        setLoading(false);
      });
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = 300;
      sliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleCategoryClick = (category: any) => {
    if (onSelectCategory) {
      onSelectCategory(category.id.toString());
    }
    router.push(`/shop?subcategory=${encodeURIComponent(category.name)}`);
  };

  if (loading || categories.length === 0) return null;

  return (
    <section id="categories" className={styles.section}>
      <div className="container">
        <div className={styles.sliderWrapper}>
          {/* Left Navigation control */}
          <button
            onClick={() => scroll('left')}
            className={`${styles.navBtn} ${styles.navBtnLeft}`}
            aria-label="Previous categories">
            <ChevronLeft size={20} />
          </button>

          {/* Scrollable Categories List */}
          <div ref={sliderRef} className={styles.slider}>
            {categories.map((category, index) => (
              <div
                key={`${category.id}-${index}`}
                className={styles.card}
                onClick={() => handleCategoryClick(category)}>
                <img
                  src={category.home_image_url}
                  alt={category.name}
                  className={styles.cardImage}
                  loading="lazy"
                />
                <div className={styles.infoBox}>
                  <h3 className={styles.name}>{category.name}</h3>
                  <span className={styles.count}>{category.home_count_text}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Right Navigation control */}
          <button
            onClick={() => scroll('right')}
            className={`${styles.navBtn} ${styles.navBtnRight}`}
            aria-label="Next categories">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}
