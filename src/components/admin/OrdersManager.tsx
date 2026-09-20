'use client';

import React, { useState } from 'react';
import { ShoppingBag, Truck, CheckCircle2, Clock, Trash2, AlertCircle } from 'lucide-react';

interface AdminOrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  customerMobile: string;
  total: number;
  status: string;
  address: string;
  city: string;
  state: string;
  createdAt: string;
}

const allStatuses = [
  'Pending Payment',
  'Payment Submitted',
  'Payment Verified',
  'Confirmed',
  'Preparing',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
];

export default function OrdersManager({ initialOrders }: { initialOrders: AdminOrderItem[] }) {
  const [orders, setOrders] = useState<AdminOrderItem[]>(initialOrders);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [clearingAll, setClearingAll] = useState(false);
  const [msg, setMsg] = useState('');

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch('/api/admin/orders/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteOrder = async (orderId: string, orderNum: string) => {
    if (!confirm(`Are you sure you want to remove Order #${orderNum} from database history?`)) return;

    setDeletingId(orderId);
    try {
      const res = await fetch('/api/admin/orders/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();
      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        setMsg(`✓ Order #${orderNum} deleted successfully!`);
      } else {
        alert(data.error || 'Failed to delete order');
      }
    } catch (err) {
      alert('Error deleting order');
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAllOrders = async () => {
    if (!confirm('⚠️ CAUTION: Are you sure you want to permanently delete ALL order history from the database? This action cannot be undone.')) return;

    setClearingAll(true);
    try {
      const res = await fetch('/api/admin/orders/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clearAll: true }),
      });

      const data = await res.json();
      if (res.ok) {
        setOrders([]);
        setMsg(`✓ ${data.message || 'All order history deleted successfully!'}`);
      } else {
        alert(data.error || 'Failed to clear order history');
      }
    } catch (err) {
      alert('Error clearing order history');
    } finally {
      setClearingAll(false);
    }
  };

  return (
    <div className="p-6 sm:p-10 space-y-6 max-w-7xl w-full mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-cream-300 shadow-soft">
        <div>
          <span className="text-xs uppercase tracking-widest font-semibold text-terracotta-600">
            Fulfillment & Order History Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif text-charcoal-900 mt-1">
            Customer Orders ({orders.length})
          </h1>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Update order fulfillment status or delete test orders / clear order history.
          </p>
        </div>

        {orders.length > 0 && (
          <button
            type="button"
            onClick={handleClearAllOrders}
            disabled={clearingAll}
            className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
            <span>{clearingAll ? 'Clearing All History...' : 'Clear All Order History'}</span>
          </button>
        )}
      </div>

      {msg && (
        <div className="p-4 bg-emerald-50 text-emerald-900 rounded-2xl text-xs font-bold border border-emerald-200 flex items-center justify-between">
          <span>{msg}</span>
          <button onClick={() => setMsg('')} className="text-emerald-700 hover:text-emerald-950 text-xs">Dismiss</button>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-cream-300 shadow-soft p-6 overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <ShoppingBag className="w-10 h-10 text-charcoal-300 mx-auto" />
            <h3 className="text-base font-serif font-semibold text-charcoal-800">No Orders in Database History</h3>
            <p className="text-xs text-charcoal-500">Order history is completely clean.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-charcoal-700">
              <thead className="bg-cream-100 text-charcoal-900 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Order #</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Address</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Current Status</th>
                  <th className="p-3">Update Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-cream-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-brand-900">{o.orderNumber}</td>
                    <td className="p-3">
                      <span className="font-semibold text-charcoal-900 block">{o.customerName}</span>
                      <span className="text-[11px] text-charcoal-500">{o.customerMobile}</span>
                    </td>
                    <td className="p-3 text-charcoal-600 max-w-48 truncate">
                      {o.address}, {o.city}
                    </td>
                    <td className="p-3 font-bold text-charcoal-900">₹{o.total}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 bg-brand-100 text-brand-900 rounded-full font-semibold text-[10px]">
                        {o.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <select
                        value={o.status}
                        disabled={updatingId === o.id}
                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        className="px-3 py-1.5 bg-cream-100 border border-cream-300 rounded-xl text-xs font-medium outline-none cursor-pointer focus:border-brand-600"
                      >
                        {allStatuses.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteOrder(o.id, o.orderNumber)}
                        disabled={deletingId === o.id}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50 inline-flex items-center gap-1 font-semibold text-xs"
                        title="Remove Order from History"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
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
