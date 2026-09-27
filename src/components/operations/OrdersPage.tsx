import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { Order, OrderStatus } from '../../types/index.ts';
import {
  ShoppingCart,
  Search,
  Filter,
  CheckCircle,
  Truck,
  RotateCcw,
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign,
} from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const { orders, currentStore } = useApp();

  const [statusFilter, setStatusFilter] = useState<OrderStatus>('Semua');
  const [searchTerm, setSearchTerm] = useState('');

  const statuses: OrderStatus[] = [
    'Semua',
    'Baru',
    'Diproses',
    'Dikirim',
    'Selesai',
    'Dibatalkan',
    'Retur',
  ];

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchStatus = statusFilter === 'Semua' || o.status === statusFilter;
      const q = searchTerm.toLowerCase();
      const matchSearch =
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerCity.toLowerCase().includes(q) ||
        o.items.some((i) => i.productName.toLowerCase().includes(q));

      return matchStatus && matchSearch;
    });
  }, [orders, statusFilter, searchTerm]);

  // Aggregate stats
  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((acc, o) => acc + o.totalPrice, 0);
    const totalProfit = orders.reduce((acc, o) => acc + o.netProfit, 0);
    const newCount = orders.filter((o) => o.status === 'Baru').length;
    const processingCount = orders.filter((o) => o.status === 'Diproses').length;
    const shippingCount = orders.filter((o) => o.status === 'Dikirim').length;

    return { totalRevenue, totalProfit, newCount, processingCount, shippingCount };
  }, [orders]);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Baru':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'Diproses':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Dikirim':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'Selesai':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Dibatalkan':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'Retur':
        return 'bg-rose-600/30 text-rose-200 border-rose-500/50 font-bold';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <ShoppingCart className="h-6 w-6 text-purple-400" />
              <span>AsisFlow Order Management</span>
            </h1>
            <span className="rounded-full bg-purple-500/20 px-2.5 py-0.5 text-xs font-semibold text-purple-300">
              Live Fulfillment
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Lacak status pesanan Shopee, margin keuntungan per resi, dan kendalikan potensi retur barang.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-[10px] uppercase font-bold text-slate-400">Pesanan Baru</div>
          <div className="text-xl font-black text-blue-400 mt-0.5">{stats.newCount} Pesanan</div>
          <div className="text-[10px] text-slate-500">Perlu konfirmasi / cetak</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-[10px] uppercase font-bold text-slate-400">Sedang Diproses</div>
          <div className="text-xl font-black text-amber-400 mt-0.5">{stats.processingCount} Pesanan</div>
          <div className="text-[10px] text-slate-500">Packing di gudang</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-[10px] uppercase font-bold text-slate-400">Dalam Pengiriman</div>
          <div className="text-xl font-black text-purple-400 mt-0.5">{stats.shippingCount} Pesanan</div>
          <div className="text-[10px] text-slate-500">Diserahkan ke kurir</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
          <div className="text-[10px] uppercase font-bold text-emerald-400">Net Profit Order</div>
          <div className="text-xl font-black text-emerald-300 mt-0.5">
            Rp {(stats.totalProfit / 1000).toFixed(0)}k
          </div>
          <div className="text-[10px] text-slate-400">Laba bersih terealisasi</div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/90 p-3">
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari No. Resi/Order, nama customer, kota..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        {/* Status Pill Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs w-full sm:w-auto">
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg font-medium transition shrink-0 ${
                statusFilter === st
                  ? 'bg-orange-500 text-white font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold">
              <tr>
                <th className="py-3 px-4">Order ID & Tanggal</th>
                <th className="py-3 px-4">Customer & Kota</th>
                <th className="py-3 px-4">Produk & Varian</th>
                <th className="py-3 px-4 text-center">Qty</th>
                <th className="py-3 px-4 text-right">Total Transaksi</th>
                <th className="py-3 px-4 text-right text-emerald-400 font-bold">Laba Bersih</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4">
                    <div className="font-bold text-white font-mono">{ord.orderNumber}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{ord.date}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-200">{ord.customerName}</div>
                    <div className="text-[10px] text-slate-400">{ord.customerCity}</div>
                  </td>
                  <td className="py-3 px-4 max-w-xs truncate">
                    {ord.items.map((item, idx) => (
                      <div key={idx} className="text-white text-xs truncate">
                        {item.productName}
                        {item.variantName && (
                          <span className="text-[10px] text-slate-400 block truncate">
                            ({item.variantName})
                          </span>
                        )}
                      </div>
                    ))}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-white">
                    {ord.items.reduce((acc, i) => acc + i.qty, 0)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-white">
                    Rp {ord.totalPrice.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold">
                    <span className={ord.netProfit > 0 ? 'text-emerald-400' : ord.netProfit === 0 ? 'text-slate-400' : 'text-rose-400'}>
                      {ord.netProfit > 0 ? '+' : ''}Rp {ord.netProfit.toLocaleString('id-ID')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(
                        ord.status
                      )}`}
                    >
                      {ord.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
