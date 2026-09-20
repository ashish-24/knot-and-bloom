'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Package, Plus, Trash2, Edit3, Sparkles, AlertCircle, Eye } from 'lucide-react';

interface AdminProductItem {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  stock: number;
  thumbnail: string;
  customizable: boolean;
  bestseller: boolean;
  published: boolean;
  categoryName: string;
}

export default function ProductsManager({ initialProducts }: { initialProducts: AdminProductItem[] }) {
  const [products, setProducts] = useState<AdminProductItem[]>(initialProducts);
  const [deleteModalProduct, setDeleteModalProduct] = useState<AdminProductItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!deleteModalProduct) return;
    setDeleting(true);

    try {
      const res = await fetch('/api/admin/products/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: deleteModalProduct.id }),
      });

      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== deleteModalProduct.id));
        setDeleteModalProduct(null);
      } else {
        alert('Failed to delete product.');
      }
    } catch (e) {
      alert('Error connecting to server.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6 sm:p-10 space-y-6 max-w-7xl w-full mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-cream-300 shadow-soft">
        <div>
          <span className="text-xs uppercase tracking-widest font-semibold text-terracotta-600">
            Catalog Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif text-charcoal-900 mt-1">
            Storefront Products ({products.length})
          </h1>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Add new products, edit price/stock, or safely soft-delete items without breaking order history.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="px-5 py-3 bg-brand-800 hover:bg-brand-900 text-cream-100 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-float"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-cream-300 shadow-soft p-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-charcoal-700">
            <thead className="bg-cream-100 text-charcoal-900 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3">Product</th>
                <th className="p-3">SKU</th>
                <th className="p-3">Category</th>
                <th className="p-3">Price</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Badges</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {products.map((prod) => (
                <tr key={prod.id} className="hover:bg-cream-50 transition-colors">
                  <td className="p-3 flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-cream-200 shrink-0">
                      <Image src={prod.thumbnail} alt={prod.name} fill className="object-cover" />
                    </div>
                    <div>
                      <span className="font-semibold text-charcoal-900 block">{prod.name}</span>
                    </div>
                  </td>
                  <td className="p-3 font-mono text-charcoal-600">{prod.sku}</td>
                  <td className="p-3 font-medium text-charcoal-800">{prod.categoryName}</td>
                  <td className="p-3 font-bold text-charcoal-900">₹{prod.price}</td>
                  <td className="p-3 font-semibold text-emerald-800">{prod.stock} left</td>
                  <td className="p-3">
                    {prod.customizable && (
                      <span className="px-2 py-0.5 bg-terracotta-100 text-terracotta-700 rounded-full font-bold text-[10px] mr-1">
                        Custom
                      </span>
                    )}
                    {prod.bestseller && (
                      <span className="px-2 py-0.5 bg-brand-100 text-brand-900 rounded-full font-bold text-[10px]">
                        Bestseller
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/admin/products/${prod.id}/edit`}
                        className="px-3 py-1.5 bg-brand-100 hover:bg-brand-200 text-brand-900 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors shadow-xs"
                        title="Edit & Update Product Details"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-terracotta-600" />
                        <span>Edit & Update</span>
                      </Link>

                      <Link
                        href={`/product/${prod.slug}`}
                        target="_blank"
                        className="p-1.5 bg-cream-100 hover:bg-cream-200 text-charcoal-700 rounded-xl text-xs font-semibold transition-colors"
                        title="Preview Live Product Page"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        onClick={() => setDeleteModalProduct(prod)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        title="Soft Delete Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Soft Delete Modal */}
      {deleteModalProduct && (
        <div className="fixed inset-0 z-50 bg-charcoal-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-cream-300">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-serif font-semibold text-charcoal-900">
                Confirm Soft Deletion
              </h3>
            </div>

            <p className="text-xs text-charcoal-600 leading-relaxed">
              Are you sure you want to remove <strong className="text-charcoal-900">"{deleteModalProduct.name}"</strong> from the public storefront?
            </p>
            <div className="p-3 bg-amber-50 rounded-xl text-[11px] text-amber-900 border border-amber-200">
              <strong>Soft Delete Protection:</strong> This product will be hidden from customer search & catalog immediately, but all historical customer orders and payment records associated with it will remain 100% safe.
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteModalProduct(null)}
                className="flex-1 py-2.5 bg-cream-200 hover:bg-cream-300 text-charcoal-800 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-semibold"
              >
                {deleting ? 'Deleting...' : 'Confirm Soft Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
