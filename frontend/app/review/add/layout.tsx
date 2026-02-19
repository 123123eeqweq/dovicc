import type { Metadata } from 'next';
import { BASE_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Написати відгук',
  description: 'Додайте свій відгук про компанію на DOVI. Опишіть досвід, оцініть сервіс.',
  alternates: {
    canonical: `${BASE_URL}/review/add`,
    languages: { 'uk-UA': `${BASE_URL}/review/add`, 'x-default': `${BASE_URL}/review/add` },
  },
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'Як написати відгук на DOVI',
  description: 'Покрокова інструкція для написання якісного відгуку про компанію',
  step: [
    { '@type': 'HowToStep', name: 'Знайдіть компанію', text: 'Введіть назву компанії в пошук та оберіть її зі списку' },
    { '@type': 'HowToStep', name: 'Поставте оцінку', text: 'Оберіть рейтинг від 1 до 5 зірок на основі вашого досвіду' },
    { '@type': 'HowToStep', name: 'Напишіть відгук', text: 'Опишіть свій досвід: що сподобалось, що ні, плюси та мінуси' },
    { '@type': 'HowToStep', name: 'Опублікуйте', text: 'Підтвердіть умови та відправте відгук на модерацію' },
  ],
};

export default function ReviewAddLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      {children}
    </>
  );
}
