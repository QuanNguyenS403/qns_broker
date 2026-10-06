/**
 * Loading boundary riêng cho khu vực /admin
 *
 * Không có file này, khi bấm chuyển mục trong sidebar Next.js giữ nguyên trang cũ (Tổng quan)
 * cho tới khi route mới tải xong — ở chế độ dev (Turbopack biên dịch theo yêu cầu) việc này có
 * thể mất vài giây nên người dùng tưởng bấm không ăn và "vẫn đứng ở trang admin"
 * Có boundary này, vùng nội dung đổi ngay sang skeleton trong khi sidebar vẫn giữ nguyên
 */
export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-live="polite">
      <div className="space-y-2">
        <div className="h-7 w-72 rounded-xl bg-slate-200" />
        <div className="h-4 w-96 max-w-full rounded-lg bg-slate-200" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-white border border-slate-200" />
        ))}
      </div>
      <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 rounded-xl bg-slate-100" />
        ))}
      </div>
      <span className="sr-only">Đang tải nội dung quản trị</span>
    </div>
  );
}
