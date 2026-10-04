import React from 'react';

const SECURITY_TEXT =
  'KHÔNG bao giờ yêu cầu quý khách truy cập liên kết lạ, cung cấp mã OTP ngân hàng hoặc chuyển tiền vào tài khoản lạ';

const REPEATED_ITEMS = [0, 1, 2, 3];

export function SecurityAnnouncementBar() {
  return (
    <div
      role="region"
      aria-label="Cảnh báo an toàn QNS BROKER"
      className="relative w-full overflow-hidden bg-[#282142] border-t border-black/15 shadow-inner select-none pointer-events-none"
    >
      <div className="animate-marquee-scroll py-1.5 sm:py-2">
        {/* Track 1 */}
        <div className="flex shrink-0 items-center">
          {REPEATED_ITEMS.map((item) => (
            <div key={`track-1-${item}`} className="flex items-center mx-6 sm:mx-10 shrink-0 text-xs sm:text-[13px] font-medium tracking-wide">
              <span className="font-bold text-white tracking-wider">QNS BROKER</span>
              <span className="ml-1.5 text-slate-200">{SECURITY_TEXT}</span>
              <span className="ml-6 sm:ml-10 text-white/30 text-xs select-none">•</span>
            </div>
          ))}
        </div>

        {/* Track 2 — bản sao liền mạch cho vòng lặp vô tận */}
        <div className="flex shrink-0 items-center" aria-hidden="true">
          {REPEATED_ITEMS.map((item) => (
            <div key={`track-2-${item}`} className="flex items-center mx-6 sm:mx-10 shrink-0 text-xs sm:text-[13px] font-medium tracking-wide">
              <span className="font-bold text-white tracking-wider">QNS BROKER</span>
              <span className="ml-1.5 text-slate-200">{SECURITY_TEXT}</span>
              <span className="ml-6 sm:ml-10 text-white/30 text-xs select-none">•</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
