import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/components/store/CartContext';
import { WishlistProvider } from '@/components/store/WishlistContext';
import AntiInspectProtection from '@/components/security/AntiInspectProtection';

export const metadata: Metadata = {
  title: 'Knot & Bloom | Artisanal Handmade Decor & Personalised Gifts',
  description:
    'Handcrafted botanical decor, customized resin keychains, personalized photo gifts, and artisan hampers made with care.',
  keywords: [
    'handmade gifts',
    'personalized keychains',
    'resin charms',
    'botanical decor',
    'custom name plaques',
    'gift hampers',
    'Knot and Bloom',
  ],
  authors: [{ name: 'Knot & Bloom Studio' }],
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: 'Knot & Bloom — Romi.ka Handcraft With Love',
    description: 'Romi.ka handcraft With love. Handcrafted keychains, artisanal hampers, and custom gifts.',
    url: 'https://knotandbloom.com',
    siteName: 'Knot & Bloom',
    locale: 'en_IN',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta name="theme-color" content="#fdfbf7" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body className="antialiased bg-cream-100 text-charcoal-900 min-h-screen flex flex-col selection:bg-brand-200 selection:text-brand-950">
        <AntiInspectProtection />
        <WishlistProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </WishlistProvider>
      </body>
    </html>
  );
}
