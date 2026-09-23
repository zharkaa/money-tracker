import { createClient, type Client } from '@libsql/client/web';
import type { Budget, DbMode, Transaction, TursoConfig } from '../types';

const STORAGE_KEYS = {
  TURSO_URL: 'money_tracker_turso_url',
  TURSO_TOKEN: 'money_tracker_turso_token',
  LOCAL_TXS: 'money_tracker_local_transactions',
  LOCAL_BUDGET: 'money_tracker_local_budget',
};

let client: Client | null = null;
let currentMode: DbMode = 'local';
let lastError: string | null = null;

/**
 * Retrieve saved or env Turso configuration
 */
export function getStoredTursoConfig(): TursoConfig {
  const envUrl = (import.meta.env.VITE_TURSO_DATABASE_URL as string) || '';
  const envToken = (import.meta.env.VITE_TURSO_AUTH_TOKEN as string) || '';

  const storedUrl = localStorage.getItem(STORAGE_KEYS.TURSO_URL) || '';
  const storedToken = localStorage.getItem(STORAGE_KEYS.TURSO_TOKEN) || '';

  return {
    url: storedUrl || envUrl,
    token: storedToken || envToken,
  };
}

/**
 * Save custom Turso credentials to localStorage
 */
export function saveTursoConfig(url: string, token: string): void {
  localStorage.setItem(STORAGE_KEYS.TURSO_URL, url.trim());
  localStorage.setItem(STORAGE_KEYS.TURSO_TOKEN, token.trim());
}

/**
 * Clear Turso credentials from localStorage
 */
export function clearTursoConfig(): void {
  localStorage.removeItem(STORAGE_KEYS.TURSO_URL);
  localStorage.removeItem(STORAGE_KEYS.TURSO_TOKEN);
  client = null;
  currentMode = 'local';
}

/**
 * Initialize Database tables (runs on Turso when connected)
 */
async function initTursoTables(c: Client): Promise<void> {
  await c.execute(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      category TEXT,
      note TEXT,
      created_at TEXT NOT NULL
    );
  `);

  await c.execute(`
    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY,
      limit_amount REAL NOT NULL,
      period TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
}

/**
 * Initialize connection to Turso or fallback to Local Storage
 */
export async function initDb(): Promise<{ mode: DbMode; error?: string }> {
  const config = getStoredTursoConfig();

  if (!config.url) {
    currentMode = 'local';
    lastError = null;
    return { mode: 'local' };
  }

  try {
    // Standardize URL: libSQL web client requires https:// or wss://
    let webUrl = config.url.trim();
    if (webUrl.startsWith('libsql://')) {
      webUrl = webUrl.replace('libsql://', 'https://');
    }

    client = createClient({
      url: webUrl,
      authToken: config.token.trim() || undefined,
    });

    // Test connection by initializing tables
    await initTursoTables(client);

    currentMode = 'turso';
    lastError = null;
    return { mode: 'turso' };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.warn('Could not connect to Turso DB, falling back to Local Storage:', errorMsg);
    client = null;
    currentMode = 'local';
    lastError = errorMsg;
    return { mode: 'local', error: errorMsg };
  }
}

export function getCurrentDbMode(): DbMode {
  return currentMode;
}

export function getDbLastError(): string | null {
  return lastError;
}

// ==========================================
// TRANSACTIONS CRUD
// ==========================================

export async function fetchTransactions(): Promise<Transaction[]> {
  if (currentMode === 'turso' && client) {
    try {
      const rs = await client.execute(
        'SELECT id, type, amount, date, category, note, created_at FROM transactions ORDER BY date DESC, created_at DESC'
      );
      return rs.rows.map((row) => ({
        id: String(row.id),
        type: row.type as 'income' | 'expense',
        amount: Number(row.amount),
        date: String(row.date),
        category: row.category ? String(row.category) : undefined,
        note: row.note ? String(row.note) : undefined,
        createdAt: String(row.created_at),
      }));
    } catch (err) {
      console.error('Turso fetch transactions failed:', err);
    }
  }

  // Local storage fallback
  const raw = localStorage.getItem(STORAGE_KEYS.LOCAL_TXS);
  if (!raw) return [];
  try {
    const list: Transaction[] = JSON.parse(raw);
    return list.sort((a, b) => (a.date < b.date ? 1 : -1));
  } catch {
    return [];
  }
}

export async function createTransaction(
  tx: Omit<Transaction, 'id' | 'createdAt'>
): Promise<Transaction> {
  const newTx: Transaction = {
    ...tx,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  if (currentMode === 'turso' && client) {
    try {
      await client.execute({
        sql: `INSERT INTO transactions (id, type, amount, date, category, note, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [
          newTx.id,
          newTx.type,
          newTx.amount,
          newTx.date,
          newTx.category || null,
          newTx.note || null,
          newTx.createdAt,
        ],
      });
      return newTx;
    } catch (err) {
      console.error('Turso insert transaction failed, writing to local storage fallback:', err);
    }
  }

  // Local storage
  const list = await fetchTransactions();
  list.unshift(newTx);
  localStorage.setItem(STORAGE_KEYS.LOCAL_TXS, JSON.stringify(list));
  return newTx;
}

export async function removeTransaction(id: string): Promise<void> {
  if (currentMode === 'turso' && client) {
    try {
      await client.execute({
        sql: 'DELETE FROM transactions WHERE id = ?',
        args: [id],
      });
      return;
    } catch (err) {
      console.error('Turso delete transaction failed:', err);
    }
  }

  // Local storage
  const list = await fetchTransactions();
  const updated = list.filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEYS.LOCAL_TXS, JSON.stringify(updated));
}

// ==========================================
// BUDGET CRUD
// ==========================================

export async function fetchBudget(): Promise<Budget> {
  const defaultBudget: Budget = {
    id: 'default',
    limitAmount: 5000000, // Default Rp 5.000.000
    period: 'monthly',
    updatedAt: new Date().toISOString(),
  };

  if (currentMode === 'turso' && client) {
    try {
      const rs = await client.execute(
        'SELECT id, limit_amount, period, updated_at FROM budgets WHERE id = ? LIMIT 1',
        ['default']
      );
      if (rs.rows.length > 0) {
        const row = rs.rows[0];
        return {
          id: String(row.id),
          limitAmount: Number(row.limit_amount),
          period: 'monthly',
          updatedAt: String(row.updated_at),
        };
      }
    } catch (err) {
      console.error('Turso fetch budget failed:', err);
    }
  }

  // Local storage
  const raw = localStorage.getItem(STORAGE_KEYS.LOCAL_BUDGET);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // fallback to default
    }
  }

  return defaultBudget;
}

export async function updateBudget(limitAmount: number): Promise<Budget> {
  const budget: Budget = {
    id: 'default',
    limitAmount,
    period: 'monthly',
    updatedAt: new Date().toISOString(),
  };

  if (currentMode === 'turso' && client) {
    try {
      await client.execute({
        sql: `INSERT INTO budgets (id, limit_amount, period, updated_at)
              VALUES (?, ?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET limit_amount = excluded.limit_amount, updated_at = excluded.updated_at`,
        args: [budget.id, budget.limitAmount, budget.period, budget.updatedAt],
      });
      return budget;
    } catch (err) {
      console.error('Turso update budget failed:', err);
    }
  }

  localStorage.setItem(STORAGE_KEYS.LOCAL_BUDGET, JSON.stringify(budget));
  return budget;
}
