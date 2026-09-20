import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCustomerFromSession } from '@/lib/customerAuth';

export async function POST(request: Request) {
  try {
    const customer = await getCustomerFromSession();
    const body = await request.json();
    const { productId, rating, title, comment, authorName, imageUrl } = body;

    if (!productId || !comment || !rating) {
      return NextResponse.json(
        { error: 'Product ID, rating (1-5 stars), and review comment are required.' },
        { status: 400 }
      );
    }

    const numericRating = Math.min(5, Math.max(1, parseInt(rating || '5')));

    // Check if product exists
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    const reviewAuthor = customer?.name || authorName || 'Verified Artisan Buyer';

    // Create Review in DB
    const review = await prisma.review.create({
      data: {
        productId,
        customerId: customer?.id || null,
        authorName: reviewAuthor,
        rating: numericRating,
        title: title || 'Handcrafted Excellence',
        comment,
        imageUrl: imageUrl || null,
        verified: true,
      },
    });

    // Recalculate average rating & review count for the product
    const allReviews = await prisma.review.findMany({
      where: { productId },
      select: { rating: true },
    });

    const totalReviews = allReviews.length;
    const avgRating =
      totalReviews > 0
        ? parseFloat(
            (allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
          )
        : 5.0;

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: avgRating,
        reviewCount: totalReviews,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully!',
      review,
      avgRating,
      totalReviews,
    });
  } catch (err: any) {
    console.error('Error adding product review:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to submit review.' },
      { status: 500 }
    );
  }
}
