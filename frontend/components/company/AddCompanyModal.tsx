'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Upload, Building2 } from 'lucide-react';
import { proposeCompany, createAdminCompany, getCategories } from '@/lib/api';
import { toast } from '@/lib/toast';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { generateSlug } from '@/lib/slug';

interface AddCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (companyName: string) => void;
  isAdmin?: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export function AddCompanyModal({ isOpen, onClose, onSuccess, isAdmin = false }: AddCompanyModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [website, setWebsite] = useState('');
  const [city, setCity] = useState('Україна');
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadCategories();
      
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      const originalBodyOverflow = document.body.style.overflow;
      const originalBodyPaddingRight = document.body.style.paddingRight;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.documentElement.style.overflow = 'hidden';
      
      const preventScroll = (e: Event) => {
        const target = e.target as Element;
        if (target?.closest?.('[data-allow-scroll]')) return;
        e.preventDefault();
        e.stopPropagation();
      };
      
      document.addEventListener('wheel', preventScroll, { passive: false });
      document.addEventListener('touchmove', preventScroll, { passive: false });
      document.addEventListener('scroll', preventScroll, { passive: false });
      
      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.body.style.paddingRight = originalBodyPaddingRight;
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.removeEventListener('wheel', preventScroll);
        document.removeEventListener('touchmove', preventScroll);
        document.removeEventListener('scroll', preventScroll);
      };
    }
  }, [isOpen]);

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      toast.error('Не вдалося завантажити категорії');
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Дозволені тільки файли jpg, jpeg, png та webp');
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        toast.error('Розмір файлу не повинен перевищувати 2MB');
        return;
      }

      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || name.trim().length < 2 || name.trim().length > 100) {
      setError('Назва повинна містити від 2 до 100 символів');
      return;
    }

    const slug = generateSlug(name.trim());
    if (!slug || slug.length < 2) {
      setError('Назва повинна містити достатньо символів для формування посилання');
      return;
    }

    if (!categoryId) {
      setError('Оберіть категорію');
      return;
    }

    setLoading(true);

    try {
      if (isAdmin) {
        const result = await createAdminCompany({
          name: name.trim(),
          slug,
          description: description.trim() || undefined,
          categoryId,
          city: city.trim() || 'Україна',
          logo: logo || undefined,
        });

        toast.success('Компанія успішно додана!');
      } else {
        const result = await proposeCompany({
          name: name.trim(),
          slug,
          description: description.trim() || undefined,
          categoryId,
          website: website.trim() || undefined,
          city: city.trim() || 'Україна',
          logo: logo || undefined,
        });

        toast.success('Дякуємо! Відправлено на перевірку');
      }
      
      setName('');
      setDescription('');
      setCategoryId('');
      setWebsite('');
      setCity('Україна');
      setLogo(null);
      setLogoPreview(null);
      
      onSuccess?.(name.trim());
      onClose();
    } catch (err: any) {
      console.error('Error submitting form:', err);
      const errorMessage = err.message || 'Помилка при відправці заявки';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full shadow-[0_24px_80px_-12px_rgba(0,0,0,0.25)] border border-slate-200/80 max-h-[90vh] overflow-hidden flex flex-col" 
        onClick={(e) => e.stopPropagation()}
        data-allow-scroll
      >
        <div className="flex items-center justify-between px-6 md:px-8 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Building2 size={20} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{isAdmin ? 'Додати компанію' : 'Додати компанію'}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{isAdmin ? 'Створення нової компанії' : 'Відправити на перевірку модератору'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="size-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-6 md:px-8 py-6 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm font-medium">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Основна інформація</span>
              
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                  Назва <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 transition-all outline-none text-[15px]"
                  placeholder="Введіть назву..."
                  required
                  minLength={2}
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="category" className="block text-sm font-medium text-slate-700">
                  Категорія <span className="text-red-500">*</span>
                </label>
                <CustomSelect
                  value={categoryId}
                  onChange={setCategoryId}
                  placeholder="Оберіть категорію"
                  options={categories.map((cat) => ({
                    value: cat.id,
                    label: cat.name,
                  }))}
                  className="text-[15px]"
                />
              </div>
            </div>
            <div className="space-y-4">
              <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Додатково</span>
              
              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-medium text-slate-600">
                  Опис <span className="text-slate-400 font-normal">(опціонально)</span>
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full min-h-[100px] p-4 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 transition-all resize-y outline-none text-[15px]"
                  placeholder="Короткий опис компанії..."
                />
              </div>

              <div className={`grid grid-cols-1 ${isAdmin ? '' : 'md:grid-cols-2'} gap-4`}>
                {!isAdmin && (
                  <div className="space-y-2">
                    <label htmlFor="website" className="block text-sm font-medium text-slate-600">
                      Сайт <span className="text-slate-400 font-normal">(опціонально)</span>
                    </label>
                    <input
                      id="website"
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 transition-all outline-none text-[15px]"
                      placeholder="https://example.com"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="city" className="block text-sm font-medium text-slate-600">
                    Місто / Регіон
                  </label>
                  <CustomSelect
                    value={city}
                    onChange={setCity}
                    placeholder="Оберіть місто або регіон"
                    options={[
                      { value: 'Україна', label: 'Україна' },
                      { value: 'Весь світ', label: 'Весь світ' },
                    ]}
                    className="text-[15px]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-600">
                  Логотип <span className="text-slate-400 font-normal">(опціонально)</span>
                </label>
                <label
                  htmlFor="logo"
                  className={`flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed transition-colors cursor-pointer ${
                    logoPreview 
                      ? 'border-emerald-200 bg-emerald-50/50' 
                      : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <input
                    id="logo"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  {logoPreview ? (
                    <>
                      <img
                        src={logoPreview}
                        alt="Попередній перегляд логотипу компанії"
                        loading="lazy"
                        className="size-20 object-cover rounded-xl border border-slate-200"
                      />
                      <span className="text-sm font-medium text-emerald-700">Змінити зображення</span>
                    </>
                  ) : (
                    <>
                      <div className="size-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
                        <Upload size={22} className="text-slate-400" />
                      </div>
                      <span className="text-sm font-medium text-slate-600">Завантажити логотип</span>
                      <span className="text-xs text-slate-500">JPG, PNG, WEBP. Макс. 2MB</span>
                    </>
                  )}
                </label>
              </div>
            </div>
          </div>
          <div className="sticky bottom-0 px-6 md:px-8 py-4 bg-white border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto h-11 px-6 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 hover:border-slate-300 transition-colors"
            >
              Скасувати
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim() || !categoryId}
              className="w-full sm:w-auto h-11 px-8 flex items-center justify-center rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_2px_8px_-2px_rgba(5,150,105,0.4)]"
            >
              {loading ? (isAdmin ? 'Створення...' : 'Відправка...') : (isAdmin ? 'Створити компанію' : 'Відправити на перевірку')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (typeof window === 'undefined') {
    return null;
  }

  return createPortal(modalContent, document.body);
}
