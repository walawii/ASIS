import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { SubscriptionPlanCode } from '../../types/auth.ts';
import {
  User as UserIcon,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  Zap,
  Sparkles,
  Crown,
  Check,
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register, setCurrentView, authError, setAuthError, plans } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanCode>('PLUS');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!name || !email || !phone || !password) {
      setAuthError('Semua field wajib diisi.');
      return;
    }

    if (password.length < 6) {
      setAuthError('Password minimal 6 karakter.');
      return;
    }

    if (password !== confirmPassword) {
      setAuthError('Konfirmasi password tidak cocok.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const result = register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        initialPlan: selectedPlan,
      });

      setIsLoading(false);

      if (result.success) {
        // AppContext routes to verify-email
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-10 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        <div className="text-center">
          <button
            onClick={() => setCurrentView('landing-page')}
            className="inline-flex items-center gap-2 mb-3 group transition"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-400 font-black text-white shadow-lg shadow-orange-500/25 group-hover:scale-105 transition">
              AS
            </div>
            <div className="text-left">
              <span className="font-black text-lg tracking-tight text-white block">
                ASIS SELLER
              </span>
              <span className="text-[10px] text-orange-400 font-mono block -mt-1">
                SaaS Registration
              </span>
            </div>
          </button>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Daftar Akun Baru ASIS
          </h2>
          <p className="mt-1.5 text-xs text-slate-400">
            Langkah 1 dari 2: Lengkapi profil toko Anda, lalu lakukan verifikasi email
          </p>
        </div>

        <div className="mt-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
            {authError && (
              <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                <div className="leading-relaxed">{authError}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Nama Lengkap / Brand
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <UserIcon className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Contoh: Zaskia Hijab Official"
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    No. WhatsApp / HP
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Phone className="h-4 w-4" />
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+62 812-3456-7890"
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Alamat Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@tokoanda.com"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Link & token verifikasi akan dikirimkan ke alamat email ini.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 6 karakter"
                      required
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Konfirmasi Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ulangi password"
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Plan Choice Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Pilih Paket Langganan Awal
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {plans.map((p) => {
                    const isSelected = selectedPlan === p.code;
                    return (
                      <div
                        key={p.code}
                        onClick={() => setSelectedPlan(p.code)}
                        className={`cursor-pointer rounded-xl p-3 border transition ${
                          isSelected
                            ? 'border-orange-500 bg-orange-500/10 shadow-md shadow-orange-500/10'
                            : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-white">{p.code}</span>
                          {isSelected && <Check className="h-3.5 w-3.5 text-orange-400" />}
                        </div>
                        <div className="text-[11px] font-semibold text-orange-400 mt-1">
                          Rp {(p.monthlyPrice / 1000).toLocaleString('id-ID')}k/bln
                        </div>
                        <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                          {p.badge}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-3 py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-xs font-bold text-white shadow-lg shadow-orange-500/25 active:scale-98 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Mendaftarkan...
                  </span>
                ) : (
                  <>
                    <span>Daftar & Lanjut ke Verifikasi Email</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 text-center text-xs text-slate-400">
              Sudah memiliki akun?{' '}
              <button
                onClick={() => setCurrentView('login')}
                className="font-semibold text-orange-400 hover:text-orange-300 hover:underline transition"
              >
                Masuk di sini
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
