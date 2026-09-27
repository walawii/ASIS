import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { TaxProfile } from '../../types/rules.ts';
import { calculateTaxForTransaction } from '../../services/taxEngine/index.ts';
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Shield,
  HelpCircle,
  ExternalLink,
  Edit2,
  Save,
} from 'lucide-react';

export const TaxDashboardPage: React.FC = () => {
  const { products, taxProfile, setTaxProfile, taxRules } = useApp();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [taxpayerType, setTaxpayerType] = useState(taxProfile.taxpayerType);
  const [taxScheme, setTaxScheme] = useState(taxProfile.taxScheme);
  const [npwp, setNpwp] = useState(taxProfile.npwpOrNik);
  const [hasSkb, setHasSkb] = useState(taxProfile.hasSkbExemption);
  const [skbNumber, setSkbNumber] = useState(taxProfile.skbCertificateNumber || '');
  const [offlineRev, setOfflineRev] = useState(taxProfile.annualOfflineRevenue);
  const [otherMktRev, setOtherMktRev] = useState(taxProfile.annualOtherMarketplaceRevenue);

  // Store Shopee Annual Revenue (estimated from products 12x or raw)
  const shopeeAnnualRevenue = useMemo(() => {
    return products.reduce((acc, p) => acc + p.revenue, 0) * 4; // annual estimate ~4 quarters
  }, [products]);

  // Total Cumulative Annual Revenue (Shopee + Offline + Other Marketplace)
  const totalCumulativeRevenue = useMemo(() => {
    return shopeeAnnualRevenue + offlineRev + otherMktRev;
  }, [shopeeAnnualRevenue, offlineRev, otherMktRev]);

  // Tax calculation evaluation
  const taxEval = useMemo(() => {
    return calculateTaxForTransaction(shopeeAnnualRevenue, taxProfile);
  }, [shopeeAnnualRevenue, taxProfile]);

  const activeRule = taxRules.find((r) => r.taxpayerType === taxProfile.taxpayerType) || taxRules[0];
  const threshold = activeRule.annualNonTaxableThreshold;
  const pkpThreshold = activeRule.pkpThreshold;

  // Threshold remaining
  const remainingThreshold = Math.max(0, threshold - totalCumulativeRevenue);
  const isApproaching = remainingThreshold > 0 && remainingThreshold <= 75000000;
  const isExceeded = totalCumulativeRevenue > threshold && threshold > 0;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setTaxProfile({
      ...taxProfile,
      taxpayerType,
      taxScheme,
      npwpOrNik: npwp,
      hasSkbExemption: hasSkb,
      skbCertificateNumber: skbNumber,
      annualOfflineRevenue: offlineRev,
      annualOtherMarketplaceRevenue: otherMktRev,
    });
    setIsEditingProfile(false);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <FileText className="h-6 w-6 text-emerald-400" />
              <span>Tax Dashboard & Annual Revenue Tracker</span>
            </h1>
            <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
              PP 55/2022 & PMK 164
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Pelacakan omzet kumulatif wajib pajak, monitoring batas bebas pajak Rp 500 Juta, dan estimasi PPh Final UMKM.
          </p>
        </div>

        <button
          onClick={() => setIsEditingProfile(!isEditingProfile)}
          className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-200 hover:text-white transition self-start sm:self-auto"
        >
          <Edit2 className="h-4 w-4 text-orange-400" />
          <span>{isEditingProfile ? 'Batal Edit' : 'Edit Profil Pajak'}</span>
        </button>
      </div>

      {/* TAX ALERT RIBBON (Requirement R) */}
      {isExceeded ? (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-950/25 p-4 text-xs text-rose-300 flex items-start gap-3 shadow-lg">
          <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-sm text-white">
              Peringatan Kewajiban Pajak: Threshold Omzet Rp 500 Juta Terlampaui
            </div>
            <p className="mt-1 text-rose-200/90 leading-relaxed">
              Omzet kumulatif tahunan Anda (Shopee + Offline + Marketplace Lain) telah melewati batas bebas pajak Rp 500.000.000. Sesuai PP No. 55 Tahun 2022, peredaran bruto di atas batas tersebut dikenakan PPh Final UMKM sebesar 0.5%.
            </p>
          </div>
        </div>
      ) : isApproaching ? (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-950/25 p-4 text-xs text-amber-300 flex items-start gap-3 shadow-lg">
          <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-sm text-white">
              Perhatian: Omzet Anda Mendekati Batas Bebas Pajak
            </div>
            <p className="mt-1 text-amber-200/90 leading-relaxed">
              Omzet kumulatif Anda tersisa <strong>Rp {remainingThreshold.toLocaleString('id-ID')}</strong> sebelum menyentuh batas Rp 500 Juta. Periksa status perpajakan Anda dan siapkan pencatatan berkas.
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/15 p-4 text-xs text-emerald-300 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <div>
            <strong className="text-white">Status Pajak Aman (Bebas PPh Final): </strong>
            Omzet kumulatif tahunan Anda saat ini masih berada di bawah batas bebas pajak Rp 500 Juta. Sisa batas: <strong>Rp {remainingThreshold.toLocaleString('id-ID')}</strong>.
          </div>
        </div>
      )}

      {/* Edit Profile Form (Collapsible) */}
      {isEditingProfile && (
        <form
          onSubmit={handleSaveProfile}
          className="rounded-2xl border border-slate-700 bg-slate-900 p-5 space-y-4 shadow-xl animate-in fade-in"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Pengaturan Profil Wajib Pajak & Omzet Multi-Kanal
            </h2>
            <span className="text-[11px] text-slate-400">Data tersimpan lokal</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Tipe Wajib Pajak</label>
              <select
                value={taxpayerType}
                onChange={(e) => setTaxpayerType(e.target.value as any)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              >
                <option value="Individual">Orang Pribadi (WPOP UMKM)</option>
                <option value="Company">Badan Usaha (PT / CV)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Skema Pajak</label>
              <select
                value={taxScheme}
                onChange={(e) => setTaxScheme(e.target.value as any)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              >
                <option value="UMKM Final">PPh Final 0.5% (PP 55/2022)</option>
                <option value="General Income Tax">Tarif Umum Pasal 17 (Pembukuan)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">NPWP / NIK Terdaftar</label>
              <input
                type="text"
                value={npwp}
                onChange={(e) => setNpwp(e.target.value)}
                placeholder="16 digit NIK / NPWP"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">
                Omzet Toko Offline Setahun (Rp)
              </label>
              <input
                type="number"
                value={offlineRev}
                onChange={(e) => setOfflineRev(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">
                Omzet Marketplace Lain Setahun (Rp)
              </label>
              <input
                type="number"
                value={otherMktRev}
                onChange={(e) => setOtherMktRev(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Surat Keterangan Bebas (SKB)</label>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="hasSkbCheck"
                  checked={hasSkb}
                  onChange={(e) => setHasSkb(e.target.checked)}
                  className="rounded accent-orange-500"
                />
                <label htmlFor="hasSkbCheck" className="text-slate-200">
                  Memiliki SKB Resmi DJP
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditingProfile(false)}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-xs font-bold text-white shadow-md transition"
            >
              Simpan Profil Pajak
            </button>
          </div>
        </form>
      )}

      {/* ANNUAL REVENUE TRACKER (Requirement Q) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Pelacak Omzet Kumulatif Wajib Pajak (Annual Revenue Tracker)
            </h2>
            <p className="text-[11px] text-slate-400">
              Threshold pajak dihitung berdasarkan peredaran bruto kumulatif seluruh kanal bisnis, bukan hanya satu toko Shopee.
            </p>
          </div>

          <span className="text-xs font-mono font-bold text-emerald-400">
            Total: Rp {(totalCumulativeRevenue / 1000000).toFixed(1)} jt / tahun
          </span>
        </div>

        {/* Progress Bar towards 500M */}
        {threshold > 0 && (
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1.5">
              <span>Batas Bebas Pajak WPOP UMKM (PP 55/2022):</span>
              <span className="font-bold">
                Rp {(totalCumulativeRevenue / 1000000).toFixed(1)} jt / Rp {(threshold / 1000000).toFixed(0)} jt ({Math.min(100, (totalCumulativeRevenue / threshold) * 100).toFixed(1)}%)
              </span>
            </div>

            <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  totalCumulativeRevenue > threshold
                    ? 'bg-rose-500'
                    : totalCumulativeRevenue > threshold * 0.8
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, (totalCumulativeRevenue / threshold) * 100)}%` }}
              />
            </div>

            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>Rp 0</span>
              <span>Batas Bebas Pajak: Rp 500 Juta</span>
              <span>Batas PKP: Rp 4.8 Miliar</span>
            </div>
          </div>
        )}

        {/* Channel Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">Toko Shopee ({taxProfile.taxpayerType})</span>
            <div className="text-base font-black text-white mt-0.5">
              Rp {(shopeeAnnualRevenue / 1000000).toFixed(1)} jt
            </div>
            <span className="text-[10px] text-orange-400">Data live produk</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">Penjualan Offline / Toko Fisik</span>
            <div className="text-base font-black text-slate-300 mt-0.5">
              Rp {(offlineRev / 1000000).toFixed(1)} jt
            </div>
            <span className="text-[10px] text-slate-500">Pencatatan kasir</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">Marketplace Lain (Tokopedia/TikTok)</span>
            <div className="text-base font-black text-slate-300 mt-0.5">
              Rp {(otherMktRev / 1000000).toFixed(1)} jt
            </div>
            <span className="text-[10px] text-slate-500">Multi-kanal</span>
          </div>
        </div>
      </div>

      {/* ESTIMATED TAX REPORT TABLE (Requirement S) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-sm text-white">
              Laporan Estimasi Kewajiban Pajak (Estimasi PPh Final)
            </h2>
            <span className="text-[11px] text-slate-400">
              *Label: Estimasi (bukan pengganti dokumen resmi SPT/konsultasi pajak berizin)
            </span>
          </div>

          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-mono">
            Tarif: {activeRule.rate}% (PPh Final)
          </span>
        </div>

        <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 border-b border-slate-800">
          <div>
            <span className="text-[10px] uppercase text-slate-400 font-bold">Estimasi Omzet Bruto</span>
            <div className="text-lg font-black text-white mt-0.5">
              Rp {(totalCumulativeRevenue / 1000000).toFixed(1)} jt
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase text-slate-400 font-bold">Peredaran Kena Pajak</span>
            <div className="text-lg font-black text-amber-300 mt-0.5">
              Rp {(Math.max(0, totalCumulativeRevenue - threshold) / 1000000).toFixed(1)} jt
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase text-slate-400 font-bold">Tarif PPh Final</span>
            <div className="text-lg font-black text-emerald-400 mt-0.5">
              {activeRule.rate}%
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase text-slate-400 font-bold">Estimasi Beban Pajak</span>
            <div className="text-lg font-black text-rose-400 mt-0.5">
              Rp {Math.round(Math.max(0, totalCumulativeRevenue - threshold) * (activeRule.rate / 100)).toLocaleString('id-ID')}
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-950/70 text-xs text-slate-400 leading-relaxed border-t border-slate-800">
          💡 <strong>Catatan Regulasi:</strong> Sesuai PP No. 55 Tahun 2022, peredaran bruto sampai dengan Rp 500.000.000 dalam 1 tahun pajak tidak dikenai PPh Final bagi Wajib Pajak Orang Pribadi. Jika marketplace melakukan pemotongan otomatis di masa depan (withholding), bukti potong dapat dikreditkan pada pelaporan SPT Tahunan.
        </div>
      </div>
    </div>
  );
};
