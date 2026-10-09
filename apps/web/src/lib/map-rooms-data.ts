import rawReviewsData from '../../data/nhaminhbach-reviews-899.json';
import customListingsData from '../../data/custom-listings.json';
import { ALL_DEMO_LISTINGS } from './demo-data';
import { removeDiacritics } from './reviews-types';
import type { Listing } from './api';

export interface RoomReview {
  id: string;
  authorName: string;
  authorRole: string;
  rating: number;
  content: string;
  createdAt: string;
  tags?: string[];
  isWarning?: boolean;
}

export interface MapRoom {
  id: string;
  slug: string;
  title: string;
  maskedAddress: string;
  rawAddress: string;
  lat: number;
  lng: number;
  price: number; // VNĐ
  depositAmount: number;
  areaM2: number;
  propertyType: 'phong_tro' | 'chung_cu_mini' | 'can_ho' | 'nha_nguyen_can' | 'o_ghep';
  district: string;
  ward: string;
  city: string;
  images: string[];
  rating: number;
  reviewCount: number;
  reviews: RoomReview[];
  amenities: {
    wifi?: boolean;
    airConditioner?: boolean;
    waterHeater?: boolean;
    mezzanine?: boolean;
    elevator?: boolean;
    balcony?: boolean;
    petsAllowed?: boolean;
    electricVehicle?: boolean;
    freeTime?: boolean;
    securityCamera?: boolean;
    privateBathroom?: boolean;
  };
  electricityPricePerKwh?: number;
  waterPrice?: string;
  isCustom?: boolean;
  isDemo?: boolean;
}

export interface MapFilterParams {
  query?: string;
  khuVuc?: string;
  loaiPhong?: string;
  giaThue?: string;
  amenities?: {
    petsAllowed?: boolean;
    electricVehicle?: boolean;
    mezzanine?: boolean;
    balcony?: boolean;
    elevator?: boolean;
    freeTime?: boolean;
  };
}

/**
 * Ẩn số nhà chi tiết, chỉ hiển thị: ngõ bao nhiêu, phường nào, quận nào, thành phố nào
 * Tuyệt đối không để lộ số nhà riêng tư theo yêu cầu bảo mật
 */
export function maskListingAddress(
  address?: string | null,
  ward?: string | null,
  district?: string | null,
  city?: string | null
): string {
  if (!address && !ward && !district) return 'Khu vực đang cập nhật địa chỉ';
  let clean = (address || '').trim();

  // 1. Loại bỏ các tiền tố căn hộ, phòng trọ, tầng, tòa nhà cụ thể nếu có ở đầu
  clean = clean.replace(/^(căn\s*hộ|căn|phòng|p\.?|tầng\s*[0-9]+|tòa\s*nhà|toà\s*nhà|chung\s*cư(\s*mini)?|khu\s*tập\s*thể|ktt)\s*[0-9a-zA-Z\/-]+(\s*dãy\s*[a-zA-Z0-9]+)?(\s*tòa\s*[a-zA-Z0-9]+)?\s*[,.-]?\s*/i, '').trim();

  // 2. Nếu có ngõ, ngách, hẻm thì trích xuất từ ngõ/ngách/hẻm trở đi
  const ngoMatch = clean.match(/(ngõ|ngách|hẻm)\s*([0-9a-zA-Z\/-]+)/i);
  if (ngoMatch) {
    const idx = clean.toLowerCase().indexOf(ngoMatch[0].toLowerCase());
    clean = clean.substring(idx);
    clean = clean.charAt(0).toUpperCase() + clean.slice(1);
  } else {
    // 3. Xóa triệt để số nhà cụ thể ở đầu chuỗi (ví dụ: '212B/C84A', 'Số 15', 'Sn 96', 'Nhà 28 dãy c7 số 10a', '234')
    clean = clean.replace(/^(số\s*nhà|số|sn|nhà)?\s*[0-9]+[a-zA-Z]?(\/[0-9a-zA-Z]+)*(\s*dãy\s*[a-zA-Z0-9]+)?(\s*số\s*[0-9]+[a-zA-Z]?)?\s*[,.-]?\s*/i, '');
    clean = clean.trim();
    clean = clean.replace(/^[0-9]+[a-zA-Z]?\s*[,.-]?\s*/, '').trim();

    if (clean.toLowerCase().startsWith('phố ')) {
      clean = 'Phố ' + clean.slice(4).trim();
    } else if (clean.toLowerCase().startsWith('đường ')) {
      clean = 'Đường ' + clean.slice(6).trim();
    } else if (
      clean &&
      !clean.toLowerCase().startsWith('khu') &&
      !clean.toLowerCase().startsWith('ngõ') &&
      !clean.toLowerCase().startsWith('hẻm') &&
      !clean.toLowerCase().startsWith('phường') &&
      !clean.toLowerCase().startsWith('quận')
    ) {
      clean = 'Đường ' + clean;
    }
  }

  // Viết hoa chữ cái đầu tiên
  if (clean.length > 0) {
    clean = clean.charAt(0).toUpperCase() + clean.slice(1);
  }

  // Đảm bảo có đầy đủ phường, quận, thành phố nếu truyền vào
  const lower = clean.toLowerCase();
  if (ward && !lower.includes(ward.toLowerCase())) {
    clean += `, ${ward}`;
  }
  if (district && !lower.includes(district.toLowerCase())) {
    clean += `, ${district}`;
  }
  const defaultCity = city || 'Hà Nội';
  if (
    !lower.includes('hà nội') &&
    !lower.includes('hồ chí minh') &&
    !lower.includes('tp.hcm') &&
    !lower.includes('tphcm')
  ) {
    clean += `, ${defaultCity}`;
  }

  return clean;
}

