import Link from 'next/link';
import { SITE_CONFIG } from '@/lib/constants';
import { QnsLogo } from '@/components/QnsLogo';

export function Footer() {
  return (
    <footer className="border-t border-slate-700 bg-slate-900 text-white">
      <div className="container-max py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4">
          {/* Cột Thương hiệu */}
          <div className="sm:col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white p-1 shadow-sm ring-1 ring-white/20 group-hover:scale-105 transition-transform">
                <QnsLogo variant="emblem" theme="brand" size={26} />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                QNS <span className="font-normal text-slate-300">BROKER</span>
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Nền tảng cho thuê chuyên biệt — <strong className="text-white">Rõ chi phí, đúng người cho thuê</strong>
              <br />
              Minh bạch biểu phí trọn gói, kết nối trực tiếp bên có quyền cho thuê
            </p>
          </div>

          {/* Cột 1: Liên kết nhanh */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">
              Liên kết nhanh
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link href="/thue" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Tìm phòng
                </Link>
              </li>
              <li>
                <Link href="/gioi-thieu" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Về chúng tôi
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 2: Hỗ trợ */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">
              Hỗ trợ
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/dieu-khoan" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Điều khoản sử dụng
                </Link>
              </li>
              <li>
                <Link href="/chinh-sach" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Chính sách bảo mật
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 3: Liên hệ */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">
              Liên hệ
            </h3>
            <div className="flex items-center gap-2.5 text-sm text-slate-400">
              <svg className="h-4 w-4 shrink-0 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
                <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
              </svg>
              <a
                href={`mailto:${SITE_CONFIG.supportEmail}`}
                className="hover:text-white transition-colors"
              >
                {SITE_CONFIG.supportEmail}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-700/60">
        <div className="container-max flex flex-col items-center justify-between gap-2 py-4 sm:flex-row">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} QNS BROKER (qnsbroker.com) — Nền tảng Dịch vụ Cho thuê Bất Động Sản
          </p>
          <div className="flex items-center gap-6 text-xs text-slate-400">
            <Link href="/dieu-khoan" className="hover:text-white transition-colors">
              Điều khoản
            </Link>
            <Link href="/chinh-sach" className="hover:text-white transition-colors">
              Bảo mật
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
