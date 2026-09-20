import React from 'react';
import { getAdminFromSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import ProductsManager from '@/components/admin/ProductsManager';

export default async function AdminProductsPage() {
  const admin = await getAdminFromSession();
  if (!admin) {
    redirect('/admin/login');
  }

  const rawProducts = await prisma.product.findMany({
    where: { deletedAt: null },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  });

  const products = rawProducts.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    price: p.price,
    stock: p.stock,
    thumbnail: p.thumbnail,
    customizable: p.customizable,
    bestseller: p.bestseller,
    published: p.published,
    categoryName: p.category.name,
  }));

  return <ProductsManager initialProducts={products} />;
}
