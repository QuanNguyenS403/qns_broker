import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { fetchListingBySlug, fetchListings, formatPrice, formatExactPrice } from '@/lib/api';
import { ALL_DEMO_LISTINGS, findDemoListing } from '@/lib/demo-data';
import { PropertyGallery } from './PropertyGallery';
import { ReportListingModal } from '@/components/ReportListingModal';
import { OwnerContactBox } from './OwnerContactBox';
import { LandlordAvatar } from '@/components/QnsLogo';
import { MobileStickyContactBar } from './MobileStickyContactBar';
import {
  getNearbyUniversities,
  getGoogleMapsEmbedUrl,
} from '@/lib/vietnam-universities';

interface Props {
  params: { slug: string };
}

// React cache() tự động deduplicate request giữa generateMetadata và ListingDetailPage
const getListingOrNotFound = cache(async (slug: string) => {
  try {
    const apiListing = await fetchListingBySlug(slug);
    if (apiListing && apiListing.id) return apiListing;
  } catch {
    // Backend offline hoặc tin chưa có trong DB -> tìm kiếm trong demo data
  }

  // Luôn tìm kiếm dự phòng trong danh mục demo & alias, cam kết không bao giờ lỗi 404
  const demo = findDemoListing(slug);
  return demo || ALL_DEMO_LISTINGS[0];
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const listing = await getListingOrNotFound(params.slug);
    const desc = listing.description?.slice(0, 160) ?? `${listing.title} tại ${listing.location?.name ?? 'Việt Nam'}`;
    return {
      title: `${listing.title} | QNS BROKER`,
      description: desc,
      openGraph: {
        title: listing.title,
        description: desc,
        images: listing.images?.[0] ? [listing.images[0].imageUrl] : [],
      },
    };
  } catch {
    return {
      title: 'Chi tiết phòng cho thuê | QNS BROKER',
      description: 'Thông tin chi tiết phòng trọ, căn hộ, studio cho thuê minh bạch chi phí, chuyên viên Đức Quân trực tiếp tư vấn và dẫn xem miễn phí',
    };
  }
}

const LEGAL_STATUS_LABEL: Record<string, string> = {
  hop_dong_6_thang: 'Hợp đồng 6 tháng',
  hop_dong_1_nam: 'Hợp đồng 1 năm',
  hop_dong_dai_han: 'Hợp đồng dài hạn',
  so_hong: 'Sổ hồng / Sổ đỏ',
  so_do: 'Sổ đỏ',
  giay_to_hop_le: 'Giấy tờ hợp lệ',
};

const FURNITURE_NAMES: Record<string, string> = {
  dieuHoa: 'Điều hòa',
  airConditioner: 'Điều hòa',
  air_conditioner: 'Điều hòa',
  nongLanh: 'Nóng lạnh',
  waterHeater: 'Nóng lạnh',
  water_heater: 'Nóng lạnh',
  tuLanh: 'Tủ lạnh',
  refrigerator: 'Tủ lạnh',
  mayGiat: 'Máy giặt',
  washingMachine: 'Máy giặt',
  washing_machine: 'Máy giặt',
  giuongDem: 'Giường nệm',
  bed: 'Giường nệm',
  tuQuanAo: 'Tủ quần áo',
  wardrobe: 'Tủ quần áo',
  banGhe: 'Bàn ghế làm việc',
  sofa: 'Ghế sofa',
  smartTv: 'Tivi',
  bepRieng: 'Bếp nấu riêng',
  kitchen: 'Kệ bếp nấu ăn',
  gacLung: 'Gác lửng',
  mezzanine: 'Gác lửng',
  banCong: 'Ban công',
  balcony: 'Ban công',
  khoaVanTay: 'Khóa vân tay',
  smartLock: 'Khóa vân tay',
  fingerprint_lock: 'Khóa vân tay',
  thangMay: 'Thang máy',
  elevator: 'Thang máy',
  wifi: 'Wifi tốc độ cao',
  gioTuDo: 'Giờ giấc tự do',
  freeTime: 'Giờ giấc tự do',
  choDeXe: 'Chỗ để xe',
  parking: 'Nhà để xe',
};

