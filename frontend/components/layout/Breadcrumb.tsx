import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

/** Семантична breadcrumb-навігація з aria-label, ol/li та Schema.org microdata. На телефонах не показується. */
export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  return (
    <nav aria-label="Хлібні крихти" className={`hidden md:block ${className}`.trim()} itemScope itemType="https://schema.org/BreadcrumbList">
      <ol className="flex flex-wrap items-center gap-2 text-sm list-none m-0 p-0">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2" itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            {i > 0 && (
              <ChevronRight size={16} className="text-slate-300 shrink-0" aria-hidden="true" />
            )}
            {item.href ? (
              <Link
                href={item.href}
                itemProp="item"
                className="text-slate-500 hover:text-emerald-600 transition-colors shrink-0">
                <span itemProp="name">{item.label}</span>
              </Link>
            ) : (
              <span className="text-slate-800 font-medium truncate" itemProp="name">{item.label}</span>
            )}
            <meta itemProp="position" content={String(i + 1)} />
          </li>
        ))}
      </ol>
    </nav>
  );
}
