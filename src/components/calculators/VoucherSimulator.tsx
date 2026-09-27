import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { calculateTrueProfit } from '../../services/profitEngine/index.ts';
import { SellerType } from '../../types/rules.ts';
import { Ticket, Percent, DollarSign, HelpCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

export const VoucherSimulator: React.FC = () => {
  const { currentStore, marketplaceRules, programRules, taxProfile, openFormulaModal } = useApp();

  const [sellingPrice, setSellingPrice] = useState(150000);
  const [hpp, setHpp] = useState(70000);
  const [voucherType, setVoucherType] = useState<'nominal' | 'percentage'>('nominal');
  const [voucherNominal, setVoucherNominal] = useState(15000);
  const [voucherPercent, setVoucherPercent] = useState(10);
  const [minSpend, setMinSpend] = useState(120000);
  const [fundingSource, setFundingSource] = useState<'seller' | 'platform' | 'split'>('seller');
  const [sellerContributionShare, setSellerContributionShare] = useState(100); // 100% jika seller funded
  const [shippingSubsidySeller, setShippingSubsidySeller] = useState(3000); // Gratis ongkir ditanggung seller

  // Calculation via True Profit Engine
  const simulation = useMemo(() => {
    // Determine raw voucher discount amount
    const rawVoucherAmount =
      voucherType === 'nominal'
        ? voucherNominal
        : sellingPrice * (voucherPercent / 100);

    // Portion paid by Seller vs Platform
    const sellerVoucherBurden =
      fundingSource === 'seller'
        ? rawVoucherAmount
        : fundingSource === 'platform'
        ? 0
        : rawVoucherAmount * (sellerContributionShare / 100);

    const platformVoucherBurden = rawVoucherAmount - sellerVoucherBurden;

    // Price paid by buyer
    const buyerPays = Math.max(0, sellingPrice - rawVoucherAmount);

    // Revenue received by seller:
    // If platform funded, Shopee reimburses platform portion to seller!
    // So seller receives: buyerPays + platformVoucherBurden = sellingPrice - sellerVoucherBurden
    const sellerEffectiveRevenue = sellingPrice - sellerVoucherBurden;

    const vouchers: any[] = [];
    if (sellerVoucherBurden > 0) {
      vouchers.push({ type: 'FIXED', nominal: sellerVoucherBurden, payer: 'SELLER' });
    }
    if (platformVoucherBurden > 0) {
      vouchers.push({ type: 'FIXED', nominal: platformVoucherBurden, payer: 'PLATFORM' });
    }

    // Net profit calculation via True Profit Engine
    const profitRes = calculateTrueProfit(
      {
        originalProductPrice: sellingPrice,
        sellerDiscountPercent: 0,
        vouchers,
        hpp,
        sellerType: (currentStore.sellerStatus || 'STAR') as SellerType,
        category: 'Fashion & Pakaian',
        isFreeShippingXtraActive: true,
        isPromoXtraActive: true,
        isPromoXtraPlusActive: false,
        isAffiliateActive: false,
        shippingConfig: {
          actualShippingCost: 0,
          buyerShippingPaid: 0,
          sellerShippingContribution: shippingSubsidySeller,
          platformShippingSubsidy: 0,
          returnShippingCost: 0,
        },
        operationalCostConfig: {
          allocationType: 'PER_ORDER',
          packingCost: currentStore.defaultPackingCost,
          laborCost: currentStore.defaultOperationalCost,
          warehouseCost: 0,
          electricityCost: 0,
          internetCost: 0,
          softwareCost: 0,
          rentCost: 0,
          customerServiceCost: 0,
          paymentGatewayCost: 0,
          otherCost: 0,
        },
        adsCostPerOrder: 10000,
      },
      marketplaceRules,
      programRules,
      taxProfile
    );

    return {
      rawVoucherAmount,
      sellerVoucherBurden,
      platformVoucherBurden,
      buyerPays,
      sellerEffectiveRevenue,
      netProfit: profitRes.actualNetProfit,
      marginPercent: profitRes.actualNetMargin,
      feeShopee: profitRes.totalMarketplaceFees + profitRes.totalProgramFees,
      status: profitRes.profitStatus === 'PROFITABLE' ? 'UNTUNG' : profitRes.profitStatus === 'LOW_MARGIN' ? 'TIPIS' : profitRes.profitStatus === 'BREAK_EVEN' ? 'BREAK EVEN' : 'RUGI',
    };
  }, [
    sellingPrice,
    voucherType,
    voucherNominal,
    voucherPercent,
    fundingSource,
    sellerContributionShare,
    shippingSubsidySeller,
    hpp,
    currentStore,
    marketplaceRules,
    programRules,
    taxProfile,
  ]);

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Ticket className="h-6 w-6 text-pink-400" />
              <span>Voucher & Promo Simulator</span>
            </h1>
            <span className="rounded-full bg-pink-500/20 px-2.5 py-0.5 text-xs font-semibold text-pink-300">
              Shopee Promo Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulasikan dampak voucher diskon toko, subsidi gratis ongkir, dan promo gabungan terhadap margin laba bersih.
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
              Konfigurasi Voucher & Subsidi
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Harga Jual Produk (Rp)
                </label>
                <input
                  type="number"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-bold text-white focus:border-pink-500 focus:outline-none"
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
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-bold text-white focus:border-pink-500 focus:outline-none"
                />
              </div>

              {/* Tipe Voucher */}
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Jenis Potongan Voucher
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setVoucherType('nominal')}
                    className={`flex-1 py-1.5 text-xs rounded-xl font-bold border transition ${
                      voucherType === 'nominal'
                        ? 'bg-pink-500/20 text-pink-300 border-pink-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    Nominal (Rp)
                  </button>
                  <button
                    onClick={() => setVoucherType('percentage')}
                    className={`flex-1 py-1.5 text-xs rounded-xl font-bold border transition ${
                      voucherType === 'percentage'
                        ? 'bg-pink-500/20 text-pink-300 border-pink-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    Persentase (%)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Nilai Potongan Voucher
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={voucherType === 'nominal' ? voucherNominal : voucherPercent}
                    onChange={(e) =>
                      voucherType === 'nominal'
                        ? setVoucherNominal(Number(e.target.value))
                        : setVoucherPercent(Number(e.target.value))
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-bold text-white focus:border-pink-500 focus:outline-none"
                  />
                  <span className="absolute right-3 top-2 text-xs text-slate-400">
                    {voucherType === 'nominal' ? 'Rp' : '%'}
                  </span>
                </div>
              </div>

              {/* Sumber Dana Voucher */}
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Sumber Pendanaan Voucher
                </label>
                <select
                  value={fundingSource}
                  onChange={(e) => setFundingSource(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                >
                  <option value="seller">Seller Funded (Toko Menanggung 100%)</option>
                  <option value="platform">Platform Funded (Shopee Menanggung 100%)</option>
                  <option value="split">Split / Co-Funding (Dibagi Bersama)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Subsidi Ongkir Toko (Rp)
                </label>
                <input
                  type="number"
                  value={shippingSubsidySeller}
                  onChange={(e) => setShippingSubsidySeller(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Partisipasi promo gratis ongkir mandiri
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Output */}
        <div className="lg:col-span-5 space-y-4 sticky top-20">
          <div className="rounded-3xl border border-pink-500/40 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-pink-400">
                Efek Terhadap Profit Bersih
              </span>
              <span
                className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${
                  simulation.status === 'UNTUNG'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                }`}
              >
                {simulation.status}
              </span>
            </div>

            <div className="mb-6 p-4 rounded-2xl bg-pink-950/20 border border-pink-500/30">
              <div className="text-xs text-slate-300">Laba Bersih Setelah Voucher:</div>
              <div
                className={`text-3xl sm:text-4xl font-black mt-1 ${
                  simulation.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                Rp {Math.round(simulation.netProfit).toLocaleString('id-ID')}
              </div>
              <div className="text-xs text-slate-300 mt-1">
                Margin Tersisa: <strong>{simulation.marginPercent.toFixed(1)}%</strong>
              </div>
            </div>

            <div className="space-y-2 text-xs border-t border-slate-800 pt-4">
              <div className="flex justify-between text-slate-300">
                <span>Harga Produk Awal:</span>
                <span className="font-semibold text-white">
                  Rp {sellingPrice.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Nilai Voucher yang Dinikmati Pembeli:</span>
                <span className="text-pink-400 font-bold">
                  Rp {Math.round(simulation.rawVoucherAmount).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Beban yang Ditanggung Toko:</span>
                <span className="text-rose-400 font-bold">
                  -Rp {Math.round(simulation.sellerVoucherBurden).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Beban yang Ditanggung Shopee:</span>
                <span className="text-emerald-400 font-bold">
                  +Rp {Math.round(simulation.platformVoucherBurden).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Fee Marketplace Shopee:</span>
                <span className="text-rose-400">
                  -Rp {Math.round(simulation.feeShopee).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between text-slate-300 font-bold pt-2 border-t border-slate-800">
                <span>Harga Efektif Dibayar Pembeli:</span>
                <span className="text-white font-mono">
                  Rp {Math.round(simulation.buyerPays).toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
