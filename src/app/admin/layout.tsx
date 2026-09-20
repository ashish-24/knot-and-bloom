import React from 'react';
import { getAdminFromSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminFromSession();

  // If not authenticated and not on login page (handled in page component), redirect
  // Note: Next.js headers check allows routing login page cleanly
  return (
    <div className="min-h-screen bg-cream-200/50 flex flex-col md:flex-row">
      {admin && <AdminSidebar admin={admin} />}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