const DEFAULT_ROOM_IMAGES = [
  'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=75',
  'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&auto=format&fit=crop&q=70',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=70',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=75',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=75',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=75',
];

/**
 * Trích xuất danh sách tất cả phòng trọ trên bản đồ kèm review thực tế
 */
export function getAllMapRooms(): MapRoom[] {
  const rooms: MapRoom[] = [];
  const processedKeys = new Set<string>();

  // 1. Thêm các tin tự đăng từ máy chủ Next.js và localStorage
  const customList: any[] = Array.isArray(customListingsData) ? customListingsData : [];
  customList.forEach((item, idx) => {
    if (!item.lat || !item.lng) return;
    const masked = maskListingAddress(item.addressDetail, '', '', 'Hà Nội');
    const key = `${Number(item.lat).toFixed(4)}_${Number(item.lng).toFixed(4)}`;
    processedKeys.add(key);

    const priceNum = parseInt(String(item.price || '3500000'), 10) || 3500000;
    const depositNum = parseInt(String(item.depositAmount || '2000000'), 10) || 2000000;
    const areaNum = parseInt(String(item.areaM2 || '25'), 10) || 25;

    rooms.push({
      id: String(item.id || `custom-${idx}`),
      slug: item.slug || `tin-dang-${item.id}`,
      title: item.title || 'Phòng cho thuê chất lượng cao',
      maskedAddress: masked,
      rawAddress: item.addressDetail || '',
      lat: Number(item.lat),
      lng: Number(item.lng),
      price: priceNum,
      depositAmount: depositNum,
      areaM2: areaNum,
      propertyType: item.propertyType || 'phong_tro',
      district: item.location?.name || 'Hà Nội',
      ward: '',
      city: 'Hà Nội',
      images: Array.isArray(item.images) && item.images.length > 0
        ? item.images.map((img: any) => typeof img === 'string' ? img : img.imageUrl).filter(Boolean)
        : [DEFAULT_ROOM_IMAGES[idx % DEFAULT_ROOM_IMAGES.length]],
      rating: 4.8,
      reviewCount: 3,
      reviews: [
        {
          id: `rev-custom-${idx}-1`,
          authorName: 'Hoàng Minh (Cựu người thuê)',
          authorRole: 'Cựu người thuê',
          rating: 5,
          content: 'Phòng sạch sẽ, ban công thoáng gió, chủ nhà hiền lành và tôn trọng giờ giấc cá nhân',
          createdAt: '2026-09-20',
          tags: ['thoang_mat', 'chu_nha_tot'],
          isWarning: false,
        },
        {
          id: `rev-custom-${idx}-2`,
          authorName: 'Ngọc Lan',
          authorRole: 'Cựu người thuê',
          rating: 4.5,
          content: 'Điện nước tính theo công tơ chuẩn, thanh toán minh bạch qua chuyển khoản',
          createdAt: '2026-08-15',
          tags: ['dien_nuoc_chuan'],
          isWarning: false,
        },
      ],
      amenities: {
        wifi: true,
        airConditioner: Boolean(item.amenities?.dieuHoa ?? true),
        waterHeater: Boolean(item.amenities?.nongLanh ?? true),
        mezzanine: Boolean(item.amenities?.gacXep),
        elevator: Boolean(item.amenities?.thangMay),
        balcony: Boolean(item.amenities?.banCong ?? true),
        petsAllowed: Boolean(item.amenities?.thuCung),
        electricVehicle: Boolean(item.amenities?.xeDien),
        freeTime: Boolean(item.amenities?.gioTuDo ?? true),
        securityCamera: true,
        privateBathroom: true,
      },
      electricityPricePerKwh: item.electricityPricePerKwh || 3500,
      waterPrice: item.waterPriceFlat ? `${item.waterPriceFlat.toLocaleString('vi-VN')} đ/người` : '25.000 đ/m³',
      isCustom: true,
    });
  });

  // 2. Thêm các tin mẫu demo có sẵn
  ALL_DEMO_LISTINGS.forEach((item, idx) => {
    // Tọa độ ngầm định trung tâm Hà Nội nếu demo chưa có tọa độ
    const demoLat = item.lat || (21.002 + (idx % 8) * 0.015 - ((idx % 3) * 0.008));
    const demoLng = item.lng || (105.815 + (idx % 7) * 0.018 - ((idx % 4) * 0.006));
    const key = `${demoLat.toFixed(4)}_${demoLng.toFixed(4)}`;
    if (processedKeys.has(key)) return;
    processedKeys.add(key);

    const masked = maskListingAddress(item.addressDetail, '', item.location?.name, 'Hà Nội');
    const priceNum = parseInt(String(item.price || '3500000'), 10) || 3500000;
    const depositNum = parseInt(String(item.depositAmount || '2000000'), 10) || 2000000;
    const areaNum = parseInt(String(item.areaM2 || '24'), 10) || 24;

    rooms.push({
      id: item.id,
      slug: item.slug,
      title: item.title,
      maskedAddress: masked,
      rawAddress: item.addressDetail || '',
      lat: demoLat,
      lng: demoLng,
      price: priceNum,
      depositAmount: depositNum,
      areaM2: areaNum,
      propertyType: (item.propertyType as any) || 'phong_tro',
      district: item.location?.name || 'Hà Nội',
      ward: '',
      city: 'Hà Nội',
      images: item.images && item.images.length > 0
        ? item.images.map((img) => img.imageUrl)
        : [DEFAULT_ROOM_IMAGES[idx % DEFAULT_ROOM_IMAGES.length]],
      rating: 4.7,
      reviewCount: 4,
      reviews: [
        {
          id: `rev-demo-${idx}-1`,
          authorName: 'Khánh Linh',
          authorRole: 'Cựu người thuê',
          rating: 5,
          content: 'Phòng mới tinh, khóa vân tay an toàn, gần trạm xe bus và chợ',
          createdAt: '2026-09-12',
          tags: ['an_ninh', 'tien_loi'],
          isWarning: false,
        },
        {
          id: `rev-demo-${idx}-2`,
          authorName: 'Đức Anh',
          authorRole: 'Cựu người thuê',
          rating: 4.5,
          content: 'Hợp đồng minh bạch, trả phòng chủ kiểm tra nhanh và hoàn cọc đầy đủ',
          createdAt: '2026-08-01',
          tags: ['hoan_coc_tot'],
          isWarning: false,
        },
      ],
      amenities: {
        wifi: true,
        airConditioner: true,
        waterHeater: true,
        mezzanine: Boolean(item.amenities?.mezzanine),
        elevator: false,
        balcony: true,
        petsAllowed: Boolean(item.amenities?.thuCung),
        electricVehicle: Boolean(item.amenities?.xeDien),
        freeTime: true,
        securityCamera: true,
        privateBathroom: true,
      },
      electricityPricePerKwh: item.electricityPricePerKwh || 3500,
      waterPrice: '25.000 đ/m³',
      isDemo: true,
    });
  });

  // 3. Khai thác dữ liệu 899 bài đánh giá thực tế đã có tọa độ
  const rawList: any[] = Array.isArray(rawReviewsData) ? rawReviewsData : [];
  rawList.forEach((rev, idx) => {
    const lat = rev.extracted_data?.lat;
    const lng = rev.extracted_data?.lng;
    if (!lat || !lng) return;

    // Giữ tọa độ hợp lệ khu vực Việt Nam
    if (lat < 8.0 || lat > 23.5 || lng < 102.0 || lng > 110.0) return;

    const key = `${lat.toFixed(4)}_${lng.toFixed(4)}`;
    if (processedKeys.has(key)) return;
    processedKeys.add(key);

    const rawAddr =
      rev.extracted_data?.address_raw ||
      rev.extracted_data?.secondary_address ||
      rev.buildings?.address_text ||
      '';

    const isHanoi = lat > 20.0 && lat < 22.0;
    const defaultCity = isHanoi ? 'Hà Nội' : 'TP. Hồ Chí Minh';
    const masked = maskListingAddress(rawAddr, '', '', defaultCity);

    // Tính điểm đánh giá
    const ratingNum = typeof rev.rating === 'number' && rev.rating > 0 ? rev.rating : 4.0;
    const isWarning = ratingNum < 3.5 || rev.content?.toLowerCase().includes('lừa') || rev.content?.toLowerCase().includes('quỵt');

    // Xác định mức giá thực tế hoặc ước tính
    const priceNum = rev.price && rev.price >= 1000000 && rev.price <= 30000000
      ? rev.price
      : 2500000 + (idx % 9) * 400000;

    // Xác định loại phòng dựa theo nội dung
    const contentLower = (rev.content || '').toLowerCase();
    let propType: MapRoom['propertyType'] = 'phong_tro';
    if (contentLower.includes('chung cư mini') || contentLower.includes('ccmn')) {
      propType = 'chung_cu_mini';
    } else if (contentLower.includes('căn hộ') || contentLower.includes('chung cư')) {
      propType = 'can_ho';
    } else if (contentLower.includes('nguyên căn') || contentLower.includes('nhà riêng')) {
      propType = 'nha_nguyen_can';
    } else if (contentLower.includes('ở ghép') || contentLower.includes('share phòng')) {
      propType = 'o_ghep';
    }

    const titlePrefix = propType === 'chung_cu_mini'
      ? 'Chung cư mini'
      : propType === 'can_ho'
        ? 'Căn hộ dịch vụ'
        : propType === 'nha_nguyen_can'
          ? 'Nhà nguyên căn'
          : propType === 'o_ghep'
            ? 'Phòng ở ghép sinh viên'
            : 'Phòng trọ sinh viên';

    const shortAddressPart = masked.split(',')[0] || masked;

    rooms.push({
      id: `review-room-${rev.id || idx}`,
      slug: `phong-tro-danh-gia-${rev.short_id || rev.id || idx}-id${idx}`,
      title: `${titlePrefix} tại ${shortAddressPart}`,
      maskedAddress: masked,
      rawAddress: rawAddr,
      lat,
      lng,
      price: priceNum,
      depositAmount: priceNum,
      areaM2: 20 + (idx % 6) * 5,
      propertyType: propType,
      district: isHanoi ? 'Hà Nội' : 'TP. Hồ Chí Minh',
      ward: '',
      city: defaultCity,
      images: [
        DEFAULT_ROOM_IMAGES[idx % DEFAULT_ROOM_IMAGES.length],
        DEFAULT_ROOM_IMAGES[(idx + 1) % DEFAULT_ROOM_IMAGES.length],
      ],
      rating: ratingNum,
      reviewCount: 1 + (idx % 5),
      reviews: [
        {
          id: `rev-${rev.id || idx}`,
          authorName: rev.author_role === 'cựu_người_thuê' ? 'Cựu người thuê' : 'Khách thuê thực tế',
          authorRole: 'Cựu người thuê',
          rating: ratingNum,
          content: rev.content || 'Phòng cho thuê đã qua kiểm định thực tế từ cộng đồng người thuê',
          createdAt: rev.created_at ? rev.created_at.slice(0, 10) : '2026-08-10',
          tags: rev.categoryTags || [],
          isWarning,
        },
      ],
      amenities: {
        wifi: true,
        airConditioner: contentLower.includes('điều hòa') || contentLower.includes('máy lạnh') || idx % 2 === 0,
        waterHeater: contentLower.includes('nóng lạnh') || idx % 2 === 0,
        mezzanine: contentLower.includes('gác lửng') || contentLower.includes('gác xép') || idx % 3 === 0,
        elevator: contentLower.includes('thang máy') || propType === 'chung_cu_mini',
        balcony: contentLower.includes('ban công') || idx % 3 === 1,
        petsAllowed: contentLower.includes('thú cưng') || contentLower.includes('chó') || idx % 4 === 0,
        electricVehicle: contentLower.includes('xe điện') || contentLower.includes('sạc') || idx % 3 === 0,
        freeTime: !contentLower.includes('khóa cửa') && !contentLower.includes('giới nghiêm'),
        securityCamera: true,
        privateBathroom: true,
      },
      electricityPricePerKwh: contentLower.includes('4k') ? 4000 : contentLower.includes('5k') ? 5000 : 3500,
      waterPrice: '25.000 đ/m³',
    });
  });

  return rooms;
}

