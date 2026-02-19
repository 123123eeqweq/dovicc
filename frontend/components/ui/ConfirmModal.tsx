'use client';

import { X, AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'default';
  loading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Підтвердити',
  cancelText = 'Скасувати',
  variant = 'default',
  loading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  const variantStyles = {
    danger: {
      button: 'bg-red-600 hover:bg-red-700 text-white',
      icon: 'text-red-600',
    },
    warning: {
      button: 'bg-yellow-600 hover:bg-yellow-700 text-white',
      icon: 'text-yellow-600',
    },
    default: {
      button: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      icon: 'text-emerald-600',
    },
  };

  const styles = variantStyles[variant];

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1005] transition-opacity duration-200"
        onClick={handleOverlayClick}
      />

      <div className="fixed inset-0 z-[1006] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full pointer-events-auto transform transition-all duration-300">
          <div className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className={`flex-shrink-0 ${styles.icon}`}>
                <AlertTriangle size={24} className={variant === 'danger' ? 'fill-current' : ''} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-slate-900 mb-2 break-words">{title}</h3>
                <p className="text-slate-600 break-words">{message}</p>
              </div>
              {!loading && (
                <button
                  onClick={onClose}
                  className="flex-shrink-0 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 h-11 px-4 flex items-center justify-center rounded-lg border border-slate-200 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelText}
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className={`flex-1 h-11 px-4 flex items-center justify-center rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${styles.button}`}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Обробка...</span>
                  </div>
                ) : (
                  confirmText
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
