import React from 'react';
import Navbar from '@/components/store/Navbar';
import Footer from '@/components/store/Footer';
import MobileNav from '@/components/store/MobileNav';
import ProductCard from '@/components/store/ProductCard';
import ShopFiltersBar from '@/components/store/ShopFiltersBar';
import { prisma } from '@/lib/db';
import Link from 'next/link';

interface ShopPageProps {
  searchParams: {
    category?: string;
    filter?: string;
    sort?: string;
    q?: string;
  };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const categorySlug = searchParams.category;
  const filterType = searchParams.filter;
  const sort = searchParams.sort || 'newest';
  const search = searchParams.q;

  // Build Prisma query filters
  const where: any = {
    published: true,
    deletedAt: null,
  };

  if (categorySlug) {
    where.category = { slug: categorySlug };
  }

  if (filterType === 'customizable') {
    where.customizable = true;
  } else if (filterType === 'bestsellers') {
    where.bestseller = true;
  } else if (filterType === 'trending') {
    where.trending = true;
  }

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
      { tags: { contains: search } },
    ];
  }

  // Sorting order
  let orderBy: any = { createdAt: 'desc' };
  if (sort === 'price-asc') orderBy = { price: 'asc' };
  if (sort === 'price-desc') orderBy = { price: 'desc' };
  if (sort === 'popular') orderBy = { salesCount: 'desc' };

  const products = await prisma.product.findMany({
    where,
    include: { variants: true },
    orderBy,
  });

  const rawCategories = await prisma.category.findMany();
  const categories = rawCategories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
  }));

  return (
    <div className="min-h-screen flex flex-col bg-cream-100 text-charcoal-900 pb-16 lg:pb-0">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header Title Banner */}
        <div className="mb-8 space-y-2">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-terracotta-600">
            <Link href="/" className="hover:underline">Home</Link>
            <span>/</span>
            <span>Shop Catalog</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif text-charcoal-900">
            {categorySlug ? `${categorySlug.replace('-', ' ')} Collection` : 'All Handcrafted Pieces'}
          </h1>
          <p className="text-sm text-charcoal-500 max-w-xl">
            Discover our complete artisan catalog of custom resin keychains, botanical home decor, and personalized gift hampers.
          </p>
        </div>

        {/* Filter & Sort Bar */}
        <ShopFiltersBar
          categorySlug={categorySlug}
          filterType={filterType}
          sort={sort}
          categories={categories}
        />

        {/* Product Grid */}
        {products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-cream-300 p-8 space-y-4">
            <h3 className="text-xl font-serif text-charcoal-800">No items match your filter</h3>
            <p className="text-xs text-charcoal-500">Try clearing filters to explore our full workshop range.</p>
            <Link
              href="/shop"
              className="inline-block px-6 py-2.5 bg-brand-800 text-cream-100 text-xs font-semibold rounded-full uppercase tracking-wider"
            >
              Reset Filters
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}
