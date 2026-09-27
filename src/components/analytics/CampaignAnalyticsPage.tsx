import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { Campaign } from '../../types/index.ts';
import {
  Megaphone,
  Plus,
  Copy,
  Archive,
  Edit2,
  FileText,
  Target,
  TrendingUp,
  X,
  CheckCircle,
} from 'lucide-react';

export const CampaignAnalyticsPage: React.FC = () => {
  const {
    campaigns,
    addCampaign,
    updateCampaign,
    duplicateCampaign,
    archiveCampaign,
    currentStore,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'Semua' | 'Aktif' | 'Dijeda' | 'Arsip'>('Semua');
  const [selectedNotesCampaign, setSelectedNotesCampaign] = useState<Campaign | null>(null);
  const [newNotesText, setNewNotesText] = useState('');
  const [newCampaignModalOpen, setNewCampaignModalOpen] = useState(false);

  // New Campaign Form State
  const [newCampName, setNewCampName] = useState('');
  const [newCampProduct, setNewCampProduct] = useState('');
  const [newCampType, setNewCampType] = useState<Campaign['type']>('Iklan Pencarian');
  const [newCampBudget, setNewCampBudget] = useState(50000);
  const [newCampTargetRoas, setNewCampTargetRoas] = useState(4.5);
  const [newCampNotes, setNewCampNotes] = useState('');

  const filteredCampaigns = campaigns.filter((c) => {
    if (activeTab === 'Semua') return c.status !== 'Arsip';
    return c.status === activeTab;
  });

  const handleOpenNotes = (c: Campaign) => {
    setSelectedNotesCampaign(c);
    setNewNotesText(c.notes);
  };

  const handleSaveNotes = () => {
    if (!selectedNotesCampaign) return;
    updateCampaign(selectedNotesCampaign.id, { notes: newNotesText });
    setSelectedNotesCampaign(null);
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampName) return;

    addCampaign({
      id: `cmp_${Date.now()}`,
      storeId: currentStore.id,
      name: newCampName,
      productId: 'prod_custom',
      productName: newCampProduct || 'Katalog Pilihan',
      type: newCampType,
      budgetDaily: newCampBudget,
      targetRoas: newCampTargetRoas,
      actualRoas: 0,
      cost: 0,
      revenue: 0,
      profit: 0,
      clicks: 0,
      conversions: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '2026-12-31',
      status: 'Aktif',
      notes: newCampNotes || 'Campaign baru diinisiasi',
    });

    setNewCampaignModalOpen(false);
    setNewCampName('');
    setNewCampProduct('');
    setNewCampNotes('');
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Megaphone className="h-6 w-6 text-amber-400" />
              <span>Histori & Catatan Campaign Shopee Ads</span>
            </h1>
            <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-semibold text-amber-300">
              {campaigns.length} Campaign
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Pantau ROAS aktual, alokasi anggaran, histori evaluasi harian, dan duplikasi strategi iklan yang berhasil.
          </p>
        </div>

        <button
          onClick={() => setNewCampaignModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-orange-500/20 active:scale-98 transition self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah / Catat Campaign</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs">
        {(['Semua', 'Aktif', 'Dijeda', 'Arsip'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-xl font-medium transition ${
              activeTab === tab
                ? 'bg-orange-500 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Campaign List */}
      <div className="space-y-4">
        {filteredCampaigns.map((camp) => (
          <div
            key={camp.id}
            className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg space-y-4 hover:border-slate-700 transition"
          >
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-300">
                    {camp.type}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      camp.status === 'Aktif'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : camp.status === 'Dijeda'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {camp.status}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {camp.startDate} s/d {camp.endDate}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-white mt-1">{camp.name}</h3>
                <div className="text-xs text-slate-400">Produk: {camp.productName}</div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => duplicateCampaign(camp.id)}
                  className="flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-700 transition"
                  title="Duplikat campaign ini"
                >
                  <Copy className="h-3.5 w-3.5 text-blue-400" />
                  <span>Duplikat</span>
                </button>
                <button
                  onClick={() => handleOpenNotes(camp)}
                  className="flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-700 transition"
                  title="Lihat atau edit catatan strategi"
                >
                  <FileText className="h-3.5 w-3.5 text-amber-400" />
                  <span>Catatan</span>
                </button>
                {camp.status !== 'Arsip' && (
                  <button
                    onClick={() => archiveCampaign(camp.id)}
                    className="flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-400 hover:text-rose-400 hover:bg-slate-700 transition"
                    title="Arsipkan"
                  >
                    <Archive className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Metrics Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 py-3 border-y border-slate-800/80 text-xs">
              <div>
                <div className="text-[10px] text-slate-400">Budget Harian</div>
                <div className="font-bold text-white">
                  Rp {camp.budgetDaily.toLocaleString('id-ID')}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-slate-400">Total Biaya</div>
                <div className="font-bold text-rose-400">
                  Rp {camp.cost.toLocaleString('id-ID')}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-slate-400">Omzet Iklan</div>
                <div className="font-bold text-white">
                  Rp {camp.revenue.toLocaleString('id-ID')}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-slate-400">Target ROAS</div>
                <div className="font-bold text-purple-400">{camp.targetRoas}x</div>
              </div>

              <div>
                <div className="text-[10px] text-slate-400">Actual ROAS</div>
                <div
                  className={`font-black text-sm ${
                    camp.actualRoas >= camp.targetRoas
                      ? 'text-emerald-400'
                      : camp.actualRoas >= 2.5
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {camp.actualRoas}x
                </div>
              </div>

              <div>
                <div className="text-[10px] text-slate-400">Laba Bersih Iklan</div>
                <div
                  className={`font-black ${
                    camp.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {camp.profit >= 0 ? '+' : ''}Rp {camp.profit.toLocaleString('id-ID')}
                </div>
              </div>
            </div>

            {/* Notes preview */}
            <div className="rounded-xl bg-slate-950 p-3 text-xs text-slate-300 flex items-start gap-2 border border-slate-800/80">
              <FileText className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">Catatan & Insight Seller: </span>
                <span className="text-slate-300">{camp.notes}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Notes Modal */}
      {selectedNotesCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-sm text-white">
                Catatan Strategi: {selectedNotesCampaign.name}
              </h3>
              <button
                onClick={() => setSelectedNotesCampaign(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <textarea
              rows={4}
              value={newNotesText}
              onChange={(e) => setNewNotesText(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              placeholder="Tuliskan catatan bid kata kunci, temuan kata kunci boncos, atau evaluasi ROAS..."
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setSelectedNotesCampaign(null)}
                className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Batal
              </button>
              <button
                onClick={handleSaveNotes}
                className="px-4 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-xs font-bold text-white shadow-md transition"
              >
                Simpan Catatan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Campaign Modal */}
      {newCampaignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <form
            onSubmit={handleCreateCampaign}
            className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white">Catat Campaign Iklan Baru</h3>
              <button
                type="button"
                onClick={() => setNewCampaignModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Nama Campaign
              </label>
              <input
                type="text"
                required
                value={newCampName}
                onChange={(e) => setNewCampName(e.target.value)}
                placeholder="misal: Iklan Pencarian - Gamis Lebaran 2026"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Nama Produk
                </label>
                <input
                  type="text"
                  value={newCampProduct}
                  onChange={(e) => setNewCampProduct(e.target.value)}
                  placeholder="Gamis Abaya Silk"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Tipe Iklan
                </label>
                <select
                  value={newCampType}
                  onChange={(e) => setNewCampType(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                >
                  <option value="Iklan Pencarian">Iklan Pencarian</option>
                  <option value="Iklan Produk Serupa">Iklan Produk Serupa</option>
                  <option value="Iklan Toko">Iklan Toko</option>
                  <option value="Shopee Live">Shopee Live</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Budget Harian (Rp)
                </label>
                <input
                  type="number"
                  value={newCampBudget}
                  onChange={(e) => setNewCampBudget(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Target ROAS (x)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newCampTargetRoas}
                  onChange={(e) => setNewCampTargetRoas(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Catatan Strategi Awal
              </label>
              <textarea
                rows={3}
                value={newCampNotes}
                onChange={(e) => setNewCampNotes(e.target.value)}
                placeholder="Kata kunci yang diincar, bid per klik awal..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setNewCampaignModalOpen(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-xs font-bold text-white shadow-md transition"
              >
                Simpan Campaign
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
