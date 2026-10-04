'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Listing, formatPrice } from '@/lib/api';
import {
  isRoomSelected,
  addSelectedRoom,
  removeSelectedRoom,
  subscribeSelectedRooms,
} from '@/lib/selected-rooms';

const PROPERTY_TYPE_LABEL: Record<string, string> = {
  'can-ho': 'Căn hộ',
  'can_ho': 'Căn hộ',
  'can-ho-chung-cu': 'Căn hộ chung cư',
  'can_ho_chung_cu': 'Căn hộ chung cư',
  'can-ho-mini': 'Căn hộ mini',
  'can_ho_mini': 'Căn hộ mini',
  'can-ho-dich-vu': 'Căn hộ dịch vụ',
  'can_ho_dich_vu': 'Căn hộ dịch vụ',
  'can-ho-cao-cap': 'Căn hộ cao cấp',
  'can_ho_cao_cap': 'Căn hộ cao cấp',
  'studio': 'Studio',
  'can-ho-studio': 'Căn hộ Studio',
  'can_ho_studio': 'Căn hộ Studio',
  'studio-ban-cong': 'Studio ban công',
  'studio_ban_cong': 'Studio ban công',
  'studio-gac-lung': 'Studio gác lửng',
  'studio_gac_lung': 'Studio gác lửng',
  'studio-full-noi-that': 'Studio full nội thất',
  'studio_full_noi_that': 'Studio full nội thất',
  'nha-nguyen-can': 'Nhà nguyên căn',
  'nha_rieng': 'Nhà nguyên căn',
  'nha-tro': 'Nhà trọ',
  'nha_tro': 'Nhà trọ',
  'phong-tro': 'Phòng trọ',
  'phong_tro': 'Phòng trọ',
  'phong-tro-sinh-vien': 'Phòng trọ SV',
  'phong_tro_sinh_vien': 'Phòng trọ SV',
  'phong-tro-nguoi-di-lam': 'Phòng trọ đi làm',
  'ky-tuc-xa': 'Ký túc xá',
  'ky_tuc_xa': 'Ký túc xá / Sleepbox',
  'ky-tuc-xa-tu-nhan': 'Ký túc xá tư nhân',
  'van-phong': 'Văn phòng cho thuê',
  'van_phong': 'Văn phòng cho thuê',
  'kho-xuong': 'Kho xưởng cho thuê',
  'kho_xuong': 'Kho xưởng cho thuê',
  'mat-bang': 'Mặt bằng kinh doanh',
  'mat_bang': 'Mặt bằng kinh doanh',
  'mat-bang-kinh-doanh': 'Mặt bằng kinh doanh',
  'biet-thu': 'Biệt thự cho thuê',
  'biet_thu': 'Biệt thự cho thuê',
  'shophouse': 'Shophouse cho thuê',
};

function formatTimeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return 'Hôm nay';
  if (days === 1) return 'Hôm qua';
  if (days < 7) return `${days} ngày trước`;
  if (days < 30) return `${Math.floor(days / 7)} tuần trước`;
  return `${Math.floor(days / 30)} tháng trước`;
}

