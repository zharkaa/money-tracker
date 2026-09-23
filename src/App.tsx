import { useCallback, useEffect, useMemo, useState } from 'react';
import { BudgetTracker } from './components/BudgetTracker';
import { Dashboard } from './components/Dashboard';
import { Navbar } from './components/Navbar';
import { SettingsModal } from './components/SettingsModal';
import { ToastContainer } from './components/Toast';
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { evaluateBudgetStatus } from './lib/budget';
import {
  createTransaction,
  fetchBudget,
  fetchTransactions,
  getCurrentDbMode,
  initDb,
  removeTransaction,
  updateBudget,
} from './lib/db';
import { formatRupiah } from './lib/formatters';
import type { Budget, DbMode, ToastMessage, Transaction } from './types';

export function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budget, setBudget] = useState<Budget>({
    id: 'default',
    limitAmount: 5000000,
    period: 'monthly',
    updatedAt: new Date().toISOString(),
  });
  const [dbMode, setDbMode] = useState<DbMode>('local');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Default month is current year-month e.g. "2026-09"
  const currentYearMonth = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }, []);

  const [selectedMonth, setSelectedMonth] = useState<string>(currentYearMonth);

  // Toast dispatch helper
  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Load Database and Initial Data for manual refresh
  const loadData = useCallback(async () => {
    try {
      const dbStatus = await initDb();
      setDbMode(dbStatus.mode);

      const [txList, loadedBudget] = await Promise.all([fetchTransactions(), fetchBudget()]);
      setTransactions(txList);
      setBudget(loadedBudget);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    const initialize = async () => {
      try {
        const dbStatus = await initDb();
        if (ignore) return;
        setDbMode(dbStatus.mode);

        const [txList, loadedBudget] = await Promise.all([fetchTransactions(), fetchBudget()]);
        if (ignore) return;
        setTransactions(txList);
        setBudget(loadedBudget);
        setIsLoading(false);

        if (dbStatus.error) {
          addToast({
            type: 'warning',
            title: 'Mode Lokal Aktif',
            message: 'Belum terhubung ke Turso DB. Data Anda saat ini disimpan di penyimpanan lokal browser.',
          });
        }
      } catch (err) {
        console.error('Error initializing data:', err);
        if (!ignore) setIsLoading(false);
      }
    };

    initialize();
    return () => {
      ignore = true;
    };
  }, [addToast]);

  // Add Transaction Handler
  const handleAddTransaction = async (txData: Omit<Transaction, 'id' | 'createdAt'>) => {
    try {
      const created = await createTransaction(txData);
      setTransactions((prev) => [created, ...prev]);

      addToast({
        type: 'success',
        title: 'Transaksi Tersimpan',
        message: `${created.type === 'income' ? 'Pemasukan' : 'Pengeluaran'} sebesar ${formatRupiah(
          created.amount
        )} berhasil dicatat.`,
      });
    } catch (err) {
      console.error('Failed to add transaction:', err);
      addToast({
        type: 'danger',
        title: 'Gagal Menyimpan',
        message: 'Terjadi kesalahan saat menyimpan transaksi.',
      });
    }
  };

  // Delete Transaction Handler
  const handleDeleteTransaction = async (id: string) => {
    try {
      await removeTransaction(id);
      setTransactions((prev) => prev.filter((item) => item.id !== id));
      addToast({
        type: 'info',
        title: 'Transaksi Dihapus',
        message: 'Data transaksi telah berhasil dihapus.',
      });
    } catch (err) {
      console.error('Failed to delete transaction:', err);
    }
  };

  // Update Budget Limit Handler
  const handleUpdateBudget = async (newLimit: number) => {
    try {
      const updated = await updateBudget(newLimit);
      setBudget(updated);
      addToast({
        type: 'success',
        title: 'Anggaran Diperbarui',
        message: `Batas anggaran bulanan baru: ${formatRupiah(newLimit)}.`,
      });
    } catch (err) {
      console.error('Failed to update budget:', err);
    }
  };

  // Available months extracted from transactions
  const availableMonths = useMemo(() => {
    const monthSet = new Set<string>();
    monthSet.add(currentYearMonth);
    transactions.forEach((tx) => {
      if (tx.date) {
        const ym = tx.date.substring(0, 7);
        monthSet.add(ym);
      }
    });
    return Array.from(monthSet).sort().reverse();
  }, [transactions, currentYearMonth]);

  // Filter transactions based on selected month
  const filteredTransactions = useMemo(() => {
    if (selectedMonth === 'all') return transactions;
    return transactions.filter((tx) => tx.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  // Analytics totals for filtered transactions
  const { totalIncome, totalExpense, netBalance } = useMemo(() => {
    let income = 0;
    let expense = 0;
    filteredTransactions.forEach((tx) => {
      if (tx.type === 'income') {
        income += tx.amount;
      } else {
        expense += tx.amount;
      }
    });
    return {
      totalIncome: income,
      totalExpense: expense,
      netBalance: income - expense,
    };
  }, [filteredTransactions]);

  // Current month's expense specifically for Budget Tracking
  const currentMonthExpense = useMemo(() => {
    return transactions
      .filter((tx) => tx.type === 'expense' && tx.date.startsWith(currentYearMonth))
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [transactions, currentYearMonth]);

  // Budget status evaluation
  const budgetInfo = useMemo(() => {
    return evaluateBudgetStatus(currentMonthExpense, budget.limitAmount);
  }, [currentMonthExpense, budget.limitAmount]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      {/* Navigation */}
      <Navbar
        dbMode={dbMode}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Loading Spinner */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-semibold text-slate-400 mt-4">Memuat data transaksi...</p>
          </div>
        ) : (
          <>
            {/* Dashboard Analytics Overview */}
            <Dashboard
              totalIncome={totalIncome}
              totalExpense={totalExpense}
              netBalance={netBalance}
              budgetLimit={budget.limitAmount}
              remainingBudget={budgetInfo.remaining}
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
              availableMonths={availableMonths}
            />

            {/* Core Feature Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Budget Tracker & Transaction Form */}
              <div className="lg:col-span-5 space-y-6">
                {/* Feature 2: Visual Budget Tracker with Progress Bar */}
                <BudgetTracker
                  budgetInfo={budgetInfo}
                  onUpdateBudget={handleUpdateBudget}
                />

                {/* Feature 1: Transaction Recording Form */}
                <TransactionForm onAddTransaction={handleAddTransaction} />
              </div>

              {/* Right Column: Transaction History & Records */}
              <div className="lg:col-span-7">
                <TransactionList
                  transactions={filteredTransactions}
                  onDeleteTransaction={handleDeleteTransaction}
                />
              </div>
            </div>
          </>
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentMode={getCurrentDbMode()}
        onConfigChanged={() => {
          loadData();
          setDbMode(getCurrentDbMode());
        }}
      />

      {/* Toast Notifications for user actions */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default App;
