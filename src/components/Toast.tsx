import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import type { ToastMessage } from '../types';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full px-4 sm:px-0 pointer-events-none"
      aria-live="assertive"
    >
      {toasts.map((toast) => {
        const isDanger = toast.type === 'danger';
        const isWarning = toast.type === 'warning';
        const isSuccess = toast.type === 'success';

        let bgClass = 'bg-slate-900/95 border-slate-700 text-slate-100';
        let subTextClass = 'text-slate-400';
        let icon = <Info className="w-5 h-5 text-blue-400 shrink-0" />;

        if (isDanger) {
          bgClass = 'bg-rose-950/95 border-rose-800/80 text-rose-100';
          subTextClass = 'text-rose-200/80';
          icon = <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />;
        } else if (isWarning) {
          bgClass = 'bg-amber-950/95 border-amber-800/80 text-amber-100';
          subTextClass = 'text-amber-200/80';
          icon = <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
        } else if (isSuccess) {
          bgClass = 'bg-emerald-950/95 border-emerald-800/80 text-emerald-100';
          subTextClass = 'text-emerald-200/80';
          icon = <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            role="alert"
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-2xl backdrop-blur-md transition-all duration-200 animate-in fade-in slide-in-from-bottom-3 ${bgClass}`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm">{toast.title}</h4>
              <p className={`text-xs mt-0.5 leading-relaxed ${subTextClass}`}>{toast.message}</p>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
              aria-label="Tutup notifikasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
