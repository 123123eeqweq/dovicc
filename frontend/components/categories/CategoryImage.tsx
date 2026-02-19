'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Building2 } from 'lucide-react';
import { getCategoryImageUrl } from '@/lib/categories';

interface CategoryImageProps {
  slug: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fallbackClassName?: string;
}

/** Зображення категорії з fallback при помилці (файл не знайдено або інший slug у БД) */
export function CategoryImage({ slug, className, sizes, priority, fallbackClassName = 'bg-slate-200' }: CategoryImageProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className={`absolute inset-0 flex items-center justify-center ${fallbackClassName}`}>
        <Building2 className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-slate-400" />
      </div>
    );
  }

  return (
    <Image
      src={getCategoryImageUrl(slug)}
      alt=""
      fill
      className={className ?? 'object-cover'}
      sizes={sizes}
      priority={priority}
      unoptimized
      onError={() => setError(true)}
    />
  );
}
