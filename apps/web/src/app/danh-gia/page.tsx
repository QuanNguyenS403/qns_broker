import { Metadata } from 'next';
import Link from 'next/link';
import { getReviewStats } from '@/lib/reviews-data';
import { MapReviewsExplorer } from '@/components/reviews/MapReviewsExplorer';
import { TransparencyChecker } from '@/components/reviews/TransparencyChecker';
import { MarketTrapsOverview } from '@/components/reviews/MarketTrapsOverview';
import { ChecklistGuideSection } from '@/components/reviews/ChecklistGuideSection';

export const metadata: Metadata = {
  title: 'Bản đồ phòng trọ & Đánh giá minh bạch — QNS Land',
  description: 'Bản đồ Google Maps tra cứu vị trí phòng trọ theo ngõ phường quận, tích hợp lịch sử tìm kiếm và đánh giá thực tế từ cựu người thuê',
  alternates: {
    canonical: '/danh-gia',
  },
  openGraph: {
    title: 'Bản đồ phòng trọ & Đánh giá minh bạch — QNS Land',
    description: 'Bản đồ Google Maps tra cứu vị trí phòng trọ theo ngõ phường quận, tích hợp lịch sử tìm kiếm và đánh giá thực tế từ cựu người thuê',
    type: 'website',
  },
};

export default function DanhGiaPage() {
  const stats = getReviewStats();

  return (
    <div className="min-h-screen bg-slate-50/70 pb-16">
      {/* Header gọn gàng định vị mục Đánh giá & Bản đồ Google Maps */}
      <section className="bg-gradient-to-b from-brand-900 via-brand-800 to-slate-900 text-white pt-5 sm:pt-7 pb-8 sm:pb-10">
        <div className="container-max">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badges định vị */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-teal-200 text-xs font-semibold mb-2.5">
              <span className="flex h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
              <span>Bản đồ Google Maps & Đánh giá Phòng trọ Minh bạch</span>
              <span>•</span>
              <span>Bảo mật vị trí ngõ ngách</span>
            </div>

            {/* Tiêu đề Hero 2 dòng theo chuẩn GEMINI.md § 8 */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white leading-[1.15] md:leading-[1.18]">
              Bản đồ phòng trọ minh bạch,
              <span className="block mt-0.5 sm:mt-0.5 text-teal-300">
                rõ chi phí và đánh giá thực tế
              </span>
            </h1>

            <p className="mt-2 text-xs sm:text-sm text-slate-200 max-w-2xl mx-auto leading-relaxed">
              Khám phá vị trí phòng trọ trên Google Maps theo từng ngõ, phường, quận. Tra cứu lịch sử tìm kiếm, bóc trần bẫy cọc và xem đánh giá độc lập từ cộng đồng cựu người thuê
            </p>
          </div>
        </div>
      </section>

      {/* Main container */}
      <main className="container-max -mt-5 sm:-mt-6 relative z-20 space-y-12">
        {/* Khối Trọng tâm: Bản đồ Google Maps tương tác + Thanh tìm kiếm nổi Ảnh 2 + Lịch sử tìm kiếm + Tích hợp Review */}
        <section className="scroll-mt-20">
          <MapReviewsExplorer />
        </section>

        {/* Khối Tiện ích 1: Công cụ tra cứu bẫy trọ khẩn cấp */}
        <section className="scroll-mt-20">
          <TransparencyChecker />
        </section>

        {/* Khối Tiện ích 2: 5 Vấn đề nhức nhối khi thuê phòng */}
        <section className="scroll-mt-20">
          <MarketTrapsOverview stats={stats} />
        </section>

        {/* Khối Tiện ích 3: Cẩm nang 5 bước trước khi cọc & Quy tắc ở ghép */}
        <section className="scroll-mt-20">
          <ChecklistGuideSection />
        </section>

        {/* Khối Cam kết đồng hành từ QNS Broker */}
        <section className="rounded-3xl bg-gradient-to-br from-teal-900 to-slate-900 text-white p-6 sm:p-10 border border-teal-500/20 shadow-xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-400/20 text-teal-300 text-xs font-bold uppercase tracking-wider mb-3">
                <span>Dịch vụ Dẫn xem Hiện trường Thực tế</span>
                <span>•</span>
                <span>Miễn phí 100% cho khách</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
                Không muốn tự mình đi kiểm tra phòng trọ?
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Đội ngũ chuyên viên Đức Quân (QNS Broker) sẽ đồng hành cùng bạn đến tận nơi, tự tay ngắt cầu dao test công tơ điện, mở vòi nước kiểm tra áp lực và rà soát từng điều khoản hợp đồng giúp bạn hoàn toàn an tâm
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full sm:w-auto">
              <Link
                href="/thue"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-brand px-6 py-3.5 text-sm font-bold shadow-sm hover:bg-teal-50 active:scale-95 transition-all text-center"
              >
                <span>Xem danh sách phòng an toàn</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              <a
                href="tel:0981753082"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 text-white px-6 py-3.5 text-sm font-bold transition-all border border-white/20 text-center"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>Hotline: 0981 753 082</span>
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
