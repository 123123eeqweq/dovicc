
const UKRAINIAN_MAP: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', ґ: 'g', д: 'd', е: 'e', є: 'ie', ж: 'zh', з: 'z',
  и: 'y', і: 'i', ї: 'i', й: 'i', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p',
  р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh',
  щ: 'shch', ь: '', ю: 'yu', я: 'ya',
  ё: 'e', э: 'e', ы: 'y', ъ: '',
};

/** Генерує URL-слаг з назви (транслітерація + lowercase + дефіси) */
export function generateSlug(name: string): string {
  if (!name || typeof name !== 'string') return '';
  const text = name.trim().toLowerCase();
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const mapped = UKRAINIAN_MAP[char];
    if (mapped !== undefined) {
      result += mapped;
    } else if (/[a-z0-9]/.test(char)) {
      result += char;
    } else if (char === ' ' || char === '-' || char === '_' || char === '\t') {
      if (result.length > 0 && result[result.length - 1] !== '-') {
        result += '-';
      }
    }
  }
  return result.replace(/-+/g, '-').replace(/^-|-$/g, '') || '';
}
