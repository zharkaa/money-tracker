import React, { useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Receipt,
  Search,
  Trash2,
} from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';
import { formatDateIndo, formatRupiah } from '../lib/formatters';
import type { Transaction, TransactionType } from '../types';

interface TransactionListProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onDeleteTransaction,
}) => {
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [txToDelete, setTxToDelete] = useState<Transaction | null>(null);

  const filteredTransactions = transactions.filter((tx) => {
    // Type filter
    if (filterType !== 'all' && tx.type !== filterType) {
      return false;
    }
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNote = tx.note?.toLowerCase().includes(q);
      const matchCategory = tx.category?.toLowerCase().includes(q);
      const matchAmount = String(tx.amount).includes(q);
      return matchNote || matchCategory || matchAmount;
    }
    return true;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
      {/* Title & Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Riwayat Transaksi</h3>
          <p className="text-xs text-slate-500">
            Total {filteredTransactions.length} transaksi tercatat
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              filterType === 'all'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setFilterType('income')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              filterType === 'income'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pemasukan
          </button>
          <button
            onClick={() => setFilterType('expense')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              filterType === 'expense'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pengeluaran
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari transaksi, kategori, atau nominal..."
          className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all placeholder:text-slate-400"
        />
      </div>

      {/* List Content */}
      {filteredTransactions.length === 0 ? (
        <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-xl">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
            <Receipt className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-slate-700">Belum Ada Transaksi</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? 'Tidak ada transaksi yang cocok dengan kata kunci pencarian Anda.'
              : 'Gunakan formulir di sebelah kiri untuk mencatat pemasukan atau pengeluaran pertama Anda.'}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto pr-1">
          {filteredTransactions.map((tx) => {
            const isIncome = tx.type === 'income';
            return (
              <div
                key={tx.id}
                className="py-3 px-2 flex items-center justify-between gap-3 hover:bg-slate-50/80 rounded-xl transition-colors group"
              >
                {/* Left: Icon & Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}
                  >
                    {isIncome ? (
                      <ArrowDownRight className="w-5 h-5" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {tx.category || (isIncome ? 'Pemasukan' : 'Pengeluaran')}
                      </span>
                    </div>
                    {tx.note && (
                      <p className="text-xs text-slate-500 truncate max-w-xs sm:max-w-md">
                        {tx.note}
                      </p>
                    )}
                    <span className="text-[11px] text-slate-400 font-medium">
                      {formatDateIndo(tx.date, { short: true })}
                    </span>
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span
                      className={`text-sm font-bold block ${
                        isIncome ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {isIncome ? '+' : '-'} {formatRupiah(tx.amount)}
                    </span>
                  </div>
                  <button
                    onClick={() => setTxToDelete(tx)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors opacity-70 group-hover:opacity-100"
                    title="Hapus transaksi"
                    aria-label="Hapus transaksi"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(txToDelete)}
        onClose={() => setTxToDelete(null)}
        onConfirm={() => {
          if (txToDelete) {
            onDeleteTransaction(txToDelete.id);
            setTxToDelete(null);
          }
        }}
        title="Hapus Transaksi?"
        message="Apakah Anda yakin ingin menghapus catatan transaksi ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Ya, Hapus"
        cancelText="Batal"
        isDestructive={true}
      >
        {txToDelete && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs">
            <div className="min-w-0">
              <span className="font-bold text-slate-900 block text-sm">
                {txToDelete.category || (txToDelete.type === 'income' ? 'Pemasukan' : 'Pengeluaran')}
              </span>
              {txToDelete.note && (
                <span className="text-slate-500 block text-xs truncate mt-0.5">
                  {txToDelete.note}
                </span>
              )}
              <span className="text-slate-400 text-[11px] block mt-0.5">
                {formatDateIndo(txToDelete.date)}
              </span>
            </div>
            <div className="text-right shrink-0">
              <span
                className={`font-bold text-sm block ${
                  txToDelete.type === 'income' ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {txToDelete.type === 'income' ? '+' : '-'} {formatRupiah(txToDelete.amount)}
              </span>
              <span
                className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full inline-block mt-0.5 ${
                  txToDelete.type === 'income'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {txToDelete.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
              </span>
            </div>
          </div>
        )}
      </ConfirmationModal>
    </div>
  );
};
