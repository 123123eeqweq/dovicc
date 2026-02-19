'use client';

import { useState } from 'react';
import { BusinessAccessModal } from './BusinessAccessModal';

export function BusinessAccessButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full bg-white text-emerald-600 font-bold py-2 rounded-lg text-sm hover:bg-slate-50 transition-colors relative z-10"
      >
        Отримати доступ
      </button>
      <BusinessAccessModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
