import Link from 'next/link';
import Image from 'next/image';
import { Icon } from '@/components/ui/Icon';
import { CommunityCTA } from '@/components/ui/CommunityCTA';
import type { Metadata } from 'next';
import { getHreflangAlternates } from '@/lib/seo';
import { BASE_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Про нас',
  description: 'DOVI — незалежна платформа відгуків. Будуємо довіру в українському інтернеті з 2022 року.',
  alternates: {
    canonical: `${BASE_URL}/about`,
    languages: getHreflangAlternates(`${BASE_URL}/about`),
  },
};

export default function About() {
  return (
    <div className="min-h-screen">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 pt-20 pb-8 md:py-20">
        <div className="max-w-6xl mx-auto space-y-12 md:space-y-20">
        
        <div className="text-center space-y-4 md:space-y-6">
          <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Про нас</p>
          <h1 className="text-2xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight px-1">
            Будуємо <span className="text-emerald-600">довіру</span> в українському інтернеті
          </h1>
          <p className="text-base md:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
            DOVI.COM.UA — незалежна платформа відгуків, що об'єднує споживачів та бізнес заради прозорості та покращення якості послуг в Україні.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 md:gap-8">
          {[
            { icon: 'verified', color: 'blue', title: 'Чесність', text: 'Ми ретельно перевіряємо відгуки, щоб запобігти фейкам та маніпуляціям.' },
            { icon: 'handshake', color: 'primary', title: 'Співпраця', text: 'Ми допомагаємо бізнесу чути своїх клієнтів, а клієнтам — обирати найкращих.' },
            { icon: 'lightbulb', color: 'yellow', title: 'Інновації', text: 'Постійно вдосконалюємо алгоритми та інструменти для зручності кожного користувача.' },
          ].map((item, i) => (
            <div key={i} className="group bg-white p-5 md:p-8 rounded-xl md:rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col items-center text-center">
              <div className={`size-12 md:size-14 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 border border-slate-200/80 group-hover:border-slate-300 transition-colors
                ${item.color === 'blue' ? 'bg-blue-50 text-blue-600' : ''}
                ${item.color === 'primary' ? 'bg-emerald-50 text-emerald-600' : ''}
                ${item.color === 'yellow' ? 'bg-amber-50 text-amber-600' : ''}
              `}>
                <Icon name={item.icon} className="text-[28px] md:text-[32px]" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2 md:mb-3">{item.title}</h3>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl md:rounded-2xl p-5 md:p-12 border border-slate-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)]">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="space-y-4 md:space-y-6">
              <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Місія</p>
              <h2 className="text-xl md:text-3xl font-bold text-slate-900">Наша місія</h2>
              <div className="space-y-3 md:space-y-4 text-sm md:text-lg text-slate-600 leading-relaxed">
                <p>
                  Ми віримо, що кожен голос має значення. У сучасному світі, де вибір безмежний, довіра стає найціннішою валютою.
                </p>
                <p>
                  DOVI.COM.UA була створена групою ентузіастів у 2022 році з простою метою: надати українцям платформу, де можна знайти правдиву інформацію про все, що важливо — від компаній та сервісів до подій та медіа-контенту.
                </p>
                <p>
                  Сьогодні ми обробляємо тисячі відгуків щодня, допомагаючи мільйонам користувачів приймати зважені рішення.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div className="space-y-3 md:space-y-4">
                <div className="bg-slate-50/80 p-4 md:p-6 rounded-xl border border-slate-200/80">
                  <p className="text-2xl md:text-4xl font-bold text-emerald-600 mb-0.5 md:mb-1">100к+</p>
                  <p className="text-xs md:text-sm font-medium text-slate-500">Відгуків опубліковано</p>
                </div>
                <div className="bg-slate-50/80 p-4 md:p-6 rounded-xl border border-slate-200/80">
                  <p className="text-2xl md:text-4xl font-bold text-slate-800 mb-0.5 md:mb-1">1000+</p>
                  <p className="text-xs md:text-sm font-medium text-slate-500">Компаній в базі</p>
                </div>
              </div>
              <div className="space-y-3 md:space-y-4 pt-4 md:pt-8">
                <div className="bg-slate-50/80 p-4 md:p-6 rounded-xl border border-slate-200/80">
                  <p className="text-2xl md:text-4xl font-bold text-slate-800 mb-0.5 md:mb-1">500к+</p>
                  <p className="text-xs md:text-sm font-medium text-slate-500">Відвідувачів щомісяця</p>
                </div>
                <div className="bg-slate-50/80 p-4 md:p-6 rounded-xl border border-slate-200/80">
                  <p className="text-2xl md:text-4xl font-bold text-emerald-600 mb-0.5 md:mb-1">24/7</p>
                  <p className="text-xs md:text-sm font-medium text-slate-500">Підтримка та модерація</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div id="team">
          <div className="text-center mb-8 md:mb-12">
            <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-2 md:mb-3">Команда</p>
            <h2 className="text-xl md:text-3xl font-bold text-slate-900 mb-3 md:mb-4">Хто стоїть за DOVI</h2>
            <p className="text-sm md:text-lg text-slate-600 max-w-2xl mx-auto">
              Розробники, модератори та менеджери — працюємо над найкращим досвідом для вас.
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {[
              { name: '23', role: 'Founder', image: '/images/23.png' },
              { name: '27', role: 'CEO', image: '/images/27.png' },
              { name: 'Alex', role: 'CTO', image: '/images/alex.png' },
              { name: 'Artem', role: 'Manager', image: '/images/artem.png' },
            ].map((member, i) => (
              <div key={i} className="group bg-white rounded-xl md:rounded-2xl overflow-hidden border border-slate-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.99]">
                <div className="aspect-square bg-slate-100 relative overflow-hidden group-hover:opacity-95 transition-opacity">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
                <div className="p-3 md:p-4 border-t border-slate-100">
                  <h3 className="font-bold text-sm md:text-lg text-slate-900">{member.name}</h3>
                  <p className="text-xs md:text-sm text-emerald-600 font-medium mt-0.5">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <CommunityCTA />

        </div>
      </div>
    </div>
  );
}
