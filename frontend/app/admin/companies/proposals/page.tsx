'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getCompanyProposals, approveCompanyProposal, rejectCompanyProposal, getCategories, getImageSrc } from '@/lib/api';
import { toast } from '@/lib/toast';
import { getErrorMessage, getErrorType } from '@/lib/errorMessages';
import { ArrowLeft, Check, X, Building2, User, Clock, Edit2, Globe, MapPin, Tag, Mail, Calendar, Upload, Trash2 } from 'lucide-react';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { UserIdDisplay } from '@/components/ui/UserIdDisplay';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { AdminCompanySkeleton } from '@/components/ui/Skeletons';

interface CompanyProposal {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  website: string | null;
  city: string;
  status: string;
  createdAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

const ITEMS_PER_PAGE = 20;

export default function AdminCompanyProposalsPage() {
  const [proposals, setProposals] = useState<CompanyProposal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [editData, setEditData] = useState<{
    name: string;
    slug: string;
    description: string;
    website: string;
    city: string;
    categoryId: string;
    logoFile: File | null;
    logoPreview: string | null;
    removeLogo: boolean;
  } | null>(null);
  const [rejectProposalId, setRejectProposalId] = useState<string | null>(null);

  const loadData = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setOffset(0);
        setProposals([]);
        setHasMore(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);
      
      const currentOffset = reset ? 0 : offset;
      const [proposalsData, categoriesData] = await Promise.all([
        getCompanyProposals({
          limit: ITEMS_PER_PAGE,
          offset: currentOffset,
        }),
        reset ? getCategories() : Promise.resolve(categories),
      ]);
      
      if (reset) {
        setProposals(proposalsData);
        setCategories(categoriesData);
      } else {
        setProposals(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const newItems = proposalsData.filter(p => !existingIds.has(p.id));
          return [...prev, ...newItems];
        });
      }
      
