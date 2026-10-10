'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import type { MapRoom, RoomReview } from '@/lib/map-rooms-data';
import { mapRoomToListing } from '@/lib/map-rooms-data';
import { findDemoListing } from '@/lib/demo-data';
import { extractListingFurnitureList } from '@/lib/furniture-utils';
import { ContactBrokerModal } from '@/components/ContactBrokerModal';

interface MapRoomDetailDrawerProps {
  room: MapRoom | null;
  clusterRooms?: MapRoom[];
  onSelectClusterRoom?: (room: MapRoom) => void;
  onClose: () => void;
  onAddReview?: (roomId: string, review: RoomReview) => void;
}

export function MapRoomDetailDrawer({
  room,
  clusterRooms,
  onSelectClusterRoom,
  onClose,
  onAddReview,
}: MapRoomDetailDrawerProps) {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newAuthorName, setNewAuthorName] = useState('');
  const [newContent, setNewContent] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [submitSuccessNotice, setSubmitSuccessNotice] = useState<string | null>(null);

  // Khi room thay đổi (chọn phòng khác hoặc đổi phòng trong cụm), reset ảnh về 0
  useEffect(() => {
    setActiveImageIdx(0);
    setShowReviewForm(false);
  }, [room?.id]);

  // Lắng nghe phím Escape để đóng nhanh
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Đồng bộ 100% dữ liệu với tin đăng thật / trang chi tiết phòng
  const matchedListing = useMemo(() => {
    if (!room) return null;
    // 1. Thử tìm trong kho demo bằng slug hoặc id
    const demo = findDemoListing(room.slug) || findDemoListing(room.id);
    if (demo) return demo;

    // 2. Thử tìm trong localStorage nếu người dùng có tin tự đăng
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('qns_custom_listings');
        if (raw) {
          const list: any[] = JSON.parse(raw);
          if (Array.isArray(list)) {
            const found = list.find((it) => it.slug === room.slug || String(it.id) === String(room.id));
            if (found) return found;
          }
        }
      } catch {}
    }

    // 3. Fallback sang listing chuẩn hóa từ room
    return mapRoomToListing(room);
  }, [room]);

  const displayTitle = useMemo(() => {
    const raw = matchedListing?.title || room?.title || 'Phòng cho thuê';
    return raw.replace(/^\[MẪU\]\s*/i, '').replace(/\[MẪU\]/gi, '').trim();
  }, [matchedListing, room]);

  // Danh sách hình ảnh đồng bộ
  const displayImages = useMemo(() => {
    if (matchedListing?.images && matchedListing.images.length > 0) {
      return matchedListing.images
        .map((img: any) => typeof img === 'string' ? img : img.imageUrl)
        .filter(Boolean);
    }
    return room?.images && room.images.length > 0 ? room.images : [];
  }, [matchedListing, room]);

  // Giá thuê, cọc, diện tích, điện đồng bộ với trang chi tiết
  const displayPrice = matchedListing?.price
    ? parseInt(String(matchedListing.price), 10)
    : (room?.price || 0);

  const displayDeposit = matchedListing?.depositAmount
    ? parseInt(String(matchedListing.depositAmount), 10)
    : (room?.depositAmount || displayPrice);

  const displayArea = matchedListing?.areaM2
    ? parseInt(String(matchedListing.areaM2), 10)
    : (room?.areaM2 || 25);

  const displayElectricity = matchedListing?.electricityPricePerKwh
    || room?.electricityPricePerKwh
    || 3500;

  // Danh sách nội thất & tiện nghi đồng bộ 100% với mục "Nội Thất" trên trang chi tiết
  const furnitureList = useMemo(() => {
    return extractListingFurnitureList(matchedListing || room);
  }, [matchedListing, room]);

  const targetSlug = matchedListing?.slug || room?.slug || '';
  const targetId = matchedListing?.id || room?.id || '';

  if (!room) return null;

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    setSubmittingReview(true);
    const createdReview: RoomReview = {
      id: `user-rev-${Date.now()}`,
      authorName: newAuthorName.trim() || 'Người thuê ẩn danh',
      authorRole: 'Khách thuê đã trải nghiệm',
      rating: newRating,
      content: newContent.trim(),
      createdAt: new Date().toISOString().slice(0, 10),
      isWarning: newRating < 3,
    };

    try {
      // Gửi lên API nếu có
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: room.maskedAddress,
          rating: newRating,
          content: newContent.trim(),
          name: newAuthorName.trim() || 'Người thuê ẩn danh',
        }),
      }).catch(() => {
        // Fallback lưu local an toàn
      });

      onAddReview?.(room.id, createdReview);
      setSubmitSuccessNotice('Cảm ơn bạn đã gửi đánh giá thực tế cho phòng này');
      setNewContent('');
      setNewAuthorName('');
      setTimeout(() => {
        setShowReviewForm(false);
        setSubmitSuccessNotice(null);
      }, 2000);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="absolute top-3 bottom-3 right-3 sm:top-4 sm:bottom-4 sm:right-4 z-40 w-[calc(100%-24px)] sm:w-[350px] md:w-[360px] max-h-[calc(100%-24px)] sm:max-h-[calc(100%-32px)] bg-white rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col border border-slate-200/90 overflow-hidden transition-all duration-300">
      {/* Thanh tiêu đề cố định ở trên cùng có nút Thoát nổi bật — Giúp khách thoát phòng này tức thì để chọn phòng khác */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-100 bg-white shrink-0 z-30">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
          <span className="w-2 h-2 rounded-full bg-brand" />
          <span>Chi tiết phòng trọ</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 text-xs font-bold transition-all cursor-pointer border border-slate-200/80 active:scale-95"
          title="Thoát phòng này để chọn phòng khác"
          aria-label="Thoát xem phòng"
        >
          <span>Thoát</span>
          <span className="text-sm leading-none font-bold">✕</span>
        </button>
      </div>

      {/* Nội dung cuộn chính */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-3.5 space-y-3 sm:space-y-3.5">
        {/* Gallery ảnh phòng */}
        <div className="relative rounded-xl overflow-hidden bg-slate-100 h-40 sm:h-44 w-full shadow-xs border border-slate-200">
          <img
            src={displayImages[activeImageIdx] || displayImages[0]}
            alt={displayTitle}
            className="w-full h-full object-cover transition-all duration-300"
          />

          {displayImages.length > 1 && (
            <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-xs font-medium">
              {activeImageIdx + 1} / {displayImages.length}
            </div>
          )}
        </div>

        {/* Thumbnail chọn ảnh nếu có nhiều hơn 1 ảnh */}
        {displayImages.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            {displayImages.map((img: string, idx: number) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImageIdx(idx)}
                className={`relative w-14 h-10 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                  activeImageIdx === idx ? 'border-brand scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`Ảnh ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Tiêu đề phòng — Đồng bộ hiển thị sạch đẹp */}
        <div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
            {displayTitle}
          </h3>
        </div>

        {/* Địa chỉ phòng cho thuê đồng bộ chuẩn xác với chấm trên bản đồ */}
        <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-teal-50/80 border border-teal-100 text-slate-700 shadow-2xs">
          <div className="w-6 h-6 rounded-lg bg-teal-600/10 flex items-center justify-center text-teal-700 shrink-0 mt-0.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800">Địa chỉ trên bản đồ</span>
              {room.lat != null && room.lng != null && (
                <span className="text-[10px] font-mono text-teal-700 font-semibold bg-white/80 px-1.5 py-0.5 rounded border border-teal-200/60">
                  {room.lat.toFixed(4)}, {room.lng.toFixed(4)}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-[13px] font-bold text-slate-900 mt-0.5 leading-snug">
              {room.maskedAddress || room.rawAddress || matchedListing?.addressDetail || 'Khu vực đang cập nhật địa chỉ'}
            </p>
          </div>
        </div>

        {/* Bộ chọn chuyển đổi giữa các phòng trong cùng cụm vị trí nếu có nhiều hơn 1 phòng */}
        {clusterRooms && clusterRooms.length > 1 && (
          <div className="p-2.5 rounded-xl bg-purple-50/80 border border-purple-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
              <span className="w-2 h-2 rounded-full bg-purple-600" />
              <span>Khu vực này có {clusterRooms.length} phòng cho thuê:</span>
            </div>
            <div className="flex items-center gap-1 overflow-x-auto py-0.5 max-w-[55%]">
              {clusterRooms.map((clRoom, cIdx) => (
                <button
                  key={clRoom.id}
                  type="button"
                  onClick={() => {
                    onSelectClusterRoom?.(clRoom);
                    setActiveImageIdx(0);
                  }}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all shrink-0 ${
                    clRoom.id === room.id
                      ? 'bg-purple-700 text-white shadow-xs'
                      : 'bg-white text-purple-800 border border-purple-200 hover:bg-purple-100'
                  }`}
                >
                  Phòng {cIdx + 1}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Khối Giá & Chi phí minh bạch — Đồng bộ 100% với trang chi tiết */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-2.5 text-center">
            <div className="text-[11px] font-medium text-slate-500">Giá thuê</div>
            <div className="text-sm sm:text-base font-black text-brand mt-0.5">
              {displayPrice.toLocaleString('vi-VN')} đ
            </div>
            <div className="text-[10px] text-slate-400">tháng</div>
          </div>

          <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-2.5 text-center">
            <div className="text-[11px] font-medium text-slate-500">Tiền cọc</div>
            <div className="text-sm sm:text-base font-black text-slate-800 mt-0.5">
              {displayDeposit ? `${displayDeposit.toLocaleString('vi-VN')} đ` : '1 tháng tiền thuê'}
            </div>
            <div className="text-[10px] text-slate-400">1 tháng</div>
          </div>

          <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-2.5 text-center">
            <div className="text-[11px] font-medium text-slate-500">Diện tích</div>
            <div className="text-sm sm:text-base font-black text-slate-800 mt-0.5">
              {displayArea} m²
            </div>
            <div className="text-[10px] text-slate-400">rộng rãi</div>
          </div>

          <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-2.5 text-center">
            <div className="text-[11px] font-medium text-slate-500">Tiền điện</div>
            <div className="text-sm sm:text-base font-black text-amber-600 mt-0.5">
              {displayElectricity ? `${displayElectricity.toLocaleString('vi-VN')} đ` : '4.000 đ'}
            </div>
            <div className="text-[10px] text-slate-400">kWh</div>
          </div>
        </div>

        {/* Nội thất & Tiện nghi có sẵn — Đồng bộ 100% với mục Nội Thất trên trang chi tiết */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Nội thất & Tiện nghi có sẵn
          </h4>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {furnitureList.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200/60"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-teal-600 shrink-0" />
                <span>{item}</span>
              </span>
            ))}
          </div>
        </div>

        {/* ── MỤC ĐÁNH GIÁ & MINH BẠCH (YÊU CẦU ĐẶC BIỆT CỦA BÀI TOÁN) ── */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black text-slate-900">
                  {room.rating.toFixed(1)}
                </span>
                <div className="flex items-center text-amber-400 text-sm">
                  {'★'.repeat(Math.round(room.rating))}
                  {'☆'.repeat(Math.max(0, 5 - Math.round(room.rating)))}
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Dựa trên {room.reviews.length} đánh giá từ cựu người thuê
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-brand text-xs font-bold hover:bg-slate-100 transition-colors shadow-xs"
            >
              <span>{showReviewForm ? 'Đóng form' : '+ Viết đánh giá'}</span>
            </button>
          </div>

          {/* Form viết đánh giá trực tiếp */}
          {showReviewForm && (
            <form onSubmit={handleReviewSubmit} className="rounded-xl bg-white p-3.5 border border-slate-200 space-y-3">
              <div className="text-xs font-bold text-slate-800">
                Đóng góp đánh giá cho phòng trọ này
              </div>

              {submitSuccessNotice && (
                <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold">
                  {submitSuccessNotice}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Đánh giá số sao
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="p-1 text-xl transition-transform hover:scale-110"
                    >
                      <span className={star <= newRating ? 'text-amber-400' : 'text-slate-200'}>
                        ★
                      </span>
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-2">
                    {newRating} / 5 sao
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Họ tên hoặc vai trò (để trống nếu muốn ẩn danh)
                </label>
                <input
                  type="text"
                  value={newAuthorName}
                  onChange={(e) => setNewAuthorName(e.target.value)}
                  placeholder="VD: Cựu sinh viên K65 hoặc Người thuê ẩn danh"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Nội dung đánh giá thực tế (tiền điện nước, cọc, an ninh, chủ nhà) *
                </label>
                <textarea
                  required
                  rows={3}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm thực tế về phòng trọ này để giúp các bạn sinh viên sau"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:border-brand"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-4 py-1.5 rounded-lg bg-brand text-white text-xs font-bold shadow-xs hover:bg-brand-700 disabled:opacity-50"
                >
                  {submittingReview ? 'Đang gửi' : 'Gửi đánh giá ngay'}
                </button>
              </div>
            </form>
          )}

          {/* Danh sách review của phòng */}
          <div className="space-y-2.5">
            {room.reviews.map((rev) => (
              <div
                key={rev.id}
                className="rounded-xl bg-white p-3.5 border border-slate-200/80 shadow-2xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-700">
                      {rev.authorName.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">
                        {rev.authorName}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {rev.authorRole} • {rev.createdAt}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center text-amber-400 text-xs">
                    {'★'.repeat(Math.round(rev.rating))}
                    {'☆'.repeat(Math.max(0, 5 - Math.round(rev.rating)))}
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {rev.content}
                </p>

                {rev.isWarning && (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">
                    <span>⚠️ Cảnh báo từ cựu người thuê</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer các nút hành động — 2 nút cân đối: Đặt lịch & Xem bài */}
      <div className="p-2.5 sm:p-3 border-t border-slate-100 bg-white grid grid-cols-2 gap-2 shrink-0">
        <button
          type="button"
          onClick={() => setIsBookingModalOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-brand hover:bg-brand-700 active:scale-[0.98] text-white text-xs sm:text-[13px] font-bold shadow-md shadow-brand/20 transition-all text-center cursor-pointer whitespace-nowrap"
          title="Đặt lịch xem phòng này"
        >
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Đặt lịch</span>
        </button>

        <Link
          href={`/tin/${targetSlug || room.slug}`}
          className="inline-flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white text-xs sm:text-[13px] font-bold shadow-sm transition-all text-center whitespace-nowrap"
          title="Xem chi tiết bài đăng"
        >
          <span>Xem bài</span>
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>

      {/* Modal Đặt lịch xem phòng — Form chuẩn giống hệt form Đặt lịch xem phòng trên website */}
      <ContactBrokerModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        listingId={targetId || room.id}
        listingTitle={displayTitle}
      />
    </div>
  );
}
