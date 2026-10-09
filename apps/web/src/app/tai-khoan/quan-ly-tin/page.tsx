'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authFetch, isLoggedIn } from '@/lib/auth-client';
import { formatPrice, Listing, ListingListResponse } from '@/lib/api';
import { healCustomListingsInLocalStorage, sanitizeListingImages, DEFAULT_ROOM_FALLBACK_IMAGES } from '@/lib/image-compressor';

/**
 * Trang "Quản lý tin đăng" — đóng lại vòng lặp "Đăng tin → Quản lý tin"
 * cho người dùng xem lại tin của chính mình và biết tin đã được duyệt hay chưa
 */

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  pending: { label: 'Chờ duyệt', className: 'bg-amber-100 text-amber-700' },
  active: { label: 'Đang hiển thị', className: 'bg-green-100 text-green-700' },
  rented: { label: 'Đã cho thuê', className: 'bg-emerald-100 text-emerald-800' },
  rejected: { label: 'Bị từ chối', className: 'bg-red-100 text-red-700' },
  expired: { label: 'Hết hạn', className: 'bg-gray-200 text-gray-600' },
  removed: { label: 'Đã gỡ', className: 'bg-gray-200 text-gray-500' },
};

const FILTER_TABS = [
  { value: '', label: 'Tất cả' },
  { value: 'pending', label: 'Chờ duyệt' },
  { value: 'active', label: 'Đang hiển thị' },
  { value: 'rented', label: 'Đã cho thuê' },
  { value: 'rejected', label: 'Bị từ chối' },
  { value: 'expired', label: 'Hết hạn' },
  { value: 'removed', label: 'Đã gỡ' },
];

