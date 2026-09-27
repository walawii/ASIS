import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { calculateTrueProfit } from '../../services/profitEngine/index.ts';
import { SlidersHorizontal, Scale, HelpCircle } from 'lucide-react';

export const FeeScenarioSimulator: React.FC = () => {
  const { marketplaceRules, programRules, taxProfile, openFormulaModal } = useApp();

  const [sellingPrice, setSellingPrice] = useState(129000);
  const [hpp, setHpp] = useState(55000);
  const [sellerType, setSellerType] = useState<'STAR' | 'NON_STAR' | 'STAR_PLUS' | 'MALL'>('STAR');
  const [category, setCategory] = useState('Fashion & Pakaian');

  // Baseline base input
  const baseInput = {
    originalProductPrice: sellingPrice,
    sellerDiscountPercent: 0,
    vouchers: [],
    hpp,
    sellerType,
    category,
    isFreeShippingXtraActive: false,
    isPromoXtraActive: false,
    isPromoXtraPlusActive: false,
    isAffiliateActive: false,
    adsCostPerOrder: 0,
    operationalCostConfig: {
      allocationType: 'PER_ORDER' as const,
      packingCost: 2500,
      laborCost: 1500,
      warehouseCost: 0,
      electricityCost: 0,
      internetCost: 0,
      softwareCost: 0,
      rentCost: 0,
      customerServiceCost: 0,
      paymentGatewayCost: 0,
      otherCost: 0,
    },
  };

  // Scenario A: Tidak ikut program sama sekali
  const scenA = useMemo(
    () => calculateTrueProfit(baseInput, marketplaceRules, programRules, taxProfile),
    [baseInput, marketplaceRules, programRules, taxProfile]
  );

  // Scenario B: Gratis Ongkir XTRA
  const scenB = useMemo(
    () =>
      calculateTrueProfit(
        { ...baseInput, isFreeShippingXtraActive: true },
        marketplaceRules,
        programRules,
        taxProfile
      ),
    [baseInput, marketplaceRules, programRules, taxProfile]
  );

  // Scenario C: Promo XTRA
  const scenC = useMemo(
    () =>
      calculateTrueProfit(
        { ...baseInput, isPromoXtraActive: true },
        marketplaceRules,
        programRules,
        taxProfile
      ),
    [baseInput, marketplaceRules, programRules, taxProfile]
  );

  // Scenario D: Promo XTRA+
  const scenD = useMemo(
    () =>
      calculateTrueProfit(
        { ...baseInput, isPromoXtraPlusActive: true },
        marketplaceRules,
        programRules,
        taxProfile
      ),
    [baseInput, marketplaceRules, programRules, taxProfile]
  );

  // Scenario E: Affiliate + Ads
  const scenE = useMemo(
    () =>
      calculateTrueProfit(
        {
          ...baseInput,
          isAffiliateActive: true,
          affiliateConfig: { enabled: true, commissionPercent: 5.0, includePpn: true },
          adsCostPerOrder: 12000,
        },
        marketplaceRules,
        programRules,
        taxProfile
      ),
    [baseInput, marketplaceRules, programRules, taxProfile]
  );

  const scenarioList = [
    { name: 'Skenario A: Tidak Ikut Program', data: scenA, tag: 'Standar Organik' },
    { name: 'Skenario B: Gratis Ongkir XTRA', data: scenB, tag: 'Boost Conversion' },
    { name: 'Skenario C: Promo XTRA (Cashback)', data: scenC, tag: 'Incentive Koin' },
    { name: 'Skenario D: Promo XTRA+ (Double)', data: scenD, tag: 'Prioritas Algoritma' },
    { name: 'Skenario E: Affiliate + Shopee Ads', data: scenE, tag: 'Traffic Accelerator' },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Scale className="h-6 w-6 text-purple-400" />
              <span>Fee Scenario Simulator (Compare Seller Programs)</span>
            </h1>
            <span className="rounded-full bg-purple-500/20 px-2.5 py-0.5 text-xs font-semibold text-purple-300">
              Netral & Transparan
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Bandingkan 5 skenario partisipasi program Shopee tanpa bias label terbaik. Anda yang menentukan strategi sesuai margin produk.
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

      {/* Shared Input Controls */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <label className="text-xs font-medium text-slate-400 block mb-1">Harga Jual (Rp)</label>
          <input
            type="number"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(Number(e.target.value))}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-bold text-white"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-400 block mb-1">HPP / Modal (Rp)</label>
          <input
            type="number"
            value={hpp}
            onChange={(e) => setHpp(Number(e.target.value))}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-bold text-white"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-400 block mb-1">Status Seller</label>
          <select
            value={sellerType}
            onChange={(e) => setSellerType(e.target.value as any)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-bold text-white"
          >
            <option value="STAR">Star Seller</option>
            <option value="STAR_PLUS">Star+ Seller</option>
            <option value="NON_STAR">Non-Star Seller</option>
            <option value="MALL">Shopee Mall</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-400 block mb-1">Kategori</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-bold text-white"
          >
            <option value="Fashion & Pakaian">Fashion & Pakaian</option>
            <option value="Elektronik & Gadget">Elektronik & Gadget</option>
            <option value="Kecantikan & Perawatan">Kecantikan & Perawatan</option>
            <option value="Umum">Umum</option>
          </select>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="font-bold text-sm text-white">Komparasi 5 Skenario Program Penjual</h2>
          <span className="text-xs text-slate-400">Parameter biaya dasar seragam</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold">
              <tr>
                <th className="py-3 px-4">Skenario Program</th>
                <th className="py-3 px-4 text-right">Harga Jual</th>
                <th className="py-3 px-4 text-right">Total Biaya Shopee</th>
                <th className="py-3 px-4 text-right">Alokasi Ads/Affiliate</th>
                <th className="py-3 px-4 text-right font-bold text-emerald-400">True Net Profit</th>
                <th className="py-3 px-4 text-right">True Margin</th>
                <th className="py-3 px-4 text-center">BEP ROAS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {scenarioList.map((sc, idx) => {
                const totalShopeeFees =
                  sc.data.totalMarketplaceFees + sc.data.totalProgramFees;
                const adsAndAff =
                  sc.data.adsCostPerOrder + sc.data.totalAffiliateCost;

                return (
                  <tr key={idx} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{sc.name}</div>
                      <span className="text-[10px] text-slate-400 mt-0.5 inline-block">
                        {sc.tag}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      Rp {sc.data.effectiveProductPrice.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-rose-300">
                      Rp {totalShopeeFees.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-300">
                      {adsAndAff > 0 ? `Rp ${adsAndAff.toLocaleString('id-ID')}` : '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black">
                      <span className={sc.data.expectedNetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        Rp {sc.data.expectedNetProfit.toLocaleString('id-ID')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] ${
                          sc.data.expectedNetMargin >= 15
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : sc.data.expectedNetMargin >= 8
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {sc.data.expectedNetMargin}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-amber-400 font-semibold">
                      {sc.data.breakEvenRoas > 0 ? `${sc.data.breakEvenRoas}x` : 'N/A'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
