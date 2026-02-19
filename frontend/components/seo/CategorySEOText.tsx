interface CategorySEOTextProps {
  category: {
    name: string;
    description: string;
    slug: string;
  };
  companiesCount: number;
  showSEO: boolean;
}

export function CategorySEOText({ category, companiesCount, showSEO }: CategorySEOTextProps) {
  if (!showSEO) return null;

  return (
    <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8 mt-12">
      <h2 className="text-2xl font-bold text-slate-900 mb-4">
        {category.name} — відгуки та рейтинги компаній України
      </h2>
      <div className="space-y-4 text-slate-700 leading-relaxed">
        <p>
          {category.description} На платформі DOVI.COM.UA ви знайдете детальну інформацію про найпопулярніші компанії в категорії &quot;{category.name}&quot;, реальні відгуки клієнтів та актуальні рейтинги якості.
        </p>
        {companiesCount > 0 ? (
          <p>
            У цій категорії представлено {companiesCount} {companiesCount === 1 ? 'компанію' : companiesCount < 5 ? 'компанії' : 'компаній'}, про які користувачі залишили відгуки та оцінки. Кожна компанія має власну сторінку з детальною інформацією, статистикою рейтингів та відгуками реальних користувачів з різних міст України.
          </p>
        ) : (
          <p>
            Поки що в категорії &quot;{category.name}&quot; немає компаній з відгуками, але ви можете додати компанію та стати першим, хто поділиться досвідом. Ваш внесок допоможе іншим користувачам знайти потрібні послуги та зробити правильний вибір.
          </p>
        )}
        <p>
          Читайте чесні відгуки про {category.name.toLowerCase()} в Україні, порівнюйте рейтинги компаній та приймайте інформовані рішення на основі досвіду інших користувачів. DOVI.COM.UA — це платформа, де кожен може поділитися своїм досвідом та допомогти спільноті знайти найкращі компанії та послуги в Україні.
        </p>
      </div>
    </div>
  );
}
