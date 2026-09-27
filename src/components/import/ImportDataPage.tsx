import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { Product } from '../../types/index.ts';
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  FileText,
} from 'lucide-react';

export const ImportDataPage: React.FC = () => {
  const { currentStore, importProductsFromCsv, setCurrentView } = useApp();

  const [csvRawText, setCsvRawText] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [parsedPreview, setParsedPreview] = useState<any[]>([]);
  const [importSuccess, setImportSuccess] = useState(false);

  // Template CSV Download
  const handleDownloadTemplate = () => {
    const template = `Nama Produk,SKU,Kategori,HPP,Harga Jual,Stok,Biaya Ads,Diskon Persen
Gamis Abaya Ceruty,GMS-CRT-01,Gamis & Abaya,75000,165000,100,12000,10
Hijab Pashmina Silk,PAS-SLK-01,Jilbab Segi Empat,22000,45000,150,5000,5
Blouse Katun Premium,BLS-KTN-01,Tunik & Blouse,55000,119000,80,10000,8`;

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'template_import_produk_asis.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleValidateAndParse = () => {
    const errors: string[] = [];
    if (!csvRawText.trim()) {
      errors.push('Teks atau file CSV masih kosong.');
      setValidationErrors(errors);
      return;
    }

    const lines = csvRawText.trim().split('\n');
    if (lines.length <= 1) {
      errors.push('CSV harus memiliki header dan minimal 1 baris data.');
      setValidationErrors(errors);
      return;
    }

    const previewItems: any[] = [];

    // Parse lines (skipping header)
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map((p) => p.trim().replace(/^"|"$/g, ''));
      if (parts.length < 5) {
        errors.push(`Baris ${i + 1}: Kolom tidak lengkap (minimal 5 kolom).`);
        continue;
      }

      const name = parts[0];
      const sku = parts[1];
      const category = parts[2];
      const hpp = Number(parts[3]);
      const price = Number(parts[4]);
      const stock = Number(parts[5] || 50);
      const ads = Number(parts[6] || 0);
      const disc = Number(parts[7] || 0);

      if (!name) errors.push(`Baris ${i + 1}: Nama produk wajib diisi.`);
      if (!sku) errors.push(`Baris ${i + 1}: SKU wajib diisi.`);
      if (isNaN(hpp) || hpp <= 0) errors.push(`Baris ${i + 1}: HPP harus angka valid > 0.`);
      if (isNaN(price) || price <= 0) errors.push(`Baris ${i + 1}: Harga jual harus angka valid > 0.`);
      if (price < hpp) errors.push(`Baris ${i + 1}: Peringatan - Harga jual lebih rendah dari HPP!`);

      previewItems.push({
        name,
        sku,
        category: category || 'Umum',
        hpp,
        price,
        stock,
        ads,
        disc,
      });
    }

    setValidationErrors(errors);
    setParsedPreview(previewItems);
  };

  const handleExecuteImport = () => {
    if (parsedPreview.length === 0 || validationErrors.length > 0) return;

    const newProducts: Product[] = parsedPreview.map((item, idx) => {
      const effPrice = item.price * (1 - item.disc / 100);
      const totalFee = effPrice * ((currentStore.defaultAdminFeePercent + currentStore.defaultServiceFeePercent + currentStore.defaultPaymentFeePercent) / 100);
      const netProfit = effPrice - item.hpp - totalFee - item.ads - 4000;
      const margin = effPrice > 0 ? (netProfit / effPrice) * 100 : 0;
      const roas = item.ads > 0 ? effPrice / item.ads : 4.0;
      const bepRoas = netProfit + item.ads > 0 ? effPrice / (netProfit + item.ads) : 2.5;

      return {
        id: `prod_imp_${Date.now()}_${idx}`,
        storeId: currentStore.id,
        sku: item.sku,
        name: item.name,
        category: item.category,
        hpp: item.hpp,
        sellingPrice: item.price,
        discountPercent: item.disc,
        effectivePrice: effPrice,
        packingCost: 2500,
        operationalCost: 1500,
        weightGrams: 200,
        adminFeePercent: currentStore.defaultAdminFeePercent,
        serviceFeePercent: currentStore.defaultServiceFeePercent,
        transactionFeePercent: currentStore.defaultPaymentFeePercent,
        affiliatePercent: currentStore.defaultAffiliateFeePercent,
        voucherNominal: 0,
        cashbackNominal: 0,
        shippingSubsidy: 0,
        currentAdsCost: item.ads,
        targetRoas: currentStore.defaultTargetRoas,
        stock: item.stock,
        safetyStock: 15,
        dailySalesVelocity: 3,
        rating: 4.9,
        reviewCount: 12,
        unitsSold: 20,
        revenue: effPrice * 20,
        netProfit: netProfit * 20,
        marginPercent: margin,
        actualRoas: roas,
        bepRoas: bepRoas,
        status: netProfit > 0 ? 'PROFITABLE' : 'LOSS',
        score: {
          overall: 80,
          marginStatus: margin >= 15 ? 'Good' : 'Fair',
          roasStatus: 'Good',
          stockStatus: 'Good',
          salesVelocity: 'Moderate',
        },
        variants: [],
      };
    });

    importProductsFromCsv(newProducts);
    setImportSuccess(true);
    setParsedPreview([]);
    setCsvRawText('');
    setTimeout(() => {
      setImportSuccess(false);
      setCurrentView('product-analytics');
    }, 2500);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Upload className="h-6 w-6 text-orange-400" />
              <span>Import Data Massal (CSV / Excel)</span>
            </h1>
            <span className="rounded-full bg-orange-500/20 px-2.5 py-0.5 text-xs font-semibold text-orange-300">
              Validasi Otomatis
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Import daftar produk, HPP modal, harga jual, dan stok massal langsung ke pembukuan ASIS SELLER.
          </p>
        </div>

        <button
          onClick={handleDownloadTemplate}
          className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-slate-200 hover:text-white transition self-start sm:self-auto"
        >
          <Download className="h-4 w-4 text-emerald-400" />
          <span>Download Template CSV</span>
        </button>
      </div>

      {importSuccess && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-4 text-xs text-emerald-300 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <span>
            <strong>Berhasil!</strong> Data produk berhasil di-import ke katalog toko Anda. Mengalihkan ke Analisis Produk...
          </span>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Input Textarea or File drop */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-lg">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Paste Konten CSV atau Isi Baris Data
              </h2>
              <button
                onClick={() =>
                  setCsvRawText(`Nama Produk,SKU,Kategori,HPP,Harga Jual,Stok,Biaya Ads,Diskon Persen
Kemeja Linen Sage,KEM-SGE-01,Pakaian Wanita,65000,129000,120,10000,5
Dress Silk Champagne,DRS-CHM-01,Gamis & Abaya,90000,199000,75,15000,10`)
                }
                className="text-[11px] text-orange-400 hover:underline"
              >
                Isi Contoh Demo
              </button>
            </div>

            <div>
              <textarea
                rows={10}
                value={csvRawText}
                onChange={(e) => setCsvRawText(e.target.value)}
                placeholder="Nama Produk,SKU,Kategori,HPP,Harga Jual,Stok,Biaya Ads,Diskon Persen&#10;Gamis Abaya Ceruty,GMS-CRT-01,Gamis,75000,165000,100,12000,10"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-orange-500 leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-500">
                Format: Nama, SKU, Kategori, HPP, Harga, Stok, Ads, Diskon%
              </span>

              <button
                onClick={handleValidateAndParse}
                className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-xs font-bold text-white shadow-md transition"
              >
                Validasi Data CSV
              </button>
            </div>
          </div>
        </div>

        {/* Right: Validation & Preview */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800">
              Hasil Validasi & Preview Import
            </h2>

            {/* Validation errors */}
            {validationErrors.length > 0 && (
              <div className="rounded-xl border border-rose-500/40 bg-rose-950/20 p-3 text-xs text-rose-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-rose-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Ditemukan Error Validasi:</span>
                </div>
                {validationErrors.map((err, i) => (
                  <div key={i} className="text-[11px]">• {err}</div>
                ))}
              </div>
            )}

            {/* Preview table */}
            {parsedPreview.length > 0 && validationErrors.length === 0 && (
              <div className="space-y-3">
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>{parsedPreview.length} baris data valid dan siap di-import!</span>
                </div>

                <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 p-2 text-xs">
                  <table className="w-full text-left text-slate-300">
                    <thead className="text-[10px] text-slate-400 uppercase border-b border-slate-800">
                      <tr>
                        <th className="p-1.5">SKU / Nama</th>
                        <th className="p-1.5 text-right">HPP</th>
                        <th className="p-1.5 text-right">Harga</th>
                        <th className="p-1.5 text-center">Stok</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {parsedPreview.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-1.5">
                            <div className="font-bold text-white">{item.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{item.sku}</div>
                          </td>
                          <td className="p-1.5 text-right font-mono">
                            Rp {item.hpp.toLocaleString('id-ID')}
                          </td>
                          <td className="p-1.5 text-right font-mono font-bold text-emerald-400">
                            Rp {item.price.toLocaleString('id-ID')}
                          </td>
                          <td className="p-1.5 text-center font-mono">{item.stock}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  onClick={handleExecuteImport}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 transition"
                >
                  Eksekusi Import ({parsedPreview.length} Produk)
                </button>
              </div>
            )}

            {parsedPreview.length === 0 && validationErrors.length === 0 && (
              <div className="py-12 text-center text-xs text-slate-500">
                Belum ada data yang divalidasi. Masukkan data CSV di sebelah kiri dan klik Validasi.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
