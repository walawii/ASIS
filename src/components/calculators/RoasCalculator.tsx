import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { calculateTrueProfit } from '../../services/profitEngine/index.ts';
import { evaluateRoasIndicator } from '../../utils/calculatorEngine.ts';
import { SellerType } from '../../types/rules.ts';
import {
  Calculator,
  HelpCircle,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  DollarSign,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  BookOpen,
} from 'lucide-react';

export const RoasCalculator: React.FC = () => {
  const { currentStore, marketplaceRules, programRules, taxProfile, openFormulaModal, openTutorial } = useApp();

  // Inputs
  const [sellingPrice, setSellingPrice] = useState<number>(99000);
  const [hpp, setHpp] = useState<number>(50000);
  const [discountPercent, setDiscountPercent] = useState<number>(10);
  const [voucherSellerNominal, setVoucherSellerNominal] = useState<number>(0);
  const [packingCost, setPackingCost] = useState<number>(currentStore.defaultPackingCost);
  const [operationalCost, setOperationalCost] = useState<number>(currentStore.defaultOperationalCost);
  const [sellerStatus, setSellerStatus] = useState<SellerType>(
    currentStore.sellerStatus || 'STAR'
  );
  const [category, setCategory] = useState<string>('Fashion & Pakaian');
  const [isFreeShippingXtraActive, setIsFreeShippingXtraActive] = useState<boolean>(true);
  const [isPromoXtraActive, setIsPromoXtraActive] = useState<boolean>(true);
  const [isAffiliateActive, setIsAffiliateActive] = useState<boolean>(false);
  const [affiliatePercent, setAffiliatePercent] = useState<number>(3.0);
  const [adsCostPerOrder, setAdsCostPerOrder] = useState<number>(12000);
  const [otherCost, setOtherCost] = useState<number>(0);

  // Targets
  const [targetRoas, setTargetRoas] = useState<number>(currentStore.defaultTargetRoas);
  const [targetMargin, setTargetMargin] = useState<number>(currentStore.defaultTargetMargin);

  // Real-time True Profit calculation result
  const trueProfit = useMemo(() => {
    return calculateTrueProfit(
      {
        originalProductPrice: sellingPrice,
        sellerDiscountPercent: discountPercent,
        vouchers: voucherSellerNominal > 0 ? [{ nominal: voucherSellerNominal, payer: 'SELLER', type: 'FIXED' }] : [],
        hpp,
        sellerType: sellerStatus,
        category,
        isFreeShippingXtraActive,
        isPromoXtraActive,
        isPromoXtraPlusActive: false,
        isAffiliateActive,
        affiliateConfig: {
          enabled: isAffiliateActive,
          commissionPercent: affiliatePercent,
          includePpn: true,
          ppnRate: 11,
        },
        adsCostPerOrder,
        operationalCostConfig: {
          allocationType: 'PER_ORDER',
          packingCost,
          laborCost: operationalCost,
          warehouseCost: 0,
          electricityCost: 0,
          internetCost: 0,
          softwareCost: 0,
          rentCost: 0,
          customerServiceCost: 0,
          paymentGatewayCost: 0,
          otherCost,
        },
      },
      marketplaceRules,
      programRules,
      taxProfile
    );
  }, [
    sellingPrice,
    hpp,
    discountPercent,
    voucherSellerNominal,
    sellerStatus,
    category,
    isFreeShippingXtraActive,
    isPromoXtraActive,
    isAffiliateActive,
    affiliatePercent,
    packingCost,
    operationalCost,
    adsCostPerOrder,
    otherCost,
    marketplaceRules,
    programRules,
    taxProfile,
  ]);

  // Adapt to result format for UI
  const result = useMemo(() => {
    return {
      sellingPrice,
      discountAmount: trueProfit.sellerDiscountAmount,
      effectivePrice: trueProfit.feeBase,
      grossRevenue: trueProfit.feeBase,
      marketplaceFeeTotalPercent: Number(
        (
          trueProfit.marketplaceAdminPercent +
          (trueProfit.freeShippingXtraFee > 0 ? 4 : 0) +
          (trueProfit.promoXtraFee > 0 ? 4.5 : 0) +
          (isAffiliateActive ? affiliatePercent : 0)
        ).toFixed(1)
      ),
      marketplaceFeeNominal: trueProfit.totalMarketplaceFees + trueProfit.totalProgramFees,
      affiliateFeeNominal: trueProfit.totalAffiliateCost,
      totalMarketplaceDeduction: trueProfit.totalMarketplaceFees + trueProfit.totalProgramFees + trueProfit.totalAffiliateCost,
      operationalCostsTotal: trueProfit.totalOperationalCost,
      totalCostExcludingAds: trueProfit.totalAllDeductions - trueProfit.adsCostPerOrder,
      totalAllCosts: trueProfit.totalAllDeductions,
      netProfit: trueProfit.actualNetProfit,
      profitMarginPercent: trueProfit.actualNetMargin,
      roas: trueProfit.roas,
      bepRoas: trueProfit.breakEvenRoas,
      maxAdsCost: Math.max(0, trueProfit.feeBase - (trueProfit.totalAllDeductions - trueProfit.adsCostPerOrder)),
      status: trueProfit.profitStatus === 'PROFITABLE' ? 'UNTUNG' : trueProfit.profitStatus === 'LOW_MARGIN' ? 'TIPIS' : trueProfit.profitStatus === 'BREAK_EVEN' ? 'BREAK EVEN' : 'RUGI',
      statusExplanation:
        trueProfit.actualNetProfit > 0
          ? `Laba bersih Rp ${Math.round(trueProfit.actualNetProfit).toLocaleString('id-ID')} (${trueProfit.actualNetMargin}% margin). Perhitungan resmi terpusat via True Profit Engine.`
          : 'Biaya total melebihi omzet yang diterima. Waspada boncos!',
      adminFeePercent: trueProfit.marketplaceAdminPercent,
      adminFeeNominal: trueProfit.marketplaceAdminFee,
      orderProcessingFee: trueProfit.orderProcessingFee,
    };
  }, [sellingPrice, trueProfit, isAffiliateActive, affiliatePercent]);

  // Visual ROAS Indicator
  const indicator = useMemo(() => {
    return evaluateRoasIndicator(result.roas, targetRoas, result.bepRoas);
  }, [result.roas, targetRoas, result.bepRoas]);

  const resetToDefault = () => {
    setSellingPrice(99000);
    setHpp(50000);
    setDiscountPercent(10);
    setVoucherSellerNominal(0);
    setAdsCostPerOrder(12000);
    setPackingCost(currentStore.defaultPackingCost);
    setOperationalCost(currentStore.defaultOperationalCost);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Calculator className="h-6 w-6 text-orange-500" />
              <span>Kalkulator ROAS Real-Time</span>
            </h1>
            <span className="rounded-full bg-orange-500/20 px-2 py-0.5 text-xs font-semibold text-orange-400">
              Live Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Ketahui apakah iklan Shopee Anda benar-benar menghasilkan laba bersih atau boncos setelah seluruh fee marketplace.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openTutorial('roas-calculator')}
            className="flex items-center gap-1.5 rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20 transition shadow-sm"
            title="Pelajari panduan ROAS dan BEP ROAS"
          >
            <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
            <span>📖 Tutorial</span>
          </button>
          <button
            onClick={resetToDefault}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700 transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reset Demo</span>
          </button>
          <button
            onClick={() => openFormulaModal('roas')}
            className="flex items-center gap-1.5 rounded-xl border border-orange-500/40 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-300 hover:bg-orange-500/20 transition"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Bagaimana perhitungannya?</span>
          </button>
        </div>
      </div>

      {/* Two Column Layout: INPUT DI KIRI, HASIL DI KANAN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Inputs (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Card 1: Data Harga & Modal */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 pb-2 border-b border-slate-800 flex items-center justify-between">
              <span>1. Harga Produk & Modal (HPP)</span>
              <span className="text-[11px] text-orange-400 font-normal">Shopee IDR</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Harga Jual Normal (Coret)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-500">Rp</span>
                  <input
                    type="number"
                    value={sellingPrice || ''}
                    onChange={(e) => setSellingPrice(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-3 py-2 text-sm font-semibold text-white focus:border-orange-500 focus:outline-none"
                    placeholder="99000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Harga Pokok / Modal (HPP)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-500">Rp</span>
                  <input
                    type="number"
                    value={hpp || ''}
                    onChange={(e) => setHpp(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-3 py-2 text-sm font-semibold text-white focus:border-orange-500 focus:outline-none"
                    placeholder="50000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Diskon Toko (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={discountPercent || 0}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-semibold text-white focus:border-orange-500 focus:outline-none"
                    placeholder="10"
                    min="0"
                    max="100"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400">%</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Voucher Seller (Nominal)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-500">Rp</span>
                  <input
                    type="number"
                    value={voucherSellerNominal || ''}
                    onChange={(e) => setVoucherSellerNominal(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-3 py-2 text-sm font-semibold text-white focus:border-orange-500 focus:outline-none"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Biaya Iklan & Biaya Operasional */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 pb-2 border-b border-slate-800">
              2. Biaya Iklan & Operasional Toko
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Biaya Iklan / Order
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-500">Rp</span>
                  <input
                    type="number"
                    value={adsCostPerOrder || ''}
                    onChange={(e) => setAdsCostPerOrder(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-3 py-2 text-sm font-semibold text-white focus:border-orange-500 focus:outline-none"
                    placeholder="12000"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">Biaya ads per item</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Biaya Packing
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-500">Rp</span>
                  <input
                    type="number"
                    value={packingCost || ''}
                    onChange={(e) => setPackingCost(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-3 py-2 text-sm font-semibold text-white focus:border-orange-500 focus:outline-none"
                    placeholder="2500"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">Kardus, bubble, lakban</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Biaya Operasional
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-500">Rp</span>
                  <input
                    type="number"
                    value={operationalCost || ''}
                    onChange={(e) => setOperationalCost(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-3 py-2 text-sm font-semibold text-white focus:border-orange-500 focus:outline-none"
                    placeholder="1500"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">Gaji admin, print thermal</span>
              </div>
            </div>
          </div>

          {/* Card 3: Biaya & Fee Shopee Marketplace */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  3. Fee Shopee Marketplace (Fee Engine)
                </h2>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                  Resmi Shopee
                </span>
              </div>
              <span className="text-xs text-orange-400 font-semibold font-mono">
                Admin: {result.adminFeePercent}% + Pemrosesan: Rp 1.250
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Status Penjual
                </label>
                <select
                  value={sellerStatus}
                  onChange={(e) => setSellerStatus(e.target.value as SellerType)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white text-xs"
                >
                  <option value="NON_STAR">Non-Star Seller</option>
                  <option value="STAR">Star Seller</option>
                  <option value="STAR_PLUS">Star+ Seller</option>
                  <option value="MALL">Shopee Mall</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Kategori Produk
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white text-xs"
                >
                  <option value="Fashion & Pakaian">Fashion & Pakaian</option>
                  <option value="Elektronik & Gadget">Elektronik & Gadget</option>
                  <option value="Kecantikan & Perawatan">Kecantikan & Perawatan</option>
                  <option value="Sembako & Kebutuhan Pokok">Sembako & Kebutuhan Pokok</option>
                  <option value="Umum">Umum</option>
                </select>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/70 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFreeShippingXtraActive}
                  onChange={(e) => setIsFreeShippingXtraActive(e.target.checked)}
                  className="rounded accent-orange-500"
                />
                <div>
                  <span className="text-white block font-medium">Gratis Ongkir XTRA</span>
                  <span className="text-[10px] text-slate-400">Rate auto kategori</span>
                </div>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/70 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPromoXtraActive}
                  onChange={(e) => setIsPromoXtraActive(e.target.checked)}
                  className="rounded accent-orange-500"
                />
                <div>
                  <span className="text-white block font-medium">Promo XTRA (4.5%)</span>
                  <span className="text-[10px] text-slate-400">Cap Rp 60.000</span>
                </div>
              </label>

              <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAffiliateActive}
                    onChange={(e) => setIsAffiliateActive(e.target.checked)}
                    className="rounded accent-orange-500"
                  />
                  <span className="text-white font-medium">Affiliate</span>
                </label>
                {isAffiliateActive && (
                  <div className="flex items-center gap-1 w-20">
                    <input
                      type="number"
                      step="0.5"
                      value={affiliatePercent}
                      onChange={(e) => setAffiliatePercent(Number(e.target.value))}
                      className="w-full rounded border border-slate-700 bg-slate-900 px-1.5 py-0.5 text-xs text-white text-right"
                    />
                    <span className="text-[10px] text-slate-400">%</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Konfigurasi Target Seller */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Sliders className="h-4 w-4 text-orange-400" />
              <span>Konfigurasi Target Toko Anda</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Target ROAS Campaign
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={targetRoas}
                    onChange={(e) => setTargetRoas(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-semibold text-white"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400">x</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">Patokan standar campaign Anda</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Target Margin Bersih
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    value={targetMargin}
                    onChange={(e) => setTargetMargin(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-semibold text-white"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400">%</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">Target laba bersih yang diharapkan</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: HASIL DI KANAN (5 Cols) */}
        <div className="lg:col-span-5 space-y-5 sticky top-20">
          {/* Main Visual Card */}
          <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 shadow-2xl relative overflow-hidden">
            {/* Ambient blur */}
            <div
              className={`absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl opacity-20 ${
                result.status === 'UNTUNG'
                  ? 'bg-emerald-500'
                  : result.status === 'RUGI'
                  ? 'bg-rose-500'
                  : 'bg-amber-500'
              }`}
            />

            {/* Header & Status Badge */}
            <div className="flex items-center justify-between mb-4 relative z-10">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Ringkasan Kalkulasi Per Order
              </span>

              {/* Status Badge: UNTUNG / TIPIS / BREAK EVEN / RUGI */}
              <span
                className={`rounded-full px-3 py-1 text-xs font-black tracking-wide border shadow-md ${
                  result.status === 'UNTUNG'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : result.status === 'RUGI'
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                    : result.status === 'BREAK EVEN'
                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                    : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                }`}
              >
                STATUS: {result.status}
              </span>
            </div>

            {/* Big Primary Metric: Laba Bersih */}
            <div className="mb-6 relative z-10">
              <div className="text-xs text-slate-400 font-medium">Profit Bersih per Transaksi</div>
              <div
                className={`text-3xl sm:text-4xl font-black tracking-tight ${
                  result.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                Rp {Math.round(result.netProfit).toLocaleString('id-ID')}
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs">
                <span className="font-semibold text-slate-200">
                  Margin: {result.profitMarginPercent.toFixed(1)}%
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">
                  Harga Efektif: Rp {Math.round(result.effectivePrice).toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Visual ROAS Indicator Card */}
            <div
              className={`rounded-2xl p-4 border mb-6 relative z-10 ${
                indicator.color === 'emerald'
                  ? 'border-emerald-500/40 bg-emerald-950/20'
                  : indicator.color === 'rose'
                  ? 'border-rose-500/40 bg-rose-950/20'
                  : 'border-amber-500/40 bg-amber-950/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Indikator ROAS Visual
                </span>
                <span
                  className={`text-xs font-black uppercase px-2 py-0.5 rounded ${
                    indicator.color === 'emerald'
                      ? 'bg-emerald-500 text-white'
                      : indicator.color === 'rose'
                      ? 'bg-rose-500 text-white'
                      : 'bg-amber-500 text-slate-900'
                  }`}
                >
                  {indicator.category}
                </span>
              </div>

              {/* ROAS Triple Comparison */}
              <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-800/80 my-2 text-center">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Actual ROAS</div>
                  <div className="text-base sm:text-lg font-black text-white">
                    {result.roas.toFixed(2)}x
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Target ROAS</div>
                  <div className="text-base sm:text-lg font-black text-blue-400">
                    {targetRoas.toFixed(2)}x
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">BEP ROAS</div>
                  <div className="text-base sm:text-lg font-black text-amber-400">
                    {result.bepRoas.toFixed(2)}x
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed mt-2">
                {indicator.explanation}
              </p>
            </div>

            {/* Breakdown Table */}
            <div className="space-y-2 text-xs border-t border-slate-800 pt-4 relative z-10">
              <div className="flex justify-between text-slate-300">
                <span>Gross Revenue (Harga Efektif):</span>
                <span className="font-semibold text-white">
                  Rp {Math.round(result.grossRevenue).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Fee Shopee ({result.marketplaceFeeTotalPercent.toFixed(1)}%):</span>
                <span className="text-rose-400 font-medium">
                  -Rp {Math.round(result.totalMarketplaceDeduction).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>HPP / Modal Produk:</span>
                <span className="text-rose-400 font-medium">
                  -Rp {Math.round(hpp).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Packing & Operasional Toko:</span>
                <span className="text-rose-400 font-medium">
                  -Rp {Math.round(result.operationalCostsTotal).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Biaya Iklan per Order:</span>
                <span className="text-rose-400 font-medium">
                  -Rp {Math.round(adsCostPerOrder).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between text-slate-300 pt-2 border-t border-slate-800/80 font-bold">
                <span>Maksimal Biaya Iklan (Batas BEP):</span>
                <span className="text-amber-400">
                  Rp {Math.round(result.maxAdsCost).toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-slate-950/70 p-3 text-[11px] text-slate-400 leading-relaxed border border-slate-800">
              💡 <strong>Rekomendasi Cerdas:</strong> {result.statusExplanation}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
