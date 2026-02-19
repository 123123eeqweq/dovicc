export function CompanyCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
      <div className="h-48 bg-slate-200"></div>
      <div className="p-5 space-y-4">
        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
        <div className="h-3 bg-slate-200 rounded w-1/2"></div>
        <div className="pt-4 border-t border-slate-100 flex gap-3">
          <div className="flex-1 h-10 bg-slate-200 rounded-lg"></div>
          <div className="w-32 h-10 bg-slate-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}

export function ReviewCardSkeleton() {
  return (
    <article className="bg-white rounded-2xl border border-slate-200 p-6 mb-4 animate-pulse">
      <div className="flex items-start gap-4 mb-4">
        <div className="size-12 rounded-full bg-slate-200 shrink-0"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 rounded w-1/4"></div>
          <div className="h-3 bg-slate-200 rounded w-1/3"></div>
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-slate-200 rounded"></div>
        <div className="h-4 bg-slate-200 rounded w-5/6"></div>
        <div className="h-4 bg-slate-200 rounded w-4/6"></div>
      </div>
      <div className="flex gap-4 pt-4 border-t border-slate-100">
        <div className="h-6 w-16 bg-slate-200 rounded"></div>
        <div className="h-6 w-16 bg-slate-200 rounded"></div>
      </div>
    </article>
  );
}

export function CompanyProfileSkeleton() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8 space-y-8 animate-pulse">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="size-24 md:size-32 rounded-xl bg-slate-200 shrink-0"></div>
          <div className="flex-1 space-y-4 w-full">
            <div className="h-8 bg-slate-200 rounded w-2/3"></div>
            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/3"></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="h-6 bg-slate-200 rounded w-1/4 mb-6"></div>
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="size-32 rounded-full bg-slate-200"></div>
          <div className="flex-1 w-full space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-2 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <ReviewCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function CategoryListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="size-12 rounded-xl bg-slate-200 mb-4"></div>
          <div className="h-6 bg-slate-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-full"></div>
        </div>
      ))}
    </div>
  );
}

export function ReviewListSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <ReviewCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function AdminTableSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden animate-pulse">
      <div className="p-4 border-b border-slate-200">
        <div className="h-6 bg-slate-200 rounded w-1/4"></div>
      </div>
      <div className="divide-y divide-slate-200">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-slate-200"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                <div className="h-3 bg-slate-200 rounded w-1/4"></div>
              </div>
              <div className="h-8 w-20 bg-slate-200 rounded"></div>
              <div className="h-8 w-20 bg-slate-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminReviewSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-6 animate-pulse">
      <div className="flex flex-col md:flex-row md:items-start gap-6">
        <div className="flex-1">
          <div className="flex items-start gap-4 mb-4">
            <div className="size-12 rounded-full bg-slate-200 shrink-0"></div>
            <div className="flex-1 min-w-0 overflow-hidden">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <div className="h-5 bg-slate-200 rounded w-32"></div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="size-4 bg-slate-200 rounded"></div>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 mb-2">
                <div className="h-3 bg-slate-200 rounded w-40"></div>
                <div className="h-3 bg-slate-200 rounded w-32"></div>
              </div>
              <div className="h-3 bg-slate-200 rounded w-24 mb-2"></div>
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="h-4 bg-slate-200 rounded w-48"></div>
                <div className="h-4 bg-slate-200 rounded w-32"></div>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 mb-4">
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 rounded"></div>
                  <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                  <div className="h-4 bg-slate-200 rounded w-4/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-row sm:flex-col gap-2 sm:w-full md:w-48 shrink-0">
          <div className="flex-1 sm:flex-none h-12 bg-slate-200 rounded-lg"></div>
          <div className="flex-1 sm:flex-none h-12 bg-slate-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}

