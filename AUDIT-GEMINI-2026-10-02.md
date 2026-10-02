# AUDIT-GEMINI-2026-10-02.md — Thẩm định & Khắc phục Trải nghiệm Khách thuê & Chủ nhà (Mô hình Broker Quân làm đầu mối duy nhất)

**Người thực hiện:** Gemini 3.8 Flash (High) - Antigravity Agent  
**Ngày thực hiện:** 02/10/2026  
**Nhánh Git:** `audit/tenant-landlord-experience-v3-2026-10-02`  
**Phạm vi:** Toàn bộ trải nghiệm người dùng (Khách thuê & Chủ nhà) trên codebase `batdongsan` theo mô hình vận hành mới nhất: **Chuyên viên Nguyễn Đức Quân là đầu mối tư vấn & dẫn xem duy nhất, thu 40% hoa hồng từ chủ nhà khi giao dịch thành công, khách thuê 0 đồng phí môi giới, không giữ cọc hay thu hộ tiền thuê**.  
**Phương pháp:** Thẩm định kép kết hợp kiểm tra mã nguồn, đối chiếu tài liệu vs code thật, kiểm thử giao diện bằng trình duyệt thật (`browser_subagent`), và khắc phục triệt để các lỗ hổng/thiếu sót phát hiện được (#67 – #74).

---

## 1. XÁC MINH NGHI VẤN ƯU TIÊN CAO NHẤT (TÀI LIỆU VS CODE THẬT)

### 1.1 Nghi vấn `reveal-phone` có làm lộ số điện thoại chủ nhà thật không?
- **Kiểm tra mã nguồn backend (`apps/api/src/modules/listings/listings.service.ts` dòng 1090-1120):**
  - Endpoint `POST /listings/:id/reveal-phone` trong code backend **KHÔNG TRẢ VỀ SỐ ĐIỆN THOẠI CỦA CHỦ NHÀ**.
  - Giá trị trả về là `assignedAgent.phone` hoặc fallback hotline mặc định `0981 753 082` (Số của Quân).
  - Bảng `OwnerProfile` và số điện thoại thật của chủ nhà được cô lập trong DB, không bị lộ ra ngoài qua endpoint này.
- **Vấn đề thực tế phát hiện được trên Frontend (#67):**
  - Mặc dù không lộ số chủ nhà, trên trang chi tiết tin (`apps/web/src/app/tin/[slug]/`) tồn tại cùng lúc **3 component liên hệ chồng chéo**:
    1. `OwnerContactBox.tsx` (Sidebar desktop): Hiển thị thông tin Quân nhưng lại lồng nút `RevealPhoneButton` che số dạng `0981 ••• •••` và bắt buộc đăng nhập (bật popup AuthModal) mới xem được.
    2. `MobileStickyContactBar.tsx` (Thanh dính mobile): Cũng lồng nút `RevealPhoneButton` thu nhỏ scale-90, đòi đăng nhập.
    3. `RevealPhoneButton.tsx`: Cơ chế che số và gọi API `/reveal-phone` tốn 1 request mạng không cần thiết chỉ để hiện số hotline công khai của Quân.
  - **Hậu quả:** Khách thuê muốn gọi cho Quân để hỏi phòng thì bị chặn lại bởi modal đăng nhập; gây nghi ngờ và làm rớt tỷ lệ chuyển đổi (drop-off rate) nghiêm trọng.
  - **Khắc phục triệt để (#67):**
    - Loại bỏ nút che số `RevealPhoneButton` khỏi `OwnerContactBox` và `MobileStickyContactBar`.
    - Hiển thị trực tiếp số điện thoại công khai của Quân (`0981 753 082`), cung cấp nút **Gọi ngay** (`tel:0981753082`), nút **Chat Zalo** (`https://zalo.me/0981753082`) và nút **Đề xuất lịch xem phòng** 1-click không rào cản đăng nhập.
    - Giữ lại `RevealPhoneButton.tsx` độc lập cho mục đích tương thích ngược/kiểm thử.

### 1.2 Rà soát các route tàn dư từ mô hình cũ
- **Route `/mua-ban`**: Đã có `redirect('/thue')` và cấu hình 308 permanent redirect trong `next.config.mjs`. Hoàn toàn sạch dấu vết mua bán.
- **Route `/du-an`, `/gia-nha-dat`, `/moi-gioi`**: Đã được chuyển dịch sang ngữ cảnh 100% cho thuê (Khu trọ/căn hộ mini, Bảng giá thuê khu vực, Danh bạ quản lý vận hành).
- **Route `/gia-thanh-vien`**: Trước đây trỏ sang `/dieu-khoan`. Hiện tại đã cập nhật chuyển hướng về `/bieu-phi` (Trang biểu phí minh bạch 40% cho chủ nhà). Đã xóa bỏ file dead code `MembershipPricingClient.tsx`.
- **Menu Quản trị `/admin/layout.tsx`**: Vẫn còn sót 2 menu item của mô hình bán gói cũ (`/admin/duyet-goi`, `/admin/mua-cao-diem`). Đã dọn dẹp và thay thế bằng menu quản lý Lead Queue (`/admin/leads`).

---

## 2. VAI TRÒ 1 — CHUYÊN GIA THẨM ĐỊNH FRONTEND & KHÁCH THUÊ DÀY DẠN KINH NGHIỆM

### 2.1 Đối chiếu Checklist thông tin bắt buộc của một tin đăng cho thuê
| Tiêu chí bắt buộc | Trạng thái trước audit | Trạng thái sau khắc phục | Ghi chú thực chiến |
|---|---|---|---|
| **Giá thuê/tháng, tiền cọc** | Đã có | Tối ưu hiển thị | Hiển thị rõ giá thuê và số tháng cọc trong `MoveInCostEstimator` |
| **Giá điện/nước (nhà nước hay tư nhân)** | Đã có | Hoàn thiện | Hiển thị đơn vị đ/kWh, đ/m³ hoặc khoán kèm bộ tính tổng chi phí tháng đầu |
| **Phí quản lý, gửi xe, internet, rác** | Thiếu trường gửi xe, internet, dịch vụ trên chi tiết tin | **Đã bổ sung (#69)** | Thêm InfoRow hiển thị Phí xe máy, Internet/Wifi, Phí dịch vụ chung |
| **Hạn hợp đồng tối thiểu** | Đã có | Hoàn thiện | Hiển thị thời hạn tối thiểu (tháng) rõ ràng |
| **Ngày có thể dọn vào sớm nhất** | Thiếu trường | **Đã bổ sung (#69)** | Thêm InfoRow `Ngày dọn vào` (ở ngay hoặc ngày cụ thể) |
| **Thú cưng, nấu ăn, giờ giấc** | Nấu ăn đã có, thiếu thú cưng | **Đã bổ sung (#69)** | Thêm huy hiệu & InfoRow `Thú cưng: Cho phép nuôi thú cưng` |
| **Tình trạng nội thất** | Thiếu phân loại tổng quan | **Đã bổ sung (#69)** | Thêm trường `Tình trạng nội thất` (Đầy đủ nội thất / Cơ bản / Phòng trống) và lưới tiện ích |
| **Lưới Tiện ích (Amenities)** | Bị thiếu hoàn toàn trên trang chi tiết | **Đã khôi phục (#69)** | Hiển thị khối 14 tiện ích (Điều hòa, Nóng lạnh, Tủ lạnh, Máy giặt, Giường nệm, Tủ quần áo, v.v.) |
| **Khoảng cách tới trường ĐH** | Đã có | Hiển thị tốt | Liệt kê các trường lân cận kèm khoảng cách km và thời gian đi lại |
| **Minh bạch vai trò Chuyên viên Quân** | Chưa đủ rõ, gây hiểu lầm là chủ trọ | **Đã tối ưu (#67, #70)** | Khẳng định rõ: "Chuyên viên tư vấn & dẫn xem trực tiếp — Không qua trung gian khác — Miễn phí 100% cho khách thuê" |
| **Khách thuê 0 đồng phí môi giới** | Nằm rải rác | **Đã làm nổi bật (#67, #70)** | Huy hiệu xanh lá `Khách thuê 0đ phí môi giới` xuất hiện ngay đầu box liên hệ |

### 2.2 Trải nghiệm luồng liên hệ khách thuê
- **1-Click Call & Zalo:** Khách bấm là gọi ngay cho Quân hoặc mở thẳng Zalo để gửi link tin nhắn hỏi phòng.
- **Modal đặt lịch xem phòng (`ContactBrokerModal`):** Cho phép khách chọn ngày, giờ, ghi chú mong muốn. Form gửi trực tiếp về API backend, lưu `RentalRequest` và tạo `Lead` thật, tự động gán cho Quân xử lý trong vòng 15-30 phút.

---

## 3. VAI TRÒ 2 — CHỦ NHÀ ĐĂNG TIN DÀY DẠN KINH NGHIỆM

### 3.1 Giải thích mô hình 40% hoa hồng khi thành công
- **Thực trạng trước audit:** Website hoàn toàn không có trang nào giải thích cho chủ nhà mô hình 40% hoa hồng. Link `/gia-thanh-vien` bị chuyển hướng về `/dieu-khoan`. Chủ nhà không hiểu tại sao phải trả 40% thay vì đăng tin miễn phí trên Facebook.
- **Đã khắc phục triệt để (#68):**
  - Xây dựng trang đích mới **`/bieu-phi` (Biểu phí dịch vụ môi giới chủ nhà)**.
  - Nêu rõ 4 cam kết vàng:
    1. **Chỉ trả phí khi thành công:** 40% giá trị hợp đồng thuê một tháng, chỉ thanh toán khi đã ký HĐ, nhận tiền cọc/kỳ đầu và bàn giao phòng.
    2. **0 đồng nếu không thuê được:** Đăng tin, chụp ảnh, dẫn khách xem hoàn toàn miễn phí.
    3. **Bảo mật số điện thoại 100%:** Số cá nhân của chủ nhà không bao giờ bị lộ ra ngoài, tránh bị quấy rầy bởi hàng chục môi giới tự do.
    4. **Sàng lọc khách thuê văn minh:** Quân trực tiếp tư vấn, kiểm tra lý lịch, nghề nghiệp và dẫn khách xem phòng.
  - Quy trình 4 bước chuẩn chỉ: Gửi tin -> Ký HĐ dịch vụ HĐ-01 -> Dẫn khách xem phòng -> Ký HĐ thuê và thanh toán hoa hồng.

### 3.2 Form đăng tin (`/dang-tin`)
- **Bổ sung các trường thực tế (#69):**
  - Phí gửi xe máy (đ/tháng hoặc miễn phí).
  - Phí internet/wifi (đ/tháng hoặc miễn phí).
  - Phí dịch vụ/vệ sinh chung.
  - Tình trạng nội thất (Đầy đủ, Cơ bản, Phòng trống).
  - Ngày sẵn sàng dọn vào ở.
  - Tiện ích cho phép nuôi thú cưng, giường nệm, tủ quần áo, bàn làm việc.

### 3.3 Theo dõi tin sau khi đăng và bảo vệ thông tin
- **Trang Quản lý tin (`/tai-khoan/quan-ly-tin`) (#72):**
  - Hiển thị rõ ràng trạng thái: Đang hiển thị (`active`), Chờ duyệt (`pending`), Đã từ chối (`rejected`), Đã cho thuê (`rented`), Hết hạn (`expired`).
  - Khi tin bị từ chối, hiển thị khung cảnh báo màu đỏ nêu rõ **Lý do từ chối từ chuyên viên** để chủ nhà biết đường chỉnh sửa hoặc liên hệ Quân hỗ trợ.
  - Nút chuyển trạng thái nhanh "Đã cho thuê" để ẩn tin khi đã có khách.
- **Trang Quản lý Lead (`/tai-khoan/leads`) (#73):**
  - Chủ nhà theo dõi được các lượt khách quan tâm và đặt lịch xem của các phòng thuộc sở hữu của mình.
  - Thông tin nhạy cảm của khách thuê được che an toàn (ví dụ: `0987***321`), bảo đảm mọi giao dịch đều diễn ra văn minh qua đầu mối Quân.

---

## 4. DANH SÁCH LỖI & THIẾU SÓT ĐÃ KHẮC PHỤC TRIỆT ĐỂ (#67 – #74)

| # | Mức độ | Vị trí | Vấn đề trước audit | Đã khắc phục triệt để bằng cách |
|---|---|---|---|---|
| **67** | 🔴 Nghiêm trọng | `tin/[slug]/OwnerContactBox.tsx`, `MobileStickyContactBar.tsx` | Nút che số `RevealPhoneButton` đòi đăng nhập, chồng chéo 3 component liên hệ, gây rào cản lớn cho khách thuê | Loại bỏ che số và rào cản login; hiển thị hotline Quân 0981 753 082 công khai, 1-click Gọi ngay, 1-click Zalo, 1-click Đặt lịch xem phòng |
| **68** | 🔴 Nghiêm trọng | `/bieu-phi`, `/gia-thanh-vien` | Thiếu trang giải thích mô hình 40% hoa hồng; chủ nhà không biết lý do nên hợp tác môi giới | Tạo trang `/bieu-phi` chuẩn mực giải thích 4 cam kết vàng, biểu phí 40% chỉ trả khi thành công, quy trình 4 bước; redirect `/gia-thanh-vien` sang `/bieu-phi` |
| **69** | 🟠 Quan trọng | `tin/[slug]/page.tsx`, `/dang-tin/page.tsx` | Khối tiện ích (Amenities) bị biến mất; thiếu các trường phí xe máy, internet, dịch vụ, nội thất, thú cưng, ngày dọn vào | Khôi phục khối 14 tiện ích; bổ sung toàn bộ các trường chi phí phụ trợ, nội thất, thú cưng, ngày dọn vào ở cả form đăng tin và trang chi tiết |
| **70** | 🟠 Quan trọng | `/gioi-thieu/page.tsx` | Trang giới thiệu còn chung chung, chưa định vị rõ vai trò Chuyên viên Nguyễn Đức Quân và Cam kết 3 Không | Viết lại trang `/gioi-thieu` định vị Quân làm đầu mối duy nhất, 0đ phí khách thuê, bảo mật số chủ nhà, thông tin liên hệ chuẩn từ `SITE_CONFIG` |
| **71** | 🟡 Trung bình | `apps/web/src/app/admin/layout.tsx` | Menu quản trị còn sót 2 mục của mô hình membership cũ (`/admin/duyet-goi`, `/admin/mua-cao-diem`) | Xóa 2 menu cũ, đưa menu Lead Queue (`/admin/leads`) lên vị trí ưu tiên cao |
| **72** | 🟡 Trung bình | `/tai-khoan/quan-ly-tin/page.tsx` | Chủ nhà không biết lý do tại sao tin bị từ chối duyệt | Bổ sung banner thông báo từ chối kèm `rejectionReason` cụ thể và hướng dẫn hỗ trợ |
| **73** | 🟡 Trung bình | `Header.tsx`, `Footer.tsx` | Header desktop thiếu liên kết tới Biểu phí chủ nhà và Giới thiệu chuyên viên; dropdown thiếu link Quản lý lead | Thêm Desktop nav links (`Tìm phòng thuê`, `Biểu phí chủ nhà`, `Về chuyên viên`, `Liên hệ`), thêm `/tai-khoan/leads` vào menu cá nhân |
| **74** | 🟢 Nhỏ | `MembershipPricingClient.tsx`, `test-wave-1.js` | File dead code của gói membership cũ; kịch bản test thiếu mock cho các model nghiệp vụ mới | Xóa vĩnh viễn `MembershipPricingClient.tsx`; cập nhật mock getters cho `agentProfile`, `user`, `rentalRequest` trong `test-wave-1.js` |

---

## 5. BẰNG CHỨNG KIỂM ĐỊNH THỰC TẾ (VERIFICATION EVIDENCE)

1. **Kiểm thử nghiệm thu Lead Thật Wave 1 (`packages/database/scripts/test-wave-1.js`):**
   - **Kết quả:** `9 PASS, 0 FAIL` (100%).
   - Kiểm tra thành công: Lưu DB lead thật, Deduplication chống spam trong ngày, Từ chối tin hết hạn/không tồn tại, Seller chỉ thấy tin của mình, không còn chữ "Tin cậy 100%", tắt demo fallback khi production.
2. **Kiểm thử Công thức Hoa hồng V2 (`packages/database/scripts/test-fee-v2.js`):**
   - **Kết quả:** `14/14 TESTS PASS` (100%).
   - Kiểm tra đầy đủ: Tính phí theo giá thuê bình quân (FEE-01..FEE-04), validation hợp đồng (FEE-05..FEE-06), làm tròn half-up (FEE-07), idempotent (FEE-08..FEE-09), hợp đồng cọc/thử việc không sinh phí (FEE-10), miễn phí hợp đồng (FEE-11), bảo vệ vết điều chỉnh (FEE-12..FEE-14).
3. **TypeScript Typecheck Backend API (`apps/api`):**
   - Lệnh: `pnpm --filter api exec tsc --noEmit`
   - **Kết quả:** `Exit code 0, hoàn toàn sạch lỗi (0 errors)`.
4. **Quy chuẩn Văn phong & Giao diện (GEMINI.md § 8):**
   - Toàn bộ nội dung giao diện mới (tiêu đề, nhãn nút bấm, thẻ meta, alert) đều tuân thủ nghiêm ngặt quy tắc **không có dấu chấm ở cuối câu**.
   - Hotline và thông tin liên hệ được tham chiếu chuẩn xác: `0981 753 082`, `ducquan16102006@gmail.com`, `Ngõ 622, Minh Khai, Phường Vĩnh Tuy, Hà Nội`.
