import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/components/store/CartContext';
import { WishlistProvider } from '@/components/store/WishlistContext';
import AntiInspectProtection from '@/components/security/AntiInspectProtection';

export const metadata: Metadata = {
  metadataBase: new URL('https://knot-and-bloom-ten.vercel.app'),
  title: 'Romi & Knot | Artisanal Handmade Decor & Personalised Gifts',
  description:
    'Romi & Knot — Handcrafted milk-cotton scrunchies, amigurumi plushies, botanical resin keychains, and custom photo plaque gifts made with love in India.',
  keywords: [
    'Romi & Knot',
    'Romi and Knot',
    'Romi & Knot Studio',
    'handmade gifts India',
    'crochet scrunchies',
    'amigurumi keepsakes',
    'personalized keychains',
    'resin charms',
    'custom photo plaques',
  ],
  authors: [{ name: 'Romi & Knot Studio' }],
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  alternates: {
    canonical: 'https://knot-and-bloom-ten.vercel.app',
  },
  openGraph: {
    title: 'Romi & Knot — Romi.ka Handcraft With Love',
    description: 'Handcrafted crochet scrunchies, amigurumi plushies, botanical resin keychains, and custom gifts.',
    url: 'https://knot-and-bloom-ten.vercel.app',
    siteName: 'Romi & Knot',
    locale: 'en_IN',
    type: 'website',
  },
  verification: {
    google: 'google632c6eea1d4fe668',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'OnlineStore',
    name: 'Romi & Knot',
    url: 'https://knot-and-bloom-ten.vercel.app',
    description: 'Handcrafted milk-cotton scrunchies, amigurumi keepsakes, botanical resin keychains, and personalized gifts.',
    image: 'https://knot-and-bloom-ten.vercel.app/images/crochet-craft-new.jpg',
    sameAs: ['https://www.linkedin.com/in/ashish-ranjan24/'],
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'IN',
    },
    priceRange: '₹199 - ₹1999',
  };

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta name="theme-color" content="#fdfbf7" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
