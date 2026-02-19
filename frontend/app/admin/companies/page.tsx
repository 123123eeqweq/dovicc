'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAdminCompanies, getCategories, createAdminCompany } from '@/lib/api';
import { toast } from '@/lib/toast';
import { ArrowLeft, Search, Edit, Building2, Star, MessageSquare, MapPin, Tag, Plus } from 'lucide-react';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { CompanyLogo } from '@/components/company/CompanyLogo';
import { AddCompanyModal } from '@/components/company/AddCompanyModal';
import { AdminCompanyTableSkeleton } from '@/components/ui/Skeletons';

interface Company {
  id: string;
  name: string;
  slug: string;
  city: string;
  rating: number;
  reviewCount: number;
  logoUrl: string | null;
  createdAt: string;
  category: {
    id: string;
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

const ITEMS_PER_PAGE = 50;

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    loadCompanies(true);
  }, [debouncedSearch, selectedCategory]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const loadCompanies = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setOffset(0);
        setCompanies([]);
        setHasMore(true);
      } else {
        setLoadingMore(true);
      }
      
      const currentOffset = reset ? 0 : offset;
      const { companies: data, total } = await getAdminCompanies({
        search: debouncedSearch || undefined,
        categoryId: selectedCategory || undefined,
        limit: ITEMS_PER_PAGE,
        offset: currentOffset,
      });
      
      setTotalCount(total);
      if (reset) {
        setCompanies(data);
      } else {
        setCompanies(prev => {
          const existingIds = new Set(prev.map(c => c.id));
          const newItems = data.filter(c => !existingIds.has(c.id));
          return [...prev, ...newItems];
        });
      }
      
      setHasMore(data.length === ITEMS_PER_PAGE);
      setOffset(currentOffset + data.length);
    } catch (err: any) {
      toast.error('Не вдалося завантажити компанії');
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      loadCompanies(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Назад до панелі адміністратора</span>
          </Link>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Управління компаніями</h1>
                <p className="text-slate-600">
                  {loading
                    ? 'Завантаження...'
                    : <>Всього компаній: <span className="font-semibold text-slate-900">{totalCount}</span></>}
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors shadow-sm hover:shadow-md"
              >
                <Plus size={20} />
                <span>Додати компанію</span>
              </button>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Пошук за назвою, описом або містом..."
                className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none transition-all"
              />
            </div>
            <CustomSelect
              value={selectedCategory}
              onChange={(value) => setSelectedCategory(value)}
              options={[
                { value: '', label: 'Всі категорії' },
                ...categories.map((cat) => ({
                  value: cat.id,
                  label: cat.name,
                })),
              ]}
              className="h-10"
            />
          </div>
        </div>
        {loading ? (
          <AdminCompanyTableSkeleton />
        ) : companies.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
            <div className="size-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Компанії не знайдено</h2>
            <p className="text-slate-600">
              {debouncedSearch || selectedCategory
                ? 'Спробуйте змінити параметри пошуку'
                : 'Поки що немає жодної компанії'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Компанія
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider hidden md:table-cell">
                        Категорія
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider hidden lg:table-cell">
                        Місто
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Рейтинг
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider hidden sm:table-cell">
                        Відгуки
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider hidden lg:table-cell">
                        Створено
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Дії
                      </th>
                    </tr>
                  </thead>
                <tbody className="divide-y divide-slate-200">
                  {companies.map((company) => (
                    <tr key={company.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3 sm:px-6 py-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <CompanyLogo logoUrl={company.logoUrl} name={company.name} size="sm" variant="simple" />
                          <div className="min-w-0 flex-1 overflow-hidden">
                            <div className="font-semibold text-slate-900 truncate break-words text-sm sm:text-base min-w-0">{company.name}</div>
                            <div className="text-xs text-slate-500 truncate break-all hidden sm:block min-w-0">{company.slug}</div>
                            <div className="text-xs text-slate-500 sm:hidden flex items-center gap-1 mt-0.5 min-w-0">
                              <Tag size={12} className="text-slate-400 shrink-0" />
                              <span className="truncate break-words min-w-0">{company.category.name}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 hidden md:table-cell">
                        <div className="flex items-center gap-2 min-w-0">
                          <Tag size={16} className="text-slate-400 shrink-0" />
                          <span className="text-sm text-slate-700 truncate break-words min-w-0">{company.category.name}</span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 hidden lg:table-cell">
                        <div className="flex items-center gap-2 min-w-0">
                          <MapPin size={16} className="text-slate-400 shrink-0" />
                          <span className="text-sm text-slate-700 truncate min-w-0">{company.city}</span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Star size={14} className="text-yellow-400 fill-current shrink-0" />
                          <span className="text-sm font-semibold text-slate-900 whitespace-nowrap">
                            {company.rating > 0 ? company.rating.toFixed(1) : '-'}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-center hidden sm:table-cell">
                        <div className="flex items-center justify-center gap-1">
                          <MessageSquare size={16} className="text-slate-400 shrink-0" />
                          <span className="text-sm text-slate-700">{company.reviewCount}</span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 hidden lg:table-cell">
                        <span className="text-sm text-slate-600 whitespace-nowrap">{formatDate(company.createdAt)}</span>
                      </td>
                      <td className="px-3 sm:px-6 py-4">
                        <div className="flex items-center justify-center">
                          <Link
                            href={`/admin/companies/${company.id}`}
                            className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors shadow-sm hover:shadow-md whitespace-nowrap"
                          >
                            <Edit size={14} className="sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Редагувати</span>
                            <span className="sm:hidden">Редаг.</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          </div>
        )}
        {!loading && companies.length > 0 && hasMore && (
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

      <AddCompanyModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={async (companyName) => {
          toast.success(`Компанія "${companyName}" успішно додана!`);
          await loadCompanies(true);
        }}
        isAdmin={true}
      />
    </div>
  );
}
