import { NextResponse } from 'next/server';
import { getAdminFromSession, logAdminAction } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  const admin = await getAdminFromSession();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { productId } = await request.json();
    if (!productId) {
      return NextResponse.json({ error: 'Missing product ID' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Soft delete execution: set deletedAt timestamp so storefront hides it, while historical orders remain intact
    await prisma.product.update({
      where: { id: productId },
      data: { deletedAt: new Date(), published: false },
    });

    await logAdminAction(
      'PRODUCT_SOFT_DELETED',
      `Soft deleted product "${product.name}" (SKU: ${product.sku}). Historical order records preserved.`,
      admin.name
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error soft deleting product:', err);
    return NextResponse.json({ error: 'Server error during product deletion.' }, { status: 500 });
  }
}
