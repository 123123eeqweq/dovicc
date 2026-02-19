'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { reportReview } from '@/lib/api';
import { toast } from '@/lib/toast';
import { getErrorMessage, getErrorType } from '@/lib/errorMessages';
import { CustomSelect } from '@/components/ui/CustomSelect';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviewId: string;
  onSuccess?: () => void;
}

const REPORT_REASONS = [
  { value: 'spam', label: 'Спам або реклама' },
  { value: 'hate', label: 'Образи / мова ворожнечі' },
  { value: 'false', label: 'Неправдива інформація' },
  { value: 'irrelevant', label: 'Не стосується об\'єкта' },
  { value: 'other', label: 'Інше' },
];

export function ReportModal({ isOpen, onClose, reviewId, onSuccess }: ReportModalProps) {
  const [reason, setReason] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason) {
      toast.warning('Будь ласка, оберіть причину скарги');
      return;
    }

    setSubmitting(true);

    try {
      await reportReview(reviewId, reason, comment || undefined);
      setSubmitted(true);
      toast.success('Дякуємо, скаргу надіслано');
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      const errorMessage = getErrorMessage(error);
      const errorType = getErrorType(error.status, error.errorCode);
      toast[errorType](errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setReason('');
      setComment('');
      setSubmitted(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">Поскаржитись на відгук</h2>
          <button
            onClick={handleClose}
            disabled={submitting}
            className="text-slate-400 hover:text-slate-600 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {submitted ? (
          <div className="text-center py-4">
            <p className="text-emerald-600 font-semibold mb-4">Скаргу надіслано</p>
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              Закрити
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Причина скарги *
              </label>
              <CustomSelect
                value={reason}
                onChange={setReason}
                disabled={submitting}
                placeholder="Оберіть причину"
                options={REPORT_REASONS.map((r) => ({
                  value: r.value,
                  label: r.label,
                }))}
                className="h-10"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Коментар (опціонально)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={submitting}
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                placeholder="Додайте деталі..."
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={submitting}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-50"
              >
                Скасувати
              </button>
              <button
                type="submit"
                disabled={submitting || !reason}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Надсилання...' : 'Надіслати скаргу'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
