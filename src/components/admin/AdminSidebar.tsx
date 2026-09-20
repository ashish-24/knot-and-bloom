'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Logo from '@/components/ui/Logo';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  CreditCard,
  ShoppingBag,
  Boxes,
  Settings,
  ShieldCheck,
  LogOut,
  Sparkles,
  Box,
  FileText,
  Menu,
  X,
  Layers,
} from 'lucide-react';

export default function AdminSidebar({ admin }: { admin?: { name?: string; email?: string } }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  // If on login route, hide sidebar
  if (pathname === '/admin/login') return null;

  const adminName = admin?.name || 'Admin';
  const adminEmail = admin?.email || 'admin@knotandbloom.com';

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const navLinks = [
    { label: 'Dashboard Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Payment Verification', href: '/admin/payments', icon: CreditCard, badge: 'UPI' },
    { label: 'Orders Fulfillment', href: '/admin/orders', icon: ShoppingBag },
    { label: 'Category Manager', href: '/admin/categories', icon: Layers },
    { label: 'Product Catalog', href: '/admin/products', icon: Package },
    { label: 'Add New Product', href: '/admin/products/new', icon: PlusCircle },
    { label: 'Inventory Stock', href: '/admin/inventory', icon: Boxes },
    { label: 'Store & UPI Settings', href: '/admin/settings', icon: Settings },
    { label: 'Audit Security Logs', href: '/admin/logs', icon: ShieldCheck },
  ];

  return (
    <>
      {/* Mobile Sticky Top Header Bar */}
      <header className="md:hidden bg-charcoal-950 text-cream-200 border-b border-charcoal-800 p-4 flex items-center justify-between sticky top-0 z-50">
        <Logo variant="light" showSubtitle={false} />
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 text-cream-200 hover:text-white rounded-xl bg-charcoal-900 border border-charcoal-800 flex items-center gap-2 text-xs font-semibold"
          aria-label="Toggle Admin Navigation"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          <span>Menu</span>
        </button>
      </header>

      {/* Mobile Drawer Menu */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 bg-charcoal-950/95 backdrop-blur-md z-40 p-6 flex flex-col justify-between overflow-y-auto pt-20">
          <div className="space-y-6">
            <div className="p-3 bg-charcoal-900 rounded-2xl border border-charcoal-800 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-800 text-cream-100 flex items-center justify-center text-xs font-bold">
                {adminName.charAt(0)}
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-semibold text-cream-100 truncate">{adminName}</h4>
                <p className="text-[10px] text-charcoal-400 truncate">{adminEmail}</p>
              </div>
            </div>

            <nav className="space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-800 text-cream-100 font-semibold'
                        : 'text-charcoal-300 hover:text-cream-100 hover:bg-charcoal-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-terracotta-400' : ''}`} />
                      <span>{link.label}</span>
                    </div>
                    {link.badge && (
                      <span className="px-2 py-0.5 bg-terracotta-600 text-white rounded text-[10px] font-bold">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="pt-6 border-t border-charcoal-800 space-y-3">
            <Link
              href="/"
              target="_blank"
              onClick={() => setIsMobileOpen(false)}
              className="text-xs text-charcoal-400 hover:text-cream-100 flex items-center gap-2"
            >
              <span>View Public Storefront ↗</span>
            </Link>

            <button
              onClick={handleLogout}
              className="w-full py-3 px-3 bg-charcoal-900 hover:bg-red-950/60 text-red-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-charcoal-800"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out Session</span>
            </button>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
    <aside className="w-64 bg-charcoal-950 text-cream-200 border-r border-charcoal-800 flex flex-col justify-between shrink-0 hidden md:flex min-h-screen">
      {/* Brand Header */}
      <div className="p-6 space-y-6">
        <Logo variant="light" showSubtitle={true} />

        <div className="p-3 bg-charcoal-900 rounded-2xl border border-charcoal-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-800 text-cream-100 flex items-center justify-center text-xs font-bold">
            {adminName.charAt(0)}
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-semibold text-cream-100 truncate">{adminName}</h4>
            <p className="text-[10px] text-charcoal-400 truncate">{adminEmail}</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-800 text-cream-100 font-semibold'
                    : 'text-charcoal-400 hover:text-cream-100 hover:bg-charcoal-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-terracotta-400' : ''}`} />
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span className="px-1.5 py-0.5 bg-terracotta-600 text-white rounded text-[10px] font-bold">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Logout */}
      <div className="p-6 border-t border-charcoal-800 space-y-3">
        <Link
          href="/"
          target="_blank"
          className="text-xs text-charcoal-400 hover:text-cream-100 flex items-center gap-2"
        >
          <span>View Public Storefront ↗</span>
        </Link>

        <button
          onClick={handleLogout}
          className="w-full py-2.5 px-3 bg-charcoal-900 hover:bg-red-950/60 text-red-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-charcoal-800"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out Session</span>
        </button>
      </div>
    </aside>
    </>
  );
}
