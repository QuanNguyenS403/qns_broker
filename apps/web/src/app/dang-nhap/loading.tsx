/**
 * Loading boundary riêng cho trang Đăng nhập (/dang-nhap)
 */
export default function DangNhapLoading() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center py-12 px-4 animate-pulse" aria-busy="true" aria-live="polite">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 sm:p-9 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto h-7 w-48 rounded-lg bg-slate-200" />
          <div className="mx-auto h-4 w-64 rounded bg-slate-100" />
        </div>

        {/* Nút Google */}
        <div className="h-11 w-full rounded-xl bg-slate-100 border border-slate-200" />

        <div className="h-3.5 w-32 mx-auto rounded bg-slate-100" />

        {/* Inputs */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <div className="h-4 w-20 rounded bg-slate-200" />
            <div className="h-11 w-full rounded-xl bg-slate-50 border border-slate-200" />
          </div>
          <div className="space-y-1.5">
            <div className="h-4 w-20 rounded bg-slate-200" />
            <div className="h-11 w-full rounded-xl bg-slate-50 border border-slate-200" />
          </div>
        </div>

        {/* Nút đăng nhập */}
        <div className="h-12 w-full rounded-xl bg-slate-200" />
      </div>
      <span className="sr-only">Đang tải trang đăng nhập</span>
    </div>
  );
}
