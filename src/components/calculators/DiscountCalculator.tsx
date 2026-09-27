import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { calculateTrueProfit, calculateMaximumDiscount } from '../../services/profitEngine/index.ts';
import { SellerType } from '../../types/rules.ts';
import { Percent, Shield, AlertTriangle, CheckCircle, HelpCircle, Sparkles } from 'lucide-react';

export const DiscountCalculator: React.FC = () => {
  const { currentStore, marketplaceRules, programRules, taxProfile, openFormulaModal } = useApp();

  const [normalPrice, setNormalPrice] = useState(100000);
  const [hpp, setHpp] = useState(48000);
  const [packingOps, setPackingOps] = useState(4000);
  const [sellerStatus, setSellerStatus] = useState<SellerType>(currentStore.sellerStatus || 'STAR');
  const [category, setCategory] = useState('Fashion & Pakaian');
  const [adsAllocation, setAdsAllocation] = useState(8000);
  const [targetMinProfitRp, setTargetMinProfitRp] = useState(10000);

  // Base calculation via True Profit Engine
  const baseCalc = useMemo(() => {
    return calculateTrueProfit(
      {
        originalProductPrice: normalPrice,
        sellerDiscountPercent: 0,
        vouchers: [],
        hpp,
        sellerType: sellerStatus,
        category,
        isFreeShippingXtraActive: true,
        isPromoXtraActive: true,
        isPromoXtraPlusActive: false,
        isAffiliateActive: false,
        adsCostPerOrder: adsAllocation,
        operationalCostConfig: {
          allocationType: 'PER_ORDER',
          packingCost: packingOps / 2,
          laborCost: packingOps / 2,
          warehouseCost: 0,
          electricityCost: 0,
          internetCost: 0,
          softwareCost: 0,
          rentCost: 0,
          customerServiceCost: 0,
          paymentGatewayCost: 0,
          otherCost: 0,
        },
      },
      marketplaceRules,
      programRules,
      taxProfile
    );
  }, [normalPrice, hpp, packingOps, sellerStatus, category, adsAllocation, marketplaceRules, programRules, taxProfile]);

  // Max Safe Discount Calculation via Profit Engine
  const result = useMemo(() => {
    const minAllowedEffectivePrice = Math.min(
      normalPrice,
      Math.max(hpp, baseCalc.breakEvenPrice + targetMinProfitRp)
    );
    const maxDiscountPercent = calculateMaximumDiscount(normalPrice, minAllowedEffectivePrice);

    return {
      maxDiscountPercent,
      minAllowedEffectivePrice: Math.round(minAllowedEffectivePrice),
    };
  }, [normalPrice, hpp, baseCalc.breakEvenPrice, targetMinProfitRp]);

  // Simulation at maximum discount
  const simulatedSim = useMemo(() => {
    const simCalc = calculateTrueProfit(
      {
        originalProductPrice: normalPrice,
        sellerDiscountPercent: result.maxDiscountPercent,
        vouchers: [],
        hpp,
        sellerType: sellerStatus,
        category,
        isFreeShippingXtraActive: true,
        isPromoXtraActive: true,
        isPromoXtraPlusActive: false,
        isAffiliateActive: false,
        adsCostPerOrder: adsAllocation,
        operationalCostConfig: {
          allocationType: 'PER_ORDER',
          packingCost: packingOps / 2,
          laborCost: packingOps / 2,
          warehouseCost: 0,
          electricityCost: 0,
          internetCost: 0,
          softwareCost: 0,
          rentCost: 0,
          customerServiceCost: 0,
          paymentGatewayCost: 0,
          otherCost: 0,
        },
      },
      marketplaceRules,
      programRules,
      taxProfile
    );

    return {
      netProfit: simCalc.actualNetProfit,
      profitMarginPercent: simCalc.actualNetMargin,
      totalMarketplaceDeduction: simCalc.totalMarketplaceFees + simCalc.totalProgramFees,
    };
  }, [normalPrice, result.maxDiscountPercent, hpp, packingOps, sellerStatus, category, adsAllocation, marketplaceRules, programRules, taxProfile]);

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Percent className="h-6 w-6 text-amber-400" />
              <span>Discount Safety Calculator</span>
            </h1>
            <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-semibold text-amber-300">
              Proteksi Boncos
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Ketahui batas diskon coret maksimal agar toko tidak rugi saat flash sale atau campaign tanggal kembar.
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Inputs */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-lg">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800">
              Parameter Produk & Sasaran Keuntungan
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Harga Normal Coret (Rp)
                </label>
                <input
                  type="number"
                  value={normalPrice}
                  onChange={(e) => setNormalPrice(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-bold text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  HPP / Modal Produk (Rp)
                </label>
                <input
                  type="number"
                  value={hpp}
                  onChange={(e) => setHpp(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-bold text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Biaya Packing + Ops (Rp)
                </label>
                <input
                  type="number"
                  value={packingOps}
                  onChange={(e) => setPackingOps(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Alokasi Biaya Iklan / Order (Rp)
                </label>
                <input
                  type="number"
                  value={adsAllocation}
                  onChange={(e) => setAdsAllocation(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Status Penjual & Kategori
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={sellerStatus}
                    onChange={(e) => setSellerStatus(e.target.value as SellerType)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-2.5 py-2 text-xs text-white"
                  >
                    <option value="NON_STAR">Non-Star</option>
                    <option value="STAR">Star</option>
                    <option value="STAR_PLUS">Star+</option>
                    <option value="MALL">Mall</option>
                  </select>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-2.5 py-2 text-xs text-white"
                  >
                    <option value="Fashion & Pakaian">Fashion</option>
                    <option value="Elektronik & Gadget">Elektronik</option>
                    <option value="Kecantikan & Perawatan">Kecantikan</option>
                    <option value="Umum">Umum</option>
                  </select>
                </div>
                <span className="text-[10px] text-amber-400 mt-1 block">
                  Admin: {baseCalc.marketplaceAdminPercent}% + Pemrosesan: Rp 1.250 (Auto)
                </span>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Target Profit Minimum Bersih (Rp)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={targetMinProfitRp}
                    onChange={(e) => setTargetMinProfitRp(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-bold text-emerald-400"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">Isi 0 jika hanya ingin BEP</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Output */}
        <div className="lg:col-span-5 space-y-4 sticky top-20">
          <div className="rounded-3xl border border-amber-500/40 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Batas Aman Diskon Coret
              </span>
              <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                Safety Guard
              </span>
            </div>

            <div className="mb-6 p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-center">
              <div className="text-xs text-slate-300">Maximum Safe Discount:</div>
              <div className="text-4xl sm:text-5xl font-black text-amber-400 mt-1">
                {result.maxDiscountPercent.toFixed(1)}%
              </div>
              <div className="text-xs text-slate-300 mt-2">
                Jangan pasang diskon di atas angka ini jika tidak ingin laba tergerus.
              </div>
            </div>

            <div className="space-y-2.5 text-xs border-t border-slate-800 pt-4">
              <div className="flex justify-between text-slate-300">
                <span>Harga Setelah Diskon (Harga Jual Efektif):</span>
                <span className="font-bold text-white">
                  Rp {Math.round(result.minAllowedEffectivePrice).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Potongan Diskon untuk Pembeli:</span>
                <span className="text-rose-400 font-mono">
                  -Rp {Math.round(normalPrice - result.minAllowedEffectivePrice).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Potongan Fee Shopee:</span>
                <span className="text-rose-400 font-mono">
                  -Rp {Math.round(simulatedSim.totalMarketplaceDeduction).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Modal (HPP + Packing + Iklan):</span>
                <span className="text-rose-400 font-mono">
                  -Rp {Math.round(hpp + packingOps + adsAllocation).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between text-slate-200 font-bold pt-2 border-t border-slate-800">
                <span>Profit Bersih yang Tersisa:</span>
                <span className="text-emerald-400">
                  Rp {Math.round(simulatedSim.netProfit).toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-slate-950/80 p-3 text-[11px] text-slate-400 leading-relaxed border border-slate-800">
              💡 <strong>Tips Seller:</strong> Jika kompetitor memberi diskon lebih besar dari batas aman Anda, naikkan harga coret terlebih dahulu, jangan paksakan margin Anda tergerus.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
