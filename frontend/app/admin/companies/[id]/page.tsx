'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getAdminCompany, updateAdminCompany, deleteAdminCompany, getCategories } from '@/lib/api';
import { toast } from '@/lib/toast';
import { getErrorMessage, getErrorType } from '@/lib/errorMessages';
import { ArrowLeft, Save, Camera, Star, MessageSquare, Calendar, Tag, MapPin, Building2, X, Trash2 } from 'lucide-react';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { CompanyLogo } from '@/components/company/CompanyLogo';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { AdminCompanyFormSkeleton } from '@/components/ui/Skeletons';

interface Company {
  id: string;
  name: string;
  slug: string;
  description: string;
  city: string;
  logoUrl: string | null;
  categoryId: string;
  rating: number;
  reviewCount: number;
  createdAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function AdminCompanyEditPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;

  const [company, setCompany] = useState<Company | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    city: '',
    categoryId: '',
  });

  const [originalData, setOriginalData] = useState({
    name: '',
    slug: '',
    description: '',
    city: '',
    categoryId: '',
    logoUrl: null as string | null,
  });
  const [slugChangeModal, setSlugChangeModal] = useState<{
    isOpen: boolean;
    oldSlug: string;
    newSlug: string;
  }>({
    isOpen: false,
    oldSlug: '',
    newSlug: '',
  });
  const [pendingFormData, setPendingFormData] = useState<typeof formData | null>(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadData();
  }, [companyId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [companyData, categoriesData] = await Promise.all([
        getAdminCompany(companyId),
        getCategories(),
      ]);
      setCompany(companyData);
      setCategories(categoriesData);
      setFormData({
        name: companyData.name,
        slug: companyData.slug,
        description: companyData.description,
        city: companyData.city,
        categoryId: companyData.categoryId,
      });
      setOriginalData({
        name: companyData.name,
        slug: companyData.slug,
        description: companyData.description,
        city: companyData.city,
        categoryId: companyData.categoryId,
        logoUrl: companyData.logoUrl,
      });
      setLogoPreview(companyData.logoUrl);
    } catch (err: any) {
      toast.error('Не вдалося завантажити об\'єкт');
      router.push('/admin/companies');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.warning('Дозволені тільки файли: jpg, jpeg, png, webp');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.warning('Розмір файлу не повинен перевищувати 2MB');
      return;
    }

    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(originalData.logoUrl);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const hasChanges = () => {
    return (
      formData.name !== originalData.name ||
      formData.slug !== originalData.slug ||
      formData.description !== originalData.description ||
      formData.city !== originalData.city ||
      formData.categoryId !== originalData.categoryId ||
      logoFile !== null
    );
  };

  const handleSave = async () => {
    if (!hasChanges()) {
      toast.info('Немає змін для збереження');
      return;
    }

    if (formData.slug !== originalData.slug) {
      setPendingFormData(formData);
      setSlugChangeModal({
        isOpen: true,
        oldSlug: originalData.slug,
        newSlug: formData.slug,
      });
      return;
    }

    await saveCompany(formData);
  };

  const handleConfirmSlugChange = async () => {
    if (pendingFormData) {
      setSlugChangeModal({ isOpen: false, oldSlug: '', newSlug: '' });
      await saveCompany(pendingFormData);
      setPendingFormData(null);
    }
  };

  const saveCompany = async (dataToSave: typeof formData) => {
    try {
      setSaving(true);
      const updateData: any = {};
      
      updateData.name = dataToSave.name;
      updateData.slug = dataToSave.slug;
      updateData.description = dataToSave.description;
      updateData.city = dataToSave.city;
      updateData.categoryId = dataToSave.categoryId;
      if (logoFile) {
        updateData.logo = logoFile;
      }

      const result = await updateAdminCompany(companyId, updateData);

      try {
        if (result.oldSlug) {
          await fetch(`/api/revalidate?tag=company:${result.oldSlug}`, { method: 'POST' }).catch(() => {});
        }
        await fetch(`/api/revalidate?tag=company:${result.company.slug}`, { method: 'POST' }).catch(() => {});
        await fetch(`/api/revalidate?tag=companies`, { method: 'POST' }).catch(() => {});
        await fetch(`/api/revalidate?tag=category:${result.company.category.slug}`, { method: 'POST' }).catch(() => {});
      } catch (err) {
        console.error('Revalidation error:', err);
      }

      toast.success('Об\'єкт успішно оновлено');
      
      setOriginalData({
        name: result.company.name,
        slug: result.company.slug,
        description: result.company.description,
        city: result.company.city,
        categoryId: result.company.categoryId,
        logoUrl: result.company.logoUrl,
      });
      setLogoFile(null);
      setLogoPreview(result.company.logoUrl);
      
      await loadData();
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      const errorType = getErrorType(err.status, err.errorCode);
      toast[errorType](errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!company) return;
    
    try {
      setDeleting(true);
      await deleteAdminCompany(companyId);
      toast.success('Компанію успішно видалено');
      router.push('/admin/companies');
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      const errorType = getErrorType(err.status, err.errorCode);
      toast[errorType](errorMessage);
    } finally {
      setDeleting(false);
      setDeleteModal(false);
    }
  };

  if (loading || !company) {
    return <AdminCompanyFormSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/admin/companies"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Назад до списку компаній</span>
          </Link>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h1 className="text-3xl font-bold text-slate-900 mb-2 truncate break-words min-w-0">Редагування компанії</h1>
            <p className="text-slate-600 truncate break-words min-w-0">{company.name}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-3">Логотип</label>
              <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                <div className="shrink-0">
                  {logoPreview ? (
                    <div className="relative">
                      <CompanyLogo key={logoPreview} logoUrl={logoPreview} name={company.name} size="md" />
                      {logoFile && (
                        <button
                          onClick={handleRemoveLogo}
                          className="absolute -top-2 -right-2 size-6 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors shadow-md"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="size-24 rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                      <Building2 size={32} className="text-slate-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 w-full sm:w-auto">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleLogoChange}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors cursor-pointer text-sm sm:text-base"
                  >
                    <Camera size={18} />
                    <span>{logoFile ? 'Змінити логотип' : 'Завантажити логотип'}</span>
                  </label>
                  <p className="text-xs text-slate-500 mt-2">
                    Дозволені формати: JPG, PNG, WEBP. Максимальний розмір: 2MB
                  </p>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Назва <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none transition-all"
                placeholder="Введіть назву..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Slug (URL) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none transition-all"
                placeholder="company-slug"
              />
              <p className="text-xs text-slate-500 mt-1">
                Унікальний ідентифікатор для URL. Зміна slug може вплинути на посилання.
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Категорія <span className="text-red-500">*</span>
              </label>
              <CustomSelect
                value={formData.categoryId}
                onChange={(value) => handleInputChange('categoryId', value)}
                options={categories.map((cat) => ({
                  value: cat.id,
                  label: cat.name,
                }))}
                className="h-11"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Місто / Регіон <span className="text-red-500">*</span>
              </label>
              <CustomSelect
                value={formData.city}
                onChange={(value) => handleInputChange('city', value)}
                options={[
                  { value: 'Україна', label: 'Україна' },
                  { value: 'Весь світ', label: 'Весь світ' },
                ]}
                className="h-11"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Опис
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={6}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none transition-all resize-y"
                placeholder="Опишіть компанію..."
              />
            </div>
            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Статистика (тільки для перегляду)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Star size={18} className="text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-slate-700">Рейтинг</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900">
                    {company.rating > 0 ? company.rating.toFixed(1) : '-'}
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare size={18} className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">Відгуки</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{company.reviewCount}</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={18} className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">Створено</span>
                  </div>
                  <div className="text-sm font-semibold text-slate-900">
                    {new Date(company.createdAt).toLocaleDateString('uk-UA', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-6 border-t border-slate-200">
              <button
                onClick={handleSave}
                disabled={!hasChanges() || saving}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors shadow-sm hover:shadow-md text-sm sm:text-base"
              >
                <Save size={18} className="sm:w-5 sm:h-5" />
                <span>{saving ? 'Збереження...' : 'Зберегти зміни'}</span>
              </button>
              <Link
                href="/admin/companies"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition-colors text-sm sm:text-base"
              >
                <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
                <span>Назад</span>
              </Link>
              <button
                onClick={() => setDeleteModal(true)}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors shadow-sm hover:shadow-md text-sm sm:text-base"
              >
                <Trash2 size={18} className="sm:w-5 sm:h-5" />
                <span>Видалити</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={slugChangeModal.isOpen}
        onClose={() => {
          setSlugChangeModal({ isOpen: false, oldSlug: '', newSlug: '' });
          setPendingFormData(null);
        }}
        onConfirm={handleConfirmSlugChange}
        title="Зміна slug"
        message={`Ви змінюєте slug з "${slugChangeModal.oldSlug}" на "${slugChangeModal.newSlug}". Це може вплинути на посилання та SEO. Продовжити?`}
        confirmText="Продовжити"
        cancelText="Скасувати"
        variant="warning"
        loading={saving}
      />

      <ConfirmModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDelete}
        title="Видалити компанію?"
        message={`Ви впевнені, що хочете видалити компанію "${company.name}"? Цю дію неможливо скасувати. Всі відгуки та пов'язані дані будуть видалені.`}
        confirmText="Видалити"
        cancelText="Скасувати"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