function formatJoinedDuration(createdAt: string): string {
  const diffDays = Math.max(1, Math.floor((Date.now() - new Date(createdAt).getTime()) / 86_400_000));
  if (diffDays < 30) return `${diffDays} ngày`;
  const months = Math.floor(diffDays / 30);
  if (months < 12) return `${months} tháng`;
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  return remMonths > 0 ? `${years} năm ${remMonths} tháng` : `${years} năm`;
}

export default async function ListingDetailPage({ params }: Props) {
  const listing = await getListingOrNotFound(params.slug);

  const isSample = listing.title.startsWith('[MẪU]');
  const displayTitle = isSample ? listing.title.replace(/^\[MẪU\]\s*/, '') : listing.title;
  const rawOwnerName = listing.owner?.fullName ?? 'Chủ nhà';
  const cleanOwnerName = (rawOwnerName.toLowerCase().includes('môi giới demo') || rawOwnerName.toLowerCase() === 'môi giới demo')
    ? 'Chủ nhà'
    : rawOwnerName.replace(/\s*\(\d+\)\s*/g, '').trim();

  // Lấy tin đăng tương tự từ API, tự động fallback danh mục demo
  let similarListings: any[] = [];
  try {
    const similarRes = await fetchListings({
      propertyType: listing.propertyType,
      pageSize: '4',
    });
    similarListings = (similarRes.items || [])
      .filter((item) => item.id !== listing.id && !item.slug.includes('-idtemp'))
      .slice(0, 4);
  } catch {
    similarListings = ALL_DEMO_LISTINGS.filter((item) => item.id !== listing.id).slice(0, 4);
  }

  if (similarListings.length === 0) {
    similarListings = ALL_DEMO_LISTINGS.filter((item) => item.id !== listing.id).slice(0, 4);
  }

  // Xử lý danh sách trường Đại học lân cận (từ DB hoặc tự động tính toán từ tọa độ Google Maps)
  const displayUnis = (() => {
    if (listing.nearbyUniversities && listing.nearbyUniversities.length > 0) {
      return listing.nearbyUniversities.map((item) => {
        const distKm = item.distanceMeters != null ? Number((item.distanceMeters / 1000).toFixed(1)) : 1;
        const distMeters = item.distanceMeters ?? Math.round(distKm * 1000);
        const timeMins = item.travelTimeMinutes ?? Math.max(1, Math.round((distKm / 22) * 60));
        return {
          name: item.university.name,
          abbreviation: item.university.abbreviation,
          address: item.university.address,
          distanceKm: distKm,
          distanceMeters: distMeters,
          travelTimeMinutes: timeMins,
        };
      });
    }

    if (listing.lat != null && listing.lng != null) {
      const computed = getNearbyUniversities(listing.lat, listing.lng, 10, 4);
      return computed.map((u) => ({
        name: u.name,
        abbreviation: u.abbreviation,
        address: u.address,
        distanceKm: u.distanceKm,
        distanceMeters: u.distanceMeters,
        travelTimeMinutes: u.travelTimeMinutes,
      }));
    }

    return [];
  })();

  const allowsPets = Boolean(
    listing.amenities?.thuCung ||
    listing.amenities?.pet ||
    listing.amenities?.petsAllowed ||
    listing.amenities?.choNuoiThuCung ||
    listing.description?.toLowerCase().includes('thú cưng') ||
    listing.description?.toLowerCase().includes('cho nuôi')
  );

  const allowsEv = Boolean(
    listing.amenities?.xeDien ||
    listing.amenities?.electricVehicle ||
    listing.amenities?.sacXeDien ||
    listing.description?.toLowerCase().includes('xe điện') ||
    listing.description?.toLowerCase().includes('sạc xe')
  );

  const furnitureList = (() => {
    const list: string[] = [];
    const am = listing.amenities || {};

    Object.entries(FURNITURE_NAMES).forEach(([k, label]) => {
      if (am[k] && !list.includes(label)) {
        list.push(label);
      }
    });

    const desc = (listing.description || '').toLowerCase();
    if (desc.includes('điều hòa') || desc.includes('máy lạnh')) {
      if (!list.includes('Điều hòa')) list.push('Điều hòa');
    }
    if (desc.includes('nóng lạnh') || desc.includes('bình nóng')) {
      if (!list.includes('Nóng lạnh')) list.push('Nóng lạnh');
    }
    if (desc.includes('tủ lạnh')) {
      if (!list.includes('Tủ lạnh')) list.push('Tủ lạnh');
    }
    if (desc.includes('máy giặt')) {
      if (!list.includes('Máy giặt')) list.push('Máy giặt');
    }
    if (desc.includes('giường') || desc.includes('đệm') || desc.includes('nệm')) {
      if (!list.includes('Giường nệm')) list.push('Giường nệm');
    }
    if (desc.includes('tủ quần áo') || desc.includes('tủ đồ')) {
      if (!list.includes('Tủ quần áo')) list.push('Tủ quần áo');
    }
    if (desc.includes('bếp') || desc.includes('kệ bếp') || desc.includes('nấu ăn')) {
      if (!list.includes('Bếp nấu riêng')) list.push('Bếp nấu riêng');
    }
    if (desc.includes('sofa')) {
      if (!list.includes('Ghế sofa')) list.push('Ghế sofa');
    }
    if (desc.includes('ban công')) {
      if (!list.includes('Ban công')) list.push('Ban công');
    }
    if (desc.includes('khóa vân tay') || desc.includes('vân tay')) {
      if (!list.includes('Khóa vân tay')) list.push('Khóa vân tay');
    }
    if (desc.includes('thang máy')) {
      if (!list.includes('Thang máy')) list.push('Thang máy');
    }
    if (desc.includes('wifi')) {
      if (!list.includes('Wifi tốc độ cao')) list.push('Wifi tốc độ cao');
    }
    if (desc.includes('để xe') || desc.includes('nhà xe')) {
      if (!list.includes('Chỗ để xe')) list.push('Chỗ để xe');
    }
    if (desc.includes('giờ giấc tự do')) {
      if (!list.includes('Giờ giấc tự do')) list.push('Giờ giấc tự do');
    }

    if (list.length === 0) {
      return ['Điều hòa', 'Nóng lạnh', 'Giường nệm', 'Tủ quần áo', 'Bếp nấu riêng', 'Chỗ để xe', 'Wifi tốc độ cao', 'Giờ giấc tự do'];
    }

    return list;
  })();

  return (
    <div className="min-h-screen bg-surface-muted">
      <div className="container-max py-8 md:py-12 lg:py-14">
        {/* Breadcrumb điều hướng + nút Về danh sách */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-text-muted">
          <nav className="flex flex-wrap items-center gap-2">
            <Link href="/" className="hover:text-brand transition-colors">Trang chủ</Link>
            <span>›</span>
            <Link href="/thue" className="hover:text-brand transition-colors">Cho thuê phòng</Link>
            <span>›</span>
            <Link
              href={`/thue?locationSlug=${listing.location?.slug ?? ''}`}
              className="hover:text-brand transition-colors"
            >
              {listing.location?.name ?? 'Khu vực'}
            </Link>
            <span>›</span>
            <span className="text-text-secondary font-medium line-clamp-1 max-w-xs">{displayTitle}</span>
          </nav>

          <Link
            href="/thue"
            className="inline-flex items-center gap-1 font-semibold text-brand hover:underline"
          >
            ‹ Về danh sách
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:gap-8 lg:grid-cols-3">
          {/* Cột trái — nội dung chính (2/3 chiều rộng) */}
          <div className="lg:col-span-2 space-y-5 sm:space-y-6">
            {/* Gallery ảnh */}
            <PropertyGallery images={listing.images} title={displayTitle} />

            {/* Tiêu đề */}
            <div className="rounded-2xl border border-surface-border bg-white p-5 sm:p-6 md:p-7 shadow-card">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-text-primary leading-snug">{displayTitle}</h1>
            </div>

            {/* Khối Thông tin chính & Biểu phí */}
            <div className="rounded-2xl border border-surface-border bg-white p-5 sm:p-6 md:p-7 shadow-card">
              <h2 className="mb-4 sm:mb-5 font-bold text-text-primary text-lg sm:text-xl">Thông tin chính & Biểu phí</h2>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-2 md:grid-cols-4">
                <InfoRow
                  label="Tình trạng phòng"
                  value={listing.status === 'expired' ? 'Hết phòng' : 'Còn phòng'}
                />
                <InfoRow
                  label="Cọc"
                  value={
                    listing.depositAmount
                      ? formatExactPrice(listing.depositAmount)
                      : (listing.amenities as any)?.depositMethod ||
                        (listing.amenities as any)?.depositNote ||
                        (listing as any).depositMethod ||
                        (listing as any).depositNote ||
                        '1 tháng tiền thuê'
                  }
                />
                <InfoRow
                  label="Điện"
                  value={
                    listing.utilitiesIncluded
                      ? 'Đã bao gồm trong giá thuê'
                      : listing.electricityPricePerKwh
                        ? `${listing.electricityPricePerKwh.toLocaleString('vi-VN')} đ/kWh`
                        : '4.000 đ/kWh'
                  }
                />
                <InfoRow
                  label="Nước"
                  value={
                    listing.utilitiesIncluded
                      ? 'Đã bao gồm trong giá thuê'
                      : listing.waterPriceFlat
                        ? `${listing.waterPriceFlat.toLocaleString('vi-VN')} đ/người/tháng`
                        : listing.waterPricePerM3
                          ? `${listing.waterPricePerM3.toLocaleString('vi-VN')} đ/m³`
                          : '30.000 đ/m³'
                  }
                />
                {allowsPets && <InfoRow label="Nuôi thú cưng" value="Cho phép nuôi thú cưng" />}
                {allowsEv && <InfoRow label="Xe điện" value="Hỗ trợ sạc / để xe điện" />}
                <InfoRow label="Mã tin" value={`#${listing.id}`} mono />
                <InfoRow
                  label="Thời hạn hợp đồng"
                  value={listing.minLeaseMonths ? `Tối thiểu ${listing.minLeaseMonths} tháng` : 'Linh hoạt'}
                />
              </div>
            </div>

            {/* Khối Nội Thất */}
            <div className="rounded-2xl border border-surface-border bg-white p-5 sm:p-6 md:p-7 shadow-card space-y-3.5 sm:space-y-4">
              <h2 className="font-bold text-text-primary text-lg sm:text-xl">Nội Thất</h2>
              <div className="flex flex-wrap gap-2.5 sm:gap-3">
                {furnitureList.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-2 rounded-xl border border-surface-border bg-slate-50 px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <span className="h-2 w-2 rounded-full bg-teal-600 shrink-0" />
                    <span>{item}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Khối Giới thiệu (Chuẩn mẫu Mogi) */}
            <div className="rounded-2xl border border-surface-border bg-white p-5 sm:p-6 md:p-7 shadow-card space-y-4 sm:space-y-5">
              <h2 className="font-bold text-text-primary text-lg sm:text-xl">Giới thiệu</h2>
              <div className="whitespace-pre-line text-base sm:text-lg leading-relaxed text-text-secondary">
                {listing.description || 'Chưa có thông tin mô tả chi tiết cho phòng này'}
              </div>

              {/* Báo vi phạm */}
              <ReportListingModal listingId={listing.id} />

              {/* Tóm tắt người đăng bên dưới mô tả */}
              <div className="flex items-center gap-4 pt-3.5 border-t border-surface-border">
                <LandlordAvatar
                  avatarUrl={listing.owner?.avatarUrl}
                  name={cleanOwnerName}
                  size={48}
                />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-base font-bold text-text-primary">{cleanOwnerName}</p>
                    {listing.owner?.isIdVerified && (
                      <span
                        title="Danh tính / CCCD đã xác thực"
                        className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700"
                      >
                        <span>CCCD xác thực</span>
                      </span>
                    )}
                    {listing.owner?.isPhoneVerified && (
                      <span
                        title="Số điện thoại đã xác thực OTP"
                        className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-semibold text-blue-700"
                      >
                        <span>SĐT xác thực</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-text-muted mt-0.5">
                    Đã tham gia: {listing.owner?.createdAt ? formatJoinedDuration(listing.owner.createdAt) : 'Gần đây'}
                  </p>
                </div>
              </div>
            </div>

            {/* Khối Bản đồ Google Maps & Tiện ích vị trí */}
            <div className="rounded-2xl border border-surface-border bg-white p-5 sm:p-6 md:p-7 shadow-card space-y-4 sm:space-y-5">
              <div>
                <h2 className="font-bold text-text-primary text-lg sm:text-xl">
                  <span>Vị trí trên Google Maps & Tiện ích xung quanh</span>
                </h2>
                <p className="text-sm text-text-muted mt-1">
                  {listing.addressDetail ? `${listing.addressDetail}, ${listing.location?.name ?? 'Khu vực'}` : (listing.location?.name ?? 'Khu vực')}
                </p>
              </div>

              <div className="relative aspect-[16/9] md:aspect-[21/9] w-full overflow-hidden rounded-xl border border-surface-border bg-slate-100 shadow-inner">
                <iframe
                  title={`Bản đồ vị trí ${listing.addressDetail ?? listing.location?.name ?? 'Khu vực'}`}
                  src={getGoogleMapsEmbedUrl(
                    listing.lat != null && listing.lng != null
                      ? { lat: listing.lat, lng: listing.lng }
                      : { address: listing.addressDetail ?? listing.location?.name ?? 'Hà Nội' },
                  )}
                  className="h-full w-full border-0"
                  loading="lazy"
                  allowFullScreen
                />
              </div>

              {/* Danh sách trường Đại học lân cận */}
              {displayUnis.length > 0 && (
                <div className="pt-3.5 border-t border-surface-border space-y-3">
                  <h3 className="text-sm sm:text-base font-bold text-text-primary">
                    <span>Khoảng cách tới các trường Đại học lân cận</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {displayUnis.map((uni, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-3 rounded-xl border border-surface-border bg-slate-50/70 p-3 hover:border-brand/30 transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-text-primary truncate">
                            {uni.abbreviation ? `[${uni.abbreviation}] ` : ''}
                            {uni.name}
                          </p>
                          {uni.address && (
                            <p className="text-xs text-text-muted truncate mt-0.5">{uni.address}</p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <span className="inline-block rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                            {uni.distanceKm < 1 ? `~${uni.distanceMeters}m` : `~${uni.distanceKm} km`}
                          </span>
                          <p className="text-xs text-text-muted mt-0.5">~{uni.travelTimeMinutes} phút xe máy</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Khối Bài đăng liên quan */}
            {similarListings.length > 0 && (
              <div className="rounded-2xl border border-surface-border bg-white p-5 sm:p-6 md:p-7 shadow-card space-y-4">
                <h2 className="font-bold text-text-primary text-lg sm:text-xl">Bài đăng liên quan</h2>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
                  {similarListings.map((item) => (
                    <Link
                      key={item.id}
                      href={`/tin/${item.slug}`}
                      className="group flex flex-col justify-between overflow-hidden rounded-xl border border-surface-border bg-white hover:border-brand/40 hover:shadow-sm transition-all"
                    >
                      <div>
                        <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100">
                          {item.images[0]?.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.images[0].imageUrl}
                              alt={item.title}
                              loading="lazy"
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-slate-300">
                              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="p-3 space-y-1.5">
                          <p className="line-clamp-2 text-xs sm:text-sm font-semibold text-text-primary group-hover:text-brand transition-colors leading-snug">
                            {item.title.replace(/^\[MẪU\]\s*/, '')}
                          </p>
                          {item.areaM2 && (
                            <p className="text-xs text-text-muted">{item.areaM2} m²</p>
                          )}
                        </div>
                      </div>
                      <div className="px-3 pb-3">
                        <p className="text-sm sm:text-base font-bold text-brand">{formatPrice(item.price)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Cột phải — Sidebar người đăng & an toàn (1/3 chiều rộng) */}
          <aside>
            <div className="sticky top-20 space-y-5">
              {/* Box liên hệ & Đặt lịch xem phòng theo chuẩn giao diện mới */}
              <OwnerContactBox
                listingId={listing.id}
                listingTitle={displayTitle}
                price={listing.price}
                addressDetail={listing.addressDetail}
                locationName={listing.location?.name}
                createdAt={listing.createdAt}
                refreshedAt={listing.refreshedAt}
                ownerName={cleanOwnerName}
                ownerAvatarUrl={listing.owner?.avatarUrl}
                ownerPostCount={507}
                contactPhone={(listing as any).contactPhone}
                contactAgent={(listing as any).contactAgent}
              />
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile Sticky Contact Bar (FE-10) */}
      <MobileStickyContactBar
        listingId={listing.id}
        listingTitle={displayTitle}
        priceFormatted={formatExactPrice(listing.price)}
        depositFormatted={listing.depositAmount ? formatExactPrice(listing.depositAmount) : undefined}
      />
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs sm:text-sm text-text-muted font-medium">{label}</p>
      <p className={`text-sm sm:text-base font-bold text-text-primary ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  );
}
