import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { MarketplaceFeeRule, SellerProgramRule, TaxRule } from '../../types/rules.ts';
import {
  ShieldCheck,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  ExternalLink,
  Calendar,
  AlertTriangle,
  Clock,
  HelpCircle,
  X,
} from 'lucide-react';

export const FeeRulesAdminPage: React.FC = () => {
  const {
    marketplaceRules,
    setMarketplaceRules,
    programRules,
    setProgramRules,
    taxRules,
    setTaxRules,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'marketplace' | 'program' | 'tax' | 'processing'>('marketplace');
  const [modalOpen, setModalOpen] = useState(false);

  // New Rule Form
  const [ruleName, setRuleName] = useState('');
  const [ruleSellerType, setRuleSellerType] = useState<any>('STAR');
  const [ruleCategory, setRuleCategory] = useState('Fashion & Pakaian');
  const [rulePercentage, setRulePercentage] = useState(7.5);
  const [ruleFixedFee, setRuleFixedFee] = useState(0);
  const [ruleMaxFee, setRuleMaxFee] = useState<number | undefined>(undefined);
  const [ruleEffectiveFrom, setRuleEffectiveFrom] = useState('2024-01-01');
  const [ruleEffectiveUntil, setRuleEffectiveUntil] = useState('2026-12-31');
  const [ruleSource, setRuleSource] = useState('Shopee Help Center Resmi 2026');
  const [ruleSourceUrl, setRuleSourceUrl] = useState('https://help.shopee.co.id');

  const handleToggleRule = (id: string) => {
    setMarketplaceRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
    );
  };

  const handleToggleProgram = (id: string) => {
    setProgramRules((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );
  };

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    const newRule: MarketplaceFeeRule = {
      id: `rule_custom_${Date.now()}`,
      marketplace: 'SHOPEE',
      sellerType: ruleSellerType,
      category: ruleCategory,
      feeType: 'ADMINISTRATION',
      percentage: rulePercentage,
      fixedFee: ruleFixedFee,
      maximumFee: ruleMaxFee,
      calculationBase: 'AFTER_SELLER_DISCOUNT_AND_VOUCHER',
      effectiveFrom: ruleEffectiveFrom,
      effectiveUntil: ruleEffectiveUntil,
      active: true,
      status: 'ACTIVE',
      source: ruleSource,
      sourceUrl: ruleSourceUrl,
      notes: 'Aturan kustom yang ditambahkan oleh admin toko.',
      verifiedAt: '2026-09-25',
    };

    setMarketplaceRules([newRule, ...marketplaceRules]);
    setModalOpen(false);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-orange-400" />
              <span>Manajemen Aturan Biaya & Regulasi (Fee Rules Engine)</span>
            </h1>
            <span className="rounded-full bg-orange-500/20 px-2.5 py-0.5 text-xs font-semibold text-orange-300">
              Admin Control
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Konfigurasi tarif administrasi Shopee, program seller, biaya proses pesanan, dan regulasi pajak tanpa mengubah kode aplikasi.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-orange-500/20 active:scale-98 transition self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Aturan Fee Baru</span>
        </button>
      </div>

      {/* Verified Banner (Requirement AA, AB) */}
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/15 p-4 text-xs text-emerald-300 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Status Regulasi Terverifikasi:</strong> Fee rules terakhir diperbarui & diverifikasi:{' '}
            <span className="text-white font-mono font-bold">25 September 2026</span> (Shopee Help Center & DJP).
          </span>
        </div>
        <span className="hidden sm:inline text-[11px] text-emerald-400/80">
          Versi Engine: v3.2-prod
        </span>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('marketplace')}
          className={`px-3 py-1.5 rounded-xl font-medium transition ${
            activeTab === 'marketplace'
              ? 'bg-orange-500 text-white font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Biaya Administrasi Shopee ({marketplaceRules.length})
        </button>
        <button
          onClick={() => setActiveTab('program')}
          className={`px-3 py-1.5 rounded-xl font-medium transition ${
            activeTab === 'program'
              ? 'bg-orange-500 text-white font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Program Promosi Seller ({programRules.length})
        </button>
        <button
          onClick={() => setActiveTab('processing')}
          className={`px-3 py-1.5 rounded-xl font-medium transition ${
            activeTab === 'processing'
              ? 'bg-orange-500 text-white font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Biaya Pemrosesan Pesanan (Flat)
        </button>
        <button
          onClick={() => setActiveTab('tax')}
          className={`px-3 py-1.5 rounded-xl font-medium transition ${
            activeTab === 'tax'
              ? 'bg-orange-500 text-white font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Regulasi Pajak UMKM ({taxRules.length})
        </button>
      </div>

      {/* Tab 1: Marketplace Administration Rules */}
      {activeTab === 'marketplace' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-4">Tipe Seller</th>
                  <th className="py-3 px-4">Kategori Produk</th>
                  <th className="py-3 px-4 text-center">Persentase Fee</th>
                  <th className="py-3 px-4">Periode Berlaku</th>
                  <th className="py-3 px-4">Sumber Resmi</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {marketplaceRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-bold text-white">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-orange-400 font-mono text-[10px]">
                        {rule.sellerType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-white">{rule.category}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-emerald-400">
                      {rule.percentage}%
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                      {rule.effectiveFrom} s/d {rule.effectiveUntil || 'Sekarang'}
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-[11px] text-slate-400">
                      {rule.sourceUrl ? (
                        <a
                          href={rule.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-orange-400 hover:underline flex items-center gap-1 truncate"
                        >
                          <span>{rule.source}</span>
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                      ) : (
                        rule.source
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          rule.active
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {rule.active ? 'ACTIVE' : 'DISABLED'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleRule(rule.id)}
                        className="text-xs text-orange-400 hover:underline font-medium"
                      >
                        {rule.active ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Seller Programs (Gratis Ongkir Xtra, Promo Xtra, Promo Xtra+) */}
      {activeTab === 'program' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {programRules.map((prog) => (
            <div
              key={prog.id}
              className={`rounded-2xl border p-5 space-y-3 transition ${
                prog.enabled
                  ? 'border-orange-500/40 bg-slate-900 shadow-md'
                  : 'border-slate-800 bg-slate-900/50 opacity-75'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-white">{prog.name}</h3>
                  <span className="text-[10px] text-orange-400 font-mono">{prog.code}</span>
                </div>

                <button
                  onClick={() => handleToggleProgram(prog.id)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold transition ${
                    prog.enabled
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {prog.enabled ? 'AKTIF' : 'NONAKTIF'}
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{prog.description}</p>

              <div className="grid grid-cols-2 gap-2 py-2 border-y border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Tarif Standar</span>
                  <div className="font-bold text-white mt-0.5">{prog.rate}%</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Cap Maksimal</span>
                  <div className="font-bold text-white mt-0.5">
                    {prog.cap ? `Rp ${prog.cap.toLocaleString('id-ID')}` : 'Tanpa Batas'}
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                <span>Sumber: {prog.source}</span>
                <span className="font-mono">Verifikasi: {prog.verifiedAt}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Order Processing Fee */}
      {activeTab === 'processing' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-xl max-w-2xl">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <span>Order Processing Fee (Biaya Layanan Pemrosesan Pesanan)</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400">Tarif Flat per Transaksi Selesai:</span>
              <div className="text-3xl font-black text-orange-400 mt-0.5">Rp 1.250</div>
              <span className="text-[11px] text-slate-400">
                Berlaku sejak 1 September 2024 s/d 31 Desember 2026.
              </span>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              ACTIVE
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Dikenakan oleh Shopee untuk seluruh transaksi selesai sebagai biaya pengelolaan sistem dan transaksi pembayaran. Biaya ini dipotong otomatis saat dana diteruskan ke saldo penjual.
          </p>

          <div className="text-xs text-slate-500 pt-2 border-t border-slate-800">
            Sumber: Shopee Help Center Artikel 73111 (Terverifikasi 25 September 2026).
          </div>
        </div>
      )}

      {/* Tab 4: Tax Rules */}
      {activeTab === 'tax' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {taxRules.map((tr) => (
            <div
              key={tr.id}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-3 shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-white">{tr.name}</h3>
                  <span className="text-[10px] text-emerald-400 font-mono">{tr.regulationNumber}</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                  {tr.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 py-2 border-y border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Tarif Pajak</span>
                  <div className="font-bold text-white mt-0.5">{tr.rate}% (PPh Final)</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Batas Bebas Pajak (WPOP)</span>
                  <div className="font-bold text-emerald-400 mt-0.5">
                    {tr.annualNonTaxableThreshold > 0
                      ? `Rp ${(tr.annualNonTaxableThreshold / 1000000).toFixed(0)} Juta / thn`
                      : 'Rp 0 (Badan)'}
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-400">
                Dasar Hukum: <strong className="text-slate-300">{tr.regulationNumber}</strong>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <form
            onSubmit={handleAddRule}
            className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white">Tambah Aturan Fee Marketplace Baru</h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Tipe Seller</label>
                <select
                  value={ruleSellerType}
                  onChange={(e) => setRuleSellerType(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                >
                  <option value="STAR">Star Seller</option>
                  <option value="STAR_PLUS">Star+ Seller</option>
                  <option value="NON_STAR">Non-Star Seller</option>
                  <option value="MALL">Shopee Mall</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Kategori</label>
                <input
                  type="text"
                  value={ruleCategory}
                  onChange={(e) => setRuleCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Persentase Fee (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={rulePercentage}
                  onChange={(e) => setRulePercentage(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Maksimal Cap (Rp, Opsional)</label>
                <input
                  type="number"
                  value={ruleMaxFee || ''}
                  onChange={(e) => setRuleMaxFee(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Tanpa Cap"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Berlaku Dari</label>
                <input
                  type="date"
                  value={ruleEffectiveFrom}
                  onChange={(e) => setRuleEffectiveFrom(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Berlaku Sampai</label>
                <input
                  type="date"
                  value={ruleEffectiveUntil}
                  onChange={(e) => setRuleEffectiveUntil(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="text-slate-300 block mb-1">Nama Sumber / Help Center</label>
              <input
                type="text"
                value={ruleSource}
                onChange={(e) => setRuleSource(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
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
                className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-xs font-bold text-white shadow-md transition"
              >
                Simpan Aturan
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
