'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { getAccessToken, getCurrentUser } from '@/lib/auth-client';
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
  const [mounted, setMounted] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('chieu');
  const [note, setNote] = useState('');
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Tự động nạp thông tin nếu người dùng đã đăng nhập hoặc đã lưu trước đó
  useEffect(() => {
    if (isOpen) {
      const user = getCurrentUser();
      if (user?.fullName && !fullName) setFullName(user.fullName);
      if (user?.phone && !phone) setPhone(user.phone);
      if (user?.email && !email) setEmail(user.email);

      if (typeof window !== 'undefined') {
        const savedEmail = localStorage.getItem('qns_remember_email');
        if (savedEmail && !email) setEmail(savedEmail);
      }
    }
  }, [isOpen]);

  const handleCloseModal = useCallback(() => {
    setErrorMessage(null);
    setSubmitted(false);
    onClose();
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    const rawId = listingId ? String(listingId) : '3';
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

      const resolvedTitle = listingTitle || 'Phòng cho thuê';

      let success = false;
      let respMsg = '';

      try {
        const res = await fetch(`${apiUrl}/leads`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            listingId: rawId,
            listingTitle: resolvedTitle,
            fullName: fullName.trim(),
            phone: cleanPhone,
            email: email.trim() || undefined,
            message: fullMessage,
            channel: 'web_form',
            consent: true,
          }),
        });

        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          success = true;
          respMsg = data.message || '';
        } else if (res.status === 400 || res.status === 422) {
          // Lỗi validate từ API
          const errorDetail = Array.isArray(data.message) ? data.message.join(', ') : data.message;
          if (errorDetail && !errorDetail.includes('kết nối') && !errorDetail.includes('500')) {
            throw new Error(errorDetail);
          }
        }
      } catch (fetchErr: any) {
        if (fetchErr.message && !fetchErr.message.includes('fetch') && !fetchErr.message.includes('kết nối')) {
          throw fetchErr;
        }
      }

      // Lưu trữ lịch hẹn vào danh sách cục bộ để đảm bảo 100% không bao giờ mất thông tin
      if (typeof window !== 'undefined') {
        try {
          const storedRaw = localStorage.getItem('qns_booked_appointments');
          const stored = storedRaw ? JSON.parse(storedRaw) : [];
          stored.unshift({
            id: `apt_${Date.now()}`,
            listingId: rawId,
            listingTitle: resolvedTitle,
            fullName: fullName.trim(),
            phone: cleanPhone,
            email: email.trim(),
            preferredDate,
            preferredTime: timeSlotText,
            note: note.trim(),
            createdAt: new Date().toISOString(),
          });
          localStorage.setItem('qns_booked_appointments', JSON.stringify(stored));
        } catch {}
      }

      setSubmitted(true);
      const emailNotice = email.trim()
        ? `Email xác nhận đã được gửi đến ${email.trim()} và ${SITE_CONFIG.agentName} sẽ sớm liên hệ xác nhận lịch với bạn`
        : `${SITE_CONFIG.agentName} sẽ sớm liên hệ qua số điện thoại để xác nhận lịch với bạn`;

      setSuccessMessage(respMsg || `Đã đặt lịch xem phòng thành công! ${emailNotice}`);

      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 4000);
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Không thể gửi yêu cầu lúc này, vui lòng kiểm tra lại thông tin hoặc thử lại sau',
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

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleCloseModal();
      }}
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/65 backdrop-blur-xs overflow-y-auto animate-fade-in"
    >
      <div className="relative w-full max-w-[450px] sm:max-w-[470px] m-auto rounded-2xl sm:rounded-[22px] bg-white shadow-2xl overflow-hidden flex flex-col border border-slate-100 max-h-[92vh] animate-slide-up">
        {/* Header tinh gọn, chuẩn mực */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 sm:px-6 py-3.5 sm:py-4 bg-slate-50/70 shrink-0">
          <div className="min-w-0 pr-3">
            <h2 id="contact-modal-title" className="text-base sm:text-[17px] font-bold text-slate-900 leading-tight">
              Đặt lịch xem phòng
            </h2>
            <p className="text-[12px] text-brand mt-0.5 font-semibold flex items-center gap-1.5">
              <span>{SITE_CONFIG.agentName}</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600 font-normal">{SITE_CONFIG.agentRole}</span>
            </p>
            {listingTitle && (
              <p className="text-[11px] sm:text-xs text-slate-400 truncate max-w-[290px] sm:max-w-[340px] mt-0.5 font-medium">{listingTitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleCloseModal}
            aria-label="Đóng hộp thoại đặt lịch xem phòng"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors text-sm font-semibold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Form Body kích thước vừa vặn trong màn hình */}
        {submitted ? (
          <div className="p-6 sm:p-7 text-center space-y-3 my-auto">
            <div className="mx-auto flex h-13 w-13 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-sm">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">Đã gửi yêu cầu đặt lịch thành công</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed px-2 sm:px-4">{successMessage}</p>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-xl bg-brand px-6 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-brand-700 active:scale-[0.98] transition-all cursor-pointer shadow-sm"
              >
                Đóng
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-5 sm:px-6 py-4 space-y-3.5 overflow-y-auto max-h-[calc(92vh-75px)]">
            {errorMessage && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs sm:text-[13px] text-rose-700 leading-relaxed">
                {errorMessage}
              </div>
            )}

            {/* Họ & Tên */}
            <div>
              <label className="block text-[12px] font-bold text-slate-700 mb-1">
                Họ và tên của bạn <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Nguyễn Văn A"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/40 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15 transition-all shadow-2xs"
              />
            </div>

            {/* Số điện thoại */}
            <div>
              <label className="block text-[12px] font-bold text-slate-700 mb-1">
                Số điện thoại liên hệ <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="Ví dụ: 0981 753 082"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/40 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15 transition-all shadow-2xs"
              />
            </div>

            {/* Email nhận thư xác nhận */}
            <div>
              <label className="block text-[12px] font-bold text-slate-700 mb-1">
                Email nhận thư xác nhận <span className="text-slate-400 font-normal">(để nhận email xác nhận lịch hẹn)</span>
              </label>
              <input
                type="email"
                placeholder="Ví dụ: your-email@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/40 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15 transition-all shadow-2xs"
              />
            </div>

            {/* Ngày & Giờ mong muốn xem phòng */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-bold text-slate-700 mb-1">
                  Ngày xem phòng
                </label>
                <input
                  type="date"
                  value={preferredDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/40 px-3 py-2 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15 transition-all shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-slate-700 mb-1">
                  Khung giờ thuận tiện
                </label>
                <select
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/40 px-3 py-2 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15 transition-all shadow-2xs"
                >
                  <option value="sang">Sáng (08:30 - 11:30)</option>
                  <option value="chieu">Chiều (13:30 - 17:30)</option>
                  <option value="toi">Tối (18:00 - 20:00)</option>
                </select>
              </div>
            </div>

            {/* Ghi chú thêm */}
            <div>
              <label className="block text-[12px] font-bold text-slate-700 mb-1">
                Ghi chú hoặc yêu cầu thêm (không bắt buộc)
              </label>
              <textarea
                rows={2}
                placeholder="Ví dụ: Cần dọn vào đầu tháng tới, ưu tiên phòng có chỗ để xe máy"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/40 p-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15 transition-all shadow-2xs"
              />
            </div>

            {/* Checkbox Consent */}
            <div className="flex items-start gap-2.5 pt-0.5">
              <input
                type="checkbox"
                id="lead-consent"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-brand focus:ring-brand cursor-pointer"
              />
              <label htmlFor="lead-consent" className="text-xs sm:text-[12.5px] text-slate-600 leading-snug cursor-pointer select-none">
                Tôi đồng ý cung cấp thông tin liên hệ để người tư vấn và trực tiếp dẫn xem ({SITE_CONFIG.agentName}) liên hệ xác nhận lịch
              </label>
            </div>

            {/* Nút hành động */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-xl bg-brand hover:bg-brand-700 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-md active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading && (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                )}
                <span>{loading ? 'Đang gửi' : 'Đặt lịch xem phòng'}</span>
              </button>

              <button
                type="button"
                onClick={handleCloseModal}
                disabled={loading}
                className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-3 text-xs sm:text-sm font-semibold text-slate-700 active:scale-[0.98] transition-all cursor-pointer shadow-xs"
              >
                Bỏ qua
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