export function AdminReportSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-6 animate-pulse">
      <div className="flex flex-col gap-6">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="size-5 bg-slate-200 rounded shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-48"></div>
              <div className="h-3 bg-slate-200 rounded w-64"></div>
              <div className="h-4 bg-slate-200 rounded w-40"></div>
              <div className="h-3 bg-slate-200 rounded w-32"></div>
            </div>
          </div>
        </div>
        <div className="border-l-4 border-slate-300 pl-4">
          <div className="h-5 bg-slate-200 rounded w-48 mb-3"></div>
          <div className="flex items-center gap-2 mb-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="size-4 bg-slate-200 rounded"></div>
            ))}
          </div>
          <div className="bg-red-50 border border-red-200 rounded p-3 mb-3">
            <div className="h-4 bg-slate-200 rounded w-32 mb-2"></div>
            <div className="h-3 bg-slate-200 rounded w-48"></div>
          </div>
          <div className="bg-slate-50 rounded-lg p-4 mb-4">
            <div className="h-4 bg-slate-200 rounded w-24 mb-2"></div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 rounded"></div>
              <div className="h-4 bg-slate-200 rounded w-5/6"></div>
              <div className="h-4 bg-slate-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-slate-200">
          <div className="flex-1 sm:flex-none h-12 bg-slate-200 rounded-lg"></div>
          <div className="flex-1 sm:flex-none h-12 bg-slate-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}

export function AdminCompanySkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-6 animate-pulse">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <div className="flex items-start gap-4 mb-4">
            <div className="size-16 rounded-xl bg-slate-200 shrink-0"></div>
            <div className="flex-1 min-w-0 overflow-hidden">
              <div className="h-6 bg-slate-200 rounded w-48 mb-3"></div>
              <div className="flex flex-wrap items-center gap-4 mb-3">
                <div className="h-4 bg-slate-200 rounded w-32"></div>
                <div className="h-4 bg-slate-200 rounded w-40"></div>
                <div className="h-4 bg-slate-200 rounded w-24"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 rounded w-40"></div>
                <div className="h-3 bg-slate-200 rounded w-56"></div>
                <div className="h-3 bg-slate-200 rounded w-32"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-row sm:flex-col gap-2 sm:w-full lg:w-48 shrink-0">
          <div className="flex-1 sm:flex-none h-12 bg-slate-200 rounded-lg"></div>
          <div className="flex-1 sm:flex-none h-12 bg-slate-200 rounded-lg"></div>
          <div className="flex-1 sm:flex-none h-12 bg-slate-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}

