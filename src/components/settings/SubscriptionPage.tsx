import React from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { SubscriptionTier } from '../../types/index.ts';
import { Check, X, Shield, Zap, Sparkles, Crown } from 'lucide-react';

export const SubscriptionPage: React.FC = () => {
  const { subscriptionTier, setSubscriptionTier } = useApp();

  const tiers = [
    {
      id: 'lite' as SubscriptionTier,
      name: 'ASIS LITE',
      badge: 'UMKM & Reseller',
      price: 'Rp 149.000',
      period: '/ bulan',
      desc: 'Solusi esensial untuk menghitung harga aman dan ROAS iklan harian.',
      icon: Zap,
    },
    {
      id: 'plus' as SubscriptionTier,
      name: 'ASIS PLUS',
      badge: 'Paling Populer',
      price: 'Rp 299.000',
      period: '/ bulan',
      desc: 'Cocok untuk brand owner yang butuh simulasi harga multi-skenario & riset pasar.',
      icon: Sparkles,
      isPopular: true,
    },
    {
      id: 'kit' as SubscriptionTier,
      name: 'ASIS KIT / PRO',
      badge: 'Full Enterprise',
      price: 'Rp 499.000',
      period: '/ bulan',
      desc: 'Sistem operasional terlengkap dengan AsisFlow order, audit laba rugi & stock forecast.',
      icon: Crown,
    },
  ];

  const featureMatrix = [
    { name: 'Kalkulator ROAS Real-time', lite: true, plus: true, kit: true },
    { name: 'Indikator ROAS Bagus / Cukup / Rugi', lite: true, plus: true, kit: true },
    { name: 'Kalkulator Target ROAS & Max Bid', lite: true, plus: true, kit: true },
    { name: 'Reverse Pricing (Target Bersih Solver)', lite: true, plus: true, kit: true },
    { name: 'Histori Campaign & Catatan Strategi', lite: true, plus: true, kit: true },
    { name: 'BEP Calculator Toko', lite: true, plus: true, kit: true },
    { name: 'Market Price Analyzer & Sweet Spot', lite: false, plus: true, kit: true },
    { name: 'Estimasi Omzet Kompetitor', lite: false, plus: true, kit: true },
    { name: 'Price Simulator (Skenario A/B/C)', lite: false, plus: true, kit: true },
    { name: 'Discount & Voucher Safety Calculator', lite: false, plus: true, kit: true },
    { name: 'Profit Growth Simulator (+10% s/d +100%)', lite: false, plus: true, kit: true },
    { name: 'Analisis Varian Produk', lite: false, plus: true, kit: true },
    { name: 'Analisa Laba Rugi Otomatis (P&L SKU)', lite: false, plus: false, kit: true },
    { name: 'AsisFlow Dashboard Order & Resi', lite: false, plus: false, kit: true },
    { name: 'Manajemen Stok & Run-out Forecast', lite: false, plus: false, kit: true },
    { name: 'Opportunity Center (Rekomendasi Cerdas)', lite: false, plus: false, kit: true },
    { name: 'Alert Center (Pendeteksi Boncos)', lite: false, plus: false, kit: true },
    { name: 'Ekspor Laporan (CSV, Excel, PDF)', lite: false, plus: false, kit: true },
    { name: 'Dukungan Multi-Toko Shopee', lite: false, plus: false, kit: true },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-400 mb-2">
          <Shield className="h-3.5 w-3.5" />
          <span>Paket Langganan ASIS SELLER</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Investasi Cerdas untuk Selamatkan Margin Toko
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Ubah paket aktif Anda secara instan di bawah ini untuk mencoba dan menguji batasan fitur.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((t) => {
          const Icon = t.icon;
          const isCurrent = subscriptionTier === t.id;

          return (
            <div
              key={t.id}
              className={`rounded-2xl p-6 border transition flex flex-col justify-between ${
                t.isPopular
                  ? 'border-orange-500 bg-gradient-to-b from-slate-800 to-slate-900 shadow-xl shadow-orange-500/10'
                  : 'border-slate-800 bg-slate-900/80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-2 rounded-xl ${
                        t.isPopular ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="font-bold text-base text-white">{t.name}</h2>
                      <span className="text-[10px] text-slate-400">{t.badge}</span>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-300 leading-relaxed mb-4 min-h-[36px]">
                  {t.desc}
                </div>

                <div className="mb-6 flex items-baseline">
                  <span className="text-2xl sm:text-3xl font-black text-white">{t.price}</span>
                  <span className="ml-1 text-xs text-slate-400">{t.period}</span>
                </div>
              </div>

              <button
                onClick={() => setSubscriptionTier(t.id)}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                  isCurrent
                    ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-default'
                    : t.isPopular
                    ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20 active:scale-98'
                    : 'bg-slate-800 hover:bg-slate-700 text-white active:scale-98'
                }`}
              >
                {isCurrent ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span>Paket Sedang Aktif</span>
                  </>
                ) : (
                  <span>Ganti ke {t.name}</span>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Feature Comparison Matrix */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl mt-8">
        <div className="p-4 border-b border-slate-800">
          <h2 className="font-bold text-sm text-white">Matriks Perbandingan Fitur Lengkap</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold">
              <tr>
                <th className="py-3 px-4">Fitur Aplikasi</th>
                <th className="py-3 px-4 text-center">ASIS LITE</th>
                <th className="py-3 px-4 text-center text-orange-400">ASIS PLUS</th>
                <th className="py-3 px-4 text-center text-emerald-400 font-black">ASIS KIT / PRO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {featureMatrix.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition">
                  <td className="py-2.5 px-4 font-medium text-white">{item.name}</td>
                  <td className="py-2.5 px-4 text-center">
                    {item.lite ? (
                      <Check className="h-4 w-4 text-emerald-400 mx-auto" />
                    ) : (
                      <X className="h-4 w-4 text-slate-600 mx-auto" />
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    {item.plus ? (
                      <Check className="h-4 w-4 text-emerald-400 mx-auto" />
                    ) : (
                      <X className="h-4 w-4 text-slate-600 mx-auto" />
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-center bg-emerald-500/5">
                    {item.kit ? (
                      <Check className="h-4 w-4 text-emerald-400 mx-auto" />
                    ) : (
                      <X className="h-4 w-4 text-slate-600 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
