'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Star, Heart, ShoppingBag, Check } from 'lucide-react';
import { useCart } from '@/components/store/CartContext';
import { useWishlist } from '@/components/store/WishlistContext';

export interface SliderProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice?: number;
  thumbnail: string;
  shortDescription?: string;
  rating?: number;
  reviewCount?: number;
  badge?: string;
  customizable?: boolean;
}

const DEFAULT_SLIDER_PRODUCTS: SliderProduct[] = [
  {
    id: 'prod-crochet-scrunchie',
    slug: 'handmade-crochet-scrunchie-set',
    name: 'Crochet Velvet Scrunchie Set',
    price: 299,
    originalPrice: 399,
    thumbnail: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?q=80&w=800&auto=format&fit=crop',
    shortDescription: 'Soft cotton yarn handcrafted for hair wellness & style.',
    badge: 'BEST SELLER',
  },
  {
    id: 'prod-resin-keychain',
    slug: 'handmade-floral-name-keychain',
    name: 'Botanical Floral Name Keychain',
    price: 499,
    originalPrice: 649,
    thumbnail: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop',
    shortDescription: 'Real dried blossoms encased in crystal clear resin.',
    badge: 'TRENDING',
  },
  {
    id: 'prod-heart-keychain',
    slug: 'handmade-crochet-heart-keychain',
    name: 'Handmade Crochet Heart Keychain',
    price: 249,
    originalPrice: 349,
    thumbnail: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?q=80&w=800&auto=format&fit=crop',
    shortDescription: 'Plush hand-stitched amigurumi heart bag charm.',
    badge: 'NEW',
  },
  {
    id: 'prod-resin-frame',
    slug: 'personalized-resin-couple-plaque',
    name: 'Artisan Resin Couple Frame',
    price: 899,
    originalPrice: 1199,
    thumbnail: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop',
    shortDescription: 'Custom name plaque with gold leaf accents.',
    badge: 'POPULAR',
  },
  {
    id: 'prod-crochet-bow',
    slug: 'handcrafted-crochet-bow-set',
    name: 'Handcrafted Crochet Hair Bow Set',
    price: 349,
    originalPrice: 449,
    thumbnail: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800&auto=format&fit=crop',
    shortDescription: 'Charming pastel clips woven with pure organic yarn.',
    badge: 'FEATURED',
  },
];

import ThreadUnderline from '@/components/ui/ThreadUnderline';

