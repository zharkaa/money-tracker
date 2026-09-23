import React from 'react';
import { Database, Settings, Wallet } from 'lucide-react';
import type { DbMode } from '../types';

interface NavbarProps {
  dbMode: DbMode;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ dbMode, onOpenSettings }) => {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg text-slate-900 tracking-tight">Money Tracker</h1>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                IDR (Rp)
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">Kelola Pemasukan & Pengeluaran Anda</p>
          </div>
        </div>

        {/* Actions & Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* DB Status Badge */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors"
            title="Klik untuk pengaturan database Turso"
          >
            <Database className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">
              {dbMode === 'turso' ? 'Turso DB' : 'Local DB'}
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                dbMode === 'turso' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              }`}
            />
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
            aria-label="Buka Pengaturan"
            title="Pengaturan Database"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
