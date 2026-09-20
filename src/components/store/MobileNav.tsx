'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid, Heart, ShoppingBag, Sparkles } from 'lucide-react';
import { useCart } from './CartContext';
import { useWishlist } from './WishlistContext';

export default function MobileNav() {
  const pathname = usePathname();
  const { itemCount, setIsOpen: setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();

  // Hide mobile bottom nav on admin routes
  if (pathname.startsWith('/admin')) return null;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-cream-100/95 backdrop-blur-lg border-t border-cream-300 px-2 py-1.5 shadow-2xl flex items-center justify-around">
      <Link
        href="/"
        className={`flex flex-col items-center gap-0.5 p-2 text-xs font-medium ${
          pathname === '/' ? 'text-brand-800' : 'text-charcoal-500'
        }`}
      >
        <Home className="w-5 h-5" />
        <span>Home</span>
      </Link>

      <Link
        href="/shop"
        className={`flex flex-col items-center gap-0.5 p-2 text-xs font-medium ${
          pathname.startsWith('/shop') ? 'text-brand-800' : 'text-charcoal-500'
        }`}
      >
        <Grid className="w-5 h-5" />
        <span>Shop</span>
      </Link>

      <Link
        href="/shop?filter=customizable"
        className="flex flex-col items-center gap-0.5 p-2 text-xs font-medium text-terracotta-600"
      >
        <Sparkles className="w-5 h-5 animate-pulse" />
        <span>Custom</span>
      </Link>

      <Link
        href="/wishlist"
        className={`relative flex flex-col items-center gap-0.5 p-2 text-xs font-medium ${
          pathname === '/wishlist' ? 'text-brand-800' : 'text-charcoal-500'
        }`}
      >
        <Heart className="w-5 h-5" />
        <span>Saved</span>
        {wishlistCount > 0 && (
          <span className="absolute top-1 right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            {wishlistCount}
          </span>
        )}
      </Link>

      <button
        onClick={() => setIsCartOpen(true)}
        className="relative flex flex-col items-center gap-0.5 p-2 text-xs font-medium text-charcoal-700"
      >
        <ShoppingBag className="w-5 h-5" />
        <span>Cart</span>
        {itemCount > 0 && (
          <span className="absolute top-1 right-2 bg-terracotta-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </button>
    </nav>
  );
}
