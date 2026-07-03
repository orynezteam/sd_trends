import React from 'react';
import styles from './page.module.css';

export const metadata = {
  title: 'Privacy Policy for Buyers | SD Trends',
  description: 'Learn how SD Trends collects, uses, and protects your personal information as a buyer on our platform.',
};

const sections = [
  {
    title: '1. Information We Collect',
    content: `When you place an order or create an account with SD Trends, we collect personal information including your name, email address, shipping address, phone number, and payment details. We may also collect browsing behaviour, device information, and cookies to improve your experience.`,
  },
  {
    title: '2. How We Use Your Information',
    content: `Your information is used to process orders, send order confirmations and shipping updates, provide customer support, personalise your shopping experience, and send promotional offers (with your consent). We do not sell your personal data to third parties.`,
  },
  {
    title: '3. Data Sharing',
    content: `We share your data only with trusted partners necessary to fulfil your orders — such as payment processors and logistics providers. All third parties are contractually obligated to protect your information and use it only for the specified purpose.`,
  },
  {
    title: '4. Payment Security',
    content: `All payment transactions are encrypted using industry-standard SSL technology. We do not store your full card details on our servers. Payments are processed through secure, PCI-DSS compliant payment gateways.`,
  },
  {
    title: '5. Cookies',
    content: `We use cookies to improve your browsing experience, remember your preferences, and analyse site traffic. You can control cookie settings through your browser, though disabling cookies may affect some site functionality.`,
  },
  {
    title: '6. Your Rights',
    content: `You have the right to access, correct, or delete your personal data at any time. You may also opt out of marketing communications by clicking "Unsubscribe" in any email or contacting us directly. To exercise your rights, please reach out via our Contact Us page.`,
  },
  {
    title: '7. Data Retention',
    content: `We retain your data for as long as necessary to fulfil the purposes outlined in this policy, or as required by law. Order records are typically kept for 7 years for accounting purposes.`,
  },
  {
    title: '8. Changes to This Policy',
    content: `We may update this privacy policy from time to time. Any significant changes will be communicated via email or a notice on our website. Continued use of our platform after changes constitutes acceptance of the revised policy.`,
  },
];

export default function PrivacyBuyersPage() {
  return (
    <main className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <a href="/" className={styles.breadcrumbLink}>Home</a>
            <span className={styles.breadcrumbSep}>›</span>
            <a href="/" className={styles.breadcrumbLink}>Legal</a>
            <span className={styles.breadcrumbSep}>›</span>
            <span className={styles.breadcrumbCurrent}>Privacy Policy for Buyers</span>
          </nav>
          <span className={styles.badge}>Legal</span>
          <h1 className={styles.title}>Privacy Policy for Buyers</h1>
          <p className={styles.subtitle}>
            Your privacy is important to us. This policy explains how we handle your personal information when you shop with SD Trends.
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
            <h3>Questions about your privacy?</h3>
            <p>If you have any questions or concerns about this policy or how your data is handled, please <a href="/contact-us">contact us</a>.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
