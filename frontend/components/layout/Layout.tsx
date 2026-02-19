'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Mail, User, LogOut, Send, Home, LayoutGrid, Info, ChevronRight, MessageSquare, MoreHorizontal } from 'lucide-react';
import { HeaderSearch } from '@/components/search/HeaderSearch';
import { getImageSrc } from '@/lib/api';
import { ScrollToTop } from '@/components/ui/ScrollToTop';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/lib/toast';
import { SUPPORT_EMAIL } from '@/lib/constants';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, loading, logout, setIntent } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      const scrollY = window.scrollY;
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      const originalPosition = document.body.style.position;
      const originalTop = document.body.style.top;
      const originalWidth = document.body.style.width;

      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
        document.body.style.position = originalPosition;
        document.body.style.top = originalTop;
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.width = originalWidth;
        window.scrollTo(0, scrollY);
      };
    }
  }, [isMobileMenuOpen]);

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    setShowUserMenu(false);
    setIsMobileMenuOpen(false);
    await logout();
    router.push('/');
  };

  const handleAuthClick = () => {
    setIntent({ type: 'VIEW_PROFILE' });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <nav className="fixed top-0 left-0 right-0 z-[1002] border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16 md:h-20 gap-8">
            <div className="flex items-center gap-8 flex-1">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="h-10 w-32 relative">
                  <Image
                    src="/images/logo.png"
                    alt="DOVI — платформа відгуків про компанії та сервіси України"
                    fill
                    className="object-contain object-left"
                    sizes="128px"
                    priority
                  />
                </div>
              </Link>
              
              <HeaderSearch />
            </div>

            <div className="hidden lg:flex items-center gap-6" suppressHydrationWarning>
              <Link href="/" className={`text-sm font-medium transition-colors ${mounted && pathname === '/' ? 'text-emerald-600' : 'text-slate-600 hover:text-emerald-600'}`}>Головна</Link>
              <Link href="/categories" className={`text-sm font-medium transition-colors ${mounted && pathname.includes('categor') ? 'text-emerald-600' : 'text-slate-600 hover:text-emerald-600'}`}>Категорії</Link>
              <Link href="/about" className={`text-sm font-medium transition-colors ${mounted && pathname === '/about' ? 'text-emerald-600' : 'text-slate-600 hover:text-emerald-600'}`}>Про нас</Link>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/review/add" className="flex h-9 items-center justify-center px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md">
                Написати відгук
              </Link>
              {loading ? (
                <div className="hidden sm:block h-9 w-20 rounded-full bg-slate-200 animate-pulse"></div>
              ) : mounted && (
                <>
                  {user ? (
                    <div ref={userMenuRef} className="hidden sm:block relative">
                      <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center justify-center size-9 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 hover:from-emerald-200 hover:to-emerald-300 transition-colors overflow-hidden cursor-pointer border-2 border-slate-200/80"
                      >
                        {user.avatarUrl ? (
                          <div className="relative size-9 rounded-full overflow-hidden">
                            <Image
                              src={getImageSrc(user.avatarUrl)}
                              alt={`Аватар користувача ${user.name}`}
                              fill
                              sizes="32px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <span className="text-emerald-700 font-bold text-sm">{getInitials(user.name)}</span>
                        )}
                      </button>
                      {showUserMenu && (
                        <div className="absolute right-0 top-10 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-[1001]">
                          <div className="px-4 py-2 border-b border-slate-100 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                            <p className="text-xs text-slate-500 truncate w-full block" title={user.email}>{user.email}</p>
                          </div>
                          <Link
                            href="/profile"
                            onClick={() => setShowUserMenu(false)}
                            className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            Мій профіль
                          </Link>
                          <button
                            onClick={() => {
                              setShowLogoutConfirm(true);
                              setShowUserMenu(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                          >
                            <LogOut size={16} />
                            Вийти
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={handleAuthClick}
                      className="hidden sm:flex h-9 items-center justify-center px-4 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-all"
                    >
                      Увійти
                    </button>
                  )}
                </>
              )}
              <button 
                className="md:hidden p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:scale-95 transition-all duration-200"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? 'Закрити меню' : 'Відкрити меню'}
              >
                <span className="block transition-transform duration-200">{isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}</span>
              </button>
            </div>
          </div>
        </div>
        
        <HeaderSearch isMobile />
      </nav>

      <div className="h-16 md:h-20 flex-shrink-0" aria-hidden="true" />
      {isMobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[1003] md:hidden animate-fade-in touch-none"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] z-[1004] md:hidden overflow-y-auto animate-slide-in">
            <div className="h-full bg-white/95 backdrop-blur-xl border-l border-slate-200/80 shadow-[-8px_0_32px_-8px_rgba(0,0,0,0.12)] flex flex-col">
              <div className="relative p-6 border-b border-slate-200/80">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/80 to-teal-50/50 rounded-tl-3xl" />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-10 relative flex items-center justify-center overflow-hidden bg-white">
                      <Image src="/images/logosimple.png" alt="DOVI — логотип" fill className="object-contain p-1" sizes="40px" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">DOVI</h2>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-white/80 transition-all active:scale-95"
                  >
                    <X size={22} />
                  </button>
                </div>
              </div>
              <nav className="p-4 flex-1">
                <div className="space-y-1">
                  <Link 
                    href="/" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="group flex items-center gap-3 px-4 py-3.5 rounded-xl text-slate-700 font-medium hover:bg-emerald-50/80 hover:text-emerald-700 transition-all duration-200 active:scale-[0.98]"
                  >
                    <div className="size-9 rounded-lg bg-slate-100 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
                      <Home size={18} className="text-slate-600 group-hover:text-emerald-600" />
                    </div>
                    <span className="flex-1">Головна</span>
                    <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                  <Link 
                    href="/categories" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="group flex items-center gap-3 px-4 py-3.5 rounded-xl text-slate-700 font-medium hover:bg-emerald-50/80 hover:text-emerald-700 transition-all duration-200 active:scale-[0.98]"
                  >
                    <div className="size-9 rounded-lg bg-slate-100 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
                      <LayoutGrid size={18} className="text-slate-600 group-hover:text-emerald-600" />
                    </div>
                    <span className="flex-1">Категорії</span>
                    <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                  <Link 
                    href="/about" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="group flex items-center gap-3 px-4 py-3.5 rounded-xl text-slate-700 font-medium hover:bg-emerald-50/80 hover:text-emerald-700 transition-all duration-200 active:scale-[0.98]"
                  >
                    <div className="size-9 rounded-lg bg-slate-100 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
                      <Info size={18} className="text-slate-600 group-hover:text-emerald-600" />
                    </div>
                    <span className="flex-1">Про нас</span>
                    <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                </div>
                {user ? (
                  <>
                    <div className="my-4 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                    <div className="space-y-1">
                      <Link 
                        href="/profile" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="group flex items-center gap-3 px-4 py-3.5 rounded-xl text-slate-700 font-medium hover:bg-emerald-50/80 hover:text-emerald-700 transition-all duration-200 active:scale-[0.98]"
                      >
                        <div className="size-9 rounded-lg bg-slate-100 group-hover:bg-emerald-100 relative flex items-center justify-center overflow-hidden">
                          {user.avatarUrl ? (
                            <Image src={getImageSrc(user.avatarUrl)} alt={`Аватар ${user.name}`} fill sizes="36px" className="object-cover" />
                          ) : (
                            <User size={18} className="text-slate-600 group-hover:text-emerald-600" />
                          )}
                        </div>
                        <span className="flex-1">Мій профіль</span>
                        <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                      </Link>
                      <button 
                        onClick={() => {
                          setShowLogoutConfirm(true);
                          setIsMobileMenuOpen(false);
                        }} 
                        className="group w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-slate-700 font-medium hover:bg-red-50/80 hover:text-red-600 transition-all duration-200 active:scale-[0.98] text-left"
                      >
                        <div className="size-9 rounded-lg bg-slate-100 group-hover:bg-red-100 flex items-center justify-center transition-colors">
                          <LogOut size={18} className="text-slate-600 group-hover:text-red-600" />
                        </div>
                        <span className="flex-1">Вийти</span>
                        <ChevronRight size={18} className="text-slate-300 group-hover:text-red-400 group-hover:translate-x-0.5 transition-all" />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="my-4 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                    <button 
                      onClick={() => {
                        handleAuthClick();
                        setIsMobileMenuOpen(false);
                      }} 
                      className="group w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-slate-700 font-medium hover:bg-emerald-50/80 hover:text-emerald-700 transition-all duration-200 active:scale-[0.98] text-left"
                    >
                      <div className="size-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <User size={18} className="text-emerald-600" />
                      </div>
                      <span className="flex-1">Увійти</span>
                      <ChevronRight size={18} className="text-emerald-400" />
                    </button>
                  </>
                )}
              </nav>
              <div className="p-4 border-t border-slate-200/80">
                <Link 
                  href="/review/add" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-[0_2px_12px_-4px_rgba(5,150,105,0.4)] hover:shadow-[0_4px_20px_-4px_rgba(5,150,105,0.5)] transition-all active:scale-[0.98]"
                >
                  <MessageSquare size={18} />
                  Написати відгук
                </Link>
              </div>
            </div>
          </div>
        </>
      )}

      <main className="flex-1 w-full min-w-0">
        {children}
      </main>

      <footer className="border-t border-slate-200 bg-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="size-7 relative">
                  <Image src="/images/logosimple.png" alt="DOVI.COM.UA — логотип" fill className="object-contain" sizes="28px" />
                </div>
                <span className="text-xl font-bold text-slate-900">DOVI.COM.UA</span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                Ваш надійний гід у світі послуг та компаній України. Знаходьте найкращих за чесними відгуками від реальних людей.
              </p>
              <div className="flex gap-4">
                <a href="https://t.me/dovi_support" target="_blank" rel="noopener noreferrer" className="size-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-emerald-600 hover:text-white transition-colors">
                  <Send size={18} />
                </a>
                <a href={`mailto:${SUPPORT_EMAIL}`} className="size-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-emerald-600 hover:text-white transition-colors">
                  <Mail size={18} />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-6">Сайт</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li><Link href="/categories" className="hover:text-emerald-600 transition-colors">Категорії</Link></li>
                <li><Link href="/about" className="hover:text-emerald-600 transition-colors">Про нас</Link></li>
                <li><Link href="/rules" className="hover:text-emerald-600 transition-colors">Правила відгуків</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-6">Для власників / представників</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      toast.info('Функція на стадії розробки');
                    }}
                    className="hover:text-emerald-600 transition-colors text-left"
                  >
                    Додати
                  </button>
                </li>
                <li>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      toast.info('Функція на стадії розробки');
                    }}
                    className="hover:text-emerald-600 transition-colors text-left"
                  >
                    DOVI Business
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-6">Підтримка</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li><Link href="/privacy" className="hover:text-emerald-600 transition-colors">Політика конфіденційності</Link></li>
                <li><Link href="/terms" className="hover:text-emerald-600 transition-colors">Умови використання</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-400">© 2026 DOVI.COM.UA. Всі права захищено.</p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="text-sm text-slate-400 hover:text-emerald-600 transition-colors">Політика конфіденційності</Link>
              <Link href="/terms" className="text-sm text-slate-400 hover:text-emerald-600 transition-colors">Умови використання</Link>
            </div>
          </div>
        </div>
      </footer>
      <ScrollToTop />
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
};
