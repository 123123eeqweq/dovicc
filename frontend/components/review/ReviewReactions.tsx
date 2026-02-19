'use client';

import { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { reactToReview, getCurrentUser } from '@/lib/api';
import { toast } from '@/lib/toast';
import { getErrorMessage, getErrorType } from '@/lib/errorMessages';
import { AuthModal } from '@/components/auth/AuthModal';

interface ReviewReactionsProps {
  reviewId: string;
  initialLikesCount: number;
  initialDislikesCount: number;
  initialUserReaction: number | null;
}

export function ReviewReactions({
  reviewId,
  initialLikesCount,
  initialDislikesCount,
  initialUserReaction,
}: ReviewReactionsProps) {
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [reacting, setReacting] = useState(false);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [dislikesCount, setDislikesCount] = useState(initialDislikesCount);
  const [userReaction, setUserReaction] = useState<number | null>(initialUserReaction);

  useEffect(() => {
    checkAuth();
  }, []);

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

  const handleReaction = async (value: 1 | -1) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (reacting) {
      return;
    }

    setReacting(true);

    const currentReaction = userReaction;
    const previousLikesCount = likesCount;
    const previousDislikesCount = dislikesCount;
    let newLikesCount = previousLikesCount;
    let newDislikesCount = previousDislikesCount;

    if (currentReaction === value) {
      if (value === 1) {
        newLikesCount = Math.max(0, previousLikesCount - 1);
      } else {
        newDislikesCount = Math.max(0, previousDislikesCount - 1);
      }
      setUserReaction(null);
    } else if (currentReaction) {
      if (value === 1) {
        newLikesCount = previousLikesCount + 1;
        newDislikesCount = Math.max(0, previousDislikesCount - 1);
      } else {
        newLikesCount = Math.max(0, previousLikesCount - 1);
        newDislikesCount = previousDislikesCount + 1;
      }
      setUserReaction(value);
    } else {
      if (value === 1) {
        newLikesCount = previousLikesCount + 1;
      } else {
        newDislikesCount = previousDislikesCount + 1;
      }
      setUserReaction(value);
    }

    setLikesCount(newLikesCount);
    setDislikesCount(newDislikesCount);

    try {
      const result = await reactToReview(reviewId, value);
      if (result && typeof result.likesCount === 'number' && typeof result.dislikesCount === 'number') {
        setLikesCount(result.likesCount);
        setDislikesCount(result.dislikesCount);
      }
      fetch(`/api/revalidate?tag=review:${reviewId}`, { method: 'POST' }).catch(() => {});
    } catch (error: any) {
      setLikesCount(previousLikesCount);
      setDislikesCount(previousDislikesCount);
      setUserReaction(currentReaction);
      
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
      setReacting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-sm text-slate-500">
          <ThumbsUp size={18} />
          <span>Корисно</span>
          {initialLikesCount > 0 && (
            <span className="text-xs">{initialLikesCount}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-sm text-slate-500">
          <ThumbsDown size={18} />
          {initialDislikesCount > 0 && (
            <span className="text-xs">{initialDislikesCount}</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-4">
        <button
          onClick={() => handleReaction(1)}
          disabled={reacting}
          className={`flex items-center gap-1.5 text-sm transition-colors group ${
            userReaction === 1
              ? 'text-emerald-600 font-semibold'
              : 'text-slate-500 hover:text-emerald-600'
          } ${reacting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <ThumbsUp size={18} className={userReaction === 1 ? 'fill-current' : ''} />
          <span>Корисно</span>
          {likesCount > 0 && (
            <span className="text-xs">{likesCount}</span>
          )}
        </button>
        <button
          onClick={() => handleReaction(-1)}
          disabled={reacting}
          className={`flex items-center gap-1.5 text-sm transition-colors group ${
            userReaction === -1
              ? 'text-red-500 font-semibold'
              : 'text-slate-500 hover:text-red-500'
          } ${reacting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <ThumbsDown size={18} className={userReaction === -1 ? 'fill-current' : ''} />
          {dislikesCount > 0 && (
            <span className="text-xs">{dislikesCount}</span>
          )}
        </button>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={checkAuth}
      />
    </>
  );
}