export function ListingCard({ listing }: { listing: Listing }) {
  const cover = listing.images[0]?.imageUrl;
  const propertyLabel = PROPERTY_TYPE_LABEL[listing.propertyType] ?? 'Bất động sản thuê';
  const timeLabel = formatTimeAgo(listing.publishedAt);
  const isSample = listing.title.startsWith('[MẪU]');
  const displayTitle = isSample ? listing.title.replace(/^\[MẪU\]\s*/, '') : listing.title;
  const nearestUni = listing.nearbyUniversities?.[0];

  const [selected, setSelected] = useState(false);

  useEffect(() => {
    setSelected(isRoomSelected(listing.id));
    return subscribeSelectedRooms(() => {
      setSelected(isRoomSelected(listing.id));
    });
  }, [listing.id]);

  function handleToggleSelect(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (selected) {
      removeSelectedRoom(listing.id);
    } else {
      addSelectedRoom({
        id: String(listing.id),
        title: displayTitle,
        slug: listing.slug,
        price: listing.price,
        formattedPrice: formatPrice(listing.price),
        address: listing.addressDetail || listing.location?.name || '',
        coverImage: cover,
      });
    }
  }

  return (
    <Link href={`/tin/${listing.slug}`} className="listing-card group flex flex-col justify-between">
      <div>
        {/* Ảnh: tỷ lệ 16:10 */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover}
              alt={displayTitle}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              style={{ willChange: 'transform', transform: 'translateZ(0)' }}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <svg className="h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 21h18M3.75 3h16.5M4.5 3v18m15-18v18" />
              </svg>
            </div>
          )}

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Số lượng ảnh */}
          {listing.images.length > 1 && (
            <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white backdrop-blur-sm">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 21h18M3.75 3h16.5M4.5 3v18m15-18v18" />
              </svg>
              {listing.images.length}
            </div>
          )}

          {/* Nút Chọn phòng / Thêm vào danh sách phòng đã chọn */}
          <button
            type="button"
            onClick={handleToggleSelect}
            title={selected ? 'Bỏ chọn phòng' : 'Chọn phòng vào giỏ để đặt lịch xem'}
            aria-label={selected ? 'Bỏ chọn phòng' : 'Chọn phòng vào giỏ để đặt lịch xem'}
            className={`absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-lg transition-all shadow-sm ${
              selected
                ? 'bg-brand text-white scale-105 shadow-md ring-1 ring-white/50'
                : 'bg-black/40 text-white/90 hover:bg-black/70 hover:text-white hover:scale-105 backdrop-blur-xs'
            }`}
          >
            {selected ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            )}
          </button>
        </div>

        {/* Nội dung card */}
        <div className="p-4">
          {/* Giá thuê tháng */}
          <div className="flex items-baseline gap-1.5">
            <span className="price-text">
              {formatPrice(listing.price)}
            </span>
            <span className="text-xs font-medium text-text-muted">/ tháng</span>
            {listing.areaM2 && Number(listing.areaM2) > 0 && (
              <span className="ml-auto text-xs text-text-muted shrink-0 font-medium">
                {listing.areaM2} m²
              </span>
            )}
          </div>

          {/* Tiêu đề */}
          <p className="mt-1.5 line-clamp-2 text-sm font-semibold text-text-primary leading-snug group-hover:text-brand transition-colors">
            {displayTitle}
          </p>

          {/* Badge khoảng cách tìm kiếm theo địa chỉ nếu có */}
          {listing.distanceText ? (
            <div className="mt-2 inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200/70">
              <span>{listing.distanceText}</span>
            </div>
          ) : listing.distanceMeters != null ? (
            <div className="mt-2 inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200/70">
              <span>
                {listing.distanceMeters < 1000
                  ? `Cách địa chỉ ~${listing.distanceMeters}m`
                  : `Cách địa chỉ ~${(listing.distanceMeters / 1000).toFixed(1)} km`}
              </span>
            </div>
          ) : nearestUni ? (
            <div className="mt-2 flex items-center text-xs text-brand font-medium truncate">
              <span className="truncate">
                Gần {nearestUni.university.abbreviation || nearestUni.university.name}
                {nearestUni.distanceMeters ? ` (~${nearestUni.distanceMeters}m)` : ''}
              </span>
            </div>
          ) : null}


        </div>
      </div>

      {/* Thông tin nhanh + thời gian */}
      <div className="px-4 pb-3 pt-0">
        <div className="flex items-center justify-between border-t border-surface-border pt-2 text-xs text-text-muted">
          <div className="flex items-center gap-3">
            {listing.depositAmount ? (
              <span className="text-[11px] text-teal-700 font-medium">
                Cọc: {formatPrice(listing.depositAmount)}
              </span>
            ) : listing.bedrooms != null ? (
              <span>{listing.bedrooms} PN</span>
            ) : null}
            {listing.minLeaseMonths ? (
              <span className="text-[11px] text-text-muted">
                HĐ: {listing.minLeaseMonths}T+
              </span>
            ) : null}
          </div>
          {timeLabel && (
            <span className="text-xs text-text-muted">{timeLabel}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