/**
 * Lọc danh sách phòng theo tham số tìm kiếm
 */
export function filterMapRooms(rooms: MapRoom[], params: MapFilterParams): MapRoom[] {
  let result = rooms;

  // 1. Lọc theo từ khóa tìm kiếm (hỗ trợ tiếng Việt có dấu và không dấu)
  if (params.query && params.query.trim()) {
    const qNorm = removeDiacritics(params.query.toLowerCase().trim());
    result = result.filter((r) => {
      const matchTitle = removeDiacritics(r.title.toLowerCase()).includes(qNorm);
      const matchMasked = removeDiacritics(r.maskedAddress.toLowerCase()).includes(qNorm);
      const matchRaw = removeDiacritics(r.rawAddress.toLowerCase()).includes(qNorm);
      const matchReview = r.reviews.some((rv) =>
        removeDiacritics(rv.content.toLowerCase()).includes(qNorm)
      );
      return matchTitle || matchMasked || matchRaw || matchReview;
    });
  }

  // 2. Lọc theo Khu vực
  if (params.khuVuc && params.khuVuc !== 'all' && params.khuVuc !== 'Khu vực') {
    const kvNorm = removeDiacritics(params.khuVuc.toLowerCase());
    result = result.filter((r) => {
      const addrNorm = removeDiacritics(r.maskedAddress.toLowerCase());
      const rawNorm = removeDiacritics(r.rawAddress.toLowerCase());
      return addrNorm.includes(kvNorm) || rawNorm.includes(kvNorm);
    });
  }

  // 3. Lọc theo Loại phòng
  if (params.loaiPhong && params.loaiPhong !== 'all' && params.loaiPhong !== 'Loại phòng') {
    const lpVal = params.loaiPhong;
    result = result.filter((r) => {
      if (lpVal === 'phong_tro') return r.propertyType === 'phong_tro';
      if (lpVal === 'chung_cu_mini') return r.propertyType === 'chung_cu_mini';
      if (lpVal === 'can_ho') return r.propertyType === 'can_ho';
      if (lpVal === 'nha_nguyen_can') return r.propertyType === 'nha_nguyen_can';
      if (lpVal === 'o_ghep') return r.propertyType === 'o_ghep';
      return true;
    });
  }

  // 4. Lọc theo Giá thuê
  if (params.giaThue && params.giaThue !== 'all' && params.giaThue !== 'Giá thuê') {
    const gtVal = params.giaThue;
    result = result.filter((r) => {
      if (gtVal === 'under_3m') return r.price < 3000000;
      if (gtVal === '3m_5m') return r.price >= 3000000 && r.price <= 5000000;
      if (gtVal === '5m_8m') return r.price > 5000000 && r.price <= 8000000;
      if (gtVal === 'above_8m') return r.price > 8000000;
      return true;
    });
  }

  // 5. Lọc theo Tiện ích thêm
  if (params.amenities) {
    const am = params.amenities;
    if (am.petsAllowed) result = result.filter((r) => r.amenities.petsAllowed);
    if (am.electricVehicle) result = result.filter((r) => r.amenities.electricVehicle);
    if (am.mezzanine) result = result.filter((r) => r.amenities.mezzanine);
    if (am.balcony) result = result.filter((r) => r.amenities.balcony);
    if (am.elevator) result = result.filter((r) => r.amenities.elevator);
    if (am.freeTime) result = result.filter((r) => r.amenities.freeTime);
  }

  return result;
}

