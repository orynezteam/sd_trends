"use client";

import React from 'react';
import { Truck, ShieldCheck, RotateCcw, Award } from 'lucide-react';
import styles from './Services.module.css';

const SERVICES = [
  {
    icon: <Truck size={22} />,
    title: "Complimentary Shipping",
    desc: "We offer secure, insured free shipping on all orders over $250 worldwide."
  },
  {
    icon: <ShieldCheck size={22} />,
    title: "Secure Checkouts",
    desc: "Your payment security is our priority. Transactions are fully SSL-encrypted."
  },
  {
    icon: <RotateCcw size={22} />,
    title: "30-Day Easy Returns",
    desc: "Return or exchange any unaltered piece within 30 days of purchase, no questions asked."
  },
  {
    icon: <Award size={22} />,
    title: "Certified Authenticity",
    desc: "Each item comes with a certified Hallmark Certificate ensuring gold/stone purity."
  }
];

export default function Services() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.grid}>
          {SERVICES.map((srv, idx) => (
            <div key={idx} className={styles.item}>
              <div className={styles.iconWrapper}>{srv.icon}</div>
              <div className={styles.info}>
                <h4 className={styles.title}>{srv.title}</h4>
                <p className={styles.desc}>{srv.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
