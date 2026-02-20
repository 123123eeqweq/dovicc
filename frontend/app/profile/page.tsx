"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import {
  Camera,
  Edit,
  MessageSquare,
  Heart,
  Lock,
  Bell,
  LogOut,
  ThumbsUp,
  ThumbsDown,
  Trash2,
  Star,
  Plus,
  Minus,
  Check,
  X,
} from "lucide-react";
import {
  getCurrentUser,
  getUserReviews,
  deleteReview,
  uploadAvatar,
  resendActivationEmail,
  getImageSrc,
} from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";
import { getErrorMessage, getErrorType } from "@/lib/errorMessages";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { useAuth } from "@/context/AuthContext";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

interface Review {
  id: string;
  rating: number;
  text: string;
  pros: string | null;
  cons: string | null;
  status: string;
  createdAt: string;
  likesCount: number;
  dislikesCount: number;
  company: {
    id: string;
    name: string;
    slug: string;
    city: string;
    category: {
      name: string;
    };
  };
}

export default function UserProfile() {
  const [user, setUser] = useState<{
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    isEmailActivated?: boolean;
  } | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "rating_desc" | "rating_asc">(
    "newest"
  );
  const [deleteReviewId, setDeleteReviewId] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const router = useRouter();
  const { checkAuth, logout: logoutFromContext } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const loadData = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData.user);

      const reviewsData = await getUserReviews();
      setReviews(reviewsData);
      sortReviews(reviewsData, sortBy);
    } catch (error) {
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const sortReviews = (
    reviewsToSort: Review[],
    sort: "newest" | "rating_desc" | "rating_asc"
  ) => {
    const sorted = [...reviewsToSort];

    switch (sort) {
      case "newest":
        sorted.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "rating_desc":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case "rating_asc":
        sorted.sort((a, b) => a.rating - b.rating);
        break;
    }

    setReviews(sorted);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value as "newest" | "rating_desc" | "rating_asc";
    setSortBy(newSort);
    sortReviews(reviews, newSort);
  };

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    try {
      await logoutFromContext();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  

  const handleDeleteReviewClick = (reviewId: string) => {
    setDeleteReviewId(reviewId);
  };

  const handleDeleteReview = async () => {
    if (!deleteReviewId) return;

    try {
      await deleteReview(deleteReviewId);
      const reviewsData = await getUserReviews();
      sortReviews(reviewsData, sortBy);
      toast.success("Відгук видалено");
      setDeleteReviewId(null);
    } catch (error: any) {
      const errorMessage = getErrorMessage(error);
      const errorType = getErrorType(error.status, error.errorCode);
      toast[errorType](errorMessage);
      setDeleteReviewId(null);
    }
  };

  const handleResendActivationEmail = async () => {
    if (resendCooldown > 0 || resendingEmail) return;
    
    setResendingEmail(true);
    try {
      await resendActivationEmail();
      setResendCooldown(30);
      toast.success("Лист активації відправлено! Перевірте email");
      await checkAuth();
      const userData = await getCurrentUser();
      setUser(userData.user);
    } catch (error: any) {
      let errorMessage = getErrorMessage(error);
      const errorType = getErrorType(error.status, error.errorCode);
      
      if (error.remainingSeconds !== undefined && error.remainingSeconds !== null) {
        errorMessage = `Спробуйте ще раз через ${error.remainingSeconds} секунд.`;
        setResendCooldown(error.remainingSeconds);
      }
      
      toast[errorType](errorMessage);
    } finally {
      setResendingEmail(false);
    }
  };

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.warning("Дозволені тільки файли: jpg, jpeg, png, webp");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.warning("Розмір файлу не повинен перевищувати 2MB");
      return;
    }

    setUploadingAvatar(true);
    try {
      const result = await uploadAvatar(file);
      if (user) {
        setUser({ ...user, avatarUrl: result.avatarUrl });
      }
      await checkAuth();
      toast.success("Аватар успішно оновлено");
    } catch (error: any) {
      const errorMessage = getErrorMessage(error);
      const errorType = getErrorType(error.status, error.errorCode);
      toast[errorType](errorMessage);
    } finally {
      setUploadingAvatar(false);
      event.target.value = "";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Сьогодні";
    } else if (diffDays === 1) {
      return "Вчора";
    } else if (diffDays < 7) {
      return `${diffDays} дні тому`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? "тиждень" : "тижні"} тому`;
    } else {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? "місяць" : "місяці"} тому`;
    }
  };

  const getRatingStats = () => {
    const positive = reviews.filter((r) => r.rating >= 4).length;
    const negative = reviews.filter((r) => r.rating <= 2).length;
    const totalLikes = reviews.reduce((sum, r) => sum + r.likesCount, 0);
    return { positive, negative, totalLikes };
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 pt-20 pb-10 md:py-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-slate-500 font-medium">Завантаження...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const stats = getRatingStats();
  const avgRating = getAverageRating();

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 pt-20 pb-6 md:py-10">
      <Breadcrumb
        items={[
          { label: 'Головна', href: '/' },
          { label: 'Мій профіль' },
        ]}
        className="mb-6 md:mb-8"
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
        <aside className="lg:col-span-1 space-y-4 lg:space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 md:p-5 lg:p-6 flex flex-row lg:flex-col items-center lg:items-center text-center lg:text-center shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] overflow-hidden">
            <div className="flex flex-row lg:flex-col items-center gap-4 w-full min-w-0">
              <div className="relative shrink-0">
                {user.avatarUrl ? (
                  <div className="relative size-16 md:size-20 lg:size-24 rounded-full overflow-hidden border-2 border-slate-200/80">
                    <Image
                      src={getImageSrc(user.avatarUrl)}
                      alt={`Аватар профілю ${user.name}`}
                      fill
                      sizes="(max-width: 768px) 64px, (max-width: 1024px) 80px, 96px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="size-16 md:size-20 lg:size-24 rounded-full bg-emerald-50 flex items-center justify-center border-2 border-slate-200/80">
                    <span className="text-emerald-700 font-bold text-xl md:text-2xl">
                      {getInitials(user.name)}
                    </span>
                  </div>
                )}
                <label
                  htmlFor="avatar-upload"
                  className={`absolute bottom-0 right-0 size-7 md:size-8 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center cursor-pointer shadow-[0_2px_8px_-2px_rgba(5,150,105,0.4)] transition-all ${
                    uploadingAvatar ? "opacity-50 cursor-not-allowed" : ""
                  }`}>
                  <Camera size={14} className="md:w-4 md:h-4" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploadingAvatar}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="flex-1 min-w-0 w-full max-w-full text-left lg:text-center overflow-hidden">
                <h2
                  className="text-lg md:text-xl font-bold text-slate-900 truncate block"
                  title={user.name}>
                  {user.name}
                </h2>
                <p className="text-xs md:text-sm text-slate-500 truncate mt-0.5 block" title={user.email}>
                  {user.email}
                </p>
                <div className="flex gap-4 mt-2 lg:hidden justify-start">
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-bold text-slate-900">{reviews.length}</span>
                    <span className="text-[10px] text-slate-500 uppercase">Відгуки</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-bold text-slate-900">{avgRating}</span>
                    <span className="text-[10px] text-slate-500 uppercase">Середня</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full hidden lg:block">
              <button
                disabled
                className="w-full h-9 flex items-center justify-center gap-2 rounded-lg border border-slate-200 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <Edit size={16} />
                Редагувати профіль
              </button>
              <div className="w-full mt-6 pt-6 border-t border-slate-200/80 flex justify-between">
                <div className="flex flex-col items-center flex-1 border-r border-slate-200/80">
                  <span className="text-2xl font-bold text-slate-900">
                    {reviews.length}
                  </span>
                  <span className="text-xs text-slate-500 uppercase tracking-wide mt-1">
                    Відгуки
                  </span>
                </div>
                <div className="flex flex-col items-center flex-1">
                  <span className="text-2xl font-bold text-slate-900">
                    {avgRating}
                  </span>
                  <span className="text-xs text-slate-500 uppercase tracking-wide mt-1">
                    Середня
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)]">
            <div className="p-3 md:p-4 border-b border-slate-200/80">
              <h3 className="font-semibold text-slate-900 text-sm md:text-base">Налаштування</h3>
            </div>
            <nav className="flex flex-col p-2">
              <Link
                href="#"
                className="flex items-center gap-2 md:gap-3 px-2.5 md:px-3 py-2 md:py-2.5 rounded-xl bg-emerald-50 text-emerald-600 font-medium transition-colors text-sm md:text-base">
                <MessageSquare size={18} className="shrink-0 md:w-5 md:h-5" />
                Мої відгуки
              </Link>
              <button
                disabled
                className="flex items-center gap-2 md:gap-3 px-2.5 md:px-3 py-2 md:py-2.5 rounded-xl text-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left w-full text-sm md:text-base">
                <Heart size={18} className="shrink-0 md:w-5 md:h-5" />
                Збережене
              </button>
              <button
                disabled
                className="flex items-center gap-2 md:gap-3 px-2.5 md:px-3 py-2 md:py-2.5 rounded-xl text-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left w-full text-sm md:text-base">
                <Lock size={18} className="shrink-0 md:w-5 md:h-5" />
                Зміна пароля
              </button>
              <button
                disabled
                className="flex items-center gap-2 md:gap-3 px-2.5 md:px-3 py-2 md:py-2.5 rounded-xl text-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left w-full text-sm md:text-base">
                <Bell size={18} className="shrink-0 md:w-5 md:h-5" />
                Сповіщення
              </button>
              <div className="my-2 border-t border-slate-200/80"></div>
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="flex w-full items-center gap-2 md:gap-3 px-2.5 md:px-3 py-2 md:py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors text-left text-sm md:text-base">
                <LogOut size={18} className="shrink-0 md:w-5 md:h-5" />
                Вийти
              </button>
            </nav>
          </div>
        </aside>

        <div className="lg:col-span-3">
          {user && !user.isEmailActivated && (
            <div className="mb-4 md:mb-6 p-4 md:p-5 bg-amber-50 border border-amber-200/80 rounded-xl">
              <div className="flex items-start justify-between gap-3 md:gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-amber-900 mb-1 text-sm md:text-base">
                    Email не активовано
                  </h3>
                  <p className="text-xs md:text-sm text-amber-800 mb-3">
                    Будь ласка, активуйте ваш email перед написанням відгуків. Перевірте вашу пошту та натисніть на посилання для активації.
                  </p>
                  <button
                    onClick={handleResendActivationEmail}
                    disabled={resendCooldown > 0 || resendingEmail}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm">
                    {resendingEmail
                      ? "Відправляємо лист..."
                      : resendCooldown > 0
                      ? `Відправити повторно (${resendCooldown}с)`
                      : "Відправити лист активації повторно"}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4 mb-6 md:mb-8">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-0.5">Профіль</p>
              <h1 className="text-xl md:text-3xl font-bold text-slate-900">
                Мої відгуки
              </h1>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-sm text-slate-500 shrink-0">
                Сортувати:
              </span>
              <CustomSelect
                value={sortBy}
                onChange={(value) => {
                  const newSort = value as
                    | "newest"
                    | "rating_desc"
                    | "rating_asc";
                  setSortBy(newSort);
                  sortReviews(reviews, newSort);
                }}
                options={[
                  { value: "newest", label: "Найновіші" },
                  { value: "rating_desc", label: "Найвищий рейтинг" },
                  { value: "rating_asc", label: "Найнижчий рейтинг" },
                ]}
                className="h-9 min-w-0 flex-1 sm:flex-initial sm:min-w-[160px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 md:mb-8">
            <div className="bg-white p-3 sm:p-5 rounded-xl border border-slate-200/80 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-4 text-center sm:text-left">
              <div className="size-10 sm:size-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-slate-200/80 shrink-0">
                <ThumbsUp size={20} className="sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold text-slate-900">
                  {stats.positive}
                </p>
                <p className="text-xs sm:text-sm text-slate-500">Позитивних</p>
              </div>
            </div>
            <div className="bg-white p-3 sm:p-5 rounded-xl border border-slate-200/80 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-4 text-center sm:text-left">
              <div className="size-10 sm:size-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-slate-200/80 shrink-0">
                <Heart size={20} className="sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold text-slate-900">
                  {stats.totalLikes}
                </p>
                <p className="text-xs sm:text-sm text-slate-500">Лайків</p>
              </div>
            </div>
            <div className="bg-white p-3 sm:p-5 rounded-xl border border-slate-200/80 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-4 text-center sm:text-left">
              <div className="size-10 sm:size-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-slate-200/80 shrink-0">
                <ThumbsDown size={20} className="sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold text-slate-900">
                  {stats.negative}
                </p>
                <p className="text-xs sm:text-sm text-slate-500">Негативних</p>
              </div>
            </div>
          </div>

          {reviews.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-8 md:p-16 text-center shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)]">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-slate-100 flex items-center justify-center">
                <MessageSquare size={32} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                У вас ще немає відгуків
              </h3>
              <p className="text-slate-500 mb-6">
                Почніть ділитися своїм досвідом з іншими
              </p>
              <Link
                href="/review/add"
                className="inline-flex items-center justify-center px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors shadow-[0_2px_8px_-2px_rgba(5,150,105,0.4)]">
                Написати відгук
              </Link>
            </div>
          ) : (
            <div className="space-y-4 md:space-y-6">
              {reviews.map((review) => {
                const companyInitials = review.company.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .substring(0, 2);

                const isPending = review.status === "pending";
                const isRejected = review.status === "rejected";
                const isApproved = review.status === "approved";
                const date = new Date(review.createdAt).toLocaleDateString(
                  "uk-UA",
                  { day: "numeric", month: "long", year: "numeric" }
                );

                let borderClass = "border-slate-200";
                let bgClass = "bg-white";
                if (isPending) {
                  borderClass = "border-yellow-300";
                  bgClass = "bg-yellow-50/30";
                } else if (isRejected) {
                  borderClass = "border-red-300";
                  bgClass = "bg-red-50/30";
                } else if (isApproved) {
                  borderClass = "border-emerald-300";
                  bgClass = "bg-emerald-50/30";
                }

                return (
                  <article
                    key={review.id}
                    className={`${bgClass} rounded-2xl border ${borderClass} p-4 md:p-6 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.1)] transition-all duration-300 max-w-full overflow-hidden relative`}>
                    {isRejected && (
                      <div className="absolute top-3 right-3 md:top-4 md:right-4">
                        <span className="text-xs text-red-700 bg-red-100 px-2.5 py-1 rounded-full font-semibold border border-red-200">
                          Відхилений
                        </span>
                      </div>
                    )}
                    {isApproved && (
                      <div className="absolute top-3 right-3 md:top-4 md:right-4">
                        <span className="text-xs text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full font-semibold border border-emerald-200">
                          Схвалено
                        </span>
                      </div>
                    )}
                    <div className="flex items-start justify-between mb-3 md:mb-4">
                      <div className="flex items-center gap-3 md:gap-4 min-w-0">
                        <div className="size-10 md:size-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200/80">
                          <span className="font-bold text-slate-700">
                            {companyInitials}
                          </span>
                        </div>
                        <div>
                          <Link href={`/company/${review.company.slug}`}>
                            <h4 className="font-bold text-slate-900 hover:text-emerald-600 transition-colors">
                              {review.company.name}
                            </h4>
                          </Link>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="flex text-yellow-400">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={14}
                                  className={
                                    i < review.rating
                                      ? "fill-current"
                                      : "text-slate-200"
                                  }
                                />
                              ))}
                            </div>
                            <span className="text-xs text-slate-400">
                              • {date}
                            </span>
                            {isPending && (
                              <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full font-medium">
                                На модерації
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4 max-w-3xl">
                      <p className="text-slate-700 leading-relaxed break-words">
                        {review.text}
                      </p>
                    </div>

                    {(review.pros || review.cons) && (
                      <div className="mb-3 md:mb-4 grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                        {review.pros && (
                          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 md:p-4">
                            <div className="flex items-center gap-2.5 mb-3">
                              <div className="size-7 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
                                <Plus
                                  size={16}
                                  className="text-white stroke-[2.5]"
                                />
                              </div>
                              <h5 className="text-sm font-semibold text-emerald-900">
                                Плюси
                              </h5>
                            </div>
                            <div className="space-y-2">
                              {review.pros
                                .split("\n")
                                .filter((line) => line.trim()).length > 0 ? (
                                review.pros
                                  .split("\n")
                                  .filter((line) => line.trim())
                                  .map((line, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-start gap-2">
                                      <Check
                                        size={16}
                                        className="text-emerald-600 mt-0.5 flex-shrink-0"
                                      />
                                      <span className="text-sm text-emerald-800 leading-relaxed break-words">
                                        {line.trim()}
                                      </span>
                                    </div>
                                  ))
                              ) : (
                                <div className="flex items-start gap-2">
                                  <Check
                                    size={16}
                                    className="text-emerald-600 mt-0.5 flex-shrink-0"
                                  />
                                  <span className="text-sm text-emerald-800 leading-relaxed break-words">
                                    {review.pros}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        {review.cons && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3 md:p-4">
                            <div className="flex items-center gap-2.5 mb-3">
                              <div className="size-7 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0">
                                <Minus
                                  size={16}
                                  className="text-white stroke-[2.5]"
                                />
                              </div>
                              <h5 className="text-sm font-semibold text-red-900">
                                Мінуси
                              </h5>
                            </div>
                            <div className="space-y-2">
                              {review.cons
                                .split("\n")
                                .filter((line) => line.trim()).length > 0 ? (
                                review.cons
                                  .split("\n")
                                  .filter((line) => line.trim())
                                  .map((line, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-start gap-2">
                                      <X
                                        size={16}
                                        className="text-red-600 mt-0.5 flex-shrink-0"
                                      />
                                      <span className="text-sm text-red-800 leading-relaxed break-words">
                                        {line.trim()}
                                      </span>
                                    </div>
                                  ))
                              ) : (
                                <div className="flex items-start gap-2">
                                  <X
                                    size={16}
                                    className="text-red-600 mt-0.5 flex-shrink-0"
                                  />
                                  <span className="text-sm text-red-800 leading-relaxed break-words">
                                    {review.cons}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-slate-200/80">
                      <span className="text-xs text-slate-400">
                        {formatDate(review.createdAt)}
                      </span>
                      <button
                        onClick={() => handleDeleteReviewClick(review.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-red-500 transition-colors text-sm">
                        <Trash2 size={16} />
                        Видалити
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteReviewId !== null}
        onClose={() => setDeleteReviewId(null)}
        onConfirm={handleDeleteReview}
        title="Видалити відгук?"
        message="Ви впевнені, що хочете видалити цей відгук? Цю дію неможливо скасувати."
        confirmText="Видалити"
        cancelText="Скасувати"
        variant="danger"
      />
      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Вийти з акаунту?"
        message="Ви впевнені, що хочете вийти?"
        confirmText="Так, вийти"
        cancelText="Скасувати"
        variant="danger"
      />
    </div>
  );
}
