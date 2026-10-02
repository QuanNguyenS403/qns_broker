'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function ListingDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Lỗi tải chi tiết tin đăng:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md text-center">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-500/10 text-3xl text-amber-600 mb-6 ring-1 ring-amber-500/20">
          🏢
        </div>
        <h1 className="text-2xl font-bold text-text-primary">Không thể tải thông tin phòng</h1>
        <p className="mt-3 text-sm text-text-secondary leading-relaxed">
          Đang có sự cố kết nối tới máy chủ hoặc dữ liệu phòng đang được cập nhật
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="btn-primary w-full sm:w-auto"
          >
            Thử tải lại
          </button>
          <Link href="/thue" className="btn-secondary w-full sm:w-auto">
            ← Xem danh sách phòng khác
          </Link>
        </div>
      </div>
    </div>
  );
}
