import React from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { SubscriptionTier } from '../../types/index.ts';
import { Check, X, Shield, Sparkles, Zap, Crown } from 'lucide-react';

export const UpgradeModal: React.FC = () => {
  const {
    upgradeModalOpen,
    setUpgradeModalOpen,
    subscriptionTier,
    setSubscriptionTier,
  } = useApp();

  if (!upgradeModalOpen) return null;

  const tiers: {
    id: SubscriptionTier;
    name: string;
    badge: string;
    price: string;
    period: string;
    description: string;
    icon: React.ElementType;
    isPopular?: boolean;
    features: string[];
  }[] = [
    {
      id: 'lite',
      name: 'ASIS LITE',
      badge: 'UMKM & Pemula',
      price: 'Rp 149.000',
      period: '/ bulan',
      description: 'Cocok untuk seller baru & reseller yang ingin menghitung harga dan ROAS tanpa boncos.',
      icon: Zap,
      features: [
        'Kalkulator ROAS Real-time',
        'Indikator ROAS Bagus / Cukup / Rugi',
        'Kalkulator Target ROAS & Max Ads',
        'Histori & Catatan Campaign Iklan',
        'Reverse Pricing (Target Bersih Solver)',
        'Dukungan 1 Toko Shopee',
      ],
    },
    {
      id: 'plus',
      name: 'ASIS PLUS',
      badge: 'Paling Populer',
      price: 'Rp 299.000',
      period: '/ bulan',
      description: 'Untuk seller bertumbuh yang membutuhkan riset pasar, analisis varian, dan simulasi promo.',
      icon: Sparkles,
      isPopular: true,
      features: [
        'Semua fitur ASIS LITE',
        'Market Price Analyzer & Estimasi Pasar',
        'Estimasi Omzet Kompetitor',
        'Analisis Varian Terlaris',
        'Analisis Gap Kompetitif Toko',
        'Price Simulator (Komparasi Skenario A/B/C)',
        'Discount & Voucher Safety Simulator',
        'Profit Simulator (+10%, +20%, +100%)',
        'Inventory Analytics Dasar',
      ],
    },
    {
      id: 'kit',
      name: 'ASIS KIT / PRO',
      badge: 'Full Power Suite',
      price: 'Rp 499.000',
      period: '/ bulan',
      description: 'Solusi lengkap manajemen profit, AsisFlow Order, Stock Forecast otomatis, dan Opportunity Center.',
      icon: Crown,
      features: [
        'Semua fitur ASIS PLUS',
        'Analisa Laba Rugi Otomatis (P&L per SKU)',
        'AsisFlow Dashboard Order & Retur',
        'Manajemen Stok Otomatis & Buffer Alert',
        'Stock Forecast (Hari Habis & Reorder Point)',
        'Opportunity Center (Rule-based Growth Engine)',
        'Alert Center & Notifikasi Kebocoran Profit',
        'Export Report (CSV, Excel & PDF)',
        'Multi Store (Banyak Toko Shopee Sekaligus)',
        'SOP Digital Seller & Priority VIP Support',
      ],
    },
  ];

  const handleSelectTier = (tier: SubscriptionTier) => {
    setSubscriptionTier(tier);
    setUpgradeModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 my-8">
        {/* Close Button */}
        <button
          onClick={() => setUpgradeModalOpen(false)}
          className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-400 mb-3">
            <Shield className="h-3.5 w-3.5" />
            <span>Pilihan Paket Berlangganan ASIS SELLER</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Tingkatkan Profit & Kendalikan Toko Shopee Anda
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Pilih paket yang sesuai skala bisnis Anda. Anda dapat beralih paket kapan saja secara instan untuk mencoba seluruh fitur.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            const isCurrent = subscriptionTier === tier.id;

            return (
              <div
                key={tier.id}
                className={`relative flex flex-col justify-between rounded-2xl p-6 transition-all duration-200 border ${
                  tier.isPopular
                    ? 'border-orange-500 bg-gradient-to-b from-slate-800 to-slate-900 shadow-xl shadow-orange-500/10'
                    : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
                }`}
              >
                {tier.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-md">
                    {tier.badge}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                          tier.isPopular
                            ? 'bg-orange-500 text-white'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base">{tier.name}</h3>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {!tier.isPopular && tier.badge}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 min-h-[36px] mb-4 leading-relaxed">
                    {tier.description}
                  </p>

                  <div className="mb-6 flex items-baseline">
                    <span className="text-2xl sm:text-3xl font-black text-white">
                      {tier.price}
                    </span>
                    <span className="ml-1 text-xs text-slate-400">{tier.period}</span>
                  </div>

                  {/* Feature List */}
                  <div className="space-y-2.5 pt-4 border-t border-slate-800/80 mb-6">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Fitur yang disertakan:
                    </div>
                    {tier.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                        <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Action */}
                <button
                  onClick={() => handleSelectTier(tier.id)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                    isCurrent
                      ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-default'
                      : tier.isPopular
                      ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/25 active:scale-98'
                      : 'bg-slate-800 hover:bg-slate-700 text-white active:scale-98'
                  }`}
                >
                  {isCurrent ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span>Paket Aktif Saat Ini</span>
                    </>
                  ) : (
                    <span>Pilih {tier.name} (Uji Coba Sekarang)</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer Guarantee */}
        <div className="mt-8 text-center text-xs text-slate-400 border-t border-slate-800 pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <span>✓ Tanpa komitmen jangka panjang, batalkan kapan saja</span>
          <span className="hidden sm:inline">•</span>
          <span>✓ Pembayaran instan via QRIS, Virtual Account, & ShopeePay</span>
          <span className="hidden sm:inline">•</span>
          <span className="text-orange-400 font-medium">Bebas uji coba di lingkungan preview!</span>
        </div>
      </div>
    </div>
  );
};
