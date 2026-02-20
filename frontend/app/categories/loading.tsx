import { CategoryListSkeleton } from '@/components/ui/Skeletons';

export default function Loading() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 pt-20 pb-8 md:py-8">
      <div className="text-center mb-12">
        <div className="h-8 bg-slate-200 rounded w-1/4 mx-auto mb-4 animate-pulse"></div>
        <div className="h-4 bg-slate-200 rounded w-1/2 mx-auto animate-pulse"></div>
      </div>
      <CategoryListSkeleton />
    </div>
  );
}
