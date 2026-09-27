import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { Layers, Package, TrendingUp, AlertTriangle } from 'lucide-react';

export const VariantAnalyticsPage: React.FC = () => {
  const { products } = useApp();

  const [selectedProductId, setSelectedProductId] = useState<string>(
    products[0]?.id || ''
  );

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Layers className="h-6 w-6 text-indigo-400" />
              <span>Analisis Varian Produk (Variant Analytics)</span>
            </h1>
            <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-xs font-semibold text-indigo-300">
              Profit per Size / Warna
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Temukan ukuran atau warna mana yang paling banyak menghasilkan laba bersih dan mana yang menjadi dead-stock.
          </p>
        </div>

        {/* Product Picker */}
        <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
          <span className="text-slate-400 text-[11px]">Pilih Produk:</span>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white max-w-xs truncate"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.variants.length} Varian)
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedProduct && (
        <div className="space-y-6">
          {/* Product Banner */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300">
                {selectedProduct.sku}
              </span>
              <h2 className="text-base font-bold text-white mt-1">{selectedProduct.name}</h2>
              <div className="text-xs text-slate-400 mt-0.5">
                Kategori: {selectedProduct.category} • Total Terjual: {selectedProduct.unitsSold} pcs
              </div>
            </div>

            <div className="flex items-center gap-4 text-right">
              <div>
                <div className="text-[10px] uppercase text-slate-400">Total Profit Produk</div>
                <div className="text-lg font-black text-emerald-400">
                  Rp {(selectedProduct.netProfit / 1000000).toFixed(2)} jt
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-slate-400">Margin Produk</div>
                <div className="text-lg font-black text-white">
                  {selectedProduct.marginPercent.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          {/* Variants Table */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">
                Rincian Finansial Seluruh Varian ({selectedProduct.variants.length})
              </h3>
              <span className="text-xs text-slate-400">
                Diurutkan berdasarkan kontribusi penjualan
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="py-3 px-4">Nama Varian</th>
                    <th className="py-3 px-4">SKU Varian</th>
                    <th className="py-3 px-4 text-right">HPP</th>
                    <th className="py-3 px-4 text-right">Harga Jual</th>
                    <th className="py-3 px-4 text-center">Terjual</th>
                    <th className="py-3 px-4 text-right">Revenue</th>
                    <th className="py-3 px-4 text-right text-emerald-400">Estimasi Profit</th>
                    <th className="py-3 px-4 text-center">Stok</th>
                    <th className="py-3 px-4 text-center">Status Varian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {selectedProduct.variants.map((v, idx) => {
                    const rev = v.price * v.soldCount;
                    const approxProfit = (selectedProduct.marginPercent / 100) * rev;

                    return (
                      <tr key={v.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                          {idx === 0 && (
                            <span className="text-amber-400 font-extrabold text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded">
                              ⭐ Terlaris
                            </span>
                          )}
                          <span>{v.name}</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-400">{v.sku}</td>
                        <td className="py-3 px-4 text-right font-mono">
                          Rp {v.hpp.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-semibold text-white">
                          Rp {v.price.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-orange-400">
                          {v.soldCount} pcs
                        </td>
                        <td className="py-3 px-4 text-right font-mono">
                          Rp {rev.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                          +Rp {Math.round(approxProfit).toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`font-mono font-bold px-2 py-0.5 rounded ${
                              v.stock <= 5
                                ? 'bg-rose-500/20 text-rose-300'
                                : v.stock <= 20
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-slate-800 text-slate-200'
                            }`}
                          >
                            {v.stock} pcs
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {v.stock <= 5 ? (
                            <span className="text-[10px] font-bold text-rose-400">Restock Urgen</span>
                          ) : v.soldCount > 100 ? (
                            <span className="text-[10px] font-bold text-emerald-400">Top Performer</span>
                          ) : (
                            <span className="text-[10px] text-slate-400">Stabil</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
