/** Get Ukrainian label for rating value (1–5 scale) */
export function getRatingLabel(rating: number): string {
  if (rating <= 0) return 'Немає оцінок';
  if (rating >= 4.5) return 'Відмінно';
  if (rating >= 4) return 'Дуже добре';
  if (rating >= 3.5) return 'Добре';
  if (rating >= 3) return 'Задовільно';
  if (rating >= 2.5) return 'Посередньо';
  if (rating >= 2) return 'Погано';
  if (rating >= 1.5) return 'Дуже погано';
  return 'Жахливо';
}

/** Get initials from a name (e.g. "John Doe" -> "JD") */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

/** Format date for display (relative for recent, full for older) */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Сьогодні';
  } else if (diffDays === 1) {
    return 'Вчора';
  } else if (diffDays < 7) {
    return `${diffDays} дні тому`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} ${weeks === 1 ? 'тиждень' : 'тижні'} тому`;
  } else {
    return date.toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }
}
