import { CategoryListSkeleton } from '@/components/ui/Skeletons';

export default function Loading() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8">
      <div className="mb-8">
        <div className="h-8 bg-slate-200 rounded w-1/4 mb-4 animate-pulse"></div>
        <div className="h-4 bg-slate-200 rounded w-1/2 animate-pulse"></div>
      </div>
      <CategoryListSkeleton />
    </div>
  );
}
