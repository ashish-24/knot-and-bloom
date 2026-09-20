import React from 'react';
import Navbar from '@/components/store/Navbar';
import Hero from '@/components/store/Hero';
import FeaturedCategories from '@/components/store/FeaturedCategories';
import FeaturedProductSlider from '@/components/store/FeaturedProductSlider';
import ProductShowcase from '@/components/store/ProductShowcase';
import ProductCard from '@/components/store/ProductCard';
import HandmadeStorySection from '@/components/store/HandmadeStorySection';
import Footer from '@/components/store/Footer';
import MobileNav from '@/components/store/MobileNav';
import BackgroundThreadCanvas from '@/components/store/BackgroundThreadCanvas';
import { prisma } from '@/lib/db';

export const revalidate = 60; // Revalidate dynamic catalog every 60 seconds

export default async function HomePage() {
  // Fetch seed/dynamic products from DB
  const allProducts = await prisma.product.findMany({
    where: { published: true, deletedAt: null },
    include: { category: true, variants: true },
    orderBy: { createdAt: 'desc' },
    take: 12,
  });

  const featuredProducts = allProducts.filter((p) => p.featured || p.bestseller || p.trending || p.giftPick);
  const displayFeatured = featuredProducts.length > 0 ? featuredProducts : allProducts;

  const formattedFeaturedProducts = displayFeatured.map((p, idx) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: p.price,
    originalPrice: p.originalPrice,
    thumbnail: p.thumbnail,
    shortDescription: p.shortDescription || p.description,
    rating: p.rating || 0,
    reviewCount: p.reviewCount || 0,
    badge: p.bestseller ? 'BEST SELLER' : p.trending ? 'TRENDING' : idx === 0 ? 'NEW' : 'POPULAR',
    customizable: p.customizable,
  }));

  const formattedShowcaseProducts = allProducts.map((p) => ({
    id: p.id,
    slug: p.slug,
    sku: p.sku,
    name: p.name,
    shortDescription: p.shortDescription || p.description || p.name,
    price: p.price,
    originalPrice: p.originalPrice || p.price,
    discount: p.discount || 0,
    thumbnail: p.thumbnail,
    stock: p.stock || 10,
    categoryName: p.category?.name,
    categorySlug: p.category?.slug,
    customizable: p.customizable,
    bestseller: p.bestseller,
    trending: p.trending,
    giftPick: p.giftPick,
    rating: p.rating,
    reviewCount: p.reviewCount,
    variants: p.variants.map((v) => ({
      id: v.id,
      name: v.name,
      colorHex: v.colorHex,
      imageUrl: v.imageUrl,
      priceAdjust: v.priceAdjust,
    })),
  }));

  // Fetch categories with product counts & cover images from DB
  const dbCategories = await prisma.category.findMany({
    include: {
      products: {
        where: { published: true, deletedAt: null },
        take: 1,
      },
      _count: {
        select: { products: true },
      },
    },
    take: 8,
  });

  return (
    <div className="min-h-screen flex flex-col bg-cream-100 text-charcoal-900 pb-16 lg:pb-0 relative overflow-hidden">
      <Navbar />

      <main className="flex-1 relative">
        {/* Continuous Animated Background Thread Work across Landing Page */}
        <BackgroundThreadCanvas />

        {/* Hero Section */}
        <Hero />

        {/* Featured Products Coverflow Slider */}
        <FeaturedProductSlider products={formattedFeaturedProducts} />

        {/* Featured Categories Section */}
        <FeaturedCategories categories={dbCategories} />

        {/* Interactive Artisanal Product Showcase with Category Tabs */}
        <ProductShowcase products={formattedShowcaseProducts} />

        {/* Handmade Story & Philosophy */}
        <HandmadeStorySection />
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}