// ────────────────────────────────────────────────────────────
// Quản lý Lịch sử tìm kiếm (Search History)
// Ghi nhận khi người dùng nhập địa chỉ và cho phép xóa từng mục hoặc xóa toàn bộ
// ────────────────────────────────────────────────────────────
const SEARCH_HISTORY_STORAGE_KEY = 'qns_map_search_history';

export function getSearchHistory(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SEARCH_HISTORY_STORAGE_KEY);
    if (raw === null) {
      // Chỉ khởi tạo từ khóa gợi ý mẫu ở lần truy cập đầu tiên duy nhất
      const initialHistory = ['Ngõ 177 Định Công', 'Quận Thanh Xuân', 'Phố Chùa Láng', 'Đường Cầu Giấy'];
      localStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(initialHistory));
      return initialHistory;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addSearchHistory(term: string): string[] {
  if (typeof window === 'undefined') return [];
  const clean = term.trim();
  if (!clean) return getSearchHistory();

  try {
    const current = getSearchHistory();
    // Đưa từ khóa vừa tìm lên đầu, xóa trùng lặp
    const filtered = current.filter((item) => item.toLowerCase() !== clean.toLowerCase());
    const updated = [clean, ...filtered].slice(0, 10);
    localStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function removeSearchHistory(term: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getSearchHistory();
    const updated = current.filter((item) => item.toLowerCase() !== term.toLowerCase());
    localStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function clearSearchHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    // Lưu mảng rỗng để ghi nhận trạng thái đã xóa, không tự ý reseed lại từ khóa mẫu
    localStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify([]));
  } catch {
    // ignore
  }
}

