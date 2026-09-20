'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

interface ShopFiltersBarProps {
  categorySlug?: string;
  filterType?: string;
  sort: string;
  categories: CategoryItem[];
}

export default function ShopFiltersBar({
  categorySlug,
  filterType,
  sort,
  categories,
}: ShopFiltersBarProps) {
  const router = useRouter();

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value;
    const params = new URLSearchParams();
    if (categorySlug) params.set('category', categorySlug);
    if (filterType) params.set('filter', filterType);
    params.set('sort', newSort);
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-cream-300 shadow-soft mb-8">
      {/* Quick Filter Pill Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/shop"
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            !categorySlug && !filterType ? 'bg-brand-800 text-cream-100' : 'bg-cream-200 text-charcoal-700 hover:bg-cream-300'
          }`}
        >
          All Items
        </Link>

        <Link
          href="/shop?filter=customizable"
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 transition-colors ${
            filterType === 'customizable' ? 'bg-terracotta-500 text-white' : 'bg-cream-200 text-charcoal-700 hover:bg-cream-300'
          }`}
        >
          <Sparkles className="w-3 h-3" /> Customizable
        </Link>

        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/shop?category=${cat.slug}`}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              categorySlug === cat.slug ? 'bg-brand-800 text-cream-100' : 'bg-cream-200 text-charcoal-700 hover:bg-cream-300'
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {/* Sort Selector */}
      <div className="flex items-center gap-2 text-xs font-medium text-charcoal-700">
        <span>Sort by:</span>
        <select
          value={sort}
          onChange={handleSortChange}
          className="px-3 py-1.5 bg-cream-100 border border-cream-300 rounded-lg text-xs outline-none cursor-pointer"
        >
          <option value="newest">Newest Arrivals</option>
          <option value="popular">Most Popular</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>
    </div>
  );
}
