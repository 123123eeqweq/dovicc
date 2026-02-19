interface SearchSEOTextProps {
  query: string;
  companiesCount: number;
  categoriesCount: number;
  showSEO: boolean;
}

export function SearchSEOText({ query, companiesCount, categoriesCount, showSEO }: SearchSEOTextProps) {
  if (!showSEO || query.length < 3) return null;

  return (
    <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8 mt-12">
      <h2 className="text-2xl font-bold text-slate-900 mb-4">
        Результати пошуку за запитом &quot;{query}&quot;
      </h2>
      <div className="space-y-4 text-slate-700 leading-relaxed">
        <p>
          На DOVI.COM.UA ви знайдете реальні відгуки клієнтів про компанії, сервіси та події України. За запитом &quot;{query}&quot; знайдено {companiesCount} {companiesCount === 1 ? 'компанію' : companiesCount < 5 ? 'компанії' : 'компаній'} та {categoriesCount} {categoriesCount === 1 ? 'категорію' : categoriesCount < 5 ? 'категорії' : 'категорій'}.
        </p>
        <p>
          Кожна компанія на платформі має детальну сторінку з відгуками, рейтингами та статистикою. Користувачі діляться своїм досвідом, описуючи переваги та недоліки, що допомагає іншим зробити інформований вибір.
        </p>
        <p>
          Якщо ви не знайшли те, що шукали, ви можете додати це на платформу та стати першим, хто залишить відгук. Ваш внесок допоможе спільноті знайти найкращі послуги та компанії в Україні.
        </p>
      </div>
    </div>
  );
}
