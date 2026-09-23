import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Edit3, Save, Target, X } from 'lucide-react';
import { formatRupiah } from '../lib/formatters';
import type { BudgetStatusInfo } from '../lib/budget';

const BUDGET_QUICK_AMOUNTS = [500000, 1000000, 2000000, 3000000, 5000000];

interface BudgetTrackerProps {
  budgetInfo: BudgetStatusInfo;
  onUpdateBudget: (newLimit: number) => void;
}

export const BudgetTracker: React.FC<BudgetTrackerProps> = ({
  budgetInfo,
  onUpdateBudget,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputLimit, setInputLimit] = useState(String(budgetInfo.limit));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(inputLimit.replace(/\D/g, ''));
    if (!isNaN(val) && val >= 0) {
      onUpdateBudget(val);
      setIsEditing(false);
    }
  };

  const numericInput = Number(inputLimit.replace(/\D/g, '')) || 0;

  const handleQuickAdd = (chipValue: number): void => {
    setInputLimit((prevLimit) => {
    // Fall back to 0 if the string input is empty or NaN
    const currentNumber = parseFloat(prevLimit) || 0;
    const newTotal = currentNumber + chipValue;
    
    return String(newTotal);
  });
  }

  const { status, percentage, spent, limit, remaining } = budgetInfo;
  const clampedWidth = Math.min(percentage, 100);

  // Status visual cues
  const isApproaching = status === 'approaching';
  const isExceeded = status === 'exceeded';

  let statusBadge = (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/50">
      <CheckCircle className="w-3.5 h-3.5" /> Aman ({percentage}%)
    </span>
  );

  let barColor = 'bg-emerald-500';

  if (isApproaching) {
    statusBadge = (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-800/50">
        <AlertTriangle className="w-3.5 h-3.5" /> Mendekati Batas ({percentage}%)
      </span>
    );
    barColor = 'bg-amber-500';
  } else if (isExceeded) {
    statusBadge = (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-950/80 text-rose-300 border border-rose-800/50">
        <AlertCircle className="w-3.5 h-3.5" /> Melebihi Batas ({percentage}%)
      </span>
    );
    barColor = 'bg-rose-600';
  }

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800/80 p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-950/60 text-teal-400 flex items-center justify-center border border-teal-800/40">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Pelacakan Anggaran Bulanan</h3>
            <p className="text-xs text-slate-400">Monitor penggunaan batas anggaran belanja Anda</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {statusBadge}
          {!isEditing && (
            <button
              onClick={() => {
                setInputLimit(String(limit));
                setIsEditing(true);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title="Ubah Target Anggaran"
              aria-label="Ubah Target Anggaran"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Edit Budget Form */}
      {isEditing && (
        <form onSubmit={handleSave} className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="budget-input" className="text-xs font-semibold text-slate-300">
              Batas Anggaran Baru (Rp):
            </label>
            {numericInput > 0 && (
              <span className="text-xs font-bold text-teal-400 bg-teal-950/80 px-2 py-0.5 rounded-md border border-teal-800/60">
                {formatRupiah(numericInput)}
              </span>
            )}
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-bold text-sm">
              Rp
            </div>
            <input
              id="budget-input"
              type="text"
              inputMode="numeric"
              value={inputLimit ? Number(inputLimit).toLocaleString('id-ID') : ''}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, '');
                setInputLimit(raw);
              }}
              className="w-full pl-12 pr-4 py-2.5 text-base font-bold bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none text-white placeholder:text-slate-500 transition-all"
              placeholder="Contoh: 5.000.000"
            />
          </div>

          {/* Quick Amount Chips */}
          <div className="flex flex-wrap gap-1.5">
            {BUDGET_QUICK_AMOUNTS.map((quick) => (
              <button
                key={quick}
                type="button"
                onClick={() => handleQuickAdd(quick)}
                className={`text-[11px] font-medium px-2 py-1 rounded-lg border transition-colors ${
                  numericInput === quick
                    ? 'border-teal-600 bg-teal-900/60 text-teal-300'
                    : 'border-slate-700 bg-slate-800 hover:bg-slate-700 hover:border-slate-600 text-slate-300 hover:text-white'
                }`}
              >
                {formatRupiah(quick)}
              </button>
            ))}
            {numericInput > 0 && (
              <button
                type="button"
                onClick={() => setInputLimit('')}
                className="text-[11px] font-medium px-2 py-1 rounded-lg border border-rose-800/60 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 transition-colors"
              >
                Reset
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
            >
              <Save className="w-3.5 h-3.5" /> Simpan
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-1.5 px-3 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-xl text-xs font-medium transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Batal
            </button>
          </div>
        </form>
      )}

      {/* Progress Bar Component */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-slate-400 font-medium">
          <span>Terpakai: <strong className="text-slate-200">{formatRupiah(spent)}</strong></span>
          <span>Batas: <strong className="text-slate-200">{formatRupiah(limit)}</strong></span>
        </div>

        {/* Outer bar */}
        <div className="w-full bg-slate-800 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-700">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`}
            style={{ width: `${clampedWidth}%` }}
            role="progressbar"
            aria-valuenow={percentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progress Anggaran"
          />
        </div>

        {/* Details & Remaining */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-slate-400 pt-1">
          <div>
            {isExceeded ? (
              <span className="text-rose-400 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Melebihi anggaran sebesar {formatRupiah(spent - limit)}
              </span>
            ) : (
              <span>
                Sisa batas belanja: <strong className="text-emerald-400">{formatRupiah(remaining)}</strong>
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-500">
            Target per bulan
          </span>
        </div>
      </div>

      {/* Threshold Alert Banner */}
      {(isApproaching || isExceeded) && (
        <div
          className={`p-3.5 rounded-xl border flex items-start gap-3 ${
            isExceeded ? 'bg-rose-950/40 border-rose-800/60 text-rose-200' : 'bg-amber-950/40 border-amber-800/60 text-amber-200'
          }`}
        >
          {isExceeded ? (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          )}
          <div className="text-xs leading-relaxed flex-1">
            <strong className="font-semibold block text-sm">
              {isExceeded ? 'Batas Anggaran Terlampaui!' : 'Pengeluaran Mendekati Batas!'}
            </strong>
            {budgetInfo.message}
          </div>
        </div>
      )}
    </div>
  );
};
