'use client';

import { useState, useEffect } from 'react';
import { Star, Clock } from 'lucide-react';
import { submitReview, resendActivationEmail } from '@/lib/api';
import { toast } from '@/lib/toast';
import { getErrorMessage, getErrorType } from '@/lib/errorMessages';

interface ReviewFormProps {
  companySlug: string;
  onSuccess: () => void;
}

interface FieldErrors {
  rating?: string;
  title?: string;
  text?: string;
  pros?: string;
  cons?: string;
}

export function ReviewForm({ companySlug, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [pros, setPros] = useState('');
  const [cons, setCons] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [showEmailActivationMessage, setShowEmailActivationMessage] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [cooldownEnd, setCooldownEnd] = useState<string | null>(null);
  const [cooldownMessage, setCooldownMessage] = useState<string>('');

  const validateForm = (): boolean => {
    const errors: FieldErrors = {};

    if (rating === 0) {
      errors.rating = 'Будь ласка, оберіть рейтинг';
    }

    if (title.trim().length < 3) {
      errors.title = 'Заголовок повинен містити мінімум 3 символи';
    } else if (title.trim().length > 200) {
      errors.title = 'Заголовок не може перевищувати 200 символів';
    }

    if (text.trim().length < 10) {
      errors.text = 'Відгук повинен містити мінімум 10 символів';
    } else if (text.trim().length > 5000) {
      errors.text = 'Відгук не може перевищувати 5000 символів';
    }

    if (pros && pros.trim().length > 1000) {
      errors.pros = 'Переваги не можуть перевищувати 1000 символів';
    }

    if (cons && cons.trim().length > 1000) {
      errors.cons = 'Недоліки не можуть перевищувати 1000 символів';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await submitReview(companySlug, rating, text.trim(), pros.trim() || undefined, cons.trim() || undefined, title.trim());
      setRating(0);
      setTitle('');
      setText('');
      setPros('');
      setCons('');
      setFieldErrors({});
      setCooldownEnd(null);
      setCooldownMessage('');
      setError('');
      toast.success('Відгук успішно додано. Він зʼявиться після модерації');
      onSuccess();
    } catch (err: unknown) {
      const error = err as {
        status?: number;
        errorCode?: string;
        error?: string;
        remainingMinutes?: number;
        cooldownMinutes?: number;
        canCreateAfter?: string;
        reviewsPerWindow?: number;
        reviewWindowHours?: number;
        minReviewLength?: number;
        currentLength?: number;
      };
      
      const errorMessage = getErrorMessage(error);
      const errorType = getErrorType(error.status, error.errorCode);
      
      if (error.status === 401) {
        toast.info('Увійдіть, щоб залишити відгук');
      } else if (error.errorCode === 'EMAIL_NOT_ACTIVATED' || error.error === 'EMAIL_NOT_ACTIVATED') {
        setShowEmailActivationMessage(true);
        toast.warning('Будь ласка, активуйте email перед написанням відгуків');
      } else if (error.status === 429) {
        if (error.errorCode === 'REGISTER_COOLDOWN') {
          const remainingMinutes = error.remainingMinutes || 0;
          const cooldownMinutes = error.cooldownMinutes || 0;
          const message = `Після реєстрації потрібно почекати ${cooldownMinutes} хвилин(и) перед створенням відгуку.`;
          setCooldownMessage(message);
          const endTime = new Date();
          endTime.setMinutes(endTime.getMinutes() + remainingMinutes);
          setCooldownEnd(endTime.toISOString());
          toast.warning(message);
        } else if (error.errorCode === 'REVIEWS_LIMIT_EXCEEDED') {
          const remainingMinutes = error.remainingMinutes || 0;
          const reviewsPerWindow = error.reviewsPerWindow || 5;
          const reviewWindowHours = error.reviewWindowHours || 1;
          const message = `Ви досягли ліміту ${reviewsPerWindow} відгуків за ${reviewWindowHours} годину(и). Спробуйте через ${remainingMinutes} хвилин(и).`;
          setCooldownMessage(message);
          if (error.canCreateAfter) {
            setCooldownEnd(error.canCreateAfter);
          } else {
            const endTime = new Date();
            endTime.setMinutes(endTime.getMinutes() + remainingMinutes);
            setCooldownEnd(endTime.toISOString());
          }
          toast.warning(message);
        } else {
          toast[errorType](errorMessage);
        }
      } else if (error.status === 400 && error.errorCode === 'TEXT_TOO_SHORT') {
        const minLength = error.minReviewLength || 50;
        const currentLength = error.currentLength || text.length;
        const needed = minLength - currentLength;
        const message = `Текст відгуку занадто короткий. Потрібно ще ${needed} символів (мінімум ${minLength}, зараз ${currentLength}).`;
        setError(message);
        setFieldErrors(prev => ({ ...prev, text: message }));
        toast.warning(message);
      } else if (error.status === 409 || error.errorCode === 'REVIEW_ALREADY_EXISTS') {
        toast.info(errorMessage);
      } else {
        toast[errorType](errorMessage);
      }
      
      if (!error.status || (error.status !== 429 && error.status !== 400)) {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const [timeLeft, setTimeLeft] = useState<string>('');
  
  useEffect(() => {
    if (cooldownEnd) {
      const updateTimer = () => {
        const now = new Date().getTime();
        const target = new Date(cooldownEnd).getTime();
        const difference = target - now;

        if (difference <= 0) {
          setCooldownEnd(null);
          setCooldownMessage('');
          setTimeLeft('');
          return;
        }

        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);

      return () => clearInterval(interval);
    } else {
      setTimeLeft('');
    }
  }, [cooldownEnd]);

  const handleResendActivationEmail = async () => {
    setResendingEmail(true);
    try {
      await resendActivationEmail();
      toast.success('Лист активації відправлено! Перевірте email');
      setShowEmailActivationMessage(false);
    } catch (err: unknown) {
      let errorMessage = getErrorMessage(err);
      const errorType = getErrorType(
        (err as { status?: number }).status,
        (err as { errorCode?: string }).errorCode
      );
      const error = err as { remainingSeconds?: number };
      if (error.remainingSeconds !== undefined && error.remainingSeconds !== null) {
        errorMessage = `${errorMessage} Спробуйте через ${error.remainingSeconds} секунд.`;
      }
      
      toast[errorType](errorMessage);
    } finally {
      setResendingEmail(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 mb-8">
      <h3 className="text-xl font-bold text-slate-900 mb-4">Написати відгук</h3>

      {showEmailActivationMessage && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-semibold text-yellow-900 mb-2">
            Email не активовано
          </h4>
          <p className="text-sm text-yellow-800 mb-3">
            Будь ласка, активуйте ваш email перед написанням відгуків. Перевірте вашу пошту та натисніть на посилання для активації.
          </p>
          <button
            type="button"
            onClick={handleResendActivationEmail}
            disabled={resendingEmail}
            className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm">
            {resendingEmail ? 'Відправляємо лист...' : 'Відправити лист активації повторно'}
          </button>
        </div>
      )}

      {cooldownEnd && (
        <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Clock className="size-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-orange-900 mb-1">
                Потрібно почекати
              </h4>
              <p className="text-sm text-orange-800 mb-2">
                {cooldownMessage}
              </p>
              {timeLeft && (
                <div className="flex items-center gap-2 text-sm text-orange-700">
                  <span>Можна створити відгук через:</span>
                  <span className="font-mono font-semibold">
                    {timeLeft}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {error && !showEmailActivationMessage && !cooldownEnd && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Рейтинг <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => {
                setRating(star);
                if (fieldErrors.rating) {
                  setFieldErrors(prev => ({ ...prev, rating: undefined }));
                }
              }}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="focus:outline-none"
            >
              <Star
                size={32}
                className={
                  star <= (hoverRating || rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-slate-300'
                }
              />
            </button>
          ))}
        </div>
        {fieldErrors.rating && (
          <p className="text-sm text-red-600 mt-1">{fieldErrors.rating}</p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Заголовок <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (fieldErrors.title) {
              setFieldErrors(prev => ({ ...prev, title: undefined }));
            }
          }}
          maxLength={200}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none ${
            fieldErrors.title ? 'border-red-300' : 'border-slate-300'
          }`}
          placeholder="Короткий заголовок відгуку, наприклад: Швидка доставка, все прийшло ціле"
        />
        {fieldErrors.title && (
          <p className="text-sm text-red-600 mt-1">{fieldErrors.title}</p>
        )}
        {title.length > 0 && (
          <p className="text-xs text-slate-500 mt-1">{title.length}/200</p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Ваш відгук <span className="text-red-500">*</span>
        </label>
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (fieldErrors.text) {
              setFieldErrors(prev => ({ ...prev, text: undefined }));
            }
          }}
          required
          minLength={10}
          maxLength={5000}
          rows={5}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none ${
            fieldErrors.text ? 'border-red-300' : 'border-slate-300'
          }`}
          placeholder="Поділіться своїм досвідом..."
        />
        <div className="flex justify-between items-center mt-1">
          {fieldErrors.text ? (
            <p className="text-sm text-red-600">{fieldErrors.text}</p>
          ) : (
            <p className="text-xs text-slate-500">
              Мінімум 10 символів. Рекомендовано: 50-500 символів
            </p>
          )}
          <p className={`text-xs ${text.length > 5000 ? 'text-red-500' : 'text-slate-500'}`}>
            {text.length}/5000
          </p>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Переваги <span className="text-slate-400 font-normal">(необов&apos;язково)</span>
        </label>
        <textarea
          value={pros}
          onChange={(e) => {
            setPros(e.target.value);
            if (fieldErrors.pros) {
              setFieldErrors(prev => ({ ...prev, pros: undefined }));
            }
          }}
          maxLength={1000}
          rows={3}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none ${
            fieldErrors.pros ? 'border-red-300' : 'border-slate-300'
          }`}
          placeholder="Що вам сподобалося..."
        />
        {fieldErrors.pros && (
          <p className="text-sm text-red-600 mt-1">{fieldErrors.pros}</p>
        )}
        {pros.length > 0 && (
          <p className="text-xs text-slate-500 mt-1">{pros.length}/1000</p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Недоліки <span className="text-slate-400 font-normal">(необов&apos;язково)</span>
        </label>
        <textarea
          value={cons}
          onChange={(e) => {
            setCons(e.target.value);
            if (fieldErrors.cons) {
              setFieldErrors(prev => ({ ...prev, cons: undefined }));
            }
          }}
          maxLength={1000}
          rows={3}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none ${
            fieldErrors.cons ? 'border-red-300' : 'border-slate-300'
          }`}
          placeholder="Що можна покращити..."
        />
        {fieldErrors.cons && (
          <p className="text-sm text-red-600 mt-1">{fieldErrors.cons}</p>
        )}
        {cons.length > 0 && (
          <p className="text-xs text-slate-500 mt-1">{cons.length}/1000</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || rating === 0 || title.trim().length < 3 || text.trim().length < 10 || cooldownEnd !== null}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Відправка...
          </>
        ) : (
          'Відправити відгук'
        )}
      </button>

      <p className="text-xs text-slate-500 mt-3 text-center">
        Ваш відгук буде опубліковано після модерації
      </p>
    </form>
  );
}
