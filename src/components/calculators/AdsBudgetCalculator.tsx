import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { calculateMaximumAdsSpend } from '../../utils/calculatorEngine.ts';
import { Coins, Target, TrendingUp, HelpCircle } from 'lucide-react';

export const AdsBudgetCalculator: React.FC = () => {
  const { openFormulaModal } = useApp();

  const [targetRevenue, setTargetRevenue] = useState(10000000);
  const [targetRoas, setTargetRoas] = useState(5.0);

  const maxAdsSpend = useMemo(
    () => calculateMaximumAdsSpend(targetRevenue, targetRoas),
    [targetRevenue, targetRoas]
  );

  // Multi-ROAS Target Simulation table
  const simulations = useMemo(() => {
    const roasSteps = [3.0, 4.0, 5.0, 6.0, 7.0, 8.0];
    return roasSteps.map((r) => {
      const budget = targetRevenue / r;
      const pctOfRevenue = (budget / targetRevenue) * 100;
      return {
        roas: r,
        budget,
        pctOfRevenue,
        isSelected: Math.abs(r - targetRoas) < 0.1,
      };
    });
  }, [targetRevenue, targetRoas]);

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Coins className="h-6 w-6 text-yellow-400" />
              <span>Ads Budget Calculator</span>
            </h1>
            <span className="rounded-full bg-yellow-500/20 px-2.5 py-0.5 text-xs font-semibold text-yellow-300">
              Perencanaan Anggaran
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tentukan plafon maksimal biaya iklan bulanan atau harian berdasarkan target omzet dan efisiensi ROAS.
          </p>
        </div>

        <button
          onClick={() => openFormulaModal('roas')}
          className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:text-white"
        >
          <HelpCircle className="h-3.5 w-3.5" />
          <span>Formula</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Inputs */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-lg">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800">
              Input Target Bisnis
            </h2>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Target Omzet yang Diharapkan (Rp)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-500">Rp</span>
                <input
                  type="number"
                  value={targetRevenue}
                  onChange={(e) => setTargetRevenue(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-3 py-2 text-sm font-bold text-white focus:border-yellow-500 focus:outline-none"
                  placeholder="10000000"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Target ROAS Campaign (x)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={targetRoas}
                  onChange={(e) => setTargetRoas(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-bold text-white focus:border-yellow-500 focus:outline-none"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400">x</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
              <strong>Rumus Dasar:</strong>
              <div className="mt-1 font-mono text-yellow-300">
                Maksimal Biaya Iklan = Target Omzet ÷ Target ROAS
              </div>
            </div>
          </div>
        </div>

        {/* Right Output */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-3xl border border-yellow-500/40 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-2xl">
            <div className="text-xs font-bold uppercase tracking-wider text-yellow-400 mb-2">
              Maksimum Anggaran Iklan (Maximum Ads Spend)
            </div>

            <div className="text-4xl sm:text-5xl font-black text-white">
              Rp {Math.round(maxAdsSpend).toLocaleString('id-ID')}
            </div>

            <div className="text-xs text-slate-300 mt-2">
              Setara <strong>{((maxAdsSpend / Math.max(1, targetRevenue)) * 100).toFixed(1)}%</strong> dari target omzet toko Anda.
            </div>

            <div className="mt-6 border-t border-slate-800 pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Simulasi Berbagai Target ROAS
              </h3>
              <div className="space-y-2 text-xs">
                {simulations.map((s) => (
                  <div
                    key={s.roas}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                      s.isSelected
                        ? 'bg-yellow-500/15 border-yellow-500/40 text-yellow-300 font-bold'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-300'
                    }`}
                  >
                    <span>Target ROAS {s.roas.toFixed(1)}x:</span>
                    <span className="font-mono">
                      Rp {Math.round(s.budget).toLocaleString('id-ID')} ({s.pctOfRevenue.toFixed(1)}% Omzet)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