export function AdminUserTableSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-pulse">
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <div className="min-w-full divide-y divide-slate-200">
            <div className="bg-slate-50 border-b border-slate-200 px-2 sm:px-4 py-3">
              <div className="grid grid-cols-6 gap-4">
                <div className="h-4 bg-slate-200 rounded w-20"></div>
                <div className="h-4 bg-slate-200 rounded w-16 hidden sm:block"></div>
                <div className="h-4 bg-slate-200 rounded w-16"></div>
                <div className="h-4 bg-slate-200 rounded w-16 hidden md:block"></div>
                <div className="h-4 bg-slate-200 rounded w-24 hidden lg:block"></div>
                <div className="h-4 bg-slate-200 rounded w-24 hidden lg:block"></div>
              </div>
            </div>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="px-2 sm:px-4 py-3">
                <div className="grid grid-cols-6 gap-4 items-center">
                  <div className="flex items-center gap-1.5">
                    <div className="size-8 sm:size-10 rounded-full bg-slate-200"></div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="h-4 bg-slate-200 rounded w-32"></div>
                      <div className="h-3 bg-slate-200 rounded w-48"></div>
                    </div>
                  </div>
                  <div className="h-3 bg-slate-200 rounded w-24 hidden sm:block"></div>
                  <div className="h-4 bg-slate-200 rounded w-8 mx-auto"></div>
                  <div className="h-4 bg-slate-200 rounded w-8 mx-auto hidden md:block"></div>
                  <div className="h-3 bg-slate-200 rounded w-20 hidden lg:block"></div>
                  <div className="h-3 bg-slate-200 rounded w-20 hidden lg:block"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminCompanyTableSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-pulse">
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <div className="min-w-full divide-y divide-slate-200">
            <div className="bg-slate-50 border-b border-slate-200 px-3 sm:px-6 py-3">
              <div className="grid grid-cols-7 gap-4">
                <div className="h-4 bg-slate-200 rounded w-24"></div>
                <div className="h-4 bg-slate-200 rounded w-20 hidden md:block"></div>
                <div className="h-4 bg-slate-200 rounded w-16 hidden lg:block"></div>
                <div className="h-4 bg-slate-200 rounded w-16"></div>
                <div className="h-4 bg-slate-200 rounded w-16 hidden sm:block"></div>
                <div className="h-4 bg-slate-200 rounded w-20 hidden lg:block"></div>
                <div className="h-4 bg-slate-200 rounded w-20"></div>
              </div>
            </div>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="px-3 sm:px-6 py-4">
                <div className="grid grid-cols-7 gap-4 items-center">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="size-10 sm:size-12 rounded-lg bg-slate-200"></div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="h-4 bg-slate-200 rounded w-32"></div>
                      <div className="h-3 bg-slate-200 rounded w-48 hidden sm:block"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-slate-200 rounded w-24 hidden md:block"></div>
                  <div className="h-4 bg-slate-200 rounded w-20 hidden lg:block"></div>
                  <div className="h-4 bg-slate-200 rounded w-12 mx-auto"></div>
                  <div className="h-4 bg-slate-200 rounded w-12 mx-auto hidden sm:block"></div>
                  <div className="h-3 bg-slate-200 rounded w-20 hidden lg:block"></div>
                  <div className="h-8 bg-slate-200 rounded w-20 mx-auto"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminCompanyFormSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 animate-pulse">
        <div className="mb-8">
          <div className="h-5 bg-slate-200 rounded w-32 mb-4"></div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="h-8 bg-slate-200 rounded w-64 mb-2"></div>
            <div className="h-4 bg-slate-200 rounded w-48"></div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="size-24 rounded-xl bg-slate-200"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-32"></div>
                <div className="h-10 bg-slate-200 rounded w-40"></div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="h-4 bg-slate-200 rounded w-24 mb-2"></div>
                <div className="h-10 bg-slate-200 rounded w-full"></div>
              </div>
              <div>
                <div className="h-4 bg-slate-200 rounded w-24 mb-2"></div>
                <div className="h-10 bg-slate-200 rounded w-full"></div>
              </div>
              <div>
                <div className="h-4 bg-slate-200 rounded w-24 mb-2"></div>
                <div className="h-32 bg-slate-200 rounded w-full"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="h-4 bg-slate-200 rounded w-24 mb-2"></div>
                  <div className="h-10 bg-slate-200 rounded w-full"></div>
                </div>
                <div>
                  <div className="h-4 bg-slate-200 rounded w-24 mb-2"></div>
                  <div className="h-10 bg-slate-200 rounded w-full"></div>
                </div>
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <div className="h-12 bg-slate-200 rounded w-32"></div>
              <div className="h-12 bg-slate-200 rounded w-32"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminUserDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 animate-pulse">
        <div className="mb-8">
          <div className="h-5 bg-slate-200 rounded w-40 mb-4"></div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="size-14 sm:size-16 rounded-full bg-slate-200"></div>
              <div className="flex-1 space-y-2">
                <div className="h-7 bg-slate-200 rounded w-48"></div>
                <div className="h-4 bg-slate-200 rounded w-64"></div>
                <div className="h-3 bg-slate-200 rounded w-40"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <div className="h-8 bg-slate-200 rounded w-16 mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-24"></div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="h-6 bg-slate-200 rounded w-32 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="border-b border-slate-100 pb-4 last:border-0">
                <div className="flex items-start gap-4">
                  <div className="size-10 rounded-lg bg-slate-200"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-48"></div>
                    <div className="h-3 bg-slate-200 rounded w-full"></div>
                    <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
