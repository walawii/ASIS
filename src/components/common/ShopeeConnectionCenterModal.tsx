import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  Store,
  Radio,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  ExternalLink,
  Lock,
  X,
  Sparkles,
  Server,
  KeyRound,
} from 'lucide-react';
import { ShopeeConnectionStatus } from '../../services/shopee/types.ts';

export const ShopeeConnectionCenterModal: React.FC = () => {
  const {
    shopeeModalOpen,
    setShopeeModalOpen,
    shopeeConnectionState,
    setShopeeConnectionState,
    currentStore,
  } = useApp();

  const [partnerIdInput, setPartnerIdInput] = useState('');
  const [shopIdInput, setShopIdInput] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'info' | 'warning' | 'error' | 'success'; message: string } | null>(null);

  if (!shopeeModalOpen) return null;

  const handleTestConnect = () => {
    setIsTesting(true);
    setFeedback(null);

    setTimeout(() => {
      setIsTesting(false);
      if (!partnerIdInput.trim() || !shopIdInput.trim()) {
        setFeedback({
          type: 'warning',
          message:
            'Partner ID dan Shop ID resmi belum diisi. Mode Simulasi Lokal tetap aktif dengan proteksi keamanan penuh.',
        });
      } else {
        setFeedback({
          type: 'info',
          message:
            'Sesuai standar keamanan Phase 18, credential Shopee Partner API hanya dapat diotentikasi melalui server backend terenkripsi. Rahasia toko Anda tidak pernah disimpan di browser.',
        });
      }
    }, 800);
  };

  const handleSwitchToSimulation = () => {
    setShopeeConnectionState({
      status: 'SIMULATION',
      isSimulationMode: true,
      shopName: currentStore.name,
      shopId: 'SIM-882049112',
      lastSyncTime: new Date().toLocaleTimeString('id-ID'),
    });
    setFeedback({
      type: 'success',
      message: 'Mode Simulasi Lokal aktif. Menjalankan 100% data toko offline tanpa jaringan eksternal.',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20 text-orange-400">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Shopee Connection Center</span>
                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                  {shopeeConnectionState.status}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Pusat manajemen status koneksi API Shopee Open Platform & Mode Simulasi Lokal
              </p>
            </div>
          </div>

          <button
            onClick={() => setShopeeModalOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current Connection Status Box */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse"></span>
              <span className="font-bold text-xs text-amber-200">
                🟡 Belum terhubung ke Shopee — Mode Simulasi Lokal
              </span>
            </div>
            <span className="text-[11px] text-amber-300/80 font-mono">
              Toko: {currentStore.name}
            </span>
          </div>
          <p className="text-xs text-amber-300/80 leading-relaxed">
            Aplikasi saat ini berjalan menggunakan data demo simulasi lokal yang lengkap (10 produk, 20+ varian, 30 pesanan, 5 kampanye iklan). Seluruh kalkulasi profit engine berjalan 100% deterministik dan valid.
          </p>
        </div>

        {/* Integration Architecture & Security Notice (Phase 16 & 18) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 text-slate-200 font-bold">
              <Server className="h-4 w-4 text-emerald-400" />
              <span>Arsitektur Provider Bersih</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Data mengalir via <code>MockShopeeProvider</code> → <code>Normalizer</code> → <code>ASIS Model</code> → <code>Profit Engine</code>. Profit engine tidak pernah bergantung langsung pada format mentah API Shopee.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 text-slate-200 font-bold">
              <Lock className="h-4 w-4 text-blue-400" />
              <span>Keamanan Standar Industri</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Partner Key dan App Secret <strong>TIDAK PERNAH</strong> disimpan di <code>localStorage</code> atau diekspos di frontend. Koneksi live resmi membutuhkan server-side proxy route.
            </p>
          </div>
        </div>

        {/* Connect Shopee Partner Form */}
        <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-orange-400" />
              <span>Konfigurasi Shopee Partner Open Platform</span>
            </h3>
            <span className="text-[10px] text-slate-500">Shopee Open API v2</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 font-medium block mb-1">
                Partner ID
              </label>
              <input
                type="text"
                placeholder="Contoh: 1002341"
                value={partnerIdInput}
                onChange={(e) => setPartnerIdInput(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 font-medium block mb-1">
                Shop ID (ID Toko Shopee)
              </label>
              <input
                type="text"
                placeholder="Contoh: 882049112"
                value={shopIdInput}
                onChange={(e) => setShopIdInput(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {feedback && (
            <div
              className={`rounded-xl p-3 text-xs flex items-start gap-2 ${
                feedback.type === 'warning'
                  ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                  : feedback.type === 'info'
                  ? 'bg-blue-500/10 text-blue-300 border border-blue-500/30'
                  : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{feedback.message}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            <button
              onClick={handleSwitchToSimulation}
              className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
            >
              Reset ke Mode Simulasi Offline
            </button>

            <button
              onClick={handleTestConnect}
              disabled={isTesting}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-xs font-bold text-white shadow-lg shadow-orange-500/20 transition active:scale-98 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Memvalidasi...' : 'Uji Koneksi Shopee'}</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800">
          <span>Kredensial Shopee Live: <strong>NOT CONFIGURED</strong> (Simulation Mode Active)</span>
          <a
            href="https://open.shopee.com"
            target="_blank"
            rel="noreferrer"
            className="text-orange-400 hover:underline flex items-center gap-1"
          >
            <span>Shopee Open Platform</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
