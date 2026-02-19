'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { setToastContext } from '@/lib/toast';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (type: ToastType, message: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  useEffect(() => {
    setToastContext({ showToast });
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  return (
    <div className="fixed bottom-20 right-3 sm:bottom-4 sm:right-4 z-[100] flex flex-col gap-2 max-w-[calc(100vw-1.5rem)] sm:max-w-md pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 4000);

    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const icons = {
    success: <CheckCircle2 size={18} className="sm:w-5 sm:h-5 text-emerald-600 shrink-0" />,
    error: <XCircle size={18} className="sm:w-5 sm:h-5 text-red-600 shrink-0" />,
    info: <Info size={18} className="sm:w-5 sm:h-5 text-blue-600 shrink-0" />,
    warning: <AlertTriangle size={18} className="sm:w-5 sm:h-5 text-yellow-600 shrink-0" />,
  };

  const bgColors = {
    success: 'bg-emerald-50 border-emerald-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
    warning: 'bg-yellow-50 border-yellow-200',
  };

  const textColors = {
    success: 'text-emerald-800',
    error: 'text-red-800',
    info: 'text-blue-800',
    warning: 'text-yellow-800',
  };

  return (
    <div
      className={`${bgColors[toast.type]} ${textColors[toast.type]} border rounded-lg p-2.5 sm:p-4 shadow-lg flex items-start gap-2 sm:gap-3 pointer-events-auto animate-slide-in max-w-full overflow-hidden`}
    >
      <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
      <div className="flex-1 min-w-0 text-xs sm:text-sm font-medium break-words">{toast.message}</div>
      <button
        onClick={() => onRemove(toast.id)}
        className={`flex-shrink-0 ${textColors[toast.type]} opacity-60 hover:opacity-100 transition-opacity mt-0.5`}
      >
        <X size={16} className="sm:w-[18px] sm:h-[18px]" />
      </button>
    </div>
  );
}
