import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { calculateStockForecast } from '../../utils/calculatorEngine.ts';
import { CalendarDays, Clock, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

export const StockForecastPage: React.FC = () => {
  const { inventory } = useApp();

  const [leadTimeDays, setLeadTimeDays] = useState(7); // Waktu tunggu supplier
  const [safetyBufferDays, setSafetyBufferDays] = useState(5); // Buffer pengaman

  // Dynamic forecasts calculated for each item
  const forecasts = useMemo(() => {
    return inventory.map((item) => {
      const forecast = calculateStockForecast(
        item.currentStock,
        item.dailySales,
        leadTimeDays,
        safetyBufferDays
      );
      return {
        ...item,
        forecast,
      };
    });
  }, [inventory, leadTimeDays, safetyBufferDays]);

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <CalendarDays className="h-6 w-6 text-emerald-400" />
              <span>Stock Forecast & Prediksi Kehabisan Barang</span>
            </h1>
            <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
              Run-Out Timeline
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Hitung perkiraan tanggal habisnya stok fisik berdasarkan kecepatan order harian dan tentukan batas pemesanan ulang (Reorder Point).
          </p>
        </div>

        {/* Lead time setting */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-2 rounded-2xl text-xs">
          <div>
            <label className="text-[10px] text-slate-400 block font-medium">Lead Time Supplier</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={leadTimeDays}
                onChange={(e) => setLeadTimeDays(Number(e.target.value))}
                className="w-12 rounded border border-slate-700 bg-slate-950 px-1 py-0.5 text-xs text-white text-center"
              />
              <span className="text-slate-400 text-[11px]">hari</span>
            </div>
          </div>
          <div className="border-l border-slate-800 pl-3">
            <label className="text-[10px] text-slate-400 block font-medium">Safety Buffer</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={safetyBufferDays}
                onChange={(e) => setSafetyBufferDays(Number(e.target.value))}
                className="w-12 rounded border border-slate-700 bg-slate-950 px-1 py-0.5 text-xs text-white text-center"
              />
              <span className="text-slate-400 text-[11px]">hari</span>
            </div>
          </div>
        </div>
      </div>

      {/* Forecast Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {forecasts.map((f) => (
          <div
            key={f.id}
            className={`rounded-2xl border p-5 shadow-lg space-y-4 transition ${
              f.forecast.status === 'KRITIS'
                ? 'border-rose-500/40 bg-gradient-to-b from-slate-900 to-rose-950/20'
                : f.forecast.status === 'WASPADA'
                ? 'border-amber-500/40 bg-gradient-to-b from-slate-900 to-amber-950/20'
                : 'border-slate-800 bg-slate-900/80'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300">
                  {f.sku}
                </span>
                <h3 className="font-bold text-sm text-white mt-1">{f.productName}</h3>
                <div className="text-[11px] text-slate-400 mt-0.5">{f.category}</div>
              </div>

              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  f.forecast.status === 'KRITIS'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : f.forecast.status === 'WASPADA'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {f.forecast.status}
              </span>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-800 text-xs text-center">
              <div>
                <div className="text-[10px] text-slate-400 uppercase">Stok Tersedia</div>
                <div className="text-base font-black text-white mt-0.5">
                  {f.currentStock} pcs
                </div>
              </div>

              <div>
                <div className="text-[10px] text-slate-400 uppercase">Laju Jual / Hari</div>
                <div className="text-base font-black text-purple-400 mt-0.5">
                  {f.dailySales} pcs
                </div>
              </div>

              <div>
                <div className="text-[10px] text-slate-400 uppercase">Perkiraan Habis</div>
                <div
                  className={`text-base font-black mt-0.5 ${
                    f.forecast.daysRemaining <= 4 ? 'text-rose-400' : 'text-amber-300'
                  }`}
                >
                  {f.forecast.daysRemaining} hari
                </div>
              </div>
            </div>

            {/* Recommendation banner */}
            <div className="rounded-xl bg-slate-950 p-3 text-xs flex items-center justify-between border border-slate-800">
              <div className="flex items-center gap-2 text-slate-300">
                <Clock className="h-4 w-4 text-orange-400 shrink-0" />
                <span>
                  Estimasi kehabisan stok pada: <strong className="text-white">{f.forecast.estimatedRunOutDate}</strong>
                </span>
              </div>
              {f.forecast.reorderRecommendationUnits > 0 && (
                <span className="text-[11px] font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                  PO: {Math.ceil(f.forecast.reorderRecommendationUnits)} pcs
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              💡 {f.forecast.statusMessage}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
