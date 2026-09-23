import React, { useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle, Calendar, PlusCircle, Tag } from 'lucide-react';
import { formatRupiah, getTodayDateString } from '../lib/formatters';
import type { Transaction, TransactionType } from '../types';

interface TransactionFormProps {
  onAddTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
}

const COMMON_EXPENSE_CATEGORIES = [
  'Makanan & Minuman',
  'Transportasi',
  'Belanja & Kebutuhan',
  'Tagihan & Utilitas',
  'Hiburan',
  'Kesehatan',
  'Lainnya',
];

const COMMON_INCOME_CATEGORIES = [
  'Gaji Pokok',
  'Bonus & Tunjangan',
  'Investasi',
  'Bisnis / Sampingan',
  'Hadiah / Hibah',
  'Lainnya',
];

const QUICK_AMOUNTS = [10000, 50000, 100000, 500000, 1000000];

export const TransactionForm: React.FC<TransactionFormProps> = ({ onAddTransaction }) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayDateString());
  const [category, setCategory] = useState<string>('Makanan & Minuman');
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Switch default category when toggling type
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setCategory(newType === 'expense' ? 'Makanan & Minuman' : 'Gaji Pokok');
  };

  const handleQuickAdd = (increment: number) => {
    const current = Number(amount.replace(/\D/g, '')) || 0;
    setAmount(String(current + increment));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = Number(amount.replace(/\D/g, ''));

    if (!parsedAmount || parsedAmount <= 0) {
      setError('Masukkan jumlah nominal yang valid (lebih dari 0).');
      return;
    }

    if (!date) {
      setError('Pilih tanggal transaksi.');
      return;
    }

    setError(null);
    onAddTransaction({
      type,
      amount: parsedAmount,
      date,
      category,
      note: note.trim() || undefined,
    });

    // Reset amount and note
    setAmount('');
    setNote('');
  };

  const numericAmount = Number(amount.replace(/\D/g, '')) || 0;

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800/80 p-5 shadow-sm space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-white text-base">Catat Transaksi Baru</h3>
          <p className="text-xs text-slate-400">Input pemasukan atau pengeluaran Anda</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Toggle Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-800/80 rounded-xl border border-slate-700/60">
          <button
            type="button"
            onClick={() => handleTypeChange('expense')}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
              type === 'expense'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowUpCircle className="w-4 h-4" /> Pengeluaran
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('income')}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
              type === 'income'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowDownCircle className="w-4 h-4" /> Pemasukan
          </button>
        </div>

        {/* Amount Input */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label htmlFor="tx-amount" className="text-xs font-semibold text-slate-300">
              Nominal (Rupiah) <span className="text-rose-500">*</span>
            </label>
            {numericAmount > 0 && (
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-800/60">
                {formatRupiah(numericAmount)}
              </span>
            )}
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-bold text-sm">
              Rp
            </div>
            <input
              id="tx-amount"
              type="text"
              inputMode="numeric"
              value={amount ? Number(amount).toLocaleString('id-ID') : ''}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, '');
                setAmount(raw);
              }}
              placeholder="0"
              className="w-full pl-12 pr-4 py-2.5 text-base font-bold bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:bg-slate-850 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all placeholder:text-slate-500"
              required
            />
          </div>

          {/* Quick Amount Chips */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {QUICK_AMOUNTS.map((quick) => (
              <button
                key={quick}
                type="button"
                onClick={() => handleQuickAdd(quick)}
                className="text-[11px] font-medium px-2 py-1 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 hover:border-slate-600 text-slate-300 hover:text-white transition-colors"
              >
                +{formatRupiah(quick)}
              </button>
            ))}
            {numericAmount > 0 && (
              <button
                type="button"
                onClick={() => setAmount('')}
                className="text-[11px] font-medium px-2 py-1 rounded-lg border border-rose-800/60 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Date Input */}
        <div className="space-y-1.5">
          <label htmlFor="tx-date" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            Tanggal <span className="text-rose-500">*</span>
          </label>
          <input
            id="tx-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all [color-scheme:dark]"
            required
          />
        </div>

        {/* Category Selection */}
        <div className="space-y-1.5">
          <label htmlFor="tx-category" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-slate-500" />
            Kategori
          </label>
          <select
            id="tx-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all [color-scheme:dark]"
          >
            {(type === 'expense' ? COMMON_EXPENSE_CATEGORIES : COMMON_INCOME_CATEGORIES).map(
              (cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              )
            )}
          </select>
        </div>

        {/* Note / Description (Optional) */}
        <div className="space-y-1.5">
          <label htmlFor="tx-note" className="text-xs font-semibold text-slate-300">
            Catatan (Opsional)
          </label>
          <input
            id="tx-note"
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Contoh: Belanja mingguan di pasar / Bonus proyek"
            className="w-full px-3.5 py-2 text-sm bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all placeholder:text-slate-500"
          />
        </div>

        {/* Error message */}
        {error && (
          <p className="text-xs text-rose-200 bg-rose-950/60 p-2.5 rounded-lg border border-rose-800/60">
            {error}
          </p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className={`w-full py-2.5 rounded-xl font-bold text-sm text-white shadow-sm flex items-center justify-center gap-2 transition-all ${
            type === 'expense'
              ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
              : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          Simpan {type === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
        </button>
      </form>
    </div>
  );
};
