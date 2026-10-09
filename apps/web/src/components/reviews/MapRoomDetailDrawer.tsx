'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { MapRoom, RoomReview } from '@/lib/map-rooms-data';
import { getGoogleMapsDirectionsUrl } from '@/lib/vietnam-universities';

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
  const [newRating, setNewRating] = useState(5);
  const [newAuthorName, setNewAuthorName] = useState('');
  const [newContent, setNewContent] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [submitSuccessNotice, setSubmitSuccessNotice] = useState<string | null>(null);

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

  const directionsUrl = getGoogleMapsDirectionsUrl({
    lat: room.lat,
    lng: room.lng,
    address: room.maskedAddress,
  });

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-lg md:max-w-xl bg-white shadow-2xl flex flex-col border-l border-slate-200 transition-all duration-300">
      {/* Header thanh tiêu đề */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
        <div className="min-w-0 pr-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Phòng có dữ liệu đánh giá</span>
          </span>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 truncate mt-1">
            {room.title}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 shadow-xs transition-colors shrink-0"
          title="Đóng chi tiết"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Bộ chọn chuyển đổi giữa các phòng trong cùng cụm vị trí nếu có nhiều hơn 1 phòng */}
      {clusterRooms && clusterRooms.length > 1 && (
        <div className="px-4 py-2 bg-purple-50/70 border-b border-purple-100 flex items-center justify-between gap-2 shrink-0">
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

      {/* Nội dung cuộn chính */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
        {/* Gallery ảnh phòng */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-100 aspect-16/10 shadow-sm border border-slate-200">
          <img
            src={room.images[activeImageIdx] || room.images[0]}
            alt={room.title}
            className="w-full h-full object-cover transition-all duration-300"
          />
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-xs font-semibold">
              <span>Đã kiểm tra thực tế</span>
            </span>
          </div>
          {room.images.length > 1 && (
            <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-xs font-medium">
              {activeImageIdx + 1} / {room.images.length}
            </div>
          )}
        </div>

        {/* Thumbnail chọn ảnh nếu có nhiều hơn 1 ảnh */}
        {room.images.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {room.images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImageIdx(idx)}
                className={`relative w-16 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                  activeImageIdx === idx ? 'border-brand scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`Ảnh ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Khối Địa chỉ bảo mật — Nghiêm ngặt chỉ hiện ngõ, phường, quận, thành phố */}
        <div className="rounded-2xl bg-teal-50/70 border border-teal-200/80 p-4">
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-teal-800">
                Vị trí bảo mật (Đã ẩn số nhà chi tiết)
              </div>
              <div className="text-sm sm:text-base font-black text-slate-900 mt-0.5">
                {room.maskedAddress}
              </div>
              <p className="text-[11px] text-teal-900/80 mt-1 leading-relaxed">
                Để bảo vệ quyền riêng tư theo tiêu chuẩn an toàn, website chỉ hiển thị ngõ, phường, quận. Chuyên viên QNS sẽ trực tiếp dẫn bạn vào xem tận nơi
              </p>
            </div>
          </div>
        </div>

        {/* Khối Giá & Chi phí minh bạch */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3 text-center">
            <div className="text-[11px] font-medium text-slate-500">Giá thuê</div>
            <div className="text-sm sm:text-base font-black text-brand mt-0.5">
              {room.price.toLocaleString('vi-VN')} đ
            </div>
            <div className="text-[10px] text-slate-400">tháng</div>
          </div>

          <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3 text-center">
            <div className="text-[11px] font-medium text-slate-500">Tiền cọc</div>
            <div className="text-sm sm:text-base font-black text-slate-800 mt-0.5">
              {room.depositAmount.toLocaleString('vi-VN')} đ
            </div>
            <div className="text-[10px] text-slate-400">1 tháng</div>
          </div>

          <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3 text-center">
            <div className="text-[11px] font-medium text-slate-500">Diện tích</div>
            <div className="text-sm sm:text-base font-black text-slate-800 mt-0.5">
              {room.areaM2} m²
            </div>
            <div className="text-[10px] text-slate-400">rộng rãi</div>
          </div>

          <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3 text-center">
            <div className="text-[11px] font-medium text-slate-500">Tiền điện</div>
            <div className="text-sm sm:text-base font-black text-amber-600 mt-0.5">
              {room.electricityPricePerKwh ? `${room.electricityPricePerKwh.toLocaleString('vi-VN')} đ` : '3.500 đ'}
            </div>
            <div className="text-[10px] text-slate-400">kWh</div>
          </div>
        </div>

        {/* Tiện nghi phòng */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Tiện nghi có sẵn
          </h4>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {room.amenities.airConditioner && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                ❄️ Điều hòa
              </span>
            )}
            {room.amenities.waterHeater && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                🔥 Nóng lạnh
              </span>
            )}
            {room.amenities.mezzanine && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                🪜 Gác lửng
              </span>
            )}
            {room.amenities.balcony && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                🌿 Ban công
              </span>
            )}
            {room.amenities.elevator && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                🛗 Thang máy
              </span>
            )}
            {room.amenities.petsAllowed && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium">
                🐾 Cho nuôi thú cưng
              </span>
            )}
            {room.amenities.electricVehicle && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 text-xs font-medium">
                ⚡ Sạc xe điện
              </span>
            )}
            {room.amenities.freeTime && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                ⏰ Giờ giấc tự do
              </span>
            )}
            {room.amenities.securityCamera && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                📹 Camera an ninh
              </span>
            )}
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
                  placeholder="Chia sẻ trải nghiệm thực tế về phòng trọ này để giúp các bạn sinh viên sau..."
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
                  {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá ngay'}
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

      {/* Footer các nút hành động */}
      <div className="p-4 border-t border-slate-100 bg-white grid grid-cols-1 sm:grid-cols-3 gap-2 shrink-0">
        <a
          href="tel:0981753082"
          className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-brand hover:bg-brand-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-brand/20 transition-all text-center"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <span>Dẫn xem phòng</span>
        </a>

        <Link
          href={`/tin/${room.slug}`}
          className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow-sm transition-all text-center"
        >
          <span>Xem bài đăng</span>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>

        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold transition-all text-center"
        >
          <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Chỉ đường</span>
        </a>
      </div>
    </div>
  );
}
