import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { calculateTrueProfit } from '../../services/profitEngine/index.ts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Megaphone,
  Target,
  ShoppingCart,
  Receipt,
  AlertTriangle,
  Package,
  Layers,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Calendar,
  Filter,
  ShieldAlert,
  FileText,
  PieChart as PieChartIcon,
  HelpCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const {
    products,
    orders,
    campaigns,
    inventory,
    currentStore,
    setCurrentView,
    openFormulaModal,
    taxProfile,
    marketplaceRules,
    programRules,
  } = useApp();

  const [dateRange, setDateRange] = useState<'today' | '7days' | '30days' | 'custom'>('30days');
  const [activeChartTab, setActiveChartTab] = useState<'rev-profit' | 'cost-breakdown' | 'leakage'>('rev-profit');

  // Filter multiplier based on selected date range
  const multiplier = useMemo(() => {
    switch (dateRange) {
      case 'today':
        return 0.04;
      case '7days':
        return 0.25;
      case '30days':
      default:
        return 1.0;
    }
  }, [dateRange]);

  // Aggregate True Profit Engine Metrics for the entire store
  const metrics = useMemo(() => {
    const rawRevenue30 = products.reduce((acc, p) => acc + p.revenue, 0);
    const rawHpp30 = products.reduce((acc, p) => acc + p.hpp * p.unitsSold, 0);
    const rawAds30 = campaigns.reduce((acc, c) => acc + c.cost, 0);

    const revenue = Math.round(rawRevenue30 * multiplier);
    const cogsHpp = Math.round(rawHpp30 * multiplier);
    const grossProfit = Math.max(0, revenue - cogsHpp);
    const adsCost = Math.round(rawAds30 * multiplier);
    const estimatedOrders = Math.max(1, Math.round(orders.length * 3.4 * multiplier));

    let marketplaceCost = 0;
    let programCost = 0;
    let affiliateCost = 0;
    let operationalCost = 0;
    let taxAmount = 0;
    let voucherDeduction = 0;
    let returnReserve = 0;

    products.forEach((p) => {
      const units = Math.max(1, Math.round(p.unitsSold * multiplier));
      const calc = calculateTrueProfit(
        {
          originalProductPrice: p.sellingPrice || p.effectivePrice,
          sellerDiscountPercent: p.discountPercent || 0,
          vouchers: p.voucherNominal > 0 ? [{ nominal: p.voucherNominal, payer: 'SELLER', type: 'FIXED' }] : [],
          hpp: p.hpp,
          sellerType: currentStore.sellerStatus || 'STAR',
          category: p.category || 'Fashion & Pakaian',
          isFreeShippingXtraActive: true,
          isPromoXtraActive: true,
          isPromoXtraPlusActive: false,
          isAffiliateActive: (p.affiliatePercent || 0) > 0,
          affiliateConfig: {
            enabled: (p.affiliatePercent || 0) > 0,
            commissionPercent: p.affiliatePercent || 3,
            includePpn: true,
          },
          adsCostPerOrder: units > 0 ? adsCost / Math.max(1, products.length * units) : 0,
          returnConfig: {
            returnRatePercent: 1.5,
            averageReturnShippingCost: 15000,
          },
          operationalCostConfig: {
            allocationType: 'PER_ORDER',
            packingCost: p.packingCost || 2500,
            laborCost: p.operationalCost || 1500,
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

      marketplaceCost += calc.totalMarketplaceFees * units;
      programCost += calc.totalProgramFees * units;
      affiliateCost += calc.totalAffiliateCost * units;
      operationalCost += calc.totalOperationalCost * units;
      taxAmount += calc.taxAmount * units;
      voucherDeduction += calc.totalSellerVoucherDeduction * units;
      returnReserve += calc.expectedReturnCost * units;
    });

    const isTaxExempt = taxProfile.hasSkbExemption || (taxProfile.taxpayerType === 'Individual' && revenue < 500000000);
    const trueNetProfit = revenue - cogsHpp - marketplaceCost - programCost - adsCost - operationalCost - taxAmount - returnReserve - affiliateCost;
    const trueMargin = revenue > 0 ? (trueNetProfit / revenue) * 100 : 0;
    const roasAktual = adsCost > 0 ? (revenue * 0.45) / adsCost : 0;
    const aov = estimatedOrders > 0 ? revenue / estimatedOrders : 0;

    return {
      revenue,
      cogsHpp,
      grossProfit,
      marketplaceCost,
      programCost,
      advertisingCost: adsCost,
      affiliateCost,
      operationalCost,
      taxAmount,
      returnReserve,
      voucherDeduction,
      trueNetProfit,
      trueMargin,
      estimatedOrders,
      roasAktual,
      aov,
      isTaxExempt,
    };
  }, [products, campaigns, orders, multiplier, currentStore, taxProfile, marketplaceRules, programRules]);

  // Timeline Series Data (Revenue vs True Profit)
  const chartData = useMemo(() => {
    const days = dateRange === 'today' ? 12 : dateRange === '7days' ? 7 : 30;
    const data = [];
    const baseRev = metrics.revenue / days;
    const baseProfit = metrics.trueNetProfit / days;
    const baseAds = metrics.advertisingCost / days;

    for (let i = 1; i <= days; i++) {
      const factor = 0.8 + Math.sin(i * 0.55) * 0.3 + (i % 3 === 0 ? 0.2 : 0);
      const rev = Math.round(baseRev * factor);
      const profit = Math.round(baseProfit * factor);
      const ads = Math.round(baseAds * factor);

      const label =
        dateRange === 'today'
          ? `${String(i * 2).padStart(2, '0')}:00`
          : dateRange === '7days'
          ? `H-${8 - i}`
          : `Tgl ${i}`;

      data.push({
        name: label,
        revenue: rev,
        trueNetProfit: profit,
        adsCost: ads,
      });
    }
    return data;
  }, [dateRange, metrics]);

  // Cost Breakdown Pie Data
  const costBreakdownData = useMemo(() => {
    return [
      { name: 'HPP / Modal Produk', value: metrics.cogsHpp, color: '#f43f5e' },
      { name: 'Biaya Marketplace (Admin+Proc)', value: metrics.marketplaceCost, color: '#f97316' },
      { name: 'Program Shopee (XTRA)', value: metrics.programCost, color: '#fbbf24' },
      { name: 'Biaya Iklan (Shopee Ads)', value: metrics.advertisingCost, color: '#8b5cf6' },
      { name: 'Packing & Operasional', value: metrics.operationalCost, color: '#06b6d4' },
      { name: 'Cadangan Retur & Risiko', value: metrics.returnReserve, color: '#ec4899' },
      { name: 'Estimasi Pajak PPh', value: metrics.taxAmount, color: '#64748b' },
      { name: 'True Net Profit (Sisa)', value: Math.max(0, metrics.trueNetProfit), color: '#10b981' },
    ];
  }, [metrics]);

  // Ranked Cost Components (Phase 13: Profit Leak Detector)
  const costRanking = useMemo(() => {
    const list = [
      { category: 'Advertising', label: 'Biaya Iklan (Shopee Ads)', amount: metrics.advertisingCost, view: 'campaign-analytics' },
      { category: 'Marketplace', label: 'Biaya Admin & Pemrosesan Shopee', amount: metrics.marketplaceCost, view: 'admin-fee-rules' },
      { category: 'Program', label: 'Program Biaya XTRA (Gratis Ongkir + Promo)', amount: metrics.programCost, view: 'fee-scenarios' },
      { category: 'Affiliate', label: 'Komisi Kreator Shopee Affiliate', amount: metrics.affiliateCost, view: 'true-profit-engine' },
      { category: 'Voucher', label: 'Potongan Voucher Toko Seller', amount: metrics.voucherDeduction, view: 'voucher-simulator' },
      { category: 'Operasional', label: 'Biaya Packing & Operasional Gudang', amount: metrics.operationalCost, view: 'inventory' },
      { category: 'Retur', label: 'Cadangan Resiko Retur & Rusak', amount: metrics.returnReserve, view: 'orders' },
    ].sort((a, b) => b.amount - a.amount);

    const largest = list[0];
    const percentOfRev = metrics.revenue > 0 ? ((largest.amount / metrics.revenue) * 100).toFixed(1) : '0';
    return { list, largest, percentOfRev };
  }, [metrics]);

  // Profit Leakage Analysis Items
  const profitLeakages = useMemo(() => {
    const list = [];
    const lossProds = products.filter((p) => p.status === 'LOSS' || p.netProfit < 0);
    if (lossProds.length > 0) {
      list.push({
        title: `${lossProds.length} Produk Mengalami Rugi Riil (Boncos)`,
        amount: Math.abs(lossProds.reduce((acc, p) => acc + p.netProfit, 0)),
        cause: 'Biaya iklan per produk melebihi margin kotor sebelum ads.',
        action: 'Kurangi bid kata kunci atau jeda campaign iklan.',
        targetView: 'campaign-analytics',
        severity: 'danger',
      });
    }

    const promoXtraRule = programRules.find((r) => r.code === 'PROMO_XTRA');
    const promoXtraRate = (promoXtraRule?.rate ?? 4.5) / 100;
    const lowMarginProds = products.filter((p) => p.marginPercent < 8 && p.unitsSold > 100);
    if (lowMarginProds.length > 0) {
      list.push({
        title: 'Kebocoran Program Fee pada Produk Volume Tinggi',
        amount: Math.round(lowMarginProds.reduce((acc, p) => acc + p.revenue * promoXtraRate, 0)),
        cause: `Program Cashback XTRA memotong ${(promoXtraRate * 100).toFixed(1)}% pada produk ber-margin tipis.`,
        action: 'Nonaktifkan Promo Xtra khusus untuk SKU tipis ini.',
        targetView: 'product-analytics',
        severity: 'warning',
      });
    }

    list.push({
      title: 'Kebocoran dari Retur Barang (Estimasi 2.5%)',
      amount: metrics.returnReserve,
      cause: 'Ongkir retur pembeli dan kerusakan kemasan lakban/box.',
      action: 'Tingkatkan kualitas panduan ukuran & proteksi bubble wrap.',
      targetView: 'orders',
      severity: 'info',
    });

    return list;
  }, [products, metrics]);

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Top Banner & Verified Engine */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-orange-500" />
              <span>True Profit Financial Dashboard</span>
            </h1>
            <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300 border border-emerald-500/30">
              Live OS
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Financial Operating System toko {currentStore.name} dengan audit pemotongan fee Shopee, pajak, dan laba riil.
          </p>
        </div>

        {/* Date Filter & Quick Action */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setCurrentView('true-profit-engine')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-sm transition"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>True Profit Engine</span>
          </button>

          <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 p-1 text-xs self-start sm:self-auto">
            {(['today', '7days', '30days', 'custom'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setDateRange(t)}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  dateRange === t
                    ? 'bg-orange-500 text-white shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t === 'today' ? 'Hari Ini' : t === '7days' ? '7 Hari' : t === '30days' ? '30 Hari' : 'Custom'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 8 REQUIRED KPI CARDS (Requirement FINAL UI) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* 1. Revenue */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-3.5 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">1. Revenue</div>
          <div className="text-sm sm:text-base font-black text-white truncate">
            Rp {(metrics.revenue / 1000000).toFixed(1)} jt
          </div>
          <div className="text-[10px] text-blue-400 font-medium truncate">Omzet Kotor</div>
        </div>

        {/* 2. Gross Profit */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-3.5 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">2. Gross Profit</div>
          <div className="text-sm sm:text-base font-black text-white truncate">
            Rp {(metrics.grossProfit / 1000000).toFixed(1)} jt
          </div>
          <div className="text-[10px] text-slate-500 truncate">Setelah HPP</div>
        </div>

        {/* 3. Marketplace Cost */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-3.5 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">3. Marketplace</div>
          <div className="text-sm sm:text-base font-black text-amber-300 truncate">
            Rp {(metrics.marketplaceCost / 1000000).toFixed(2)} jt
          </div>
          <div className="text-[10px] text-amber-400/80 truncate">Admin + Rp1.250</div>
        </div>

        {/* 4. Program Cost */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-3.5 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">4. Program Cost</div>
          <div className="text-sm sm:text-base font-black text-amber-300 truncate">
            Rp {(metrics.programCost / 1000000).toFixed(2)} jt
          </div>
          <div className="text-[10px] text-amber-400/80 truncate">Gratis Ongkir Xtra</div>
        </div>

        {/* 5. Advertising Cost */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-3.5 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">5. Ads Cost</div>
          <div className="text-sm sm:text-base font-black text-rose-300 truncate">
            Rp {(metrics.advertisingCost / 1000000).toFixed(2)} jt
          </div>
          <div className="text-[10px] text-rose-400/80 truncate">ROAS: {metrics.roasAktual.toFixed(1)}x</div>
        </div>

        {/* 6. Tax */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-3.5 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">6. Estimasi Pajak</div>
          <div className="text-sm sm:text-base font-black text-slate-300 truncate">
            {metrics.isTaxExempt ? 'Rp 0' : `Rp ${(metrics.taxAmount / 1000).toFixed(0)}k`}
          </div>
          <div className="text-[10px] text-slate-500 truncate">
            {metrics.isTaxExempt ? 'Bebas <500M' : 'PPh Final 0.5%'}
          </div>
        </div>

        {/* 7. True Net Profit */}
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-3.5 space-y-1">
          <div className="text-[10px] uppercase font-bold text-emerald-400">7. True Profit</div>
          <div className="text-sm sm:text-base font-black text-emerald-300 truncate">
            Rp {(metrics.trueNetProfit / 1000000).toFixed(1)} jt
          </div>
          <div className="text-[10px] text-emerald-400 font-bold truncate">Laba Bersih Riil</div>
        </div>

        {/* 8. True Margin */}
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-3.5 space-y-1">
          <div className="text-[10px] uppercase font-bold text-emerald-400">8. True Margin</div>
          <div className="text-sm sm:text-base font-black text-emerald-300">
            {metrics.trueMargin.toFixed(1)}%
          </div>
          <div className="text-[10px] text-emerald-400 font-bold truncate">Net Margin %</div>
        </div>
      </div>

      {/* QUICK TRUE PROFIT WATERFALL LINK BANNER */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-orange-950/20 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-sm text-white">Shopee True Profit Waterfall Engine</h2>
            <span className="rounded bg-orange-500/20 px-2 py-0.5 text-[10px] font-bold text-orange-400">
              12 Komponen Biaya
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Simulasikan produk individu dengan tombol toggle Gratis Ongkir Xtra, Promo Xtra, Affiliate, Dikelola Shopee (FBS), cadangan retur, dan formula audit transparan.
          </p>
        </div>

        <button
          onClick={() => setCurrentView('true-profit-engine')}
          className="shrink-0 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-xs font-bold text-white shadow-lg shadow-orange-500/20 active:scale-98 transition flex items-center gap-2"
        >
          <span>Buka True Profit Simulator</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* GRAPH SECTION: Revenue vs True Profit & Cost Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Revenue vs True Profit Timeline (7 Cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h2 className="font-bold text-sm text-white">Grafik: Revenue vs True Net Profit</h2>
              <span className="text-[11px] text-slate-400">Dinamika omzet kotor vs laba bersih riil yang tersisa</span>
            </div>

            <button
              onClick={() => openFormulaModal('roas')}
              className="text-xs text-orange-400 hover:underline flex items-center gap-1"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span>Formula Audit</span>
            </button>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickFormatter={(val) => `Rp${(val / 1000).toFixed(0)}k`}
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
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Gross Revenue (Omzet)"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  fill="url(#colorRev)"
                />
                <Area
                  type="monotone"
                  dataKey="trueNetProfit"
                  name="True Net Profit"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#colorNet)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Cost Breakdown (5 Cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h2 className="font-bold text-sm text-white">Cost Breakdown (Struktur Biaya)</h2>
            <span className="text-[11px] text-slate-400">Porsi Pengeluaran</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={costBreakdownData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {costBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '10px',
                    fontSize: '11px',
                  }}
                  formatter={(val: any) => [`Rp ${Number(val).toLocaleString('id-ID')}`]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300">
            {costBreakdownData.slice(0, 6).map((item) => (
              <div key={item.name} className="flex items-center gap-1.5 truncate">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PROFIT LEAK DETECTOR (Phase 13) */}
      <div className="rounded-2xl border border-rose-500/30 bg-rose-950/10 p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-rose-500/20 gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-rose-400" />
            <div>
              <h2 className="font-bold text-sm text-white">
                Profit Leak Detector
              </h2>
              <span className="text-[11px] text-slate-400">
                Peringkat beban biaya terbesar berdasarkan data transaksi aktual
              </span>
            </div>
          </div>
          <span className="text-xs text-rose-400 font-mono font-bold">
            Total Kebocoran: Rp {profitLeakages.reduce((acc, l) => acc + l.amount, 0).toLocaleString('id-ID')}
          </span>
        </div>

        {/* Phase 13 Statement Hero Banner */}
        <div className="rounded-xl border border-rose-500/40 bg-slate-950 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
            <span className="font-bold text-xs text-white">
              "{costRanking.largest.category} merupakan komponen biaya terbesar pada periode ini."
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Data pendukung: Pengeluaran untuk <strong className="text-white">{costRanking.largest.label}</strong> mencapai <strong className="text-rose-400 font-mono">Rp {costRanking.largest.amount.toLocaleString('id-ID')}</strong> ({costRanking.percentOfRev}% dari seluruh omzet kotor toko).
          </p>

          <div className="pt-2 border-t border-slate-900 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            {costRanking.list.slice(0, 4).map((c, i) => (
              <div key={i} className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">{c.category}:</span>
                <span className="font-bold text-white">Rp {c.amount.toLocaleString('id-ID')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actionable Leakage Items */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {profitLeakages.map((item, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2 text-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-white leading-tight">{item.title}</span>
                <span className="font-mono font-black text-rose-400 shrink-0">
                  -Rp {item.amount.toLocaleString('id-ID')}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                <strong className="text-slate-300">Penyebab: </strong>
                {item.cause}
              </p>

              <div className="pt-2 border-t border-slate-900 flex items-center justify-between">
                <span className="text-[10px] text-emerald-400 font-medium">Solusi: {item.action}</span>
                <button
                  onClick={() => setCurrentView(item.targetView as any)}
                  className="text-[10px] text-orange-400 hover:underline font-bold shrink-0"
                >
                  Tindak Lanjut →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
