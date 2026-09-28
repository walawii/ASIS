import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
  Sparkles,
  Info,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, setCurrentView, authError, setAuthError } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setAuthError('Email dan password wajib diisi.');
      return;
    }

    setIsLoading(true);
    setAuthError(null);

    // Simulate authenticating against service contract
    setTimeout(() => {
      const success = login(email.trim(), password);
      setIsLoading(false);
      if (success) {
        // AppContext handles redirect to dashboard or verification
      }
    }, 350);
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setAuthError(null);
    setIsLoading(true);
    setTimeout(() => {
      login(demoEmail, demoPass);
      setIsLoading(false);
    }, 200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Brand Header */}
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
                SaaS Foundation
              </span>
            </div>
          </button>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Masuk ke Akun Anda
          </h2>
          <p className="mt-1.5 text-xs text-slate-400">
            Kelola laba bersih, harga jual, dan performa iklan Shopee Anda
          </p>
        </div>

        {/* Login Box */}
        <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
            {authError && (
              <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                <div className="leading-relaxed">{authError}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
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
                    placeholder="nama@email.com"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => alert('Fitur reset password server-side akan tersedia pada rilis backend.')}
                    className="text-[11px] text-orange-400 hover:text-orange-300 transition"
                  >
                    Lupa password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-xs font-bold text-white shadow-lg shadow-orange-500/25 active:scale-98 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Memproses...
                  </span>
                ) : (
                  <>
                    <span>Masuk ke Dashboard</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 text-center text-xs text-slate-400">
              Belum punya akun?{' '}
              <button
                onClick={() => setCurrentView('register')}
                className="font-semibold text-orange-400 hover:text-orange-300 hover:underline transition"
              >
                Daftar akun baru
              </button>
            </div>

            {/* Quick Demo Login Cards for Auditing/Testing */}
            <div className="mt-6 pt-5 border-t border-slate-800">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                <Sparkles className="h-3 w-3 text-orange-400" />
                <span>Akun Uji Coba Cepat (Testing Multi-Role)</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('seller@zaskiahijab.com', 'Seller123!')}
                  className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-800/80 text-left transition"
                >
                  <div className="font-bold text-slate-200 flex items-center gap-1">
                    <UserCheck className="h-3 w-3 text-emerald-400" />
                    <span>Seller (PLUS)</span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">seller@zaskiahijab.com</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin@asisseller.com', 'Admin123!')}
                  className="p-2.5 rounded-xl border border-indigo-500/30 bg-indigo-950/30 hover:border-indigo-500/60 hover:bg-indigo-900/40 text-left transition"
                >
                  <div className="font-bold text-indigo-300 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-indigo-400" />
                    <span>Admin (KIT)</span>
                  </div>
                  <div className="text-[10px] text-indigo-400/80 truncate">admin@asisseller.com</div>
                </button>
              </div>

              <div className="mt-2 text-[10px] text-slate-500 flex items-center gap-1">
                <Info className="h-3 w-3 shrink-0" />
                <span>Password tidak disimpan plaintext (menggunakan PBKDF2/SHA-256 representation).</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
