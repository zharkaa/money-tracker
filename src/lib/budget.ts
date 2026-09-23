import { formatRupiah } from './formatters';
import type { BudgetStatus } from '../types';

export interface BudgetStatusInfo {
  status: BudgetStatus;
  percentage: number;
  spent: number;
  limit: number;
  remaining: number;
  message?: string;
}

/**
 * Calculate budget status and progress metrics
 * - Aman (Safe): < 80%
 * - Mendekati Batas (Approaching): >= 80% and < 100%
 * - Melebihi Batas (Exceeded): >= 100%
 */
export function evaluateBudgetStatus(spent: number, limit: number): BudgetStatusInfo {
  if (limit <= 0) {
    return {
      status: 'safe',
      percentage: 0,
      spent,
      limit: 0,
      remaining: 0,
    };
  }

  const percentage = Math.round((spent / limit) * 100);
  const remaining = Math.max(0, limit - spent);

  let status: BudgetStatus = 'safe';
  let message = '';

  if (percentage >= 100) {
    status = 'exceeded';
    message = `Batas anggaran bulanan telah terlampaui! Total pengeluaran: ${formatRupiah(spent)} dari batas ${formatRupiah(limit)} (${percentage}%).`;
  } else if (percentage >= 80) {
    status = 'approaching';
    message = `Mendekati batas anggaran! Pengeluaran telah mencapai ${percentage}% (${formatRupiah(spent)} / ${formatRupiah(limit)}). Sisa: ${formatRupiah(remaining)}.`;
  } else {
    status = 'safe';
  }

  return {
    status,
    percentage,
    spent,
    limit,
    remaining,
    message,
  };
}
