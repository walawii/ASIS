import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { CompetitorComparison } from '../../types/index.ts';
import { Scale, Plus, DollarSign, Star, ShieldCheck, X } from 'lucide-react';

export const CompetitiveGapPage: React.FC = () => {
  const { competitors, currentStore } = useApp();

  const [comparisons, setComparisons] = useState<CompetitorComparison[]>(competitors);
  const [modalOpen, setModalOpen] = useState(false);

  // New form fields
  const [prodName, setProdName] = useState('');
  const [ownPrice, setOwnPrice] = useState(150000);
  const [ownRating, setOwnRating] = useState(4.9);
  const [ownSold, setOwnSold] = useState(300);
  const [ownMargin, setOwnMargin] = useState(22);

  const [compStore, setCompStore] = useState('');
  const [compPrice, setCompPrice] = useState(165000);
  const [compRating, setCompRating] = useState(4.8);
  const [compSold, setCompSold] = useState(1200);
  const [compReviews, setCompReviews] = useState(850);
  const [compVoucher, setCompVoucher] = useState('Diskon 10rb Min 150rb');

  const handleAddComparison = (e: React.FormEvent) => {
    e.preventDefault();
    const priceDiff = ((ownPrice - compPrice) / compPrice) * 100;
    const estRev = compSold * compPrice;
    const positioning =
      priceDiff < -5 ? 'Lebih Murah' : priceDiff > 5 ? 'Premium' : 'Seimbang';

    const newComp: CompetitorComparison = {
      id: `cmp_gap_${Date.now()}`,
      storeId: currentStore.id,
      productName: prodName || 'Produk Baru',
      ownPrice,
      ownRating,
      ownSold,
      ownEstimatedMargin: ownMargin,
      competitorStore: compStore || 'Kompetitor Shopee',
      competitorPrice: compPrice,
      competitorRating: compRating,
      competitorSold: compSold,
      competitorReviews: compReviews,
      competitorVoucher: compVoucher,
      priceDiffPercent: Number(priceDiff.toFixed(1)),
      estimatedCompetitorRevenue: estRev,
      positioning,
    };

    setComparisons([newComp, ...comparisons]);
    setModalOpen(false);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Scale className="h-6 w-6 text-purple-400" />
              <span>Competitive Gap & Estimasi Omzet Kompetitor</span>
            </h1>
            <span className="rounded-full bg-purple-500/20 px-2.5 py-0.5 text-xs font-semibold text-purple-300">
              Benchmark Manual
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Bandingkan harga, rating, promo, dan estimasi perolehan omzet toko kompetitor di Shopee.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-orange-500/20 active:scale-98 transition self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Benchmark Kompetitor</span>
        </button>
      </div>

      {/* Honest Disclaimer Banner */}
      <div className="rounded-2xl border border-blue-500/30 bg-blue-950/20 p-4 text-xs text-blue-300 flex items-start gap-2.5">
        <ShieldCheck className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-white">Transparansi Data:</strong> Estimasi omzet dihitung dengan formula matematis:{' '}
          <code className="text-amber-300 font-mono">Jumlah Terjual × Harga Produk</code>.
          <div className="text-[11px] text-blue-400/90 mt-0.5">
            ⚠️ <em>Estimasi, bukan data omzet aktual dari pembukuan internal kompetitor. Berasal dari input manual data listing publik Shopee.</em>
          </div>
        </div>
      </div>

      {/* Comparison Cards List */}
      <div className="space-y-4">
        {comparisons.map((c) => (
          <div
            key={c.id}
            className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg space-y-4"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
              <div>
                <h3 className="font-bold text-sm text-white">{c.productName}</h3>
                <div className="text-xs text-slate-400">
                  Kompetitor: <strong className="text-slate-200">{c.competitorStore}</strong>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">Positioning Toko Anda:</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    c.positioning === 'Lebih Murah'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : c.positioning === 'Premium'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  }`}
                >
                  {c.positioning} ({c.priceDiffPercent > 0 ? `+${c.priceDiffPercent}%` : `${c.priceDiffPercent}%`})
                </span>
              </div>
            </div>

            {/* Side by Side Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Toko Anda */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="font-bold text-orange-400 uppercase text-[10px]">
                  Toko Anda ({currentStore.name})
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Harga Jual:</span>
                  <span className="font-mono font-bold text-white">
                    Rp {c.ownPrice.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Rating Produk:</span>
                  <span className="font-bold text-amber-400 flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400" />
                    <span>{c.ownRating} / 5.0</span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Jumlah Terjual:</span>
                  <span className="font-bold text-white">{c.ownSold} pcs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Estimasi Margin Bersih:</span>
                  <span className="font-bold text-emerald-400">{c.ownEstimatedMargin}%</span>
                </div>
              </div>

              {/* Kompetitor */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="font-bold text-purple-400 uppercase text-[10px]">
                  Kompetitor ({c.competitorStore})
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Harga Jual Kompetitor:</span>
                  <span className="font-mono font-bold text-white">
                    Rp {c.competitorPrice.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Rating & Review:</span>
                  <span className="font-bold text-amber-400 flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400" />
                    <span>
                      {c.competitorRating} ({c.competitorReviews} ulasan)
                    </span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Terjual Publik:</span>
                  <span className="font-bold text-white">{c.competitorSold} pcs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Voucher / Promo Aktif:</span>
                  <span className="text-pink-300 font-medium">{c.competitorVoucher}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-800">
                  <span className="text-slate-300 font-bold">Estimasi Omzet Kompetitor:</span>
                  <span className="font-black text-emerald-400 font-mono">
                    Rp {(c.estimatedCompetitorRevenue / 1000000).toFixed(1)} jt
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <form
            onSubmit={handleAddComparison}
            className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white">Input Benchmark Kompetitor</h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Nama Produk
              </label>
              <input
                type="text"
                required
                value={prodName}
                onChange={(e) => setProdName(e.target.value)}
                placeholder="misal: Gamis Abaya Silk"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Harga Anda (Rp)
                </label>
                <input
                  type="number"
                  value={ownPrice}
                  onChange={(e) => setOwnPrice(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Terjual Anda
                </label>
                <input
                  type="number"
                  value={ownSold}
                  onChange={(e) => setOwnSold(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Nama Toko Kompetitor
                </label>
                <input
                  type="text"
                  value={compStore}
                  onChange={(e) => setCompStore(e.target.value)}
                  placeholder="Official Store / Star+"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Harga Kompetitor (Rp)
                </label>
                <input
                  type="number"
                  value={compPrice}
                  onChange={(e) => setCompPrice(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Terjual Kompetitor
                </label>
                <input
                  type="number"
                  value={compSold}
                  onChange={(e) => setCompSold(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Rating Kompetitor
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={compRating}
                  onChange={(e) => setCompRating(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-xs font-bold text-white shadow-md transition"
              >
                Simpan Benchmark
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
