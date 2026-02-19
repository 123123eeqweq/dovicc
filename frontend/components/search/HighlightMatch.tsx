'use client';

/** Підсвічує фрагмент тексту, що збігається з пошуковим запитом */
export function HighlightMatch({ text, query, className = '' }: { text: string; query: string; className?: string }) {
  const trimmed = query.trim();
  if (!trimmed) return <span className={className}>{text}</span>;

  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.toLowerCase() === trimmed.toLowerCase() ? (
          <mark
            key={i}
            className="bg-amber-200/90 text-amber-900 font-medium rounded px-0.5 underline decoration-amber-500 decoration-2 underline-offset-1"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
}
