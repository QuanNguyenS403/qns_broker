/**
 * Loading boundary riêng cho trang /dang-tin
 *
 * Không có file này, khi bấm link sang trang khác từ /dang-tin, Next.js giữ nguyên
 * trang cũ cho tới khi route mới tải xong (đặc biệt chậm ở Turbopack dev mode).
 * Người dùng tưởng bấm không ăn và "vẫn đứng ở trang đăng tin".
 * Có boundary này, vùng nội dung chuyển ngay sang skeleton trong khi layout tiếp tục.
 */
export default function DangTinLoading() {
  return (
    <div className="container-max max-w-4xl px-4 py-8 sm:py-12 animate-pulse" aria-busy="true" aria-live="polite">
      {/* Skeleton banner */}
      <div className="mb-7 rounded-2xl border border-slate-200 bg-slate-100 p-5 sm:p-6 h-28" />

      {/* Skeleton form */}
      <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 md:p-9 shadow-sm">
        {/* Loại hình */}
        <div className="space-y-2">
          <div className="h-4 w-48 rounded-lg bg-slate-200" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 rounded-xl bg-slate-100" />
            ))}
          </div>
        </div>

        {/* Địa chỉ */}
        <div className="space-y-2">
          <div className="h-4 w-36 rounded-lg bg-slate-200" />
          <div className="h-11 rounded-xl bg-slate-100" />
          <div className="h-52 rounded-2xl bg-slate-100" />
        </div>

        {/* Các trường thông tin */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-40 rounded-lg bg-slate-200" />
            <div className="h-11 rounded-xl bg-slate-100" />
          </div>
        ))}

        {/* Nút submit */}
        <div className="h-12 w-full rounded-xl bg-slate-200" />
      </div>

      <span className="sr-only">Đang tải trang đăng tin</span>
    </div>
  );
}
