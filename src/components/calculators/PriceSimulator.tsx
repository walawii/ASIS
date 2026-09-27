import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { calculateTrueProfit } from '../../services/profitEngine/index.ts';
import { SellerType } from '../../types/rules.ts';
import { SlidersHorizontal, HelpCircle, Scale, DollarSign, Layers } from 'lucide-react';

export const PriceSimulator: React.FC = () => {
  const { currentStore, marketplaceRules, programRules, taxProfile, openFormulaModal } = useApp();

  // Shared Cost Basis
  const [hpp, setHpp] = useState(45000);
  const [packingCost, setPackingCost] = useState(2500);
  const [operationalCost, setOperationalCost] = useState(1500);
  const [sellerStatus, setSellerStatus] = useState<SellerType>('STAR');
  const [category, setCategory] = useState('Fashion & Pakaian');
  const [isFreeShippingXtraActive, setIsFreeShippingXtraActive] = useState(true);
  const [isPromoXtraActive, setIsPromoXtraActive] = useState(true);
  const [isAffiliateActive, setIsAffiliateActive] = useState(false);
  const [affiliatePercent, setAffiliatePercent] = useState(3.0);
  const [adsCostPerOrder, setAdsCostPerOrder] = useState(10000);
  const [targetRoas, setTargetRoas] = useState(4.5);

  // 3 Scenarios
  const [priceA, setPriceA] = useState(79000);
  const [discountA, setDiscountA] = useState(0);

  const [priceB, setPriceB] = useState(89000);
  const [discountB, setDiscountB] = useState(5);

  const [priceC, setPriceC] = useState(99000);
  const [discountC, setDiscountC] = useState(10);

  const runCalculation = (price: number, discountPercent: number) => {
    return calculateTrueProfit(
      {
        originalProductPrice: price,
        sellerDiscountPercent: discountPercent,
        vouchers: [],
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
          otherCost: 0,
        },
      },
      marketplaceRules,
      programRules,
      taxProfile
    );
  };

  const resA = useMemo(() => runCalculation(priceA, discountA), [priceA, discountA, hpp, packingCost, operationalCost, sellerStatus, category, isFreeShippingXtraActive, isPromoXtraActive, isAffiliateActive, affiliatePercent, adsCostPerOrder, marketplaceRules, programRules, taxProfile]);
  const resB = useMemo(() => runCalculation(priceB, discountB), [priceB, discountB, hpp, packingCost, operationalCost, sellerStatus, category, isFreeShippingXtraActive, isPromoXtraActive, isAffiliateActive, affiliatePercent, adsCostPerOrder, marketplaceRules, programRules, taxProfile]);
  const resC = useMemo(() => runCalculation(priceC, discountC), [priceC, discountC, hpp, packingCost, operationalCost, sellerStatus, category, isFreeShippingXtraActive, isPromoXtraActive, isAffiliateActive, affiliatePercent, adsCostPerOrder, marketplaceRules, programRules, taxProfile]);

  const scenarios = [
    { label: 'Skenario A', price: priceA, setPrice: setPriceA, discount: discountA, setDiscount: setDiscountA, res: resA, color: 'border-blue-500/40' },
    { label: 'Skenario B', price: priceB, setPrice: setPriceB, discount: discountB, setDiscount: setDiscountB, res: resB, color: 'border-orange-500/40' },
    { label: 'Skenario C', price: priceC, setPrice: setPriceC, discount: discountC, setDiscount: setDiscountC, res: resC, color: 'border-emerald-500/40' },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <SlidersHorizontal className="h-6 w-6 text-orange-400" />
              <span>Price Simulator (Skenario A / B / C)</span>
            </h1>
            <span className="rounded-full bg-blue-500/20 px-2.5 py-0.5 text-xs font-semibold text-blue-300">
              Perbandingan Objektif
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Bandingkan 3 skenario harga jual secara objektif dengan parameter modal dasar yang seragam untuk menguji profit, margin, dan BEP ROAS.
          </p>
        </div>

        <button
          onClick={() => openFormulaModal('pricing')}
          className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white transition self-start sm:self-auto"
        >
          <HelpCircle className="h-4 w-4 text-orange-400" />
          <span>Formula Audit</span>
        </button>
      </div>

      {/* Shared Cost Basis Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Scale className="h-4 w-4 text-orange-400" />
            <span>Basis Biaya Seragam (Shared Parameters)</span>
          </h2>
          <span className="text-[10px] text-slate-500">Berlaku untuk ketiga skenario</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <div>
            <label className="text-[11px] text-slate-400 font-medium block mb-1">HPP (Modal)</label>
            <input
              type="number"
              value={hpp || ''}
              onChange={(e) => setHpp(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 font-medium block mb-1">Packing</label>
            <input
              type="number"
              value={packingCost || ''}
              onChange={(e) => setPackingCost(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 font-medium block mb-1">Operasional</label>
            <input
              type="number"
              value={operationalCost || ''}
              onChange={(e) => setOperationalCost(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 font-medium block mb-1">Ads per Order</label>
            <input
              type="number"
              value={adsCostPerOrder || ''}
              onChange={(e) => setAdsCostPerOrder(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 font-medium block mb-1">Target ROAS</label>
            <input
              type="number"
              step="0.1"
              value={targetRoas}
              onChange={(e) => setTargetRoas(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 font-medium block mb-1">Seller Status</label>
            <select
              value={sellerStatus}
              onChange={(e) => setSellerStatus(e.target.value as SellerType)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
            >
              <option value="NON_STAR">Non-Star</option>
              <option value="STAR">Star</option>
              <option value="STAR_PLUS">Star+</option>
              <option value="MALL">Mall</option>
            </select>
          </div>
        </div>

        {/* Quick program checkboxes */}
        <div className="flex flex-wrap items-center gap-4 text-xs pt-1 text-slate-300">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isFreeShippingXtraActive}
              onChange={(e) => setIsFreeShippingXtraActive(e.target.checked)}
              className="rounded accent-orange-500"
            />
            <span>Gratis Ongkir Xtra (4.0%)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isPromoXtraActive}
              onChange={(e) => setIsPromoXtraActive(e.target.checked)}
              className="rounded accent-orange-500"
            />
            <span>Promo Xtra (4.5%)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isAffiliateActive}
              onChange={(e) => setIsAffiliateActive(e.target.checked)}
              className="rounded accent-orange-500"
            />
            <span>Affiliate ({affiliatePercent}%)</span>
          </label>
        </div>
      </div>

      {/* 3 Scenario Cards Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {scenarios.map((sc, idx) => {
          const totalFees = sc.res.totalMarketplaceFees + sc.res.totalProgramFees + sc.res.totalAffiliateCost + sc.res.taxAmount;

          return (
            <div
              key={idx}
              className={`rounded-2xl border ${sc.color} bg-slate-900/90 p-5 shadow-xl space-y-4`}
            >
              {/* Scenario Title */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-bold text-sm text-white">{sc.label}</span>
                <span className="text-[10px] text-slate-400 font-mono">True Profit Engine</span>
              </div>

              {/* Price & Discount Inputs */}
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Harga Jual Normal</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs text-slate-500">Rp</span>
                    <input
                      type="number"
                      value={sc.price || ''}
                      onChange={(e) => sc.setPrice(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-3 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Diskon Coret (%)</label>
                  <input
                    type="number"
                    value={sc.discount}
                    onChange={(e) => sc.setDiscount(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Objective Outputs List */}
              <div className="space-y-2 pt-2 border-t border-slate-800 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Effective Price</span>
                  <span className="font-bold text-white">
                    Rp {sc.res.effectiveProductPrice.toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Total Fees (Mkt+Prog+Tax)</span>
                  <span className="text-rose-400 font-semibold">
                    Rp {totalFees.toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Ads Cost per Order</span>
                  <span className="text-amber-400 font-semibold">
                    Rp {adsCostPerOrder.toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Profit Bersih Riil</span>
                  <span
                    className={`font-black ${
                      sc.res.expectedNetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    Rp {sc.res.expectedNetProfit.toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Net Margin</span>
                  <span
                    className={`font-black ${
                      sc.res.expectedNetMargin >= 10 ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {sc.res.expectedNetMargin}%
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">BEP ROAS</span>
                  <span className="text-slate-200 font-bold">{sc.res.breakEvenRoas}x</span>
                </div>

                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Target ROAS</span>
                  <span className="text-blue-400 font-bold">{targetRoas}x</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Objective Summary Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-3 shadow-xl">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Tabel Rangkuman Komparasi Data Objektif
          </h3>
          <span className="text-[11px] text-slate-500">Bebas Bias / Netral</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2">Metrik Keuangan</th>
                <th className="py-2 text-right">Skenario A (Rp {priceA.toLocaleString('id-ID')})</th>
                <th className="py-2 text-right">Skenario B (Rp {priceB.toLocaleString('id-ID')})</th>
                <th className="py-2 text-right">Skenario C (Rp {priceC.toLocaleString('id-ID')})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              <tr>
                <td className="py-2 text-slate-300">Effective Price</td>
                <td className="py-2 text-right text-white">Rp {resA.effectiveProductPrice.toLocaleString('id-ID')}</td>
                <td className="py-2 text-right text-white">Rp {resB.effectiveProductPrice.toLocaleString('id-ID')}</td>
                <td className="py-2 text-right text-white">Rp {resC.effectiveProductPrice.toLocaleString('id-ID')}</td>
              </tr>
              <tr>
                <td className="py-2 text-slate-300">Total Biaya & Fee</td>
                <td className="py-2 text-right text-rose-400">Rp {Math.round(resA.totalAllDeductions).toLocaleString('id-ID')}</td>
                <td className="py-2 text-right text-rose-400">Rp {Math.round(resB.totalAllDeductions).toLocaleString('id-ID')}</td>
                <td className="py-2 text-right text-rose-400">Rp {Math.round(resC.totalAllDeductions).toLocaleString('id-ID')}</td>
              </tr>
              <tr>
                <td className="py-2 text-slate-300">True Net Profit</td>
                <td className={`py-2 text-right font-black ${resA.expectedNetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  Rp {resA.expectedNetProfit.toLocaleString('id-ID')}
                </td>
                <td className={`py-2 text-right font-black ${resB.expectedNetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  Rp {resB.expectedNetProfit.toLocaleString('id-ID')}
                </td>
                <td className={`py-2 text-right font-black ${resC.expectedNetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  Rp {resC.expectedNetProfit.toLocaleString('id-ID')}
                </td>
              </tr>
              <tr>
                <td className="py-2 text-slate-300">True Net Margin</td>
                <td className="py-2 text-right text-white">{resA.expectedNetMargin}%</td>
                <td className="py-2 text-right text-white">{resB.expectedNetMargin}%</td>
                <td className="py-2 text-right text-white">{resC.expectedNetMargin}%</td>
              </tr>
              <tr>
                <td className="py-2 text-slate-300">BEP ROAS Iklan</td>
                <td className="py-2 text-right text-amber-400">{resA.breakEvenRoas}x</td>
                <td className="py-2 text-right text-amber-400">{resB.breakEvenRoas}x</td>
                <td className="py-2 text-right text-amber-400">{resC.breakEvenRoas}x</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
