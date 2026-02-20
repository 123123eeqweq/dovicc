import Link from 'next/link';
import { Shield, Lock, Eye, FileText, Mail } from 'lucide-react';
import type { Metadata } from 'next';
import { getHreflangAlternates } from '@/lib/seo';
import { BASE_URL, SUPPORT_EMAIL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Політика конфіденційності',
  description: 'Політика конфіденційності DOVI.COM.UA. Як ми збираємо, використовуємо та захищаємо ваші персональні дані.',
  alternates: {
    canonical: `${BASE_URL}/privacy`,
    languages: getHreflangAlternates(`${BASE_URL}/privacy`),
  },
};

export default function Privacy() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 pt-20 pb-10 md:py-16">
      <div className="max-w-4xl mx-auto space-y-12">
        
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center size-16 rounded-full bg-emerald-100 mb-4">
            <Shield className="size-8 text-emerald-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Політика конфіденційності
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Останнє оновлення: {new Date().toLocaleDateString('uk-UA', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-10 shadow-sm">
          <p className="text-slate-600 leading-relaxed text-lg">
            DOVI.COM.UA («ми», «наш», «нас») зобов'язується захищати конфіденційність наших користувачів. Ця Політика конфіденційності пояснює, як ми збираємо, використовуємо, зберігаємо та захищаємо вашу персональну інформацію під час використання нашого веб-сайту та послуг.
          </p>
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-10 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="size-6 text-emerald-600" />
              <h2 className="text-2xl font-bold text-slate-900">1. Яку інформацію ми збираємо</h2>
            </div>
            <div className="space-y-4 text-slate-600 leading-relaxed">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Інформація, яку ви надаєте нам:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Ім'я та контактна інформація (email) при реєстрації</li>
                  <li>Відгуки та коментарі, які ви публікуєте</li>
                  <li>Інформація про компанії, яку ви пропонуєте додати</li>
                  <li>Аватар (якщо ви завантажуєте фото профілю)</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Інформація, яку ми збираємо автоматично:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>IP-адреса та інформація про пристрій</li>
                  <li>Тип браузера та операційна система</li>
                  <li>Дані про використання сайту (сторінки, які ви відвідуєте, час перебування)</li>
                  <li>Cookies та подібні технології</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-10 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Eye className="size-6 text-emerald-600" />
              <h2 className="text-2xl font-bold text-slate-900">2. Як ми використовуємо вашу інформацію</h2>
            </div>
            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>Ми використовуємо зібрану інформацію для:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Надання та покращення наших послуг</li>
                <li>Модерації відгуків та забезпечення якості контенту</li>
                <li>Зв'язку з вами щодо вашого акаунта або відгуків</li>
                <li>Захисту від шахрайства та зловмисного використання</li>
                <li>Аналізу використання сайту для покращення користувацького досвіду</li>
                <li>Відправки важливих повідомлень про зміни в послугах або політиці</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-10 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="size-6 text-emerald-600" />
              <h2 className="text-2xl font-bold text-slate-900">3. Захист ваших даних</h2>
            </div>
            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>
                Ми вживаємо заходів безпеки для захисту вашої персональної інформації від несанкціонованого доступу, зміни, розкриття або знищення:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Шифрування даних при передачі (HTTPS)</li>
                <li>Безпечне зберігання паролів (хешування)</li>
                <li>Регулярні оновлення безпеки системи</li>
                <li>Обмежений доступ до персональних даних тільки для авторизованого персоналу</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-10 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">4. Розкриття інформації третім особам</h2>
            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>Ми не продаємо, не обмінюємо та не передаємо вашу персональну інформацію третім особам, за винятком:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Коли це необхідно для надання послуг (наприклад, хостинг-провайдери)</li>
                <li>Коли це вимагається законом або судовим рішенням</li>
                <li>Для захисту наших прав або безпеки користувачів</li>
                <li>З вашої явної згоди</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-10 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">5. Cookies</h2>
            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>
                Ми використовуємо cookies для покращення вашого досвіду на сайті. Cookies — це невеликі текстові файли, які зберігаються на вашому пристрої. Ви можете налаштувати свій браузер для відмови від cookies, але це може вплинути на функціональність сайту.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-10 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">6. Ваші права</h2>
            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>Ви маєте право:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Отримувати доступ до своїх персональних даних</li>
                <li>Виправляти неточну або неповну інформацію</li>
                <li>Вимагати видалення ваших персональних даних</li>
                <li>Відкликати згоду на обробку даних</li>
                <li>Обмежити обробку ваших даних</li>
                <li>Отримувати копію ваших даних у структурованому форматі</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-10 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">7. Зміни в Політиці конфіденційності</h2>
            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>
                Ми можемо періодично оновлювати цю Політику конфіденційності. Про значні зміни ми повідомимо вас через email або повідомлення на сайті. Рекомендуємо періодично переглядати цю сторінку.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-10 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">8. Контакти</h2>
            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>
                Якщо у вас є питання щодо цієї Політики конфіденційності або ви хочете реалізувати свої права, будь ласка, зв'яжіться з нами:
              </p>
              <div className="flex items-center gap-3 mt-4">
                <Mail className="size-5 text-emerald-600" />
                <a href={`mailto:${SUPPORT_EMAIL}`} className="text-emerald-600 hover:text-emerald-700 font-medium">
                  {SUPPORT_EMAIL}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
          >
            ← Повернутися на головну
          </Link>
        </div>

      </div>
    </div>
  );
}
