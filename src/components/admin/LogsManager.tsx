'use client';

import React, { useState } from 'react';
import { Trash2, ShieldCheck, Clock, RefreshCw, Filter } from 'lucide-react';

interface AuditLogItem {
  id: string;
  action: string;
  actor: string;
  details: string;
  createdAt: string | Date;
}

export default function LogsManager({ initialLogs }: { initialLogs: AuditLogItem[] }) {
  const [logs, setLogs] = useState<AuditLogItem[]>(initialLogs);
  const [daysToKeep, setDaysToKeep] = useState<string>('0');
  const [clearing, setClearing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/admin/logs');
      if (res.ok) {
        const data = await res.json();
        if (data.logs) setLogs(data.logs);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearLogs = async () => {
    const days = parseInt(daysToKeep, 10);
    const confirmMsg =
      days > 0
        ? `Are you sure you want to delete audit logs older than ${days} days?`
        : 'Are you sure you want to clear ALL security and administrative action logs?';

    if (!confirm(confirmMsg)) return;

    setClearing(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/admin/logs/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ daysToKeep: days > 0 ? days : undefined }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to clear logs');

      setMessage(data.message || 'Audit logs updated successfully.');
      setTimeout(() => window.location.reload(), 1000);
    } catch (err: any) {
      setError(err.message || 'Error clearing logs.');
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-cream-300 shadow-soft">
        <div>
          <span className="text-xs uppercase tracking-widest font-semibold text-terracotta-600 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Immutable Audit Trail
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif text-charcoal-900 mt-1">
            Security & Action Logs ({logs.length})
          </h1>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Audit history of all administrative actions, logins, product modifications, and payment verifications.
          </p>
        </div>

        {/* Clear / Purge Action Controls */}
        <div className="flex flex-wrap items-center gap-3 bg-cream-50 p-2 rounded-2xl border border-cream-300">
          <div className="flex items-center gap-1.5 text-xs text-charcoal-700 px-2 font-medium">
            <Filter className="w-3.5 h-3.5 text-terracotta-600" />
            <span>Purge Range:</span>
          </div>

          <select
            value={daysToKeep}
            onChange={(e) => setDaysToKeep(e.target.value)}
            className="px-3 py-2 bg-white border border-cream-300 rounded-xl text-xs font-semibold outline-none focus:border-brand-600 text-charcoal-900 cursor-pointer"
          >
            <option value="0">Clear ALL Logs</option>
            <option value="7">Older than 7 Days</option>
            <option value="14">Older than 14 Days</option>
            <option value="30">Older than 30 Days</option>
            <option value="90">Older than 90 Days</option>
          </select>

          <button
            type="button"
            onClick={handleClearLogs}
            disabled={clearing}
            className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{clearing ? 'Clearing Logs...' : 'Clear Audit Logs'}</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl text-xs font-semibold border border-emerald-200">
          {message}
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-semibold border border-red-200">
          {error}
        </div>
      )}

      {/* Logs Table */}
      <div className="bg-white rounded-3xl border border-cream-300 shadow-soft p-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-charcoal-700">
            <thead className="bg-cream-100 text-charcoal-900 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Action Event</th>
                <th className="p-3">Actor</th>
                <th className="p-3">Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-charcoal-500 font-medium">
                    No security or administrative action logs recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-cream-50 transition-colors">
                    <td className="p-3 font-mono text-charcoal-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="p-3 font-bold text-brand-900">
                      <span className="px-2 py-0.5 bg-cream-200 rounded font-mono text-[11px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-charcoal-900">{log.actor}</td>
                    <td className="p-3 text-charcoal-700">{log.details}</td>
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
