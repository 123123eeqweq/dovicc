'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Star, PlusCircle, MinusCircle, Building2, X, Info, CheckCircle, AlertCircle, FileText, Mail, Clock } from 'lucide-react';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { searchAutocomplete, submitReview, getCompany } from '@/lib/api';
import { HighlightMatch } from '@/components/search/HighlightMatch';
import { useAuth } from '@/context/AuthContext';
import { AddCompanyModal } from '@/components/company/AddCompanyModal';
import { CompanyLogo } from '@/components/company/CompanyLogo';
import { getErrorMessage, getErrorType } from '@/lib/errorMessages';
import { toast } from '@/lib/toast';
import { SUPPORT_EMAIL } from '@/lib/constants';

interface CompanyResult {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  category: {
    name: string;
  };
}

function WriteReviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [companyQuery, setCompanyQuery] = useState('');
  const [companyResults, setCompanyResults] = useState<CompanyResult[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<CompanyResult | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [pros, setPros] = useState('');
  const [cons, setCons] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, intent, setIntent } = useAuth();
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [loadingCompany, setLoadingCompany] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [cooldownEnd, setCooldownEnd] = useState<string | null>(null);
  const [cooldownMessage, setCooldownMessage] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const companySlug = searchParams.get('company');
    if (companySlug && !loadingCompany) {
      if (selectedCompany?.slug === companySlug) {
        return;
      }
      if (selectedCompany) {
        return;
      }
      
      setLoadingCompany(true);
      getCompany(companySlug)
        .then((company) => {
          const companyResult: CompanyResult = {
            id: company.id,
            name: company.name,
            slug: company.slug,
            logoUrl: company.logoUrl,
            category: {
              name: company.category.name,
            },
          };
          setSelectedCompany(companyResult);
          setCompanyQuery(company.name);
        })
        .catch((error) => {
          console.error('Failed to load company:', error);
        })
        .finally(() => {
          setLoadingCompany(false);
        });
    }
  }, [searchParams, selectedCompany, loadingCompany]);

  useEffect(() => {
    if (user && intent) {
      if (intent.type === 'ADD_COMPANY') {
        setShowAddCompanyModal(true);
        setIntent(null);
      } else if (intent.type === 'ADD_REVIEW') {
        setIntent(null);
      }
    }
  }, [user, intent, setIntent]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowAutocomplete(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchAutocomplete = async () => {
      const trimmedQuery = companyQuery.trim();
      if (trimmedQuery.length < 2) {
        setCompanyResults([]);
        setShowAutocomplete(false);
        return;
      }

      setShowAutocomplete(true);

      try {
        const data = await searchAutocomplete(trimmedQuery);
        setCompanyResults(data.companies.slice(0, 5));
      } catch (error) {
        setCompanyResults([]);
      }
    };

    const debounceTimer = setTimeout(fetchAutocomplete, 300);
    return () => clearTimeout(debounceTimer);
  }, [companyQuery]);

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


  const handleCompanySelect = (company: CompanyResult) => {
    setSelectedCompany(company);
    setCompanyQuery(company.name);
    setShowAutocomplete(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setIntent({ type: 'ADD_REVIEW', companySlug: selectedCompany?.slug });
      return;
    }

    if (!selectedCompany) {
      setError('Оберіть об\'єкт');
      return;
    }

    if (rating === 0) {
      setError('Оберіть рейтинг');
      return;
    }

    if (title.trim().length < 3) {
      setError('Заголовок повинен містити мінімум 3 символи');
      return;
    }

    if (reviewText.trim().length < 10) {
      setError('Відгук повинен містити мінімум 10 символів');
      return;
    }

    if (!termsAccepted) {
      setError('Підтвердіть, що відгук базується на вашому досвіді');
      return;
    }

    setLoading(true);

    try {
      await submitReview(selectedCompany.slug, rating, reviewText.trim(), pros.trim() || undefined, cons.trim() || undefined, title.trim());
      setCooldownEnd(null);
      setCooldownMessage('');
      setError('');
      router.push(`/company/${selectedCompany.slug}`);
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
        setIntent({ type: 'ADD_REVIEW', companySlug: selectedCompany?.slug });
      } else if (error.errorCode === 'EMAIL_NOT_ACTIVATED' || error.error === 'EMAIL_NOT_ACTIVATED') {
        toast.warning('Будь ласка, активуйте email перед написанням відгуків');
        setError(errorMessage);
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
          setError(errorMessage);
        }
      } else if (error.status === 400 && error.errorCode === 'TEXT_TOO_SHORT') {
        const minLength = error.minReviewLength || 50;
        const currentLength = error.currentLength || reviewText.length;
        const needed = minLength - currentLength;
        const message = `Текст відгуку занадто короткий. Потрібно ще ${needed} символів (мінімум ${minLength}, зараз ${currentLength}).`;
        setError(message);
        toast.warning(message);
      } else if (error.status === 409 || error.errorCode === 'REVIEW_ALREADY_EXISTS') {
        toast.info(errorMessage);
        setError(errorMessage);
      } else {
        toast[errorType](errorMessage);
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-20 pb-10 md:py-10">
        <Breadcrumb
          items={[
            { label: 'Головна', href: '/' },
            { label: 'Написати відгук' },
          ]}
          className="mb-8"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-10 shadow-[0_2px_20px_-5px_rgba(0,0,0,0.06)]">
        <div className="mb-10">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-2">
            Написати відгук
          </h1>
          <p className="text-slate-600 text-base">
            Поділіться своїм досвідом, щоб допомогти іншим зробити правильний вибір.
          </p>
        </div>

        <form className="space-y-8" onSubmit={handleSubmit}>
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

          {error && !cooldownEnd && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <label htmlFor="company" className="block text-base font-semibold text-slate-900">
              Про що ви хочете написати?
            </label>
            <div className="relative" ref={containerRef}>
              {selectedCompany ? (
                <div className="flex items-center gap-3 p-4 bg-emerald-50/80 border border-emerald-200/80 rounded-xl">
                  <CompanyLogo logoUrl={selectedCompany.logoUrl} name={selectedCompany.name} size="sm" variant="simple" />
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900">{selectedCompany.name}</div>
                    <div className="text-sm text-slate-500">{selectedCompany.category.name}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCompany(null);
                      setCompanyQuery('');
                    }}
                    className="p-1 hover:bg-emerald-100 rounded transition-colors"
                  >
                    <X size={18} className="text-slate-500" />
                  </button>
                </div>
              ) : (
                <>
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                    <Search size={20} />
                  </span>
                  <input 
                    id="company"
                    type="text" 
                    value={companyQuery}
                    onChange={(e) => setCompanyQuery(e.target.value)}
                    onFocus={() => {
                      if (companyQuery.trim().length >= 2) {
                        setShowAutocomplete(true);
                      }
                    }}
                    className="w-full h-12 pl-11 pr-4 bg-slate-50/80 border border-slate-200 rounded-xl text-base text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 transition-all outline-none" 
                    placeholder="Введіть назву..." 
                  />
                  {showAutocomplete && companyResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-[0_8px_30px_-5px_rgba(0,0,0,0.1)] border border-slate-200/80 overflow-hidden z-50">
                      {companyResults.map((company) => (
                        <button
                          key={company.id}
                          type="button"
                          onClick={() => handleCompanySelect(company)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0 text-left"
                        >
                          <CompanyLogo logoUrl={company.logoUrl} name={company.name} size="sm" variant="simple" />
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <div className="font-semibold text-slate-900 truncate text-sm">
                              <HighlightMatch text={company.name} query={companyQuery.trim()} />
                            </div>
                            <div className="text-xs text-slate-500">
                              <HighlightMatch text={company.category.name} query={companyQuery.trim()} />
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {showAutocomplete && companyQuery.trim().length >= 2 && companyResults.length === 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-[0_8px_30px_-5px_rgba(0,0,0,0.1)] border border-slate-200/80 overflow-hidden z-50 p-4">
                      <div className="text-center py-2">
                        <p className="text-slate-600 text-sm mb-4">
                          Не знайшли те, що шукали?
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAutocomplete(false);
                            if (user) {
                              setShowAddCompanyModal(true);
                            } else {
                              setIntent({ type: 'ADD_COMPANY' });
                            }
                          }}
                          className="w-full px-4 py-2 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <PlusCircle size={18} />
                          <span>Додати</span>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>


          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Рейтинг <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus:outline-none p-1 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <Star
                    size={36}
                    className={
                      star <= (hoverRating || rating)
                        ? 'text-amber-400 fill-amber-400 drop-shadow-sm'
                        : 'text-slate-300'
                    }
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Заголовок <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 outline-none transition-all"
              placeholder="Короткий заголовок, наприклад: Швидка доставка, все прийшло ціле"
            />
            {title.length > 0 && (
              <p className="text-xs text-slate-500 mt-1">{title.length}/200</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Ваш відгук <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              required
              minLength={10}
              maxLength={5000}
              rows={5}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 outline-none resize-none transition-all"
              placeholder="Поділіться своїм досвідом..."
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-slate-500">
                Мінімум 10 символів. Рекомендовано: 50-500 символів
              </p>
              <p className={`text-xs ${reviewText.length > 5000 ? 'text-red-500' : 'text-slate-500'}`}>
                {reviewText.length}/5000
              </p>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Переваги <span className="text-slate-400 font-normal">(необов'язково)</span>
            </label>
            <textarea
              value={pros}
              onChange={(e) => setPros(e.target.value)}
              maxLength={1000}
              rows={3}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 outline-none resize-none transition-all"
              placeholder="Що вам сподобалося..."
            />
            {pros.length > 0 && (
              <p className="text-xs text-slate-500 mt-1">{pros.length}/1000</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Недоліки <span className="text-slate-400 font-normal">(необов'язково)</span>
            </label>
            <textarea
              value={cons}
              onChange={(e) => setCons(e.target.value)}
              maxLength={1000}
              rows={3}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 outline-none resize-none transition-all"
              placeholder="Що можна покращити..."
            />
            {cons.length > 0 && (
              <p className="text-xs text-slate-500 mt-1">{cons.length}/1000</p>
            )}
          </div>

          <div className="flex items-start gap-3 pt-2">
            <div className="flex h-6 items-center">
              <input 
                id="terms" 
                type="checkbox" 
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500/25" 
              />
            </div>
            <div className="text-sm leading-6">
              <label htmlFor="terms" className="font-medium text-slate-700">Я підтверджую, що цей відгук базується на моєму власному досвіді</label>
              <p className="text-slate-500">DOVI.COM.UA має політику нульової толерантності до фейкових відгуків.</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !selectedCompany || rating === 0 || title.trim().length < 3 || reviewText.trim().length < 10 || !termsAccepted || cooldownEnd !== null}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mb-4"
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
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/80 rounded-2xl border border-emerald-200/80 p-6 shadow-[0_2px_20px_-5px_rgba(0,0,0,0.06)]">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-slate-900">Як написати якісний відгук</h2>
            </div>
            
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-900 mb-1">Додайте заголовок</div>
                  <div className="text-slate-600 leading-relaxed">
                    Короткий заголовок допоможе іншим швидко зрозуміти суть вашого відгуку (наприклад: «Швидка доставка» або «Проблеми з гарантією»).
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-900 mb-1">Будьте конкретні</div>
                  <div className="text-slate-600 leading-relaxed">
                    Опишіть деталі вашого досвіду: що саме сподобалось або не сподобалось, коли це було, які обставини.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-900 mb-1">Чесно та об'єктивно</div>
                  <div className="text-slate-600 leading-relaxed">
                    Відгук має відображати вашу реальну думку та досвід. Уникайте узагальнень без підтвердження.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-900 mb-1">Більше деталей</div>
                  <div className="text-slate-600 leading-relaxed">
                    Чим більше конкретики ви надасте, тим кориснішим буде ваш відгук для інших користувачів.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-900 mb-1">Без образ та нецензурної лексики</div>
                  <div className="text-slate-600 leading-relaxed">
                    Використовуйте ввічливу та коректну мову. Відгуки з нецензурною лексикою не будуть опубліковані.
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-emerald-200">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <span className="font-semibold">Важливо:</span> Всі відгуки проходять модерацію на відповідність правилам платформи перед публікацією.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_2px_20px_-5px_rgba(0,0,0,0.06)]">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-900 mb-1">
                    Ознайомтесь з правилами написання відгуків
                  </div>
                  <Link 
                    href="/rules" 
                    className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
                  >
                    Переглянути правила →
                  </Link>
                </div>
              </div>

              <div className="h-px bg-slate-100"></div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-900 mb-1">
                    Маєте питання?
                  </div>
                  <a 
                    href={`mailto:${SUPPORT_EMAIL}`} 
                    className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
                  >
                    Написати в підтримку →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      <AddCompanyModal
        isOpen={showAddCompanyModal}
        onClose={() => setShowAddCompanyModal(false)}
        onSuccess={() => {
          setShowAddCompanyModal(false);
          router.push('/');
        }}
      />
    </div>
  );
}

export default function WriteReview() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <p className="mt-4 text-slate-600">Завантаження...</p>
        </div>
      </div>
    }>
      <WriteReviewContent />
    </Suspense>
  );
}
