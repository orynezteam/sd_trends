import React from 'react';
import styles from '../privacy-buyers/page.module.css';

export const metadata = {
  title: 'Privacy Policy for Sellers | SD Trends',
  description: 'Understand how SD Trends collects, uses, and protects information from sellers on our marketplace platform.',
};

const sections = [
  {
    title: '1. Information We Collect from Sellers',
    content: `As a seller on SD Trends, we collect business and personal information including your name, business name, tax identification number, bank account details, contact information, and product listings. We may also collect data on your sales performance and transaction history.`,
  },
  {
    title: '2. How We Use Seller Information',
    content: `Seller information is used to verify your identity and business, process payments and remittances, maintain transaction records for accounting and compliance, provide seller analytics and dashboards, and communicate important platform updates and policy changes.`,
  },
  {
    title: '3. Financial Data',
    content: `Bank account and payout details are encrypted and stored securely. We use this information solely for the purpose of remitting earnings to you. We partner with PCI-DSS compliant payment processors to ensure the highest standard of financial data security.`,
  },
  {
    title: '4. Product and Listing Data',
    content: `Product information you upload (descriptions, images, pricing) is publicly visible to buyers and may be indexed by search engines. You are responsible for ensuring your listings comply with our terms of service and applicable laws.`,
  },
  {
    title: '5. Data Sharing with Third Parties',
    content: `We may share your information with logistics providers to fulfil orders, tax authorities as required by law, and fraud detection services to protect the integrity of our marketplace. We will never sell your personal data to marketing companies.`,
  },
  {
    title: '6. Seller Analytics',
    content: `We collect data on your store's performance, including views, conversion rates, and sales figures. This data is used to provide you with insights and to improve our platform. Aggregated, anonymised data may be used for platform-wide analytics.`,
  },
  {
    title: '7. Compliance & Legal Obligations',
    content: `As a seller, you may be subject to KYC (Know Your Customer) verification. We are required to collect certain information to comply with anti-money laundering regulations and tax reporting obligations. This data is handled in strict accordance with applicable law.`,
  },
  {
    title: '8. Data Retention',
    content: `Seller account data is retained for the duration of your business relationship with SD Trends and for a period of 7 years thereafter, as required for financial and legal compliance. You may request deletion of non-essential data at any time.`,
  },
  {
    title: '9. Your Rights',
    content: `You have the right to access, update, or request deletion of your personal information. To exercise these rights or report a data concern, please contact us through our Contact Us page.`,
  },
];

export default function PrivacySellersPage() {
  return (
    <main className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <a href="/" className={styles.breadcrumbLink}>Home</a>
            <span className={styles.breadcrumbSep}>›</span>
            <a href="/" className={styles.breadcrumbLink}>Legal</a>
            <span className={styles.breadcrumbSep}>›</span>
            <span className={styles.breadcrumbCurrent}>Privacy Policy for Sellers</span>
          </nav>
          <span className={styles.badge}>Legal</span>
          <h1 className={styles.title}>Privacy Policy for Sellers</h1>
          <p className={styles.subtitle}>
            This policy outlines how SD Trends collects and manages personal and business data from sellers on our platform.
          </p>
          <p className={styles.updated}>Last updated: July 2025</p>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.inner}>
          {sections.map((sec, i) => (
            <div key={i} className={styles.section}>
              <h2 className={styles.sectionTitle}>{sec.title}</h2>
              <p className={styles.sectionText}>{sec.content}</p>
            </div>
          ))}

          <div className={styles.contact}>
            <h3>Have a question about your data?</h3>
            <p>Reach out to our seller support team through our <a href="/contact-us">Contact Us</a> page.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
