'use client';

import { useState, useEffect } from 'react';
import { Share } from 'lucide-react';
import { ShareModal } from './ShareModal';

interface ShareButtonProps {
  url: string;
  title?: string;
}

export function ShareButton({ url, title }: ShareButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fullUrl, setFullUrl] = useState(url);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (url.startsWith('/')) {
        setFullUrl(`${window.location.origin}${url}`);
      } else {
        setFullUrl(url);
      }
    }
  }, [url]);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="h-10 px-5 flex items-center justify-center rounded-lg border border-slate-200 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors shadow-sm bg-white"
      >
        <Share size={20} className="mr-2" />
        Поділитися
      </button>
      <ShareModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        url={fullUrl}
        title={title}
      />
    </>
  );
}
