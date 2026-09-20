'use client';

import React from 'react';
import ProductCard from './ProductCard';
import { useWishlist } from './WishlistContext';
import { Heart, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface WishlistGridProps {
  allProducts: any[];
}

export default function WishlistGrid({ allProducts }: WishlistGridProps) {
  const { wishlist, wishlistCount } = useWishlist();

  const savedProducts = allProducts.filter((p) => wishlist.includes(p.id));
  const recommended = allProducts.filter((p) => p.giftPick || p.bestseller || p.trending).slice(0, 4);

  return (
    <div className="space-y-10">
      {savedProducts.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif font-semibold text-charcoal-900 flex items-center gap-2">
              <span>Saved Items</span>
              <span className="text-xs px-2.5 py-0.5 bg-red-100 text-red-800 font-bold rounded-full">
                {savedProducts.length}
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {savedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-cream-300 shadow-soft max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto shadow-xs border border-red-100">
            <Heart className="w-8 h-8 fill-red-100" />
          </div>
          <h2 className="text-2xl font-serif font-semibold text-charcoal-900">
            Your Wishlist is Empty
          </h2>
          <p className="text-xs text-charcoal-500 leading-relaxed max-w-md mx-auto">
            You haven’t saved any products yet! Tap the heart icon on any custom keychain, resin plaque, or handmade decor item to save it here.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-800 hover:bg-brand-900 text-cream-100 rounded-2xl font-semibold text-xs transition-all shadow-float mt-2"
          >
            <span>Explore All Handmade Gifts</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Recommended Gift Picks Section */}
      <div className="space-y-4 pt-6 border-t border-cream-300">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-serif font-semibold text-charcoal-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-terracotta-500" /> Recommended Boutique Picks
          </h3>
          <Link href="/shop" className="text-xs font-semibold text-brand-800 hover:underline">
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommended.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
