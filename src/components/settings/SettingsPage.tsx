import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  Settings,
  Store as StoreIcon,
  Shield,
  Percent,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { currentStore, updateStoreSettings } = useApp();

  const [storeName, setStoreName] = useState(currentStore.name);
  const [storeCategory, setStoreCategory] = useState(currentStore.category);
  const [adminFee, setAdminFee] = useState(currentStore.defaultAdminFeePercent);
  const [serviceFee, setServiceFee] = useState(currentStore.defaultServiceFeePercent);
  const [paymentFee, setPaymentFee] = useState(currentStore.defaultPaymentFeePercent);
  const [affiliateFee, setAffiliateFee] = useState(currentStore.defaultAffiliateFeePercent);
  const [packingCost, setPackingCost] = useState(currentStore.defaultPackingCost);
  const [operationalCost, setOperationalCost] = useState(currentStore.defaultOperationalCost);
  const [targetMargin, setTargetMargin] = useState(currentStore.defaultTargetMargin);
  const [targetRoas, setTargetRoas] = useState(currentStore.defaultTargetRoas);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreSettings({
      name: storeName,
      category: storeCategory,
      defaultAdminFeePercent: adminFee,
      defaultServiceFeePercent: serviceFee,
      defaultPaymentFeePercent: paymentFee,
      defaultAffiliateFeePercent: affiliateFee,
      defaultPackingCost: packingCost,
      defaultOperationalCost: operationalCost,
      defaultTargetMargin: targetMargin,
      defaultTargetRoas: targetRoas,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Settings className="h-6 w-6 text-slate-400" />
            <span>Pengaturan Toko & Default Fee Shopee</span>
          </h1>
          <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-300">
            Mata Uang: IDR (Rp)
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Atur tarif admin fee Shopee (Star Seller / Non-Star / Mall) dan konstanta biaya default toko Anda.
        </p>
      </div>

      {savedSuccess && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-4 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>Pengaturan toko berhasil diperbarui ke seluruh kalkulator dan analitik!</span>
        </div>
      )}

      {/* Shopee Open Platform Connection Status Card */}
      <div className="rounded-2xl border border-amber-500/30 bg-amber-950/15 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
              <StoreIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">Shopee Open Platform Integration</h3>
                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                  Belum Terhubung
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                ASIS SELLER menggunakan sistem data lokal dan kalkulasi matematis independen. Toko Anda saat ini beroperasi dalam mode preview aman tanpa mengakses API credential Shopee.
              </p>
            </div>
          </div>

          <button
            onClick={() => alert('Integrasi Shopee Open Platform membutuhkan Partner ID & Key resmi dari open.shopee.com. Saat ini menggunakan mode simulasi lokal yang berfungsi 100%.')}
            className="shrink-0 px-4 py-2 rounded-xl border border-amber-500/40 bg-amber-500/10 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition"
          >
            Pelajari Integrasi API
          </button>
        </div>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Toko */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-lg">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800">
            1. Profil Toko Shopee
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Nama Toko Shopee
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Kategori Utama
              </label>
              <input
                type="text"
                value={storeCategory}
                onChange={(e) => setStoreCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Tarif Fee Shopee */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              2. Tarif Potongan Shopee Marketplace (Default)
            </h2>
            <span className="text-xs font-bold text-orange-400">
              Total Default: {(adminFee + serviceFee + paymentFee + affiliateFee).toFixed(1)}%
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-[11px] font-medium text-slate-300 block mb-1">
                Admin Fee Toko (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={adminFee}
                onChange={(e) => setAdminFee(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Star/Star+ ~6.5%</span>
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-300 block mb-1">
                Biaya Layanan (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={serviceFee}
                onChange={(e) => setServiceFee(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Gratis Ongkir Xtra ~4%</span>
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-300 block mb-1">
                Biaya Transaksi (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={paymentFee}
                onChange={(e) => setPaymentFee(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Payment processing ~1.5%</span>
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-300 block mb-1">
                Komisi Affiliate (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={affiliateFee}
                onChange={(e) => setAffiliateFee(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Shopee Affiliate program</span>
            </div>
          </div>
        </div>

        {/* Biaya Operasional & Target */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-lg">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800">
            3. Standar Biaya & Target Toko
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-[11px] font-medium text-slate-300 block mb-1">
                Packing Cost Default (Rp)
              </label>
              <input
                type="number"
                value={packingCost}
                onChange={(e) => setPackingCost(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-300 block mb-1">
                Ops Cost Default (Rp)
              </label>
              <input
                type="number"
                value={operationalCost}
                onChange={(e) => setOperationalCost(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-300 block mb-1">
                Target Margin Default (%)
              </label>
              <input
                type="number"
                value={targetMargin}
                onChange={(e) => setTargetMargin(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-300 block mb-1">
                Target ROAS Default (x)
              </label>
              <input
                type="number"
                step="0.1"
                value={targetRoas}
                onChange={(e) => setTargetRoas(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white"
              />
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-xs font-bold text-white shadow-lg shadow-orange-500/25 transition active:scale-98"
          >
            Simpan Perubahan Pengaturan
          </button>
        </div>
      </form>
    </div>
  );
};
