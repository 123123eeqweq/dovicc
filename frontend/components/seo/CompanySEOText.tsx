interface CompanySEOTextProps {
  company: {
    name: string;
    description: string;
    rating: number;
    reviewCount: number;
    city: string;
    category: {
      name: string;
    };
  };
  showSEO: boolean;
}

export function CompanySEOText({ company, showSEO }: CompanySEOTextProps) {
  if (!showSEO) return null;

  return (
    <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 shadow-[0_2px_20px_-5px_rgba(0,0,0,0.06)] p-6 sm:p-8 mt-12 overflow-hidden">
      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 break-words">
        Відгуки про {company.name}
      </h2>
      <div className="space-y-4 text-slate-700 leading-relaxed break-words max-w-3xl">
        <p className="break-words">
          {company.name} — {company.description.toLowerCase()}. На платформі DOVI.COM.UA користувачі діляться реальним досвідом взаємодії з цією компанією, залишаючи чесні відгуки та оцінки якості послуг.
        </p>
        {company.reviewCount > 0 ? (
          <p className="break-words">
            На даний момент {company.name} має середній рейтинг {company.rating.toFixed(1)} з 5 зірок на основі {company.reviewCount} {company.reviewCount === 1 ? 'відгуку' : company.reviewCount < 5 ? 'відгуків' : 'відгуків'}. Користувачі оцінюють різні аспекти роботи компанії, включаючи якість обслуговування, швидкість виконання замовлень та загальний досвід співпраці.
          </p>
        ) : (
          <p className="break-words">
            Поки що немає відгуків про {company.name}, але ви можете стати першим, хто поділиться своїм досвідом. Ваш відгук допоможе іншим користувачам зробити інформований вибір та отримати уявлення про якість послуг цієї компанії.
          </p>
        )}
        <p className="break-words">
          Читайте відгуки клієнтів про {company.name.toLowerCase()} в категорії &quot;{company.category.name}&quot; та діліться власним досвідом. Ваша думка важлива для всієї спільноти користувачів DOVI.COM.UA в Україні.
        </p>
      </div>
    </div>
  );
}
