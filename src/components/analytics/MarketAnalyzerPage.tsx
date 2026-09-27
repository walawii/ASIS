import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { BarChart3, TrendingUp, DollarSign, Info } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';

export const MarketAnalyzerPage: React.FC = () => {
  const [productName, setProductName] = useState('Gamis Silk Premium');
  const [category, setCategory] = useState('Gamis & Abaya');
  const [priceListInput, setPriceListInput] = useState(
    '135000, 149000, 155000, 169000, 175000, 189000, 199000, 219000, 245000'
  );
  const [ownPrice, setOwnPrice] = useState(179000);

  // Parse prices
  const prices = useMemo(() => {
    return priceListInput
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((n) => !isNaN(n) && n > 0)
      .sort((a, b) => a - b);
  }, [priceListInput]);

  const stats = useMemo(() => {
    if (prices.length === 0) return { lowest: 0, median: 0, highest: 0, minRange: 0, maxRange: 0 };
    const lowest = prices[0];
    const highest = prices[prices.length - 1];
    const mid = Math.floor(prices.length / 2);
    const median = prices.length % 2 !== 0 ? prices[mid] : (prices[mid - 1] + prices[mid]) / 2;

    // Suggested Sweet Spot Range (25th percentile to 75th percentile)
    const q1 = prices[Math.floor(prices.length * 0.25)] || lowest;
    const q3 = prices[Math.floor(prices.length * 0.75)] || highest;

    return {
      lowest,
      median,
      highest,
      minRange: q1,
      maxRange: q3,
    };
  }, [prices]);

  // Distribution Chart Data
  const distributionData = useMemo(() => {
    if (prices.length === 0) return [];
    // Group into price buckets
    const bucketSize = Math.max(10000, Math.round((stats.highest - stats.lowest) / 5));
    const buckets: { [key: string]: number } = {};

    prices.forEach((p) => {
      const bucketFloor = Math.floor(p / bucketSize) * bucketSize;
      const key = `Rp${(bucketFloor / 1000).toFixed(0)}k-${((bucketFloor + bucketSize) / 1000).toFixed(0)}k`;
      buckets[key] = (buckets[key] || 0) + 1;
    });

    return Object.entries(buckets).map(([range, count]) => ({
      range,
      count,
    }));
  }, [prices, stats]);

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-cyan-400" />
              <span>Market Price Analyzer</span>
            </h1>
            <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-xs font-semibold text-cyan-300">
              Riset Pasar Shopee
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Analisis kurva sebaran harga kompetitor di Shopee untuk menentukan posisi harga jual paling optimal.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-lg">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800">
              Input Data Sampling Pasar
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Nama Produk
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Kategori
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Sampel Harga Kompetitor di Shopee (Pisahkan dengan koma)
              </label>
              <textarea
                rows={3}
                value={priceListInput}
                onChange={(e) => setPriceListInput(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white font-mono"
              />
              <span className="text-[10px] text-slate-500 block mt-1">
                Masukkan harga dari 5-10 seller kompetitor teratas di halaman 1 pencarian Shopee.
              </span>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Rencana Harga Jual Anda Sendiri (Rp)
              </label>
              <input
                type="number"
                value={ownPrice}
                onChange={(e) => setOwnPrice(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-bold text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Right Output */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-3xl border border-cyan-500/40 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-2xl">
            <div className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3">
              Statistik Rentang Harga Pasar
            </div>

            <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-800 text-center">
              <div>
                <div className="text-[10px] text-slate-400 uppercase">Harga Terendah</div>
                <div className="text-base font-black text-rose-400 mt-1">
                  Rp {(stats.lowest / 1000).toFixed(0)}k
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase">Median (Tengah)</div>
                <div className="text-base font-black text-cyan-300 mt-1">
                  Rp {(stats.median / 1000).toFixed(0)}k
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase">Harga Tertinggi</div>
                <div className="text-base font-black text-emerald-400 mt-1">
                  Rp {(stats.highest / 1000).toFixed(0)}k
                </div>
              </div>
            </div>

            {/* Suggested Sweet Spot Range */}
            <div className="mt-4 p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30">
              <div className="text-xs text-cyan-300 font-bold uppercase">
                Rekomendasi Rentang Harga Ideal (Sweet Spot):
              </div>
              <div className="text-2xl font-black text-white mt-1">
                Rp {stats.minRange.toLocaleString('id-ID')} — Rp {stats.maxRange.toLocaleString('id-ID')}
              </div>
              <div className="text-[11px] text-slate-300 mt-1">
                Posisi harga Anda (Rp {ownPrice.toLocaleString('id-ID')}):{' '}
                <strong className={ownPrice >= stats.minRange && ownPrice <= stats.maxRange ? 'text-emerald-400' : 'text-amber-400'}>
                  {ownPrice >= stats.minRange && ownPrice <= stats.maxRange ? 'Berada di Titik Manis (Optimal)' : 'Di Luar Rentang Rata-rata'}
                </strong>
              </div>
            </div>

            {/* Price Distribution Bar Chart */}
            <div className="mt-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Grafik Distribusi Frekuensi Harga
              </h3>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distributionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                    <XAxis dataKey="range" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '10px',
                        fontSize: '11px',
                      }}
                    />
                    <Bar dataKey="count" name="Jumlah Seller" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
