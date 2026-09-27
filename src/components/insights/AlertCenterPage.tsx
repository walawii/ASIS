import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Info,
  Check,
  XCircle,
  ExternalLink,
} from 'lucide-react';

export const AlertCenterPage: React.FC = () => {
  const { alerts, markAlertRead, markAllAlertsRead, setCurrentView } = useApp();

  const [filterType, setFilterType] = useState<'ALL' | 'UNREAD' | 'DANGER' | 'WARNING'>('ALL');

  const filteredAlerts = alerts.filter((a) => {
    if (filterType === 'UNREAD') return !a.read;
    if (filterType === 'DANGER') return a.type === 'danger';
    if (filterType === 'WARNING') return a.type === 'warning';
    return true;
  });

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Bell className="h-6 w-6 text-rose-400" />
              <span>Alert Center (Pusat Peringatan & Anomali)</span>
            </h1>
            <span className="rounded-full bg-rose-500/20 px-2.5 py-0.5 text-xs font-semibold text-rose-300">
              Shopee Anomaly Detection
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Peringatan instan ketika ROAS turun di bawah BEP, profit tergerus, atau stok kritis mendekati nol.
          </p>
        </div>

        <button
          onClick={markAllAlertsRead}
          className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:text-white transition self-start sm:self-auto"
        >
          <Check className="h-4 w-4 text-emerald-400" />
          <span>Tandai Semua Sudah Dibaca</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs">
        <button
          onClick={() => setFilterType('ALL')}
          className={`px-3 py-1.5 rounded-xl font-medium transition ${
            filterType === 'ALL'
              ? 'bg-orange-500 text-white font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Semua Alert ({alerts.length})
        </button>
        <button
          onClick={() => setFilterType('UNREAD')}
          className={`px-3 py-1.5 rounded-xl font-medium transition ${
            filterType === 'UNREAD'
              ? 'bg-orange-500 text-white font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Belum Dibaca ({alerts.filter((a) => !a.read).length})
        </button>
        <button
          onClick={() => setFilterType('DANGER')}
          className={`px-3 py-1.5 rounded-xl font-medium transition ${
            filterType === 'DANGER'
              ? 'bg-rose-500 text-white font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Bahaya / Boncos
        </button>
        <button
          onClick={() => setFilterType('WARNING')}
          className={`px-3 py-1.5 rounded-xl font-medium transition ${
            filterType === 'WARNING'
              ? 'bg-amber-500 text-slate-950 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Waspada
        </button>
      </div>

      {/* Alert Items */}
      <div className="space-y-3">
        {filteredAlerts.map((a) => (
          <div
            key={a.id}
            onClick={() => markAlertRead(a.id)}
            className={`rounded-2xl border p-4 sm:p-5 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              !a.read
                ? 'border-slate-700 bg-slate-900 shadow-md'
                : 'border-slate-800/80 bg-slate-900/40 opacity-80'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                {a.type === 'danger' && <AlertTriangle className="h-5 w-5 text-rose-400" />}
                {a.type === 'warning' && <AlertTriangle className="h-5 w-5 text-amber-400" />}
                {a.type === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
                {a.type === 'info' && <Info className="h-5 w-5 text-blue-400" />}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-white">{a.title}</h3>
                  {!a.read && (
                    <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
                  )}
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{a.message}</p>
                <div className="text-[10px] text-slate-500 mt-1.5">{a.timestamp}</div>
              </div>
            </div>

            {a.actionTarget && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  markAlertRead(a.id);
                  setCurrentView(a.actionTarget as any);
                }}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-orange-400 hover:text-orange-300 transition self-start sm:self-auto"
              >
                <span>{a.actionText || 'Tinjau'}</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
