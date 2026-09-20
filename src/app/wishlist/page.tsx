import React from 'react';
import Navbar from '@/components/store/Navbar';
import Footer from '@/components/store/Footer';
import MobileNav from '@/components/store/MobileNav';
import WishlistGrid from '@/components/store/WishlistGrid';
import { prisma } from '@/lib/db';
import { Heart } from 'lucide-react';

export default async function WishlistPage() {
  const allProducts = await prisma.product.findMany({
    where: { published: true, deletedAt: null },
    include: { variants: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-h-screen flex flex-col bg-cream-100 text-charcoal-900 pb-20 lg:pb-0">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-500 shadow-xs border border-red-200">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <h1 className="text-3xl font-serif font-semibold text-charcoal-900">
            Your Handcrafted Wishlist
          </h1>
          <p className="text-xs text-charcoal-500">
            Curate your favorite botanical decor, personalized keychains, and gift picks to save or share.
          </p>
        </div>

        <WishlistGrid allProducts={allProducts} />
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}
