import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { calculateTrueProfit } from '../../services/profitEngine/index.ts';
import { SellerType } from '../../types/rules.ts';
import {
  Target,
  Calculator,
  HelpCircle,
  TrendingUp,
  Percent,
  Coins,
  Shield,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const TargetRoasCalculator: React.FC = () => {
  const { currentStore, marketplaceRules, programRules, taxProfile, openFormulaModal } = useApp();

  // Inputs
  const [sellingPrice, setSellingPrice] = useState<number>(129000);
  const [hpp, setHpp] = useState<number>(65000);
  const [sellerStatus, setSellerStatus] = useState<SellerType>(currentStore.sellerStatus || 'STAR');
  const [category, setCategory] = useState<string>('Fashion & Pakaian');
  const [operationalCost, setOperationalCost] = useState<number>(4000); // packing + admin
  const [voucherSeller, setVoucherSeller] = useState<number>(0);
  const [targetMarginPercent, setTargetMarginPercent] = useState<number>(18);
  const [estimatedConversionRate, setEstimatedConversionRate] = useState<number>(3.5); // % pembeli yang checkout dari klik iklan
  const [isFreeShippingXtra, setIsFreeShippingXtra] = useState<boolean>(true);
  const [isPromoXtra, setIsPromoXtra] = useState<boolean>(true);

  // Calculation via True Profit Engine
  const calculation = useMemo(() => {
    const profitCalc = calculateTrueProfit(
      {
        originalProductPrice: sellingPrice,
        sellerDiscountPercent: 0,
        vouchers: voucherSeller > 0 ? [{ nominal: voucherSeller, payer: 'SELLER', type: 'FIXED' }] : [],
        hpp,
        sellerType: sellerStatus,
        category,
        isFreeShippingXtraActive: isFreeShippingXtra,
        isPromoXtraActive: isPromoXtra,
        isPromoXtraPlusActive: false,
        isAffiliateActive: false,
        operationalCostConfig: {
          allocationType: 'PER_ORDER',
          packingCost: operationalCost / 2,
          laborCost: operationalCost / 2,
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

    const effectivePrice = profitCalc.feeBase;
    const feeNominal = profitCalc.totalMarketplaceFees + profitCalc.totalProgramFees;

    // Margin kotor per unit sebelum dialokasikan ke iklan & laba bersih
    const grossMarginBeforeAds = effectivePrice - hpp - feeNominal - operationalCost;

    // BEP ROAS (Ketika profit = 0) dari Profit Engine
    const bepRoas = profitCalc.breakEvenRoas;

    // Target Laba Bersih yang diinginkan
    const targetProfitNominal = effectivePrice * (targetMarginPercent / 100);

    // Maximum Advertising Cost per Order agar tetap mencapai Target Margin
    const maxAdsCostPerOrder = Math.max(0, grossMarginBeforeAds - targetProfitNominal);

    // Target ROAS yang harus dipasang di dashboard Shopee Ads
    const targetRoas = maxAdsCostPerOrder > 0 ? effectivePrice / maxAdsCostPerOrder : 0;

    // Minimum ROAS (Safety threshold sedikit di atas BEP, misal dengan buffer 5% margin pengaman)
    const minSafeProfitNominal = effectivePrice * 0.05;
    const maxAdsForMinSafe = Math.max(0, grossMarginBeforeAds - minSafeProfitNominal);
    const minimumRoas = maxAdsForMinSafe > 0 ? effectivePrice / maxAdsForMinSafe : bepRoas * 1.15;

    // Maximum CPC (Cost Per Click) berdasarkan Conversion Rate (CR)
    const maxCpcTarget = maxAdsCostPerOrder * (estimatedConversionRate / 100);
    const maxCpcBep = grossMarginBeforeAds * (estimatedConversionRate / 100);

    return {
      effectivePrice,
      totalFeePercent: Number(((feeNominal / (effectivePrice || 1)) * 100).toFixed(1)),
      feeNominal,
      grossMarginBeforeAds,
      targetProfitNominal,
      maxAdsCostPerOrder,
      bepRoas,
      minimumRoas,
      targetRoas,
      maxCpcTarget,
      maxCpcBep,
      adminFeePercent: profitCalc.marketplaceAdminPercent,
      processingFeeAmount: profitCalc.orderProcessingFee,
    };
  }, [
    sellingPrice,
    voucherSeller,
    hpp,
    sellerStatus,
    category,
    isFreeShippingXtra,
    isPromoXtra,
    operationalCost,
    targetMarginPercent,
    estimatedConversionRate,
    marketplaceRules,
    programRules,
    taxProfile,
  ]);

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Target className="h-6 w-6 text-purple-400" />
              <span>Kalkulator Target ROAS & Max Bid Iklan</span>
            </h1>
            <span className="rounded-full bg-purple-500/20 px-2.5 py-0.5 text-xs font-semibold text-purple-300">
              Shopee Ads Optimizer
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Hitung target ROAS yang presisi dan batas maksimal biaya per klik (CPC) sebelum menyalakan campaign Shopee.
          </p>
        </div>

        <button
          onClick={() => openFormulaModal('roas')}
          className="flex items-center gap-1.5 rounded-xl border border-purple-500/40 bg-purple-500/10 px-3 py-1.5 text-xs font-semibold text-purple-300 hover:bg-purple-500/20 transition self-start sm:self-auto"
        >
          <HelpCircle className="h-3.5 w-3.5" />
          <span>Buka Rumus Lengkap</span>
        </button>
      </div>

      {/* Two Column Layout: INPUT DI KIRI, HASIL DI KANAN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Inputs) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800">
              Parameter Biaya & Target Toko
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Harga Jual Produk (Rp)
                </label>
                <input
                  type="number"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-semibold text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  HPP / Modal Produk (Rp)
                </label>
                <input
                  type="number"
                  value={hpp}
                  onChange={(e) => setHpp(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-semibold text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Status Penjual & Kategori
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={sellerStatus}
                    onChange={(e) => setSellerStatus(e.target.value as SellerType)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-2.5 py-2 text-xs font-medium text-white"
                  >
                    <option value="NON_STAR">Non-Star</option>
                    <option value="STAR">Star</option>
                    <option value="STAR_PLUS">Star+</option>
                    <option value="MALL">Mall</option>
                  </select>

                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-2.5 py-2 text-xs font-medium text-white"
                  >
                    <option value="Fashion & Pakaian">Fashion</option>
                    <option value="Elektronik & Gadget">Elektronik</option>
                    <option value="Kecantikan & Perawatan">Kecantikan</option>
                    <option value="Umum">Umum</option>
                  </select>
                </div>
                <span className="text-[10px] text-purple-400 mt-1 block">
                  Admin: {calculation.adminFeePercent}% + Pemrosesan: Rp 1.250 (Total: {calculation.totalFeePercent}%)
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Biaya Operasional & Packing (Rp)
                </label>
                <input
                  type="number"
                  value={operationalCost}
                  onChange={(e) => setOperationalCost(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-semibold text-white"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Kardus packing, bubble, thermal, gaji per order
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Voucher Seller (Rp)
                </label>
                <input
                  type="number"
                  value={voucherSeller}
                  onChange={(e) => setVoucherSeller(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-semibold text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Estimasi Conversion Rate (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={estimatedConversionRate}
                    onChange={(e) => setEstimatedConversionRate(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-semibold text-white"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400">%</span>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">Rata-rata 2% - 5%</span>
              </div>
            </div>

            {/* Target Margin Slider */}
            <div className="pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Percent className="h-4 w-4 text-purple-400" />
                  <span>Target Profit Margin Bersih:</span>
                </label>
                <span className="text-sm font-extrabold text-purple-400 bg-purple-500/20 px-2.5 py-0.5 rounded-lg border border-purple-500/30">
                  {targetMarginPercent}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                step="1"
                value={targetMarginPercent}
                onChange={(e) => setTargetMarginPercent(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>0% (Hanya Balik Modal)</span>
                <span>20% (Standar Sehat)</span>
                <span>40% (High Margin)</span>
              </div>
            </div>
          </div>

          {/* Formula Transparency Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-xs space-y-2">
            <div className="font-bold text-slate-300 flex items-center gap-1.5">
              <Coins className="h-4 w-4 text-amber-400" />
              <span>Transparansi Rumus Target ROAS & CPC</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              <strong>Target ROAS = </strong> Harga Jual ÷ (Margin Kotor Sebelum Iklan - Target Laba Bersih)<br />
              <strong>Maximum CPC = </strong> Maksimal Biaya Iklan per Order × (Conversion Rate ÷ 100)
            </p>
          </div>
        </div>

        {/* Right Column (Results) */}
        <div className="lg:col-span-5 space-y-5 sticky top-20">
          <div className="rounded-3xl border border-purple-500/30 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-2xl relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                Hasil Rekomendasi Target Iklan
              </span>
              <span className="rounded-full bg-purple-500/20 px-2.5 py-0.5 text-[10px] font-bold text-purple-300 border border-purple-500/30">
                Shopee Target
              </span>
            </div>

            {/* Target ROAS Big Display */}
            <div className="mb-6 p-4 rounded-2xl bg-purple-950/30 border border-purple-500/40">
              <div className="text-xs text-purple-300 font-medium">Target ROAS yang Harus Dipasang:</div>
              <div className="text-4xl sm:text-5xl font-black text-white mt-1">
                {calculation.targetRoas > 0 ? `${calculation.targetRoas.toFixed(2)}x` : 'N/A'}
              </div>
              <div className="text-xs text-slate-300 mt-2">
                Untuk mengamankan laba bersih <strong>{targetMarginPercent}%</strong> (Rp {Math.round(calculation.targetProfitNominal).toLocaleString('id-ID')}/pcs)
              </div>
            </div>

            {/* Grid of Key Outputs */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-400">BEP ROAS (Titik Impas)</div>
                <div className="text-lg font-black text-amber-400 mt-0.5">
                  {calculation.bepRoas.toFixed(2)}x
                </div>
                <div className="text-[10px] text-slate-500">Jika di bawah ini = rugi</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-400">Minimum ROAS (Aman)</div>
                <div className="text-lg font-black text-blue-400 mt-0.5">
                  {calculation.minimumRoas.toFixed(2)}x
                </div>
                <div className="text-[10px] text-slate-500">Margin pengaman 5%</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-400">Max Biaya Iklan / Order</div>
                <div className="text-lg font-black text-white mt-0.5">
                  Rp {Math.round(calculation.maxAdsCostPerOrder).toLocaleString('id-ID')}
                </div>
                <div className="text-[10px] text-slate-500">Alokasi ads per pcs</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-400">Max CPC (Bid Iklan)</div>
                <div className="text-lg font-black text-emerald-400 mt-0.5">
                  Rp {Math.round(calculation.maxCpcTarget).toLocaleString('id-ID')}
                </div>
                <div className="text-[10px] text-slate-500">Bid per klik maksimal</div>
              </div>
            </div>

            {/* Guidance Alert */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 text-xs text-slate-300 leading-relaxed">
              <span className="font-bold text-white">Panduan Pengaturan Shopee:</span>
              <p className="mt-1 text-slate-400 text-[11px]">
                Di menu Iklan Shopee, tetapkan target ROAS minimal <strong>{calculation.targetRoas.toFixed(2)}x</strong>.
                Untuk penawaran kata kunci manual, jangan pasang bid melebihi <strong>Rp {Math.round(calculation.maxCpcTarget).toLocaleString('id-ID')}</strong> agar konversi tidak merugikan margin Anda.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
