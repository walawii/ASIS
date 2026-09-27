import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { ArrowUpRight, TrendingUp, HelpCircle, BarChart3 } from 'lucide-react';
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

export const ProfitSimulator: React.FC = () => {
  const { products, campaigns, openFormulaModal } = useApp();

  // Current baseline from store data
  const baseRevenue = useMemo(
    () => products.reduce((acc, p) => acc + p.revenue, 0) || 50000000,
    [products]
  );
  const baseProfit = useMemo(
    () => products.reduce((acc, p) => acc + p.netProfit, 0) || 12000000,
    [products]
  );
  const baseAds = useMemo(
    () => campaigns.reduce((acc, c) => acc + c.cost, 0) || 8000000,
    [campaigns]
  );
  const baseOrders = useMemo(
    () => products.reduce((acc, p) => acc + p.unitsSold, 0) || 350,
    [products]
  );

  // Scalability assumptions
  const [adsEfficiencyFactor, setAdsEfficiencyFactor] = useState(0.85); // Saat scale omzet, ads cost naik sedikit lebih banyak (0.85 efficiency)

  const scenarios = useMemo(() => {
    const growthRates = [0, 0.1, 0.2, 0.5, 1.0]; // Baseline, +10%, +20%, +50%, +100%

    return growthRates.map((rate) => {
      const revenue = baseRevenue * (1 + rate);
      const orders = Math.round(baseOrders * (1 + rate));
      // Ads cost increases proportional to revenue divided by efficiency factor
      const adsCost = baseAds * (1 + rate / adsEfficiencyFactor);
      // Operational scaling efficiency (fixed costs stay steady, so profit expands!)
      const cogsAndFee = (baseRevenue - baseProfit - baseAds) * (1 + rate);
      const profit = revenue - cogsAndFee - adsCost;
      const netMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

      const label = rate === 0 ? 'Baseline (Saat Ini)' : `+${rate * 100}% Omzet`;

      return {
        label,
        rate: rate * 100,
        revenue: Math.round(revenue),
        orders,
        adsCost: Math.round(adsCost),
        profit: Math.round(profit),
        netMargin: Number(netMargin.toFixed(1)),
      };
    });
  }, [baseRevenue, baseProfit, baseAds, baseOrders, adsEfficiencyFactor]);

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <ArrowUpRight className="h-6 w-6 text-emerald-400" />
              <span>Profit Growth Simulator</span>
            </h1>
            <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
              Proyeksi Skala Bisnis
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulasikan ekspansi omzet (+10%, +20%, +50%, +100%) dan efek leverage biaya operasional terhadap lonjakan laba bersih.
          </p>
        </div>

        <button
          onClick={() => openFormulaModal('pricing')}
          className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:text-white"
        >
          <HelpCircle className="h-3.5 w-3.5" />
          <span>Formula</span>
        </button>
      </div>

      {/* Baseline Overview Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <div className="text-[10px] uppercase font-bold text-slate-400">Omzet Baseline</div>
          <div className="text-base sm:text-lg font-black text-white">
            Rp {(baseRevenue / 1000000).toFixed(1)} jt
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase font-bold text-slate-400">Profit Baseline</div>
          <div className="text-base sm:text-lg font-black text-emerald-400">
            Rp {(baseProfit / 1000000).toFixed(1)} jt
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase font-bold text-slate-400">Biaya Iklan Baseline</div>
          <div className="text-base sm:text-lg font-black text-rose-400">
            Rp {(baseAds / 1000000).toFixed(1)} jt
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase font-bold text-slate-400">Total Order Baseline</div>
          <div className="text-base sm:text-lg font-black text-purple-400">
            {baseOrders} pcs
          </div>
        </div>
      </div>

      {/* Recharts Comparison Chart */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
        <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-emerald-400" />
          <span>Perbandingan Proyeksi Omzet vs Profit Bersih</span>
        </h2>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={scenarios}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickFormatter={(val) => `Rp${(val / 1000000).toFixed(0)}jt`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
                formatter={(val: any) => [`Rp ${Number(val).toLocaleString('id-ID')}`]}
              />
              <Legend />
              <Bar dataKey="revenue" name="Estimasi Omzet" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="profit" name="Estimasi Profit Bersih" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="adsCost" name="Estimasi Ads Cost" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Scenario Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800">
          <h2 className="font-bold text-sm text-white">Rincian Angka Skenario Pertumbuhan</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold">
              <tr>
                <th className="py-3 px-4">Skenario Pertumbuhan</th>
                <th className="py-3 px-4">Estimasi Revenue</th>
                <th className="py-3 px-4">Volume Order</th>
                <th className="py-3 px-4">Estimasi Ads Spend</th>
                <th className="py-3 px-4 text-emerald-400 font-bold">Estimasi Net Profit</th>
                <th className="py-3 px-4">Net Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {scenarios.map((sc, idx) => (
                <tr
                  key={sc.label}
                  className={`hover:bg-slate-800/50 transition ${
                    idx === 0 ? 'bg-slate-950/40 font-medium' : ''
                  }`}
                >
                  <td className="py-3 px-4 font-bold text-white flex items-center gap-1.5">
                    {idx > 0 && <span className="text-emerald-400">↑</span>}
                    <span>{sc.label}</span>
                  </td>
                  <td className="py-3 px-4 font-mono">
                    Rp {sc.revenue.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4 font-mono">{sc.orders} order</td>
                  <td className="py-3 px-4 font-mono text-rose-300">
                    Rp {sc.adsCost.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4 font-mono font-black text-emerald-400">
                    Rp {sc.profit.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-emerald-300 font-bold">
                      {sc.netMargin}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
