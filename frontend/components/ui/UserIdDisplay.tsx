'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { toast } from '@/lib/toast';

interface UserIdDisplayProps {
  userId: string;
  showLink?: boolean;
  className?: string;
  variant?: 'default' | 'compact';
}

export function UserIdDisplay({ userId, showLink = true, className = '', variant = 'default' }: UserIdDisplayProps) {
  const [copied, setCopied] = useState(false);

  const formatUserId = (id: string) => {
    if (variant === 'compact') {
      return `${id.substring(0, 8)}…${id.substring(id.length - 4)}`;
    }
    return `${id.substring(0, 8)}…${id.substring(id.length - 8)}`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(userId);
      setCopied(true);
      toast.success('ID скопійовано');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Не вдалося скопіювати ID');
    }
  };

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        <span className="text-xs font-mono text-slate-500">{formatUserId(userId)}</span>
        <button
          onClick={handleCopy}
          className="p-1 hover:bg-slate-100 rounded transition-colors"
          title="Скопіювати ID"
        >
          {copied ? (
            <Check size={12} className="text-emerald-600" />
          ) : (
            <Copy size={12} className="text-slate-400" />
          )}
        </button>
        {showLink && (
          <Link
            href={`/admin/users/${userId}`}
            className="p-1 hover:bg-slate-100 rounded transition-colors"
            title="Відкрити профіль користувача"
          >
            <ExternalLink size={12} className="text-slate-400" />
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-2 px-2 py-1 bg-slate-50 rounded border border-slate-200">
        <span className="text-xs font-mono text-slate-700">{formatUserId(userId)}</span>
        <button
          onClick={handleCopy}
          className="p-1 hover:bg-slate-200 rounded transition-colors"
          title="Скопіювати ID"
        >
          {copied ? (
            <Check size={14} className="text-emerald-600" />
          ) : (
            <Copy size={14} className="text-slate-500" />
          )}
        </button>
      </div>
    </div>
  );
}
