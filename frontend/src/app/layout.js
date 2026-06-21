import "./globals.css";
import { StoreProvider } from "../context/StoreContext";

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

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
