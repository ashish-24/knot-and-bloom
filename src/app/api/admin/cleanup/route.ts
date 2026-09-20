import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const expiredCarts = await prisma.cart.count({
      where: {
        updatedAt: {
          lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    });

    const expiredOtps = await prisma.customer.count({
      where: {
        otpExpiresAt: {
          lt: new Date(),
        },
      },
    });

    const totalCustomers = await prisma.customer.count();
    const totalOrders = await prisma.order.count();
    const totalProducts = await prisma.product.count({ where: { deletedAt: null } });

    let uploadFilesCount = 0;
    let uploadTotalSizeBytes = 0;
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      uploadFilesCount = files.length;
      files.forEach((file) => {
        try {
          const stats = fs.statSync(path.join(uploadsDir, file));
          uploadTotalSizeBytes += stats.size;
        } catch (e) {
          // ignore unreadable files
        }
      });
    }

    const uploadTotalMB = (uploadTotalSizeBytes / (1024 * 1024)).toFixed(2);
    const requiresAlert = expiredCarts > 50 || uploadFilesCount > 200 || Number(uploadTotalMB) > 50;

    return NextResponse.json({
      success: true,
      stats: {
        expiredCarts,
        expiredOtps,
        totalCustomers,
        totalOrders,
        totalProducts,
        uploadFilesCount,
        uploadTotalMB: `${uploadTotalMB} MB`,
        requiresAlert,
      },
      alertMessage: requiresAlert
        ? `⚠️ Admin Storage Alert: Found ${expiredCarts} abandoned carts and ${uploadFilesCount} files (${uploadTotalMB} MB) in storage. Click 'Run 1-Click Storage Cleanup' to free space.`
        : null,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch storage status' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch (e) {
      body = {};
    }

    const { clearOrders, clearCustomers } = body;
    let extraDetails = [];

    // 1. One-Click Cleanup: Delete expired guest carts (older than 7 days)
    const deletedCarts = await prisma.cart.deleteMany({
      where: {
        updatedAt: {
          lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    });

    // 2. Clear expired OTP codes
    const clearedOtps = await prisma.customer.updateMany({
      where: {
        otpExpiresAt: {
          lt: new Date(),
        },
      },
      data: {
        otpCode: null,
        otpExpiresAt: null,
      },
    });

    // 3. Clear old audit logs older than 30 days
    const deletedLogs = await prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    });

    // 4. If clearOrders requested: Delete all orders, payment receipts & order items
    let deletedOrdersCount = 0;
    if (clearOrders) {
      await prisma.payment.deleteMany();
      await prisma.orderItem.deleteMany();
      const oResult = await prisma.order.deleteMany();
      deletedOrdersCount = oResult.count;
      extraDetails.push(`purged ${deletedOrdersCount} order records`);
    }

    // 5. If clearCustomers requested: Delete all customer user accounts
    let deletedCustomersCount = 0;
    if (clearCustomers) {
      await prisma.order.updateMany({ data: { customerId: null } });
      await prisma.customerSession.deleteMany();
      await prisma.review.deleteMany();
      const cResult = await prisma.customer.deleteMany();
      deletedCustomersCount = cResult.count;
      extraDetails.push(`purged ${deletedCustomersCount} customer users`);
    }

    // Log the cleanup action in AuditLog
    await prisma.auditLog.create({
      data: {
        action: 'STORAGE_CLEANUP',
        actor: 'Admin',
        details: `Purged ${deletedCarts.count} abandoned carts, reset ${clearedOtps.count} OTPs, cleared ${deletedLogs.count} logs` +
          (extraDetails.length > 0 ? `, and ${extraDetails.join(', ')}.` : '.'),
      },
    });

    return NextResponse.json({
      success: true,
      message: `1-Click Cleanup Complete! Purged ${deletedCarts.count} abandoned carts, reset ${clearedOtps.count} OTPs, cleared ${deletedLogs.count} logs` +
        (extraDetails.length > 0 ? ` and ${extraDetails.join(', ')}.` : '.'),
      purged: {
        carts: deletedCarts.count,
        otps: clearedOtps.count,
        logs: deletedLogs.count,
        orders: deletedOrdersCount,
        customers: deletedCustomersCount,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Cleanup operation failed' }, { status: 500 });
  }
}
