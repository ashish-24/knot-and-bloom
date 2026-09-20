import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminFromSession, logAdminAction } from '@/lib/auth';

// GET: Fetch all categories with product counts (Secured)
export async function GET() {
  try {
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized admin access.' }, { status: 401 });
    }

    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ categories });
  } catch (err: any) {
    console.error('Error fetching categories:', err);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

// POST: Create or Update Category (Secured)
export async function POST(req: Request) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized admin access.' }, { status: 401 });
    }

    const body = await req.json();
    const { id, name, slug, description, image } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Category name is required.' }, { status: 400 });
    }

    const categorySlug = slug && slug.trim() 
      ? slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
      : name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');

    if (id) {
      // Update Category
      const updated = await prisma.category.update({
        where: { id },
        data: {
          name: name.trim(),
          slug: categorySlug,
          description: description?.trim() || null,
          image: image?.trim() || null,
        },
      });

      await logAdminAction(
        'Category Updated',
        `Updated category: ${updated.name} (Slug: ${updated.slug})`,
        admin.name
      );

      return NextResponse.json({ success: true, category: updated });
    } else {
      // Check existing slug
      const existing = await prisma.category.findUnique({ where: { slug: categorySlug } });
      if (existing) {
        return NextResponse.json({ error: 'A category with this slug already exists.' }, { status: 400 });
      }

      // Create Category
      const created = await prisma.category.create({
        data: {
          name: name.trim(),
          slug: categorySlug,
          description: description?.trim() || null,
          image: image?.trim() || null,
        },
      });

      await logAdminAction(
        'Category Created',
        `Created category: ${created.name} (Slug: ${created.slug})`,
        admin.name
      );

      return NextResponse.json({ success: true, category: created });
    }
  } catch (err: any) {
    console.error('Error saving category:', err);
    return NextResponse.json({ error: err.message || 'Failed to save category.' }, { status: 500 });
  }
}

// DELETE: Remove Category safely (Secured)
export async function DELETE(req: Request) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized admin access.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required.' }, { status: 400 });
    }

    // Check if category has active products
    const productCount = await prisma.product.count({
      where: { categoryId: id, deletedAt: null },
    });

    if (productCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete category: ${productCount} active products are currently assigned to it.` },
        { status: 400 }
      );
    }

    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      return NextResponse.json({ error: 'Category not found.' }, { status: 404 });
    }

    await prisma.category.delete({ where: { id } });

    await logAdminAction(
      'Category Deleted',
      `Deleted category: ${category.name} (${category.slug})`,
      admin.name
    );

    return NextResponse.json({ success: true, message: 'Category deleted successfully.' });
  } catch (err: any) {
    console.error('Error deleting category:', err);
    return NextResponse.json({ error: err.message || 'Failed to delete category.' }, { status: 500 });
  }
}
