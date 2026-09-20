'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import { useCart } from '@/components/store/CartContext';
import { useWishlist } from '@/components/store/WishlistContext';
import { Search, ShoppingBag, Heart, Sparkles, Menu, X, User } from 'lucide-react';
import CartDrawer from './CartDrawer';
import SearchModal from './SearchModal';
import AIShoppingDrawer from './AIShoppingDrawer';

export default function Navbar() {
  const { itemCount, setIsOpen: setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [announcement, setAnnouncement] = useState({
    text: 'Handcrafted Crochet & Botanical Gifts — Free Delivery Over ₹999',
    enabled: true,
  });

  React.useEffect(() => {
    const fetchAnnouncement = () => {
      fetch(`/api/settings?t=${Date.now()}`, { cache: 'no-store' })
        .then((res) => res.json())
        .then((data) => {
          if (data) {
            setAnnouncement({
              text: data.announcementText !== undefined ? data.announcementText : 'Handcrafted Crochet & Botanical Gifts — Free Delivery Over ₹999',
              enabled: data.announcementEnabled !== false,
            });
          }
        })
        .catch(() => {});
    };

    fetchAnnouncement();

    window.addEventListener('store-settings-updated', fetchAnnouncement);
    window.addEventListener('storage', fetchAnnouncement);
    return () => {
      window.removeEventListener('store-settings-updated', fetchAnnouncement);
      window.removeEventListener('storage', fetchAnnouncement);
    };
  }, []);

  return (
    <>
      {/* Top Banner */}
      {announcement.enabled && (
        <div className="bg-brand-900 text-cream-100 text-xs py-2 px-4 text-center tracking-wide flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-terracotta-300 animate-pulse" />
          <span>{announcement.text}</span>
          <Sparkles className="w-3.5 h-3.5 text-terracotta-300 animate-pulse hidden sm:inline-block" />
        </div>
      )}

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-cream-100/90 backdrop-blur-md border-b border-cream-300/60 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Mobile Menu Trigger & Search */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-charcoal-700 hover:text-brand-800 rounded-lg"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-charcoal-700 hover:text-brand-800 rounded-lg"
              aria-label="Open Search"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Brand Logo */}
          <Link href="/" className="flex items-center">
            <Logo variant="dark" showSubtitle={true} />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 font-medium text-sm text-charcoal-800">
            <Link href="/" className="hover:text-brand-600 transition-colors">
              Home
            </Link>
            <Link href="/shop" className="hover:text-brand-600 transition-colors">
              Shop All
            </Link>
            <Link href="/shop?category=crochet-collection" className="hover:text-brand-600 transition-colors font-semibold text-brand-900">
              Crochet Collection
            </Link>
            <Link href="/shop?filter=customizable" className="hover:text-brand-600 transition-colors flex items-center gap-1.5 text-terracotta-600 font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              Custom Gifts
            </Link>
            <Link href="/about" className="hover:text-brand-600 transition-colors">
              Handmade Story
            </Link>
          </nav>

          {/* Desktop Right Action Icons */}
          <div className="flex items-center gap-3">
            {/* AI Assistant Trigger Button */}
            <button
              onClick={() => setIsAIOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-full bg-brand-100 text-brand-900 border border-brand-300/80 hover:bg-brand-200 transition-all shadow-sm"
              title="AI Gift Finder"
            >
              <Sparkles className="w-3.5 h-3.5 text-terracotta-500" />
              <span>AI Gift Finder</span>
            </button>

            {/* Desktop Search Icon */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="hidden lg:flex p-2.5 text-charcoal-700 hover:text-brand-800 rounded-full hover:bg-cream-200/60 transition-colors"
              aria-label="Search Catalog"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Account Icon */}
            <Link
              href="/account"
              className="p-2.5 text-charcoal-700 hover:text-brand-800 rounded-full hover:bg-cream-200/60 transition-colors"
              aria-label="Customer Account"
              title="Sign In / Account"
            >
              <User className="w-5 h-5" />
            </Link>

            {/* Wishlist Link */}
            <Link
              href="/wishlist"
              className="relative p-2.5 text-charcoal-700 hover:text-brand-800 rounded-full hover:bg-cream-200/60 transition-colors hidden sm:flex"
              aria-label="Saved Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Trigger Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 text-charcoal-900 hover:text-brand-800 rounded-full hover:bg-cream-200/60 transition-colors"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 bg-terracotta-500 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm animate-bounce">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-cream-100 border-b border-cream-300 py-4 px-6 space-y-4 shadow-xl">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="block text-base font-serif text-charcoal-900 py-1">
              Home Page
            </Link>
            <Link href="/shop" onClick={() => setIsMobileMenuOpen(false)} className="block text-base font-serif text-charcoal-900 py-1">
              Explore Collection
            </Link>
            <Link href="/shop?category=crochet-collection" onClick={() => setIsMobileMenuOpen(false)} className="block text-base font-serif font-bold text-brand-900 py-1">
              Crochet Collection
            </Link>
            <Link href="/shop?filter=customizable" onClick={() => setIsMobileMenuOpen(false)} className="block text-base font-serif text-terracotta-600 font-semibold py-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Personalized Gifts
            </Link>
            <Link href="/account" onClick={() => setIsMobileMenuOpen(false)} className="block text-base font-serif text-charcoal-900 py-1 flex items-center gap-2">
              <User className="w-4 h-4" /> Customer Account & Orders
            </Link>
          </div>
        )}
      </header>

      {/* Modals & Drawers */}
      <CartDrawer />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <AIShoppingDrawer isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />
    </>
  );
}
