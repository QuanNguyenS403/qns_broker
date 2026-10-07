/**
 * Loading boundary riêng cho trang Cho thuê mặt bằng (/cho-thue-mat-bang)
 */
export default function ChoThueMatBangLoading() {
  return (
    <div className="min-h-screen bg-surface-muted py-8 animate-pulse" aria-busy="true" aria-live="polite">
      <div className="container-max">
        {/* Breadcrumb skeleton */}
        <div className="mb-4 h-4 w-52 rounded bg-slate-200" />

        {/* Tiêu đề skeleton */}
        <div className="h-9 w-80 rounded-xl bg-slate-200" />
        <div className="mt-2 h-4 w-44 rounded bg-slate-200" />

        {/* SearchFilterBar skeleton */}
        <div className="mt-6 mb-8 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
          <div className="h-5 w-48 rounded bg-slate-200" />
          <div className="grid grid-cols-2 lg:flex gap-3">
            <div className="h-12 rounded-xl bg-slate-100 col-span-2 lg:flex-[1.6]" />
            <div className="h-12 rounded-xl bg-slate-100 col-span-1 lg:flex-1" />
            <div className="h-12 rounded-xl bg-slate-100 col-span-1 lg:flex-1" />
            <div className="h-12 rounded-xl bg-slate-100 col-span-2 lg:w-32" />
          </div>
        </div>

        {/* Grid listing skeleton */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
              <div className="aspect-[16/10] w-full rounded-xl bg-slate-100" />
              <div className="h-5 w-3/4 rounded bg-slate-200" />
              <div className="h-4 w-1/2 rounded bg-slate-200" />
              <div className="pt-2 border-t border-slate-100 flex justify-between">
                <div className="h-4 w-28 rounded bg-slate-200" />
                <div className="h-4 w-16 rounded bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only">Đang tải danh sách mặt bằng cho thuê</span>
    </div>
  );
}
