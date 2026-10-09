'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  getAllMapRooms,
  filterMapRooms,
  maskListingAddress,
  type MapRoom,
  type MapFilterParams,
  type RoomReview,
} from '@/lib/map-rooms-data';
import { geocodeAddressPipeline } from '@/lib/vietnam-geocoding';
import { MapRoomCanvas } from './MapRoomCanvas';
import { MapFloatingSearchBar } from './MapFloatingSearchBar';
import { MapRoomDetailDrawer } from './MapRoomDetailDrawer';

export function MapReviewsExplorer() {
  const [allRooms, setAllRooms] = useState<MapRoom[]>([]);
  const [filterParams, setFilterParams] = useState<MapFilterParams>({});
  const [selectedRoom, setSelectedRoom] = useState<MapRoom | null>(null);
  const [selectedClusterRooms, setSelectedClusterRooms] = useState<MapRoom[]>([]);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // 1. Tải toàn bộ phòng trọ từ dữ liệu máy chủ + localStorage client
  useEffect(() => {
    const baseRooms = getAllMapRooms();

    // Đọc thêm tin vừa đăng từ localStorage phía client nếu có
    try {
      const localCustom = localStorage.getItem('qns_custom_listings');
      if (localCustom) {
        const parsed = JSON.parse(localCustom);
        if (Array.isArray(parsed)) {
          parsed.forEach((item: any, idx: number) => {
            if (!item.lat || !item.lng) return;
            const exists = baseRooms.some((r) => r.id === String(item.id));
            if (!exists) {
              const priceNum = parseInt(String(item.price || '3500000'), 10) || 3500000;
              const depositNum = parseInt(String(item.depositAmount || '2000000'), 10) || 2000000;
              baseRooms.unshift({
                id: String(item.id || `local-${idx}`),
                slug: item.slug || `tin-moi-${item.id}`,
                title: item.title || 'Phòng cho thuê mới đăng',
                maskedAddress: maskListingAddress(item.addressDetail, '', '', 'Hà Nội'),
                rawAddress: item.addressDetail || '',
                lat: Number(item.lat),
                lng: Number(item.lng),
                price: priceNum,
                depositAmount: depositNum,
                areaM2: parseInt(String(item.areaM2 || '25'), 10) || 25,
                propertyType: item.propertyType || 'phong_tro',
                district: item.location?.name || 'Hà Nội',
                ward: '',
                city: 'Hà Nội',
                images: Array.isArray(item.images) && item.images.length > 0
                  ? item.images.map((img: any) => typeof img === 'string' ? img : img.imageUrl).filter(Boolean)
                  : ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=75'],
                rating: 5.0,
                reviewCount: 1,
                reviews: [
                  {
                    id: `rev-local-${idx}`,
                    authorName: 'Khách thuê mới',
                    authorRole: 'Khách thuê thực tế',
                    rating: 5,
                    content: 'Phòng mới đăng, thông tin đầy đủ, hỗ trợ dẫn xem nhanh chóng',
                    createdAt: new Date().toISOString().slice(0, 10),
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
            }
          });
        }
      }
    } catch (e) {
      console.warn('Lỗi đọc custom listings localStorage:', e);
    }

    setAllRooms(baseRooms);
    setIsDataLoaded(true);
  }, []);

  // 2. Lọc phòng theo các tiêu chí từ thanh tìm kiếm
  const filteredRooms = useMemo(() => {
    return filterMapRooms(allRooms, filterParams);
  }, [allRooms, filterParams]);

  // 3. Xử lý khi người dùng tìm kiếm từ MapFloatingSearchBar
  const handleSearch = useCallback(async (params: MapFilterParams) => {
    setFilterParams(params);

    // Tính danh sách phòng khớp bộ lọc
    const matched = filterMapRooms(allRooms, params);

    // Nếu người dùng gõ địa chỉ cụ thể, thử geocode
    if (params.query && params.query.trim()) {
      try {
        const geoRes = await geocodeAddressPipeline(params.query.trim());
        if (geoRes && geoRes.lat && geoRes.lng) {
          setMapCenter({ lat: geoRes.lat, lng: geoRes.lng });
          return;
        }
      } catch {
        // Tiếp tục fallback
      }
    }

    // Nếu người dùng chọn quận/huyện cụ thể từ dropdown
    if (params.khuVuc && params.khuVuc !== 'all' && params.khuVuc !== 'Khu vực') {
      try {
        const geoRes = await geocodeAddressPipeline(params.khuVuc);
        if (geoRes && geoRes.lat && geoRes.lng) {
          setMapCenter({ lat: geoRes.lat, lng: geoRes.lng });
          return;
        }
      } catch {
        // Tiếp tục fallback
      }
    }

    // Fallback thông minh: nếu có phòng khớp với kết quả tìm kiếm, bay tới vị trí phòng đầu tiên
    if (matched.length > 0) {
      setMapCenter({ lat: matched[0].lat, lng: matched[0].lng });
    }
  }, [allRooms]);

  // 4. Xử lý thêm review mới trực tiếp vào phòng
  const handleAddReview = useCallback((roomId: string, newReview: RoomReview) => {
    setAllRooms((prev) =>
      prev.map((r) => {
        if (r.id === roomId) {
          const updatedReviews = [newReview, ...r.reviews];
          const newAvg =
            updatedReviews.reduce((sum, item) => sum + item.rating, 0) / updatedReviews.length;
          return {
            ...r,
            rating: Number(newAvg.toFixed(1)),
            reviewCount: updatedReviews.length,
            reviews: updatedReviews,
          };
        }
        return r;
      })
    );

    // Cập nhật selectedRoom nếu đang mở
    setSelectedRoom((prev) => {
      if (prev && prev.id === roomId) {
        const updatedReviews = [newReview, ...prev.reviews];
        const newAvg =
          updatedReviews.reduce((sum, item) => sum + item.rating, 0) / updatedReviews.length;
        return {
          ...prev,
          rating: Number(newAvg.toFixed(1)),
          reviewCount: updatedReviews.length,
          reviews: updatedReviews,
        };
      }
      return prev;
    });
  }, []);

  return (
    <div className="relative w-full h-[620px] sm:h-[720px] md:h-[780px] lg:h-[840px] overflow-hidden rounded-3xl border border-slate-200/90 shadow-2xl bg-slate-900">
      {/* BẢN ĐỒ GOOGLE MAPS PHỦ TOÀN BỘ KHUNG NHÌN (ẢNH 1) */}
      <div className="absolute inset-0 w-full h-full z-10">
        <MapRoomCanvas
          rooms={filteredRooms}
          selectedRoom={selectedRoom}
          onSelectRoom={(room, cluster) => {
            setSelectedRoom(room);
            setSelectedClusterRooms(cluster || [room]);
          }}
          centerCoords={mapCenter}
        />
      </div>

      {/* KHỐI NỔI ĐÈ LÊN PHÍA TRÊN GOOGLE MAPS (ẢNH 2 + LỊCH SỬ TÌM KIẾM ẢNH 1) */}
      <div className="absolute top-3 sm:top-5 left-3 sm:left-6 right-3 sm:right-6 md:left-8 md:right-auto md:w-[760px] lg:w-[820px] z-30 pointer-events-none">
        <div className="pointer-events-auto">
          <MapFloatingSearchBar
            onSearch={handleSearch}
            totalFilteredCount={filteredRooms.length}
          />
        </div>
      </div>

      {/* DRAWER CHI TIẾT PHÒNG & TÍCH HỢP REVIEW (MỞ KHI CLICK VÀO PHÒNG TRÊN BẢN ĐỒ) */}
      <MapRoomDetailDrawer
        room={selectedRoom}
        clusterRooms={selectedClusterRooms}
        onSelectClusterRoom={(room) => setSelectedRoom(room)}
        onClose={() => {
          setSelectedRoom(null);
          setSelectedClusterRooms([]);
        }}
        onAddReview={handleAddReview}
      />
    </div>
  );
}
