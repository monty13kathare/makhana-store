import type { Metadata, Viewport } from "next";
import { Montserrat, Josefin_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import MobileDock from "@/components/MobileDock";
import MotionProvider from "@/components/MotionProvider";
import PauseOffscreen from "@/components/PauseOffscreen";
import AddedToCartModal from "@/components/AddedToCartModal";
import AuthModal from "@/components/AuthModal";
import { WishlistProvider } from "@/context/WishlistContext";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
  display: "swap",
});

const josefin = Josefin_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-josefin",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Makhana — Premium Makhana for the Modern World",
    template: "%s · Makhana Premium",
  },
  description:
    "Hand-picked 6-suta lotus seeds, slow roasted to perfection. Signature flavours, zero palm oil, sealed for crisp freshness.",
  keywords: [
    "makhana",
    "fox nuts",
    "lotus seeds",
    "healthy snacks",
    "roasted makhana",
    "premium snacks",
  ],
  openGraph: {
    title: "Makhana — Premium Makhana for the Modern World",
    description:
      "Signature collection of premium roasted makhana. Clean label, gluten free, high protein.",
    type: "website",
  },
  applicationName: "Makhana",
  appleWebApp: {
    capable: true,
    title: "Makhana",
    statusBarStyle: "black-translucent",
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d0d0d",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${josefin.variable} ${playfair.variable}`}
    >
      <body className="antialiased overflow-x-hidden min-h-screen w-full">
        <MotionProvider>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <Navbar />
              <main className="min-h-screen w-full max-w-full overflow-x-clip">{children}</main>
              <Footer />
              <MobileDock />
              <PauseOffscreen />
              <CartDrawer />
              <AddedToCartModal />
              <AuthModal />
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
