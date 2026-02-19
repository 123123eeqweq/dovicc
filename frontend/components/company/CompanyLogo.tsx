'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getUploadUrl } from '@/lib/api';

interface CompanyLogoProps {
  logoUrl: string | null | undefined;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  variant?: 'default' | 'simple';
}

const sizeClasses = {
  xs: 'size-11',
  sm: 'size-12',
  md: 'size-24 md:size-32',
  lg: 'size-32 md:size-40',
} as const;

const imageSizes = {
  xs: '44px',
  sm: '(max-width: 768px) 48px, 48px',
  md: '(max-width: 768px) 96px, 128px',
  lg: '(max-width: 768px) 128px, 160px',
} as const;

function isDataUrl(url: string): boolean {
  return url.startsWith('data:');
}

export function CompanyLogo({ logoUrl, name, size = 'md', className = '', variant = 'default' }: CompanyLogoProps) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [logoUrl]);
  
  const textSizes = {
    xs: 'text-[8px] leading-tight',
    sm: 'text-[9px] leading-tight',
    md: 'text-[11px] leading-tight',
    lg: 'text-sm leading-tight',
  };

  const placeholder = (
    <div className={`${sizeClasses[size]} rounded-lg bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-100 p-1 ${className}`}>
      <span className={`${textSizes[size]} font-medium text-slate-600 text-center line-clamp-3 break-words w-full`}>
        {name}
      </span>
    </div>
  );

  const src = getUploadUrl(logoUrl);
  const useDataUrlImg = isDataUrl(src);

  if (variant === 'simple') {
    if (!logoUrl || imageError) {
      return placeholder;
    }

    return (
      <div className={`${sizeClasses[size]} relative rounded-lg bg-slate-100 overflow-hidden border border-slate-200 ${className}`}>
        {useDataUrlImg ? (
          <img
            src={src}
            alt={`Логотип компанії ${name}`}
            className="object-cover size-full"
            onError={() => setImageError(true)}
          />
        ) : (
          <Image
            src={src}
            alt={`Логотип компанії ${name}`}
            fill
            sizes={imageSizes[size]}
            className="object-cover"
            onError={() => setImageError(true)}
            unoptimized={src.startsWith('/uploads/')}
          />
        )}
      </div>
    );
  }

  if (!logoUrl || imageError) {
    return (
      <div className={`${sizeClasses[size]} rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-100 p-1.5 ${className}`}>
        <span className={`${textSizes[size]} font-medium text-slate-600 text-center line-clamp-3 break-words w-full`}>
          {name}
        </span>
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} relative rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 p-1 overflow-hidden border border-slate-200 ${className}`}>
      {useDataUrlImg ? (
        <img
          src={src}
          alt={`Логотип компанії ${name}`}
          className="object-cover rounded-lg size-full"
          onError={() => setImageError(true)}
        />
      ) : (
        <Image
          src={src}
          alt={`Логотип компанії ${name}`}
          fill
          sizes={imageSizes[size]}
          className="object-cover rounded-lg"
          onError={() => setImageError(true)}
          unoptimized={src.startsWith('/uploads/')}
        />
      )}
    </div>
  );
}
