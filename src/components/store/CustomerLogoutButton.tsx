'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Trash2 } from 'lucide-react';

export default function CustomerLogoutButton() {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleLogout = async () => {
    await fetch('/api/customer/logout', { method: 'POST' });
    router.push('/login');
  };

  const handleDeleteAccount = async () => {
    if (!confirm('⚠️ Are you sure you want to delete your customer user account? This cannot be undone.')) return;

    setDeleting(true);
    try {
      const res = await fetch('/api/customer/delete-account', { method: 'POST' });
      if (res.ok) {
        alert('Your customer account has been deleted.');
        router.push('/login');
      } else {
        alert('Failed to delete account.');
      }
    } catch (e) {
      alert('Error deleting account.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-cream-200 hover:bg-cream-300 text-charcoal-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-cream-300 shadow-xs"
      >
        <LogOut className="w-4 h-4 text-charcoal-700" />
        <span>Sign Out</span>
      </button>

      <button
        onClick={handleDeleteAccount}
        disabled={deleting}
        className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-red-200 shadow-xs disabled:opacity-50"
      >
        <Trash2 className="w-4 h-4 text-red-600" />
        <span>{deleting ? 'Deleting Account...' : 'Delete Account'}</span>
      </button>
    </div>
  );
}
