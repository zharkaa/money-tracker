import type { BudgetAlert } from '../types';
import { formatRupiah } from './formatters';

/**
 * Check if the browser supports the Notification API
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Get current notification permission
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
}

/**
 * Request permission to display browser push/desktop notifications
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) {
    console.warn('Browser does not support notifications.');
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'denied';
  }
}

/**
 * Send a native browser notification if permission has been granted
 */
export function sendBrowserNotification(title: string, options?: NotificationOptions): boolean {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  try {
    new Notification(title, {
      icon: '/vite.svg',
      badge: '/vite.svg',
      ...options,
    });
    return true;
  } catch (error) {
    console.error('Failed to trigger browser notification:', error);
    return false;
  }
}

// Track whether we already sent alerts for a given threshold this session/month to avoid spamming
const notifiedThresholds = new Set<string>();

/**
 * Calculate budget status and trigger push notification if approaching or exceeding limit
 * - Approaching: >= 80% and < 100%
 * - Exceeded: >= 100%
 */
export function evaluateBudgetStatus(spent: number, limit: number): BudgetAlert {
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

  let status: 'safe' | 'approaching' | 'exceeded' = 'safe';
  let message = '';

  if (percentage >= 100) {
    status = 'exceeded';
    message = `🚨 Batas anggaran bulanan telah terlampaui! Total pengeluaran: ${formatRupiah(spent)} dari batas ${formatRupiah(limit)} (${percentage}%).`;
  } else if (percentage >= 80) {
    status = 'approaching';
    message = `⚠️ Mendekati batas anggaran! Pengeluaran telah mencapai ${percentage}% (${formatRupiah(spent)} / ${formatRupiah(limit)}). Sisa: ${formatRupiah(remaining)}.`;
  } else {
    status = 'safe';
  }

  // Trigger browser push notification if needed
  if (status === 'exceeded' && !notifiedThresholds.has('exceeded')) {
    notifiedThresholds.add('exceeded');
    sendBrowserNotification('🚨 Peringatan Anggaran Terlampaui!', {
      body: `Pengeluaran Anda telah mencapai ${percentage}% (${formatRupiah(spent)} dari ${formatRupiah(limit)}). Perhatikan pengeluaran Anda!`,
      tag: 'budget-exceeded',
    });
  } else if (status === 'approaching' && !notifiedThresholds.has('approaching')) {
    notifiedThresholds.add('approaching');
    sendBrowserNotification('⚠️ Mendekati Batas Anggaran!', {
      body: `Pengeluaran sudah mencapai ${percentage}% dari batas anggaran (${formatRupiah(spent)}). Sisa anggaran: ${formatRupiah(remaining)}.`,
      tag: 'budget-approaching',
    });
  } else if (status === 'safe') {
    // Reset notification locks if user increased budget or deleted expenses
    notifiedThresholds.delete('approaching');
    notifiedThresholds.delete('exceeded');
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

/**
 * Manually test push notification so the user can verify device permissions
 */
export function sendTestNotification(): boolean {
  return sendBrowserNotification('🔔 Tes Notifikasi Money Tracker', {
    body: 'Notifikasi browser aktif! Anda akan mendapatkan peringatan saat pengeluaran mendekati atau melebihi anggaran.',
  });
}
