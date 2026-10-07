/**
 * Danh sách toàn bộ các phường (và thị trấn trung tâm) thuộc thành phố Hà Nội
 * Phân nhóm theo từng Quận / Thị xã / Huyện để phục vụ bộ lọc tìm kiếm khu vực
 */

export interface HanoiWard {
  name: string; // e.g. "Phường Dịch Vọng Hậu"
  shortName: string; // e.g. "Dịch Vọng Hậu"
  slug: string; // e.g. "dich-vong-hau"
  district: string; // e.g. "Quận Cầu Giấy"
  districtSlug: string; // e.g. "cau-giay"
}

export interface HanoiDistrictGroup {
  district: string;
  districtSlug: string;
  wards: HanoiWard[];
}

export const HANOI_DISTRICT_GROUPS: HanoiDistrictGroup[] = [
  {
    district: 'Quận Cầu Giấy',
    districtSlug: 'cau-giay',
    wards: [
      { name: 'Phường Dịch Vọng', shortName: 'Dịch Vọng', slug: 'dich-vong', district: 'Quận Cầu Giấy', districtSlug: 'cau-giay' },
      { name: 'Phường Dịch Vọng Hậu', shortName: 'Dịch Vọng Hậu', slug: 'dich-vong-hau', district: 'Quận Cầu Giấy', districtSlug: 'cau-giay' },
      { name: 'Phường Mai Dịch', shortName: 'Mai Dịch', slug: 'mai-dich', district: 'Quận Cầu Giấy', districtSlug: 'cau-giay' },
      { name: 'Phường Nghĩa Đô', shortName: 'Nghĩa Đô', slug: 'nghia-do', district: 'Quận Cầu Giấy', districtSlug: 'cau-giay' },
      { name: 'Phường Nghĩa Tân', shortName: 'Nghĩa Tân', slug: 'nghia-tan', district: 'Quận Cầu Giấy', districtSlug: 'cau-giay' },
      { name: 'Phường Quan Hoa', shortName: 'Quan Hoa', slug: 'quan-hoa', district: 'Quận Cầu Giấy', districtSlug: 'cau-giay' },
      { name: 'Phường Trung Hòa', shortName: 'Trung Hòa', slug: 'trung-hoa', district: 'Quận Cầu Giấy', districtSlug: 'cau-giay' },
      { name: 'Phường Yên Hòa', shortName: 'Yên Hòa', slug: 'yen-hoa', district: 'Quận Cầu Giấy', districtSlug: 'cau-giay' },
    ],
  },
  {
    district: 'Quận Đống Đa',
    districtSlug: 'dong-da',
    wards: [
      { name: 'Phường Cát Linh', shortName: 'Cát Linh', slug: 'cat-linh', district: 'Quận Đống Đa', districtSlug: 'dong-da' },
      { name: 'Phường Hàng Bột', shortName: 'Hàng Bột', slug: 'hang-bot', district: 'Quận Đống Đa', districtSlug: 'dong-da' },
      { name: 'Phường Khâm Thiên', shortName: 'Khâm Thiên', slug: 'kham-thien', district: 'Quận Đống Đa', districtSlug: 'dong-da' },
      { name: 'Phường Khương Thượng', shortName: 'Khương Thượng', slug: 'khuong-thuong', district: 'Quận Đống Đa', districtSlug: 'dong-da' },
      { name: 'Phường Kim Liên', shortName: 'Kim Liên', slug: 'kim-lien', district: 'Quận Đống Đa', districtSlug: 'dong-da' },
      { name: 'Phường Láng Hạ', shortName: 'Láng Hạ', slug: 'lang-ha', district: 'Quận Đống Đa', districtSlug: 'dong-da' },
      { name: 'Phường Láng Thượng', shortName: 'Láng Thượng', slug: 'lang-thuong', district: 'Quận Đống Đa', districtSlug: 'dong-da' },
      { name: 'Phường Nam Đồng', shortName: 'Nam Đồng', slug: 'nam-dong', district: 'Quận Đống Đa', districtSlug: 'dong-da' },
      { name: 'Phường Ngã Tư Sở', shortName: 'Ngã Tư Sở', slug: 'nga-tu-so', district: 'Quận Đống Đa', districtSlug: 'dong-da' },
      { name: 'Phường Ô Chợ Dừa', shortName: 'Ô Chợ Dừa', slug: 'o-cho-dua', district: 'Quận Đống Đa', districtSlug: 'dong-da' },
      { name: 'Phường Phương Liên', shortName: 'Phương Liên', slug: 'phuong-lien', district: 'Quận Đống Đa', districtSlug: 'dong-da' },
      { name: 'Phường Phương Mai', shortName: 'Phương Mai', slug: 'phuong-mai', district: 'Quận Đống Đa', districtSlug: 'dong-da' },
      { name: 'Phường Quang Trung', shortName: 'Quang Trung', slug: 'quang-trung-dong-da', district: 'Quận Đống Đa', districtSlug: 'dong-da' },
      { name: 'Phường Quốc Tử Giám', shortName: 'Quốc Tử Giám', slug: 'quoc-tu-giam', district: 'Quận Đống Đa', districtSlug: 'dong-da' },
      { name: 'Phường Thịnh Quang', shortName: 'Thịnh Quang', slug: 'thinh-quang', district: 'Quận Đống Đa', districtSlug: 'dong-da' },
      { name: 'Phường Thổ Quan', shortName: 'Thổ Quan', slug: 'tho-quan', district: 'Quận Đống Đa', districtSlug: 'dong-da' },
      { name: 'Phường Trung Liệt', shortName: 'Trung Liệt', slug: 'trung-liet', district: 'Quận Đống Đa', districtSlug: 'dong-da' },
      { name: 'Phường Trung Phụng', shortName: 'Trung Phụng', slug: 'trung-phung', district: 'Quận Đống Đa', districtSlug: 'dong-da' },
      { name: 'Phường Trung Tự', shortName: 'Trung Tự', slug: 'trung-tu', district: 'Quận Đống Đa', districtSlug: 'dong-da' },
      { name: 'Phường Văn Chương', shortName: 'Văn Chương', slug: 'van-chuong', district: 'Quận Đống Đa', districtSlug: 'dong-da' },
      { name: 'Phường Văn Miếu', shortName: 'Văn Miếu', slug: 'van-mieu', district: 'Quận Đống Đa', districtSlug: 'dong-da' },
    ],
  },
  {
    district: 'Quận Thanh Xuân',
    districtSlug: 'thanh-xuan',
    wards: [
      { name: 'Phường Hạ Đình', shortName: 'Hạ Đình', slug: 'ha-dinh', district: 'Quận Thanh Xuân', districtSlug: 'thanh-xuan' },
      { name: 'Phường Khương Đình', shortName: 'Khương Đình', slug: 'khuong-dinh', district: 'Quận Thanh Xuân', districtSlug: 'thanh-xuan' },
      { name: 'Phường Khương Mai', shortName: 'Khương Mai', slug: 'khuong-mai', district: 'Quận Thanh Xuân', districtSlug: 'thanh-xuan' },
      { name: 'Phường Khương Trung', shortName: 'Khương Trung', slug: 'khuong-trung', district: 'Quận Thanh Xuân', districtSlug: 'thanh-xuan' },
      { name: 'Phường Kim Giang', shortName: 'Kim Giang', slug: 'kim-giang', district: 'Quận Thanh Xuân', districtSlug: 'thanh-xuan' },
      { name: 'Phường Nhân Chính', shortName: 'Nhân Chính', slug: 'nhan-chinh', district: 'Quận Thanh Xuân', districtSlug: 'thanh-xuan' },
      { name: 'Phường Phương Liệt', shortName: 'Phương Liệt', slug: 'phuong-liet', district: 'Quận Thanh Xuân', districtSlug: 'thanh-xuan' },
      { name: 'Phường Thanh Xuân Bắc', shortName: 'Thanh Xuân Bắc', slug: 'thanh-xuan-bac', district: 'Quận Thanh Xuân', districtSlug: 'thanh-xuan' },
      { name: 'Phường Thanh Xuân Nam', shortName: 'Thanh Xuân Nam', slug: 'thanh-xuan-nam', district: 'Quận Thanh Xuân', districtSlug: 'thanh-xuan' },
      { name: 'Phường Thanh Xuân Trung', shortName: 'Thanh Xuân Trung', slug: 'thanh-xuan-trung', district: 'Quận Thanh Xuân', districtSlug: 'thanh-xuan' },
      { name: 'Phường Thượng Đình', shortName: 'Thượng Đình', slug: 'thuong-dinh', district: 'Quận Thanh Xuân', districtSlug: 'thanh-xuan' },
    ],
  },
  {
    district: 'Quận Ba Đình',
    districtSlug: 'ba-dinh',
    wards: [
      { name: 'Phường Cống Vị', shortName: 'Cống Vị', slug: 'cong-vi', district: 'Quận Ba Đình', districtSlug: 'ba-dinh' },
      { name: 'Phường Điện Biên', shortName: 'Điện Biên', slug: 'dien-bien', district: 'Quận Ba Đình', districtSlug: 'ba-dinh' },
      { name: 'Phường Đội Cấn', shortName: 'Đội Cấn', slug: 'doi-can', district: 'Quận Ba Đình', districtSlug: 'ba-dinh' },
      { name: 'Phường Giảng Võ', shortName: 'Giảng Võ', slug: 'giang-vo', district: 'Quận Ba Đình', districtSlug: 'ba-dinh' },
      { name: 'Phường Kim Mã', shortName: 'Kim Mã', slug: 'kim-ma', district: 'Quận Ba Đình', districtSlug: 'ba-dinh' },
      { name: 'Phường Liễu Giai', shortName: 'Liễu Giai', slug: 'lieu-giai', district: 'Quận Ba Đình', districtSlug: 'ba-dinh' },
      { name: 'Phường Ngọc Hà', shortName: 'Ngọc Hà', slug: 'ngoc-ha', district: 'Quận Ba Đình', districtSlug: 'ba-dinh' },
      { name: 'Phường Ngọc Khánh', shortName: 'Ngọc Khánh', slug: 'ngoc-khanh', district: 'Quận Ba Đình', districtSlug: 'ba-dinh' },
      { name: 'Phường Nguyễn Trung Trực', shortName: 'Nguyễn Trung Trực', slug: 'nguyen-trung-truc', district: 'Quận Ba Đình', districtSlug: 'ba-dinh' },
      { name: 'Phường Phúc Xá', shortName: 'Phúc Xá', slug: 'phuc-xa', district: 'Quận Ba Đình', districtSlug: 'ba-dinh' },
      { name: 'Phường Quán Thánh', shortName: 'Quán Thánh', slug: 'quan-thanh', district: 'Quận Ba Đình', districtSlug: 'ba-dinh' },
      { name: 'Phường Thành Công', shortName: 'Thành Công', slug: 'thanh-cong', district: 'Quận Ba Đình', districtSlug: 'ba-dinh' },
      { name: 'Phường Trúc Bạch', shortName: 'Trúc Bạch', slug: 'truc-bach', district: 'Quận Ba Đình', districtSlug: 'ba-dinh' },
      { name: 'Phường Vĩnh Phúc', shortName: 'Vĩnh Phúc', slug: 'vinh-phuc', district: 'Quận Ba Đình', districtSlug: 'ba-dinh' },
    ],
  },
  {
    district: 'Quận Hai Bà Trưng',
    districtSlug: 'hai-ba-trung',
    wards: [
      { name: 'Phường Bạch Đằng', shortName: 'Bạch Đằng', slug: 'bach-dang', district: 'Quận Hai Bà Trưng', districtSlug: 'hai-ba-trung' },
      { name: 'Phường Bách Khoa', shortName: 'Bách Khoa', slug: 'bach-khoa', district: 'Quận Hai Bà Trưng', districtSlug: 'hai-ba-trung' },
      { name: 'Phường Bạch Mai', shortName: 'Bạch Mai', slug: 'bach-mai', district: 'Quận Hai Bà Trưng', districtSlug: 'hai-ba-trung' },
      { name: 'Phường Cầu Dền', shortName: 'Cầu Dền', slug: 'cau-den', district: 'Quận Hai Bà Trưng', districtSlug: 'hai-ba-trung' },
      { name: 'Phường Đống Mác', shortName: 'Đống Mác', slug: 'dong-mac', district: 'Quận Hai Bà Trưng', districtSlug: 'hai-ba-trung' },
      { name: 'Phường Đồng Nhân', shortName: 'Đồng Nhân', slug: 'dong-nhan', district: 'Quận Hai Bà Trưng', districtSlug: 'hai-ba-trung' },
      { name: 'Phường Đồng Tâm', shortName: 'Đồng Tâm', slug: 'dong-tam', district: 'Quận Hai Bà Trưng', districtSlug: 'hai-ba-trung' },
      { name: 'Phường Lê Đại Hành', shortName: 'Lê Đại Hành', slug: 'le-dai-hanh', district: 'Quận Hai Bà Trưng', districtSlug: 'hai-ba-trung' },
      { name: 'Phường Minh Khai', shortName: 'Minh Khai', slug: 'minh-khai-hbt', district: 'Quận Hai Bà Trưng', districtSlug: 'hai-ba-trung' },
      { name: 'Phường Nguyễn Du', shortName: 'Nguyễn Du', slug: 'nguyen-du', district: 'Quận Hai Bà Trưng', districtSlug: 'hai-ba-trung' },
      { name: 'Phường Phạm Đình Hổ', shortName: 'Phạm Đình Hổ', slug: 'pham-dinh-ho', district: 'Quận Hai Bà Trưng', districtSlug: 'hai-ba-trung' },
      { name: 'Phường Phố Huế', shortName: 'Phố Huế', slug: 'pho-hue', district: 'Quận Hai Bà Trưng', districtSlug: 'hai-ba-trung' },
      { name: 'Phường Quỳnh Lôi', shortName: 'Quỳnh Lôi', slug: 'quynh-loi', district: 'Quận Hai Bà Trưng', districtSlug: 'hai-ba-trung' },
      { name: 'Phường Quỳnh Mai', shortName: 'Quỳnh Mai', slug: 'quynh-mai', district: 'Quận Hai Bà Trưng', districtSlug: 'hai-ba-trung' },
      { name: 'Phường Thanh Lương', shortName: 'Thanh Lương', slug: 'thanh-luong', district: 'Quận Hai Bà Trưng', districtSlug: 'hai-ba-trung' },
      { name: 'Phường Thanh Nhàn', shortName: 'Thanh Nhàn', slug: 'thanh-nhan', district: 'Quận Hai Bà Trưng', districtSlug: 'hai-ba-trung' },
      { name: 'Phường Trương Định', shortName: 'Trương Định', slug: 'truong-dinh', district: 'Quận Hai Bà Trưng', districtSlug: 'hai-ba-trung' },
      { name: 'Phường Vĩnh Tuy', shortName: 'Vĩnh Tuy', slug: 'vinh-tuy', district: 'Quận Hai Bà Trưng', districtSlug: 'hai-ba-trung' },
    ],
  },
  {
    district: 'Quận Nam Từ Liêm',
    districtSlug: 'nam-tu-liem',
    wards: [
      { name: 'Phường Cầu Diễn', shortName: 'Cầu Diễn', slug: 'cau-dien', district: 'Quận Nam Từ Liêm', districtSlug: 'nam-tu-liem' },
      { name: 'Phường Đại Mỗ', shortName: 'Đại Mỗ', slug: 'dai-mo', district: 'Quận Nam Từ Liêm', districtSlug: 'nam-tu-liem' },
      { name: 'Phường Mễ Trì', shortName: 'Mễ Trì', slug: 'me-tri', district: 'Quận Nam Từ Liêm', districtSlug: 'nam-tu-liem' },
      { name: 'Phường Mỹ Đình 1', shortName: 'Mỹ Đình 1', slug: 'my-dinh-1', district: 'Quận Nam Từ Liêm', districtSlug: 'nam-tu-liem' },
      { name: 'Phường Mỹ Đình 2', shortName: 'Mỹ Đình 2', slug: 'my-dinh-2', district: 'Quận Nam Từ Liêm', districtSlug: 'nam-tu-liem' },
      { name: 'Phường Phú Đô', shortName: 'Phú Đô', slug: 'phu-do', district: 'Quận Nam Từ Liêm', districtSlug: 'nam-tu-liem' },
      { name: 'Phường Phương Canh', shortName: 'Phương Canh', slug: 'phuong-canh', district: 'Quận Nam Từ Liêm', districtSlug: 'nam-tu-liem' },
      { name: 'Phường Tây Mỗ', shortName: 'Tây Mỗ', slug: 'tay-mo', district: 'Quận Nam Từ Liêm', districtSlug: 'nam-tu-liem' },
      { name: 'Phường Trung Văn', shortName: 'Trung Văn', slug: 'trung-van', district: 'Quận Nam Từ Liêm', districtSlug: 'nam-tu-liem' },
      { name: 'Phường Xuân Phương', shortName: 'Xuân Phương', slug: 'xuan-phuong', district: 'Quận Nam Từ Liêm', districtSlug: 'nam-tu-liem' },
    ],
  },
  {
    district: 'Quận Bắc Từ Liêm',
    districtSlug: 'bac-tu-liem',
    wards: [
      { name: 'Phường Cổ Nhuế 1', shortName: 'Cổ Nhuế 1', slug: 'co-nhue-1', district: 'Quận Bắc Từ Liêm', districtSlug: 'bac-tu-liem' },
      { name: 'Phường Cổ Nhuế 2', shortName: 'Cổ Nhuế 2', slug: 'co-nhue-2', district: 'Quận Bắc Từ Liêm', districtSlug: 'bac-tu-liem' },
      { name: 'Phường Đông Ngạc', shortName: 'Đông Ngạc', slug: 'dong-ngac', district: 'Quận Bắc Từ Liêm', districtSlug: 'bac-tu-liem' },
      { name: 'Phường Đức Thắng', shortName: 'Đức Thắng', slug: 'duc-thang', district: 'Quận Bắc Từ Liêm', districtSlug: 'bac-tu-liem' },
      { name: 'Phường Liên Mạc', shortName: 'Liên Mạc', slug: 'lien-mac', district: 'Quận Bắc Từ Liêm', districtSlug: 'bac-tu-liem' },
      { name: 'Phường Minh Khai', shortName: 'Minh Khai', slug: 'minh-khai-btl', district: 'Quận Bắc Từ Liêm', districtSlug: 'bac-tu-liem' },
      { name: 'Phường Phú Diễn', shortName: 'Phú Diễn', slug: 'phu-dien', district: 'Quận Bắc Từ Liêm', districtSlug: 'bac-tu-liem' },
      { name: 'Phường Phúc Diễn', shortName: 'Phúc Diễn', slug: 'phuc-dien', district: 'Quận Bắc Từ Liêm', districtSlug: 'bac-tu-liem' },
      { name: 'Phường Tây Tựu', shortName: 'Tây Tựu', slug: 'tay-tuu', district: 'Quận Bắc Từ Liêm', districtSlug: 'bac-tu-liem' },
      { name: 'Phường Thượng Cát', shortName: 'Thượng Cát', slug: 'thuong-cat', district: 'Quận Bắc Từ Liêm', districtSlug: 'bac-tu-liem' },
      { name: 'Phường Thụy Phương', shortName: 'Thụy Phương', slug: 'thuy-phuong', district: 'Quận Bắc Từ Liêm', districtSlug: 'bac-tu-liem' },
      { name: 'Phường Xuân Đỉnh', shortName: 'Xuân Đỉnh', slug: 'xuan-dinh', district: 'Quận Bắc Từ Liêm', districtSlug: 'bac-tu-liem' },
      { name: 'Phường Xuân Tảo', shortName: 'Xuân Tảo', slug: 'xuan-tao', district: 'Quận Bắc Từ Liêm', districtSlug: 'bac-tu-liem' },
    ],
  },
  {
    district: 'Quận Hà Đông',
    districtSlug: 'ha-dong',
    wards: [
      { name: 'Phường Biên Giang', shortName: 'Biên Giang', slug: 'bien-giang', district: 'Quận Hà Đông', districtSlug: 'ha-dong' },
      { name: 'Phường Đồng Mai', shortName: 'Đồng Mai', slug: 'dong-mai', district: 'Quận Hà Đông', districtSlug: 'ha-dong' },
      { name: 'Phường Dương Nội', shortName: 'Dương Nội', slug: 'duong-noi', district: 'Quận Hà Đông', districtSlug: 'ha-dong' },
      { name: 'Phường Hà Cầu', shortName: 'Hà Cầu', slug: 'ha-cau', district: 'Quận Hà Đông', districtSlug: 'ha-dong' },
      { name: 'Phường Kiến Hưng', shortName: 'Kiến Hưng', slug: 'kien-hung', district: 'Quận Hà Đông', districtSlug: 'ha-dong' },
      { name: 'Phường La Khê', shortName: 'La Khê', slug: 'la-khe', district: 'Quận Hà Đông', districtSlug: 'ha-dong' },
      { name: 'Phường Mộ Lao', shortName: 'Mộ Lao', slug: 'mo-lao', district: 'Quận Hà Đông', districtSlug: 'ha-dong' },
      { name: 'Phường Nguyễn Trãi', shortName: 'Nguyễn Trãi', slug: 'nguyen-trai-ha-dong', district: 'Quận Hà Đông', districtSlug: 'ha-dong' },
      { name: 'Phường Phú La', shortName: 'Phú La', slug: 'phu-la', district: 'Quận Hà Đông', districtSlug: 'ha-dong' },
      { name: 'Phường Phú Lãm', shortName: 'Phú Lãm', slug: 'phu-lam', district: 'Quận Hà Đông', districtSlug: 'ha-dong' },
      { name: 'Phường Phú Lương', shortName: 'Phú Lương', slug: 'phu-luong', district: 'Quận Hà Đông', districtSlug: 'ha-dong' },
      { name: 'Phường Phúc La', shortName: 'Phúc La', slug: 'phuc-la', district: 'Quận Hà Đông', districtSlug: 'ha-dong' },
      { name: 'Phường Quang Trung', shortName: 'Quang Trung', slug: 'quang-trung-ha-dong', district: 'Quận Hà Đông', districtSlug: 'ha-dong' },
      { name: 'Phường Vạn Phúc', shortName: 'Vạn Phúc', slug: 'van-phuc', district: 'Quận Hà Đông', districtSlug: 'ha-dong' },
      { name: 'Phường Văn Quán', shortName: 'Văn Quán', slug: 'van-quan', district: 'Quận Hà Đông', districtSlug: 'ha-dong' },
      { name: 'Phường Yên Nghĩa', shortName: 'Yên Nghĩa', slug: 'yen-nghia', district: 'Quận Hà Đông', districtSlug: 'ha-dong' },
      { name: 'Phường Yết Kiêu', shortName: 'Yết Kiêu', slug: 'yet-kieu', district: 'Quận Hà Đông', districtSlug: 'ha-dong' },
    ],
  },
  {
    district: 'Quận Hoàng Mai',
    districtSlug: 'hoang-mai',
    wards: [
      { name: 'Phường Đại Kim', shortName: 'Đại Kim', slug: 'dai-kim', district: 'Quận Hoàng Mai', districtSlug: 'hoang-mai' },
      { name: 'Phường Định Công', shortName: 'Định Công', slug: 'dinh-cong', district: 'Quận Hoàng Mai', districtSlug: 'hoang-mai' },
      { name: 'Phường Giáp Bát', shortName: 'Giáp Bát', slug: 'giap-bat', district: 'Quận Hoàng Mai', districtSlug: 'hoang-mai' },
      { name: 'Phường Hoàng Liệt', shortName: 'Hoàng Liệt', slug: 'hoang-liet', district: 'Quận Hoàng Mai', districtSlug: 'hoang-mai' },
      { name: 'Phường Hoàng Văn Thụ', shortName: 'Hoàng Văn Thụ', slug: 'hoang-van-thu', district: 'Quận Hoàng Mai', districtSlug: 'hoang-mai' },
      { name: 'Phường Lĩnh Nam', shortName: 'Lĩnh Nam', slug: 'linh-nam', district: 'Quận Hoàng Mai', districtSlug: 'hoang-mai' },
      { name: 'Phường Mai Động', shortName: 'Mai Động', slug: 'mai-dong', district: 'Quận Hoàng Mai', districtSlug: 'hoang-mai' },
      { name: 'Phường Tân Mai', shortName: 'Tân Mai', slug: 'tan-mai', district: 'Quận Hoàng Mai', districtSlug: 'hoang-mai' },
      { name: 'Phường Thanh Trì', shortName: 'Thanh Trì', slug: 'thanh-tri-phuong', district: 'Quận Hoàng Mai', districtSlug: 'hoang-mai' },
      { name: 'Phường Thịnh Liệt', shortName: 'Thịnh Liệt', slug: 'thinh-liet', district: 'Quận Hoàng Mai', districtSlug: 'hoang-mai' },
      { name: 'Phường Trần Phú', shortName: 'Trần Phú', slug: 'tran-phu', district: 'Quận Hoàng Mai', districtSlug: 'hoang-mai' },
      { name: 'Phường Tương Mai', shortName: 'Tương Mai', slug: 'tuong-mai', district: 'Quận Hoàng Mai', districtSlug: 'hoang-mai' },
      { name: 'Phường Vĩnh Hưng', shortName: 'Vĩnh Hưng', slug: 'vinh-hung', district: 'Quận Hoàng Mai', districtSlug: 'hoang-mai' },
      { name: 'Phường Yên Sở', shortName: 'Yên Sở', slug: 'yen-so', district: 'Quận Hoàng Mai', districtSlug: 'hoang-mai' },
    ],
  },
  {
    district: 'Quận Tây Hồ',
    districtSlug: 'tay-ho',
    wards: [
      { name: 'Phường Bưởi', shortName: 'Bưởi', slug: 'buoi', district: 'Quận Tây Hồ', districtSlug: 'tay-ho' },
      { name: 'Phường Nhật Tân', shortName: 'Nhật Tân', slug: 'nhat-tan', district: 'Quận Tây Hồ', districtSlug: 'tay-ho' },
      { name: 'Phường Phú Thượng', shortName: 'Phú Thượng', slug: 'phu-thuong', district: 'Quận Tây Hồ', districtSlug: 'tay-ho' },
      { name: 'Phường Quảng An', shortName: 'Quảng An', slug: 'quang-an', district: 'Quận Tây Hồ', districtSlug: 'tay-ho' },
      { name: 'Phường Thụy Khuê', shortName: 'Thụy Khuê', slug: 'thuy-khue', district: 'Quận Tây Hồ', districtSlug: 'tay-ho' },
      { name: 'Phường Tứ Liên', shortName: 'Tứ Liên', slug: 'tu-lien', district: 'Quận Tây Hồ', districtSlug: 'tay-ho' },
      { name: 'Phường Xuân La', shortName: 'Xuân La', slug: 'xuan-la', district: 'Quận Tây Hồ', districtSlug: 'tay-ho' },
      { name: 'Phường Yên Phụ', shortName: 'Yên Phụ', slug: 'yen-phu', district: 'Quận Tây Hồ', districtSlug: 'tay-ho' },
    ],
  },
  {
    district: 'Quận Long Biên',
    districtSlug: 'long-bien',
    wards: [
      { name: 'Phường Bồ Đề', shortName: 'Bồ Đề', slug: 'bo-de', district: 'Quận Long Biên', districtSlug: 'long-bien' },
      { name: 'Phường Cự Khối', shortName: 'Cự Khối', slug: 'cu-khoi', district: 'Quận Long Biên', districtSlug: 'long-bien' },
      { name: 'Phường Đức Giang', shortName: 'Đức Giang', slug: 'duc-giang', district: 'Quận Long Biên', districtSlug: 'long-bien' },
      { name: 'Phường Gia Thụy', shortName: 'Gia Thụy', slug: 'gia-thuy', district: 'Quận Long Biên', districtSlug: 'long-bien' },
      { name: 'Phường Giang Biên', shortName: 'Giang Biên', slug: 'giang-bien', district: 'Quận Long Biên', districtSlug: 'long-bien' },
      { name: 'Phường Long Biên', shortName: 'Long Biên', slug: 'long-bien-phuong', district: 'Quận Long Biên', districtSlug: 'long-bien' },
      { name: 'Phường Ngọc Lâm', shortName: 'Ngọc Lâm', slug: 'ngoc-lam', district: 'Quận Long Biên', districtSlug: 'long-bien' },
      { name: 'Phường Ngọc Thụy', shortName: 'Ngọc Thụy', slug: 'ngoc-thuy', district: 'Quận Long Biên', districtSlug: 'long-bien' },
      { name: 'Phường Phúc Đồng', shortName: 'Phúc Đồng', slug: 'phuc-dong', district: 'Quận Long Biên', districtSlug: 'long-bien' },
      { name: 'Phường Phúc Lợi', shortName: 'Phúc Lợi', slug: 'phuc-loi', district: 'Quận Long Biên', districtSlug: 'long-bien' },
      { name: 'Phường Sài Đồng', shortName: 'Sài Đồng', slug: 'sai-dong', district: 'Quận Long Biên', districtSlug: 'long-bien' },
      { name: 'Phường Thạch Bàn', shortName: 'Thạch Bàn', slug: 'thach-ban', district: 'Quận Long Biên', districtSlug: 'long-bien' },
      { name: 'Phường Thượng Thanh', shortName: 'Thượng Thanh', slug: 'thuong-thanh', district: 'Quận Long Biên', districtSlug: 'long-bien' },
      { name: 'Phường Việt Hưng', shortName: 'Việt Hưng', slug: 'viet-hung', district: 'Quận Long Biên', districtSlug: 'long-bien' },
    ],
  },
  {
    district: 'Quận Hoàn Kiếm',
    districtSlug: 'hoan-kiem',
    wards: [
      { name: 'Phường Chương Dương', shortName: 'Chương Dương', slug: 'chuong-duong', district: 'Quận Hoàn Kiếm', districtSlug: 'hoan-kiem' },
      { name: 'Phường Cửa Đông', shortName: 'Cửa Đông', slug: 'cua-dong', district: 'Quận Hoàn Kiếm', districtSlug: 'hoan-kiem' },
      { name: 'Phường Cửa Nam', shortName: 'Cửa Nam', slug: 'cua-nam', district: 'Quận Hoàn Kiếm', districtSlug: 'hoan-kiem' },
      { name: 'Phường Đồng Xuân', shortName: 'Đồng Xuân', slug: 'dong-xuan', district: 'Quận Hoàn Kiếm', districtSlug: 'hoan-kiem' },
      { name: 'Phường Hàng Bạc', shortName: 'Hàng Bạc', slug: 'hang-bac', district: 'Quận Hoàn Kiếm', districtSlug: 'hoan-kiem' },
      { name: 'Phường Hàng Bài', shortName: 'Hàng Bài', slug: 'hang-bai', district: 'Quận Hoàn Kiếm', districtSlug: 'hoan-kiem' },
      { name: 'Phường Hàng Bồ', shortName: 'Hàng Bồ', slug: 'hang-bo', district: 'Quận Hoàn Kiếm', districtSlug: 'hoan-kiem' },
      { name: 'Phường Hàng Bông', shortName: 'Hàng Bông', slug: 'hang-bong', district: 'Quận Hoàn Kiếm', districtSlug: 'hoan-kiem' },
      { name: 'Phường Hàng Buồm', shortName: 'Hàng Buồm', slug: 'hang-buom', district: 'Quận Hoàn Kiếm', districtSlug: 'hoan-kiem' },
      { name: 'Phường Hàng Đào', shortName: 'Hàng Đào', slug: 'hang-dao', district: 'Quận Hoàn Kiếm', districtSlug: 'hoan-kiem' },
      { name: 'Phường Hàng Gai', shortName: 'Hàng Gai', slug: 'hang-gai', district: 'Quận Hoàn Kiếm', districtSlug: 'hoan-kiem' },
      { name: 'Phường Hàng Mã', shortName: 'Hàng Mã', slug: 'hang-ma', district: 'Quận Hoàn Kiếm', districtSlug: 'hoan-kiem' },
      { name: 'Phường Hàng Trống', shortName: 'Hàng Trống', slug: 'hang-trong', district: 'Quận Hoàn Kiếm', districtSlug: 'hoan-kiem' },
      { name: 'Phường Lý Thái Tổ', shortName: 'Lý Thái Tổ', slug: 'ly-thai-to', district: 'Quận Hoàn Kiếm', districtSlug: 'hoan-kiem' },
      { name: 'Phường Phan Chu Trinh', shortName: 'Phan Chu Trinh', slug: 'phan-chu-trinh', district: 'Quận Hoàn Kiếm', districtSlug: 'hoan-kiem' },
      { name: 'Phường Phúc Tân', shortName: 'Phúc Tân', slug: 'phuc-tan', district: 'Quận Hoàn Kiếm', districtSlug: 'hoan-kiem' },
      { name: 'Phường Tràng Tiền', shortName: 'Tràng Tiền', slug: 'trang-tien', district: 'Quận Hoàn Kiếm', districtSlug: 'hoan-kiem' },
      { name: 'Phường Trần Hưng Đạo', shortName: 'Trần Hưng Đạo', slug: 'tran-hung-dao', district: 'Quận Hoàn Kiếm', districtSlug: 'hoan-kiem' },
    ],
  },
  {
    district: 'Thị xã Sơn Tây',
    districtSlug: 'son-tay',
    wards: [
      { name: 'Phường Lê Lợi', shortName: 'Lê Lợi', slug: 'le-loi', district: 'Thị xã Sơn Tây', districtSlug: 'son-tay' },
      { name: 'Phường Ngô Quyền', shortName: 'Ngô Quyền', slug: 'ngo-quyen', district: 'Thị xã Sơn Tây', districtSlug: 'son-tay' },
      { name: 'Phường Phú Thịnh', shortName: 'Phú Thịnh', slug: 'phu-thinh', district: 'Thị xã Sơn Tây', districtSlug: 'son-tay' },
      { name: 'Phường Quang Trung', shortName: 'Quang Trung', slug: 'quang-trung-son-tay', district: 'Thị xã Sơn Tây', districtSlug: 'son-tay' },
      { name: 'Phường Sơn Lộc', shortName: 'Sơn Lộc', slug: 'son-loc', district: 'Thị xã Sơn Tây', districtSlug: 'son-tay' },
      { name: 'Phường Trung Hưng', shortName: 'Trung Hưng', slug: 'trung-hung', district: 'Thị xã Sơn Tây', districtSlug: 'son-tay' },
      { name: 'Phường Trung Sơn Trầm', shortName: 'Trung Sơn Trầm', slug: 'trung-son-tram', district: 'Thị xã Sơn Tây', districtSlug: 'son-tay' },
      { name: 'Phường Viên Sơn', shortName: 'Viên Sơn', slug: 'vien-son', district: 'Thị xã Sơn Tây', districtSlug: 'son-tay' },
      { name: 'Phường Xuân Khanh', shortName: 'Xuân Khanh', slug: 'xuan-khanh', district: 'Thị xã Sơn Tây', districtSlug: 'son-tay' },
    ],
  },
  {
    district: 'Huyện ngoại thành (Thị trấn)',
    districtSlug: 'ngoai-thanh',
    wards: [
      { name: 'TT. Trâu Quỳ (Gia Lâm)', shortName: 'Trâu Quỳ', slug: 'trau-quy', district: 'Huyện Gia Lâm', districtSlug: 'gia-lam' },
      { name: 'TT. Yên Viên (Gia Lâm)', shortName: 'Yên Viên', slug: 'yen-vien', district: 'Huyện Gia Lâm', districtSlug: 'gia-lam' },
      { name: 'TT. Đông Anh (Đông Anh)', shortName: 'Đông Anh', slug: 'dong-anh-tt', district: 'Huyện Đông Anh', districtSlug: 'dong-anh' },
      { name: 'TT. Văn Điển (Thanh Trì)', shortName: 'Văn Điển', slug: 'van-dien', district: 'Huyện Thanh Trì', districtSlug: 'thanh-tri' },
      { name: 'TT. Trạm Trôi (Hoài Đức)', shortName: 'Trạm Trôi', slug: 'tram-troi', district: 'Huyện Hoài Đức', districtSlug: 'hoai-duc' },
      { name: 'TT. Phùng (Đan Phượng)', shortName: 'Phùng', slug: 'phung', district: 'Huyện Đan Phượng', districtSlug: 'dan-phuong' },
      { name: 'TT. Chúc Sơn (Chương Mỹ)', shortName: 'Chúc Sơn', slug: 'chuc-son', district: 'Huyện Chương Mỹ', districtSlug: 'chuong-my' },
      { name: 'TT. Xuân Mai (Chương Mỹ)', shortName: 'Xuân Mai', slug: 'xuan-mai', district: 'Huyện Chương Mỹ', districtSlug: 'chuong-my' },
      { name: 'TT. Thường Tín (Thường Tín)', shortName: 'Thường Tín', slug: 'thuong-tin-tt', district: 'Huyện Thường Tín', districtSlug: 'thuong-tin' },
      { name: 'TT. Sóc Sơn (Sóc Sơn)', shortName: 'Sóc Sơn', slug: 'soc-son-tt', district: 'Huyện Sóc Sơn', districtSlug: 'soc-son' },
      { name: 'TT. Quốc Oai (Quốc Oai)', shortName: 'Quốc Oai', slug: 'quoc-oai-tt', district: 'Huyện Quốc Oai', districtSlug: 'quoc-oai' },
      { name: 'TT. Liên Quan (Thạch Thất)', shortName: 'Liên Quan', slug: 'lien-quan', district: 'Huyện Thạch Thất', districtSlug: 'thach-that' },
    ],
  },
];

export const ALL_HANOI_WARDS: HanoiWard[] = HANOI_DISTRICT_GROUPS.flatMap((g) => g.wards);

export function findHanoiWard(slugOrName: string): HanoiWard | undefined {
  if (!slugOrName) return undefined;
  const target = slugOrName.toLowerCase().trim();
  return ALL_HANOI_WARDS.find(
    (w) =>
      w.slug.toLowerCase() === target ||
      w.shortName.toLowerCase() === target ||
      w.name.toLowerCase() === target ||
      target.includes(w.shortName.toLowerCase()) ||
      target.includes(w.slug.toLowerCase())
  );
}