export default function FeaturedProductSlider({ products }: { products?: SliderProduct[] }) {
  let rawList = products && products.length > 0 ? products : DEFAULT_SLIDER_PRODUCTS;
  if (rawList.length === 1) {
    rawList = [rawList[0], rawList[0], rawList[0]];
  } else if (rawList.length === 2) {
    rawList = [rawList[0], rawList[1], rawList[0], rawList[1]];
  }
  const displayProducts = rawList;
  const [activeIndex, setActiveIndex] = useState(1); // Default to middle card
  const [addedItem, setAddedItem] = useState<string | null>(null);
  const cartContext = useCart();
  const { toggleWishlist: toggleWishlistContext, isLiked } = useWishlist();
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Cycle Next
  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % displayProducts.length);
  };

  // Cycle Prev
  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + displayProducts.length) % displayProducts.length);
  };

  // Auto-play interval
  useEffect(() => {
    autoPlayRef.current = setInterval(() => {
      handleNext();
    }, 5000);
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [displayProducts.length]);

  const toggleWishlist = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    toggleWishlistContext(id);
  };

  const handleAddToCart = (e: React.MouseEvent, prod: SliderProduct) => {
    e.stopPropagation();
    e.preventDefault();

    if (cartContext) {
      cartContext.addItem({
        productId: prod.id,
        name: prod.name,
        price: prod.price,
        originalPrice: prod.originalPrice || prod.price,
        thumbnail: prod.thumbnail,
        quantity: 1,
      });
      cartContext.setIsOpen(true);
    }

    setAddedItem(prod.id);
    setTimeout(() => setAddedItem(null), 2000);
  };

  return (
    <section className="py-20 bg-gradient-to-b from-cream-100 via-cream-50 to-cream-100 overflow-hidden relative border-y border-cream-300 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-terracotta-600 block">
            OUR COLLECTION
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif text-charcoal-900 tracking-tight inline-block relative">
            <span>Featured Products</span>
            <ThreadUnderline />
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-500 font-sans pt-2">
            Explore our most popular handmade items loved by customers across India.
          </p>
        </div>

        {/* 3D Coverflow Carousel Container */}
        <div className="relative flex items-center justify-center min-h-[480px] sm:min-h-[520px] py-4">
          
          {/* Navigation Arrows */}
          <button
            onClick={handlePrev}
            className="absolute left-2 sm:left-6 z-30 w-12 h-12 rounded-full bg-white/90 hover:bg-white text-charcoal-900 border border-cream-300 shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2]" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-2 sm:right-6 z-30 w-12 h-12 rounded-full bg-white/90 hover:bg-white text-charcoal-900 border border-cream-300 shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-6 h-6 stroke-[2]" />
          </button>

          {/* Cards Stack */}
          <div className="w-full flex items-center justify-center relative max-w-5xl">
            {displayProducts.map((prod, idx) => {
              // Calculate relative offset from activeIndex
              const count = displayProducts.length;
              let offset = (idx - activeIndex + count) % count;
              if (offset > Math.floor(count / 2)) {
                offset -= count;
              }

              const isActive = offset === 0;
              const isPrev = offset === -1 || (offset === count - 1 && count > 2);
              const isNext = offset === 1 || (offset === -(count - 1) && count > 2);
              const isVisible = isActive || isPrev || isNext;

              if (!isVisible) return null;

              // Transform & Styling calculations matching inspiration
              let translatePos = 'translate-x-0 scale-100 opacity-100 z-20';
              if (offset === -1) {
                translatePos = '-translate-x-[75%] sm:-translate-x-[65%] scale-90 opacity-70 z-10 blur-[0.5px] cursor-pointer';
              } else if (offset === 1) {
                translatePos = 'translate-x-[75%] sm:translate-x-[65%] scale-90 opacity-70 z-10 blur-[0.5px] cursor-pointer';
              }

              const badgeText = prod.badge || (isActive ? 'BEST SELLER' : idx % 2 === 0 ? 'NEW' : 'TRENDING');

              return (
                <div
                  key={prod.id}
                  onClick={() => !isActive && setActiveIndex(idx)}
                  className={`absolute transition-all duration-500 ease-out transform ${translatePos} w-[280px] sm:w-[320px]`}
                >
                  <div
                    className={`bg-white rounded-3xl p-5 border transition-all duration-300 ${
                      isActive
                        ? 'border-brand-300 shadow-2xl shadow-charcoal-950/10 ring-2 ring-brand-200/50'
                        : 'border-cream-300 shadow-md hover:shadow-lg'
                    }`}
                  >
                    {/* Top Row: Badge & Wishlist Heart */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 bg-amber-100 text-amber-900 rounded-full">
                        {badgeText}
                      </span>
                      <button
                        onClick={(e) => toggleWishlist(e, prod.id)}
                        className="p-1.5 rounded-full hover:bg-cream-100 text-charcoal-400 hover:text-red-500 transition-colors"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            isLiked(prod.id) ? 'fill-red-500 text-red-500' : ''
                          }`}
                        />
                      </button>
                    </div>

                    {/* Product Image */}
                    <Link href={`/product/${prod.slug}`}>
                      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-cream-50 mb-4 group cursor-pointer">
                        <img
                          src={prod.thumbnail}
                          alt={prod.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    </Link>

                    {/* Product Info */}
                    <div className="space-y-2">
                      <Link href={`/product/${prod.slug}`}>
                        <h3 className="font-serif font-semibold text-charcoal-900 text-base sm:text-lg line-clamp-1 hover:text-brand-800 transition-colors">
                          {prod.name}
                        </h3>
                      </Link>

                      <p className="text-xs text-charcoal-500 line-clamp-2 min-h-[32px] font-sans">
                        {prod.shortDescription || 'Handcrafted with premium artisan materials.'}
                      </p>

                      {/* Rating & Pricing */}
                      <div className="flex items-center justify-between pt-1">
                        {Boolean(prod.reviewCount && prod.reviewCount > 0 && prod.rating && prod.rating > 0) ? (
                          <div className="flex items-center gap-1 text-amber-500 text-xs font-semibold">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{prod.rating!.toFixed(1)}</span>
                            <span className="text-charcoal-400 font-normal">
                              ({prod.reviewCount})
                            </span>
                          </div>
                        ) : <div />}

                        <div className="flex items-baseline gap-1.5">
                          {prod.originalPrice && (
                            <span className="text-xs text-charcoal-400 line-through">
                              ₹{prod.originalPrice}
                            </span>
                          )}
                          <span className="text-base font-bold text-charcoal-900">
                            ₹{prod.price}
                          </span>
                        </div>
                      </div>

                      {/* Add to Cart CTA (Active Card gets full button, Side cards get quick icon) */}
                      <div className="pt-3">
                        {isActive ? (
                          <button
                            onClick={(e) => handleAddToCart(e, prod)}
                            className="w-full py-3 px-4 bg-terracotta-600 hover:bg-terracotta-700 active:scale-98 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all"
                          >
                            {addedItem === prod.id ? (
                              <>
                                <Check className="w-4 h-4" /> Added to Cart!
                              </>
                            ) : (
                              <>
                                <ShoppingBag className="w-4 h-4" /> Add to Cart
                              </>
                            )}
                          </button>
                        ) : (
                          <button
                            onClick={(e) => handleAddToCart(e, prod)}
                            className="w-full py-2.5 px-3 bg-cream-100 hover:bg-brand-100 text-brand-900 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" /> Quick Add
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Carousel Pagination Dots */}
        <div className="flex items-center justify-center gap-2.5 mt-8">
          {displayProducts.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`transition-all duration-300 rounded-full ${
                idx === activeIndex
                  ? 'w-7 h-2.5 bg-terracotta-600'
                  : 'w-2.5 h-2.5 bg-cream-300 hover:bg-charcoal-400'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
