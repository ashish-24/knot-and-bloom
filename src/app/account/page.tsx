import React from 'react';
import Navbar from '@/components/store/Navbar';
import Footer from '@/components/store/Footer';
import MobileNav from '@/components/store/MobileNav';
import { getCustomerFromSession } from '@/lib/customerAuth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { User, Package, Clock, LogOut, CheckCircle2, ArrowRight, Heart, MapPin } from 'lucide-react';
import CustomerLogoutButton from '@/components/store/CustomerLogoutButton';

export default async function CustomerAccountPage() {
  const customer = await getCustomerFromSession();

  if (!customer) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream-100 text-charcoal-900 pb-20 lg:pb-0">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Profile Banner */}
        <div className="p-6 sm:p-8 bg-white rounded-3xl border border-cream-300 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-brand-800 text-cream-100 font-serif font-bold text-xl flex items-center justify-center shadow-md">
              {customer.name.charAt(0)}
            </div>
            <div>
              <span className="text-xs uppercase tracking-widest font-semibold text-terracotta-600">
                Customer Account
              </span>
              <h1 className="text-2xl font-serif font-semibold text-charcoal-900">{customer.name}</h1>
              <p className="text-xs text-charcoal-500">{customer.mobile} {customer.email && `• ${customer.email}`}</p>
            </div>
          </div>

          <CustomerLogoutButton />
        </div>

        {/* Order History Timeline Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif font-semibold text-charcoal-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-brand-700" /> Your Order History ({customer.orders.length})
            </h2>
          </div>

          {customer.orders.length === 0 ? (
            <div className="p-12 bg-white rounded-3xl border border-cream-300 text-center space-y-3 shadow-soft">
              <Package className="w-10 h-10 text-charcoal-400 mx-auto" />
              <h3 className="text-base font-serif text-charcoal-800">No orders placed yet</h3>
              <p className="text-xs text-charcoal-500 max-w-xs mx-auto">
                Explore our handcrafted crochet scrunchies, resin keychains, and gift hampers.
              </p>
              <Link
                href="/shop"
                className="inline-block mt-2 px-6 py-2.5 bg-brand-800 text-cream-100 rounded-full text-xs font-semibold uppercase tracking-wider"
              >
                Explore Workshop Catalog
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {customer.orders.map((order) => (
                <div
                  key={order.id}
                  className="p-6 bg-white rounded-3xl border border-cream-300 shadow-soft space-y-4 hover:border-brand-300 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cream-200 pb-3">
                    <div>
                      <span className="text-xs font-mono font-bold text-brand-900">{order.orderNumber}</span>
                      <span className="text-xs text-charcoal-500 block">
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-charcoal-900">₹{order.total}</span>
                      <span className="px-3 py-1 bg-brand-100 text-brand-900 rounded-full text-xs font-semibold">
                        {order.status}
                      </span>
                      <Link
                        href={`/order/${order.id}`}
                        className="p-2 text-brand-800 hover:bg-brand-50 rounded-lg transition-colors"
                        title="View Detailed Status Timeline"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-charcoal-700">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <span className="font-semibold text-charcoal-900">
                          {item.product.name} (x{item.quantity})
                        </span>
                        <span className="text-charcoal-600">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}
