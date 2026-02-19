import Link from 'next/link';
import { FileText, AlertCircle, CheckCircle, Shield } from 'lucide-react';
import type { Metadata } from 'next';
import { getHreflangAlternates } from '@/lib/seo';
import { BASE_URL, SUPPORT_EMAIL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Умови використання',
  description: 'Умови використання DOVI.COM.UA. Правила та обмеження при використанні сервісу.',
  alternates: {
    canonical: `${BASE_URL}/terms`,
    languages: getHreflangAlternates(`${BASE_URL}/terms`),
  },
};

export default function Terms() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-10 md:py-16">
      <div className="max-w-4xl mx-auto space-y-12">
        
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center size-16 rounded-full bg-emerald-100 mb-4">
            <FileText className="size-8 text-emerald-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Умови використання
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Останнє оновлення: {new Date().toLocaleDateString('uk-UA', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-10 shadow-sm">
          <p className="text-slate-600 leading-relaxed text-lg">
            Ласкаво просимо на DOVI.COM.UA! Використовуючи наш веб-сайт та послуги, ви погоджуєтеся дотримуватися цих Умов використання. Якщо ви не згодні з цими умовами, будь ласка, не використовуйте наш сервіс.
          </p>
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-10 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">1. Прийняття умов</h2>
            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>
                Доступуючи або використовуючи DOVI.COM.UA, ви підтверджуєте, що прочитали, зрозуміли та погоджуєтеся бути пов'язаними цими Умовами використання та всіма застосовними законами та правилами.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-10 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">2. Використання сервісу</h2>
            <div className="space-y-4 text-slate-600 leading-relaxed">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Дозволене використання:</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Читання та перегляд відгуків про компанії</li>
                <li>Публікація чесних відгуків на основі власного досвіду</li>
                <li>Пошук компаній та категорій</li>
                <li>Реєстрація та використання особистого акаунта</li>
              </ul>
              <h3 className="text-lg font-semibold text-slate-900 mb-2 mt-6">Заборонене використання:</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Публікація фейкових, неправдивих або введених в оману відгуків</li>
                <li>Використання сервісу для реклами або спаму</li>
                <li>Спроби обійти системи безпеки або модерації</li>
                <li>Використання автоматизованих систем для збору даних (скрапінг)</li>
                <li>Порушення прав інтелектуальної власності</li>
                <li>Розповсюдження шкідливого програмного забезпечення</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-10 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle className="size-6 text-emerald-600" />
              <h2 className="text-2xl font-bold text-slate-900">3. Реєстрація та акаунт</h2>
            </div>
            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>При реєстрації ви зобов'язуєтеся:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Надавати точну та актуальну інформацію</li>
                <li>Зберігати конфіденційність свого пароля</li>
                <li>Нести відповідальність за всі дії, що відбуваються під вашим акаунтом</li>
                <li>Незабаром повідомляти нас про будь-яке несанкціоноване використання вашого акаунта</li>
              </ul>
              <p className="mt-4">
                Ми залишаємо за собою право призупинити або видалити ваш акаунт у разі порушення цих умов.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-10 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle className="size-6 text-emerald-600" />
              <h2 className="text-2xl font-bold text-slate-900">4. Відгуки та контент</h2>
            </div>
            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>Публікуючи відгук, ви гарантуєте, що:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Відгук базується на вашому власному реальному досвіді</li>
                <li>Ви не отримували платню за написання відгуку</li>
                <li>Контент не порушує права третіх осіб</li>
                <li>Ви не публікуєте особисті дані інших людей без їх згоди</li>
                <li>Відгук відповідає нашим <Link href="/rules" className="text-emerald-600 hover:text-emerald-700 underline">правилам написання відгуків</Link></li>
              </ul>
              <p className="mt-4">
                Ми залишаємо за собою право модерувати, редагувати або видаляти будь-який контент, який порушує ці умови або наші правила.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-10 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">5. Інтелектуальна власність</h2>
            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>
                Весь контент на DOVI.COM.UA, включаючи текст, графіку, логотипи, значки та програмне забезпечення, є власністю DOVI.COM.UA або його ліцензіарів і захищений законами про авторське право.
              </p>
              <p>
                Ви можете використовувати контент сайту тільки для особистих, некомерційних цілей. Будь-яке інше використання без нашої письмової згоди заборонено.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-10 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">6. Відмова від відповідальності</h2>
            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>
                DOVI.COM.UA надається «як є» без будь-яких гарантій. Ми не гарантуємо:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Точність або повноту інформації на сайті</li>
                <li>Безперервну роботу сервісу без помилок</li>
                <li>Відсутність вірусів або інших шкідливих компонентів</li>
              </ul>
              <p className="mt-4">
                Відгуки на нашому сайті є думками користувачів і не обов'язково відображають нашу позицію. Ми не несемо відповідальності за рішення, прийняті на основі інформації з нашого сайту.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-10 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="size-6 text-emerald-600" />
              <h2 className="text-2xl font-bold text-slate-900">7. Обмеження відповідальності</h2>
            </div>
            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>
                У максимальній мірі, дозволеній законом, DOVI.COM.UA не несе відповідальності за будь-які прямі, непрямі, випадкові або наслідкові збитки, що виникають у зв'язку з використанням або неможливістю використання нашого сервісу.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-10 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">8. Зміни в умовах</h2>
            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>
                Ми залишаємо за собою право змінювати ці Умови використання в будь-який час. Про значні зміни ми повідомимо вас через email або повідомлення на сайті. Продовжуючи використовувати сервіс після змін, ви погоджуєтеся з новими умовами.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-10 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">9. Припинення доступу</h2>
            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>
                Ми залишаємо за собою право призупинити або припинити ваш доступ до сервісу в будь-який час, без попереднього повідомлення, за порушення цих Умов використання або з будь-якої іншої причини.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-10 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">10. Застосовне право</h2>
            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>
                Ці Умови використання регулюються та тлумачаться відповідно до законодавства України. Будь-які спори підлягають виключній юрисдикції судів України.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-10 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">11. Контакти</h2>
            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>
                Якщо у вас є питання щодо цих Умов використання, будь ласка, зв'яжіться з нами:
              </p>
              <div className="mt-4">
                <p className="font-semibold text-slate-900">Email:</p>
                <a href={`mailto:${SUPPORT_EMAIL}`} className="text-emerald-600 hover:text-emerald-700">
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
