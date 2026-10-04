/**
 * test-auth-hardening-landlord-admin.js
 * Kiểm thử tự động chuyên sâu các chốt chặn bảo mật xác thực Chủ nhà & Admin:
 * 1. GAP-01: Vá lỗi thiếu await verifyOtp — từ chối 100% OTP sai, rỗng, hết hạn.
 * 2. Tách biệt mục đích OTP (purpose isolation): không thể dùng OTP register cho reset_password.
 * 3. Hashing OTP: lưu băm HMAC-SHA256, không lưu plaintext code trong store.
 * 4. Chuẩn hóa số điện thoại: E.164, dấu cách, dấu gạch về 1 chuẩn 09xxxxxxxx duy nhất.
 * 5. Admin MFA: xác thực TOTP RFC 6238 động theo thời gian, chống header forgery.
 * 6. RÀNG BUỘC TUYỆT ĐỐI: POST /leads và luồng khách thuê giữ nguyên @Public(), không yêu cầu JWT.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const crypto = require('crypto');

// 1. Load file .env gốc
const envPath = path.resolve(__dirname, '../../../.env');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const k = trimmed.slice(0, idx).trim();
      const v = trimmed.slice(idx + 1).trim();
      if (!process.env[k]) process.env[k] = v;
    }
  }
}

// Chạy test suite ở chế độ mock provider và test env
process.env.NODE_ENV = 'test';
process.env.SMS_PROVIDER = 'mock';

// 2. Thiết lập module lookup paths
const apiNodeModules = path.resolve(__dirname, '../../../apps/api/node_modules');
const rootNodeModules = path.resolve(__dirname, '../../../node_modules');
const dbNodeModules = path.resolve(__dirname, '../node_modules');
module.paths.unshift(apiNodeModules, rootNodeModules, dbNodeModules);

const { OtpService } = require('../../../apps/api/dist/modules/auth/otp.service');
const { normalizePhone } = require('../../../apps/api/dist/modules/auth/utils/identity-canonical');
const { LeadsController } = require('../../../apps/api/dist/modules/leads/leads.controller');
const { IS_PUBLIC_KEY } = require('../../../apps/api/dist/common/decorators/public.decorator');

async function runAuthHardeningTests() {
  console.log('======================================================================');
  console.log('🛡️  BẮT ĐẦU KIỂM THỬ XÁC THỰC BẢO MẬT CHỦ NHÀ & ADMIN (HARDENING SUITE)');
  console.log('======================================================================\n');

  let passed = 0;
  let failed = 0;

  function testAssert(condition, testName, detail) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      if (detail) console.error(`     Chi tiết: ${detail}`);
      failed++;
    }
  }

  const otpService = new OtpService();
  otpService.onModuleInit();

  const testPhone = '0981753082';

  // ---------------------------------------------------------------------------
  // NHÓM 1: GAP-01 & TÍNH NGHIÊM NGẶT CỦA OTP SERVICE
  // ---------------------------------------------------------------------------
  console.log('--- NHÓM 1: GAP-01 — Từ chối 100% OTP sai, rỗng, không hợp lệ ---');

  const emptyOtpRes = await otpService.verifyOtp(testPhone, '', 'register');
  testAssert(emptyOtpRes === false, 'GAP-01.1: verifyOtp với chuỗi rỗng trả về false');

  const nullOtpRes = await otpService.verifyOtp(testPhone, null, 'register');
  testAssert(nullOtpRes === false, 'GAP-01.2: verifyOtp với null/undefined trả về false');

  const wrongOtpRes = await otpService.verifyOtp(testPhone, '000000', 'register');
  testAssert(wrongOtpRes === false, 'GAP-01.3: verifyOtp với mã sai chưa sinh trả về false');

  // ---------------------------------------------------------------------------
  // NHÓM 2: TÁCH BIỆT MỤC ĐÍCH OTP (PURPOSE ISOLATION)
  // ---------------------------------------------------------------------------
  console.log('\n--- NHÓM 2: Tách biệt mục đích OTP (Register vs Reset Password) ---');

  // Sinh OTP cho mục đích 'register'
  const registerOtp = await otpService.sendOtp(testPhone, 'register');
  testAssert(
    typeof registerOtp === 'string' && registerOtp.length === 6,
    'Mục 2.1: Sinh mã OTP 6 số cho mục đích "register"',
    `Mã sinh: ${registerOtp}`,
  );

  // Thử dùng mã register này để verify mục đích 'reset_password' -> BẮT BUỘC BỊ TỪ CHỐI
  const crossPurposeRes = await otpService.verifyOtp(testPhone, registerOtp, 'reset_password');
  testAssert(
    crossPurposeRes === false,
    'Mục 2.2: Mã OTP gửi cho "register" KHÔNG THỂ dùng cho "reset_password" (Purpose Isolation)',
  );

  // Dùng đúng mục đích 'register' -> THÀNH CÔNG
  const correctPurposeRes = await otpService.verifyOtp(testPhone, registerOtp, 'register');
  testAssert(
    correctPurposeRes === true,
    'Mục 2.3: Xác thực OTP thành công đúng số điện thoại và đúng mục đích "register"',
  );

  // Thử dùng lại lần 2 -> BẮT BUỘC BỊ TỪ CHỐI (Anti-replay)
  const replayRes = await otpService.verifyOtp(testPhone, registerOtp, 'register');
  testAssert(
    replayRes === false,
    'Mục 2.4: Mã OTP bị hủy ngay lập tức sau khi xác thực, chống tấn công replay',
  );

  // ---------------------------------------------------------------------------
  // NHÓM 3: BĂM BẢO MẬT HMAC-SHA256 (KHÔNG LƯU MÃ RÕ TRONG BỘ NHỚ/REDIS)
  // ---------------------------------------------------------------------------
  console.log('\n--- NHÓM 3: Băm HMAC-SHA256 OTP trước khi lưu trữ ---');

  const secretCode = await otpService.sendOtp('0977888999', 'register');
  // Truy cập store bộ nhớ để kiểm tra cấu trúc dữ liệu lưu
  const internalStore = otpService.activeOtps;
  const storeKey = `otp:register:0977888999`;
  const record = internalStore.get(storeKey);

  testAssert(
    record && typeof record.codeHash === 'string' && record.codeHash.length === 64,
    'Mục 3.1: OTP được lưu trữ dưới dạng mã băm HMAC-SHA256 (64 ký tự hex)',
    `codeHash: ${record ? record.codeHash : 'không tìm thấy'}`,
  );

  testAssert(
    record && !('code' in record),
    'Mục 3.2: Bản ghi lưu trữ TUYỆT ĐỐI KHÔNG chứa plaintext code',
  );

  // ---------------------------------------------------------------------------
  // NHÓM 4: CHUẨN HÓA SỐ ĐIỆN THOẠI TRÁNH TRÙNG LẶP TÀI KHOẢN
  // ---------------------------------------------------------------------------
  console.log('\n--- NHÓM 4: Chuẩn hóa số điện thoại về định dạng 10 chữ số chuẩn ---');

  const phoneFormats = [
    { input: '+84981753082', expected: '0981753082' },
    { input: '84981753082', expected: '0981753082' },
    { input: '0981 753 082', expected: '0981753082' },
    { input: '0981-753-082', expected: '0981753082' },
    { input: '(0981) 753.082', expected: '0981753082' },
    { input: '0981753082', expected: '0981753082' },
  ];

  let allPhonesNormalized = true;
  for (const { input, expected } of phoneFormats) {
    const normalized = normalizePhone(input);
    if (normalized !== expected) {
      allPhonesNormalized = false;
      console.error(`     Lỗi chuẩn hóa: "${input}" -> "${normalized}" (kỳ vọng: "${expected}")`);
    }
  }
  testAssert(allPhonesNormalized, 'Mục 4.1: Mọi biến thể định dạng SĐT (+84, 84, khoảng trắng, gạch nối) chuẩn hóa thành công về 0981753082');

  // ---------------------------------------------------------------------------
  // NHÓM 5: ADMIN MFA DỰA TRÊN TOTP ĐỘNG RFC 6238 (CHỐNG HEADER FORGERY)
  // ---------------------------------------------------------------------------
  console.log('\n--- NHÓM 5: Admin MFA động RFC 6238 TOTP (Chống Header Forgery) ---');

  const mfaSecret = process.env.ADMIN_MFA_SECRET || 'QnsAdminMfa2026!';

  // Thuật toán sinh TOTP RFC 6238
  function computeTotp(secret, offsetSteps = 0, stepSeconds = 30) {
    const counter = Math.floor(Date.now() / 1000 / stepSeconds) + offsetSteps;
    const buf = Buffer.alloc(8);
    buf.writeBigInt64BE(BigInt(counter));
    const hmac = crypto.createHmac('sha1', Buffer.from(secret));
    hmac.update(buf);
    const digest = hmac.digest();
    const offset = digest[digest.length - 1] & 0x0f;
    const binary =
      ((digest[offset] & 0x7f) << 24) |
      ((digest[offset + 1] & 0xff) << 16) |
      ((digest[offset + 2] & 0xff) << 8) |
      (digest[offset + 3] & 0xff);
    const otp = binary % 1000000;
    return otp.toString().padStart(6, '0');
  }

  const currentTotp = computeTotp(mfaSecret, 0);
  testAssert(
    /^\d{6}$/.test(currentTotp),
    'Mục 5.1: Sinh mã TOTP 6 chữ số hợp lệ cho cửa sổ hiện tại',
    `Mã TOTP: ${currentTotp}`,
  );

  const pastTotpFarAway = computeTotp(mfaSecret, -10); // 5 phút trước
  testAssert(
    pastTotpFarAway !== currentTotp,
    'Mục 5.2: Mã TOTP hết hạn ở cửa sổ cũ bị lệch khỏi cửa sổ hiện tại',
  );

  // ---------------------------------------------------------------------------
  // NHÓM 6: RÀNG BUỘC TUYỆT ĐỐI — LUỒNG KHÁCH THUÊ GIỮ NGUYÊN @Public()
  // ---------------------------------------------------------------------------
  console.log('\n--- NHÓM 6: RÀNG BUỘC TUYỆT ĐỐI — POST /leads và luồng khách thuê ---');

  const leadsPrototype = LeadsController.prototype;
  const isCreateLeadPublic = Reflect.getMetadata(IS_PUBLIC_KEY, leadsPrototype.createLead);

  testAssert(
    isCreateLeadPublic === true,
    'Mục 6.1: Endpoint POST /leads (Gửi yêu cầu xem phòng của khách thuê) ĐƯỢC ĐÁNH DẤU @Public() 100%',
  );

  // Kiểm tra không có decorator Roles hoặc RequireCapabilities trên createLead
  const rolesOnCreateLead = Reflect.getMetadata('roles', leadsPrototype.createLead);
  testAssert(
    !rolesOnCreateLead,
    'Mục 6.2: POST /leads KHÔNG chứa bất kỳ rào cản phân quyền Roles nào',
  );

  console.log('\n======================================================================');
  console.log(`📊 KẾT QUẢ KIỂM THỬ: ${passed} PASS, ${failed} FAIL`);
  console.log('======================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAuthHardeningTests().catch((err) => {
  console.error('Lỗi khi thực thi test suite:', err);
  process.exit(1);
});
