import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  TrendingUp,
  Filter,
  DollarSign,
  Percent,
  Calendar,
  Layers,
  ArrowUpDown,
  Download,
  AlertCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export const ProfitAnalyticsPage: React.FC = () => {
  const { products, campaigns, currentStore } = useApp();

  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('month');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PROFITABLE' | 'LOW_MARGIN' | 'BREAK_EVEN' | 'LOSS'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Sliced data
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = filterStatus === 'ALL' || p.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [products, searchTerm, filterStatus]);

  // Totals
  const totals = useMemo(() => {
    let rev = 0;
    let hpp = 0;
    let fee = 0;
    let ads = 0;
    let ops = 0;
    let profit = 0;

    products.forEach((p) => {
      rev += p.revenue;
      hpp += p.hpp * p.unitsSold;
      fee += p.revenue * ((p.adminFeePercent + p.serviceFeePercent + p.transactionFeePercent + p.affiliatePercent) / 100);
      ads += p.currentAdsCost * p.unitsSold;
      ops += (p.packingCost + p.operationalCost) * p.unitsSold;
      profit += p.netProfit;
    });

    const margin = rev > 0 ? (profit / rev) * 100 : 0;

    return { rev, hpp, fee, ads, ops, profit, margin };
  }, [products]);

  // Waterfall Chart Data
  const waterfallData = [
    { name: 'Omzet Bruto', amount: Math.round(totals.rev / 1000), fill: '#38bdf8' },
    { name: 'HPP / Modal', amount: Math.round(totals.hpp / 1000), fill: '#f43f5e' },
    { name: 'Fee Marketplace', amount: Math.round(totals.fee / 1000), fill: '#fb923c' },
    { name: 'Biaya Iklan', amount: Math.round(totals.ads / 1000), fill: '#f43f5e' },
    { name: 'Packing & Ops', amount: Math.round(totals.ops / 1000), fill: '#a855f7' },
    { name: 'Profit Bersih', amount: Math.round(totals.profit / 1000), fill: '#10b981' },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-emerald-400" />
              <span>Analisa Laba Rugi Otomatis (P&L Toko)</span>
            </h1>
            <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
              Per SKU & Campaign
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Transparansi penuh pemotongan omzet: HPP, biaya admin, layanan, affiliate, iklan, dan laba bersih riil.
          </p>
        </div>

        {/* Timeframe switch */}
        <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 p-1 text-xs self-start sm:self-auto">
          <button
            onClick={() => setTimeframe('day')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              timeframe === 'day' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Harian
          </button>
          <button
            onClick={() => setTimeframe('week')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              timeframe === 'week' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Mingguan
          </button>
          <button
            onClick={() => setTimeframe('month')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              timeframe === 'month' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Bulanan
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-[10px] uppercase font-bold text-slate-400">Total Omzet</div>
          <div className="text-base sm:text-lg font-black text-white mt-0.5 truncate">
            Rp {(totals.rev / 1000000).toFixed(1)} jt
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-[10px] uppercase font-bold text-slate-400">Total HPP</div>
          <div className="text-base sm:text-lg font-black text-rose-300 mt-0.5 truncate">
            Rp {(totals.hpp / 1000000).toFixed(1)} jt
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-[10px] uppercase font-bold text-slate-400">Fee Shopee</div>
          <div className="text-base sm:text-lg font-black text-amber-300 mt-0.5 truncate">
            Rp {(totals.fee / 1000000).toFixed(1)} jt
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-[10px] uppercase font-bold text-slate-400">Biaya Iklan</div>
          <div className="text-base sm:text-lg font-black text-rose-400 mt-0.5 truncate">
            Rp {(totals.ads / 1000000).toFixed(1)} jt
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
          <div className="text-[10px] uppercase font-bold text-emerald-400">Profit Bersih</div>
          <div className="text-base sm:text-lg font-black text-emerald-300 mt-0.5 truncate">
            Rp {(totals.profit / 1000000).toFixed(1)} jt
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-[10px] uppercase font-bold text-slate-400">Net Margin</div>
          <div className="text-base sm:text-lg font-black text-emerald-400 mt-0.5">
            {totals.margin.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Waterfall Breakdown Chart */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
        <h2 className="text-sm font-bold text-white mb-2">
          Struktur Alokasi Pendapatan Toko (dalam Ribu Rupiah)
        </h2>
        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={waterfallData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `Rp${val}k`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
                formatter={(val: any) => [`Rp ${(Number(val) * 1000).toLocaleString('id-ID')}`]}
              />
              <Bar dataKey="amount" name="Nominal (Ribu Rp)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* P&L Table with Search and Status Filter */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Cari SKU atau nama produk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 text-xs">
            <span className="text-slate-400 text-[11px] shrink-0">Status:</span>
            {(['ALL', 'PROFITABLE', 'LOW_MARGIN', 'BREAK_EVEN', 'LOSS'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 py-1 rounded-lg font-medium transition shrink-0 ${
                  filterStatus === st
                    ? 'bg-orange-500 text-white font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold">
              <tr>
                <th className="py-3 px-4">Produk & SKU</th>
                <th className="py-3 px-4 text-right">Revenue</th>
                <th className="py-3 px-4 text-right">HPP</th>
                <th className="py-3 px-4 text-right">Marketplace Fee</th>
                <th className="py-3 px-4 text-right">Ads Cost</th>
                <th className="py-3 px-4 text-right">Net Profit</th>
                <th className="py-3 px-4 text-right">Margin</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredProducts.map((p) => {
                const totalMktFee =
                  p.revenue *
                  ((p.adminFeePercent + p.serviceFeePercent + p.transactionFeePercent + p.affiliatePercent) /
                    100);
                const totalHpp = p.hpp * p.unitsSold;
                const totalAds = p.currentAdsCost * p.unitsSold;

                return (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white text-xs">{p.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {p.sku} • {p.unitsSold} pcs terjual
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      Rp {p.revenue.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400">
                      Rp {totalHpp.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400">
                      Rp {Math.round(totalMktFee).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-rose-300">
                      Rp {totalAds.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold">
                      <span className={p.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {p.netProfit >= 0 ? '+' : ''}Rp {p.netProfit.toLocaleString('id-ID')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold">
                      {p.marginPercent.toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black ${
                          p.status === 'PROFITABLE'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : p.status === 'LOW_MARGIN'
                            ? 'bg-amber-500/20 text-amber-300'
                            : p.status === 'BREAK_EVEN'
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
