import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  Store,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  Lock,
  X,
  Sparkles,
  Server,
  KeyRound,
  ExternalLink,
  PowerOff,
  Radio,
} from 'lucide-react';

export const ShopeeConnectionCenterModal: React.FC = () => {
  const {
    shopeeModalOpen,
    setShopeeModalOpen,
    shopeeConnectionState,
    currentStore,
    currentUser,
    initiateShopeeConnect,
    completeShopeeConnect,
    syncShopee,
    disconnectShopee,
    isSimulationMode,
    setIsSimulationMode,
  } = useApp();

  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'info' | 'warning' | 'error' | 'success';
    message: string;
  } | null>(null);

  // Simulation of official OAuth popup/redirect exchange
  const [simulatingAuthWindow, setSimulatingAuthWindow] = useState(false);
  const [authStepState, setAuthStepState] = useState<string | null>(null);

  if (!shopeeModalOpen) return null;

  const isConnected = shopeeConnectionState.status === 'CONNECTED';

  // Initiate real OAuth initiation flow (calls server GET /api/shopee/connect)
  const handleInitiateOAuth = async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const authUrl = await initiateShopeeConnect();
      // Extract state nonce from generated official URL
      const urlObj = new URL(authUrl);
      const state = urlObj.searchParams.get('state') || '';
      setAuthStepState(state);
      setSimulatingAuthWindow(true);
      setIsLoading(false);
    } catch (err: any) {
      setIsLoading(false);
      setFeedback({
        type: 'error',
        message: err.message || 'Gagal memulai koneksi OAuth ke Shopee.',
      });
    }
  };

  // Simulate user approving permissions on official Shopee Open Platform authorization screen
  const handleApproveShopeeGrant = async () => {
    if (!authStepState) return;
    setIsLoading(true);
    try {
      const simulatedCode = 'auth_code_live_' + Math.floor(100000 + Math.random() * 900000);
      const simulatedShopId = '8820' + Math.floor(1000 + Math.random() * 9000);
      await completeShopeeConnect(simulatedCode, simulatedShopId, authStepState);
      setSimulatingAuthWindow(false);
      setAuthStepState(null);
      setIsLoading(false);
      setFeedback({
        type: 'success',
        message: 'Toko Shopee berhasil dihubungkan dan terverifikasi secara server-side!',
      });
    } catch (err: any) {
      setIsLoading(false);
      setFeedback({
        type: 'error',
        message: err.message || 'Otorisasi gagal diselesaikan.',
      });
    }
  };

  const handleSync = async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      await syncShopee();
      setIsLoading(false);
      setFeedback({
        type: 'success',
        message: 'Sinkronisasi data pesanan dan produk berhasil diperbarui dari Shopee.',
      });
    } catch (err: any) {
      setIsLoading(false);
      setFeedback({
        type: 'error',
        message: err.message || 'Gagal menyinkronkan data toko.',
      });
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Apakah Anda yakin ingin memutuskan koneksi toko ini? Histori produk dan kalkulasi laba Anda akan tetap tersimpan aman di akun ASIS Anda.')) {
      return;
    }
    setIsLoading(true);
    setFeedback(null);
    try {
      await disconnectShopee();
      setIsLoading(false);
      setFeedback({
        type: 'info',
        message: 'Koneksi ke Shopee telah diputuskan. Status toko kini NOT_CONNECTED. Histori transaksi tetap tersimpan.',
      });
    } catch (err: any) {
      setIsLoading(false);
      setFeedback({
        type: 'error',
        message: err.message || 'Gagal memutuskan koneksi toko.',
      });
    }
  };

  const handleEnableSimulation = () => {
    setIsSimulationMode(true);
    setFeedback({
      type: 'info',
      message: 'Mode Simulasi Offline diaktifkan. Anda dapat menguji seluruh fitur dengan dataset demo tanpa koneksi API live.',
    });
  };

  const handleDisableSimulation = () => {
    setIsSimulationMode(false);
    setFeedback({
      type: 'info',
      message: 'Mode Simulasi dinonaktifkan. Beralih ke data toko nyata akun Anda.',
    });
  };

  // Mask shopId for presentation security (e.g. 8820****)
  const maskedShopId = shopeeConnectionState.shopId
    ? shopeeConnectionState.shopId.length > 4
      ? `${shopeeConnectionState.shopId.slice(0, 4)}****`
      : shopeeConnectionState.shopId
    : '-';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-7 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <Store className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span>Shopee Connection Center</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold font-mono ${
                    isConnected
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : isSimulationMode
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {isSimulationMode ? 'MODE SIMULASI' : shopeeConnectionState.status}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Otorisasi resmi Shopee Open Platform OAuth 2.0 & Pengaturan Toko Terikat ({currentUser?.email})
              </p>
            </div>
          </div>

          <button
            onClick={() => setShopeeModalOpen(false)}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Feedback Banner */}
        {feedback && (
          <div
            className={`p-3.5 rounded-2xl border text-xs leading-relaxed flex items-start gap-2.5 ${
              feedback.type === 'success'
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                : feedback.type === 'error'
                ? 'border-rose-500/40 bg-rose-500/10 text-rose-300'
                : feedback.type === 'warning'
                ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                : 'border-blue-500/40 bg-blue-500/10 text-blue-300'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
            ) : feedback.type === 'error' ? (
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
            ) : (
              <ShieldCheck className="h-4 w-4 shrink-0 text-blue-400 mt-0.5" />
            )}
            <div>{feedback.message}</div>
          </div>
        )}

        {/* Modal Content Based on State */}
        {simulatingAuthWindow ? (
          /* Simulated Shopee Open Platform Consent Screen */
          <div className="p-5 rounded-2xl border border-orange-500/40 bg-slate-950 space-y-4">
            <div className="flex items-center gap-2 text-orange-400 text-xs font-bold uppercase tracking-wider">
              <ExternalLink className="h-4 w-4" />
              <span>Simulasi Shopee Open Platform OAuth 2.0 Consent Screen</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Di lingkungan produksi, Anda dialihkan ke domain resmi{' '}
              <strong className="text-white">partner.shopeemobile.com</strong>. Shopee akan meminta Anda login dan menyetujui izin sinkronisasi:
            </p>
            <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
              <li>Membaca data profil toko (Shop Info)</li>
              <li>Membaca katalog produk dan stok (Item Management)</li>
              <li>Membaca status pesanan dan resi (Order Management)</li>
            </ul>
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setSimulatingAuthWindow(false)}
                className="px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition"
              >
                Batalkan
              </button>
              <button
                onClick={handleApproveShopeeGrant}
                disabled={isLoading}
                className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-xs font-bold text-white shadow-lg shadow-orange-500/25 transition disabled:opacity-50 flex items-center gap-1.5"
              >
                {isLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                <span>Setujui Otorisasi (Simulasikan Callback)</span>
              </button>
            </div>
          </div>
        ) : isConnected && !isSimulationMode ? (
          /* STATE: CONNECTED LIVE */
          <div className="space-y-4">
            <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
                  <span className="font-bold text-xs text-emerald-300">🟢 Shopee Terhubung (Live Mode)</span>
                </div>
                <span className="text-[10px] text-emerald-400/80 font-mono">Region: ID</span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 block">Nama Toko:</span>
                  <span className="font-bold text-white text-sm">{shopeeConnectionState.shopName}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Shop ID (Masked):</span>
                  <span className="font-mono text-slate-300">{maskedShopId}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Status Koneksi:</span>
                  <span className="font-semibold text-emerald-400">Aktif & Terotorisasi</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Terakhir Disinkronkan:</span>
                  <span className="text-slate-300">{shopeeConnectionState.lastSyncTime || 'Belum pernah sync'}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                onClick={handleSync}
                disabled={isLoading}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-600/25 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Sync Sekarang (Ambil Data Terbaru)</span>
              </button>

              <button
                onClick={handleDisconnect}
                disabled={isLoading}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-xs font-bold text-rose-300 transition flex items-center justify-center gap-2"
              >
                <PowerOff className="h-3.5 w-3.5" />
                <span>Putuskan Koneksi Toko</span>
              </button>
            </div>
          </div>
        ) : (
          /* STATE: NOT CONNECTED (OR IN SIMULATION MODE) */
          <div className="space-y-4">
            <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 space-y-2">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                <span className="font-bold text-xs text-amber-200">
                  {isSimulationMode
                    ? 'Mode Simulasi Lokal Aktif (Data Demo)'
                    : '🟡 Belum terhubung ke Shopee'}
                </span>
              </div>
              <p className="text-xs text-amber-300/80 leading-relaxed">
                {isSimulationMode
                  ? 'Anda sedang melihat dataset simulasi toko "Zaskia Hijab & Fashion". Data ini hanya simulasi offline dan terisolasi dari toko nyata.'
                  : 'Hubungkan toko Shopee Anda menggunakan alur OAuth 2.0 resmi untuk mengimpor produk dan pesanan secara otomatis tanpa membagikan kredensial login Anda.'}
              </p>
            </div>

            {/* Official OAuth Connect Button */}
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/70 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-orange-400" />
                  <span className="text-xs font-bold text-white">Hubungkan Toko Resmi via Shopee OAuth</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Open Platform v2</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Tidak perlu memasukkan Partner ID atau Key. Otorisasi dilakukan di domain resmi Shopee. Token dienkripsi di server ASIS dan tidak pernah dikirim ke browser.
              </p>
              <button
                onClick={handleInitiateOAuth}
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-xs font-bold text-white shadow-lg shadow-orange-500/20 active:scale-98 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
                <span>[Hubungkan Shopee Sekarang via OAuth 2.0]</span>
              </button>
            </div>

            {/* Simulation Mode Toggle Card */}
            <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/40 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-slate-200">Mode Simulasi Offline</div>
                <div className="text-[11px] text-slate-400">
                  Uji fitur ASIS tanpa akun Shopee nyata.
                </div>
              </div>

              {isSimulationMode ? (
                <button
                  onClick={handleDisableSimulation}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
                >
                  Nonaktifkan Simulasi
                </button>
              ) : (
                <button
                  onClick={handleEnableSimulation}
                  className="px-3.5 py-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 font-semibold text-xs transition flex items-center gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Aktifkan Simulasi</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Security Disclaimers */}
        <div className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-950/30 text-[11px] text-slate-400 flex items-center gap-2.5">
          <Lock className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>
            ASIS SELLER mematuhi kebijakan privasi Shopee Open Platform. Data toko dienkripsi menggunakan standar industri dan terikat eksklusif ke akun Anda.
          </span>
        </div>
      </div>
    </div>
  );
};
