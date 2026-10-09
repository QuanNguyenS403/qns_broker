import { cache } from 'react';
import type { Metadata } from 'next';
import { fetchListingBySlug, fetchListings } from '@/lib/api';
import { ALL_DEMO_LISTINGS, findDemoListing } from '@/lib/demo-data';
import { getCustomListingBySlugServer } from '@/lib/custom-listings-server';
import { findMapRoomBySlug, mapRoomToListing } from '@/lib/map-rooms-data';
import { ListingDetailClientView } from './ListingDetailClientView';

interface Props {
  params: { slug: string };
}

// React cache() tự động deduplicate request giữa generateMetadata và ListingDetailPage
const getListingOrNull = cache(async (slug: string) => {
  // 1. Thử lấy từ Backend NestJS API nếu đang chạy
  try {
    const apiListing = await fetchListingBySlug(slug);
    if (apiListing && apiListing.id) return apiListing;
  } catch {
    // Backend offline hoặc tin chưa có trong DB
  }

  // 2. Thử lấy từ kho lưu trữ tin tự đăng trên máy chủ Next.js
  try {
    const serverCustom = getCustomListingBySlugServer(slug);
    if (serverCustom) return serverCustom;
  } catch {
    // Lỗi đọc server custom listing
  }

  // 3. Thử tìm kiếm trong danh mục demo & alias (chỉ lấy nếu khớp, không tự ý tráo sang tin khác)
  const demo = findDemoListing(slug, false);
  if (demo) return demo;

  // 4. Thử tìm kiếm trong kho dữ liệu phòng trọ bản đồ & đánh giá
  try {
    const mapRoom = findMapRoomBySlug(slug);
    if (mapRoom) {
      return mapRoomToListing(mapRoom);
    }
  } catch {
    // Lỗi tìm map room
  }

  // Trả về null để phía client tiếp tục tìm kiếm trong localStorage của người dùng
  return null;
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const listing = await getListingOrNull(params.slug);
    if (listing) {
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
    }
  } catch {}

  return {
    title: 'Chi tiết phòng cho thuê | QNS BROKER',
    description: 'Thông tin chi tiết phòng trọ, căn hộ, studio cho thuê minh bạch chi phí, Chủ nhà trực tiếp tư vấn và dẫn xem miễn phí',
  };
}

export default async function ListingDetailPage({ params }: Props) {
  const listing = await getListingOrNull(params.slug);

  // Lấy tin đăng tương tự từ API hoặc fallback danh mục demo
  let similarListings: any[] = [];
  try {
    if (listing?.propertyType) {
      const similarRes = await fetchListings({
        propertyType: listing.propertyType,
        pageSize: '4',
      });
      similarListings = (similarRes.items || [])
        .filter((item) => item.id !== listing.id && !item.slug.includes('-idtemp'))
        .slice(0, 4);
    }
  } catch {}

  if (similarListings.length === 0) {
    similarListings = ALL_DEMO_LISTINGS.filter((item) => !listing || item.id !== listing.id).slice(0, 4);
  }

  return (
    <ListingDetailClientView
      initialListing={listing}
      slug={params.slug}
      similarListings={similarListings}
    />
  );
}
