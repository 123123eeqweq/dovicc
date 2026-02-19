'use client';

import { useState } from 'react';

interface CompanyTabsProps {
  reviewCount: number;
  children: {
    reviews: React.ReactNode;
    about: React.ReactNode;
  };
}

export function CompanyTabs({ reviewCount, children }: CompanyTabsProps) {
  const [activeTab, setActiveTab] = useState<'reviews' | 'about'>('reviews');

  return (
    <>
      <div className="mt-8 pt-6 border-t border-slate-200/80 flex gap-8 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('reviews')}
          className={`pb-2 border-b-2 font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'reviews'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Відгуки ({reviewCount})
        </button>
        <button
          onClick={() => setActiveTab('about')}
          className={`pb-2 border-b-2 font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'about'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Про компанію
        </button>
      </div>
      {activeTab === 'reviews' ? children.reviews : children.about}
    </>
  );
}
