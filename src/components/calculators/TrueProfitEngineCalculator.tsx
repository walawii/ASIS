import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { calculateTrueProfit } from '../../services/profitEngine/index.ts';
import { SellerType } from '../../types/rules.ts';
import { VoucherConfig } from '../../types/profit.ts';
import { CalculationAuditModal } from '../common/CalculationAuditModal.tsx';
import {
  Sparkles,
  Shield,
  HelpCircle,
  TrendingUp,
  Percent,
  Layers,
  Truck,
  RotateCcw,
  Boxes,
  FileText,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  ChevronDown,
  BookOpen,
} from 'lucide-react';

export const TrueProfitEngineCalculator: React.FC = () => {
  const { marketplaceRules, programRules, taxProfile, openTutorial } = useApp();

  // 1. Identitas & Status Seller
  const [sellerType, setSellerType] = useState<SellerType>('STAR');
  const [category, setCategory] = useState<string>('Fashion & Pakaian');

  // 2. Harga & Diskon
  const [originalPrice, setOriginalPrice] = useState<number>(129000);
  const [sellerDiscountPercent, setSellerDiscountPercent] = useState<number>(10);
  const [sellerVoucherNominal, setSellerVoucherNominal] = useState<number>(5000);
  const [platformVoucherNominal, setPlatformVoucherNominal] = useState<number>(10000); // 100% platform funded

  // 3. Modal & Operasional
  const [hpp, setHpp] = useState<number>(55000);
  const [packingCost, setPackingCost] = useState<number>(2500);
  const [laborCost, setLaborCost] = useState<number>(1500);

  // 4. Program Toggles
  const [isFreeShippingXtraActive, setIsFreeShippingXtraActive] = useState<boolean>(true);
  const [isPromoXtraActive, setIsPromoXtraActive] = useState<boolean>(true);
  const [isPromoXtraPlusActive, setIsPromoXtraPlusActive] = useState<boolean>(false);
  const [isAffiliateActive, setIsAffiliateActive] = useState<boolean>(true);
  const [affiliateCommissionPercent, setAffiliateCommissionPercent] = useState<number>(5.0);

  // 5. Iklan Shopee Ads
  const [adsCostPerOrder, setAdsCostPerOrder] = useState<number>(12000);

  // 6. Fulfillment (Dikelola Shopee / FBS)
  const [isFulfillmentActive, setIsFulfillmentActive] = useState<boolean>(false);
  const [fbsPackagingFee, setFbsPackagingFee] = useState<number>(3000);

  // 7. Retur / Refund
  const [isReturnReserveActive, setIsReturnReserveActive] = useState<boolean>(true);
  const [returnRatePercent, setReturnRatePercent] = useState<number>(2.5);
  const [avgReturnHandlingCost, setAvgReturnHandlingCost] = useState<number>(18000);

  // 8. Subsidi Ongkir Toko
  const [sellerShippingSubsidy, setSellerShippingSubsidy] = useState<number>(0);

  // Modal Audit state
  const [auditModalOpen, setAuditModalOpen] = useState(false);

  // Vouchers array
  const vouchers = useMemo<VoucherConfig[]>(() => {
    const list: VoucherConfig[] = [];
    if (sellerVoucherNominal > 0) {
      list.push({
        type: 'FIXED',
        nominal: sellerVoucherNominal,
        payer: 'SELLER',
        description: 'Voucher Toko Seller',
      });
    }
    if (platformVoucherNominal > 0) {
      list.push({
        type: 'FIXED',
        nominal: platformVoucherNominal,
        payer: 'PLATFORM',
        description: 'Voucher Subsidi Shopee Platform',
      });
    }
    return list;
  }, [sellerVoucherNominal, platformVoucherNominal]);

  // Execute True Profit Engine calculation
  const trueProfit = useMemo(() => {
    return calculateTrueProfit(
      {
        originalProductPrice: originalPrice,
        sellerDiscountPercent,
        vouchers,
        hpp,
        sellerType,
        category,
        isFreeShippingXtraActive,
        isPromoXtraActive,
        isPromoXtraPlusActive,
        isAffiliateActive,
        affiliateConfig: {
          enabled: isAffiliateActive,
          commissionPercent: affiliateCommissionPercent,
          includePpn: true,
        },
        adsCostPerOrder,
        fulfillmentConfig: {
          enabled: isFulfillmentActive,
          packagingFee: fbsPackagingFee,
        },
        shippingConfig: {
          actualShippingCost: 15000,
          buyerShippingPaid: 15000,
          sellerShippingContribution: sellerShippingSubsidy,
          platformShippingSubsidy: 0,
          returnShippingCost: 10000,
        },
        returnConfig: isReturnReserveActive
          ? {
              returnRatePercent,
              refundRatePercent: 1.0,
              defectRatePercent: 0.5,
              cancellationRatePercent: 1.0,
              averageReturnShippingCost: avgReturnHandlingCost,
              replacementCost: 5000,
              restockingCost: 2000,
            }
          : undefined,
        operationalCostConfig: {
          allocationType: 'PER_ORDER',
          packingCost,
          laborCost,
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
    originalPrice,
    sellerDiscountPercent,
    vouchers,
    hpp,
    sellerType,
    category,
    isFreeShippingXtraActive,
    isPromoXtraActive,
    isPromoXtraPlusActive,
    isAffiliateActive,
    affiliateCommissionPercent,
    adsCostPerOrder,
    isFulfillmentActive,
    fbsPackagingFee,
    sellerShippingSubsidy,
    isReturnReserveActive,
    returnRatePercent,
    avgReturnHandlingCost,
    packingCost,
    laborCost,
    marketplaceRules,
    programRules,
    taxProfile,
  ]);

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-orange-500" />
              <span>Shopee Seller True Profit Engine™</span>
            </h1>
            <span className="rounded-full bg-orange-500/20 px-2.5 py-0.5 text-xs font-black text-orange-400 border border-orange-500/30">
              Shopee 2026 Standards
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Menghitung keuntungan sebenarnya dari setiap transaksi setelah seluruh biaya marketplace, program promo, iklan, affiliate, fulfillment, pajak, dan cadangan retur.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => openTutorial('true-profit-engine')}
            className="flex items-center gap-1.5 rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-3.5 py-2 text-xs font-bold text-indigo-300 hover:bg-indigo-500/20 transition shadow-sm"
            title="Pelajari panduan True Profit Engine dan cara membaca audit fee"
          >
            <BookOpen className="h-4 w-4 text-indigo-400" />
            <span>📖 Tutorial</span>
          </button>
          <button
            onClick={() => setAuditModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-orange-500/40 bg-orange-500/10 px-3.5 py-2 text-xs font-bold text-orange-300 hover:bg-orange-500/20 transition self-start sm:self-auto"
          >
            <HelpCircle className="h-4 w-4" />
            <span>Audit Log</span>
          </button>
        </div>
      </div>

      {/* Grid: Inputs (7 Cols) and Visual Waterfall (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Inputs Column */}
        <div className="lg:col-span-7 space-y-4">
          {/* Card 1: Status Toko & Kategori */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                1. Status Toko & Kategori Produk
              </h2>
              <span className="text-xs text-slate-400 font-mono">
                Admin Rate: {trueProfit.marketplaceAdminPercent}%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Tipe / Status Seller
                </label>
                <select
                  value={sellerType}
                  onChange={(e) => setSellerType(e.target.value as SellerType)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="NON_STAR">Non-Star Seller (Reguler)</option>
                  <option value="STAR">Star Seller</option>
                  <option value="STAR_PLUS">Star+ Seller</option>
                  <option value="MALL">Shopee Mall Official Brand</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Kategori Produk
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="Fashion & Pakaian">Fashion & Pakaian</option>
                  <option value="Elektronik & Gadget">Elektronik & Gadget</option>
                  <option value="Kecantikan & Perawatan">Kecantikan & Perawatan</option>
                  <option value="Umum">Umum / Lainnya</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card 2: Harga, Diskon & Voucher */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800">
              2. Harga Jual, Diskon & Voucher
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Harga Normal
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1.5 text-xs text-slate-500">Rp</span>
                  <input
                    type="number"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-8 pr-2 py-1.5 text-xs font-bold text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Diskon Seller %
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={sellerDiscountPercent}
                    onChange={(e) => setSellerDiscountPercent(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white"
                  />
                  <span className="absolute right-2.5 top-1.5 text-xs text-slate-400">%</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Voucher Seller (Rp)
                </label>
                <input
                  type="number"
                  value={sellerVoucherNominal}
                  onChange={(e) => setSellerVoucherNominal(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Voucher Shopee (Rp)
                </label>
                <input
                  type="number"
                  value={platformVoucherNominal}
                  onChange={(e) => setPlatformVoucherNominal(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-emerald-400"
                />
              </div>
            </div>
            <span className="text-[10px] text-slate-500 block">
              *Voucher Shopee disubsidi platform 100% dan tidak memotong keuntungan toko Anda.
            </span>
          </div>

          {/* Card 3: Modal HPP & Operasional */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800">
              3. Modal Pokok & Operasional Toko
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  HPP / Modal Barang
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1.5 text-xs text-slate-500">Rp</span>
                  <input
                    type="number"
                    value={hpp}
                    onChange={(e) => setHpp(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-8 pr-2 py-1.5 text-xs font-bold text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Biaya Packing
                </label>
                <input
                  type="number"
                  value={packingCost}
                  onChange={(e) => setPackingCost(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Gaji / Ops per Order
                </label>
                <input
                  type="number"
                  value={laborCost}
                  onChange={(e) => setLaborCost(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Iklan Shopee Ads / Pcs
                </label>
                <input
                  type="number"
                  value={adsCostPerOrder}
                  onChange={(e) => setAdsCostPerOrder(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs font-bold text-rose-300"
                />
              </div>
            </div>
          </div>

          {/* Card 4: Program Marketplace Shopee (Interactive Toggles) */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800">
              4. Program Promosi Shopee yang Diikuti
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Gratis Ongkir Xtra */}
              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-800 bg-slate-950 cursor-pointer hover:border-slate-700 transition">
                <input
                  type="checkbox"
                  checked={isFreeShippingXtraActive}
                  onChange={(e) => setIsFreeShippingXtraActive(e.target.checked)}
                  className="mt-0.5 rounded accent-orange-500"
                />
                <div>
                  <span className="font-bold text-white block">Gratis Ongkir XTRA</span>
                  <span className="text-[10px] text-slate-400">
                    {isFreeShippingXtraActive ? `Aktif (${category === 'Elektronik & Gadget' ? '3.5%' : '4.0%'} cap Rp10k)` : 'Tidak Aktif (Rp 0)'}
                  </span>
                </div>
              </label>

              {/* Promo Xtra */}
              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-800 bg-slate-950 cursor-pointer hover:border-slate-700 transition">
                <input
                  type="checkbox"
                  checked={isPromoXtraActive}
                  onChange={(e) => setIsPromoXtraActive(e.target.checked)}
                  className="mt-0.5 rounded accent-orange-500"
                />
                <div>
                  <span className="font-bold text-white block">Promo XTRA (Cashback XTRA)</span>
                  <span className="text-[10px] text-slate-400">
                    {isPromoXtraActive ? 'Aktif (4.5% cap Rp60k)' : 'Tidak Aktif (Rp 0)'}
                  </span>
                </div>
              </label>

              {/* Promo Xtra+ */}
              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-800 bg-slate-950 cursor-pointer hover:border-slate-700 transition">
                <input
                  type="checkbox"
                  checked={isPromoXtraPlusActive}
                  onChange={(e) => setIsPromoXtraPlusActive(e.target.checked)}
                  className="mt-0.5 rounded accent-orange-500"
                />
                <div>
                  <span className="font-bold text-white block">Promo XTRA+ (Double Boost)</span>
                  <span className="text-[10px] text-slate-400">
                    {isPromoXtraPlusActive ? 'Aktif (6.5% cap Rp75k)' : 'Tidak Aktif (Rp 0)'}
                  </span>
                </div>
              </label>

              {/* Shopee Affiliate */}
              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-800 bg-slate-950 cursor-pointer hover:border-slate-700 transition">
                <input
                  type="checkbox"
                  checked={isAffiliateActive}
                  onChange={(e) => setIsAffiliateActive(e.target.checked)}
                  className="mt-0.5 rounded accent-orange-500"
                />
                <div className="flex-1">
                  <span className="font-bold text-white block">Shopee Affiliate Seller</span>
                  {isAffiliateActive ? (
                    <div className="flex items-center gap-1 mt-1">
                      <input
                        type="number"
                        step="0.5"
                        value={affiliateCommissionPercent}
                        onChange={(e) => setAffiliateCommissionPercent(Number(e.target.value))}
                        className="w-12 rounded border border-slate-700 bg-slate-900 px-1 py-0.5 text-[10px] text-white"
                      />
                      <span className="text-[10px] text-slate-400">% + PPN 11%</span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-400">Tidak Aktif (Rp 0)</span>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Card 5: Fulfillment & Cadangan Retur */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800">
              5. Fulfillment & Cadangan Risiko Retur
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-800 bg-slate-950 cursor-pointer hover:border-slate-700 transition">
                <input
                  type="checkbox"
                  checked={isFulfillmentActive}
                  onChange={(e) => setIsFulfillmentActive(e.target.checked)}
                  className="mt-0.5 rounded accent-orange-500"
                />
                <div>
                  <span className="font-bold text-white block">Dikelola Shopee (FBS Fulfillment)</span>
                  <span className="text-[10px] text-slate-400">
                    {isFulfillmentActive ? `Biaya handling Rp ${fbsPackagingFee.toLocaleString('id-ID')}` : 'Packing Mandiri di Gudang Sendiri'}
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-800 bg-slate-950 cursor-pointer hover:border-slate-700 transition">
                <input
                  type="checkbox"
                  checked={isReturnReserveActive}
                  onChange={(e) => setIsReturnReserveActive(e.target.checked)}
                  className="mt-0.5 rounded accent-orange-500"
                />
                <div>
                  <span className="font-bold text-white block">Cadangan Risiko Retur Barang</span>
                  <span className="text-[10px] text-slate-400">
                    {isReturnReserveActive ? `Buffer ${returnRatePercent}% × Rp${(avgReturnHandlingCost/1000).toFixed(0)}k = Rp ${trueProfit.expectedReturnCost}` : 'Tidak dialokasikan'}
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Output Column: TRUE PROFIT WATERFALL VISUAL (5 Cols) */}
        <div className="lg:col-span-5 space-y-4 sticky top-20">
          <div className="rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-6 shadow-2xl space-y-5">
            {/* Header & Status */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                True Profit Breakdown
              </span>

              <span
                className={`px-3 py-1 rounded-full text-xs font-black tracking-wide border shadow-md ${
                  trueProfit.profitStatus === 'PROFITABLE'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : trueProfit.profitStatus === 'LOSS'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}
              >
                {trueProfit.profitStatus}
              </span>
            </div>

            {/* Big Primary Metric: Expected Net Profit */}
            <div>
              <div className="text-xs text-slate-400 font-medium">True Net Profit (Laba Bersih Riil):</div>
              <div
                className={`text-3xl sm:text-4xl font-black tracking-tight mt-0.5 ${
                  trueProfit.expectedNetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                Rp {trueProfit.expectedNetProfit.toLocaleString('id-ID')}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300 mt-1">
                <span>True Margin: <strong className="text-white">{trueProfit.expectedNetMargin}%</strong></span>
                <span>•</span>
                <span>BEP ROAS: <strong className="text-amber-400">{trueProfit.breakEvenRoas}x</strong></span>
              </div>
            </div>

            {/* TRUE PROFIT WATERFALL FLOW */}
            <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 space-y-2 text-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-800/80">
                Alur Pemotongan Waterfall Riil
              </div>

              <div className="flex justify-between text-slate-200">
                <span>Harga Produk Normal:</span>
                <span className="font-mono">Rp {trueProfit.grossProductPrice.toLocaleString('id-ID')}</span>
              </div>

              {trueProfit.sellerDiscountAmount > 0 && (
                <div className="flex justify-between text-slate-400">
                  <span>- Diskon Seller ({sellerDiscountPercent}%):</span>
                  <span className="font-mono text-rose-400">-Rp {trueProfit.sellerDiscountAmount.toLocaleString('id-ID')}</span>
                </div>
              )}

              {trueProfit.totalSellerVoucherDeduction > 0 && (
                <div className="flex justify-between text-slate-400">
                  <span>- Voucher Toko Seller:</span>
                  <span className="font-mono text-rose-400">-Rp {trueProfit.totalSellerVoucherDeduction.toLocaleString('id-ID')}</span>
                </div>
              )}

              <div className="flex justify-between text-white font-bold bg-slate-900/60 p-1.5 rounded">
                <span>Fee Base (Dasar Biaya Shopee):</span>
                <span className="font-mono text-orange-400">Rp {trueProfit.feeBase.toLocaleString('id-ID')}</span>
              </div>

              <div className="flex justify-between text-slate-400">
                <span>- Admin Shopee ({trueProfit.marketplaceAdminPercent}%):</span>
                <span className="font-mono text-rose-400">-Rp {trueProfit.marketplaceAdminFee.toLocaleString('id-ID')}</span>
              </div>

              <div className="flex justify-between text-slate-400">
                <span>- Biaya Pemrosesan Pesanan:</span>
                <span className="font-mono text-rose-400">-Rp {trueProfit.orderProcessingFee.toLocaleString('id-ID')}</span>
              </div>

              {trueProfit.totalProgramFees > 0 && (
                <div className="flex justify-between text-slate-400">
                  <span>- Biaya Program (Gratis Ongkir/Promo XTRA):</span>
                  <span className="font-mono text-rose-400">-Rp {trueProfit.totalProgramFees.toLocaleString('id-ID')}</span>
                </div>
              )}

              {trueProfit.totalAffiliateCost > 0 && (
                <div className="flex justify-between text-slate-400">
                  <span>- Komisi Affiliate + PPN 11%:</span>
                  <span className="font-mono text-rose-400">-Rp {trueProfit.totalAffiliateCost.toLocaleString('id-ID')}</span>
                </div>
              )}

              {trueProfit.adsCostPerOrder > 0 && (
                <div className="flex justify-between text-slate-400">
                  <span>- Alokasi Biaya Shopee Ads:</span>
                  <span className="font-mono text-rose-400">-Rp {trueProfit.adsCostPerOrder.toLocaleString('id-ID')}</span>
                </div>
              )}

              {trueProfit.fulfillmentCost > 0 && (
                <div className="flex justify-between text-slate-400">
                  <span>- Dikelola Shopee (FBS Fulfillment):</span>
                  <span className="font-mono text-rose-400">-Rp {trueProfit.fulfillmentCost.toLocaleString('id-ID')}</span>
                </div>
              )}

              {trueProfit.expectedReturnCost > 0 && (
                <div className="flex justify-between text-slate-400">
                  <span>- Cadangan Risiko Retur:</span>
                  <span className="font-mono text-amber-400">-Rp {trueProfit.expectedReturnCost.toLocaleString('id-ID')}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-400">
                <span>- Biaya Operasional Toko:</span>
                <span className="font-mono text-rose-400">-Rp {trueProfit.totalOperationalCost.toLocaleString('id-ID')}</span>
              </div>

              <div className="flex justify-between text-slate-400">
                <span>- Estimasi Pajak UMKM (PP 55/2022):</span>
                <span className="font-mono text-slate-300">
                  {trueProfit.isTaxExempt ? 'Rp 0 (Bebas)' : `-Rp ${trueProfit.taxAmount.toLocaleString('id-ID')}`}
                </span>
              </div>

              <div className="flex justify-between text-slate-400">
                <span>- HPP Modal Barang:</span>
                <span className="font-mono text-rose-400">-Rp {trueProfit.cogsHpp.toLocaleString('id-ID')}</span>
              </div>

              <div className="flex justify-between text-white font-extrabold text-sm pt-2 border-t border-slate-800">
                <span>= TRUE NET PROFIT:</span>
                <span className={trueProfit.expectedNetProfit >= 0 ? 'text-emerald-400 font-mono' : 'text-rose-400 font-mono'}>
                  Rp {trueProfit.expectedNetProfit.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Price Targets Card */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-1.5 text-xs">
              <div className="text-[10px] font-bold uppercase text-slate-400 pb-1 border-b border-slate-800">
                Target Rekomendasi Harga Jual Baru:
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Harga Minimum Titik Impas (BEP):</span>
                <span className="font-mono font-bold text-amber-400">
                  Rp {trueProfit.breakEvenPrice.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Harga Rekomendasi (Margin 15%):</span>
                <span className="font-mono font-bold text-white">
                  Rp {trueProfit.targetPrice15.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Harga Rekomendasi (Margin 20%):</span>
                <span className="font-mono font-bold text-emerald-400">
                  Rp {trueProfit.targetPrice20.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800/80">
                <span>Diskon Coret Maksimal yang Aman:</span>
                <span className="font-mono font-bold text-purple-300">
                  {trueProfit.maximumDiscountPercent}%
                </span>
              </div>
            </div>

            {/* Official Disclaimer (Requirement AD) */}
            <div className="rounded-xl bg-slate-950 p-3 text-[10px] text-slate-400 leading-relaxed border border-slate-800/80">
              <strong className="text-slate-300">Disclaimer Resmi:</strong> Perhitungan ASIS merupakan estimasi berdasarkan data dan aturan biaya yang Anda masukkan. Tarif marketplace, program promosi, pajak, dan ketentuan lainnya dapat berubah sewaktu-waktu. Selalu verifikasi biaya aktual pada Seller Centre dan ketentuan resmi Shopee/DJP.
            </div>
          </div>
        </div>
      </div>

      {/* Modal Calculation Audit */}
      <CalculationAuditModal
        isOpen={auditModalOpen}
        onClose={() => setAuditModalOpen(false)}
        auditSteps={trueProfit.auditSteps}
        productName="Simulasi True Profit Engine"
      />
    </div>
  );
};
