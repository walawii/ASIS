import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Target,
  DollarSign,
  AlertTriangle,
  Calculator,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Package,
  Layers,
  Star,
  Zap,
} from 'lucide-react';

export const LandingPageView: React.FC = () => {
  const { setCurrentView, setUpgradeModalOpen } = useApp();

  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Quick Interactive Mini Demo
  const [demoPrice, setDemoPrice] = useState(99000);
  const [demoHpp, setDemoHpp] = useState(50000);
  const [demoAds, setDemoAds] = useState(12000);

  const demoEffFee = demoPrice * 0.12; // 12% total Shopee fee
  const demoNetProfit = demoPrice - demoHpp - demoEffFee - 4000 - demoAds;
  const demoMargin = (demoNetProfit / demoPrice) * 100;
  const demoRoas = demoAds > 0 ? demoPrice / demoAds : 0;

  const faqs = [
    {
      q: 'Apakah ASIS SELLER membutuhkan password akun Shopee saya?',
      a: 'Sama sekali tidak! ASIS SELLER dirancang mandiri menggunakan model input cerdas dan impor CSV aman. Anda tidak perlu memasukkan username atau password toko Shopee Anda.',
    },
    {
      q: 'Bagaimana cara ASIS menghitung biaya admin Shopee yang selalu berubah?',
      a: 'Anda memiliki kendali 100% untuk mengatur persentase biaya admin (Star, Non-Star, atau Mall), biaya layanan gratis ongkir xtra, dan biaya transaksi di menu Pengaturan Toko. Perhitungan akan menyesuaikan secara real-time.',
    },
    {
      q: 'Mengapa BEP ROAS sangat penting bagi penjual Shopee?',
      a: 'Banyak seller mengira ROAS 3x atau 4x sudah menguntungkan. Padahal jika margin kotor produk Anda tipis, BEP ROAS bisa mencapai 4.5x. Artinya dengan ROAS 4x, Anda sebenarnya sedang boncos! ASIS memberitahu angka pasti titik impas tersebut.',
    },
    {
      q: 'Apakah saya bisa mengelola lebih dari satu toko?',
      a: 'Ya! Paket ASIS KIT mendukung fitur Multi-Store sehingga Anda dapat memisahkan pembukuan, stok, dan campaign antara Toko 1, Toko 2, dan Toko 3 secara terisolasi.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden">
      {/* Navbar for Landing */}
      <nav className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-400 font-black text-white shadow-lg shadow-orange-500/20">
            AS
          </div>
          <div>
            <span className="font-extrabold tracking-tight text-white text-base">
              ASIS SELLER
            </span>
            <span className="text-[10px] text-orange-400 block -mt-1 font-mono">
              Shopee Profit OS
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('pricing')}
            className="hidden sm:inline text-xs font-semibold text-slate-300 hover:text-white transition"
          >
            Pilihan Paket
          </button>
          <button
            onClick={() => setCurrentView('login')}
            className="text-xs font-semibold text-slate-300 hover:text-white transition px-2 py-1"
          >
            Masuk
          </button>
          <button
            onClick={() => setCurrentView('register')}
            className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-xs font-bold text-white shadow-lg shadow-orange-500/20 transition active:scale-98"
          >
            Daftar Gratis
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 pt-16 pb-20 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3.5 py-1 text-xs font-bold text-orange-400 mb-6">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Solusi Anti-Boncos Seller Shopee Indonesia</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15] max-w-4xl mx-auto">
          Jangan Cuma Lihat Omzet.{' '}
          <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-emerald-400 bg-clip-text text-transparent">
            Ketahui Profit Sebenarnya.
          </span>
        </h1>

        <p className="mt-5 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          ASIS membantu Shopee Seller menghitung harga jual ideal, ROAS target, biaya iklan maksimal, margin aman, stok kritis, dan laba bersih riil dalam satu dashboard cerdas.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => setCurrentView('register')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-sm font-bold text-white shadow-xl shadow-orange-500/25 active:scale-98 transition flex items-center justify-center gap-2"
          >
            <span>Daftar Akun Gratis Sekarang</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            onClick={() => setCurrentView('dashboard')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-sm font-semibold text-slate-200 transition"
          >
            Buka Demo Workspace
          </button>
        </div>

        {/* Social Proof Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Support Star, Star+ & Shopee Mall</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Update Tarif Fee Shopee 2026</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>100% Data Aman & Terisolasi</span>
          </div>
        </div>
      </section>

      {/* Problem vs Solution Section */}
      <section className="py-16 px-4 sm:px-6 border-y border-slate-900 bg-slate-950/60">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Apakah Anda Mengalami Masalah Ini?
            </h2>
            <p className="mt-2 text-xs text-slate-400">
              Banyak seller Shopee mengeluhkan omzet ratusan juta tapi saldo rekening tidak bertambah.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* The Problem */}
            <div className="rounded-3xl border border-rose-500/30 bg-rose-950/10 p-6 space-y-4">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <AlertTriangle className="h-5 w-5" />
                <span>Masalah Umum Seller Shopee</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✗</span>
                  <span>Omzet terlihat besar di Shopee Seller Centre, tapi setelah tutup buku bulan ternyata boncos.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✗</span>
                  <span>Tidak tahu berapa target ROAS iklan yang harus dipasang sehingga budget iklan habis sia-sia.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✗</span>
                  <span>Terlalu royal memberi voucher toko dan diskon coret tanpa menghitung batas margin aman.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✗</span>
                  <span>Stok habis mendadak saat campaign flash sale karena tidak ada perkiraan hari habis (forecast).</span>
                </li>
              </ul>
            </div>

            {/* The Solution */}
            <div className="rounded-3xl border border-emerald-500/30 bg-emerald-950/10 p-6 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <ShieldCheck className="h-5 w-5" />
                <span>Solusi Nyata dengan ASIS SELLER</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Ketahui laba bersih sesungguhnya setelah seluruh potongan fee Shopee, packing, dan iklan.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Kalkulator Target ROAS & BEP ROAS otomatis sebelum menaikkan anggaran iklan harian.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Simulasi harga multi-skenario (A/B/C) dan batas diskon teraman agar margin terlindungi.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Stock Forecast otomatis yang memberi tahu tanggal persis kehabisan stok dan rekomendasi PO.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Calculator Demo Preview */}
      <section className="py-16 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
            Interactive Calculator Demo
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Uji Hitung Margin Produk Anda Sekarang
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Coba geser dan ubah angka di bawah ini untuk melihat bagaimana kalkulasi ASIS bekerja secara instan.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="text-xs text-slate-400 block mb-1 font-medium">Harga Jual (Rp)</label>
              <input
                type="number"
                value={demoPrice}
                onChange={(e) => setDemoPrice(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-bold text-white"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1 font-medium">HPP Modal (Rp)</label>
              <input
                type="number"
                value={demoHpp}
                onChange={(e) => setDemoHpp(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-bold text-white"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1 font-medium">Biaya Ads / Pcs (Rp)</label>
              <input
                type="number"
                value={demoAds}
                onChange={(e) => setDemoAds(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-bold text-white"
              />
            </div>
          </div>

          <div className="rounded-2xl bg-slate-950 p-5 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-400">Hasil Profit Bersih Riil:</div>
              <div
                className={`text-3xl font-black mt-1 ${
                  demoNetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                Rp {Math.round(demoNetProfit).toLocaleString('id-ID')}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Margin Bersih: <strong>{demoMargin.toFixed(1)}%</strong> | ROAS Aktual: <strong>{demoRoas.toFixed(2)}x</strong>
              </div>
            </div>

            <button
              onClick={() => setCurrentView('new-pricing')}
              className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-xs font-bold text-white shadow-lg transition"
            >
              Buka Versi Lengkap 12 Metrik →
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 max-w-4xl mx-auto border-t border-slate-900">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Pertanyaan Sering Diajukan (FAQ)</h2>
          <p className="mt-1 text-xs text-slate-400">Segala hal yang perlu Anda ketahui tentang ASIS SELLER.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 transition"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between text-left text-xs font-bold text-white"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="h-4 w-4 text-orange-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                )}
              </button>
              {openFaq === idx && (
                <p className="mt-2 text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 pt-2">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-to-t from-orange-950/30 to-transparent text-center border-t border-slate-900">
        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          Siap Menghentikan Kebocoran Profit Toko Anda?
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          Mulai gunakan kalkulator cerdas dan dashboard analitik ASIS SELLER hari ini.
        </p>
        <button
          onClick={() => setCurrentView('dashboard')}
          className="mt-6 px-8 py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-sm font-bold text-white shadow-xl shadow-orange-500/30 transition active:scale-98"
        >
          Masuk ke Dashboard Sekarang
        </button>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 px-4 text-center text-xs text-slate-500">
        <div>ASIS SELLER © 2026. Dashboard Cerdas Shopee Seller Indonesia.</div>
        <div className="mt-1 text-[11px] text-slate-600">
          Dirancang untuk UMKM, Reseller, Dropshipper, dan Brand Owner Shopee.
        </div>
      </footer>
    </div>
  );
};