      setHasMore(proposalsData.length === ITEMS_PER_PAGE);
      setOffset(currentOffset + proposalsData.length);
    } catch (err: any) {
      setError(err.message || 'Failed to load proposals');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      loadData(false);
    }
  };

  useEffect(() => {
    loadData(true);
  }, []);

  const handleStartEdit = (proposal: CompanyProposal) => {
    setEditingId(proposal.id);
    setEditData({
      name: proposal.name,
      slug: proposal.slug,
      description: proposal.description || '',
      website: proposal.website || '',
      city: proposal.city,
      categoryId: proposal.category.id,
      logoFile: null,
      logoPreview: proposal.logoUrl ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${proposal.logoUrl}` : null,
      removeLogo: false,
    });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editData) return;
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditData({
          ...editData,
          logoFile: file,
          logoPreview: reader.result as string,
          removeLogo: false,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    if (!editData) return;
    setEditData({
      ...editData,
      logoFile: null,
      logoPreview: null,
      removeLogo: true,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData(null);
  };

  const handleApprove = async (proposalId: string) => {
    try {
      let data: any = undefined;
      if (editData && editingId === proposalId) {
        data = {
          name: editData.name,
          slug: editData.slug,
          description: editData.description,
          website: editData.website,
          city: editData.city,
          categoryId: editData.categoryId,
          logoFile: editData.logoFile,
          removeLogo: editData.removeLogo,
        };
      }
      
      const proposal = proposals.find(p => p.id === proposalId);
      const categorySlug = proposal?.category.slug;
      
      const result = await approveCompanyProposal(proposalId, data);
      setProposals(prev => prev.filter(p => p.id !== proposalId));
      toast.success('Компанію опубліковано');
      setEditingId(null);
      setEditData(null);
      if (result.company?.slug) {
        await fetch(`/api/revalidate?tag=companies`, { method: 'POST' });
        await fetch(`/api/revalidate?tag=company:${result.company.slug}`, { method: 'POST' });
        if (categorySlug) {
          await fetch(`/api/revalidate?tag=category:${categorySlug}`, { method: 'POST' });
        }
      }
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      const errorType = getErrorType(err.status, err.errorCode);
      toast[errorType](errorMessage);
    }
  };

  const handleRejectClick = (proposalId: string) => {
    setRejectProposalId(proposalId);
  };

  const handleReject = async () => {
    if (!rejectProposalId) return;

    try {
      await rejectCompanyProposal(rejectProposalId);
      setProposals(prev => prev.filter(p => p.id !== rejectProposalId));
      toast.success('Пропозицію відхилено');
      setEditingId(null);
      setEditData(null);
      setRejectProposalId(null);
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      const errorType = getErrorType(err.status, err.errorCode);
      toast[errorType](errorMessage);
      setRejectProposalId(null);
    }
  };


  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-red-200 p-8 max-w-md text-center">
          <p className="text-red-600 font-semibold mb-4">Помилка завантаження</p>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => loadData(true)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Спробувати знову
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/admin/companies"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Назад до списку компаній</span>
          </Link>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Модерація пропозицій</h1>
            <p className="text-slate-600">
              {loading
                ? 'Завантаження...'
                : proposals.length === 0
                ? 'Немає пропозицій на модерацію'
                : `Всього пропозицій на модерацію: ${proposals.length}`}
            </p>
          </div>
        </div>
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <AdminCompanySkeleton key={i} />
            ))}
          </div>
        ) : proposals.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
            <div className="size-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Всі пропозиції оброблено!</h2>
            <p className="text-slate-600">Немає пропозицій, які потребують модерації.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {proposals.map((proposal) => {
              const isEditing = editingId === proposal.id;

              return (
                <div
                  key={proposal.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-6"
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-start gap-4 mb-4">
                        {isEditing && editData ? (
                          <div className="shrink-0">
                            {editData.logoPreview && !editData.removeLogo ? (
                              <div className="relative">
                                <img
                                  src={editData.logoPreview}
                                  alt={editData.name}
                                  loading="lazy"
                                  className="size-16 rounded-xl object-cover border border-slate-200"
                                />
                                <button
                                  onClick={handleRemoveLogo}
                                  className="absolute -top-1 -right-1 size-5 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
                                  type="button"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ) : (
                              <div className="size-16 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold">
                                <Building2 size={24} />
                              </div>
                            )}
                            <label className="mt-2 flex items-center justify-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors">
                              <Upload size={12} />
                              <span>Змінити</span>
                              <input
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                onChange={handleLogoChange}
                                className="hidden"
                              />
                            </label>
                          </div>
                        ) : proposal.logoUrl ? (
                          <div className="relative size-16 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                            <Image
                              src={getImageSrc(proposal.logoUrl)}
                              alt={`Логотип пропозиції ${proposal.name}`}
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="size-16 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold shrink-0">
                            <Building2 size={24} />
                          </div>
                        )}
                        <div className="flex-1 min-w-0 overflow-hidden">
                          {isEditing ? (
                            <div className="space-y-3">
                              <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Назва</label>
                                <input
                                  type="text"
                                  value={editData?.name || ''}
                                  onChange={(e) => setEditData({ ...editData!, name: e.target.value })}
                                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Slug</label>
                                <input
                                  type="text"
                                  value={editData?.slug || ''}
                                  onChange={(e) => setEditData({ ...editData!, slug: e.target.value })}
                                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="min-w-0 overflow-hidden">
                              <h3 className="text-xl font-bold text-slate-900 mb-2 truncate break-words min-w-0">{proposal.name}</h3>
                              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-3">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <Tag size={16} className="shrink-0" />
                                  <span className="truncate break-words min-w-0">{proposal.category.name}</span>
                                </div>
                                {proposal.website && (
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <Globe size={16} className="shrink-0" />
                                    <a href={proposal.website} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600 truncate break-all min-w-0">
                                      {proposal.website}
                                    </a>
                                  </div>
                                )}
                                <div className="flex items-center gap-1.5">
                                  <MapPin size={16} className="shrink-0" />
                                  <span className="truncate min-w-0">{proposal.city}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Clock size={16} />
                                  <span>{new Date(proposal.createdAt).toLocaleDateString('uk-UA')}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {isEditing ? (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Опис</label>
                            <textarea
                              value={editData?.description || ''}
                              onChange={(e) => setEditData({ ...editData!, description: e.target.value })}
                              className="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm resize-y"
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-slate-700 mb-1">Сайт</label>
                              <input
                                type="url"
                                value={editData?.website || ''}
                                onChange={(e) => setEditData({ ...editData!, website: e.target.value })}
                                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-700 mb-1">Місто / Регіон</label>
                              <CustomSelect
                                value={editData?.city || ''}
                                onChange={(value) => setEditData({ ...editData!, city: value })}
                                options={[
                                  { value: 'Україна', label: 'Україна' },
                                  { value: 'Весь світ', label: 'Весь світ' },
                                ]}
                                className="h-10"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Категорія</label>
                            <CustomSelect
                              value={editData?.categoryId || ''}
                              onChange={(value) => setEditData({ ...editData!, categoryId: value })}
                              options={categories.map((cat) => ({
                                value: cat.id,
                                label: cat.name,
                              }))}
                              className="h-10"
                            />
                          </div>
                        </div>
                      ) : (
                        <>
                          {proposal.description && (
                            <div className="bg-slate-50 rounded-lg p-4 mb-4 overflow-hidden">
                              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap break-words">
                                {proposal.description}
                              </p>
                            </div>
                          )}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-slate-700 min-w-0">
                              <User size={16} className="shrink-0" />
                              <span className="font-medium truncate break-words min-w-0">{proposal.user.name}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-600 pl-6 flex-wrap">
                              <div className="flex items-center gap-1 min-w-0">
                                <Mail size={12} className="shrink-0" />
                                <span className="truncate break-all min-w-0">{proposal.user.email}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar size={12} />
                                <span>Реєстрація: {new Date(proposal.user.createdAt).toLocaleDateString('uk-UA')}</span>
                              </div>
                            </div>
                            <div className="pl-6">
                              <UserIdDisplay userId={proposal.user.id} variant="compact" />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex flex-row sm:flex-col gap-2 sm:w-full lg:w-48 shrink-0">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => handleApprove(proposal.id)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors shadow-sm hover:shadow-md text-sm sm:text-base"
                          >
                            <Check size={18} className="sm:w-5 sm:h-5" />
                            <span>Опублікувати</span>
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition-colors text-sm sm:text-base"
                          >
                            <X size={18} className="sm:w-5 sm:h-5" />
                            <span>Скасувати</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleStartEdit(proposal)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-sm hover:shadow-md text-sm sm:text-base"
                          >
                            <Edit2 size={18} className="sm:w-5 sm:h-5" />
                            <span>Редагувати</span>
                          </button>
                          <button
                            onClick={() => handleApprove(proposal.id)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors shadow-sm hover:shadow-md text-sm sm:text-base"
                          >
                            <Check size={18} className="sm:w-5 sm:h-5" />
                            <span>Опублікувати</span>
                          </button>
                          <button
                            onClick={() => handleRejectClick(proposal.id)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors shadow-sm hover:shadow-md text-sm sm:text-base"
                          >
                            <X size={18} className="sm:w-5 sm:h-5" />
                            <span>Відхилити</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {!loading && proposals.length > 0 && hasMore && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm hover:shadow-md"
            >
              {loadingMore ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Завантаження...
                </>
              ) : (
                'Завантажити більше'
              )}
            </button>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={rejectProposalId !== null}
        onClose={() => setRejectProposalId(null)}
        onConfirm={handleReject}
        title="Відхилити пропозицію?"
        message="Ви впевнені, що хочете відхилити цю пропозицію? Цю дію неможливо скасувати."
        confirmText="Відхилити"
        cancelText="Скасувати"
        variant="danger"
      />
    </div>
  );
}
