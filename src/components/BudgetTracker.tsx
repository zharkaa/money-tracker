import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Edit3, HelpCircle, Save, Send, Target } from 'lucide-react';
import { formatRupiah } from '../lib/formatters';
import { sendTestNotification } from '../lib/notifications';
import type { BudgetAlert } from '../types';

interface BudgetTrackerProps {
  budgetAlert: BudgetAlert;
  onUpdateBudget: (newLimit: number) => void;
  onRequestNotificationPermission: () => void;
  notificationPermission: NotificationPermission;
}

export const BudgetTracker: React.FC<BudgetTrackerProps> = ({
  budgetAlert,
  onUpdateBudget,
  onRequestNotificationPermission,
  notificationPermission,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputLimit, setInputLimit] = useState(String(budgetAlert.limit));
  const [testSent, setTestSent] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(inputLimit.replace(/\D/g, ''));
    if (!isNaN(val) && val >= 0) {
      onUpdateBudget(val);
      setIsEditing(false);
    }
  };

  const handleTriggerTestNotification = async () => {
    if (notificationPermission !== 'granted') {
      onRequestNotificationPermission();
      return;
    }
    const success = sendTestNotification();
    if (success) {
      setTestSent(true);
      setTimeout(() => setTestSent(false), 3000);
    }
  };

  const { status, percentage, spent, limit, remaining } = budgetAlert;
  const clampedWidth = Math.min(percentage, 100);

  // Status visual cues
  const isApproaching = status === 'approaching';
  const isExceeded = status === 'exceeded';

  let statusBadge = (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
      <CheckCircle className="w-3.5 h-3.5" /> Aman ({percentage}%)
    </span>
  );

  let barColor = 'bg-emerald-500';

  if (isApproaching) {
    statusBadge = (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 animate-pulse">
        <AlertTriangle className="w-3.5 h-3.5" /> Mendekati Batas ({percentage}%)
      </span>
    );
    barColor = 'bg-amber-500';
  } else if (isExceeded) {
    statusBadge = (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 animate-bounce">
        <AlertCircle className="w-3.5 h-3.5" /> Melebihi Batas ({percentage}%)
      </span>
    );
    barColor = 'bg-rose-600';
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Pelacakan Anggaran Bulanan</h3>
            <p className="text-xs text-slate-500">Monitor penggunaan anggaran & notifikasi otomatis</p>
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
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
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
        <form onSubmit={handleSave} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center gap-2">
          <label htmlFor="budget-input" className="text-xs font-medium text-slate-700 w-full sm:w-auto">
            Batas Anggaran Baru (Rp):
          </label>
          <input
            id="budget-input"
            type="number"
            min="0"
            step="50000"
            value={inputLimit}
            onChange={(e) => setInputLimit(e.target.value)}
            className="px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none flex-1 max-w-xs"
            placeholder="Contoh: 5000000"
          />
          <button
            type="submit"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <Save className="w-3.5 h-3.5" /> Simpan
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 rounded-lg text-xs font-medium transition-colors"
          >
            Batal
          </button>
        </form>
      )}

      {/* Progress Bar Component */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-slate-600 font-medium">
          <span>Terpakai: <strong className="text-slate-900">{formatRupiah(spent)}</strong></span>
          <span>Batas: <strong className="text-slate-900">{formatRupiah(limit)}</strong></span>
        </div>

        {/* Outer bar */}
        <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-200">
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-slate-500 pt-1">
          <div>
            {isExceeded ? (
              <span className="text-rose-600 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Melebihi anggaran sebesar {formatRupiah(spent - limit)}
              </span>
            ) : (
              <span>
                Sisa batas belanja: <strong className="text-emerald-700">{formatRupiah(remaining)}</strong>
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-400">
            {percentage < 80 ? 'Peringatan otomatis aktif di 80% & 100%' : 'Peringatan batas telah dipicu'}
          </span>
        </div>
      </div>

      {/* Threshold Alert Notification Banner */}
      {(isApproaching || isExceeded) && (
        <div
          className={`p-3.5 rounded-xl border flex items-start gap-3 ${
            isExceeded ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          {isExceeded ? (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          )}
          <div className="text-xs leading-relaxed flex-1">
            <strong className="font-semibold block text-sm">
              {isExceeded ? 'Batas Anggaran Terlampaui!' : 'Pengeluaran Mendekati Batas!'}
            </strong>
            {budgetAlert.message}
          </div>
        </div>
      )}

      {/* Footer Tools: Push Notification Tester */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          <span>
            {notificationPermission === 'granted'
              ? 'Notifikasi browser diizinkan'
              : 'Aktifkan notifikasi untuk menerima alert saat browser di latar belakang'}
          </span>
        </div>

        <button
          onClick={handleTriggerTestNotification}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          title="Kirim notifikasi uji coba"
        >
          <Send className="w-3 h-3 text-slate-500" />
          {testSent ? 'Terkirim!' : 'Tes Push Notif'}
        </button>
      </div>
    </div>
  );
};
