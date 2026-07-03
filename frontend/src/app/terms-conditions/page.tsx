import React from 'react';
import styles from '../privacy-buyers/page.module.css';

export const metadata = {
  title: 'Terms & Conditions | SD Trends',
  description: 'Read the terms and conditions governing use of the SD Trends jewellery platform for buyers and sellers.',
};

const sections = [
  {
    title: '1. Acceptance of Terms',
    content: `By accessing or using the SD Trends website, mobile application, or any related services, you agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, you must discontinue use of our platform immediately.`,
  },
  {
    title: '2. Use of the Platform',
    content: `SD Trends is an online jewellery marketplace. You agree to use the platform only for lawful purposes and in a manner that does not infringe the rights of others. Prohibited activities include fraud, impersonation, uploading malicious code, and circumventing our security measures.`,
  },
  {
    title: '3. Account Registration',
    content: `You must create an account to purchase or sell on SD Trends. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. SD Trends reserves the right to suspend or terminate accounts that violate these terms.`,
  },
  {
    title: '4. Orders and Payments',
    content: `All prices are displayed in Indian Rupees (₹) and are inclusive of applicable taxes unless stated otherwise. Orders are confirmed only upon successful payment. SD Trends reserves the right to cancel orders due to pricing errors, stock unavailability, or suspected fraud.`,
  },
  {
    title: '5. Shipping and Delivery',
    content: `Estimated delivery timelines are provided at checkout. While we strive to meet these estimates, SD Trends is not liable for delays caused by third-party logistics providers, customs, or force majeure events. Risk of loss transfers to the buyer upon delivery.`,
  },
  {
    title: '6. Returns and Refunds',
    content: `Products may be returned within 7 days of delivery if they are unused, in original packaging, and accompanied by proof of purchase. Refunds are processed within 7–10 business days to the original payment method. Customised or made-to-order items are non-returnable.`,
  },
  {
    title: '7. Intellectual Property',
    content: `All content on the SD Trends platform — including logos, images, product descriptions, and design — is the intellectual property of SD Trends or its licensors. Reproduction, distribution, or commercial use without prior written consent is strictly prohibited.`,
  },
  {
    title: '8. Seller Responsibilities',
    content: `Sellers are responsible for the accuracy of their product listings, compliance with applicable laws, and fulfilment of orders in a timely manner. SD Trends reserves the right to remove listings or suspend seller accounts that violate our marketplace policies.`,
  },
  {
    title: '9. Limitation of Liability',
    content: `To the maximum extent permitted by law, SD Trends shall not be liable for indirect, incidental, or consequential damages arising from your use of the platform. Our total liability in any matter is limited to the amount paid by you for the relevant order.`,
  },
  {
    title: '10. Dispute Resolution',
    content: `Any disputes arising from or related to these Terms shall first be attempted to be resolved through good-faith negotiation. If unresolved, disputes shall be submitted to binding arbitration under the rules of the Indian Arbitration and Conciliation Act, 1996. The seat of arbitration shall be Chennai, India.`,
  },
  {
    title: '11. Governing Law',
    content: `These Terms & Conditions are governed by the laws of India. Any legal proceedings not subject to arbitration shall be brought exclusively in the courts of Chennai, Tamil Nadu.`,
  },
  {
    title: '12. Changes to These Terms',
    content: `We reserve the right to modify these Terms & Conditions at any time. Changes will be posted on this page with an updated revision date. Continued use of the platform following changes constitutes your acceptance of the updated terms.`,
  },
];

export default function TermsConditionsPage() {
  return (
    <main className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <a href="/" className={styles.breadcrumbLink}>Home</a>
            <span className={styles.breadcrumbSep}>›</span>
            <a href="/" className={styles.breadcrumbLink}>Legal</a>
            <span className={styles.breadcrumbSep}>›</span>
            <span className={styles.breadcrumbCurrent}>Terms & Conditions</span>
          </nav>
          <span className={styles.badge}>Legal</span>
          <h1 className={styles.title}>Terms & Conditions</h1>
          <p className={styles.subtitle}>
            Please read these terms carefully before using SD Trends. They govern your access and use of our platform as a buyer or seller.
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
            <h3>Questions about these terms?</h3>
            <p>Contact our legal team via our <a href="/contact-us">Contact Us</a> page.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
