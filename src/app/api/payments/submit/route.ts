import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { validateImageUpload, saveUploadedPrivateFile } from '@/lib/security';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const orderId = formData.get('orderId') as string;
    const utrNumber = formData.get('utrNumber') as string;
    const screenshot = formData.get('screenshot') as File | null;

    if (!orderId || !utrNumber || !screenshot) {
      return NextResponse.json(
        { error: 'Missing order ID, UTR number, or screenshot file.' },
        { status: 400 }
      );
    }

    // Validate order exists
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    // Validate screenshot upload
    const validation = validateImageUpload(screenshot);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Save screenshot privately
    const screenshotUrl = await saveUploadedPrivateFile(screenshot, 'screenshots');

    // Create / Upsert Payment record
    const payment = await prisma.payment.upsert({
      where: { orderId },
      update: {
        utrNumber,
        screenshotUrl,
        status: 'PAYMENT_SUBMITTED',
      },
      create: {
        orderId,
        utrNumber,
        screenshotUrl,
        status: 'PAYMENT_SUBMITTED',
      },
    });

    // Update Order status
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'Payment Submitted' },
    });

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      status: payment.status,
    });
  } catch (error: any) {
    console.error('Error submitting payment:', error);
    return NextResponse.json(
      { error: 'Server error processing payment submission.' },
      { status: 500 }
    );
  }
}
