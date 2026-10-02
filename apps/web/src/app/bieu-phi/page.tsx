import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_CONFIG } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Biểu phí & Chính sách Môi giới Cho thuê — QNS BROKER',
  description:
    'Chính sách phí môi giới 40% khi thành công, 0 đồng nếu không có khách thuê, bảo mật tuyệt đối số điện thoại chủ nhà, chuyên viên Đức Quân trực tiếp dẫn khách xem phòng',
};

export default function BieuPhiPage() {
  return (
    <div className="min-h-screen bg-surface-muted py-10">
      <div className="container-max max-w-5xl">
        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-2 text-xs text-text-muted">
          <Link href="/" className="hover:text-brand transition-colors">
            Trang chủ
          </Link>
          <span>›</span>
          <span className="text-text-secondary font-medium">Biểu phí chủ nhà</span>
        </nav>

        {/* Hero Banner */}
        <div className="rounded-3xl border border-teal-200/80 bg-gradient-to-br from-teal-500 via-brand to-teal-700 p-8 md:p-12 text-white shadow-elevated mb-8">
          <div className="max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold text-white backdrop-blur-sm">
              <span>🤝</span>
              <span>DỊCH VỤ MÔI GIỚI CHO THUÊ CHUYÊN BIỆT</span>
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight">
              Cho thuê phòng nhanh gọn, an tâm
              <br />
              Chỉ trả phí khi giao dịch thành công
            </h1>
            <p className="text-sm md:text-base text-teal-50/90 leading-relaxed">
              QNS BROKER đồng hành cùng Chủ nhà: tiếp nhận tin, khảo sát thực tế, bảo mật số riêng và trực tiếp dẫn khách xem phòng tận nơi. Không có khách chốt thuê = hoàn toàn 0 đồng
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/dang-tin"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-brand hover:bg-teal-50 transition-all shadow-md active:scale-[0.98]"
              >
                <span>+ Đăng tin cho thuê miễn phí</span>
                <span>→</span>
              </Link>
              <a
                href={`tel:${SITE_CONFIG.hotline.replace(/\s+/g, '')}`}
                className="inline-flex items-center gap-2 rounded-xl border border-white/40 bg-white/10 px-5 py-3.5 text-sm font-bold text-white hover:bg-white/20 transition-all backdrop-blur-sm"
              >
                <span>📞 Hotline: {SITE_CONFIG.hotline}</span>
              </a>
            </div>
          </div>
        </div>

        {/* 3 Cam kết cốt lõi */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="rounded-2xl border border-surface-border bg-white p-6 shadow-card hover:border-brand/40 transition-all">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-2xl text-emerald-600 mb-4 border border-emerald-100">
              🎁
            </div>
            <h2 className="text-base font-bold text-slate-900 mb-2">0 đồng đăng tin & khảo sát</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Đăng tin không giới hạn, chuyên viên hỗ trợ khảo sát và chụp ảnh phòng hoàn toàn miễn phí mà không thu bất kỳ khoản tiền cọc hay phí duy trì nào
            </p>
          </div>

          <div className="rounded-2xl border border-surface-border bg-white p-6 shadow-card hover:border-brand/40 transition-all">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-blue-600 mb-4 border border-blue-100">
              🔒
            </div>
            <h2 className="text-base font-bold text-slate-900 mb-2">Bảo mật 100% SĐT riêng</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Số điện thoại của bạn không công khai trên mạng, tránh triệt để tình trạng bị các đối tượng môi giới ảo cào số, quấy rầy hoặc spam tin nhắn rác
            </p>
          </div>

          <div className="rounded-2xl border border-surface-border bg-white p-6 shadow-card hover:border-brand/40 transition-all">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-2xl text-purple-600 mb-4 border border-purple-100">
              🎯
            </div>
            <h2 className="text-base font-bold text-slate-900 mb-2">Chỉ thu phí khi chốt thuê</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Phí môi giới 40% chỉ phát sinh khi khách đã ký hợp đồng thuê, bàn giao phòng thực tế và chủ nhà nhận tiền thuê kỳ đầu. Không thuê được = 0 đồng
            </p>
          </div>
        </div>

        {/* Khối Biểu phí chi tiết & Công thức tính V2 */}
        <div className="rounded-3xl border border-surface-border bg-white p-8 md:p-10 shadow-elevated mb-10 space-y-6">
          <div className="border-b border-surface-border pb-5">
            <span className="text-xs font-bold uppercase tracking-wider text-brand">
              CHÍNH SÁCH HOA HỒNG MINH BẠCH
            </span>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 mt-1">
              Phí dịch vụ 40% một lần duy nhất cho toàn kỳ hạn
            </h2>
            <p className="text-xs md:text-sm text-slate-600 mt-1.5 leading-relaxed">
              Mức phí được tính chuẩn xác bằng <strong>40%</strong> giá trị hợp đồng thuê trung bình một tháng theo toàn bộ thời hạn hợp đồng đã xác định
            </p>
          </div>

          {/* Bảng ví dụ minh họa */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                  <th className="py-3 px-4 font-bold rounded-l-xl">Thời hạn hợp đồng</th>
                  <th className="py-3 px-4 font-bold">Giá thuê hàng tháng</th>
                  <th className="py-3 px-4 font-bold">Giá thuê TB 1 tháng</th>
                  <th className="py-3 px-4 font-bold text-brand">Phí môi giới 40% (một lần)</th>
                  <th className="py-3 px-4 font-bold rounded-r-xl">Thời điểm thanh toán</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                <tr className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">Hợp đồng 6 tháng</td>
                  <td className="py-3.5 px-4">4.000.000 đ/tháng</td>
                  <td className="py-3.5 px-4">4.000.000 đ</td>
                  <td className="py-3.5 px-4 font-bold text-brand">1.600.000 đ</td>
                  <td className="py-3.5 px-4 text-xs">Sau khi nhận cọc & bàn giao phòng</td>
                </tr>
                <tr className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">Hợp đồng 12 tháng</td>
                  <td className="py-3.5 px-4">5.000.000 đ/tháng</td>
                  <td className="py-3.5 px-4">5.000.000 đ</td>
                  <td className="py-3.5 px-4 font-bold text-brand">2.000.000 đ</td>
                  <td className="py-3.5 px-4 text-xs">Sau khi nhận cọc & bàn giao phòng</td>
                </tr>
                <tr className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    Hợp đồng 24 tháng (bậc thang)
                  </td>
                  <td className="py-3.5 px-4">3 tháng đầu 5tr, 21 tháng sau 7tr</td>
                  <td className="py-3.5 px-4">6.750.000 đ</td>
                  <td className="py-3.5 px-4 font-bold text-brand">2.700.000 đ</td>
                  <td className="py-3.5 px-4 text-xs">Sau khi nhận cọc & bàn giao phòng</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="rounded-2xl bg-amber-50/80 border border-amber-200/80 p-4 text-xs text-amber-900 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <span>💡</span>
              <span>Lưu ý quan trọng về tài chính:</span>
            </p>
            <p className="leading-relaxed">
              Website QNS BROKER tuyệt đối không thu tiền cọc, không giữ hộ tiền thuê phòng. Mọi khoản cọc và tiền thuê do Khách thuê thanh toán trực tiếp cho Chủ nhà. Chủ nhà chỉ thanh toán phí dịch vụ cho chuyên viên trong vòng 2 ngày làm việc sau khi giao dịch đã hoàn tất và tiền về tay chủ nhà
            </p>
          </div>
        </div>

        {/* So sánh Tự đăng Facebook vs Cho thuê qua QNS BROKER */}
        <div className="rounded-3xl border border-surface-border bg-white p-8 md:p-10 shadow-card mb-10 space-y-6">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-xl md:text-2xl font-black text-slate-900">
              Tại sao nên hợp tác cùng QNS BROKER?
            </h2>
            <p className="text-xs md:text-sm text-slate-600 mt-1">
              So sánh thực tế giữa việc tự đăng tin trôi nổi và ủy thác chuyên viên điều phối
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Cột tự đăng Facebook */}
            <div className="rounded-2xl border border-red-200 bg-red-50/40 p-6 space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100 text-red-600 text-xs font-bold">✕</span>
                <h3 className="font-bold text-red-950 text-sm md:text-base">Tự đăng tin trên Mạng xã hội</h3>
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold shrink-0">•</span>
                  <span>Bị lộ số điện thoại, hàng chục môi giới ảo gọi làm phiền ngày đêm</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold shrink-0">•</span>
                  <span>Mất thời gian trả lời tin nhắn hỏi dạo, khách hẹn rồi bom lịch không tới</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold shrink-0">•</span>
                  <span>Phải tự túc trực chạy đến mở cửa dẫn xem phòng 10-15 lần mệt mỏi</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold shrink-0">•</span>
                  <span>Khó sàng lọc được khách thuê đàng hoàng, có ý thức và đủ năng lực tài chính</span>
                </li>
              </ul>
            </div>

            {/* Cột QNS BROKER */}
            <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50/50 p-6 space-y-3 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold">✓</span>
                <h3 className="font-bold text-emerald-950 text-sm md:text-base">Ủy thác qua QNS BROKER</h3>
              </div>
              <ul className="space-y-2 text-xs text-slate-800">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold shrink-0">✓</span>
                  <span>Bảo mật 100% SĐT riêng, chuyên viên Đức Quân làm đầu mối duy nhất tiếp nhận khách</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold shrink-0">✓</span>
                  <span>Sàng lọc kỹ lưỡng nhu cầu, công việc, ngân sách trước khi sắp xếp lịch hẹn</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold shrink-0">✓</span>
                  <span>Chuyên viên trực tiếp đến tận nơi dẫn khách xem phòng thay bạn</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold shrink-0">✓</span>
                  <span>Hỗ trợ biểu mẫu hợp đồng thuê chuẩn pháp lý, an tâm nhận tiền trọn vẹn</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quy trình 4 bước */}
        <div className="rounded-3xl border border-surface-border bg-white p-8 md:p-10 shadow-card mb-10 space-y-6">
          <div className="text-center max-w-md mx-auto">
            <h2 className="text-xl md:text-2xl font-black text-slate-900">
              Quy trình 4 bước đơn giản
            </h2>
            <p className="text-xs md:text-sm text-slate-600 mt-1">
              Từ lúc gửi thông tin phòng tới khi ký hợp đồng và nhận tiền
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 space-y-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-brand text-white font-bold text-sm">
                1
              </span>
              <h3 className="font-bold text-slate-900 text-sm">Gửi thông tin phòng</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Điền thông tin địa chỉ, giá thuê, biểu phí điện nước và hình ảnh thực tế chỉ trong 3 phút
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 space-y-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-brand text-white font-bold text-sm">
                2
              </span>
              <h3 className="font-bold text-slate-900 text-sm">Xác minh & Khảo sát</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Đức Quân liên hệ xác nhận điều khoản dịch vụ, thẩm định giá và chụp ảnh xác thực phòng
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 space-y-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-brand text-white font-bold text-sm">
                3
              </span>
              <h3 className="font-bold text-slate-900 text-sm">Dẫn khách xem tận nơi</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tiếp nhận lead khách thuê, sàng lọc nhu cầu và trực tiếp hẹn giờ dẫn khách tới xem phòng
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 space-y-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-sm">
                4
              </span>
              <h3 className="font-bold text-slate-900 text-sm">Ký HĐ & Nhận tiền</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Khách và Chủ ký hợp đồng trực tiếp, bàn giao phòng và chủ nhà thanh toán 40% phí hoa hồng
              </p>
            </div>
          </div>
        </div>

        {/* CTA Cuối trang */}
        <div className="rounded-3xl border border-teal-200 bg-gradient-to-r from-teal-50 via-white to-teal-50 p-8 text-center space-y-4 shadow-sm">
          <h2 className="text-xl md:text-2xl font-black text-slate-900">
            Sẵn sàng tìm khách thuê phù hợp cho phòng của bạn?
          </h2>
          <p className="text-xs md:text-sm text-slate-600 max-w-lg mx-auto">
            Gửi thông tin phòng ngay hôm nay. Chuyên viên Đức Quân sẽ liên hệ hỗ trợ bạn trong vòng 24 giờ
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <Link
              href="/dang-tin"
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-7 py-3.5 text-sm font-bold text-white hover:bg-brand-600 transition-all shadow-md active:scale-[0.98]"
            >
              <span>+ Đăng tin cho thuê miễn phí ngay</span>
            </Link>
            <Link
              href="/dieu-khoan"
              className="inline-flex items-center gap-2 rounded-xl border border-surface-border bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 hover:border-brand/40 hover:text-brand transition-all"
            >
              <span>Xem văn bản Điều khoản dịch vụ</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