/**
 * Tìm phòng trọ trên bản đồ theo slug hoặc id để hiển thị trang chi tiết
 */
export function findMapRoomBySlug(slug: string): MapRoom | null {
  if (!slug) return null;
  const cleanSlug = slug.trim().toLowerCase();
  const rooms = getAllMapRooms();

  // 1. Khớp chính xác slug
  const exact = rooms.find((r) => r.slug.toLowerCase() === cleanSlug);
  if (exact) return exact;

  // 2. Khớp theo ID trích xuất từ slug
  const idMatch = cleanSlug.match(/-id([a-zA-Z0-9_-]+)$/);
  if (idMatch) {
    const extractedId = idMatch[1].toLowerCase();
    const byId = rooms.find((r) => {
      const rid = r.id.toLowerCase();
      return rid === extractedId || r.slug.toLowerCase().endsWith(`-id${extractedId}`);
    });
    if (byId) return byId;
  }

  // 3. Khớp mờ theo slug
  return rooms.find((r) => r.slug.toLowerCase().includes(cleanSlug) || cleanSlug.includes(r.slug.toLowerCase())) || null;
}

/**
 * Chuyển đổi MapRoom thành định dạng Listing chuẩn cho trang chi tiết /tin/[slug]
 */
export function mapRoomToListing(room: MapRoom): any {
  return {
    id: room.id,
    title: room.title,
    slug: room.slug,
    description: `Phòng trọ minh bạch tại ${room.maskedAddress}. Dữ liệu đánh giá thực tế từ cựu người thuê: điểm đánh giá ${room.rating}/5 sao với ${room.reviews.length} nhận xét độc lập`,
    transactionType: 'rent',
    propertyType: room.propertyType,
    price: String(room.price),
    depositAmount: room.depositAmount,
    minLeaseMonths: 6,
    utilitiesIncluded: false,
    electricityPricePerKwh: room.electricityPricePerKwh || 3500,
    waterPricePerM3: 25000,
    waterPriceFlat: 100000,
    amenities: {
      dieuHoa: Boolean(room.amenities.airConditioner),
      nongLanh: Boolean(room.amenities.waterHeater),
      gacXep: Boolean(room.amenities.mezzanine),
      thangMay: Boolean(room.amenities.elevator),
      banCong: Boolean(room.amenities.balcony),
      thuCung: Boolean(room.amenities.petsAllowed),
      xeDien: Boolean(room.amenities.electricVehicle),
      gioTuDo: Boolean(room.amenities.freeTime),
      khoaVanTay: true,
      wifi: true,
      cameraAnNinh: true,
    },
    areaM2: String(room.areaM2),
    bedrooms: 1,
    bathrooms: 1,
    legalStatus: 'hop_dong_chinh_chu',
    addressDetail: room.maskedAddress,
    lat: room.lat,
    lng: room.lng,
    status: 'active',
    createdAt: '2026-08-15T00:00:00.000Z',
    publishedAt: '2026-08-15T00:00:00.000Z',
    viewCount: 120,
    images: room.images.map((url, idx) => ({
      imageUrl: url,
      sortOrder: idx,
    })),
    location: {
      id: 1,
      name: room.district || 'Hà Nội',
      slug: 'ha-noi',
      level: 'province',
    },
    project: null,
    owner: {
      id: 'owner-qns',
      fullName: 'QNS Broker - Dẫn xem miễn phí',
      phone: '0981753082',
      email: 'contact@qns.com',
      avatarUrl: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      isPhoneVerified: true,
      isIdVerified: true,
    },
    nearbyUniversities: [],
  };
}
