/** Максимальна довжина meta description для SERP (Google обрізає ~155–160 символів) */
export const META_DESCRIPTION_MAX_LENGTH = 160;

/** Обрізає текст до maxLen символів, додає "..." якщо обрізано */
export function truncateDescription(text: string, maxLen = META_DESCRIPTION_MAX_LENGTH): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLen) return trimmed;
  return trimmed.substring(0, maxLen - 3) + '...';
}

/** hreflang для uk_UA (єдина мова сайту) */
export function getHreflangAlternates(url: string) {
  return {
    'uk-UA': url,
    'x-default': url,
  };
}
