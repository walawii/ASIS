import React from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  ShieldAlert,
  CreditCard,
  ArrowRight,
  Clock,
  Sparkles,
  HelpCircle,
  MailCheck,
} from 'lucide-react';

export const SubscriptionGatePage: React.FC<{ reason?: string }> = ({ reason }) => {
  const { currentUser, setCurrentView, changeUserSubscription } = useApp();

  const status = currentUser?.subscriptionStatus || 'PENDING';
  const plan = currentUser?.subscriptionPlan || 'LITE';

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full rounded-3xl border border-amber-500/30 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-md text-center space-y-5">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-lg shadow-amber-500/10">
          <Clock className="h-7 w-7" />
        </div>

        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold uppercase tracking-wider font-mono">
            Status Langganan: {status}
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-2">
            Aktivasi Paket {plan} Diperlukan
          </h2>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            {reason ||
              `Akun Anda saat ini memiliki status langganan (${status}). Untuk melanjutkan akses ke fitur kalkulator dan analitik toko, silakan aktifkan langganan Anda.`}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left text-xs space-y-2">
          <div className="flex justify-between text-slate-400">
            <span>Paket Dipilih:</span>
            <span className="font-bold text-white">ASIS {plan}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Akun Pengguna:</span>
            <span className="font-bold text-slate-300">{currentUser?.email}</span>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          {/* Quick simulation activator for testing */}
          <button
            onClick={() => changeUserSubscription(plan, 'ACTIVE')}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 transition active:scale-98 flex items-center justify-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            <span>Simulasi Aktivasi Langganan Sekarang</span>
          </button>

          <button
            onClick={() => setCurrentView('pricing')}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
          >
            Lihat Pilihan Paket Lain
          </button>
        </div>
      </div>
    </div>
  );
};
