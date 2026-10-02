'use client';

import { useState } from 'react';
import { ContactBrokerModal } from '@/components/ContactBrokerModal';
import { SITE_CONFIG } from '@/lib/constants';

interface MobileStickyContactBarProps {
  listingId: string;
  listingTitle: string;
  priceFormatted: string;
  depositFormatted?: string;
}

export function MobileStickyContactBar({
  listingId,
  listingTitle,
  priceFormatted,
  depositFormatted,
}: MobileStickyContactBarProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const activePhone = SITE_CONFIG.hotline;

  return (
    <>
      {/* Sticky Bottom Bar chỉ hiển thị trên màn hình nhỏ hơn 768px (Mobile CTA) */}
      <div className="fixed bottom-0 inset-x-0 z-40 block md:hidden bg-white/95 backdrop-blur-md border-t border-surface-border px-4 py-2.5 shadow-elevated">
        <div className="flex items-center justify-between gap-3">
          {/* Cụm giá tiền bên trái */}
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-1">
              <span className="text-base font-bold text-brand truncate">{priceFormatted}</span>
              <span className="text-[11px] text-text-muted font-normal">/tháng</span>
            </div>
            {depositFormatted && (
              <p className="text-[10px] text-text-muted truncate">Cọc: {depositFormatted}</p>
            )}
          </div>

          {/* Cụm nút CTA bên phải: Gọi ngay + Đặt lịch xem */}
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`tel:${activePhone.replace(/\s+/g, '')}`}
              aria-label={`Gọi điện tư vấn dẫn xem phòng theo hotline ${activePhone}`}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition-all"
            >
              <span>📞</span>
              <span>Gọi ngay</span>
            </a>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              aria-label="Mở hộp thoại đề xuất lịch xem phòng"
              className="flex items-center justify-center gap-1.5 rounded-xl bg-brand px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-600 active:scale-95 transition-all"
            >
              <span>💬</span>
              <span>Đặt lịch xem</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal gửi liên hệ / đề xuất lịch xem phòng */}
      <ContactBrokerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        listingId={listingId}
        listingTitle={listingTitle}
      />
    </>
  );
}

