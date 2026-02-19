'use client';

import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface BusinessAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BusinessAccessModal({ isOpen, onClose }: BusinessAccessModalProps) {
  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">Отримати доступ</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="text-center py-6">
          <p className="text-slate-700 text-base mb-6">
            Ця функція знаходиться в розробці
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
          >
            Зрозуміло
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof window === 'undefined') {
    return null;
  }

  return createPortal(modalContent, document.body);
}
