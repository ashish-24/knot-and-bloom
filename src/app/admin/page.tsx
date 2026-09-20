import React from 'react';
import { getAdminFromSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { CreditCard, ShoppingBag, Package, TrendingUp, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

export default async function AdminDashboardPage() {
  const admin = await getAdminFromSession();
  if (!admin) {
    redirect('/admin/login');
  }

  // Fetch summary stats
  const totalOrders = await prisma.order.count();
  const pendingPayments = await prisma.payment.count({
    where: { status: 'PAYMENT_SUBMITTED' },
  });
  const confirmedOrders = await prisma.order.count({
    where: { status: 'Confirmed' },
  });
  const productsCount = await prisma.product.count({
    where: { deletedAt: null },
  });

  // Calculate gross revenue of verified orders
  const verifiedOrders = await prisma.order.findMany({
    where: { status: { in: ['Payment Verified', 'Confirmed', 'Preparing', 'Shipped', 'Delivered'] } },
    select: { total: true },
  });
  const revenueTotal = verifiedOrders.reduce((sum, o) => sum + o.total, 0);

  // Fetch pending payment queue items for instant verification
  const pendingPaymentItems = await prisma.payment.findMany({
    where: { status: 'PAYMENT_SUBMITTED' },
    take: 5,
    include: { order: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="p-6 sm:p-10 space-y-8 max-w-7xl w-full mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-cream-300 shadow-soft">
        <div>
          <span className="text-xs uppercase tracking-widest font-semibold text-terracotta-600">
            Knot & Bloom Studio Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif text-charcoal-900 mt-1">
            Welcome back, {admin.name}
          </h1>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Monitor real-time customer orders, verify UPI payments, and manage catalog inventory.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/payments"
            className="px-4 py-2.5 bg-terracotta-600 hover:bg-terracotta-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs"
          >
            <CreditCard className="w-4 h-4" />
            <span>Verify UPI Payments ({pendingPayments})</span>
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-white rounded-3xl border border-cream-300 shadow-soft space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider">Gross Revenue</span>
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-charcoal-900">₹{revenueTotal.toLocaleString('en-IN')}</p>
          <span className="text-[11px] text-emerald-700 font-medium">From verified UPI orders</span>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-cream-300 shadow-soft space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider">Pending Payments</span>
            <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-amber-700">{pendingPayments}</p>
          <span className="text-[11px] text-amber-800 font-medium">Requires UTR verification</span>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-cream-300 shadow-soft space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider">Total Customer Orders</span>
            <div className="p-2 bg-brand-100 text-brand-800 rounded-xl">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-charcoal-900">{totalOrders}</p>
          <span className="text-[11px] text-charcoal-500">{confirmedOrders} confirmed & preparing</span>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-cream-300 shadow-soft space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider">Active Products</span>
            <div className="p-2 bg-cream-200 text-charcoal-800 rounded-xl">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-charcoal-900">{productsCount}</p>
          <span className="text-[11px] text-brand-700 font-medium">Live on storefront</span>
        </div>
      </div>

      {/* Pending Payment Verification Queue Table */}
      <div className="bg-white rounded-3xl border border-cream-300 shadow-soft p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-cream-200 pb-3">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-terracotta-600" />
            <h3 className="text-lg font-serif font-semibold text-charcoal-900">
              Pending Payment Proof Submissions
            </h3>
          </div>
          <Link
            href="/admin/payments"
            className="text-xs text-brand-800 hover:text-brand-900 font-semibold flex items-center gap-1"
          >
            <span>View All Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {pendingPaymentItems.length === 0 ? (
          <div className="text-center py-8 text-xs text-charcoal-500">
            ✨ All customer payments are fully verified! No pending screenshots in queue.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-charcoal-700">
              <thead className="bg-cream-100 text-charcoal-900 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Order #</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Submitted UTR</th>
                  <th className="p-3">Submitted At</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {pendingPaymentItems.map((pay) => (
                  <tr key={pay.id} className="hover:bg-cream-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-brand-900">{pay.order.orderNumber}</td>
                    <td className="p-3 font-semibold text-charcoal-900">{pay.order.customerName} ({pay.order.customerMobile})</td>
                    <td className="p-3 font-bold text-charcoal-900">₹{pay.order.total}</td>
                    <td className="p-3 font-mono text-terracotta-700">{pay.utrNumber}</td>
                    <td className="p-3 text-charcoal-500">
                      {new Date(pay.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        href="/admin/payments"
                        className="px-3 py-1.5 bg-brand-800 text-cream-100 rounded-lg text-xs font-semibold hover:bg-brand-900"
                      >
                        Inspect & Verify
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
