/**
 * Loading boundary riêng cho khu vực Tài khoản (/tai-khoan/*)
 */
export default function TaiKhoanLoading() {
  return (
    <div className="container-max max-w-5xl py-8 sm:py-12 animate-pulse" aria-busy="true" aria-live="polite">
      {/* Header tài khoản skeleton */}
      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm flex items-center gap-5">
        <div className="h-20 w-20 rounded-full bg-slate-200 shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-6 w-52 rounded-lg bg-slate-200" />
          <div className="h-4 w-36 rounded bg-slate-200" />
          <div className="h-3.5 w-28 rounded bg-slate-100" />
        </div>
      </div>

      {/* Tabs điều hướng skeleton */}
      <div className="flex gap-2 mb-6 border-b border-slate-200 pb-3">
        <div className="h-9 w-32 rounded-xl bg-slate-200" />
        <div className="h-9 w-32 rounded-xl bg-slate-100" />
        <div className="h-9 w-32 rounded-xl bg-slate-100" />
      </div>

      {/* Khung nội dung skeleton */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-4">
        <div className="h-5 w-44 rounded bg-slate-200" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-slate-50 border border-slate-100 p-3 space-y-1.5">
              <div className="h-3.5 w-24 rounded bg-slate-200" />
              <div className="h-4 w-40 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only">Đang tải thông tin tài khoản</span>
    </div>
  );
}
