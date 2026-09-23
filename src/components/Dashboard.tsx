import React from 'react';
import { ArrowDownRight, ArrowUpRight, Calendar, PiggyBank, WalletCards } from 'lucide-react';
import { formatRupiah } from '../lib/formatters';

interface DashboardProps {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  budgetLimit: number;
  remainingBudget: number;
  selectedMonth: string; // "YYYY-MM" or "all"
  onMonthChange: (month: string) => void;
  availableMonths: string[];
}

export const Dashboard: React.FC<DashboardProps> = ({
  totalIncome,
  totalExpense,
  netBalance,
  budgetLimit,
  remainingBudget,
  selectedMonth,
  onMonthChange,
  availableMonths,
}) => {
  return (
    <div className="space-y-4">
      {/* Month Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800/80 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-white">Ringkasan Keuangan</h2>
          <p className="text-xs text-slate-400">Ikhtisar pemasukan, pengeluaran, dan saldo Anda</p>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <select
            value={selectedMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            className="text-xs font-medium bg-slate-800/90 border border-slate-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-200"
            aria-label="Pilih Periode Bulan"
          >
            <option value="all">Semua Waktu</option>
            {availableMonths.map((m) => {
              const [y, mo] = m.split('-');
              const label = new Intl.DateTimeFormat('id-ID', {
                month: 'long',
                year: 'numeric',
              }).format(new Date(Number(y), Number(mo) - 1, 1));
              return (
                <option key={m} value={m}>
                  {label}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800/80 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Pemasukan
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-950/60 text-emerald-400 flex items-center justify-center border border-emerald-800/40">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-bold text-emerald-400 tracking-tight">
              {formatRupiah(totalIncome)}
            </h3>
            <p className="text-xs text-emerald-500/80 mt-1 flex items-center gap-1">
              <span>Dana masuk</span>
            </p>
          </div>
        </div>

        {/* Total Expense */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800/80 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Pengeluaran
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-950/60 text-rose-400 flex items-center justify-center border border-rose-800/40">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-bold text-rose-400 tracking-tight">
              {formatRupiah(totalExpense)}
            </h3>
            <p className="text-xs text-rose-500/80 mt-1 flex items-center gap-1">
              <span>Dana terpakai</span>
            </p>
          </div>
        </div>

        {/* Net Balance */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800/80 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Saldo Bersih
            </span>
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                netBalance >= 0
                  ? 'bg-indigo-950/60 text-indigo-400 border-indigo-800/40'
                  : 'bg-rose-950/60 text-rose-400 border-rose-800/40'
              }`}
            >
              <WalletCards className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3
              className={`text-xl font-bold tracking-tight ${
                netBalance >= 0 ? 'text-indigo-300' : 'text-rose-400'
              }`}
            >
              {formatRupiah(netBalance)}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {netBalance >= 0 ? 'Surplus keuangan' : 'Defisit (Pengeluaran > Pemasukan)'}
            </p>
          </div>
        </div>

        {/* Budget Remaining */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800/80 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Sisa Anggaran
            </span>
            <div className="w-9 h-9 rounded-xl bg-teal-950/60 text-teal-400 flex items-center justify-center border border-teal-800/40">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3
              className={`text-xl font-bold tracking-tight ${
                remainingBudget <= 0 && budgetLimit > 0 ? 'text-rose-400' : 'text-teal-400'
              }`}
            >
              {formatRupiah(remainingBudget)}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Dari batas {formatRupiah(budgetLimit)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
