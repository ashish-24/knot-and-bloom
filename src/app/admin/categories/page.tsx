import React from 'react';
import { getAdminFromSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import CategoriesManager from '@/components/admin/CategoriesManager';

export default async function AdminCategoriesPage() {
  const admin = await getAdminFromSession();
  if (!admin) redirect('/admin/login');

  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: 'asc' },
  });

  const formattedCategories = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    image: c.image,
    _count: c._count,
  }));

  return <CategoriesManager initialCategories={formattedCategories} />;
}
