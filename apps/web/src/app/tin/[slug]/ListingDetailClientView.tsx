'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Listing } from '@/lib/api';
import { formatPrice, formatExactPrice } from '@/lib/api';
import { PropertyGallery } from './PropertyGallery';
import { ReportListingModal } from '@/components/ReportListingModal';
import { OwnerContactBox } from './OwnerContactBox';
import { LandlordAvatar } from '@/components/QnsLogo';
import { MobileStickyContactBar } from './MobileStickyContactBar';
import { getNearbyUniversities, getGoogleMapsEmbedUrl } from '@/lib/vietnam-universities';
import { sanitizeListingImages, healCustomListingsInLocalStorage } from '@/lib/image-compressor';
import { findMapRoomBySlug, mapRoomToListing } from '@/lib/map-rooms-data';

interface Props {
  initialListing: Listing | null;
  slug: string;
  similarListings: Listing[];
}

const FURNITURE_NAMES: Record<string, string> = {
  dieuHoa: 'Điều hòa',
  airConditioner: 'Điều hòa',
  air_conditioner: 'Điều hòa',
  nongLanh: 'Bình nóng lạnh',
  waterHeater: 'Bình nóng lạnh',
  water_heater: 'Bình nóng lạnh',
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
  bepRieng: 'Bếp',
  kitchen: 'Bếp',
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
  thuCung: 'Thú cưng',
  xeDien: 'Xe điện',
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

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs sm:text-sm text-text-muted font-medium">{label}</p>
      <p className={`text-sm sm:text-base font-bold text-text-primary ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  );
}

export function ListingDetailClientView({ initialListing, slug, similarListings }: Props) {
  const [listing, setListing] = useState<Listing | null>(initialListing);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    // Chữa lành các blob URLs cũ nếu có trong localStorage
    healCustomListingsInLocalStorage();

    try {
      const raw = localStorage.getItem('qns_custom_listings');
      if (raw) {
        const localList: Listing[] = JSON.parse(raw);
        if (Array.isArray(localList)) {
          const normalizedSlug = slug.trim().toLowerCase();

          // 1. Tìm chính xác theo slug
          let matched = localList.find((item) => item.slug?.toLowerCase() === normalizedSlug);

          // 2. Tìm theo ID trích xuất từ slug
          if (!matched) {
            const idMatch = normalizedSlug.match(/-id([a-zA-Z0-9_-]+)$/);
            if (idMatch) {
              const extractedId = idMatch[1].toLowerCase();
              matched = localList.find((item) => {
                const itemId = String(item.id).toLowerCase();
                return itemId === extractedId || item.slug?.toLowerCase().endsWith(`-id${extractedId}`);
              });
            }
          }

          // 3. Tìm theo một phần slug
          if (!matched) {
            matched = localList.find((item) => {
              const itemSlug = item.slug?.toLowerCase() || '';
              return itemSlug.includes(normalizedSlug) || normalizedSlug.includes(itemSlug);
            });
          }

          if (matched) {
            // Chuẩn hóa hình ảnh để không bao giờ bị vỡ
            const cleanedItem = {
              ...matched,
              images: sanitizeListingImages(matched.images),
            };
            setListing(cleanedItem);

            // Đồng bộ lên server nếu server chưa có
            fetch('/api/custom-listings', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(cleanedItem),
            }).catch(() => undefined);
          } else {
            // 4. Nếu vẫn chưa thấy, kiểm tra trong kho phòng trọ bản đồ đánh giá
            const mapRoom = findMapRoomBySlug(slug);
            if (mapRoom) {
              setListing(mapRoomToListing(mapRoom));
              return;
            }
          }
        }
      } else {
        // Nếu không có localStorage, kiểm tra trong map room
        const mapRoom = findMapRoomBySlug(slug);
        if (mapRoom) {
          setListing(mapRoomToListing(mapRoom));
        }
      }
    } catch (err) {
      console.warn('Lỗi kiểm tra tin đăng cục bộ:', err);
    }
  }, [slug]);

  // Nếu không tìm thấy tin cả trên máy chủ lẫn trình duyệt
  if (!listing && hydrated) {
    return (
      <div className="min-h-[70vh] bg-surface-muted flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full rounded-3xl border border-surface-border bg-white p-8 sm:p-10 text-center shadow-card space-y-5">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary">
              Không tìm thấy thông tin phòng cho thuê
            </h1>
            <p className="mt-2 text-sm text-text-muted leading-relaxed">
              Phòng cho thuê này có thể đã hết hạn hiển thị, được chủ nhà gỡ xuống hoặc đường dẫn chưa chính xác
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/thue"
              className="inline-flex items-center justify-center rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-brand-600 transition-colors"
            >
              Xem danh sách phòng cho thuê
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl border border-surface-border bg-white px-5 py-2.5 text-sm font-semibold text-text-secondary hover:bg-surface-muted transition-colors"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Đang render hoặc có listing
  const currentListing = listing || initialListing;
  if (!currentListing) {
    return (
      <div className="min-h-screen bg-surface-muted flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      </div>
    );
  }

  const isSample = currentListing.title?.startsWith('[MẪU]');
  const displayTitle = isSample
    ? currentListing.title.replace(/^\[MẪU\]\s*/, '')
    : currentListing.title ?? 'Phòng cho thuê';

  const rawOwnerName = currentListing.owner?.fullName ?? 'Chủ nhà';
  const cleanOwnerName =
    rawOwnerName.toLowerCase().includes('môi giới demo') || rawOwnerName.toLowerCase() === 'môi giới demo'
      ? 'Chủ nhà'
      : rawOwnerName.replace(/\s*\(\d+\)\s*/g, '').trim();

  // Đảm bảo ảnh luôn hợp lệ
  const sanitizedImages = sanitizeListingImages(currentListing.images);

  // Xử lý danh sách trường Đại học lân cận
  const displayUnis = (() => {
    if (currentListing.nearbyUniversities && currentListing.nearbyUniversities.length > 0) {
      return currentListing.nearbyUniversities.map((item) => {
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

    if (currentListing.lat != null && currentListing.lng != null) {
      const computed = getNearbyUniversities(currentListing.lat, currentListing.lng, 10, 4);
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
    currentListing.amenities?.thuCung ||
      currentListing.amenities?.pet ||
      currentListing.amenities?.petsAllowed ||
      currentListing.amenities?.choNuoiThuCung ||
      currentListing.description?.toLowerCase().includes('thú cưng') ||
      currentListing.description?.toLowerCase().includes('cho nuôi')
  );

  const allowsEv = Boolean(
    currentListing.amenities?.xeDien ||
      currentListing.amenities?.electricVehicle ||
      currentListing.amenities?.sacXeDien ||
      currentListing.description?.toLowerCase().includes('xe điện') ||
      currentListing.description?.toLowerCase().includes('sạc xe')
  );

  const furnitureList = (() => {
    const list: string[] = [];
    const am = currentListing.amenities || {};

    Object.entries(FURNITURE_NAMES).forEach(([k, label]) => {
      if (am[k] && !list.includes(label)) {
        list.push(label);
      }
    });

    const desc = (currentListing.description || '').toLowerCase();
    if (desc.includes('điều hòa') || desc.includes('máy lạnh')) {
      if (!list.includes('Điều hòa')) list.push('Điều hòa');
    }
    if (desc.includes('nóng lạnh') || desc.includes('bình nóng')) {
      if (!list.includes('Bình nóng lạnh')) list.push('Bình nóng lạnh');
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
      if (!list.includes('Bếp')) list.push('Bếp');
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
      return ['Điều hòa', 'Bình nóng lạnh', 'Giường nệm', 'Tủ quần áo', 'Bếp', 'Chỗ để xe', 'Wifi tốc độ cao', 'Giờ giấc tự do'];
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
              href={`/thue?locationSlug=${currentListing.location?.slug ?? ''}`}
              className="hover:text-brand transition-colors"
            >
              {currentListing.location?.name ?? 'Khu vực'}
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
            <PropertyGallery images={sanitizedImages} title={displayTitle} />

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
                  value={currentListing.status === 'expired' ? 'Hết phòng' : 'Còn phòng'}
                />
                <InfoRow
                  label="Cọc"
                  value={
                    currentListing.depositAmount
                      ? formatExactPrice(currentListing.depositAmount)
                      : (currentListing.amenities as any)?.depositMethod ||
                        (currentListing.amenities as any)?.depositNote ||
                        (currentListing as any).depositMethod ||
                        (currentListing as any).depositNote ||
                        '1 tháng tiền thuê'
                  }
                />
                <InfoRow
                  label="Điện"
                  value={
                    currentListing.utilitiesIncluded
                      ? 'Đã bao gồm trong giá thuê'
                      : currentListing.electricityPricePerKwh
                        ? `${currentListing.electricityPricePerKwh.toLocaleString('vi-VN')} đ/kWh`
                        : '4.000 đ/kWh'
                  }
                />
                <InfoRow
                  label="Nước"
                  value={
                    currentListing.utilitiesIncluded
                      ? 'Đã bao gồm trong giá thuê'
                      : currentListing.waterPriceFlat
                        ? `${currentListing.waterPriceFlat.toLocaleString('vi-VN')} đ/người/tháng`
                        : currentListing.waterPricePerM3
                          ? `${currentListing.waterPricePerM3.toLocaleString('vi-VN')} đ/m³`
                          : '30.000 đ/m³'
                  }
                />
                {allowsPets && <InfoRow label="Nuôi thú cưng" value="Cho phép nuôi thú cưng" />}
                {allowsEv && <InfoRow label="Xe điện" value="Hỗ trợ sạc / để xe điện" />}
                <InfoRow label="Mã tin" value={`#${currentListing.id}`} mono />
                <InfoRow
                  label="Thời hạn hợp đồng"
                  value={currentListing.minLeaseMonths ? `Tối thiểu ${currentListing.minLeaseMonths} tháng` : 'Linh hoạt'}
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

            {/* Khối Giới thiệu */}
            <div className="rounded-2xl border border-surface-border bg-white p-5 sm:p-6 md:p-7 shadow-card space-y-4 sm:space-y-5">
              <h2 className="font-bold text-text-primary text-lg sm:text-xl">Giới thiệu</h2>
              <div className="whitespace-pre-line text-base sm:text-lg leading-relaxed text-text-secondary">
                {currentListing.description || 'Chưa có thông tin mô tả chi tiết cho phòng này'}
              </div>

              {/* Báo vi phạm */}
              <ReportListingModal listingId={currentListing.id} />

              {/* Tóm tắt người đăng bên dưới mô tả */}
              <div className="flex items-center gap-4 pt-3.5 border-t border-surface-border">
                <LandlordAvatar
                  avatarUrl={currentListing.owner?.avatarUrl}
                  name={cleanOwnerName}
                  size={48}
                />
                <div>
                  <p className="text-base font-bold text-text-primary">{cleanOwnerName}</p>
                  <p className="text-xs sm:text-sm text-text-muted mt-0.5">
                    Đã tham gia: {currentListing.owner?.createdAt ? formatJoinedDuration(currentListing.owner.createdAt) : 'Gần đây'}
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
                  {currentListing.addressDetail ? `${currentListing.addressDetail}, ${currentListing.location?.name ?? 'Khu vực'}` : (currentListing.location?.name ?? 'Khu vực')}
                </p>
              </div>

              <div className="relative h-[380px] sm:h-[460px] md:h-[520px] w-full overflow-hidden rounded-2xl border border-surface-border bg-slate-100 shadow-md">
                <iframe
                  title={`Bản đồ vị trí ${currentListing.addressDetail ?? currentListing.location?.name ?? 'Khu vực'}`}
                  src={getGoogleMapsEmbedUrl(
                    currentListing.lat != null && currentListing.lng != null
                      ? { lat: currentListing.lat, lng: currentListing.lng }
                      : { address: currentListing.addressDetail ?? currentListing.location?.name ?? 'Hà Nội' },
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

          {/* Cột phải — Sidebar người đăng */}
          <aside>
            <div className="sticky top-20 space-y-5">
              <OwnerContactBox
                listingId={currentListing.id}
                listingTitle={displayTitle}
                price={currentListing.price}
                addressDetail={currentListing.addressDetail}
                locationName={currentListing.location?.name}
                createdAt={currentListing.createdAt}
                refreshedAt={currentListing.refreshedAt}
                ownerName={cleanOwnerName}
                ownerAvatarUrl={currentListing.owner?.avatarUrl}
                ownerPostCount={507}
                contactPhone={(currentListing as any).contactPhone}
                contactAgent={(currentListing as any).contactAgent}
              />
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile Sticky Contact Bar */}
      <MobileStickyContactBar
        listingId={currentListing.id}
        listingTitle={displayTitle}
        priceFormatted={formatExactPrice(currentListing.price)}
        depositFormatted={currentListing.depositAmount ? formatExactPrice(currentListing.depositAmount) : undefined}
      />
    </div>
  );
}
