'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { setTokens } from '@/lib/auth-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type ViewMode = 'login' | 'register' | 'forgot';

function formatFriendlyError(err: unknown): string {
  const msg = (err as Error)?.message || 'Đã có lỗi xảy ra, vui lòng thử lại sau';
  if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('network') || msg.includes('ENOTFOUND')) {
    return 'Không thể kết nối đến máy chủ, vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau';
  }
  return msg.replace(/\.+$/, '');
}

function getSafeReturnUrl(rawUrl: string | null): string {
  if (!rawUrl) return '/';
  if (rawUrl.startsWith('/') && !rawUrl.startsWith('//')) {
    return rawUrl;
  }
  return '/';
}

function DangNhapContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnToParam = searchParams.get('returnTo');

  const [viewMode, setViewMode] = useState<ViewMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const handleCallback = (response: any) => {
      if (response?.credential) {
        handleGoogleLogin(response.credential);
      }
    };

    if (!(window as any).google?.accounts?.id) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        (window as any).google?.accounts?.id?.initialize({
          client_id: clientId,
          callback: handleCallback,
        });
      };
      document.body.appendChild(script);
    } else {
      (window as any).google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCallback,
      });
    }
  }, []);

  async function handleGoogleLogin(credential: string) {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Đăng nhập Google thất bại');

      setTokens(data.accessToken, data.refreshToken);
      router.push(getSafeReturnUrl(returnToParam));
    } catch (err) {
      setError(formatFriendlyError(err));
    } finally {
      setLoading(false);
    }
  }

  function triggerGoogleSignIn() {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setError('Vui lòng đăng nhập bằng Email và Mật khẩu ngay bên dưới');
      return;
    }
    if ((window as any).google?.accounts?.id) {
      (window as any).google.accounts.id.prompt();
    } else {
      setError('Đang tải tiện ích Google, vui lòng thử lại sau giây lát');
    }
  }

  async function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Đăng nhập thất bại');

      setTokens(data.accessToken, data.refreshToken);
      if (typeof window !== 'undefined' && rememberMe) {
        localStorage.setItem('qns_remember_email', email.trim());
      }
      router.push(getSafeReturnUrl(returnToParam));
    } catch (err) {
      setError(formatFriendlyError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleRegisterSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/register-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          fullName: fullName.trim() || 'Người dùng',
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Đăng ký thất bại');

      setTokens(data.accessToken, data.refreshToken);
      router.push(getSafeReturnUrl(returnToParam));
    } catch (err) {
      setError(formatFriendlyError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      setSuccessMsg('Nếu email tồn tại trong hệ thống, hướng dẫn khôi phục mật khẩu đã được gửi đến hòm thư của bạn');
    } catch (err) {
      setError(formatFriendlyError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/60 flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-[440px] rounded-2xl sm:rounded-[22px] border border-slate-200/80 bg-white p-7 sm:p-9 shadow-elevated">
        {/* Header Title */}
        <div className="text-center">
          <h1 className="font-bold text-2xl sm:text-[27px] text-slate-900 tracking-tight">
            {viewMode === 'login'
              ? 'Chào mừng trở lại'
              : viewMode === 'register'
                ? 'Tạo tài khoản'
                : 'Khôi phục mật khẩu'}
          </h1>
          <p className="text-sm sm:text-[14.5px] text-slate-500 mt-2">
            {viewMode === 'login'
              ? 'Đăng nhập vào tài khoản của bạn'
              : viewMode === 'register'
                ? 'Đăng ký để lưu tin và trải nghiệm đầy đủ'
                : 'Nhập email để nhận liên kết đặt lại mật khẩu'}
          </p>
        </div>

        {/* Nút Tiếp tục với Google */}
        {viewMode === 'login' && (
          <>
            <button
              type="button"
              onClick={triggerGoogleSignIn}
              className="mt-6 sm:mt-7 w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 active:scale-[0.99] transition-all shadow-xs text-sm sm:text-[15px] font-semibold text-slate-800"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Tiếp tục với Google</span>
            </button>

            {/* Dòng phân cách HOẶC ĐĂNG NHẬP VỚI */}
            <div className="my-5 sm:my-6 flex items-center">
              <div className="flex-1 border-t border-slate-200" />
              <span className="px-3.5 text-[11px] sm:text-xs font-semibold tracking-wider text-slate-400 uppercase select-none">
                HOẶC ĐĂNG NHẬP VỚI
              </span>
              <div className="flex-1 border-t border-slate-200" />
            </div>

            {/* Tab/Nút Email màu tím */}
            <div className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#9d7fe3] text-white font-medium text-sm shadow-xs select-none">
              <svg className="w-4.5 h-4.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                />
              </svg>
              <span>Email</span>
            </div>
          </>
        )}

        {/* Thông báo thành công */}
        {successMsg && (
          <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-center text-xs sm:text-sm font-medium text-emerald-800">
            {successMsg}
          </div>
        )}

        {/* Thông báo lỗi */}
        {error && (
          <div className="mt-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-center text-xs sm:text-sm font-medium text-rose-700">
            {error}
          </div>
        )}

        {/* ── FORM ĐĂNG NHẬP (Khớp 100% Ảnh Cung Cấp) ── */}
        {viewMode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="mt-4 sm:mt-5">
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-1.5">Email</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email của bạn"
                required
                autoComplete="username"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#9d7fe3] focus:outline-none focus:ring-2 focus:ring-[#9d7fe3]/30 transition-all shadow-2xs"
              />
            </div>

            <div className="mt-3.5 sm:mt-4">
              <label className="block text-sm font-bold text-slate-900 mb-1.5">Mật khẩu</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu của bạn"
                  required
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#9d7fe3] focus:outline-none focus:ring-2 focus:ring-[#9d7fe3]/30 transition-all shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 transition-colors"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Checkbox Ghi nhớ đăng nhập + Link Quên mật khẩu */}
            <div className="mt-4 flex items-center justify-between text-xs sm:text-sm">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-800 font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-[#503e6d] focus:ring-[#9d7fe3] cursor-pointer"
                />
                <span>Ghi nhớ đăng nhập</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setViewMode('forgot');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="text-slate-700 hover:text-[#503e6d] font-medium transition-colors"
              >
                Quên mật khẩu?
              </button>
            </div>

            {/* Nút Đăng nhập tím đậm */}
            <button
              type="submit"
              disabled={loading}
              className="mt-5 sm:mt-6 w-full rounded-xl bg-[#503e6d] hover:bg-[#43315c] text-white font-bold py-3.5 text-sm sm:text-base shadow-md hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Đang đăng nhập</span>
                </div>
              ) : (
                <span>Đăng nhập</span>
              )}
            </button>

            {/* Dòng chân trang chuyển sang Đăng ký */}
            <div className="mt-5 sm:mt-6 text-center text-xs sm:text-sm text-slate-500">
              <span>Bạn chưa có tài khoản? </span>
              <button
                type="button"
                onClick={() => {
                  setViewMode('register');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="font-bold text-[#503e6d] hover:underline cursor-pointer"
              >
                Đăng ký ngay
              </button>
            </div>
          </form>
        )}

        {/* ── FORM ĐĂNG KÝ TÀI KHOẢN MỚI ── */}
        {viewMode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="mt-5 sm:mt-6 space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-1.5">Họ và tên</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nhập họ và tên của bạn"
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#9d7fe3] focus:outline-none focus:ring-2 focus:ring-[#9d7fe3]/30 transition-all shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-900 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email của bạn"
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#9d7fe3] focus:outline-none focus:ring-2 focus:ring-[#9d7fe3]/30 transition-all shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-900 mb-1.5">Mật khẩu</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mật khẩu tối thiểu 6 ký tự"
                  required
                  minLength={6}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#9d7fe3] focus:outline-none focus:ring-2 focus:ring-[#9d7fe3]/30 transition-all shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-[#503e6d] hover:bg-[#43315c] text-white font-bold py-3.5 text-sm sm:text-base shadow-md hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Đang đăng ký</span>
                </div>
              ) : (
                <span>Đăng ký</span>
              )}
            </button>

            <div className="mt-4 text-center text-xs sm:text-sm text-slate-500">
              <span>Đã có tài khoản? </span>
              <button
                type="button"
                onClick={() => {
                  setViewMode('login');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="font-bold text-[#503e6d] hover:underline cursor-pointer"
              >
                Đăng nhập ngay
              </button>
            </div>
          </form>
        )}

        {/* ── FORM KHÔI PHỤC MẬT KHẨU ── */}
        {viewMode === 'forgot' && (
          <form onSubmit={handleForgotPasswordSubmit} className="mt-5 sm:mt-6 space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email của bạn"
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#9d7fe3] focus:outline-none focus:ring-2 focus:ring-[#9d7fe3]/30 transition-all shadow-2xs"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-[#503e6d] hover:bg-[#43315c] text-white font-bold py-3.5 text-sm sm:text-base shadow-md hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Đang gửi</span>
                </div>
              ) : (
                <span>Gửi yêu cầu khôi phục</span>
              )}
            </button>

            <div className="mt-4 text-center text-xs sm:text-sm text-slate-500">
              <button
                type="button"
                onClick={() => {
                  setViewMode('login');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="font-bold text-[#503e6d] hover:underline cursor-pointer"
              >
                Quay lại đăng nhập
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function DangNhapPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md px-4 py-16 text-center text-sm text-slate-500">Đang tải</div>}>
      <DangNhapContent />
    </Suspense>
  );
}
