import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { ShieldAlert, HelpCircle, CheckCircle, TrendingUp } from 'lucide-react';

export const BepCalculator: React.FC = () => {
  const { openFormulaModal } = useApp();

  const [fixedCostMonthly, setFixedCostMonthly] = useState(5000000); // Gaji admin, sewa gudang, wifi, software
  const [sellingPrice, setSellingPrice] = useState(89000);
  const [variableCostPerUnit, setVariableCostPerUnit] = useState(48000); // HPP + Packing + Fee Shopee per pcs

  const calculation = useMemo(() => {
    // Contribution Margin per Unit = Selling Price - Variable Cost
    const contributionMarginPerUnit = sellingPrice - variableCostPerUnit;
    const contributionMarginRatio = sellingPrice > 0 ? contributionMarginPerUnit / sellingPrice : 0;

    // BEP in Units = Fixed Cost / Contribution Margin per Unit
    const bepUnits = contributionMarginPerUnit > 0 ? Math.ceil(fixedCostMonthly / contributionMarginPerUnit) : 0;

    // BEP in Revenue = BEP Units * Selling Price
    const bepRevenue = bepUnits * sellingPrice;

    // BEP ROAS for Variable vs Revenue
    const bepRoas = contributionMarginRatio > 0 ? 1 / contributionMarginRatio : 0;

    return {
      contributionMarginPerUnit,
      contributionMarginRatio,
      bepUnits,
      bepRevenue,
      bepRoas,
    };
  }, [fixedCostMonthly, sellingPrice, variableCostPerUnit]);

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <ShieldAlert className="h-6 w-6 text-cyan-400" />
              <span>Break Even Point (BEP) Calculator</span>
            </h1>
            <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-xs font-semibold text-cyan-300">
              Titik Impas Toko
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Hitung berapa unit dan omzet minimal yang harus dicapai setiap bulan agar toko tidak mengalami kerugian operasional.
          </p>
        </div>

        <button
          onClick={() => openFormulaModal('bep')}
          className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:text-white"
        >
          <HelpCircle className="h-3.5 w-3.5" />
          <span>Formula BEP</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Inputs */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-lg">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800">
              Input Komponen Biaya
            </h2>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Fixed Cost Bulanan (Biaya Tetap)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-500">Rp</span>
                <input
                  type="number"
                  value={fixedCostMonthly}
                  onChange={(e) => setFixedCostMonthly(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-3 py-2 text-sm font-bold text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Gaji karyawan tetap, sewa gudang, listrik, internet, tool software
              </span>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Harga Jual Rata-rata per Produk (Rp)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-500">Rp</span>
                <input
                  type="number"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-3 py-2 text-sm font-bold text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Variable Cost per Unit (Biaya Variabel)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-500">Rp</span>
                <input
                  type="number"
                  value={variableCostPerUnit}
                  onChange={(e) => setVariableCostPerUnit(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-3 py-2 text-sm font-bold text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                HPP produk + packing + lakban + total fee marketplace per order
              </span>
            </div>
          </div>
        </div>

        {/* Right Output */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-3xl border border-cyan-500/40 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-2xl">
            <div className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">
              Target Titik Impas (BEP) Toko
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-center">
                <div className="text-xs text-slate-300 font-medium">BEP Unit:</div>
                <div className="text-3xl sm:text-4xl font-black text-cyan-300 mt-1">
                  {calculation.bepUnits} pcs
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  ~{Math.ceil(calculation.bepUnits / 30)} pcs / hari
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                <div className="text-xs text-slate-300 font-medium">BEP Revenue:</div>
                <div className="text-2xl sm:text-3xl font-black text-white mt-1">
                  Rp {(calculation.bepRevenue / 1000000).toFixed(1)} jt
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Omzet penutup modal</div>
              </div>
            </div>

            <div className="space-y-2.5 text-xs border-t border-slate-800 pt-4">
              <div className="flex justify-between text-slate-300">
                <span>Margin Kontribusi per Unit:</span>
                <span className="font-bold text-white">
                  Rp {calculation.contributionMarginPerUnit.toLocaleString('id-ID')} ({((calculation.contributionMarginRatio) * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>BEP ROAS (Batas Minimum Efisiensi):</span>
                <span className="font-bold text-amber-400 font-mono">
                  {calculation.bepRoas.toFixed(2)}x
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Fixed Cost yang Harus Ditutup:</span>
                <span className="text-rose-400">
                  Rp {fixedCostMonthly.toLocaleString('id-ID')} / bulan
                </span>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-slate-950/80 p-3 text-[11px] text-slate-300 leading-relaxed border border-slate-800">
              Setiap produk ke-<strong>{calculation.bepUnits + 1}</strong> yang terjual dalam bulan tersebut adalah 100% laba bersih murni untuk toko Anda.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
