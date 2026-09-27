import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  FileSpreadsheet,
  Download,
  Printer,
  CheckCircle2,
  Calendar,
  Layers,
  TrendingUp,
} from 'lucide-react';

export const ReportsExportPage: React.FC = () => {
  const { products, orders, campaigns, inventory, currentStore } = useApp();

  const [selectedReportType, setSelectedReportType] = useState<
    'product_profit' | 'daily_sales' | 'campaign_ads' | 'inventory_status' | 'monthly_summary'
  >('product_profit');

  const [datePeriod, setDatePeriod] = useState('September 2026');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Generate real CSV and trigger download
  const handleExportCsv = () => {
    let csvContent = '';
    let filename = `ASIS_${selectedReportType}_${Date.now()}.csv`;

    if (selectedReportType === 'product_profit') {
      csvContent = 'Nama Produk,SKU,Kategori,HPP,Harga Jual,Terjual,Omzet,Net Profit,Margin %,Status\n';
      products.forEach((p) => {
        csvContent += `"${p.name}","${p.sku}","${p.category}",${p.hpp},${p.sellingPrice},${p.unitsSold},${p.revenue},${p.netProfit},${p.marginPercent.toFixed(1)},${p.status}\n`;
      });
    } else if (selectedReportType === 'campaign_ads') {
      csvContent = 'Nama Campaign,Tipe,Budget Harian,Biaya,Omzet,Target ROAS,Actual ROAS,Net Profit,Status\n';
      campaigns.forEach((c) => {
        csvContent += `"${c.name}","${c.type}",${c.budgetDaily},${c.cost},${c.revenue},${c.targetRoas},${c.actualRoas},${c.profit},${c.status}\n`;
      });
    } else if (selectedReportType === 'inventory_status') {
      csvContent = 'Nama Produk,SKU,Kategori,Stok Fisik,Terjual 30 Hari,Laju per Hari,Hari Tersisa,Status,Rekomendasi PO\n';
      inventory.forEach((i) => {
        csvContent += `"${i.productName}","${i.sku}","${i.category}",${i.currentStock},${i.sold30Days},${i.dailySales},${i.daysRemaining},${i.status},${i.reorderRecommendation}\n`;
      });
    } else {
      // Order / Daily
      csvContent = 'No Order,Tanggal,Customer,Kota,Total Belanja,Laba Bersih,Status,Metode Bayar\n';
      orders.forEach((o) => {
        csvContent += `"${o.orderNumber}","${o.date}","${o.customerName}","${o.customerCity}",${o.totalPrice},${o.netProfit},${o.status},"${o.paymentMethod}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <FileSpreadsheet className="h-6 w-6 text-emerald-400" />
              <span>Laporan Finansial & Export Data</span>
            </h1>
            <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
              CSV / Excel / PDF
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Ekspor rekap keuntungan bersih, audit biaya iklan, dan pembukuan stok untuk pelaporan pajak & operasional tim.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Report Config */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-lg">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800">
              Pilih Jenis Laporan
            </h2>

            <div className="space-y-2">
              {[
                { id: 'product_profit', title: 'Laporan Laba Rugi per Produk (P&L SKU)', desc: 'Rincian omzet, HPP, fee Shopee, dan margin per SKU' },
                { id: 'campaign_ads', title: 'Laporan Audit Iklan & ROAS Campaign', desc: 'Evaluasi biaya ads vs revenue per campaign Shopee' },
                { id: 'inventory_status', title: 'Laporan Stok & Forecast Reorder', desc: 'Daftar stok kritis, run-out date, dan rekomendasi PO' },
                { id: 'daily_sales', title: 'Laporan Pesanan & AsisFlow Fulfillment', desc: 'Histori transaksi, nama pembeli, dan profit per resi' },
              ].map((rep) => (
                <div
                  key={rep.id}
                  onClick={() => setSelectedReportType(rep.id as any)}
                  className={`cursor-pointer p-3 rounded-xl border transition ${
                    selectedReportType === rep.id
                      ? 'border-orange-500 bg-orange-500/10'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs text-white">{rep.title}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{rep.desc}</div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Periode Laporan
              </label>
              <select
                value={datePeriod}
                onChange={(e) => setDatePeriod(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              >
                <option value="Hari Ini (Live)">Hari Ini (Live)</option>
                <option value="7 Hari Terakhir">7 Hari Terakhir</option>
                <option value="September 2026">September 2026 (Bulan Berjalan)</option>
                <option value="Agustus 2026">Agustus 2026</option>
                <option value="Tahun 2026 (YTD)">Tahun 2026 (YTD)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right: Export Actions & Preview */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-sm text-white">Preview Ringkasan Laporan</h3>
                <div className="text-xs text-slate-400">
                  Toko: <strong>{currentStore.name}</strong> • Periode: {datePeriod}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCsv}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-xs font-bold text-white shadow-lg shadow-orange-500/20 active:scale-98 transition"
                >
                  <Download className="h-4 w-4" />
                  <span>Download CSV / Excel</span>
                </button>

                <button
                  onClick={handlePrintPdf}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white transition"
                  title="Cetak atau Simpan PDF"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print PDF</span>
                </button>
              </div>
            </div>

            {downloadSuccess && (
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-3 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>File laporan CSV berhasil diunduh ke perangkat Anda!</span>
              </div>
            )}

            {/* Quick Preview Table */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 overflow-x-auto text-xs">
              <div className="font-bold text-slate-400 text-[10px] uppercase mb-2">
                5 Baris Teratas Cuplikan Data:
              </div>
              <table className="w-full text-left text-slate-300">
                <thead className="text-[10px] text-slate-400 uppercase border-b border-slate-800">
                  <tr>
                    <th className="pb-1">Item / SKU</th>
                    <th className="pb-1 text-right">Revenue</th>
                    <th className="pb-1 text-right">Net Profit</th>
                    <th className="pb-1 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {products.slice(0, 5).map((p) => (
                    <tr key={p.id}>
                      <td className="py-1.5 font-medium text-white">{p.name}</td>
                      <td className="py-1.5 text-right font-mono">
                        Rp {p.revenue.toLocaleString('id-ID')}
                      </td>
                      <td className="py-1.5 text-right font-mono font-bold text-emerald-400">
                        Rp {p.netProfit.toLocaleString('id-ID')}
                      </td>
                      <td className="py-1.5 text-center">
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-800 text-slate-300">
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
