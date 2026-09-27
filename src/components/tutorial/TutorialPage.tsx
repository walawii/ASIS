import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  ALL_TUTORIALS,
  TUTORIAL_CATEGORIES,
  searchTutorials,
  getTutorialById,
} from '../../data/tutorials/index.ts';
import { TutorialCategory, TutorialItem } from '../../types/tutorial.ts';
import {
  Search,
  BookOpen,
  ArrowRight,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
  ChevronRight,
  Layers,
  Flame,
  ArrowDownToLine,
  Filter,
  Check,
  Bookmark,
  Share2,
} from 'lucide-react';

export const TutorialPage: React.FC = () => {
  const { setCurrentView, activeTutorialId } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TutorialCategory>('Semua');
  const [selectedTutorialId, setSelectedTutorialId] = useState<string>(
    activeTutorialId || 'reverse-pricing'
  );
  const [completedTutorials, setCompletedTutorials] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('asis_completed_tutorials');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // If activeTutorialId changes from outside, select it
  useEffect(() => {
    if (activeTutorialId) {
      setSelectedTutorialId(activeTutorialId);
    }
  }, [activeTutorialId]);

  const toggleCompleted = (id: string) => {
    setCompletedTutorials((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem('asis_completed_tutorials', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const filteredTutorials = useMemo(() => {
    return searchTutorials(searchQuery, selectedCategory);
  }, [searchQuery, selectedCategory]);

  const activeTutorial = useMemo(() => {
    return (
      filteredTutorials.find((t) => t.id === selectedTutorialId) ||
      getTutorialById(selectedTutorialId) ||
      filteredTutorials[0] ||
      ALL_TUTORIALS[0]
    );
  }, [selectedTutorialId, filteredTutorials]);

  const quickProblemTags = [
    { label: '🎯 Target Akhir Rp 55.000', query: 'reverse pricing' },
    { label: '🔥 Core True Profit', query: 'true profit' },
    { label: '📉 Iklan Boncos & ROAS', query: 'roas' },
    { label: '💰 Kenaikan Fee Shopee', query: 'fee shopee' },
    { label: '🏷️ Diskon Aman', query: 'diskon' },
    { label: '📊 Pajak UMKM 0.5%', query: 'pajak' },
    { label: '📦 Hitung Harga Banyak SKU', query: 'bulk pricing' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-semibold text-indigo-400 border border-indigo-500/30 mb-3">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Pusat Pengetahuan & Panduan Resmi ASIS SELLER</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Tutorial ASIS
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
            Pelajari cara menggunakan setiap fitur ASIS dan memahami hasil perhitungannya.
          </p>

          {/* Search Box */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="🔍 Cari tutorial... (contoh: reverse pricing, iklan boncos, fee shopee, diskon)"
                className="w-full rounded-2xl border border-slate-700 bg-slate-950/90 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Quick Problem Problem Tags */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium mr-1">Masalah Umum:</span>
            {quickProblemTags.map((tag, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSearchQuery(tag.query);
                  setSelectedCategory('Semua');
                }}
                className="rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1 text-[11px] text-slate-300 hover:border-indigo-500/50 hover:bg-indigo-950/30 hover:text-indigo-300 transition"
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {TUTORIAL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`shrink-0 rounded-xl px-4 py-2 text-xs font-semibold transition ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'border border-slate-800 bg-slate-900/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Two-Column Layout: Sidebar of Tutorial Cards + Main Detailed Reader */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Tutorial Cards List (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1 text-xs text-slate-400">
            <span>
              Menampilkan <strong>{filteredTutorials.length}</strong> tutorial
            </span>
            <span>
              Selesai: {completedTutorials.length}/{ALL_TUTORIALS.length}
            </span>
          </div>

          <div className="space-y-2.5 max-h-[850px] overflow-y-auto pr-1">
            {filteredTutorials.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-center text-slate-400">
                <BookOpen className="mx-auto h-8 w-8 text-slate-500 mb-2" />
                <p className="text-xs">Tidak ada tutorial yang cocok dengan pencarianmu.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('Semua');
                  }}
                  className="mt-3 text-xs font-semibold text-indigo-400 hover:underline"
                >
                  Tampilkan semua tutorial
                </button>
              </div>
            ) : (
              filteredTutorials.map((tut) => {
                const isSelected = activeTutorial?.id === tut.id;
                const isDone = completedTutorials.includes(tut.id);

                return (
                  <div
                    key={tut.id}
                    onClick={() => setSelectedTutorialId(tut.id)}
                    className={`cursor-pointer rounded-2xl border p-4 transition-all duration-200 ${
                      isSelected
                        ? 'border-indigo-500 bg-gradient-to-r from-indigo-950/40 to-slate-900 text-white shadow-lg shadow-indigo-500/10'
                        : 'border-slate-800 bg-slate-900/70 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {tut.category}
                        </span>
                        {tut.badge && (
                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                              tut.badgeColor || 'bg-slate-800 text-slate-200'
                            }`}
                          >
                            {tut.badge}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        {isDone && (
                          <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-400">
                            <Check className="h-3 w-3" /> Paham
                          </span>
                        )}
                        <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
                          <Clock className="h-3 w-3" /> {tut.readTimeMinutes}m
                        </span>
                      </div>
                    </div>

                    <h3 className="mt-1.5 font-bold text-sm text-white group-hover:text-indigo-300">
                      {tut.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {tut.shortSummary}
                    </p>

                    <div className="mt-3 flex items-center justify-between text-[11px] pt-2 border-t border-slate-800/80">
                      <span className="text-slate-400">Level: {tut.difficulty}</span>
                      <span className="flex items-center gap-1 font-semibold text-indigo-400">
                        Baca panduan <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Complete Reader with Sections A through H (8 Cols) */}
        <div className="lg:col-span-8">
          {activeTutorial ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-xl space-y-8">
              {/* Reader Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-300">
                      {activeTutorial.category}
                    </span>
                    {activeTutorial.badge && (
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          activeTutorial.badgeColor || 'bg-slate-800 text-slate-200'
                        }`}
                      >
                        {activeTutorial.badge}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock className="h-3.5 w-3.5" /> {activeTutorial.readTimeMinutes} menit baca
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {activeTutorial.title}
                  </h2>
                  <p className="mt-1.5 text-sm text-slate-300 leading-relaxed max-w-2xl">
                    {activeTutorial.shortSummary}
                  </p>
                </div>

                {/* Reader Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleCompleted(activeTutorial.id)}
                    className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                      completedTutorials.includes(activeTutorial.id)
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                        : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600 hover:text-white'
                    }`}
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>
                      {completedTutorials.includes(activeTutorial.id)
                        ? 'Tandai Belum'
                        : 'Tandai Sudah Paham'}
                    </span>
                  </button>

                  {activeTutorial.featureViewId && (
                    <button
                      onClick={() => setCurrentView(activeTutorial.featureViewId!)}
                      className="flex items-center gap-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 px-4 py-2 text-xs font-bold text-white transition shadow-lg shadow-orange-500/20"
                    >
                      <span>Buka Fitur Ini</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Special Solver/Core Callout for Reverse Pricing & True Profit Engine */}
              {activeTutorial.id === 'reverse-pricing' && (
                <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-4 text-emerald-200 flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                    <ArrowDownToLine className="h-4 w-4" />
                  </div>
                  <div className="text-xs leading-relaxed">
                    <strong className="text-emerald-300 block mb-1">
                      Reverse Pricing adalah SOLVER, Bukan Kalkulator Diskon Biasa!
                    </strong>
                    Kamu memasukkan <strong>TARGET AKHIR</strong> yang ingin kamu kantongi (misal Rp 55.000), lalu ASIS menjalankan <strong>True Profit Engine</strong> secara berulang untuk mencari mundur harga listing etalase yang presisi sampai ke rupiah terakhir.
                  </div>
                </div>
              )}

              {activeTutorial.id === 'true-profit-engine' && (
                <div className="rounded-2xl border border-amber-500/40 bg-amber-950/20 p-4 text-amber-200 flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                    <Flame className="h-4 w-4" />
                  </div>
                  <div className="text-xs leading-relaxed">
                    <strong className="text-amber-300 block mb-1">
                      True Profit Engine adalah CORE / Sumber Utama Perhitungan ASIS
                    </strong>
                    Kalkulator lainnya (seperti Reverse Pricing, Bulk Pricing, dan Price Simulator) semuanya mengandalkan formula True Profit Engine agar tidak ada selisih perhitungan fee dan pajak di seluruh aplikasi.
                  </div>
                </div>
              )}

              {/* Section A: Apa fungsi fitur ini? */}
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 text-base font-bold text-white border-b border-slate-800 pb-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500/20 text-orange-400 text-xs font-black">
                    A
                  </span>
                  <h3>Apa fungsi fitur ini?</h3>
                </div>
                <div className="whitespace-pre-line text-sm text-slate-300 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 leading-relaxed">
                  {activeTutorial.content.functionality}
                </div>
              </div>

              {/* Section B: Kapan fitur ini digunakan? */}
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 text-base font-bold text-white border-b border-slate-800 pb-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 text-xs font-black">
                    B
                  </span>
                  <h3>Kapan fitur ini digunakan?</h3>
                </div>
                <div className="text-sm text-slate-300 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 leading-relaxed">
                  {activeTutorial.content.whenToUse}
                </div>
              </div>

              {/* Section C: Input yang diperlukan */}
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 text-base font-bold text-white border-b border-slate-800 pb-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/20 text-purple-400 text-xs font-black">
                    C
                  </span>
                  <h3>Input yang diperlukan</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeTutorial.content.requiredInputs.map((input, idx) => (
                    <div key={idx} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-1">
                      <div className="font-bold text-xs text-orange-400">{input.name}</div>
                      <p className="text-xs text-slate-300 leading-normal">{input.description}</p>
                      {input.example && (
                        <div className="mt-2 text-[11px] text-slate-400 font-mono bg-slate-900 p-2 rounded-lg border border-slate-800 inline-block">
                          Contoh: {input.example}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Section D: Langkah penggunaan */}
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 text-base font-bold text-white border-b border-slate-800 pb-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black">
                    D
                  </span>
                  <h3>Langkah Penggunaan</h3>
                </div>
                <div className="space-y-2.5">
                  {activeTutorial.content.steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5 text-xs sm:text-sm text-slate-200"
                    >
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400 mt-0.5" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section E: Contoh Kasus Nyata */}
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 text-base font-bold text-white border-b border-slate-800 pb-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 text-xs font-black">
                    E
                  </span>
                  <h3>Contoh Kasus & Alur Perhitungan</h3>
                </div>
                <div className="rounded-2xl border border-amber-500/30 bg-amber-950/15 p-5 space-y-4">
                  <div className="font-bold text-sm text-amber-300">
                    {activeTutorial.content.example.scenario}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                    {Object.entries(activeTutorial.content.example.inputValues).map(([k, v]) => (
                      <div key={k} className="flex justify-between border-b border-slate-800/60 pb-1">
                        <span className="text-slate-400">{k}:</span>
                        <span className="font-mono text-slate-200 font-semibold">{v}</span>
                      </div>
                    ))}
                  </div>

                  {activeTutorial.content.example.calculationFlow.length > 0 && (
                    <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-1.5 font-mono text-xs">
                      <div className="font-bold text-orange-400 mb-2">Alur Waterfall:</div>
                      {activeTutorial.content.example.calculationFlow.map((flowItem, idx) => (
                        <div
                          key={idx}
                          className={
                            flowItem.includes('TARGET AKHIR') || flowItem.includes('Total Bersih')
                              ? 'text-emerald-400 font-bold text-sm'
                              : 'text-slate-300'
                          }
                        >
                          {flowItem}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="rounded-xl bg-slate-950/80 p-3.5 border border-slate-800 text-xs text-slate-300">
                    <span className="font-bold text-emerald-400">Hasil Akhir: </span>
                    {activeTutorial.content.example.finalResult}
                  </div>
                </div>
              </div>

              {/* Section F: Cara membaca hasil */}
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 text-base font-bold text-white border-b border-slate-800 pb-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-black">
                    F
                  </span>
                  <h3>Cara Membaca Hasil & Rekomendasi Aksi</h3>
                </div>
                <div className="space-y-3">
                  {activeTutorial.content.howToReadResults.map((item, idx) => (
                    <div key={idx} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
                      <div className="font-bold text-sm text-cyan-300">{item.metric}</div>
                      <p className="text-xs text-slate-300">{item.meaning}</p>
                      <div className="rounded-xl bg-slate-900 p-3 text-xs text-emerald-300 border border-slate-800 flex items-start gap-2">
                        <ArrowRight className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                        <div>
                          <strong>Panduan Aksi Seller:</strong> {item.actionGuide}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section G: Tips */}
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 text-base font-bold text-white border-b border-slate-800 pb-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 text-xs font-black">
                    G
                  </span>
                  <h3>Tips Praktis untuk Seller</h3>
                </div>
                <div className="space-y-2">
                  {activeTutorial.content.tips.map((tip, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 rounded-2xl border border-slate-800 bg-slate-950/60 p-3 text-xs text-amber-200/90">
                      <Lightbulb className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section H: Kesalahan umum */}
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 text-base font-bold text-white border-b border-slate-800 pb-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500/20 text-rose-400 text-xs font-black">
                    H
                  </span>
                  <h3>Kesalahan Umum</h3>
                </div>
                <div className="space-y-2">
                  {activeTutorial.content.commonMistakes.map((mistake, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 rounded-2xl border border-rose-500/30 bg-rose-950/20 p-3 text-xs text-rose-200">
                      <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                      <span>{mistake}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Jump Button */}
              {activeTutorial.featureViewId && (
                <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/30 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-white text-base">Siap Mencoba di Toko Nyata?</h4>
                    <p className="text-xs text-slate-300 mt-1">
                      Buka kalkulator {activeTutorial.title} sekarang dan hitung langsung untuk produk tokomu.
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentView(activeTutorial.featureViewId!)}
                    className="shrink-0 flex items-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-orange-500/20 transition"
                  >
                    <span>Luncurkan Fitur Ini</span>
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
