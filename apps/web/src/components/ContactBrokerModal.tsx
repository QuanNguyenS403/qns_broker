'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAccessToken } from '@/lib/auth-client';
import { SITE_CONFIG } from '@/lib/constants';

interface ContactBrokerModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingId?: string | number;
  listingTitle?: string;
}

export function ContactBrokerModal({
  isOpen,
  onClose,
  listingId,
  listingTitle,
}: ContactBrokerModalProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('chieu');
  const [note, setNote] = useState('');
  // GAP-10: Tuyệt đối không chọn sẵn consent (mặc định false)
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCloseModal = useCallback(() => {
    setErrorMessage(null);
    setSubmitted(false);
    onClose();
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    const rawId = listingId ? String(listingId) : '';
    if (!rawId || rawId.startsWith('demo-')) {
      setErrorMessage(
        'Đây là dữ liệu mẫu thử nghiệm hoặc tin chưa kích hoạt, không thể gửi yêu cầu thật',
      );
      return;
    }

    const cleanPhone = phone.replace(/\s+/g, '');
    const phoneRegex = /^(03|05|07|08|09)\d{8}$/;
    if (!phoneRegex.test(cleanPhone)) {
      setErrorMessage(
        'Số điện thoại không hợp lệ, vui lòng nhập số di động 10 chữ số',
      );
      return;
    }

    if (!consent) {
      setErrorMessage(
        'Bạn cần đồng ý để người tư vấn và dẫn xem liên hệ hỗ trợ bạn',
      );
      return;
    }

    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const token = getAccessToken();

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const timeSlotText =
        preferredTime === 'sang'
          ? 'Buổi sáng (08:30 - 11:30)'
          : preferredTime === 'chieu'
            ? 'Buổi chiều (13:30 - 17:30)'
            : 'Buổi tối (18:00 - 20:00)';

      const fullMessage = [
        preferredDate ? `Ngày mong muốn xem: ${preferredDate}` : null,
        `Khung giờ: ${timeSlotText}`,
        note.trim() ? `Ghi chú thêm: ${note.trim()}` : null,
      ]
        .filter(Boolean)
        .join(' | ');

      const res = await fetch(`${apiUrl}/leads`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          listingId: rawId,
          fullName: fullName.trim(),
          phone: cleanPhone,
          message: fullMessage,
          channel: 'web_form',
          consent: true,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errorDetail =
          Array.isArray(data.message)
            ? data.message.join(', ')
            : data.message || `Lỗi máy chủ (${res.status}), vui lòng thử lại sau`;
        throw new Error(errorDetail);
      }

      setSubmitted(true);
      setSuccessMessage(
        data.message || `Đã đặt lịch xem phòng thành công, ${SITE_CONFIG.agentName} sẽ sớm liên hệ xác nhận với bạn`,
      );

      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 3500);
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Không thể kết nối đến máy chủ, vui lòng kiểm tra kết nối mạng và thử lại',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        handleCloseModal();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleCloseModal]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleCloseModal();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs animate-fade-in"
    >
      <div className="relative w-full max-w-[440px] sm:max-w-[460px] rounded-2xl bg-white shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col border border-slate-100">
        {/* Header tinh gọn, hiện đại */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 bg-slate-50/60">
          <div className="min-w-0 pr-3">
            <h2 id="contact-modal-title" className="text-base sm:text-[17px] font-bold text-slate-900 leading-tight">
              Đặt lịch xem phòng
            </h2>
            <p className="text-[11.5px] text-brand mt-0.5 font-semibold flex items-center gap-1.5">
              <span>{SITE_CONFIG.agentName}</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600 font-normal">{SITE_CONFIG.agentRole}</span>
            </p>
            {listingTitle && (
              <p className="text-[11px] text-slate-400 truncate max-w-[300px] sm:max-w-[340px] mt-0.5">{listingTitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleCloseModal}
            aria-label="Đóng hộp thoại đặt lịch xem phòng"
            className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors text-sm"
          >
            ✕
          </button>
        </div>

        {/* Form Body kích thước hài hòa */}
        {submitted ? (
          <div className="p-6 text-center space-y-2.5">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-900">Đã gửi yêu cầu đặt lịch thành công</h3>
            <p className="text-xs text-slate-600 leading-relaxed px-4">{successMessage}</p>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3 overflow-y-auto">
            {errorMessage && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700 leading-relaxed">
                {errorMessage}
              </div>
            )}

            {/* Họ & Tên */}
            <div>
              <label className="block text-[11.5px] font-semibold text-slate-700 mb-1">
                Họ và tên của bạn <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Nguyễn Văn A"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-3.5 py-2 text-xs sm:text-[13px] text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/10 transition-all"
              />
            </div>

            {/* Số điện thoại */}
            <div>
              <label className="block text-[11.5px] font-semibold text-slate-700 mb-1">
                Số điện thoại liên hệ <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="Ví dụ: 0987 654 321"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-3.5 py-2 text-xs sm:text-[13px] text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/10 transition-all"
              />
            </div>

            {/* Ngày & Giờ mong muốn xem phòng */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11.5px] font-semibold text-slate-700 mb-1">
                  Ngày xem phòng
                </label>
                <input
                  type="date"
                  value={preferredDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-3 py-1.5 text-xs sm:text-[13px] text-slate-800 focus:bg-white focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-[11.5px] font-semibold text-slate-700 mb-1">
                  Khung giờ thuận tiện
                </label>
                <select
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-3 py-1.5 text-xs sm:text-[13px] text-slate-800 focus:bg-white focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/10 transition-all"
                >
                  <option value="sang">Sáng (08:30 - 11:30)</option>
                  <option value="chieu">Chiều (13:30 - 17:30)</option>
                  <option value="toi">Tối (18:00 - 20:00)</option>
                </select>
              </div>
            </div>

            {/* Ghi chú thêm */}
            <div>
              <label className="block text-[11.5px] font-semibold text-slate-700 mb-1">
                Ghi chú hoặc yêu cầu thêm (không bắt buộc)
              </label>
              <textarea
                rows={2}
                placeholder="Ví dụ: Cần dọn vào đầu tháng tới, ưu tiên phòng có chỗ để xe máy"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/30 p-2.5 text-xs sm:text-[13px] text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/10 transition-all"
              />
            </div>

            {/* Checkbox Consent - Mặc định không chọn sẵn (GAP-10) */}
            <div className="flex items-start gap-2 pt-0.5">
              <input
                type="checkbox"
                id="lead-consent"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-slate-300 text-brand focus:ring-brand cursor-pointer"
              />
              <label htmlFor="lead-consent" className="text-[11px] sm:text-[11.5px] text-slate-600 leading-snug cursor-pointer select-none">
                Tôi đồng ý cung cấp thông tin liên hệ để người tư vấn và trực tiếp dẫn xem ({SITE_CONFIG.agentName}) liên hệ xác nhận lịch
              </label>
            </div>

            {/* Nút hành động */}
            <div className="flex items-center gap-2.5 pt-1.5">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-xl bg-brand px-5 py-2.5 text-xs sm:text-[13px] font-bold text-white shadow-sm hover:bg-brand-600 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading && (
                  <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                )}
                <span>{loading ? 'Đang gửi' : 'Đặt lịch xem phòng'}</span>
              </button>

              <button
                type="button"
                onClick={handleCloseModal}
                disabled={loading}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-[13px] font-semibold text-slate-700 hover:bg-slate-50 active:scale-[0.98] transition-all cursor-pointer"
              >
                Bỏ qua
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
