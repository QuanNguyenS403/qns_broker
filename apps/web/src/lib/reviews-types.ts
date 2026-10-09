// Định nghĩa kiểu dữ liệu và tiện ích dùng chung cho đánh giá phòng trọ

export interface ReviewItem {
  id: string;
  short_id: string;
  building_id: string | null;
  content: string;
  rating: number;
  price: number | null;
  created_at: string;
  published_at?: string;
  post_type: string;
  author_role: string;
  source_type: string;
  source_url?: string | null;
  target_phone?: string | null;
  target_brand?: string | null;
  media?: string[];
  media_manifest?: Array<{ type: string; url: string; caption?: string }>;
  extracted_data?: {
    lat?: number;
    lng?: number;
    address_raw?: string;
    secondary_address?: string;
    landlord_name?: string;
  };
  buildings?: {
    nmb_id?: string;
    ward_code?: string;
    street_text?: string;
    address_text?: string;
    house_number?: string;
  } | null;
  // Các trường tính toán mở rộng
  categoryTags?: string[];
  detectedCity?: 'hanoi' | 'hcm' | 'other';
  displayAddress?: string;
}

export interface TransparencyStats {
  totalReviews: number;
  badReviewsCount: number;
  badReviewsPercent: number;
  goodReviewsCount: number;
  goodReviewsPercent: number;
  neutralReviewsCount: number;
  avgRating: number;
  categoriesBreakdown: {
    electricWater: { count: number; percent: number; label: string; description: string };
    depositTrap: { count: number; percent: number; label: string; description: string };
    catfishingMedia: { count: number; percent: number; label: string; description: string };
    privacyViolation: { count: number; percent: number; label: string; description: string };
    badInfrastructure: { count: number; percent: number; label: string; description: string };
  };
  cityBreakdown: {
    hanoi: number;
    hcm: number;
    other: number;
  };
}

export interface BlacklistCheckResult {
  keyword: string;
  status: 'DANGER' | 'WARNING' | 'CLEAN';
  matchedCount: number;
  severityLabel: string;
  summary: string;
  recommendation: string;
  matchedReviews: ReviewItem[];
}

export interface SearchReviewsParams {
  query?: string;
  city?: 'all' | 'hanoi' | 'hcm';
  ratingFilter?: 'all' | 'bad' | 'good' | '1' | '2' | '3' | '4' | '5';
  categoryFilter?: 'all' | 'dien_nuoc' | 'coc_tien' | 'anh_ao' | 'soi_cam' | 'ha_tang' | 'tro_tot';
  page?: number;
  limit?: number;
}

// Hàm chuẩn hóa chuỗi tiếng Việt không dấu để tìm kiếm không phụ thuộc dấu
export function removeDiacritics(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}
