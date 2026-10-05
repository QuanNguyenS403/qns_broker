export default function ThueLoading() {
  return (
    <div className="min-h-screen bg-surface-muted">
      <div className="container-max py-8">
        {/* Breadcrumb skeleton */}
        <div className="mb-4 h-4 w-40 skeleton rounded" />

        {/* Title skeleton */}
        <div className="h-9 w-80 skeleton rounded-xl" />
        <div className="mt-2 h-4 w-32 skeleton rounded" />

        {/* SearchFilterBar skeleton */}
        <div className="mt-8 mb-10 rounded-2xl md:rounded-[22px] border border-slate-200 bg-white p-5 sm:p-6 md:p-7 shadow-sm">
          <div className="mb-4 sm:mb-5 space-y-1.5">
            <div className="h-6 w-56 skeleton rounded-md" />
            <div className="h-4 w-96 max-w-full skeleton rounded-md" />
          </div>
          <div className="grid grid-cols-2 lg:flex lg:items-center gap-3">
            <div className="h-12 skeleton rounded-xl col-span-2 lg:flex-[1.6]" />
            <div className="h-12 skeleton rounded-xl col-span-1 lg:flex-[1.2]" />
            <div className="h-12 skeleton rounded-xl col-span-1 lg:flex-1" />
            <div className="h-12 skeleton rounded-xl col-span-1 lg:flex-1" />
            <div className="h-12 skeleton rounded-xl col-span-1 lg:w-32" />
          </div>
          <div className="mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              <div className="h-9 w-28 skeleton rounded-full" />
              <div className="h-9 w-28 skeleton rounded-full" />
              <div className="h-9 w-28 skeleton rounded-full" />
            </div>
            <div className="h-8 w-24 skeleton rounded-lg" />
          </div>
        </div>

        {/* Grid listing skeletons */}
        <div className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="overflow-hidden rounded-2xl bg-white p-4 shadow-card space-y-3">
              <div className="aspect-[16/10] w-full skeleton rounded-xl" />
              <div className="flex items-center justify-between">
                <div className="h-6 w-1/3 skeleton rounded-lg" />
                <div className="h-4 w-16 skeleton rounded" />
              </div>
              <div className="h-5 w-full skeleton rounded-lg" />
              <div className="h-4 w-2/3 skeleton rounded" />
              <div className="flex gap-3 pt-2 border-t border-slate-100">
                <div className="h-4 w-14 skeleton rounded" />
                <div className="h-4 w-14 skeleton rounded" />
                <div className="h-4 w-14 skeleton rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
