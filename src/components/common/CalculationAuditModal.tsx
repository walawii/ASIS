import React from 'react';
import { CalculationAuditStep } from '../../types/profit.ts';
import { X, BookOpen, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface CalculationAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditSteps: CalculationAuditStep[];
  productName?: string;
}

export const CalculationAuditModal: React.FC<CalculationAuditModalProps> = ({
  isOpen,
  onClose,
  auditSteps,
  productName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 my-8">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2.5 text-orange-400 mb-2">
          <BookOpen className="h-5 w-5" />
          <h2 className="text-lg font-bold text-white">Audit Perhitungan Matematika Transparan</h2>
        </div>

        <p className="text-xs text-slate-400 mb-6">
          {productName ? `Rincian audit langkah demi langkah untuk: ${productName}. ` : ''}
          Setiap angka dihitung secara deterministik mengikuti formula akuntansi resmi Shopee Indonesia & DJP 2026.
        </p>

        {/* Audit Steps Timeline */}
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
          {auditSteps.map((step) => (
            <div
              key={step.stepNumber}
              className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-black">
                    {step.stepNumber}
                  </span>
                  <span>{step.title}</span>
                </span>
                <span className="text-xs font-mono font-bold text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  Rp {step.resultValue.toLocaleString('id-ID')}
                </span>
              </div>

              <div className="text-[11px] text-slate-400">
                Formula: <span className="text-slate-300 font-medium">{step.formulaDescription}</span>
              </div>

              <div className="rounded-xl bg-slate-900/90 p-2.5 font-mono text-[11px] text-emerald-400 border border-slate-800/80">
                {step.calculationEquation}
              </div>

              {(step.ruleSource || step.notes) && (
                <div className="text-[10px] text-slate-500 flex flex-wrap items-center justify-between pt-1 gap-2 border-t border-slate-900">
                  {step.ruleSource && <span>Sumber: {step.ruleSource}</span>}
                  {step.notes && <span className="text-amber-400/90">{step.notes}</span>}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-4">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Terverifikasi sesuai aturan Shopee Help Center 25 September 2026</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-xs font-bold text-white transition"
          >
            Tutup Audit
          </button>
        </div>
      </div>
    </div>
  );
};
