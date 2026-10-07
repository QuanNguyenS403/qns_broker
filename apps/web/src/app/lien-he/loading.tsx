/**
 * Loading boundary riêng cho trang Liên hệ (/lien-he)
 */
export default function LienHeLoading() {
  return (
    <div className="bg-surface-subtle min-h-[80vh] py-10 lg:py-14 animate-pulse" aria-busy="true" aria-live="polite">
      <div className="container-max max-w-6xl">
        <div className="mb-6 h-4 w-36 rounded bg-slate-200" />

        <div className="rounded-2xl border border-surface-border bg-white p-8 md:p-12 shadow-card space-y-6">
          <div className="h-9 w-72 rounded-xl bg-slate-200" />
          <div className="h-4 w-full max-w-2xl rounded bg-slate-100" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl border border-slate-100 bg-slate-50 p-5 space-y-2">
                <div className="h-5 w-36 rounded bg-slate-200" />
                <div className="h-4 w-48 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <span className="sr-only">Đang tải trang liên hệ</span>
    </div>
  );
}
