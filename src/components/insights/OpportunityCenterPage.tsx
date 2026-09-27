import React from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  Lightbulb,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  Flame,
  CheckCircle2,
  DollarSign,
  Package,
} from 'lucide-react';

export const OpportunityCenterPage: React.FC = () => {
  const { opportunities, setCurrentView } = useApp();

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-emerald-400" />
              <span>Opportunity Center (Rule-Based Growth Engine)</span>
            </h1>
            <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
              {opportunities.length} Peluang Terdeteksi
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Sistem menganalisis data pesanan, margin, stok, dan iklan secara deterministik untuk menemukan peluang peningkatan profit toko.
          </p>
        </div>
      </div>

      {/* Honesty note */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-xs text-slate-400">
        ℹ️ Rekomendasi di bawah ini dihasilkan menggunakan model <strong>analisis rule-based & audit margin ketat</strong> berdasarkan metrik toko Shopee Anda.
      </div>

      {/* Opportunities List */}
      <div className="space-y-4">
        {opportunities.map((opp) => (
          <div
            key={opp.id}
            className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg space-y-4 hover:border-slate-700 transition"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    opp.priority === 'Tinggi'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  Prioritas {opp.priority}
                </span>
                <span className="text-xs text-slate-400 font-medium">{opp.category}</span>
              </div>

              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <span>Potensi Dampak:</span>
                <span className="bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {opp.estimatedPotentialImpact}
                </span>
              </div>
            </div>

            {/* Headline & Description */}
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">{opp.headline}</h3>
              <p className="text-xs text-slate-300 leading-relaxed mt-1">
                {opp.description}
              </p>
            </div>

            {/* Metrics Comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Kondisi Saat Ini:</span>
                <div className="text-white font-mono font-bold mt-0.5">{opp.metricCurrent}</div>
              </div>
              <div>
                <span className="text-[10px] text-emerald-400 uppercase font-semibold">Kondisi Target:</span>
                <div className="text-emerald-300 font-mono font-bold mt-0.5">{opp.metricTarget}</div>
              </div>
            </div>

            {/* Recommendation & Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="text-xs text-slate-300">
                <strong className="text-orange-400">Rekomendasi Tindakan: </strong>
                <span>{opp.recommendedAction}</span>
              </div>

              <button
                onClick={() => {
                  if (opp.type === 'SCALE_ADS' || opp.type === 'CUT_ADS') {
                    setCurrentView('campaign-analytics');
                  } else if (opp.type === 'INCREASE_PRICE') {
                    setCurrentView('new-pricing');
                  } else if (opp.type === 'RESTOCK_URGENT') {
                    setCurrentView('stock-forecast');
                  } else {
                    setCurrentView('product-analytics');
                  }
                }}
                className="shrink-0 px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-xs font-bold text-white shadow-md transition"
              >
                Eksekusi Sekarang →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
