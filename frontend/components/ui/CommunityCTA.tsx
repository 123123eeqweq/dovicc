import Link from 'next/link';
import { PenTool } from 'lucide-react';
import { RegisterCompanyButton } from '@/components/company/RegisterCompanyButton';

export function CommunityCTA() {
  return (
    <div className="bg-slate-900 rounded-2xl md:rounded-3xl p-6 md:p-16 text-center text-white relative overflow-hidden shadow-[0_2px_20px_-5px_rgba(0,0,0,0.15)] border border-slate-800/50">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
      </div>
      <div className="relative z-10 max-w-3xl mx-auto">
        <h2 className="text-xl md:text-4xl font-bold mb-3 md:mb-4">
          Приєднуйтесь до спільноти DOVI.COM.UA
        </h2>
        <p className="text-sm md:text-lg text-slate-300 mb-6 md:mb-8 leading-relaxed">
          Діліться своїм досвідом, допомагайте іншим робити правильний вибір та змінюйте українську спільноту на краще разом з нами.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
          <Link 
            href="/review/add" 
            className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 md:px-8 py-3 md:py-4 rounded-xl text-sm md:text-base transition-all shadow-[0_2px_12px_-4px_rgba(5,150,105,0.4)] hover:shadow-[0_4px_20px_-4px_rgba(5,150,105,0.5)] active:scale-[0.98]"
          >
            <PenTool size={18} className="md:w-5 md:h-5" />
            Написати перший відгук
          </Link>
          <RegisterCompanyButton />
        </div>
      </div>
    </div>
  );
}
