import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  Boxes,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  Edit2,
  RefreshCw,
} from 'lucide-react';

export const InventoryPage: React.FC = () => {
  const { inventory, updateInventoryStock, currentStore } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AMAN' | 'WASPADA' | 'KRITIS'>('ALL');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStockValue, setEditStockValue] = useState<number>(0);

  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const matchSearch =
        item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [inventory, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const totalStock = inventory.reduce((acc, i) => acc + i.currentStock, 0);
    const criticalCount = inventory.filter((i) => i.status === 'KRITIS').length;
    const warningCount = inventory.filter((i) => i.status === 'WASPADA').length;
    const safeCount = inventory.filter((i) => i.status === 'AMAN').length;

    return { totalStock, criticalCount, warningCount, safeCount };
  }, [inventory]);

  const handleStartEdit = (id: string, currentStock: number) => {
    setEditingId(id);
    setEditStockValue(currentStock);
  };

  const handleSaveStock = (id: string) => {
    updateInventoryStock(id, editStockValue);
    setEditingId(null);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Boxes className="h-6 w-6 text-amber-400" />
              <span>Manajemen Stok Otomatis & Buffer Alert</span>
            </h1>
            <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-semibold text-amber-300">
              Inventory Watchdog
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Pantau stok real-time, laju pergerakan barang (Fast vs Slow Moving), dan cegah penalti pembatalan otomatis di Shopee.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-[10px] uppercase font-bold text-slate-400">Total Stok Fisik</div>
          <div className="text-xl font-black text-white mt-0.5">{stats.totalStock} pcs</div>
          <div className="text-[10px] text-slate-500">Tersedia di gudang</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-500/30">
          <div className="text-[10px] uppercase font-bold text-rose-400">Stok Kritis</div>
          <div className="text-xl font-black text-rose-300 mt-0.5">{stats.criticalCount} SKU</div>
          <div className="text-[10px] text-rose-400/80">Habis &le; 4 hari</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30">
          <div className="text-[10px] uppercase font-bold text-amber-400">Stok Waspada</div>
          <div className="text-xl font-black text-amber-300 mt-0.5">{stats.warningCount} SKU</div>
          <div className="text-[10px] text-amber-400/80">Habis &le; 10 hari</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
          <div className="text-[10px] uppercase font-bold text-emerald-400">Stok Aman</div>
          <div className="text-xl font-black text-emerald-300 mt-0.5">{stats.safeCount} SKU</div>
          <div className="text-[10px] text-slate-400">Buffer mencukupi</div>
        </div>
      </div>

      {/* Critical Alert Ribbon */}
      {stats.criticalCount > 0 && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-950/20 p-4 text-xs text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />
            <span>
              <strong>Perhatian Kritis:</strong> Ada {stats.criticalCount} produk yang diperkirakan habis dalam 24-96 jam ke depan! Segera ajukan Purchase Order (PO) ke konveksi/supplier.
            </span>
          </div>
          <button
            onClick={() => setStatusFilter('KRITIS')}
            className="rounded-lg bg-rose-500 px-3 py-1 text-xs font-bold text-white shrink-0 hover:bg-rose-600 transition"
          >
            Filter Kritis
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/90 p-3">
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari SKU atau nama produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          <span className="text-slate-400 text-[11px] shrink-0">Status:</span>
          {(['ALL', 'KRITIS', 'WASPADA', 'AMAN'] as const).map((st) => (
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

      {/* Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold">
              <tr>
                <th className="py-3 px-4">Produk & SKU</th>
                <th className="py-3 px-4 text-center">Stok Fisik</th>
                <th className="py-3 px-4 text-center">Terjual 30 Hari</th>
                <th className="py-3 px-4 text-center">Laju Jual / Hari</th>
                <th className="py-3 px-4 text-center">Estimasi Hari Habis</th>
                <th className="py-3 px-4 text-center">Pergerakan</th>
                <th className="py-3 px-4 text-center">Rekomendasi Restock</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredInventory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4">
                    <div className="font-bold text-white text-xs">{item.productName}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {item.sku} • {item.category}
                    </div>
                  </td>

                  <td className="py-3 px-4 text-center">
                    {editingId === item.id ? (
                      <div className="flex items-center justify-center gap-1">
                        <input
                          type="number"
                          value={editStockValue}
                          onChange={(e) => setEditStockValue(Number(e.target.value))}
                          className="w-16 rounded border border-orange-500 bg-slate-950 px-1 py-0.5 text-xs text-white text-center"
                        />
                        <button
                          onClick={() => handleSaveStock(item.id)}
                          className="text-emerald-400 font-bold hover:underline text-[10px]"
                        >
                          Simpan
                        </button>
                      </div>
                    ) : (
                      <span className="font-mono font-bold text-sm text-white">
                        {item.currentStock} pcs
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-center font-mono">
                    {item.sold30Days} pcs
                  </td>

                  <td className="py-3 px-4 text-center font-mono font-semibold text-purple-300">
                    {item.dailySales} pcs / hari
                  </td>

                  <td className="py-3 px-4 text-center font-bold">
                    <span
                      className={`inline-block px-2 py-0.5 rounded font-mono ${
                        item.daysRemaining <= 4
                          ? 'bg-rose-500/20 text-rose-300'
                          : item.daysRemaining <= 10
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {item.daysRemaining} hari
                    </span>
                  </td>

                  <td className="py-3 px-4 text-center">
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-300">
                      {item.velocity}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-center font-bold">
                    {item.reorderRecommendation > 0 ? (
                      <span className="text-orange-400">+{item.reorderRecommendation} pcs</span>
                    ) : (
                      <span className="text-slate-500">-</span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black ${
                        item.status === 'AMAN'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : item.status === 'WASPADA'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleStartEdit(item.id, item.currentStock)}
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                      title="Update Stok"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
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
