import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { CartProvider } from "@/context/CartContext";
import PublicLayoutWrapper from "@/components/PublicLayoutWrapper";

export const metadata: Metadata = {
  title: "Frères Zeboudj - محل الإخوة زبوج | Huiles & Accessoires Automobiles",
  description: "Magasin Frères Zeboudj (محل الإخوة زبوج للزيوت ولوازم السيارات) : Vente d'huiles moteur de qualité, filtres, liquides de refroidissement et accessoires automobiles en Algérie. Tél: 0555 46 07 70 / 0542 81 64 42.",
  icons: {
    icon: "/store-logo.png",
    apple: "/store-logo.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" dir="ltr">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-500 selection:text-white">
        <LanguageProvider>
          <CartProvider>
            <PublicLayoutWrapper>{children}</PublicLayoutWrapper>
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
