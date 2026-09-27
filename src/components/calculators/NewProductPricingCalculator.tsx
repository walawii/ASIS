import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  calculateReversePrice,
  ReversePricingResult,
  ReversePricingTargetMode,
} from '../../services/profitEngine/reversePricing.ts';
import {
  SellerType,
} from '../../types/rules.ts';
import {
  ArrowDownToLine,
  CheckCircle2,
  Copy,
  Check,
  TrendingUp,
  Percent,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Target,
  ShoppingBag,
  DollarSign,
  Package,
  Calendar,
  BookOpen,
} from 'lucide-react';

export const NewProductPricingCalculator: React.FC = () => {
  const {
    currentStore,
    marketplaceRules,
    programRules,
    taxProfile,
    addProduct,
    setCurrentView,
    openTutorial,
  } = useApp();

  // 1. TARGET AKHIR (Input Utama)
  const [targetMode, setTargetMode] = useState<ReversePricingTargetMode>('NET_PROFIT');
  const [targetAmount, setTargetAmount] = useState<number>(55000); // Default Rp 55.000
  const [targetMarginPercent, setTargetMarginPercent] = useState<number>(25);

  // 2. DISKON TOKO / DISKON CORET
  const [sellerDiscountPercent, setSellerDiscountPercent] = useState<number>(0);

  // 3. HPP & BIAYA TOKO
  const [hpp, setHpp] = useState<number>(25000);
  const [packagingCost, setPackagingCost] = useState<number>(2000);
  const [operationalCost, setOperationalCost] = useState<number>(1000);
  const [adsCostPerOrder, setAdsCostPerOrder] = useState<number>(0);
  const [returnRiskPercent, setReturnRiskPercent] = useState<number>(0);

  // 4. STATUS SELLER & KATEGORI
  const [sellerType, setSellerType] = useState<SellerType>('STAR');
  const [category, setCategory] = useState<string>('Fashion & Pakaian');
  const [effectiveDate, setEffectiveDate] = useState<string>('2026-04-01');

  // 5. PROGRAM SHOPEE & AFFILIATE
  const [isFreeShippingXtra, setIsFreeShippingXtra] = useState<boolean>(true);
  const [isPromoXtra, setIsPromoXtra] = useState<boolean>(false);
  const [isPromoXtraPlus, setIsPromoXtraPlus] = useState<boolean>(false);
  const [isPreOrder, setIsPreOrder] = useState<boolean>(false);
  const [isAffiliate, setIsAffiliate] = useState<boolean>(false);
  const [affiliateRate, setAffiliateRate] = useState<number>(5);

  // UI state
  const [copiedPrice, setCopiedPrice] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [productName, setProductName] = useState<string>('Produk Target Bersih');
  const [expandedStep, setExpandedStep] = useState<string | null>('shopee_fees');

  // Available categories extracted from marketplace rules
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    marketplaceRules.forEach((r) => {
      if (r.category) cats.add(r.category);
    });
    if (cats.size === 0) {
      return ['Fashion & Pakaian', 'Elektronik & Gadget', 'Kecantikan & Perawatan', 'Umum'];
    }
    return Array.from(cats);
  }, [marketplaceRules]);

  // Numerical Solver Execution via True Profit Engine Single Source of Truth
  const solverResult: ReversePricingResult = useMemo(() => {
    const effectiveTarget = targetMode === 'NET_PROFIT' ? targetAmount : targetMarginPercent;
    return calculateReversePrice(
      {
        targetAmount: effectiveTarget,
        targetMode,
        targetMarginPercent,
        sellerDiscountPercent,
        hpp,
        sellerType,
        category,
        transactionDate: effectiveDate,
        isFreeShippingXtraActive: isFreeShippingXtra,
        isPromoXtraActive: isPromoXtra,
        isPromoXtraPlusActive: isPromoXtraPlus,
        isPreOrderActive: isPreOrder,
        isAffiliateActive: isAffiliate,
        affiliateConfig: {
          enabled: isAffiliate,
          commissionPercent: affiliateRate,
          includePpn: true,
        },
        adsCostPerOrder,
        returnConfig: {
          returnRatePercent: returnRiskPercent,
          refundRatePercent: 0.5,
          defectRatePercent: 0.5,
          cancellationRatePercent: 1.0,
          averageReturnShippingCost: 15000,
          replacementCost: hpp,
          restockingCost: 5000,
        },
        operationalCostConfig: {
          allocationType: 'PER_ORDER',
          packingCost: packagingCost,
          laborCost: operationalCost,
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
  }, [
    targetMode,
    targetAmount,
    targetMarginPercent,
    sellerDiscountPercent,
    hpp,
    packagingCost,
    operationalCost,
    adsCostPerOrder,
    returnRiskPercent,
    sellerType,
    category,
    effectiveDate,
    isFreeShippingXtra,
    isPromoXtra,
    isPromoXtraPlus,
    isPreOrder,
    isAffiliate,
    affiliateRate,
    marketplaceRules,
    programRules,
    taxProfile,
  ]);

  const handleCopyPrice = () => {
    if (solverResult.requiredListingPrice > 0) {
      navigator.clipboard.writeText(solverResult.requiredListingPrice.toString());
      setCopiedPrice(true);
      setTimeout(() => setCopiedPrice(false), 2000);
    }
  };

  const handleSaveToCatalog = () => {
    if (!solverResult.isValid || solverResult.requiredListingPrice <= 0) return;
    const margin = solverResult.summary.achievedNetMarginPercent;
    const profit = solverResult.summary.achievedNetProfit;

    addProduct({
      id: `rev-${Date.now()}`,
      storeId: currentStore?.id || 'store-1',
      sku: `REV-${Math.floor(1000 + Math.random() * 9000)}`,
      name: productName,
      category,
      hpp,
      sellingPrice: solverResult.requiredListingPrice,
      discountPercent: sellerDiscountPercent,
      effectivePrice: solverResult.actualBuyerPrice,
      packingCost: packagingCost,
      operationalCost,
      weightGrams: 250,
      adminFeePercent: solverResult.profitCalculation?.marketplaceAdminPercent || 8.25,
      serviceFeePercent: (isFreeShippingXtra ? 4 : 0) + (isPromoXtra ? 4.5 : 0),
      transactionFeePercent: 1.5,
      affiliatePercent: isAffiliate ? affiliateRate : 0,
      voucherNominal: 0,
      cashbackNominal: 0,
      shippingSubsidy: 0,
      currentAdsCost: adsCostPerOrder,
      targetRoas: 4.5,
      stock: 50,
      safetyStock: 10,
      dailySalesVelocity: 3,
      rating: 5.0,
      reviewCount: 0,
      unitsSold: 0,
      revenue: 0,
      netProfit: profit,
      marginPercent: margin,
      actualRoas: 0,
      bepRoas: solverResult.profitCalculation?.breakEvenRoas || 1.5,
      status: profit > 0 ? 'PROFITABLE' : profit === 0 ? 'BREAK_EVEN' : 'LOSS',
      score: {
        overall: 85,
        marginStatus: margin >= 15 ? 'Good' : margin >= 8 ? 'Fair' : 'Poor',
        roasStatus: 'Good',
        stockStatus: 'Good',
        salesVelocity: 'Moderate',
      },
      variants: [],
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const resetDefaults = () => {
    setTargetMode('NET_PROFIT');
    setTargetAmount(55000);
    setSellerDiscountPercent(0);
    setHpp(25000);
    setPackagingCost(2000);
    setOperationalCost(1000);
    setAdsCostPerOrder(0);
    setReturnRiskPercent(0);
    setIsFreeShippingXtra(true);
    setIsPromoXtra(false);
    setIsPromoXtraPlus(false);
    setIsAffiliate(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full flex items-center gap-1.5 shadow-md shadow-emerald-900/40">
                <ArrowDownToLine className="w-3.5 h-3.5" />
                SOLVER
              </span>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-medium rounded-full">
                Single Source of Truth: True Profit Engine
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Reverse Pricing
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Hitung mundur harga yang harus dipasang berdasarkan target akhir dan seluruh biaya seller.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openTutorial('reverse-pricing')}
              className="px-3 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold rounded-xl border border-indigo-500/40 flex items-center gap-1.5 transition-colors shadow-sm"
              title="Pelajari panduan Reverse Pricing dan cara membaca hasil perhitungannya"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>📖 Tutorial</span>
            </button>
            <button
              onClick={resetDefaults}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
            <button
              onClick={() => setCurrentView('true-profit-engine')}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Layers className="w-3.5 h-3.5" />
              True Profit Engine
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Inputs on Left, Results & Waterfall on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Configuration Forms (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Card 1: Target Akhir / Target Bersih */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Target Akhir</h3>
                  <p className="text-xs text-slate-400">
                    Masukkan nominal yang ingin tersisa setelah seluruh biaya yang dipilih diperhitungkan.
                  </p>
                </div>
              </div>
              <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
                <button
                  onClick={() => setTargetMode('NET_PROFIT')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    targetMode === 'NET_PROFIT'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Nominal (Rp)
                </button>
                <button
                  onClick={() => setTargetMode('NET_MARGIN_PERCENT')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    targetMode === 'NET_MARGIN_PERCENT'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Margin (%)
                </button>
              </div>
            </div>

            {targetMode === 'NET_PROFIT' ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>Target Akhir (Uang Bersih Tersisa)</span>
                    <span className="text-emerald-400 font-bold">
                      Rp {targetAmount.toLocaleString('id-ID')}
                    </span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-semibold text-sm">
                      Rp
                    </span>
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      value={targetAmount || ''}
                      onChange={(e) => setTargetAmount(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-white font-semibold text-lg"
                      placeholder="55000"
                    />
                  </div>
                </div>

                {/* Preset Target Quick Buttons */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[25000, 35000, 50000, 55000, 75000, 100000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setTargetAmount(preset)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        targetAmount === preset
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      Rp {(preset / 1000).toLocaleString('id-ID')}rb
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>Target Net Margin (%)</span>
                    <span className="text-emerald-400 font-bold">{targetMarginPercent}%</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      max={90}
                      value={targetMarginPercent || ''}
                      onChange={(e) => setTargetMarginPercent(Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-white font-semibold text-lg"
                      placeholder="25"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">
                      %
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Diskon Seller / Diskon Coret */}
            <div className="pt-3 border-t border-slate-800/80">
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-orange-400" />
                  Rencana Diskon Toko / Diskon Coret
                </span>
                <span className="text-orange-400 font-semibold">{sellerDiscountPercent}%</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={80}
                  step={5}
                  value={sellerDiscountPercent}
                  onChange={(e) => setSellerDiscountPercent(Number(e.target.value))}
                  className="flex-1 accent-orange-500 h-2 bg-slate-950 rounded-lg cursor-pointer"
                />
                <span className="text-xs text-slate-400 font-mono w-10 text-right">
                  {sellerDiscountPercent}%
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {sellerDiscountPercent > 0
                  ? `Harga yang dipasang di Shopee akan dinaikkan agar setelah didiskon ${sellerDiscountPercent}%, target akhir Rp ${targetAmount.toLocaleString('id-ID')} tetap tercapai.`
                  : 'Tanpa diskon toko (Harga listing Shopee = Harga dibayar pembeli).'}
              </p>
            </div>
          </div>

          {/* Card 2: HPP & Biaya Toko */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">HPP, Packing & Operasional</h3>
                <p className="text-xs text-slate-400">Modal pokok dan pengeluaran internal per pesanan</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  HPP (Modal Produk)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">
                    Rp
                  </span>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={hpp || ''}
                    onChange={(e) => setHpp(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm font-medium focus:border-blue-500"
                    placeholder="25000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Biaya Packing
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">
                    Rp
                  </span>
                  <input
                    type="number"
                    min={0}
                    step={500}
                    value={packagingCost || ''}
                    onChange={(e) => setPackagingCost(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm font-medium focus:border-blue-500"
                    placeholder="2000"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1 truncate">
                  Operasional
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-[11px]">
                    Rp
                  </span>
                  <input
                    type="number"
                    min={0}
                    step={500}
                    value={operationalCost || ''}
                    onChange={(e) => setOperationalCost(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-7 pr-2 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
                    placeholder="1000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1 truncate">
                  Shopee Ads / Order
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-[11px]">
                    Rp
                  </span>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={adsCostPerOrder || ''}
                    onChange={(e) => setAdsCostPerOrder(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-7 pr-2 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1 truncate">
                  Retur / Refund (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    max={20}
                    step={0.5}
                    value={returnRiskPercent || ''}
                    onChange={(e) => setReturnRiskPercent(Math.max(0, Number(e.target.value)))}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
                    placeholder="0"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs">
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Status Seller, Kategori & Tanggal */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Status Seller & Kategori Shopee</h3>
                <p className="text-xs text-slate-400">Menentukan persentase potongan fee resmi Shopee</p>
              </div>
            </div>

            {/* Seller Type Selector */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Status Toko Shopee
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['NON_STAR', 'STAR', 'STAR_PLUS', 'MALL'] as SellerType[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setSellerType(st)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-medium border text-center transition-all ${
                      sellerType === st
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {st === 'NON_STAR'
                      ? 'Non-Star'
                      : st === 'STAR'
                      ? 'Star'
                      : st === 'STAR_PLUS'
                      ? 'Star+'
                      : 'Mall'}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Selector */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Kategori Produk
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:border-amber-500"
                >
                  {availableCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  Tanggal Efektif Rules
                </label>
                <input
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:border-amber-500"
                />
              </div>
            </div>

            {/* Program Toggles */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <span className="text-xs font-medium text-slate-300 block">
                Program Shopee yang Diikuti:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/80 border border-slate-800 cursor-pointer hover:border-slate-700">
                  <input
                    type="checkbox"
                    checked={isFreeShippingXtra}
                    onChange={(e) => setIsFreeShippingXtra(e.target.checked)}
                    className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-slate-300">Gratis Ongkir XTRA</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/80 border border-slate-800 cursor-pointer hover:border-slate-700">
                  <input
                    type="checkbox"
                    checked={isPromoXtra}
                    onChange={(e) => setIsPromoXtra(e.target.checked)}
                    className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-slate-300">Promo XTRA (Cashback)</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/80 border border-slate-800 cursor-pointer hover:border-slate-700">
                  <input
                    type="checkbox"
                    checked={isPromoXtraPlus}
                    onChange={(e) => setIsPromoXtraPlus(e.target.checked)}
                    className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-slate-300">Promo XTRA+ (Double)</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/80 border border-slate-800 cursor-pointer hover:border-slate-700">
                  <input
                    type="checkbox"
                    checked={isPreOrder}
                    onChange={(e) => setIsPreOrder(e.target.checked)}
                    className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-slate-300">Pre-Order (PO)</span>
                </label>
              </div>

              {/* Affiliate Toggle */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAffiliate}
                    onChange={(e) => setIsAffiliate(e.target.checked)}
                    className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Shopee Affiliate Penjual</span>
                </label>
                {isAffiliate && (
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-slate-400">Komisi:</span>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={affiliateRate}
                      onChange={(e) => setAffiliateRate(Number(e.target.value))}
                      className="w-12 px-1.5 py-0.5 bg-slate-950 border border-slate-700 rounded text-center text-white"
                    />
                    <span className="text-slate-400">%</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Output & Detailed Waterfall (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Main Solver Result Cards (Section 5: Output) */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-emerald-500/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Hasil Reverse Pricing Solver
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">
                  {solverResult.solverIterations} iterasi binary search
                </span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold rounded-md">
                  Tepat & Akurat
                </span>
              </div>
            </div>

            {/* 3 Core Output Metrics Display (Prompt Section 5) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-stretch mb-5">
              {/* Output 1: HARGA YANG HARUS DIPASANG DI SHOPEE */}
              <div className="bg-slate-950/90 border border-emerald-500/50 rounded-xl p-4 flex flex-col justify-between shadow-lg relative group">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                      HARGA YANG HARUS DIPASANG DI SHOPEE
                    </span>
                    <button
                      onClick={handleCopyPrice}
                      className="p-1 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 rounded transition-colors"
                      title="Salin Harga"
                    >
                      {copiedPrice ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <div className="text-2xl lg:text-3xl font-black text-white tracking-tight mt-1">
                    Rp {solverResult.requiredListingPrice.toLocaleString('id-ID')}
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-400">
                  Pasang harga ini di Seller Center Shopee
                </div>
              </div>

              {/* Output 2: HARGA SETELAH DISKON */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-orange-400 uppercase tracking-wider block mb-1">
                    HARGA SETELAH DISKON
                  </span>
                  <div className="text-2xl font-bold text-slate-200 mt-1">
                    Rp {solverResult.actualBuyerPrice.toLocaleString('id-ID')}
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-400">
                  {sellerDiscountPercent > 0
                    ? `Setelah diskon toko ${sellerDiscountPercent}%`
                    : 'Sama dengan harga pasang (tanpa diskon)'}
                </div>
              </div>

              {/* Output 3: TARGET AKHIR */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block mb-1">
                    TARGET AKHIR
                  </span>
                  <div className="text-2xl font-bold text-emerald-400 mt-1">
                    Rp {solverResult.summary.achievedNetProfit.toLocaleString('id-ID')}
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] flex items-center justify-between text-slate-400">
                  <span>Margin: {solverResult.summary.achievedNetMarginPercent.toFixed(1)}%</span>
                  <span className="text-emerald-400 font-mono font-bold">
                    Diff: Rp {solverResult.summary.differenceFromTarget.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action: Save to Product Catalog */}
            <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Nama produk untuk disimpan ke katalog"
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
              <button
                onClick={handleSaveToCatalog}
                className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-emerald-950"
              >
                {savedSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    Tersimpan di Katalog!
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Simpan ke Katalog Toko
                  </>
                )}
              </button>
            </div>
          </div>

          {/* THE WATERFALL BREAKDOWN (Prompt Section 2 & 6) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Alur Waterfall Perhitungan Mundur
                </h3>
                <p className="text-xs text-slate-400">
                  Pengurangan biaya bertahap dari Harga yang harus dipasang hingga Target Akhir Rp {targetAmount.toLocaleString('id-ID')}
                </p>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {solverResult.waterfall.length} Langkah
              </span>
            </div>

            {/* Waterfall Sequence */}
            <div className="space-y-2">
              {solverResult.waterfall.map((step) => {
                const isStart = step.category === 'START';
                const isFinal = step.category === 'FINAL_TARGET';
                const isDiscount = step.category === 'DISCOUNT';
                const isExpanded = expandedStep === step.id;

                return (
                  <div
                    key={step.id}
                    className={`rounded-xl border transition-all ${
                      isStart
                        ? 'bg-slate-800/80 border-slate-700'
                        : isFinal
                        ? 'bg-emerald-950/40 border-emerald-500/50'
                        : isDiscount
                        ? 'bg-orange-950/20 border-orange-500/30'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className="p-3.5 flex items-center justify-between cursor-pointer"
                      onClick={() =>
                        step.subDetails && setExpandedStep(isExpanded ? null : step.id)
                      }
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            isStart
                              ? 'bg-blue-500 text-white'
                              : isFinal
                              ? 'bg-emerald-500 text-slate-950 font-black'
                              : isDiscount
                              ? 'bg-orange-500 text-slate-950'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {step.stepNumber}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-semibold ${
                                isFinal
                                  ? 'text-emerald-400 text-sm font-bold'
                                  : isStart
                                  ? 'text-white text-sm'
                                  : 'text-slate-200'
                              }`}
                            >
                              {step.name}
                            </span>
                            {step.subDetails && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded">
                                {step.subDetails.length} komponen
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            {step.description}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-sm font-bold block ${
                            isStart
                              ? 'text-white'
                              : isFinal
                              ? 'text-emerald-400 font-extrabold text-base'
                              : isDiscount
                              ? 'text-orange-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {step.isDeduction ? '-' : ''}Rp {step.amount.toLocaleString('id-ID')}
                        </span>
                        <div className="flex items-center justify-end gap-1.5 text-[10px] text-slate-500 font-mono mt-0.5">
                          <span>Sisa: Rp {step.runningBalance.toLocaleString('id-ID')}</span>
                          {step.subDetails && (
                            isExpanded ? (
                              <ChevronUp className="w-3 h-3 text-slate-400" />
                            ) : (
                              <ChevronDown className="w-3 h-3 text-slate-400" />
                            )
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Sub Details Accordion */}
                    {step.subDetails && isExpanded && (
                      <div className="px-4 pb-3 pt-1 border-t border-slate-800/60 space-y-1.5 bg-slate-950/40 rounded-b-xl">
                        {step.subDetails.map((sub, sIdx) => (
                          <div
                            key={sIdx}
                            className="flex items-center justify-between text-xs py-1 border-b border-slate-900 last:border-none"
                          >
                            <span className="text-slate-400 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                              {sub.label}
                              {sub.notes && (
                                <span className="text-[10px] text-slate-500">
                                  ({sub.notes})
                                </span>
                              )}
                            </span>
                            <span className="font-medium text-slate-300">
                              Rp {sub.amount.toLocaleString('id-ID')}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Total Deductions Summary Banner */}
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-slate-400 block">Total Seluruh Potongan & Modal:</span>
                  <span className="font-bold text-rose-400 text-sm">
                    Rp {solverResult.summary.totalAllDeductions.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="border-l border-slate-800 pl-4">
                  <span className="text-slate-400 block">Persentase dari Harga Awal:</span>
                  <span className="font-semibold text-slate-300">
                    {solverResult.requiredListingPrice > 0
                      ? (
                          (solverResult.summary.totalAllDeductions /
                            solverResult.requiredListingPrice) *
                          100
                        ).toFixed(1)
                      : 0}
                    %
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-slate-400 block">TARGET AKHIR:</span>
                <span className="font-black text-emerald-400 text-base">
                  Rp {solverResult.summary.achievedNetProfit.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
