import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchListings } from '@/lib/api';
import { ListingCard } from '@/components/ListingCard';
import { Pagination } from '@/components/Pagination';
import {
  SearchFilterBar,
  PROPERTY_TYPES_CAN_HO,
  PROPERTY_TYPES_STUDIO,
} from '@/components/SearchFilterBar';
import {
  ALL_DEMO_LISTINGS,
  DEMO_CAN_HO_RENT_LISTINGS,
  DEMO_ROOM_RENT_LISTINGS,
  DEMO_STUDIO_RENT_LISTINGS,
  DEMO_SPACE_RENT_LISTINGS,
} from '@/lib/demo-data';

export const metadata: Metadata = {
  title: 'Cho thuê Căn hộ, Studio & Phòng trọ giá tốt — QNS BROKER',
  description:
    'Danh sách tin cho thuê căn hộ, studio và phòng trọ minh bạch chi phí mới nhất, chuyên viên Đức Quân trực tiếp tư vấn và dẫn xem tận nơi miễn phí',
};

const CATEGORY_NAMES: Record<string, string> = {
  thue_can_ho: 'Căn hộ',
  thue_studio: 'Studio',
  thue_tro: 'Phòng trọ sinh viên',
  thue_bds: 'Căn hộ',
  thue_mat_bang: 'Mặt bằng kinh doanh',
};

interface Props {
  searchParams: { [key: string]: string | undefined };
}

export default async function ThuePage({ searchParams }: Props) {
  const isStudio = searchParams.categoryGroup === 'thue_studio';
  const isTro = searchParams.categoryGroup === 'thue_tro';
  const isMatBang = searchParams.categoryGroup === 'thue_mat_bang';
  const isCanHo = searchParams.categoryGroup === 'thue_can_ho';

  // Lựa chọn bộ lọc loại phòng chuyên biệt theo từng mục (nếu có chọn chuyên mục cụ thể)
  const propertyTypesForCategory = isStudio
    ? PROPERTY_TYPES_STUDIO
    : isCanHo
      ? PROPERTY_TYPES_CAN_HO
      : undefined;

  // Dữ liệu fallback chuẩn phân tách đúng theo từng mục
  const fallbackListings = isStudio
    ? DEMO_STUDIO_RENT_LISTINGS
    : isCanHo
      ? DEMO_CAN_HO_RENT_LISTINGS
      : isTro
        ? DEMO_ROOM_RENT_LISTINGS
        : isMatBang
          ? DEMO_SPACE_RENT_LISTINGS
          : ALL_DEMO_LISTINGS;

  // FE-03: Route tổng /thue mặc định hiển thị TẤT CẢ loại phòng cho thuê, không ép thành thue_can_ho
  const currentCategoryGroup = searchParams.categoryGroup;
  const isProduction = process.env.NODE_ENV === 'production';
  let isApiError = false;

  const { items, pagination } = await fetchListings({
    transactionType: 'rent',
    categoryGroup: currentCategoryGroup,
    keyword: searchParams.keyword,
    locationSlug: searchParams.locationSlug,
    universitySlug: searchParams.universitySlug,
    propertyType: searchParams.propertyType,
    utilitiesIncluded: searchParams.utilitiesIncluded,
    priceMin: searchParams.priceMin,
    priceMax: searchParams.priceMax,
    areaMin: searchParams.areaMin,
    areaMax: searchParams.areaMax,
    lat: searchParams.lat,
    lng: searchParams.lng,
    page: searchParams.page ?? '1',
  }).catch(() => {
    isApiError = true;
    return {
      items: isProduction ? [] : fallbackListings,
      pagination: {
        page: 1,
        pageSize: 20,
        total: isProduction ? 0 : fallbackListings.length,
        totalPages: isProduction ? 0 : 1,
      },
    };
  });

  const month = new Date().toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
  const categoryLabel = searchParams.categoryGroup
    ? (CATEGORY_NAMES[searchParams.categoryGroup] ?? 'bất động sản')
    : 'Bất động sản';
  const pageTitle = searchParams.categoryGroup ? `Cho thuê ${categoryLabel}` : 'Cho thuê Bất động sản';

  const filterSummary = searchParams.keyword
    ? ` — "${searchParams.keyword}"`
    : searchParams.universitySlug
      ? ` — Gần ${searchParams.universitySlug.replace(/-/g, ' ').toUpperCase()}`
      : '';

  return (
    <div className="min-h-screen bg-surface-muted">
      <div className="container-max py-8">
        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-2 text-xs text-text-muted">
          <Link href="/" className="hover:text-brand transition-colors">Trang chủ</Link>
          <span>›</span>
          <span className="text-text-secondary font-medium">Cho thuê {categoryLabel}</span>
        </nav>

        <h1 className="text-2xl font-bold text-text-primary md:text-3xl">
          {pageTitle}{filterSummary} mới nhất {month}
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          {isApiError ? (
            <span className="text-amber-700 font-medium">Hệ thống đang kết nối lại dữ liệu</span>
          ) : (
            `${pagination.total.toLocaleString('vi-VN')} tin cho thuê ${categoryLabel.toLowerCase()} phù hợp`
          )}
        </p>

        <div className="mt-5">
          <SearchFilterBar
            basePath="/thue"
            propertyTypes={propertyTypesForCategory}
            initialParams={{
              ...searchParams,
              categoryGroup: currentCategoryGroup,
            }}
          />
        </div>

        {isApiError ? (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/70 p-10 text-center">
            <span className="text-4xl">⚠️</span>
            <p className="mt-3 font-semibold text-amber-900 text-base">Kết nối máy chủ dữ liệu đang được đồng bộ lại</p>
            <p className="mt-1 text-xs text-amber-700 max-w-md mx-auto">
              Hệ thống đang kết nối tới kho dữ liệu phòng, vui lòng tải lại trang sau ít giây để cập nhật danh sách mới nhất
            </p>
            <Link
              href={currentCategoryGroup ? `/thue?categoryGroup=${currentCategoryGroup}` : '/thue'}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-xs font-semibold text-white hover:bg-brand-600 transition-colors shadow-sm"
            >
              🔄 Tải lại danh sách
            </Link>
          </div>
        ) : items.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-surface-border bg-white p-10 text-center">
            <span className="text-4xl">🔍</span>
            <p className="mt-3 font-semibold text-text-primary">Không tìm thấy tin cho thuê phù hợp</p>
            <p className="mt-1 text-sm text-text-secondary">
              Thử điều chỉnh bộ lọc giá, trường đại học hoặc tìm kiếm với từ khoá khác
            </p>
          </div>
        ) : (
          <>
            <div className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              basePath="/thue"
              searchParams={searchParams}
            />
          </>
        )}
      </div>
    </div>
  );
}
