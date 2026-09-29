import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle,
  Cloud,
  CloudOff,
  Database,
  HardDrive,
  Info,
  RefreshCw,
  Trash2,
  X,
} from 'lucide-react';
import {
  clearTursoConfig,
  getDbLastError,
  getStoredTursoConfig,
  initDb,
} from '../lib/db';
import { ConfirmationModal } from './ConfirmationModal';
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
  const [isTesting, setIsTesting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  if (!isOpen) return null;

  const config = getStoredTursoConfig();
  const hasEnvConfig = Boolean(config.url);

  const handleReconnect = async () => {
    setIsTesting(true);
    setStatusMsg(null);

    const res = await initDb();

    setIsTesting(false);
    if (res.mode === 'turso') {
      setStatusMsg({
        type: 'success',
        text: 'Berhasil terhubung ke Turso Database! Tabel otomatis disinkronkan.',
      });
      onConfigChanged();
    }
  };

  const handleUseLocal = async () => {
    clearTursoConfig();
    await initDb();
    setStatusMsg({
      type: 'info',
      text: 'Mode beralih ke Local Storage (Penyimpanan lokal di browser Anda).',
    });
    onConfigChanged();
  };

  const performReset = () => {
    localStorage.removeItem('money_tracker_local_transactions');
    localStorage.removeItem('money_tracker_local_budget');
    onConfigChanged();
    setStatusMsg({
      type: 'info',
      text: 'Data lokal berhasil dibersihkan.',
    });
  };

  const dbErr = getDbLastError();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-800 space-y-5 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Pengaturan Database</h3>
              <p className="text-xs text-slate-400">
                Konfigurasi penyimpanan data
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Alert if any */}
        {statusMsg && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              statusMsg.type === 'success'
                ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-300'
                : statusMsg.type === 'error'
                ? 'bg-rose-950/60 border-rose-800/60 text-rose-300'
                : 'bg-blue-950/60 border-blue-800/60 text-blue-300'
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
          <div className="p-3 rounded-xl border bg-amber-950/60 border-amber-800/60 text-amber-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Koneksi Turso terakhir gagal: {dbErr}. Menggunakan Local Storage.</span>
          </div>
        )}

        {/* Connection Status Card */}
        <div className={`p-4 rounded-xl border flex items-center gap-3 ${
          currentMode === 'turso'
            ? 'bg-emerald-950/40 border-emerald-800/50'
            : 'bg-slate-800/60 border-slate-700/80'
        }`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            currentMode === 'turso'
              ? 'bg-emerald-900/60 text-emerald-400'
              : 'bg-slate-700/60 text-slate-400'
          }`}>
            {currentMode === 'turso' ? (
              <Cloud className="w-5 h-5" />
            ) : (
              <HardDrive className="w-5 h-5" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold ${
                currentMode === 'turso' ? 'text-emerald-300' : 'text-slate-200'
              }`}>
                {currentMode === 'turso' ? 'Turso Cloud DB' : 'Local Storage'}
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                currentMode === 'turso'
                  ? 'bg-emerald-800/60 text-emerald-300'
                  : 'bg-slate-700 text-slate-300'
              }`}>
                {currentMode === 'turso' ? '● Terhubung' : '● Aktif'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {currentMode === 'turso'
                ? 'Data tersimpan aman di cloud database Turso.'
                : 'Data tersimpan di browser. Bisa hilang jika cache dibersihkan.'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleReconnect}
            disabled={isTesting}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            {isTesting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Menghubungkan...
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" /> {hasEnvConfig ? 'Hubungkan Ulang' : 'Coba Hubungkan'}
              </>
            )}
          </button>

          {currentMode === 'turso' && (
            <button
              type="button"
              onClick={handleUseLocal}
              className="flex items-center gap-1.5 px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl text-xs font-semibold transition-colors border border-slate-700/60"
            >
              <CloudOff className="w-3.5 h-3.5" /> Gunakan Local Storage
            </button>
          )}
        </div>

        {/* Clear Local Data */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">Pembersihan data peramban</span>
          <button
            type="button"
            onClick={() => setIsResetConfirmOpen(true)}
            className="text-[11px] font-medium text-rose-400 hover:text-rose-300 flex items-center gap-1 p-1 hover:bg-rose-950/40 rounded-lg transition-colors"
          >
            <Trash2 className="w-3 h-3" /> Bersihkan Cache Data Lokal
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Clearing Local Data */}
      <ConfirmationModal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={performReset}
        title="Bersihkan Data Lokal?"
        message="PERINGATAN: Semua data transaksi dan anggaran yang tersimpan di penyimpanan lokal browser Anda akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan."
        confirmText="Ya, Bersihkan Data"
        cancelText="Batal"
        isDestructive={true}
      />
    </div>
  );
};
