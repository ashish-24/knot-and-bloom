import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { calculateCartTotals } from '@/lib/price';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerMobile,
      customerEmail,
      address,
      city,
      state,
      pincode,
      landmark,
      cartItems,
    } = body;

    if (!customerName || !customerMobile || !address || !pincode || !cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Missing mandatory checkout information.' },
        { status: 400 }
      );
    }

    // 1. Calculate authoritative server price
    const totals = await calculateCartTotals(cartItems);

    if (totals.items.length === 0) {
      return NextResponse.json(
        { error: 'No valid products in cart.' },
        { status: 400 }
      );
    }

    // 2. Generate unique Order Number e.g. ORD-1024
    const count = await prisma.order.count();
    const orderNumber = `ORD-${1024 + count}`;

    // 3. Database Transaction: Create order & order items, update inventory
    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          customerName,
          customerMobile,
          customerEmail: customerEmail || null,
          address,
          city,
          state,
          pincode,
          landmark: landmark || null,
          subtotal: totals.subtotal,
          deliveryFee: totals.deliveryFee,
          discount: totals.discount,
          total: totals.finalTotal,
          status: 'Pending Payment',
          items: {
            create: totals.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.unitPrice,
              customizationFee: item.customizationFee,
              customizationDetails: item.customizationDetails
                ? JSON.stringify(item.customizationDetails)
                : null,
            })),
          },
        },
      });

      // Deduct stock for each item
      for (const item of totals.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
            salesCount: { increment: item.quantity },
          },
        });

        await tx.inventoryMovement.create({
          data: {
            productId: item.productId,
            change: -item.quantity,
            reason: `ORDER_${createdOrder.orderNumber}`,
          },
        });
      }

      return createdOrder;
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      total: order.total,
    });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Server error creating order.' },
      { status: 500 }
    );
  }
}
