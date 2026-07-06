import "./globals.css";
import { StoreProvider } from "../context/StoreContext";
import { Roboto, Playfair_Display, Oswald } from "next/font/google";
import ThemeToggle from "../components/ThemeToggle/ThemeToggle";
import BackToTop from "../components/BackToTop/BackToTop";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import { API_BASE_URL } from '@/config';

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  variable: "--font-roboto",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-playfair-display",
});

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-oswald",
});

export const metadata = {
  title: "SD Trends Design | Luxury Fine Jewelry & Accessories",
  description: "Discover curated collections of diamond engagement rings, vintage emerald bands, South Sea pearls, gold hoops, and tennis bracelets at SD Trends Design. Elegant handcrafted luxury.",
  keywords: "jewelry store, diamonds, engagement rings, gold necklaces, emerald band, luxury accessories, sd trends design, boutique jewelry",
  authors: [{ name: "SD Trends Design" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

async function fetchLayoutData() {
  try {
    const res = await fetch(`${API_BASE_URL}/layout-data`, {
      next: { revalidate: 300 } // Cache for 5 minutes
    });
    if (!res.ok) throw new Error('Failed to fetch layout data');
    const data = await res.json();
    return {
      categories: Array.isArray(data.categories) ? data.categories : [],
      settings: data.settings || {},
      footerLinks: Array.isArray(data.footerLinks) ? data.footerLinks : [],
      promo: data.promo || null
    };
  } catch (err) {
    console.error("Failed to load layout data", err);
    return {
      categories: [],
      settings: {},
      footerLinks: [],
      promo: null
    };
  }
}

export default async function RootLayout({ children }) {
  const layoutData = await fetchLayoutData();

  return (
    <html lang="en" className={`${roboto.variable} ${playfair.variable} ${oswald.variable}`}>
      <body>
        <StoreProvider>
          <Header categories={layoutData.categories} promo={layoutData.promo} />
          {children}
          <Footer settings={layoutData.settings} footerLinks={layoutData.footerLinks} />
          <ThemeToggle />
          <BackToTop />
        </StoreProvider>
      </body>
    </html>
  );
}
