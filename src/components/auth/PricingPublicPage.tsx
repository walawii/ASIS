import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  Check,
  X,
  Zap,
  Sparkles,
  Crown,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';

export const PricingPublicPage: React.FC = () => {
  const { plans, setCurrentView, currentUser } = useApp();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const getPlanIcon = (code: string) => {
    switch (code) {
      case 'LITE':
        return Zap;
      case 'PLUS':
        return Sparkles;
      case 'KIT':
        return Crown;
      default:
        return Zap;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top Navbar */}
      <nav className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div
          onClick={() => setCurrentView('landing-page')}
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-400 font-black text-white shadow-lg shadow-orange-500/20">
            AS
          </div>
          <div>
            <span className="font-extrabold tracking-tight text-white text-base">
              ASIS SELLER
            </span>
            <span className="text-[10px] text-orange-400 block -mt-1 font-mono">
              Pricing Plans
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {currentUser ? (
            <button
              onClick={() => setCurrentView('dashboard')}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition"
            >
              Kembali ke Dashboard
            </button>
          ) : (
            <>
              <button
                onClick={() => setCurrentView('login')}
                className="text-xs font-semibold text-slate-300 hover:text-white transition"
              >
                Masuk
              </button>
              <button
                onClick={() => setCurrentView('register')}
                className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-xs font-bold text-white shadow-lg shadow-orange-500/20 transition active:scale-98"
              >
                Daftar Gratis
              </button>
            </>
          )}
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3.5 py-1 text-xs font-bold text-orange-400 mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Pilihan Paket Fleksibel & Transparan</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Investasi Cerdas untuk Bisnis Shopee yang Menguntungkan
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-400 leading-relaxed">
            Hentikan kebocoran biaya tak terlihat. Pilih paket yang sesuai skala bisnis Anda dan ketahui laba bersih riil setiap produk.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="mt-8 inline-flex items-center p-1 rounded-2xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                billingCycle === 'monthly'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Tagihan Bulanan
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Tagihan Tahunan</span>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-[10px] font-black text-slate-950 uppercase">
                Hemat 2 Bulan
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {plans.map((p) => {
            const Icon = getPlanIcon(p.code);
            const price = billingCycle === 'monthly' ? p.monthlyPrice : Math.round(p.yearlyPrice / 12);
            const isUserCurrent = currentUser?.subscriptionPlan === p.code;

            return (
              <div
                key={p.code}
                className={`relative rounded-3xl border p-7 flex flex-col justify-between transition-all ${
                  p.isPopular
                    ? 'border-orange-500 bg-gradient-to-b from-slate-900 via-slate-900 to-orange-950/20 shadow-2xl shadow-orange-500/10 scale-105 z-10'
                    : 'border-slate-800 bg-slate-900/70 hover:border-slate-700'
                }`}
              >
                {p.isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 text-slate-950 text-[11px] font-black uppercase tracking-wider shadow-md">
                    {p.badge}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2.5 rounded-2xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-white">{p.name}</h3>
                        <span className="text-[11px] text-slate-400">{p.badge}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 min-h-[36px] leading-relaxed mb-6">
                    {p.tagline}
                  </p>

                  <div className="mb-6 pb-6 border-b border-slate-800">
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs text-slate-400">Rp</span>
                      <span className="text-3xl sm:text-4xl font-black text-white">
                        {price.toLocaleString('id-ID')}
                      </span>
                      <span className="text-xs text-slate-400">/ bulan</span>
                    </div>
                    {billingCycle === 'yearly' && (
                      <span className="text-[11px] text-emerald-400 mt-1 block">
                        Ditagih Rp {p.yearlyPrice.toLocaleString('id-ID')} per tahun
                      </span>
                    )}
                  </div>

                  <div className="space-y-3 mb-8">
                    <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Termasuk Fitur:
                    </div>
                    {p.features.map((f, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => {
                      if (!currentUser) {
                        setCurrentView('register');
                      } else {
                        setCurrentView('user-subscription');
                      }
                    }}
                    className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs transition active:scale-98 flex items-center justify-center gap-2 ${
                      p.isPopular
                        ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-xl shadow-orange-500/25'
                        : 'bg-slate-800 hover:bg-slate-700 text-white'
                    }`}
                  >
                    <span>{isUserCurrent ? 'Paket Aktif Anda' : 'Pilih Paket Ini'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Security & FAQ notice */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-emerald-400 shrink-0" />
            <div>
              <div className="font-bold text-slate-200 text-sm">
                Transparan, Aman, & Tanpa Komitmen Jangka Panjang
              </div>
              <div className="mt-0.5">
                Semua data toko tersimpan aman. Tidak memerlukan username atau password akun Shopee Anda.
              </div>
            </div>
          </div>
          <button
            onClick={() => setCurrentView('tutorial')}
            className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition shrink-0"
          >
            Lihat Tutorial & Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
