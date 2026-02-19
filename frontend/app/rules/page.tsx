import Link from 'next/link';
import { CheckCircle, XCircle, AlertCircle, FileText, Shield, Eye, MessageSquare, Star } from 'lucide-react';
import { getHreflangAlternates } from '@/lib/seo';
import { BASE_URL } from '@/lib/constants';

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Як написати якісний відгук?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Базуйтеся на власному досвіді, будьте конкретні та детальні, пишіть чесно та об\'єктивно. Опишіть ситуацію, основну частину досвіду та висновок з рекомендацією.',
      },
    },
    {
      '@type': 'Question',
      name: 'Що заборонено в відгуках?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Нецензурна лексика, фейкові відгуки, особисті дані інших людей, реклама та спам, дискримінація.',
      },
    },
    {
      '@type': 'Question',
      name: 'Яка структура відгуку?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Початок: коротко опишіть ситуацію. Основна частина: детально про досвід. Висновок: підсумуйте та дайте рекомендацію.',
      },
    },
  ],
};

export const metadata = {
  title: 'Правила написання відгуків',
  description: 'Правила та рекомендації для написання якісних відгуків на DOVI.COM.UA.',
  alternates: {
    canonical: `${BASE_URL}/rules`,
    languages: getHreflangAlternates(`${BASE_URL}/rules`),
  },
};

