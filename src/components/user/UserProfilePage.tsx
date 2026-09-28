import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  User as UserIcon,
  Mail,
  Phone,
  ShieldCheck,
  Calendar,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  LogOut,
  Zap,
  Sparkles,
  Crown,
} from 'lucide-react';

export const UserProfilePage: React.FC = () => {
  const { currentUser, logout, setCurrentView, changeUserSubscription, plans } = useApp();

  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!currentUser) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-400">Silakan login terlebih dahulu.</p>
        <button
          onClick={() => setCurrentView('login')}
          className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold"
        >
          Ke Halaman Login
        </button>
      </div>
    );
  }

  const currentPlanObj = plans.find((p) => p.code === currentUser.subscriptionPlan) || plans[0];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    currentUser.name = name;
    currentUser.phone = phone;
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <UserIcon className="h-6 w-6 text-orange-400" />
            <span>Profil Akun & Pengaturan Langganan</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Kelola data diri, status verifikasi keamanan email, dan paket langganan ASIS SELLER Anda.
          </p>
        </div>

        <button
          onClick={() => {
            logout();
            setCurrentView('landing-page');
          }}
          className="px-4 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold transition flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          <span>Keluar (Logout)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800">
              Informasi Pengguna
            </h2>

            {savedSuccess && (
              <div className="flex items-center gap-2 p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Perubahan profil berhasil disimpan.</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    No. WhatsApp / HP
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Alamat Email Terdaftar
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    disabled
                    value={currentUser.email}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950/60 text-xs text-slate-400 cursor-not-allowed"
                  />
                  {currentUser.emailVerified ? (
                    <span className="shrink-0 inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      Terverifikasi
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setCurrentView('verify-email')}
                      className="shrink-0 inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold hover:bg-amber-500/20"
                    >
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                      Verifikasi Sekarang
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <span className="text-[11px] text-slate-400 block">Peran Pengguna (Role)</span>
                  <span className="inline-block mt-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold font-mono">
                    {currentUser.role}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Akun Dibuat</span>
                  <span className="text-xs text-slate-200 mt-1 block">
                    {new Date(currentUser.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-xs font-bold text-white shadow-md shadow-orange-500/20 transition"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Active Subscription & Plan Box */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800">
              Paket Berlangganan
            </h2>

            <div className="p-4 rounded-xl border border-orange-500/30 bg-orange-500/5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Paket Aktif:</span>
                <span className="px-2.5 py-0.5 rounded-full bg-orange-500 text-slate-950 font-black text-xs">
                  {currentUser.subscriptionPlan}
                </span>
              </div>
              <div className="text-lg font-black text-white mt-1">
                {currentPlanObj.name}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Rp {currentPlanObj.monthlyPrice.toLocaleString('id-ID')} / bulan
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Status Langganan:</span>
                <span
                  className={`font-bold ${
                    currentUser.subscriptionStatus === 'ACTIVE'
                      ? 'text-emerald-400'
                      : currentUser.subscriptionStatus === 'PENDING'
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {currentUser.subscriptionStatus}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Ganti Paket Cepat:
              </div>
              <div className="grid grid-cols-3 gap-2">
                {plans.map((p) => (
                  <button
                    key={p.code}
                    onClick={() => changeUserSubscription(p.code, 'ACTIVE')}
                    className={`p-2 rounded-xl text-center border text-xs font-bold transition ${
                      currentUser.subscriptionPlan === p.code
                        ? 'border-orange-500 bg-orange-500/20 text-orange-300'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    {p.code}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setCurrentView('pricing')}
              className="w-full py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition flex items-center justify-center gap-1.5"
            >
              <span>Bandingkan Semua Fitur Paket</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