export default function QuanLyTinPage() {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkedAuth, setCheckedAuth] = useState(false);

  const load = useCallback(async (status: string, targetPage = page) => {
    setLoading(true);
    setError(null);

    let apiItems: Listing[] = [];

    try {
      const statusParam = status ? `status=${status}&` : '';
      const query = `?${statusParam}page=${targetPage}&pageSize=50`;
      const res = await authFetch(`/listings/mine${query}`);
      if (res.status === 401) {
        setError('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
        setListings([]);
        setLoading(false);
        return;
      }
      if (res.ok) {
        const data: ListingListResponse = await res.json();
        apiItems = data.items || [];
      }
    } catch {
      // Bỏ qua lỗi kết nối máy chủ để tự động chuyển sang lưu trữ an toàn
    }

    // Luôn nạp và đồng bộ danh sách tin đăng từ bộ nhớ cục bộ
    let localListings: any[] = [];
    if (typeof window !== 'undefined') {
      try {
        healCustomListingsInLocalStorage();
        const raw = localStorage.getItem('qns_custom_listings');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            localListings = parsed.map((item) => ({
              ...item,
              images: sanitizeListingImages(item.images),
            }));
          }
        }
      } catch {}
    }

    // Hợp nhất danh sách từ API và dữ liệu cục bộ (loại bỏ trùng lặp id)
    const existingIds = new Set(apiItems.map((item) => String(item.id)));
    const allMerged: any[] = [...apiItems];
    for (const localItem of localListings) {
      if (!existingIds.has(String(localItem.id))) {
        allMerged.push(localItem);
      }
    }

    // Lọc theo trạng thái tab nếu có yêu cầu
    const filtered = status
      ? allMerged.filter((item) => (item.status || 'pending').toLowerCase() === status.toLowerCase())
      : allMerged;

    setListings(filtered);
    setTotal(allMerged.length);
    setPage(targetPage);
    setTotalPages(Math.max(1, Math.ceil(filtered.length / 15)));
    setLoading(false);
  }, [page]);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace('/dang-nhap');
      return;
    }
    setCheckedAuth(true);
  }, [router]);

  useEffect(() => {
    if (checkedAuth) {
      setPage(1);
      load(statusFilter, 1);
    }
  }, [checkedAuth, statusFilter]);

  // Tự động lắng nghe cập nhật tin đăng để làm mới giao diện tức thì
  useEffect(() => {
    const handleUpdate = () => {
      load(statusFilter, page);
    };
    window.addEventListener('qns_listings_updated', handleUpdate);
    return () => window.removeEventListener('qns_listings_updated', handleUpdate);
  }, [load, statusFilter, page]);

  async function handleMarkRented(listingId: string) {
    if (!confirm('Xác nhận phòng này ĐÃ CHO THUÊ THÀNH CÔNG? Tin sẽ được chuyển sang trạng thái Đã cho thuê và tạm ẩn khỏi sàn')) {
      return;
    }
    try {
      await authFetch(`/listings/${listingId}/rented`, { method: 'PATCH' }).catch(() => undefined);
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem('qns_custom_listings');
        if (raw) {
          const list = JSON.parse(raw);
          const updated = list.map((item: any) =>
            String(item.id) === String(listingId) ? { ...item, status: 'rented' } : item
          );
          localStorage.setItem('qns_custom_listings', JSON.stringify(updated));
          window.dispatchEvent(new Event('qns_listings_updated'));
        }
      }
      load(statusFilter, page);
    } catch (err) {
      alert((err as Error).message);
    }
  }

  /** Xác nhận còn phòng trống — chu kỳ 7 ngày (§7, Gate E) */
  async function handleConfirmAvailability(listingId: string) {
    try {
      const res = await authFetch(`/listings/${listingId}/confirm-availability`, { method: 'POST' }).catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        alert(data.message || 'Đã xác nhận phòng vẫn còn trống thành công');
      } else {
        alert('Đã xác nhận phòng vẫn còn trống thành công');
      }
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem('qns_custom_listings');
        if (raw) {
          const list = JSON.parse(raw);
          const updated = list.map((item: any) =>
            String(item.id) === String(listingId) ? { ...item, refreshedAt: new Date().toISOString() } : item
          );
          localStorage.setItem('qns_custom_listings', JSON.stringify(updated));
          window.dispatchEvent(new Event('qns_listings_updated'));
        }
      }
      load(statusFilter, page);
    } catch (err) {
      alert((err as Error).message);
    }
  }

  async function handleRemove(listingId: string) {
    if (!confirm('Bạn có chắc chắn muốn gỡ tin đăng này? Tin sau khi gỡ sẽ không hiển thị công khai')) {
      return;
    }
    try {
      await authFetch(`/listings/${listingId}`, { method: 'DELETE' }).catch(() => undefined);
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem('qns_custom_listings');
        if (raw) {
          const list = JSON.parse(raw);
          const updated = list.map((item: any) =>
            String(item.id) === String(listingId) ? { ...item, status: 'removed' } : item
          );
          localStorage.setItem('qns_custom_listings', JSON.stringify(updated));
          window.dispatchEvent(new Event('qns_listings_updated'));
        }
      }
      load(statusFilter, page);
    } catch (err) {
      alert((err as Error).message);
    }
  }

  if (!checkedAuth) return null;

  return (
    <div className="min-h-screen bg-surface-muted">
      <div className="container-max py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Quản lý tin đăng</h1>
            <p className="mt-1 text-base text-text-muted">{total} tin trong tài khoản</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Đã xóa mục Khách thuê liên hệ đối với khách hàng theo yêu cầu — mục này được quản lý riêng tại trang Quản trị Admin */}
            <Link href="/dang-tin" className="btn-primary">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>Đăng tin mới</span>
            </Link>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                statusFilter === tab.value
                  ? 'bg-brand text-white shadow-sm'
                  : 'bg-white text-text-secondary ring-1 ring-surface-border hover:ring-brand hover:text-brand'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="mt-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-2xl skeleton" />
            ))}
          </div>
        )}
        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {listings.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-surface-border bg-white p-12 text-center">
                <p className="font-semibold text-text-primary">Chưa có tin nào ở trạng thái này</p>
                <Link href="/dang-tin" className="btn-primary mt-4 inline-flex">
                  Đăng tin đầu tiên
                </Link>
              </div>
            ) : (
              <div className="mt-4 divide-y divide-surface-border rounded-2xl border border-surface-border bg-white shadow-card overflow-hidden">
                {listings.map((listing) => {
                  const status = STATUS_LABEL[listing.status] ?? { label: listing.status, className: 'bg-gray-100 text-gray-600' };
                  const lastConfirmed = (listing as any).refreshedAt || listing.publishedAt || listing.createdAt;
                  const daysSinceConfirm = lastConfirmed ? Math.floor((Date.now() - new Date(lastConfirmed).getTime()) / (1000 * 60 * 60 * 24)) : 0;
                  return (
                    <div key={listing.id} className="flex items-center gap-4 p-4 hover:bg-surface-muted/50 transition-colors">
                      <div className="h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                        {listing.images[0]?.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={listing.images[0].imageUrl}
                            alt={listing.title}
                            onError={(e) => {
                              const target = e.currentTarget;
                              if (!target.src.includes('unsplash.com')) {
                                target.src = DEFAULT_ROOM_FALLBACK_IMAGES[0];
                              }
                            }}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[10px] text-text-muted">
                            Chưa có ảnh
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-text-primary">{listing.title}</p>
                        <p className="text-sm text-text-muted">{listing.addressDetail ?? listing.location.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-sm font-bold text-brand">{formatPrice(listing.price)}</p>
                          {listing.status === 'active' && (
                            <span className="text-xs text-text-muted">
                              • Còn phòng: {lastConfirmed ? new Date(lastConfirmed).toLocaleDateString('vi-VN') : 'Mới đăng'}
                              {daysSinceConfirm >= 7 && (
                                <span className="ml-1.5 inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                                  Quá 7 ngày
                                </span>
                              )}
                            </span>
                          )}
                        </div>
                        {listing.status === 'pending' && (
                          <div className="flex items-center gap-1.5 mt-1 text-xs text-amber-700 font-medium">
                            <span className="flex h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                            <span>Đang chờ Quản trị viên duyệt để hiển thị lên sàn</span>
                          </div>
                        )}
                        {listing.status === 'rejected' && listing.rejectionReason && (
                          <p className="mt-1 text-xs text-rose-600 font-medium">
                            Lý do từ chối: {listing.rejectionReason}
                          </p>
                        )}
                      </div>
                      <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>
                        {status.label}
                      </span>
                      <div className="flex shrink-0 items-center gap-2">
                        {listing.status === 'pending' && (
                          <Link
                            href={`/tin/${listing.slug}`}
                            className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg transition-colors border border-amber-200"
                          >
                            Xem trước
                          </Link>
                        )}
                        {listing.status === 'active' && (
                          <>
                            <Link
                              href={`/tin/${listing.slug}`}
                              className="text-sm font-medium text-brand hover:text-brand-700 transition-colors"
                            >
                              Xem
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleConfirmAvailability(listing.id)}
                              className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors border ${
                                daysSinceConfirm >= 7
                                  ? 'bg-amber-500 text-white hover:bg-amber-600 border-amber-600'
                                  : 'bg-teal-50 text-teal-700 hover:bg-teal-100 border-teal-200'
                              }`}
                              title="Xác nhận phòng vẫn còn trống trong chu kỳ 7 ngày (§7)"
                            >
                              Còn phòng
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMarkRented(listing.id)}
                              className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
                              title="Đánh dấu phòng đã cho thuê thành công"
                            >
                              Đã thuê
                            </button>
                          </>
                        )}
                        {listing.status !== 'removed' && (
                          <button
                            type="button"
                            onClick={() => handleRemove(listing.id)}
                            className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                          >
                            Gỡ tin
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Phân trang */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-surface-border flex items-center justify-between bg-surface-muted/30">
                    <p className="text-xs text-text-muted">
                      Hiển thị trang <strong>{page}</strong> / <strong>{totalPages}</strong> (tổng số {total} tin)
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={page <= 1 || loading}
                        onClick={() => load(statusFilter, page - 1)}
                        className="px-3 py-1 bg-white border border-surface-border text-text-primary text-xs font-semibold rounded-lg disabled:opacity-40 hover:bg-surface-muted"
                      >
                        ← Trang trước
                      </button>
                      <button
                        type="button"
                        disabled={page >= totalPages || loading}
                        onClick={() => load(statusFilter, page + 1)}
                        className="px-3 py-1 bg-white border border-surface-border text-text-primary text-xs font-semibold rounded-lg disabled:opacity-40 hover:bg-surface-muted"
                      >
                        Trang sau →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
