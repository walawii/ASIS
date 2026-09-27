import React from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { X, BookOpen, Calculator, HelpCircle } from 'lucide-react';

export const FormulaExplanationModal: React.FC = () => {
  const { formulaModalOpen, setFormulaModalOpen, formulaModalTopic } = useApp();

  if (!formulaModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl animate-in fade-in zoom-in-95 my-8">
        <button
          onClick={() => setFormulaModalOpen(false)}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 mb-4 text-orange-400">
          <BookOpen className="h-5 w-5" />
          <h2 className="text-lg font-bold text-white">Transparansi Formula Perhitungan ASIS SELLER</h2>
        </div>

        <p className="text-xs text-slate-400 mb-6">
          ASIS SELLER menggunakan standar akuntansi e-commerce Shopee Indonesia yang ketat. Seluruh pemotongan dihitung secara transparan agar Anda mengetahui ke mana setiap rupiah omzet mengalir.
        </p>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 text-xs">
          {/* Formula 1: Gross Revenue & Net Profit */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <h3 className="font-bold text-sm text-emerald-400 mb-2 flex items-center gap-1.5">
              <span>1. Laba Bersih (Net Profit) & Margin</span>
            </h3>
            <div className="space-y-2 text-slate-300 font-mono text-[11px] bg-slate-900 p-3 rounded-lg border border-slate-800">
              <div>Harga Efektif = Harga Jual Normal - Diskon Seller - Voucher Seller Toko</div>
              <div>Total Fee Marketplace = Harga Efektif × (Admin% + Layanan% + Transaksi% + Affiliate%)</div>
              <div>Total Biaya Tetap = HPP + Packing + Biaya Operasional Toko + Subsidi Ongkir</div>
              <div className="text-emerald-400 font-bold">
                Laba Bersih = Harga Efektif - Total Fee Marketplace - Total Biaya Tetap - Biaya Iklan
              </div>
              <div className="text-emerald-400 font-bold">
                Profit Margin (%) = (Laba Bersih ÷ Harga Efektif) × 100%
              </div>
            </div>
            <p className="mt-2 text-slate-400 text-[11px]">
              *Catatan: Fee Shopee selalu dipotong dari harga efektif produk setelah diskon toko, bukan dari harga coret awal.
            </p>
          </div>

          {/* Formula 2: Break Even ROAS */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <h3 className="font-bold text-sm text-blue-400 mb-2 flex items-center gap-1.5">
              <span>2. Break Even ROAS (BEP ROAS)</span>
            </h3>
            <div className="space-y-2 text-slate-300 font-mono text-[11px] bg-slate-900 p-3 rounded-lg border border-slate-800">
              <div>Margin Kotor Sebelum Iklan = Harga Efektif - HPP - Fee Marketplace - Biaya Operasional</div>
              <div className="text-blue-400 font-bold">
                BEP ROAS = Harga Efektif ÷ Margin Kotor Sebelum Iklan
              </div>
            </div>
            <p className="mt-2 text-slate-400 text-[11px]">
              Contoh: Jika harga jual Rp 100.000 dan sisa keuntungan sebelum iklan Rp 25.000, maka BEP ROAS adalah 100.000 / 25.000 = <strong>4.00x</strong>. Jika ROAS aktual Anda di bawah 4.00x, maka campaign iklan tersebut boncos / rugi!
            </p>
          </div>

          {/* Formula 3: Target ROAS & Max Ads Cost */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <h3 className="font-bold text-sm text-purple-400 mb-2 flex items-center gap-1.5">
              <span>3. Target ROAS & Maksimal Biaya Iklan</span>
            </h3>
            <div className="space-y-2 text-slate-300 font-mono text-[11px] bg-slate-900 p-3 rounded-lg border border-slate-800">
              <div>Laba Target yang Diinginkan = Harga Efektif × (Target Margin% ÷ 100)</div>
              <div>Maksimal Biaya Iklan per Order = Margin Kotor Sebelum Iklan - Laba Target</div>
              <div className="text-purple-400 font-bold">
                Target ROAS = Harga Efektif ÷ Maksimal Biaya Iklan per Order
              </div>
            </div>
          </div>

          {/* Formula 4: Harga Target & Harga Minimum (BEP Price) */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <h3 className="font-bold text-sm text-amber-400 mb-2 flex items-center gap-1.5">
              <span>4. Harga Rekomendasi & Harga Minimum BEP</span>
            </h3>
            <div className="space-y-2 text-slate-300 font-mono text-[11px] bg-slate-900 p-3 rounded-lg border border-slate-800">
              <div>Biaya Pokok Langsung = HPP + Packing + Operasional + Alokasi Iklan per Unit</div>
              <div className="text-amber-400 font-bold">
                Harga Jual Rekomendasi = Biaya Pokok Langsung ÷ (1 - Total Fee% - Target Margin%)
              </div>
              <div className="text-amber-400 font-bold">
                Harga Minimum BEP (Margin 0%) = Biaya Pokok Langsung ÷ (1 - Total Fee%)
              </div>
            </div>
            <p className="mt-2 text-slate-400 text-[11px]">
              Formula ini memastikan persentase fee marketplace yang bertambah ketika harga naik tidak menggerus margin laba yang Anda inginkan.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setFormulaModalOpen(false)}
            className="rounded-xl bg-orange-500 px-5 py-2 text-xs font-bold text-white hover:bg-orange-600 transition"
          >
            Saya Mengerti
          </button>
        </div>
      </div>
    </div>
  );
};
