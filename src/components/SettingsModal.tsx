import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle,
  Database,
  ExternalLink,
  Info,
  RefreshCw,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import {
  clearTursoConfig,
  getDbLastError,
  getStoredTursoConfig,
  initDb,
  saveTursoConfig,
} from '../lib/db';
import type { DbMode } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: DbMode;
  onConfigChanged: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentMode,
  onConfigChanged,
}) => {
  const currentConfig = getStoredTursoConfig();
  const [url, setUrl] = useState(currentConfig.url);
  const [token, setToken] = useState(currentConfig.token);
  const [isTesting, setIsTesting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleSaveAndConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTesting(true);
    setStatusMsg(null);

    saveTursoConfig(url, token);
    const res = await initDb();

    setIsTesting(false);
    if (res.mode === 'turso') {
      setStatusMsg({
        type: 'success',
        text: 'Berhasil terhubung ke Turso Database! Tabel otomatis disinkronkan.',
      });
      onConfigChanged();
    } else {
      setStatusMsg({
        type: 'error',
        text: res.error || 'Gagal terhubung ke Turso. Periksa kembali URL dan Token Anda.',
      });
    }
  };

  const handleUseLocal = async () => {
    clearTursoConfig();
    setUrl('');
    setToken('');
    await initDb();
    setStatusMsg({
      type: 'info',
      text: 'Mode beralih ke Local Storage (Penyimpanan lokal di browser Anda).',
    });
    onConfigChanged();
  };

  const handleResetData = () => {
    if (
      window.confirm(
        'PERINGATAN: Ini akan menghapus semua data transaksi & anggaran di penyimpanan lokal browser. Lanjutkan?'
      )
    ) {
      localStorage.removeItem('money_tracker_local_transactions');
      localStorage.removeItem('money_tracker_local_budget');
      onConfigChanged();
      setStatusMsg({
        type: 'info',
        text: 'Data lokal berhasil dibersihkan.',
      });
    }
  };

  const dbErr = getDbLastError();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Pengaturan Database Turso</h3>
              <p className="text-xs text-slate-500">
                Mode aktif saat ini:{' '}
                <strong className={currentMode === 'turso' ? 'text-emerald-600' : 'text-slate-700'}>
                  {currentMode === 'turso' ? 'Turso Cloud DB' : 'Local Storage (Browser)'}
                </strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Alert if any */}
        {statusMsg && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              statusMsg.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : statusMsg.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}
          >
            {statusMsg.type === 'success' ? (
              <CheckCircle className="w-4 h-4 shrink-0" />
            ) : statusMsg.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <Info className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {dbErr && !statusMsg && (
          <div className="p-3 rounded-xl border bg-amber-50 border-amber-200 text-amber-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>Koneksi Turso terakhir gagal: {dbErr}. Menggunakan Local Storage.</span>
          </div>
        )}

        {/* Turso Form */}
        <form onSubmit={handleSaveAndConnect} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="turso-url" className="text-xs font-semibold text-slate-700">
              Turso Database URL
            </label>
            <input
              id="turso-url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Contoh: libsql://your-db-name.turso.io atau https://..."
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all placeholder:text-slate-400 font-mono"
            />
            <p className="text-[11px] text-slate-400">
              Bisa juga diatur lewat file <code className="bg-slate-100 px-1 py-0.5 rounded">.env</code> dengan variabel <code className="bg-slate-100 px-1 py-0.5 rounded">VITE_TURSO_DATABASE_URL</code>
            </p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="turso-token" className="text-xs font-semibold text-slate-700">
              Turso Auth Token
            </label>
            <input
              id="turso-token"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="eyJhbGciOi..."
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all placeholder:text-slate-400 font-mono"
            />
            <p className="text-[11px] text-slate-400">
              Token autentikasi dari CLI Turso (<code className="bg-slate-100 px-1 py-0.5 rounded">turso db tokens create [db-name]</code>)
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleUseLocal}
              className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Gunakan Local Storage Saja
            </button>

            <button
              type="submit"
              disabled={isTesting}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
            >
              {isTesting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Menghubungkan...
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" /> Simpan & Hubungkan Turso
                </>
              )}
            </button>
          </div>
        </form>

        {/* Step-by-step Quick Help */}
        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 text-xs text-slate-600 space-y-1.5">
          <div className="flex items-center justify-between">
            <strong className="text-slate-800 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-slate-500" /> Cara Cepat Buat Turso DB:
            </strong>
            <a
              href="https://turso.tech"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-600 hover:underline flex items-center gap-1 text-[11px]"
            >
              turso.tech <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[11px] pl-1">
            <li>Jalankan <code className="bg-white px-1 py-0.5 rounded border border-slate-200">turso auth login</code> di terminal Anda.</li>
            <li>Buat database: <code className="bg-white px-1 py-0.5 rounded border border-slate-200">turso db create money-db</code>.</li>
            <li>Salin URL (<code className="bg-white px-1 py-0.5 rounded border border-slate-200">turso db show money-db --url</code>).</li>
            <li>Buat token: <code className="bg-white px-1 py-0.5 rounded border border-slate-200">turso db tokens create money-db</code>.</li>
          </ol>
        </div>

        {/* Clear Local Data */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">Pembersihan data peramban</span>
          <button
            type="button"
            onClick={handleResetData}
            className="text-[11px] font-medium text-rose-600 hover:text-rose-700 flex items-center gap-1 p-1 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-3 h-3" /> Bersihkan Cache Data Lokal
          </button>
        </div>
      </div>
    </div>
  );
};
