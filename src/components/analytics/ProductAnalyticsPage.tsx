import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  Package,
  Filter,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  Flame,
  Search,
  CheckCircle2,
} from 'lucide-react';

export const ProductAnalyticsPage: React.FC = () => {
  const { products, setCurrentView } = useApp();

  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [segmentFilter, setSegmentFilter] = useState<
    'ALL' | 'BEST_SELLER' | 'HIGH_PROFIT' | 'HIGH_MARGIN' | 'HIGH_VOL_LOW_PROFIT' | 'LOSS' | 'HIGH_ADS' | 'SCALE_POTENTIAL'
  >('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.category)));
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = categoryFilter === 'ALL' || p.category === categoryFilter;
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());

      let matchSegment = true;
      if (segmentFilter === 'BEST_SELLER') matchSegment = p.unitsSold > 300;
      else if (segmentFilter === 'HIGH_PROFIT') matchSegment = p.netProfit > 5000000;
      else if (segmentFilter === 'HIGH_MARGIN') matchSegment = p.marginPercent >= 20;
      else if (segmentFilter === 'HIGH_VOL_LOW_PROFIT') matchSegment = p.unitsSold > 200 && p.marginPercent < 12;
      else if (segmentFilter === 'LOSS') matchSegment = p.status === 'LOSS' || p.netProfit < 0;
      else if (segmentFilter === 'HIGH_ADS') matchSegment = p.currentAdsCost > 15000;
      else if (segmentFilter === 'SCALE_POTENTIAL') matchSegment = p.actualRoas >= 4.5 && p.marginPercent >= 18;

      return matchCat && matchSearch && matchSegment;
    });
  }, [products, categoryFilter, segmentFilter, searchQuery]);

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Package className="h-6 w-6 text-blue-400" />
              <span>Analisis Performa Produk & Internal Score</span>
            </h1>
            <span className="rounded-full bg-blue-500/20 px-2.5 py-0.5 text-xs font-semibold text-blue-300">
              Product Intelligence
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Segmentasikan katalog berdasarkan kontribusi profit, rasio iklan, kecepatan jual, dan skor kelayakan scale.
          </p>
        </div>
      </div>

      {/* Segment Shortcuts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
        <button
          onClick={() => setSegmentFilter('ALL')}
          className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition ${
            segmentFilter === 'ALL'
              ? 'bg-orange-500 text-white font-bold'
              : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          Semua Produk ({products.length})
        </button>
        <button
          onClick={() => setSegmentFilter('SCALE_POTENTIAL')}
          className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition ${
            segmentFilter === 'SCALE_POTENTIAL'
              ? 'bg-emerald-500 text-white font-bold'
              : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          🚀 Siap Di-Scale Up
        </button>
        <button
          onClick={() => setSegmentFilter('HIGH_VOL_LOW_PROFIT')}
          className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition ${
            segmentFilter === 'HIGH_VOL_LOW_PROFIT'
              ? 'bg-amber-500 text-slate-950 font-bold'
              : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          ⚠️ Omzet Tinggi tapi Margin Tipis
        </button>
        <button
          onClick={() => setSegmentFilter('LOSS')}
          className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition ${
            segmentFilter === 'LOSS'
              ? 'bg-rose-500 text-white font-bold'
              : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          🛑 Boncos / Rugi
        </button>
        <button
          onClick={() => setSegmentFilter('HIGH_MARGIN')}
          className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition ${
            segmentFilter === 'HIGH_MARGIN'
              ? 'bg-purple-500 text-white font-bold'
              : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          💎 Margin Tinggi (&ge;20%)
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/90 p-3">
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari SKU atau nama produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
          <span className="text-slate-400 text-[11px]">Kategori:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white"
          >
            <option value="ALL">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Cards with Score Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProducts.map((p) => (
          <div
            key={p.id}
            className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg space-y-4 hover:border-slate-700 transition"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-white">{p.name}</h3>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  SKU: {p.sku} • {p.category}
                </div>
              </div>

              {/* Product Overall Score */}
              <div className="flex flex-col items-end shrink-0">
                <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Skor</span>
                  <span className="text-sm font-black text-orange-400">{p.score.overall}/100</span>
                </div>
                <span
                  className={`text-[9px] font-bold mt-1 px-1.5 py-0.5 rounded ${
                    p.status === 'PROFITABLE'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : p.status === 'LOSS'
                      ? 'bg-rose-500/20 text-rose-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {p.status}
                </span>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-800/80 text-xs">
              <div>
                <div className="text-[10px] text-slate-400">Harga Jual</div>
                <div className="font-bold text-white">
                  Rp {p.sellingPrice.toLocaleString('id-ID')}
                </div>
                <div className="text-[10px] text-slate-500">HPP Rp {p.hpp.toLocaleString('id-ID')}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">Profit Bersih</div>
                <div className={`font-bold ${p.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  Rp {(p.netProfit / 1000000).toFixed(2)} jt
                </div>
                <div className="text-[10px] text-slate-500">Margin {p.marginPercent.toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">ROAS Iklan</div>
                <div className="font-bold text-white">{p.actualRoas}x</div>
                <div className="text-[10px] text-slate-500">BEP {p.bepRoas}x</div>
              </div>
            </div>

            {/* Score Breakdown (Requirement 23) */}
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 mb-2">
                Evaluasi Multi-Faktor Produk:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                  <div className="text-slate-400 text-[10px]">Margin</div>
                  <div className={`font-bold ${p.score.marginStatus === 'Good' ? 'text-emerald-400' : p.score.marginStatus === 'Fair' ? 'text-amber-400' : 'text-rose-400'}`}>
                    {p.score.marginStatus}
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                  <div className="text-slate-400 text-[10px]">ROAS</div>
                  <div className={`font-bold ${p.score.roasStatus === 'Good' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {p.score.roasStatus}
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                  <div className="text-slate-400 text-[10px]">Stok</div>
                  <div className={`font-bold ${p.score.stockStatus === 'Good' ? 'text-emerald-400' : p.score.stockStatus === 'Warning' ? 'text-amber-400' : 'text-rose-400'}`}>
                    {p.score.stockStatus}
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                  <div className="text-slate-400 text-[10px]">Kecepatan Jual</div>
                  <div className="font-bold text-purple-400">
                    {p.score.salesVelocity}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">
                Stok tersedia: <strong className="text-white">{p.stock} pcs</strong> ({p.variants.length} varian)
              </span>

              <button
                onClick={() => setCurrentView('variant-analytics')}
                className="text-xs text-orange-400 hover:underline font-medium"
              >
                Lihat Detail Varian →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
