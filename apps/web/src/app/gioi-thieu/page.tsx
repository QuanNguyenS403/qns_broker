import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_CONFIG } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Giới thiệu Chuyên viên & Dịch vụ Môi giới — QNS BROKER',
  description:
    'Giới thiệu mô hình môi giới cho thuê chuyên biệt có người thật Đức Quân làm đầu mối duy nhất, dẫn xem phòng tận nơi 0 đồng cho khách thuê, thu 40% phí từ chủ nhà khi thành công',
};

export default function GioiThieuPage() {
  return (
    <div className="min-h-screen bg-surface-muted py-10">
      <div className="container-max max-w-4xl">
        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-2 text-xs text-text-muted">
          <Link href="/" className="hover:text-brand transition-colors">
            Trang chủ
          </Link>
          <span>›</span>
          <span className="text-text-secondary font-medium">Giới thiệu</span>
        </nav>

        <div className="rounded-3xl border border-surface-border bg-white p-8 md:p-12 shadow-card space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-brand/10 px-3.5 py-1 text-xs font-semibold text-brand mb-4">
              🌿 Về QNS BROKER
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-text-primary tracking-tight mb-3">
              Dịch vụ Môi giới Cho thuê Chuyên biệt — Người thật, Việc thật
            </h1>
            <p className="text-sm text-text-secondary leading-relaxed border-b border-surface-border pb-6">
              QNS BROKER là nền tảng môi giới cho thuê bất động sản (phòng trọ sinh viên, studio, căn hộ mini, căn hộ chung cư và mặt bằng kinh doanh) hoạt động theo mô hình <strong>chuyên viên thực địa làm đầu mối duy nhất</strong>. Chúng tôi loại bỏ hoàn toàn các rào cản thông tin ảo, phí ẩn và phiền hà cho cả người thuê lẫn chủ nhà
            </p>
          </div>

          {/* Hồ sơ chuyên viên phụ trách điều phối */}
          <div className="rounded-2xl border-2 border-teal-200/80 bg-gradient-to-br from-teal-50/70 via-white to-emerald-50/40 p-6 md:p-8 space-y-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand text-2xl font-bold text-white shadow-md ring-4 ring-brand/15">
                  Q
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg md:text-xl font-black text-slate-900">
                      Nguyễn Đức Quân
                    </h2>
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
                      Chuyên viên điều phối độc quyền
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-brand mt-0.5">
                    Người tư vấn, khảo sát thực tế và trực tiếp dẫn xem phòng
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Đại diện pháp lý & dịch vụ của QNS BROKER
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:items-end gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                <a
                  href={`tel:${SITE_CONFIG.hotline.replace(/\s+/g, '')}`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-all active:scale-[0.98]"
                >
                  <span>📞 Hotline:</span>
                  <span className="font-mono text-sm">{SITE_CONFIG.hotline}</span>
                </a>
                <span className="text-[11px] text-slate-500">
                  Tư vấn & tiếp nhận lịch hẹn: 24/7
                </span>
              </div>
            </div>

            <div className="rounded-xl bg-white/90 border border-teal-100 p-4 text-xs text-slate-700 leading-relaxed space-y-2">
              <p className="font-bold text-slate-900">
                Vì sao tất cả tin đăng đều hiển thị cùng một đầu mối là Đức Quân?
              </p>
              <p>
                Trên các sàn rao vặt thông thường, bạn thường gặp tình trạng: gọi 10 tin thì 9 tin là môi giới ảo đăng mồi giá rẻ, đến nơi dẫn đi phòng khác, hoặc phòng đã cho thuê từ lâu nhưng tin vẫn trôi nổi.
              </p>
              <p>
                Tại QNS BROKER, chuyên viên Đức Quân là người <strong>trực tiếp ký thỏa thuận dịch vụ với từng chủ nhà</strong>, đến tận nơi khảo sát, chụp ảnh, kiểm tra tình trạng còn trống và trực tiếp hẹn giờ dẫn bạn đến xem phòng. Nhờ đó, thông tin luôn tươi mới, không sợ bị lừa cọc hay mất thời gian đi xem phòng ảo
              </p>
            </div>
          </div>

          {/* 3 Cam kết thép */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-text-primary">Cam kết vận hành minh bạch</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-surface-border bg-slate-50/60 p-5 space-y-2">
                <span className="text-2xl">🚫💰</span>
                <h3 className="font-bold text-slate-900 text-sm">Không thu phí người thuê</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Khách thuê 0 đồng phí dịch vụ, được tư vấn nhu cầu và dẫn xem phòng thực tế hoàn toàn miễn phí
                </p>
              </div>

              <div className="rounded-2xl border border-surface-border bg-slate-50/60 p-5 space-y-2">
                <span className="text-2xl">⚡💧</span>
                <h3 className="font-bold text-slate-900 text-sm">Minh bạch điện nước</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Công khai đơn giá điện kWh, nước m³ hoặc khoán, phí xe máy, internet ngay trên tin đăng để không phát sinh chi phí bất ngờ
                </p>
              </div>

              <div className="rounded-2xl border border-surface-border bg-slate-50/60 p-5 space-y-2">
                <span className="text-2xl">🛡️📝</span>
                <h3 className="font-bold text-slate-900 text-sm">Ký hợp đồng trực tiếp</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Khách thuê ký hợp đồng trực tiếp với bên có quyền cho thuê hợp pháp, nền tảng không giữ cọc và không thu hộ tiền thuê
                </p>
              </div>
            </div>
          </div>

          {/* Thông tin pháp lý & Liên hệ trung tâm */}
          <div className="rounded-2xl border border-surface-border bg-slate-50 p-6 space-y-3">
            <h2 className="text-base font-bold text-slate-900">Thông tin liên hệ trung tâm</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
              <p className="flex items-center gap-2">
                <span className="text-brand font-bold">📞 Hotline tư vấn:</span>
                <a href={`tel:${SITE_CONFIG.hotline.replace(/\s+/g, '')}`} className="font-bold text-slate-900 hover:text-brand">
                  {SITE_CONFIG.hotline}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-brand font-bold">✉️ Email liên hệ:</span>
                <a href={`mailto:${SITE_CONFIG.supportEmail}`} className="font-semibold text-slate-900 hover:text-brand">
                  {SITE_CONFIG.supportEmail}
                </a>
              </p>
              <p className="flex items-start gap-2 sm:col-span-2">
                <span className="text-brand font-bold shrink-0">📍 Địa chỉ văn phòng:</span>
                <span>{SITE_CONFIG.address}</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-brand font-bold">🕐 Giờ làm việc:</span>
                <span>{SITE_CONFIG.workingHours}</span>
              </p>
            </div>
          </div>

          {/* CTA Hợp tác */}
          <div className="rounded-2xl border border-teal-200 bg-gradient-to-r from-teal-50 via-white to-teal-50 p-6 text-center space-y-3 shadow-xs">
            <h2 className="text-base md:text-lg font-bold text-slate-900">
              Bạn có phòng trọ, căn hộ cần tìm khách thuê nhanh?
            </h2>
            <p className="text-xs text-slate-600 max-w-lg mx-auto">
              Hợp tác dịch vụ môi giới chuyên biệt với Quân: 0 đồng phí đăng tin, bảo mật số riêng, chỉ trả 40% phí hoa hồng khi giao dịch thành công
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <Link href="/bieu-phi" className="btn-secondary text-xs px-5 py-2.5">
                Xem chính sách biểu phí chủ nhà
              </Link>
              <Link href="/dang-tin" className="btn-primary text-xs px-5 py-2.5">
                Gửi thông tin phòng cho thuê
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
