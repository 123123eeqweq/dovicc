'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Star, ThumbsUp, ThumbsDown, MoreHorizontal, Plus, Minus, Check, X, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import { AuthModal } from '@/components/auth/AuthModal';
import { ReviewForm } from '@/components/review/ReviewForm';
import { ReportModal } from '@/components/review/ReportModal';
import { Icon } from '@/components/ui/Icon';
import { getCurrentUser, submitReview, reactToReview, getCompanyReviews, getImageSrc } from '@/lib/api';
import { ReviewFilters } from '@/components/review/ReviewFilters';
import { toast } from '@/lib/toast';
import { getErrorMessage, getErrorType } from '@/lib/errorMessages';

interface Review {
  id: string;
  title?: string | null;
  rating: number;
  text: string;
  pros: string | null;
  cons: string | null;
  createdAt: string;
  likesCount: number;
  dislikesCount: number;
  userReaction: number | null;
  user: {
    name: string;
    avatarUrl: string | null;
  };
  status?: string;
}

interface CompanyReviewsSectionProps {
  companySlug: string;
  initialReviews: Review[];
  totalPages?: number;
  currentPage?: number;
}

export function CompanyReviewsSection({ companySlug, initialReviews, totalPages, currentPage = 1 }: CompanyReviewsSectionProps) {
  const searchParams = useSearchParams();
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reactingReviews, setReactingReviews] = useState<Set<string>>(new Set());
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [reportReviewId, setReportReviewId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number } | null>(null);
  const menuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const reviewsSectionRef = useRef<HTMLDivElement>(null);
  const [userReactions, setUserReactions] = useState<Record<string, 1 | -1>>(
    initialReviews.reduce((acc, review) => {
      if (review.userReaction !== null) {
        acc[review.id] = review.userReaction as 1 | -1;
      }
      return acc;
    }, {} as Record<string, 1 | -1>)
  );

  const buildPaginationUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete('page');
    } else {
      params.set('page', page.toString());
    }
    return `/company/${companySlug}${params.toString() ? `?${params.toString()}` : ''}`;
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId && menuRefs.current[openMenuId]) {
        if (!menuRefs.current[openMenuId]?.contains(event.target as Node)) {
          setOpenMenuId(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

  useEffect(() => {
    if (loading) return;

    const loadReviews = async () => {
      const sort = searchParams.get('sort') || 'newest';
      const rating = searchParams.get('rating') ? parseInt(searchParams.get('rating')!, 10) : undefined;
      const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1;
      const limit = 10;
      const offset = (page - 1) * limit;

      try {
        const updatedReviews = await getCompanyReviews(companySlug, !!user, {
          sort: sort as 'newest' | 'rating_desc' | 'rating_asc' | 'useful',
          rating,
          limit,
          offset,
        });
        setReviews(updatedReviews);

        const pageParam = searchParams.get('page');
        if (pageParam && pageParam !== '1') {
          requestAnimationFrame(() => {
            reviewsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          });
        }

        if (user) {
          const reactions: Record<string, 1 | -1> = {};
          updatedReviews.forEach((review: Review) => {
            if (review.userReaction !== null) {
              reactions[review.id] = review.userReaction as 1 | -1;
            }
          });
          setUserReactions(reactions);
        } else {
          setUserReactions({});
        }
      } catch {
      }
    };

    loadReviews();
  }, [searchParams, companySlug, user, loading]);

  const checkAuth = async () => {
    try {
      const data = await getCurrentUser();
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async () => {
    await checkAuth();
    window.location.reload();
  };


  const handleReaction = async (reviewId: string, value: 1 | -1) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (reactingReviews.has(reviewId)) {
      return;
    }

    setReactingReviews((prev) => new Set(prev).add(reviewId));

    const currentReaction = userReactions[reviewId];
    const review = reviews.find((r) => r.id === reviewId);
    
    if (!review) return;

    const previousLikesCount = review.likesCount;
    const previousDislikesCount = review.dislikesCount;
    let newLikesCount = previousLikesCount;
    let newDislikesCount = previousDislikesCount;

    if (currentReaction === value) {
      if (value === 1) {
        newLikesCount = Math.max(0, previousLikesCount - 1);
      } else {
        newDislikesCount = Math.max(0, previousDislikesCount - 1);
      }
      setUserReactions((prev) => {
        const next = { ...prev };
        delete next[reviewId];
        return next;
      });
    } else if (currentReaction) {
      if (value === 1) {
        newLikesCount = previousLikesCount + 1;
        newDislikesCount = Math.max(0, previousDislikesCount - 1);
      } else {
        newLikesCount = Math.max(0, previousLikesCount - 1);
        newDislikesCount = previousDislikesCount + 1;
      }
      setUserReactions((prev) => ({ ...prev, [reviewId]: value }));
    } else {
      if (value === 1) {
        newLikesCount = previousLikesCount + 1;
      } else {
        newDislikesCount = previousDislikesCount + 1;
      }
      setUserReactions((prev) => ({ ...prev, [reviewId]: value }));
    }

    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? { ...r, likesCount: newLikesCount, dislikesCount: newDislikesCount }
          : r
      )
    );

    try {
      const result = await reactToReview(reviewId, value);
      if (result && typeof result.likesCount === 'number' && typeof result.dislikesCount === 'number') {
        setReviews((prev) =>
          prev.map((r) =>
            r.id === reviewId
              ? { ...r, likesCount: result.likesCount, dislikesCount: result.dislikesCount }
              : r
          )
        );
        if (result.companySlug) {
          fetch(`/api/revalidate?tag=company:${result.companySlug}:reviews`, { method: 'POST' }).catch(() => {});
        }
      }
    } catch (error: any) {
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? { ...r, likesCount: previousLikesCount, dislikesCount: previousDislikesCount }
            : r
        )
      );
      if (currentReaction === value) {
        setUserReactions((prev) => ({ ...prev, [reviewId]: currentReaction }));
      } else if (currentReaction) {
        setUserReactions((prev) => ({ ...prev, [reviewId]: currentReaction }));
      } else {
        setUserReactions((prev) => {
          const next = { ...prev };
          delete next[reviewId];
          return next;
        });
      }
      
      const errorMessage = getErrorMessage(error);
      const errorType = getErrorType(error.status, error.errorCode);
      
      if (error.errorCode === 'CANNOT_REACT_TO_OWN_REVIEW') {
        toast.warning(errorMessage);
      } else if (error.status === 401) {
        toast.info('Увійдіть, щоб реагувати на відгуки');
      } else {
        toast[errorType](errorMessage);
      }
    } finally {
      setReactingReviews((prev) => {
        const next = new Set(prev);
        next.delete(reviewId);
        return next;
      });
    }
  };

  return (
    <>
      {!loading && user && (
        <ReviewForm companySlug={companySlug} onSuccess={handleReviewSubmit} />
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h3 className="font-bold text-xl text-slate-900">Відгуки</h3>
        {!user && (
          <Link
            href={`/review/add?company=${companySlug}`}
            className="h-10 px-5 flex items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-[0_2px_12px_-4px_rgba(5,150,105,0.4)] hover:shadow-[0_4px_20px_-4px_rgba(5,150,105,0.5)]"
          >
            Написати відгук
          </Link>
        )}
      </div>

      <div ref={reviewsSectionRef} id="reviews-list">
        <ReviewFilters />

      {reviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] p-12 md:p-16 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-slate-100 flex items-center justify-center">
              <MessageSquare size={32} className="text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">
              Поки що немає відгуків
            </h3>
            <p className="text-slate-600 mb-8 leading-relaxed">
              Будьте першим — ваш досвід допоможе іншим зробити правильний вибір. Поділіться своїми враженнями та допоможіть спільноті.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/review/add?company=${companySlug}`}
                className="h-12 px-6 flex items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-[0_2px_12px_-4px_rgba(5,150,105,0.4)] hover:shadow-[0_4px_20px_-4px_rgba(5,150,105,0.5)]"
              >
                <Plus size={20} className="mr-2" />
                Написати відгук
              </Link>
              <Link
                href="/categories"
                className="h-12 px-6 flex items-center justify-center rounded-xl border border-slate-200/80 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
              >
                Знайти інші компанії
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review, index) => {
          const initials = review.user.name.split(' ').map(n => n[0]).join('').toUpperCase();
          const date = new Date(review.createdAt).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' });
          const isPending = review.status === 'pending';
          
          return (
            <article key={index} className={`bg-white rounded-2xl border p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.1)] transition-all duration-300 max-w-full ${isPending ? 'border-amber-300 bg-amber-50/30' : 'border-slate-200/80'}`}>
              <Link 
                href={`/review/${review.id}`}
                className="block mb-4 hover:opacity-90 transition-opacity cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    {review.user.avatarUrl ? (
                      <div className="relative size-12 rounded-full overflow-hidden shrink-0">
                        <Image
                          src={getImageSrc(review.user.avatarUrl)}
                          alt={`Аватар автора відгуку ${review.user.name}`}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="size-12 rounded-full flex items-center justify-center text-lg font-bold overflow-hidden bg-gradient-to-tr from-blue-100 to-blue-200 text-blue-700">
                        {initials}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-slate-900 truncate break-words">{review.user.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <div className="flex text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} className={i < review.rating ? "fill-current" : "text-slate-200"} />
                          ))}
                        </div>
                        <span className="text-xs text-slate-400">• {date}</span>
                        {isPending && (
                          <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full font-medium">
                            На модерації
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4 overflow-hidden max-w-3xl">
                  {review.title && (
                    <h4 className="font-semibold text-slate-900 mb-2 break-words">{review.title}</h4>
                  )}
                  <p className="text-slate-700 leading-relaxed break-words">{review.text}</p>
                </div>

                {(review.pros || review.cons) && (
                  <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
                    {review.pros && (
                      <div className="bg-emerald-50/50 rounded-xl p-5 border border-emerald-200/80 min-w-0 overflow-hidden">
                        <h4 className="font-bold text-emerald-800 flex items-center gap-2 mb-3 shrink-0">
                          <Icon name="add_circle" /> Плюси
                        </h4>
                        <ul className="space-y-2 min-w-0">
                          {review.pros.split('\n').filter(line => line.trim()).length > 0 ? (
                            review.pros.split('\n').filter(line => line.trim()).map((line, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 min-w-0">
                                <Icon name="check" className="text-emerald-600 text-[18px] mt-0.5 shrink-0" />
                                <span className="break-words min-w-0 overflow-wrap-anywhere">{line.trim()}</span>
                              </li>
                            ))
                          ) : (
                            <li className="flex items-start gap-2 text-sm text-slate-700 min-w-0">
                              <Icon name="check" className="text-emerald-600 text-[18px] mt-0.5 shrink-0" />
                              <span className="break-words min-w-0 overflow-wrap-anywhere">{review.pros}</span>
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                    {review.cons && (
                      <div className="bg-red-50/50 rounded-xl p-5 border border-red-200/80 min-w-0 overflow-hidden">
                        <h4 className="font-bold text-red-800 flex items-center gap-2 mb-3 shrink-0">
                          <Icon name="do_not_disturb_on" /> Мінуси
                        </h4>
                        <ul className="space-y-2 min-w-0">
                          {review.cons.split('\n').filter(line => line.trim()).length > 0 ? (
                            review.cons.split('\n').filter(line => line.trim()).map((line, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 min-w-0">
                                <Icon name="close" className="text-red-500 text-[18px] mt-0.5 shrink-0" />
                                <span className="break-words min-w-0 overflow-wrap-anywhere">{line.trim()}</span>
                              </li>
                            ))
                          ) : (
                            <li className="flex items-start gap-2 text-sm text-slate-700 min-w-0">
                              <Icon name="close" className="text-red-500 text-[18px] mt-0.5 shrink-0" />
                              <span className="break-words min-w-0 overflow-wrap-anywhere">{review.cons}</span>
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </Link>

              {!isPending && (
                <div className="flex items-center justify-between pt-4 border-t border-slate-200/80" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleReaction(review.id, 1)}
                      disabled={reactingReviews.has(review.id)}
                      className={`flex items-center gap-1.5 text-sm transition-colors group ${
                        userReactions[review.id] === 1
                          ? 'text-emerald-600 font-semibold'
                          : 'text-slate-500 hover:text-emerald-600'
                      } ${reactingReviews.has(review.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <ThumbsUp size={18} className={userReactions[review.id] === 1 ? 'fill-current' : ''} />
                      <span>Корисно</span>
                      {review.likesCount > 0 && (
                        <span className="text-xs">{review.likesCount}</span>
                      )}
                    </button>
                    <button
                      onClick={() => handleReaction(review.id, -1)}
                      disabled={reactingReviews.has(review.id)}
                      className={`flex items-center gap-1.5 text-sm transition-colors group ${
                        userReactions[review.id] === -1
                          ? 'text-red-500 font-semibold'
                          : 'text-slate-500 hover:text-red-500'
                      } ${reactingReviews.has(review.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <ThumbsDown size={18} className={userReactions[review.id] === -1 ? 'fill-current' : ''} />
                      {review.dislikesCount > 0 && (
                        <span className="text-xs">{review.dislikesCount}</span>
                      )}
                    </button>
                  </div>
                  {user && (
                    <div className="relative" ref={(el) => { menuRefs.current[review.id] = el; }}>
                      <button
                        ref={(el) => { buttonRefs.current[review.id] = el; }}
                        onClick={(e) => {
                          const button = buttonRefs.current[review.id];
                          if (button && window.innerWidth < 768) {
                            const rect = button.getBoundingClientRect();
                            setMenuPosition({
                              top: rect.bottom + 8,
                              right: window.innerWidth - rect.right,
                            });
                          } else {
                            setMenuPosition(null);
                          }
                          setOpenMenuId(openMenuId === review.id ? null : review.id);
                        }}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <MoreHorizontal size={20} />
                      </button>
                      {openMenuId === review.id && (
                        <>
                          {typeof window !== 'undefined' && window.innerWidth < 768 && menuPosition && createPortal(
                            <>
                              <div 
                                className="fixed inset-0 z-[99]" 
                                onMouseDown={(e) => {
                                  if (e.target === e.currentTarget) {
                                    setOpenMenuId(null);
                                    setMenuPosition(null);
                                  }
                                }}
                              />
                              <div 
                                className="fixed bg-white border border-slate-200/80 rounded-xl shadow-[0_8px_30px_-10px_rgba(0,0,0,0.12)] py-1 z-[100] min-w-[160px]"
                                style={{
                                  top: `${menuPosition.top}px`,
                                  right: `${menuPosition.right}px`,
                                }}
                                onMouseDown={(e) => e.stopPropagation()}
                              >
                                <button
                                  onMouseDown={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setReportReviewId(review.id);
                                    setOpenMenuId(null);
                                    setMenuPosition(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                >
                                  Поскаржитись
                                </button>
                              </div>
                            </>,
                            document.body
                          )}
                          {(!menuPosition || (typeof window !== 'undefined' && window.innerWidth >= 768)) && (
                            <div className="absolute right-0 top-8 bg-white border border-slate-200/80 rounded-xl shadow-[0_8px_30px_-10px_rgba(0,0,0,0.12)] py-1 z-[100] min-w-[160px]">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setReportReviewId(review.id);
                                  setOpenMenuId(null);
                                  setMenuPosition(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                              >
                                Поскаржитись
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </article>
          );
        })}
        </div>
      )}
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={checkAuth}
      />

      {reportReviewId && (
        <ReportModal
          isOpen={!!reportReviewId}
          onClose={() => setReportReviewId(null)}
          reviewId={reportReviewId}
        />
      )}

      {reviews.length > 0 && totalPages && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Link
            href={buildPaginationUrl(currentPage - 1)}
            scroll={false}
            className={`flex items-center justify-center size-10 rounded-lg border transition-colors ${
              currentPage === 1
                ? 'border-slate-200 text-slate-300 cursor-not-allowed pointer-events-none'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-emerald-600'
            }`}
            aria-disabled={currentPage === 1}
          >
            <ChevronLeft size={20} />
          </Link>
          
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let pageNum: number;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <Link
                key={pageNum}
                href={buildPaginationUrl(pageNum)}
                scroll={false}
                className={`flex items-center justify-center min-w-[40px] h-10 px-3 rounded-lg border font-medium transition-colors ${
                  currentPage === pageNum
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-emerald-600'
                }`}
              >
                {pageNum}
              </Link>
            );
          })}

          <Link
            href={buildPaginationUrl(currentPage + 1)}
            scroll={false}
            className={`flex items-center justify-center size-10 rounded-lg border transition-colors ${
              currentPage === totalPages
                ? 'border-slate-200 text-slate-300 cursor-not-allowed pointer-events-none'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-emerald-600'
            }`}
            aria-disabled={currentPage === totalPages}
          >
            <ChevronRight size={20} />
          </Link>
        </div>
      )}
    </>
  );
}
