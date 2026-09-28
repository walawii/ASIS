import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  MailCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  KeyRound,
  ShieldCheck,
  Info,
} from 'lucide-react';

export const EmailVerificationPage: React.FC = () => {
  const {
    currentUser,
    verificationTokens,
    verifyEmail,
    resendVerificationEmail,
    setCurrentView,
    authError,
    setAuthError,
  } = useApp();

  const [tokenInput, setTokenInput] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Find active token for this user to display for testing/auditing simulation
  const targetEmail = currentUser?.email || 'andi@newstore.com';
  const activeTokenObj = verificationTokens.find(
    (t) => t.email.toLowerCase() === targetEmail.toLowerCase() && !t.usedAt
  );

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setSuccessMessage(null);

    if (!tokenInput.trim()) {
      setAuthError('Masukkan 6 digit kode token verifikasi.');
      return;
    }

    const verified = verifyEmail(targetEmail, tokenInput.trim());
    if (verified) {
      setSuccessMessage('Email berhasil diverifikasi! Akun Anda kini aktif.');
      setTimeout(() => {
        setCurrentView('dashboard');
      }, 1500);
    } else {
      setAuthError('Token verifikasi tidak valid atau telah kadaluarsa. Pastikan token sesuai.');
    }
  };

  const handleResend = () => {
    if (resendCooldown > 0) return;
    setIsResending(true);
    setAuthError(null);

    setTimeout(() => {
      const newToken = resendVerificationEmail(targetEmail);
      setIsResending(false);
      setSuccessMessage(`Token baru telah dikirim ke ${targetEmail}.`);
      setResendCooldown(60);
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, 400);
  };

  const handleAutoFillToken = () => {
    if (activeTokenObj) {
      setTokenInput(activeTokenObj.token);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 mb-4 shadow-lg shadow-indigo-500/10">
            <MailCheck className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Verifikasi Alamat Email
          </h2>
          <p className="mt-1.5 text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            Kode verifikasi keamanan telah dikirimkan ke:
            <span className="font-semibold text-slate-200 block mt-0.5">{targetEmail}</span>
          </p>
        </div>

        <div className="mt-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
            {authError && (
              <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                <div className="leading-relaxed">{authError}</div>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                <div className="leading-relaxed">{successMessage}</div>
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Masukkan 6-Digit Token Verifikasi
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    maxLength={10}
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    placeholder="Contoh: 849201"
                    className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-700 bg-slate-950 text-center font-mono text-base tracking-widest text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/25 active:scale-98 transition flex items-center justify-center gap-2"
              >
                <span>Verifikasi Email & Buka Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-5 flex items-center justify-between text-xs border-t border-slate-800 pt-4">
              <span className="text-slate-400">Tidak menerima email?</span>
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending || resendCooldown > 0}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 disabled:opacity-50 flex items-center gap-1.5 transition"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isResending ? 'animate-spin' : ''}`} />
                <span>
                  {resendCooldown > 0 ? `Kirim ulang (${resendCooldown}s)` : 'Kirim Ulang Token'}
                </span>
              </button>
            </div>

            {/* Simulation Inspector for Testing Token */}
            {activeTokenObj && (
              <div className="mt-5 p-3 rounded-xl border border-dashed border-indigo-500/30 bg-indigo-950/20 text-xs">
                <div className="flex items-center justify-between text-[11px] font-semibold text-indigo-300 mb-1">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
                    Simulasi Kotak Masuk Email (Testing Mode):
                  </span>
                  <button
                    onClick={handleAutoFillToken}
                    className="px-2 py-0.5 rounded bg-indigo-600/40 hover:bg-indigo-600 text-indigo-200 font-mono text-[10px] transition"
                  >
                    Auto-Fill
                  </button>
                </div>
                <div className="text-[11px] text-slate-300 font-mono">
                  Token: <strong className="text-white text-sm bg-slate-900 px-1.5 py-0.5 rounded">{activeTokenObj.token}</strong> (Berlaku 24 jam)
                </div>
              </div>
            )}

            <div className="mt-4 text-center">
              <button
                onClick={() => setCurrentView('login')}
                className="text-xs text-slate-500 hover:text-slate-400 transition"
              >
                Kembali ke halaman Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
