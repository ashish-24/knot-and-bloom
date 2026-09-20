'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import ThreadUnderline from '@/components/ui/ThreadUnderline';

export interface FeaturedCategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  products?: Array<{ thumbnail: string }>;
  _count?: { products: number };
}

const DEFAULT_CATEGORIES = [
  {
    id: 'cat-1',
    name: 'Keychains & Charms',
    slug: 'keychains-charms',
    count: '24+ designs',
    image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop',
    description: 'Resin initial bar, couple hearts, and photo charms.',
  },
  {
    id: 'cat-2',
    name: 'Handmade Home Decor',
    slug: 'home-decor',
    count: '15+ products',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop',
    description: 'Botanical wooden plaques & dried floral desk crafts.',
  },
  {
    id: 'cat-3',
    name: 'Curated Gift Hampers',
    slug: 'gift-hampers',
    count: '8 hampers',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop',
    description: 'Birthday bundles, candle sets, and wax-sealed cards.',
  },
  {
    id: 'cat-4',
    name: 'Personalized Keepsakes',
    slug: 'personalized-keepsakes',
    count: '12+ items',
    image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=800&auto=format&fit=crop',
    description: 'Acrylic 3D couple plaques & custom photo gifts.',
  },
];

export default function FeaturedCategories({ categories }: { categories?: FeaturedCategoryItem[] }) {
  const displayCategories =
    categories && categories.length > 0
      ? categories.map((cat, idx) => {
          const coverImg =
            cat.image ||
            (cat.products && cat.products.length > 0 ? cat.products[0].thumbnail : null) ||
            DEFAULT_CATEGORIES[idx % DEFAULT_CATEGORIES.length].image;

          const itemCount =
            cat._count?.products !== undefined
              ? `${cat._count.products} Products`
              : cat.products
              ? `${cat.products.length} Products`
              : 'Handcrafted';

          return {
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            count: itemCount,
            image: coverImg,
            description: cat.description || `Artisanal handcrafted ${cat.name.toLowerCase()}.`,
          };
        })
      : DEFAULT_CATEGORIES;

  return (
    <section className="py-16 sm:py-24 bg-cream-100 border-b border-cream-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest font-semibold text-terracotta-600">
              Curated Collections
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif text-charcoal-900 mt-1 inline-block relative">
              <span>Explore by Category</span>
              <ThreadUnderline />
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-sm font-semibold text-brand-800 hover:text-brand-900 flex items-center gap-1 group"
          >
            <span>View All Categories</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayCategories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/shop?category=${cat.slug}`}
              className="group relative h-80 rounded-3xl overflow-hidden shadow-soft hover:shadow-float transition-all duration-300 flex flex-col justify-end p-6 border border-cream-300 bg-cream-200"
            >
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/85 via-charcoal-950/25 to-transparent" />

              <div className="relative z-10 space-y-1 text-white">
                <span className="text-[11px] font-semibold text-cream-300 tracking-wider uppercase">
                  {cat.count}
                </span>
                <h3 className="text-xl font-serif font-semibold text-white group-hover:text-cream-200 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-cream-200/90 line-clamp-1">{cat.description}</p>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
