import React from 'react';
import Navbar from '@/components/store/Navbar';
import Footer from '@/components/store/Footer';
import MobileNav from '@/components/store/MobileNav';
import ProductCustomizer from '@/components/product/ProductCustomizer';
import ProductReviewsSection from '@/components/product/ProductReviewsSection';
import ProductCard from '@/components/store/ProductCard';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug, published: true, deletedAt: null },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      variants: true,
      customizationOpts: true,
      asset3d: true,
      category: true,
      reviews: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!product) {
    notFound();
  }

  const storeSettings = await prisma.storeSettings.findFirst();
  const whatsappNumber = storeSettings?.whatsappNumber || '919876543210';

  // Fetch related products from same category
  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      published: true,
      deletedAt: null,
    },
    take: 4,
  });

  return (
    <div className="min-h-screen flex flex-col bg-cream-100 text-charcoal-900 pb-20 lg:pb-0">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumbs */}
        <div className="mb-6 flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-terracotta-600">
          <Link href="/" className="hover:underline">Home</Link>
          <span>/</span>
          <Link href={`/shop?category=${product.category.slug}`} className="hover:underline">
            {product.category.name}
          </Link>
          <span>/</span>
          <span className="text-charcoal-500 truncate">{product.name}</span>
        </div>

        {/* Main Product Customizer Component */}
        <ProductCustomizer product={product} whatsappNumber={whatsappNumber} />

        {/* Detailed Product Specifications */}
        <div className="mt-16 p-8 bg-white rounded-3xl border border-cream-300 shadow-soft space-y-6">
          <h3 className="text-xl font-serif font-semibold text-charcoal-900 border-b border-cream-200 pb-3">
            Handcrafted Details & Care Instructions
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-charcoal-600">
            <div className="space-y-1">
              <span className="font-bold uppercase tracking-wider text-charcoal-800 block">Artisanal Material</span>
              <p>{product.material || 'Milk cotton yarn, epoxy resin, natural teak wood, dried botanicals.'}</p>
            </div>

            <div className="space-y-1">
              <span className="font-bold uppercase tracking-wider text-charcoal-800 block">Dimensions & Weight</span>
              <p>
                {product.dimensions || '5cm x 4cm'} {product.weight ? `(${product.weight})` : '(35 grams)'}
              </p>
            </div>

            <div className="space-y-1">
              <span className="font-bold uppercase tracking-wider text-charcoal-800 block">Care & Longevity</span>
              <p>
                {product.careInstructions || 'Hand wash gently with lukewarm water if yarn craft. Wipe resin pieces with soft dry cloth.'}
              </p>
            </div>
          </div>
        </div>

        {/* Customer Reviews & 5-Star Ratings with Direct Photo Upload */}
        <div className="mt-16">
          <ProductReviewsSection
            productId={product.id}
            productName={product.name}
            initialReviews={product.reviews}
            averageRating={product.rating}
            totalReviews={product.reviewCount}
          />
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-20">
            <h3 className="text-2xl font-serif text-charcoal-900 mb-8">
              You May Also Love
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}
