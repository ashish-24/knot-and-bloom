'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/store/ProductCard';
import { Sparkles, ArrowRight, Grid } from 'lucide-react';
import ThreadUnderline from '@/components/ui/ThreadUnderline';

export interface ProductShowcaseItem {
  id: string;
  slug: string;
  name: string;
  sku?: string;
  shortDescription: string;
  price: number;
  originalPrice: number;
  discount: number;
  thumbnail: string;
  stock: number;
  categoryName?: string;
  categorySlug?: string;
  customizable?: boolean;
  bestseller?: boolean;
  trending?: boolean;
  giftPick?: boolean;
  rating?: number;
  reviewCount?: number;
  variants?: Array<{
    id?: string;
    name: string;
    colorHex?: string | null;
    imageUrl?: string | null;
    priceAdjust?: number;
  }>;
}

const CATEGORY_TABS = [
  { id: 'all', label: '✨ All Creations' },
  { id: 'crochet-collection', label: '🧶 Crochet Collection' },
  { id: 'keychains-charms', label: '🔑 Keychains & Charms' },
  { id: 'home-decor', label: '🌸 Home & Desk Decor' },
  { id: 'gift-hampers', label: '🎁 Gift Hampers' },
];

export default function ProductShowcase({ products }: { products: ProductShowcaseItem[] }) {
  const [activeTab, setActiveTab] = useState('all');

  const filteredProducts =
    activeTab === 'all'
      ? products
      : products.filter(
          (p) =>
            p.categorySlug === activeTab ||
            (activeTab === 'crochet-collection' && p.name.toLowerCase().includes('crochet')) ||
            (activeTab === 'keychains-charms' && p.name.toLowerCase().includes('keychain')) ||
            (activeTab === 'home-decor' && (p.name.toLowerCase().includes('decor') || p.name.toLowerCase().includes('frame'))) ||
            (activeTab === 'gift-hampers' && (p.name.toLowerCase().includes('hamper') || p.name.toLowerCase().includes('set')))
        );

  return (
    <section className="py-20 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] font-semibold text-terracotta-600 flex items-center justify-center md:justify-start gap-1.5 mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Handcrafted Studio Showcase
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif text-charcoal-900 inline-block relative">
            <span>Artisanal Handmade Collection</span>
            <ThreadUnderline />
          </h2>
        </div>

        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-900 hover:bg-brand-950 text-cream-100 rounded-xl text-xs font-semibold shadow-md transition-all shrink-0"
        >
          <span>Explore Complete Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center justify-start md:justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORY_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-brand-800 text-cream-100 shadow-md scale-105'
                  : 'bg-white hover:bg-cream-200 text-charcoal-700 border border-cream-300'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Product Grid Showcase */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-3xl border border-cream-300 p-8 space-y-3 max-w-md mx-auto">
          <Grid className="w-8 h-8 text-charcoal-400 mx-auto" />
          <h3 className="text-base font-serif font-semibold text-charcoal-900">
            No items in this category yet
          </h3>
          <p className="text-xs text-charcoal-500">
            Check back soon as our studio crafts new handmade batches daily!
          </p>
        </div>
      )}
    </section>
  );
}
