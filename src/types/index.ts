export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string; // YYYY-MM-DD
  category?: string;
  note?: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  limitAmount: number;
  period: 'monthly';
  updatedAt: string;
}

export type BudgetStatus = 'safe' | 'approaching' | 'exceeded';

export interface BudgetAlert {
  status: BudgetStatus;
  percentage: number;
  spent: number;
  limit: number;
  remaining: number;
  message?: string;
}

export interface TursoConfig {
  url: string;
  token: string;
}

export type DbMode = 'turso' | 'local';

export interface ToastMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'danger';
  title: string;
  message: string;
}
