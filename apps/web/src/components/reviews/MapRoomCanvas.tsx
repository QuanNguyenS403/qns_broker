'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import type { MapRoom } from '@/lib/map-rooms-data';

interface MapRoomCanvasProps {
  rooms: MapRoom[];
  selectedRoom: MapRoom | null;
  onSelectRoom: (room: MapRoom, clusterRooms?: MapRoom[]) => void;
  centerCoords?: { lat: number; lng: number } | null;
}

export function MapRoomCanvas({
  rooms,
  selectedRoom,
  onSelectRoom,
  centerCoords,
}: MapRoomCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const [isLeafletReady, setIsLeafletReady] = useState(false);
  const [isLocatingUser, setIsLocatingUser] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(13);

  // Mặc định trung tâm Hà Nội (khu vực Hai Bà Trưng / Đống Đa)
  const DEFAULT_LAT = 21.015;
  const DEFAULT_LNG = 105.835;

  // 1. Tải Leaflet CSS & JS an toàn từ CDN với cơ chế tự phát hiện ngay lập tức
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if ((window as any).L) {
      setIsLeafletReady(true);
      return;
    }

    // Nạp Leaflet CSS nếu chưa có
    const cssId = 'leaflet-cdn-css';
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.crossOrigin = '';
      document.head.appendChild(link);
    }

    // Nạp Leaflet JS nếu chưa có
    const scriptId = 'leaflet-cdn-js';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.crossOrigin = '';
      script.async = true;
      script.onload = () => setIsLeafletReady(true);
      document.body.appendChild(script);
    } else {
      script.addEventListener('load', () => setIsLeafletReady(true));
    }

    // Định kỳ quét phát hiện window.L để chống nghẽn race-condition
    const timer = setInterval(() => {
      if ((window as any).L) {
        setIsLeafletReady(true);
        clearInterval(timer);
      }
    }, 150);

    return () => clearInterval(timer);
  }, []);

  // 2. Khởi tạo bản đồ Google Maps qua Leaflet TileLayer
  useEffect(() => {
    if (!isLeafletReady || !containerRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    // Bảo vệ phòng ngừa Leaflet đọc _leaflet_pos khi phần tử đang unmount hoặc _mapPane bị null
    if (L.DomUtil && !L.DomUtil._safePositionPatched) {
      const origGetPosition = L.DomUtil.getPosition;
      L.DomUtil.getPosition = function (el: any) {
        if (!el) {
          return (L.Point ? new L.Point(0, 0) : { x: 0, y: 0 }) as any;
        }
        return origGetPosition.call(this, el);
      };
      L.DomUtil._safePositionPatched = true;
    }

    if (L.Map && L.Map.prototype && !(L.Map.prototype as any)._safePanePosPatched) {
      const origGetMapPanePos = L.Map.prototype._getMapPanePos;
      L.Map.prototype._getMapPanePos = function () {
        if (!this._mapPane) {
          return (L.Point ? new L.Point(0, 0) : { x: 0, y: 0 }) as any;
        }
        return origGetMapPanePos ? origGetMapPanePos.call(this) : ((L.Point ? new L.Point(0, 0) : { x: 0, y: 0 }) as any);
      };
      (L.Map.prototype as any)._safePanePosPatched = true;
    }

    if (mapInstanceRef.current) {
      return;
    }

    const startLat = centerCoords?.lat ?? DEFAULT_LAT;
    const startLng = centerCoords?.lng ?? DEFAULT_LNG;

    const map = L.map(containerRef.current, {
      center: [startLat, startLng],
      zoom: 13,
      zoomControl: false,
    });

    // Lớp Google Maps Road Tiles chuẩn
    const googleTileLayer = L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: '© Google Maps',
    });

    // Lớp fallback dự phòng an toàn CartoDB Voyager nếu Google tile bị gián đoạn mạng
    const fallbackTileLayer = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      {
        maxZoom: 19,
        subdomains: 'abcd',
        attribution: '© CartoDB © OpenStreetMap',
      }
    );

    googleTileLayer.on('tileerror', () => {
      if (!map.hasLayer(fallbackTileLayer)) {
        fallbackTileLayer.addTo(map);
      }
    });

    googleTileLayer.addTo(map);

    // Cập nhật zoom level khi người dùng thu phóng
    map.on('zoomend', () => {
      setCurrentZoom(map.getZoom());
    });

    // Thêm zoom control ở góc trên bên phải
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Tạo layer group chứa markers
    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    // Đảm bảo Leaflet map lấp đầy toàn bộ khung nhìn khi màn hình co giãn hoặc render lần đầu
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.stop?.();
          mapInstanceRef.current.scrollWheelZoom?.disable();
          mapInstanceRef.current.remove();
        } catch (err) {
          console.warn('Leaflet cleanup warning:', err);
        }
        mapInstanceRef.current = null;
      }
    };
  }, [isLeafletReady]);

  // 3. Gom nhóm phòng theo mức zoom động (Dynamic Clustering theo Ảnh 1)
  const clusteredRooms = useMemo(() => {
    const grid = new Map<string, MapRoom[]>();

    rooms.forEach((r) => {
      let key: string;
      if (currentZoom < 14) {
        // Thu phóng xa (< 14): gom cụm lớn theo ô ~1.5km như Ảnh 1
        key = `${(Math.round(r.lat * 50) / 50).toFixed(3)}_${(Math.round(r.lng * 50) / 50).toFixed(3)}`;
      } else if (currentZoom < 16) {
        // Thu phóng vừa (14 - 15): gom cụm nhỏ theo ô ~300m
        key = `${(Math.round(r.lat * 200) / 200).toFixed(4)}_${(Math.round(r.lng * 200) / 200).toFixed(4)}`;
      } else {
        // Thu phóng gần (>= 16): hiển thị từng phòng riêng biệt (chỉ gom nếu trùng tọa độ tuyệt đối)
        key = `${r.lat.toFixed(5)}_${r.lng.toFixed(5)}`;
      }

      if (!grid.has(key)) {
        grid.set(key, []);
      }
      grid.get(key)!.push(r);
    });

    return Array.from(grid.values());
  }, [rooms, currentZoom]);

  // 4. Vẽ các marker lên bản đồ Google Maps
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || !isLeafletReady) return;
    const L = (window as any).L;
    if (!L) return;

    const markersLayer = markersLayerRef.current;
    markersLayer.clearLayers();

    clusteredRooms.forEach((cluster) => {
      const mainRoom = cluster[0];
      const count = cluster.length;
      const isSelected = selectedRoom ? cluster.some((r) => r.id === selectedRoom.id) : false;

      // Icon marker tròn tím viền trắng tái hiện chuẩn Ảnh 1
      const isCluster = count > 1;
      const iconHtml = isCluster
        ? `<div class="relative flex items-center justify-center cursor-pointer transform transition-transform hover:scale-110 ${isSelected ? 'scale-125 z-50' : 'z-20'}">
            <div class="w-8 h-8 rounded-full bg-[#52296b] text-white flex items-center justify-center text-xs font-black shadow-lg border-2 ${isSelected ? 'border-teal-400 ring-4 ring-teal-400/40 bg-teal-800' : 'border-white'}">
              <span>${count}</span>
            </div>
            ${isSelected ? '<div class="absolute -inset-1 rounded-full bg-teal-400 animate-ping opacity-30 pointer-events-none"></div>' : ''}
          </div>`
        : `<div class="relative flex items-center justify-center cursor-pointer transform transition-transform hover:scale-110 ${isSelected ? 'scale-125 z-50' : 'z-20'}">
            <div class="w-7 h-7 rounded-full bg-[#52296b] text-white flex items-center justify-center shadow-lg border-2 ${isSelected ? 'border-teal-400 ring-4 ring-teal-400/40 bg-teal-800' : 'border-white'}">
              <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </div>
            ${isSelected ? '<div class="absolute -inset-1 rounded-full bg-teal-400 animate-ping opacity-30 pointer-events-none"></div>' : ''}
          </div>`;

      const customIcon = L.divIcon({
        className: 'custom-map-div-icon',
        html: iconHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([mainRoom.lat, mainRoom.lng], { icon: customIcon });

      marker.on('click', () => {
        onSelectRoom(mainRoom, cluster);
        if (isCluster && currentZoom < 16) {
          // Khi click vào cụm đông phòng ở mức zoom xa, tự động phóng to gần hơn để bung cụm
          const nextZoom = Math.min(17, currentZoom + 2);
          mapInstanceRef.current?.flyTo([mainRoom.lat, mainRoom.lng], nextZoom, {
            duration: 0.6,
          });
        } else {
          mapInstanceRef.current?.flyTo([mainRoom.lat, mainRoom.lng], 16, {
            duration: 0.6,
          });
        }
      });

      markersLayer.addLayer(marker);
    });
  }, [clusteredRooms, selectedRoom, isLeafletReady, onSelectRoom, currentZoom]);

  const prevRoomIdRef = useRef<string | null>(null);
  const prevCenterKeyRef = useRef<string | null>(null);

  // 5. Cập nhật tâm bản đồ khi centerCoords hoặc selectedRoom thay đổi
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const currentCenterKey = centerCoords ? `${centerCoords.lat}_${centerCoords.lng}` : null;
    const currentRoomId = selectedRoom?.id ?? null;

    // Ưu tiên bay tới phòng được chọn nếu vừa có sự kiện chọn phòng
    if (currentRoomId && currentRoomId !== prevRoomIdRef.current && selectedRoom?.lat && selectedRoom?.lng) {
      prevRoomIdRef.current = currentRoomId;
      mapInstanceRef.current.flyTo([selectedRoom.lat, selectedRoom.lng], 16, { duration: 0.8 });
      return;
    }

    // Bay tới tọa độ tìm kiếm nếu người dùng vừa tìm kiếm địa chỉ mới
    if (currentCenterKey && currentCenterKey !== prevCenterKeyRef.current && centerCoords?.lat && centerCoords?.lng) {
      prevCenterKeyRef.current = currentCenterKey;
      mapInstanceRef.current.flyTo([centerCoords.lat, centerCoords.lng], 15, { duration: 0.8 });
      return;
    }

    if (selectedRoom?.lat && selectedRoom?.lng) {
      mapInstanceRef.current.flyTo([selectedRoom.lat, selectedRoom.lng], 16, { duration: 0.8 });
    }
  }, [centerCoords, selectedRoom]);

  // 6. Định vị GPS thiết bị hiện tại (Nút crosshair ở góc dưới bên phải như Ảnh 1)
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Trình duyệt không hỗ trợ định vị GPS');
      return;
    }
    setIsLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocatingUser(false);
        const { latitude, longitude } = pos.coords;
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 16, { duration: 1 });
        }
      },
      () => {
        setIsLocatingUser(false);
        alert('Không thể xác định vị trí GPS hiện tại');
      },
      { timeout: 8000 }
    );
  };

  return (
    <div className="relative w-full h-full bg-slate-100 overflow-hidden">
      {/* Container Leaflet Google Maps */}
      <div ref={containerRef} className="absolute inset-0 z-0 w-full h-full" />

      {/* Huy hiệu tổng số phòng ở góc trên — Màu xanh ngọc Teal (#0d9488) chủ đạo website */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand/95 backdrop-blur-md text-white text-xs sm:text-sm font-bold shadow-lg shadow-brand/20 border border-white/30">
          <span className="flex h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
          <span>{rooms.length} phòng đang hiển thị</span>
        </div>
      </div>

      {/* Nút bấm định vị GPS hình tâm ngắm (Ảnh 1: Bottom Right) */}
      <div className="absolute bottom-6 right-4 sm:right-6 z-20 flex flex-col gap-2">
        <button
          type="button"
          onClick={handleLocateMe}
          disabled={isLocatingUser}
          className="w-12 h-12 rounded-full bg-white text-slate-700 hover:text-brand hover:bg-slate-50 flex items-center justify-center shadow-xl border border-slate-200 transition-all active:scale-95 disabled:opacity-50"
          title="Định vị vị trí GPS hiện tại của tôi"
        >
          {isLocatingUser ? (
            <div className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-6 h-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.071 7.071l-1.414-1.414M8.343 8.343L6.929 6.929m12.142 0l-1.414 1.414M8.343 15.657l-1.414 1.414" />
              <circle cx="12" cy="12" r="3" strokeWidth={2} />
            </svg>
          )}
        </button>
      </div>

      {/* Màn hình chờ khi Leaflet đang nạp */}
      {!isLeafletReady && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-100/90 backdrop-blur-xs">
          <div className="w-9 h-9 border-3 border-brand border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs sm:text-sm font-bold text-slate-700">
            Đang tải bản đồ phòng trọ Google Maps...
          </p>
        </div>
      )}
    </div>
  );
}
