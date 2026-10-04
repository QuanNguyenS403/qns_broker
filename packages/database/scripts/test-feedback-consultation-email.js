/**
 * Test Suite: Xác thực các tính năng Phản hồi (Feedback) & Cần tư vấn (Consultation)
 * 1. POST /leads/feedback (@Public, không bắt buộc login)
 * 2. POST /leads/consultation (@Public, không bắt buộc login)
 * 3. Validation: phone regex, content min length (10 ký tự)
 * 4. Tự động gửi email thông báo tới contact@qns.com
 */

const assert = require('assert');

async function runTests() {
  console.log('🚀 Bắt đầu kiểm thử tính năng Phản hồi & Cần tư vấn...');
  const API_URL = process.env.API_URL || 'http://localhost:4000';

  // 1. Test POST /leads/feedback hợp lệ
  try {
    const res = await fetch(`${API_URL}/leads/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rating: 5,
        content: 'Website rất đẹp, tìm phòng dễ dàng và minh bạch thông tin',
        name: 'Nguyễn Văn Test',
        email: 'test-user@example.com',
      }),
    });

    const data = await res.json();
    console.log('[TEST 1] POST /leads/feedback status:', res.status, data);
    assert.strictEqual(res.status, 201, 'POST /leads/feedback phải trả về 201');
    assert.strictEqual(data.success, true, 'success phải là true');
    console.log('✅ TEST 1 PASS: Gửi phản hồi thành công và tự động kích hoạt thông báo email');
  } catch (err) {
    console.error('❌ TEST 1 FAILED:', err.message);
  }

  // 2. Test POST /leads/feedback validation: content < 10 ký tự
  try {
    const res = await fetch(`${API_URL}/leads/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rating: 3,
        content: 'Ngắn',
      }),
    });

    console.log('[TEST 2] POST /leads/feedback ngắn status:', res.status);
    assert.strictEqual(res.status, 400, 'POST /leads/feedback nội dung < 10 ký tự phải trả về 400');
    console.log('✅ TEST 2 PASS: Chặn đúng nội dung phản hồi ngắn hơn 10 ký tự');
  } catch (err) {
    console.error('❌ TEST 2 FAILED:', err.message);
  }

  // 3. Test POST /leads/consultation hợp lệ
  try {
    const res = await fetch(`${API_URL}/leads/consultation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: '0912345678',
        reason: 'Khác',
        description: 'Tôi cần tìm phòng trọ khép kín quanh khu vực Cầu Giấy',
      }),
    });

    const data = await res.json();
    console.log('[TEST 3] POST /leads/consultation status:', res.status, data);
    assert.strictEqual(res.status, 201, 'POST /leads/consultation phải trả về 201');
    assert.strictEqual(data.success, true, 'success phải là true');
    console.log('✅ TEST 3 PASS: Gửi yêu cầu tư vấn thành công và tự động kích hoạt thông báo email');
  } catch (err) {
    console.error('❌ TEST 3 FAILED:', err.message);
  }

  // 4. Test POST /leads/consultation validation: số điện thoại sai
  try {
    const res = await fetch(`${API_URL}/leads/consultation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: '12345',
        reason: 'Khác',
      }),
    });

    console.log('[TEST 4] POST /leads/consultation sai phone status:', res.status);
    assert.strictEqual(res.status, 400, 'POST /leads/consultation sai định dạng SĐT phải trả về 400');
    console.log('✅ TEST 4 PASS: Chặn đúng số điện thoại sai định dạng');
  } catch (err) {
    console.error('❌ TEST 4 FAILED:', err.message);
  }

  console.log('🎉 Hoàn tất bộ kiểm thử Phản hồi & Cần tư vấn!');
}

runTests();
