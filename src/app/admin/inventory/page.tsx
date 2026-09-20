import React from 'react';
import { getAdminFromSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { Boxes } from 'lucide-react';

export default async function AdminInventoryPage() {
  const admin = await getAdminFromSession();
  if (!admin) redirect('/admin/login');

  let products: any[] = [];
  try {
    products = await prisma.product.findMany({
      where: { deletedAt: null },
      orderBy: { stock: 'asc' },
    });
  } catch (err) {
    console.error('Error fetching inventory products:', err);
  }

  return (
    <div className="p-6 sm:p-10 space-y-6 max-w-7xl w-full mx-auto">
      <div className="flex items-center gap-3 bg-white p-6 rounded-3xl border border-cream-300 shadow-soft">
        <div>
          <span className="text-xs uppercase tracking-widest font-semibold text-terracotta-600">
            Stock Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif text-charcoal-900 mt-1">
            Inventory & Stock Tracking
          </h1>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-cream-300 shadow-soft p-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-charcoal-700">
            <thead className="bg-cream-100 text-charcoal-900 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3">Product Name</th>
                <th className="p-3">SKU</th>
                <th className="p-3">Stock Remaining</th>
                <th className="p-3">Low Stock Warning Threshold</th>
                <th className="p-3 text-right">Stock Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-charcoal-500 font-medium">
                    No products found in inventory.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-cream-50 transition-colors">
                    <td className="p-3 font-semibold text-charcoal-900">{p.name}</td>
                    <td className="p-3 font-mono text-charcoal-600">{p.sku}</td>
                    <td className="p-3 font-bold text-charcoal-900">{p.stock} units</td>
                    <td className="p-3 text-charcoal-500">{p.lowStockThreshold} units</td>
                    <td className="p-3 text-right">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          p.stock <= p.lowStockThreshold
                            ? 'bg-red-100 text-red-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {p.stock <= p.lowStockThreshold ? 'Low Stock Warning' : 'Healthy Stock'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
