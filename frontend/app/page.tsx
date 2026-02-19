import Link from 'next/link';
import Image from 'next/image';
import { Search, ArrowRight, Search as SearchIcon, MessageSquare, PenTool, ChevronDown } from 'lucide-react';
import { CategoryImage } from '@/components/categories/CategoryImage';
import { CompanyCard } from '@/components/company/CompanyCard';
import { HeroSearch } from '@/components/search/HeroSearch';
import { CommunityCTA } from '@/components/ui/CommunityCTA';
import { getCompanies, getCategories } from '@/lib/api';
import { truncateDescription, getHreflangAlternates } from '@/lib/seo';
import { BASE_URL } from '@/lib/constants';
import type { Metadata } from 'next';

export const revalidate = 60;

const desc = truncateDescription('Реальні відгуки про компанії, сервіси, події та медіа України. Читайте чесні відгуки та приймайте правильні рішення.');

export const metadata: Metadata = {
  title: 'DOVI — Відгуки про об\'єкти та сервіси України',
  description: desc,
  keywords: ['відгуки України', 'рейтинг компаній', 'відгуки клієнтів', 'компанії України', 'dovi', 'dovi.com.ua'],
  openGraph: {
    title: 'DOVI — Відгуки про об\'єкти та сервіси України',
    description: desc,
    url: BASE_URL,
    siteName: 'DOVI',
    images: [
      {
        url: `${BASE_URL}/images/logo.png`,
        width: 1200,
        height: 630,
        alt: 'DOVI — Платформа відгуків',
      },
    ],
    locale: 'uk_UA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DOVI — Відгуки про об\'єкти та сервіси України',
    description: desc,
    images: [`${BASE_URL}/images/logo.png`],
  },
  alternates: {
    canonical: BASE_URL,
    languages: getHreflangAlternates(BASE_URL),
  },
};

export default async function Home() {
  let companies: Awaited<ReturnType<typeof getCompanies>> = [];
  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  
  try {
    [companies, categories] = await Promise.all([
      getCompanies({ limit: 12, sort: 'reviews_desc', cache: 'no-store' }),
      getCategories(),
    ]);
  } catch (error) {
    if (error instanceof Error && error.message !== 'CONNECTION_ERROR') {
      console.error('Error fetching data:', error);
    }
  }
  return (
    <>
      <section
        className="relative py-20 lg:py-28 overflow-hidden bg-gradient-to-b from-emerald-50 via-teal-50/90 to-slate-100"
        style={{ zIndex: 1000 }}
      >
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-2/3 bg-gradient-to-b from-emerald-100/40 via-teal-100/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-slate-200/50 to-transparent" />
          <div className="absolute top-0 -left-4 w-96 h-96 bg-emerald-400/25 rounded-full mix-blend-multiply filter blur-[100px] opacity-90 animate-float-subtle" />
          <div className="absolute top-0 -right-4 w-96 h-96 bg-teal-400/25 rounded-full mix-blend-multiply filter blur-[100px] opacity-90 animate-float-subtle" style={{ animationDelay: '2s' }} />
          <div className="absolute -bottom-16 left-1/3 w-80 h-80 bg-emerald-300/20 rounded-full mix-blend-multiply filter blur-[80px] opacity-80 animate-float-subtle" style={{ animationDelay: '4s' }} />
        </div>
        
        <div className="relative max-w-[1200px] mx-auto px-4 md:px-8 text-center" style={{ zIndex: 1001 }}>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight mb-6 leading-[1.1] pt-6 md:pt-0">
            Реальні відгуки про <br />
            <span className="relative inline-block">
              <span className="text-emerald-600">
                все, що важливо
              </span>
              <Image src="/images/flag.png" alt="Прапор України" width={44} height={44} className="inline-block w-8 h-8 md:w-10 md:h-10 lg:w-11 lg:h-11 align-middle ml-3" />
            </span>
          </h1>
          <p className="text-base md:text-xl text-slate-600 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
            Знаходьте перевірені компанії, події, медіа та інше. Читайте чесні відгуки та приймайте правильні рішення.
          </p>

          <div className="mb-12">
            <HeroSearch />
          </div>

          <div className="flex flex-col items-center gap-3 w-fit max-w-full mx-auto">
            <div className="flex items-center justify-center md:justify-between w-full gap-4">
              <span className="hidden md:inline text-xs uppercase tracking-widest text-slate-400 font-semibold">Популярні категорії</span>
              <Link
                href="/categories"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors group shrink-0"
              >
                Дивитися всі категорії
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
            <div className="flex flex-wrap justify-center gap-2 w-full">
              {categories.slice(0, 4).map(category => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="group flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/80 backdrop-blur-sm border border-emerald-200/80 text-slate-700 font-medium text-sm shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] hover:bg-emerald-600 hover:text-white hover:border-emerald-600 hover:shadow-[0_4px_20px_-4px_rgba(5,150,105,0.35)] transition-all duration-300"
                >
                  <span className="relative size-6 rounded-full overflow-hidden shrink-0 bg-slate-200">
                    <CategoryImage
                      slug={category.slug}
                      className="object-cover"
                      sizes="24px"
                    />
                  </span>
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <a
          href="#popular"
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0 text-emerald-600 hover:text-emerald-500 transition-colors"
          aria-label="Дивитися далі"
        >
          <ChevronDown size={24} className="animate-float-chevron -mb-2" />
          <ChevronDown size={24} className="animate-float-chevron" style={{ animationDelay: '0.15s' }} />
        </a>
      </section>

      <section id="popular" className="py-16 lg:py-20 bg-white border-t border-slate-200/80" style={{ position: 'relative', zIndex: 0 }}>
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Популярні</h2>
              <p className="text-slate-600">
                Найчастіше переглядають наші користувачі цього тижня.
              </p>
            </div>
            <Link href="/categories" className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-semibold transition-colors group">
              Всі категорії
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 lg:gap-6">
            {companies.map(company => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-slate-50/80 relative" style={{ zIndex: 0 }}>
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">Як це працює</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Проста та прозора платформа для обміну досвідом. Всього три кроки до правильного вибору.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/80 shadow-[0_2px_20px_-5px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all duration-300 group">
              <div className="w-16 h-16 mx-auto bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                <SearchIcon className="text-emerald-600 w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Знайдіть те, що шукаєте</h3>
              <p className="text-slate-600 leading-relaxed">
                Скористайтеся пошуком або каталогом категорій, щоб знайти потрібну компанію, послугу чи подію.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/80 shadow-[0_2px_20px_-5px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all duration-300 group">
              <div className="w-16 h-16 mx-auto bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                <MessageSquare className="text-emerald-600 w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Читайте відгуки</h3>
              <p className="text-slate-600 leading-relaxed">
                Ознайомтеся з реальним досвідом інших клієнтів. Звертайте увагу на рейтинги та деталі.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/80 shadow-[0_2px_20px_-5px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all duration-300 group">
              <div className="w-16 h-16 mx-auto bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                <PenTool className="text-emerald-600 w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Поділіться думкою</h3>
              <p className="text-slate-600 leading-relaxed">
                Напишіть власний чесний відгук, щоб допомогти іншим зробити правильний вибір.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-white border-t border-slate-200/80">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
          <CommunityCTA />
        </div>
      </section>
    </>
  );
}
