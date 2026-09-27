import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { calculateTrueProfit, calculateTargetPrice } from '../../services/profitEngine/index.ts';
import { Upload, Download, FileSpreadsheet, Sparkles, CheckCircle2, AlertTriangle, FileUp } from 'lucide-react';

interface BulkPricingRow {
  sku: string;
  name: string;
  category: string;
  hpp: number;
  packing: number;
  currentPrice: number;
  targetMargin: number;
  targetRoas: number;
  // Generated Outputs
  bepPrice: number;
  recommendedPrice: number;
  maxDiscount: number;
  bepRoas: number;
  expectedProfit: number;
  expectedMargin: number;
}

export const BulkPricingCalculator: React.FC = () => {
  const { marketplaceRules, programRules, taxProfile } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [rawCsv, setRawCsv] = useState('');
  const [results, setResults] = useState<BulkPricingRow[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');

  const handleDownloadSample = () => {
    const sample = `SKU,Product Name,Category,HPP,Packing,Current Price,Target Margin,Target ROAS
GMS-PREM-01,Gamis Abaya Silk Crinkle,Fashion & Pakaian,75000,2500,169000,20,4.5
HJB-BLA-01,Bella Square Polycotton,Fashion & Pakaian,9500,800,19900,15,4.0
SRM-NIA-01,Serum Niacinamide 10%,Kecantikan & Perawatan,38000,3000,115000,25,5.0
CB-TC-01,Kabel Data 65W Braided,Elektronik & Gadget,14000,1500,39000,18,4.0
ROK-PLI-01,Rok Plisket Flare,Fashion & Pakaian,38000,1800,79000,22,4.5`;

    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'template_bulk_pricing_asis.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setRawCsv(content);
        processCsvContent(content);
      }
    };
    reader.readAsText(file);
  };

  const processCsvContent = (csvText: string) => {
    setErrorMsg('');
    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length <= 1) {
      setErrorMsg('Data CSV harus memiliki header dan minimal 1 baris produk.');
      return;
    }

    const calculatedRows: BulkPricingRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
      if (cols.length < 6) continue;

      const sku = cols[0] || `SKU-${i}`;
      const name = cols[1] || `Produk ${i}`;
      const category = cols[2] || 'Fashion & Pakaian';
      const hpp = Number(cols[3]) || 50000;
      const packing = Number(cols[4]) || 2000;
      const currentPrice = Number(cols[5]) || 99000;
      const targetMargin = Number(cols[6]) || 18;
      const targetRoas = Number(cols[7]) || 4.5;

      // Hitung dengan True Profit Engine
      const calc = calculateTrueProfit(
        {
          originalProductPrice: currentPrice,
          sellerDiscountPercent: 0,
          vouchers: [],
          hpp,
          sellerType: 'STAR',
          category,
          isFreeShippingXtraActive: true,
          isPromoXtraActive: true,
          isPromoXtraPlusActive: false,
          isAffiliateActive: false,
          adsCostPerOrder: Math.round(currentPrice / targetRoas),
          operationalCostConfig: {
            allocationType: 'PER_ORDER',
            packingCost: packing,
            laborCost: 1500,
            warehouseCost: 0,
            electricityCost: 0,
            internetCost: 0,
            softwareCost: 0,
            rentCost: 0,
            customerServiceCost: 0,
            paymentGatewayCost: 0,
            otherCost: 0,
          },
        },
        marketplaceRules,
        programRules,
        taxProfile
      );

      // Hitung harga rekomendasi sesuai target margin menggunakan hasil kalkulasi authoritative
      const fsRule = programRules.find((r) => r.code === 'FREE_SHIPPING_XTRA');
      const pxRule = programRules.find((r) => r.code === 'PROMO_XTRA');
      const fsRate = fsRule?.categoryRules?.[category]?.rate ?? fsRule?.rate ?? 0;
      const pxRate = pxRule?.categoryRules?.[category]?.rate ?? pxRule?.rate ?? 0;
      const totalVariableRate = calc.marketplaceAdminPercent + fsRate + pxRate + calc.taxRatePercent;

      const fixedCosts = calc.orderProcessingFee + Math.round(currentPrice / targetRoas) + packing + 1500 + calc.expectedReturnCost;
      const recommendedPrice = calculateTargetPrice(hpp, fixedCosts, totalVariableRate, targetMargin);

      calculatedRows.push({
        sku,
        name,
        category,
        hpp,
        packing,
        currentPrice,
        targetMargin,
        targetRoas,
        bepPrice: calc.breakEvenPrice,
        recommendedPrice,
        maxDiscount: calc.maximumDiscountPercent,
        bepRoas: calc.breakEvenRoas,
        expectedProfit: calc.expectedNetProfit,
        expectedMargin: calc.expectedNetMargin,
      });
    }

    if (calculatedRows.length === 0) {
      setErrorMsg('Gagal memproses baris produk. Pastikan format kolom sesuai template CSV.');
    } else {
      setResults(calculatedRows);
    }
  };

  const handleDownloadResultCsv = () => {
    if (results.length === 0) return;

    let csvContent = 'SKU,Product,BEP Price,Recommended Price,Max Discount %,BEP ROAS,Target ROAS,Expected Profit,Expected Margin %\n';
    results.forEach((r) => {
      csvContent += `"${r.sku}","${r.name}",${r.bepPrice},${r.recommendedPrice},${r.maxDiscount},${r.bepRoas},${r.targetRoas},${r.expectedProfit},${r.expectedMargin}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'pricing-result.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <FileSpreadsheet className="h-6 w-6 text-orange-400" />
              <span>Bulk Price Calculator</span>
            </h1>
            <span className="rounded-full bg-orange-500/20 px-2.5 py-0.5 text-xs font-semibold text-orange-300">
              CSV Upload & Generator
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Upload CSV produk untuk menghitung BEP Price, Recommended Price, Max Discount, dan BEP ROAS secara serentak.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadSample}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-slate-200 hover:text-white transition"
          >
            <Download className="h-4 w-4 text-emerald-400" />
            <span>Download Template CSV</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 px-3 py-2 text-xs font-bold text-white shadow-lg shadow-orange-500/20 transition"
          >
            <FileUp className="h-4 w-4" />
            <span>Upload CSV File</span>
          </button>
        </div>
      </div>

      {/* Input Text Area / Drop Area */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-3 shadow-lg">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Upload atau Paste Data CSV
            </h2>
            {uploadedFileName && (
              <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300 font-mono">
                {uploadedFileName}
              </span>
            )}
          </div>
          <button
            onClick={() => {
              const sampleText = `SKU,Product Name,Category,HPP,Packing,Current Price,Target Margin,Target ROAS
GMS-PREM-01,Gamis Abaya Silk Crinkle,Fashion & Pakaian,75000,2500,169000,20,4.5
HJB-BLA-01,Bella Square Polycotton,Fashion & Pakaian,9500,800,19900,15,4.0
SRM-NIA-01,Serum Niacinamide 10%,Kecantikan & Perawatan,38000,3000,115000,25,5.0
CB-TC-01,Kabel Data 65W Braided,Elektronik & Gadget,14000,1500,39000,18,4.0
ROK-PLI-01,Rok Plisket Flare,Fashion & Pakaian,38000,1800,79000,22,4.5`;
              setRawCsv(sampleText);
              processCsvContent(sampleText);
            }}
            className="text-[11px] text-orange-400 hover:underline"
          >
            Isi Contoh 5 Produk
          </button>
        </div>

        <textarea
          rows={5}
          value={rawCsv}
          onChange={(e) => setRawCsv(e.target.value)}
          placeholder="SKU,Product Name,Category,HPP,Packing,Current Price,Target Margin,Target ROAS&#10;GMS-01,Gamis Silk,Fashion & Pakaian,75000,2500,169000,20,4.5"
          className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-orange-500"
        />

        {errorMsg && (
          <div className="text-xs text-rose-400 flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={() => processCsvContent(rawCsv)}
            className="px-6 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-xs font-bold text-white shadow-lg shadow-orange-500/20 transition active:scale-98"
          >
            Proses Kalkulasi Batch
          </button>
        </div>
      </div>

      {/* Output Results Section */}
      {results.length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">
                Hasil Kalkulasi Batch ({results.length} Produk)
              </h2>
            </div>

            <button
              onClick={handleDownloadResultCsv}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 transition self-start sm:self-auto"
            >
              <Download className="h-4 w-4" />
              <span>Download pricing-result.csv</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3 text-right">BEP Price</th>
                  <th className="py-2.5 px-3 text-right">Recommended Price</th>
                  <th className="py-2.5 px-3 text-right">Max Discount</th>
                  <th className="py-2.5 px-3 text-right">BEP ROAS</th>
                  <th className="py-2.5 px-3 text-right">Target ROAS</th>
                  <th className="py-2.5 px-3 text-right">Expected Profit</th>
                  <th className="py-2.5 px-3 text-right">Expected Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {results.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-3 font-semibold text-slate-300">{r.sku}</td>
                    <td className="py-2.5 px-3 text-white max-w-[200px] truncate" title={r.name}>{r.name}</td>
                    <td className="py-2.5 px-3 text-right text-slate-200">Rp {r.bepPrice.toLocaleString('id-ID')}</td>
                    <td className="py-2.5 px-3 text-right font-black text-emerald-400">Rp {r.recommendedPrice.toLocaleString('id-ID')}</td>
                    <td className="py-2.5 px-3 text-right text-amber-400">{r.maxDiscount}%</td>
                    <td className="py-2.5 px-3 text-right text-slate-300">{r.bepRoas}x</td>
                    <td className="py-2.5 px-3 text-right text-blue-400">{r.targetRoas}x</td>
                    <td className={`py-2.5 px-3 text-right font-bold ${r.expectedProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      Rp {r.expectedProfit.toLocaleString('id-ID')}
                    </td>
                    <td className="py-2.5 px-3 text-right text-white font-bold">{r.expectedMargin}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