export default function Rules() {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-10 md:py-16">
        <div className="max-w-4xl mx-auto space-y-12">
          
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-emerald-50 mb-4 shadow-[0_2px_20px_-5px_rgba(0,0,0,0.06)]">
              <FileText className="size-8 text-emerald-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
              Правила написання відгуків
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Дотримуйтесь цих правил, щоб ваш відгук був корисним для інших користувачів та пройшов модерацію.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-8 md:p-10 shadow-[0_2px_20px_-5px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-3 mb-8">
            <Shield className="size-6 text-emerald-600" />
            <h2 className="text-2xl font-bold text-slate-900">Основні правила</h2>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  <CheckCircle className="size-6 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Базуйтеся на власному досвіді</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Пишіть тільки про компанії, з якими ви особисто взаємодіяли. Відгуки повинні відображати ваш реальний досвід покупки товару або отримання послуги.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  <CheckCircle className="size-6 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Будьте конкретні та детальні</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Опишіть деталі вашого досвіду: що саме сподобалось або не сподобалось, коли це було, які обставини. Чим більше конкретики, тим кориснішим буде ваш відгук.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  <CheckCircle className="size-6 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Чесно та об'єктивно</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Відгук має відображати вашу реальну думку та досвід. Уникайте узагальнень без підтвердження. Якщо щось не сподобалось, поясніть чому.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  <CheckCircle className="size-6 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Використовуйте ввічливу мову</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Використовуйте коректну та ввічливу мову. Навіть якщо ваш досвід був негативним, залишайтеся в межах пристойності.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-red-50/80 rounded-2xl border border-red-200/80 p-8 md:p-10 shadow-[0_2px_20px_-5px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-3 mb-8">
            <XCircle className="size-6 text-red-600" />
            <h2 className="text-2xl font-bold text-slate-900">Що заборонено</h2>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                <AlertCircle className="size-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Нецензурна лексика та образи</h3>
                <p className="text-slate-600 leading-relaxed">
                  Відгуки з нецензурною лексикою, образами або загрозами не будуть опубліковані. Використовуйте коректну мову.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                <AlertCircle className="size-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Фейкові відгуки</h3>
                <p className="text-slate-600 leading-relaxed">
                  Заборонено публікувати відгуки від імені інших осіб, вигадані відгуки або відгуки за гроші. DOVI.COM.UA має політику нульової толерантності до фейкових відгуків.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                <AlertCircle className="size-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Особисті дані</h3>
                <p className="text-slate-600 leading-relaxed">
                  Не публікуйте особисті дані інших людей (ім'я, телефон, адресу, email) без їх згоди. Це порушення конфіденційності.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                <AlertCircle className="size-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Реклама та спам</h3>
                <p className="text-slate-600 leading-relaxed">
                  Заборонено використовувати відгуки для реклами інших компаній, послуг або продуктів. Також заборонено дублювати один і той самий відгук багато разів.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                <AlertCircle className="size-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Дискримінація</h3>
                <p className="text-slate-600 leading-relaxed">
                  Відгуки, що містять дискримінацію за расою, статтю, віком, релігією, національністю або іншими ознаками, будуть видалені.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/80 rounded-2xl border border-emerald-200/80 p-8 md:p-10 shadow-[0_2px_20px_-5px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-3 mb-8">
            <Star className="size-6 text-emerald-600" />
            <h2 className="text-2xl font-bold text-slate-900">Як написати якісний відгук</h2>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-emerald-100/80 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <MessageSquare className="size-5 text-emerald-600" />
                Структура відгуку
              </h3>
              <ul className="space-y-2 text-slate-600 ml-7">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span><strong>Початок:</strong> Коротко опишіть ситуацію — що ви купували або яку послугу отримували</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span><strong>Основна частина:</strong> Детально розкажіть про свій досвід — що сподобалось, що ні, чому</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span><strong>Висновок:</strong> Підсумуйте та дайте рекомендацію — чи порадите цю компанію іншим</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-6 border border-emerald-100/80 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Eye className="size-5 text-emerald-600" />
                Що додати до відгуку
              </h3>
              <ul className="space-y-2 text-slate-600 ml-7">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>Дата та час взаємодії з компанією</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>Конкретні приклади того, що сподобалось або не сподобалось</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>Деталі про обслуговування, якість товару, швидкість доставки тощо</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>Переваги та недоліки (якщо є) — це допомагає іншим зробити вибір</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 md:p-10 shadow-[0_2px_20px_-5px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-3 mb-8">
            <Shield className="size-6 text-slate-600" />
            <h2 className="text-2xl font-bold text-slate-900">Процес модерації</h2>
          </div>

          <div className="space-y-4 text-slate-600 leading-relaxed">
            <p>
              Всі відгуки на DOVI.COM.UA проходять модерацію перед публікацією. Наша команда перевіряє кожен відгук на відповідність правилам платформи.
            </p>
            <p>
              <strong className="text-slate-900">Час модерації:</strong> Зазвичай відгуки перевіряються протягом 24-48 годин. У періоди високого навантаження це може зайняти трохи більше часу.
            </p>
            <p>
              <strong className="text-slate-900">Якщо відгук не пройшов модерацію:</strong> Ви отримаєте повідомлення з поясненням причини. Ви можете виправити відгук та надіслати його знову.
            </p>
            <p>
              <strong className="text-slate-900">Апеляція:</strong> Якщо ви вважаєте, що ваш відгук був неправильно відхилений, ви можете звернутися до служби підтримки.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl p-8 md:p-12 text-center text-white relative overflow-hidden shadow-[0_8px_40px_-10px_rgba(5,150,105,0.4)]">
          <div className="absolute top-0 right-0 size-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 size-64 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
          
          <div className="relative z-10 space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">Готові поділитися своїм досвідом?</h2>
            <p className="text-emerald-100 text-lg max-w-2xl mx-auto">
              Тепер ви знаєте всі правила. Напишіть свій перший відгук та допоможіть іншим зробити правильний вибір.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/review/add" 
                className="w-full sm:w-auto px-8 py-4 bg-white text-emerald-600 hover:bg-emerald-50 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                Написати відгук
              </Link>
              <Link 
                href="/" 
                className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-semibold transition-all backdrop-blur-sm"
              >
                На головну
              </Link>
            </div>
          </div>
        </div>

        </div>
      </div>
    </div>
  );
}
