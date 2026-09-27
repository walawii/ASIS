import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { getTutorialById } from '../../data/tutorials/index.ts';
import {
  X,
  BookOpen,
  ArrowRight,
  ExternalLink,
  HelpCircle,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowDownToLine,
  ListOrdered,
  FileText,
} from 'lucide-react';

export const TutorialDrawerModal: React.FC = () => {
  const {
    tutorialDrawerOpen,
    closeTutorial,
    activeTutorialId,
    setCurrentView,
  } = useApp();

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && tutorialDrawerOpen) {
        closeTutorial();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tutorialDrawerOpen, closeTutorial]);

  if (!tutorialDrawerOpen || !activeTutorialId) return null;

  const tutorial = getTutorialById(activeTutorialId);

  if (!tutorial) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center text-white">
          <HelpCircle className="mx-auto h-12 w-12 text-amber-400 mb-3" />
          <h3 className="text-lg font-bold">Tutorial Belum Tersedia</h3>
          <p className="mt-2 text-xs text-slate-400">
            Panduan untuk fitur ini sedang disiapkan. Silakan kunjungi Tutorial Center untuk melihat fitur lainnya.
          </p>
          <div className="mt-5 flex gap-2 justify-center">
            <button
              onClick={closeTutorial}
              className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700"
            >
              Tutup
            </button>
            <button
              onClick={() => {
                closeTutorial();
                setCurrentView('tutorial');
              }}
              className="rounded-xl bg-orange-500 px-4 py-2 text-xs font-semibold text-white hover:bg-orange-600"
            >
              Ke Tutorial Center
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { content } = tutorial;

  const handleOpenInCenter = () => {
    closeTutorial();
    setCurrentView('tutorial');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm transition-all animate-in fade-in duration-200">
      {/* Click outside to close */}
      <div className="flex-1 hidden md:block" onClick={closeTutorial} />

      {/* Slide-over Drawer */}
      <div className="relative flex h-full w-full max-w-2xl flex-col bg-slate-950 text-slate-100 shadow-2xl border-l border-slate-800 animate-in slide-in-from-right duration-300 overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-800 bg-slate-900/95 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {tutorial.category}
                </span>
                {tutorial.badge && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                      tutorial.badgeColor || 'bg-slate-800 text-slate-200'
                    }`}
                  >
                    {tutorial.badge}
                  </span>
                )}
                <span className="flex items-center gap-1 text-[10px] text-slate-400">
                  <Clock className="h-3 w-3" /> {tutorial.readTimeMinutes} min baca
                </span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">{tutorial.title}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenInCenter}
              title="Buka tampilan penuh di Tutorial Center"
              className="flex items-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20 transition"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Buka di Tutorial Center</span>
            </button>
            <button
              onClick={closeTutorial}
              className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              aria-label="Tutup tutorial"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 text-xs text-slate-300 leading-relaxed">
          {/* Quick Problem Callout */}
          {tutorial.commonProblemsSolved.length > 0 && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-emerald-200">
              <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-300 mb-1.5">
                <Sparkles className="h-3.5 w-3.5" /> Masalah yang Diselesaikan:
              </div>
              <ul className="space-y-1 text-[11px] list-disc list-inside text-emerald-200/90">
                {tutorial.commonProblemsSolved.map((prob, i) => (
                  <li key={i}>{prob}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Section A: Apa fungsi fitur ini? */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-slate-800 pb-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500/20 text-orange-400 text-[10px]">
                A
              </span>
              <h3>Apa fungsi fitur ini?</h3>
            </div>
            <p className="whitespace-pre-line text-slate-300 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80">
              {content.functionality}
            </p>
          </div>

          {/* Section B: Kapan fitur ini digunakan? */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-slate-800 pb-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 text-[10px]">
                B
              </span>
              <h3>Kapan fitur ini digunakan?</h3>
            </div>
            <p className="text-slate-300 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80">
              {content.whenToUse}
            </p>
          </div>

          {/* Section C: Input yang diperlukan */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-slate-800 pb-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/20 text-purple-400 text-[10px]">
                C
              </span>
              <h3>Input yang diperlukan</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {content.requiredInputs.map((input, idx) => (
                <div key={idx} className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
                  <div className="font-semibold text-slate-200 text-[11px] text-orange-400">
                    {input.name}
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400 leading-normal">{input.description}</p>
                  {input.example && (
                    <div className="mt-1.5 text-[10px] text-slate-400 font-mono bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800 inline-block">
                      Contoh: {input.example}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section D: Langkah penggunaan */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-slate-800 pb-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-[10px]">
                D
              </span>
              <h3>Langkah Penggunaan</h3>
            </div>
            <div className="space-y-2">
              {content.steps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2.5 rounded-xl border border-slate-800/70 bg-slate-900/60 p-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section E: Contoh Kasus & Simulasi */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-slate-800 pb-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 text-[10px]">
                E
              </span>
              <h3>Contoh Simulasi Nyata</h3>
            </div>
            <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 space-y-3">
              <div className="font-semibold text-amber-300 text-xs">{content.example.scenario}</div>

              {/* Input Values */}
              <div className="rounded-lg bg-slate-900/90 p-3 border border-slate-800 text-[11px] space-y-1">
                <div className="font-bold text-slate-300 mb-1">Parameter Input:</div>
                {Object.entries(content.example.inputValues).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-slate-400">
                    <span>{k}:</span>
                    <span className="font-mono text-slate-200 font-semibold">{v}</span>
                  </div>
                ))}
              </div>

              {/* Flow Waterfall */}
              {content.example.calculationFlow.length > 0 && (
                <div className="rounded-lg bg-slate-950 p-3 border border-slate-800 space-y-1 font-mono text-[11px]">
                  <div className="font-bold text-orange-400 mb-1">Alur Perhitungan:</div>
                  {content.example.calculationFlow.map((flowItem, idx) => (
                    <div
                      key={idx}
                      className={flowItem.includes('TARGET AKHIR') || flowItem.includes('Total Bersih') ? 'text-emerald-400 font-bold' : 'text-slate-300'}
                    >
                      {flowItem}
                    </div>
                  ))}
                </div>
              )}

              <div className="text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="font-semibold text-emerald-400">Hasil: </span>
                {content.example.finalResult}
              </div>
            </div>
          </div>

          {/* Section F: Cara membaca hasil */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-slate-800 pb-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 text-[10px]">
                F
              </span>
              <h3>Cara Membaca Hasil & Aksi Lanjutan</h3>
            </div>
            <div className="space-y-2">
              {content.howToReadResults.map((item, idx) => (
                <div key={idx} className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 space-y-1.5">
                  <div className="font-bold text-xs text-cyan-300">{item.metric}</div>
                  <p className="text-[11px] text-slate-300">{item.meaning}</p>
                  <div className="rounded bg-slate-950/80 p-2 text-[10px] text-emerald-300 border border-slate-800 flex items-start gap-1.5">
                    <ArrowRight className="h-3 w-3 shrink-0 text-emerald-400 mt-0.5" />
                    <span><strong>Aksi Rekomendasi:</strong> {item.actionGuide}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section G: Tips */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-slate-800 pb-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 text-[10px]">
                G
              </span>
              <h3>Tips Praktis Seller</h3>
            </div>
            <div className="space-y-1.5">
              {content.tips.map((tip, idx) => (
                <div key={idx} className="flex items-start gap-2 rounded-xl border border-slate-800 bg-slate-900/50 p-2.5 text-[11px] text-amber-200/90">
                  <Lightbulb className="h-3.5 w-3.5 shrink-0 text-amber-400 mt-0.5" />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section H: Kesalahan umum */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-slate-800 pb-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500/20 text-rose-400 text-[10px]">
                H
              </span>
              <h3>Kesalahan Umum yang Sering Terjadi</h3>
            </div>
            <div className="space-y-1.5">
              {content.commonMistakes.map((mistake, idx) => (
                <div key={idx} className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-950/20 p-2.5 text-[11px] text-rose-200">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-rose-400 mt-0.5" />
                  <span>{mistake}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 z-20 flex items-center justify-between border-t border-slate-800 bg-slate-900/95 px-6 py-3.5 backdrop-blur-md">
          <span className="text-[11px] text-slate-400">
            Formulir kalkulatormu tetap tersimpan di latar belakang.
          </span>
          <div className="flex gap-2">
            <button
              onClick={closeTutorial}
              className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
            >
              Tutup Panduan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
