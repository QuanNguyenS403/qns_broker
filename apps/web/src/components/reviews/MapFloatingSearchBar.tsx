'use client';

import { useState, useEffect, useRef } from 'react';
import { HANOI_DISTRICT_GROUPS } from '@/lib/hanoi-wards';
import {
  getSearchHistory,
  addSearchHistory,
  removeSearchHistory,
  clearSearchHistory,
  type MapFilterParams,
} from '@/lib/map-rooms-data';

interface MapFloatingSearchBarProps {
  onSearch: (params: MapFilterParams) => void;
  totalFilteredCount: number;
}

type DropdownType = 'none' | 'filter' | 'amenities' | 'price' | 'history';

const MAX_PRICE_LIMIT = 30000000; // 30 triệu
const PRICE_STEP = 500000; // 500.000đ

function formatPriceNumber(val: number): string {
  if (val === 0) return '0đ';
  if (val >= 1000000) {
    const trieu = val / 1000000;
    return Number.isInteger(trieu) ? `${trieu} triệu` : `${trieu.toFixed(1)} triệu`;
  }
  return `${(val / 1000).toLocaleString('vi-VN')}k`;
}

function getPriceButtonLabel(min: number, max: number): string {
  if (min === 0 && max >= MAX_PRICE_LIMIT) return 'Khoảng giá';
  if (min === 0) return `< ${formatPriceNumber(max)}`;
  if (max >= MAX_PRICE_LIMIT) return `> ${formatPriceNumber(min)}`;
  return `${formatPriceNumber(min)} – ${formatPriceNumber(max)}`;
}

// Cập nhật theo yêu cầu: Căn hộ -> Chung cư, Nhà nguyên căn -> Mặt bằng kinh doanh, Xóa Ở ghép
const PROPERTY_TYPES = [
  { value: 'all', label: 'Tất cả loại phòng' },
  { value: 'phong_tro', label: 'Phòng trọ' },
  { value: 'chung_cu_mini', label: 'Chung cư mini' },
  { value: 'chung_cu', label: 'Chung cư' },
  { value: 'mat_bang', label: 'Mặt bằng kinh doanh' },
];

const AMENITY_LIST = [
  { key: 'petsAllowed' as const, label: 'Nuôi thú cưng' },
  { key: 'electricVehicle' as const, label: 'Sạc xe điện' },
  { key: 'mezzanine' as const, label: 'Có gác xép' },
  { key: 'balcony' as const, label: 'Ban công' },
  { key: 'elevator' as const, label: 'Thang máy' },
  { key: 'freeTime' as const, label: 'Không chung chủ' },
];

export function MapFloatingSearchBar({ onSearch, totalFilteredCount }: MapFloatingSearchBarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const [khuVuc, setKhuVuc] = useState('all');
  const [loaiPhong, setLoaiPhong] = useState('all');

  // Giá thuê dạng thanh kéo trượt (Dual Range Slider) giống bên mục tìm phòng
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE_LIMIT);

  const [amenities, setAmenities] = useState({
    petsAllowed: false,
    electricVehicle: false,
    mezzanine: false,
    balcony: false,
    elevator: false,
    freeTime: false,
  });

  const [activeDropdown, setActiveDropdown] = useState<DropdownType>('none');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);

  useEffect(() => {
    setSearchHistory(getSearchHistory());
    setIsHistoryLoaded(true);
  }, []);

  // Đóng popover khi click ra ngoài vùng khung tìm kiếm
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveDropdown('none');
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveDropdown('none');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleApplyFilter = (
    customQuery?: string,
    customKhuVuc?: string,
    customLoaiPhong?: string,
    customMinPrice?: number,
    customMaxPrice?: number,
    customAmenities?: typeof amenities
  ) => {
    const finalQuery = customQuery !== undefined ? customQuery : query;
    const finalKhuVuc = customKhuVuc !== undefined ? customKhuVuc : khuVuc;
    const finalLoaiPhong = customLoaiPhong !== undefined ? customLoaiPhong : loaiPhong;
    const finalMinPrice = customMinPrice !== undefined ? customMinPrice : minPrice;
    const finalMaxPrice = customMaxPrice !== undefined ? customMaxPrice : maxPrice;
    const finalAmenities = customAmenities !== undefined ? customAmenities : amenities;

    if (finalQuery.trim()) {
      const updated = addSearchHistory(finalQuery.trim());
      setSearchHistory(updated);
    }

    onSearch({
      query: finalQuery,
      khuVuc: finalKhuVuc,
      loaiPhong: finalLoaiPhong,
      minPrice: finalMinPrice,
      maxPrice: finalMaxPrice,
      amenities: finalAmenities,
    });
  };

  const handleSelectHistoryItem = (term: string) => {
    setQuery(term);
    setActiveDropdown('none');
    handleApplyFilter(term);
  };

  const handleRemoveHistoryItem = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    const updated = removeSearchHistory(term);
    setSearchHistory(updated);
  };

  const handleClearAllHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearSearchHistory();
    setSearchHistory([]);
    setActiveDropdown('none');
  };

  const toggleAmenity = (key: keyof typeof amenities) => {
    const next = { ...amenities, [key]: !amenities[key] };
    setAmenities(next);
    handleApplyFilter(undefined, undefined, undefined, undefined, undefined, next);
  };

  const handleResetAmenities = () => {
    const reset = {
      petsAllowed: false,
      electricVehicle: false,
      mezzanine: false,
      balcony: false,
      elevator: false,
      freeTime: false,
    };
    setAmenities(reset);
    handleApplyFilter(undefined, undefined, undefined, undefined, undefined, reset);
  };

  const handleResetFilters = () => {
    setKhuVuc('all');
    setLoaiPhong('all');
    handleApplyFilter(undefined, 'all', 'all');
  };

  const isFilterActive = khuVuc !== 'all' || loaiPhong !== 'all';
  const activeAmenitiesCount = Object.values(amenities).filter(Boolean).length;
  const isAmenitiesActive = activeAmenitiesCount > 0;
  const isPriceActive = minPrice > 0 || maxPrice < MAX_PRICE_LIMIT;

  const minPercent = (minPrice / MAX_PRICE_LIMIT) * 100;
  const maxPercent = (maxPrice / MAX_PRICE_LIMIT) * 100;

  return (
    <div ref={containerRef} className="relative w-full max-w-[450px]">
      {/* Khung thẻ nổi trắng chuẩn bố trí Ảnh 1 */}
      <div className="w-full rounded-2xl bg-white p-3 sm:p-3.5 shadow-xl border border-slate-200/90 transition-all">
        {/* HÀNG 1: Ô nhập địa chỉ với icon MapPin bên trái + Nút tìm kiếm vuông góc bên phải (màu teal thương hiệu) */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            {/* Icon ghim vị trí (MapPin) như trong Ảnh 1 */}
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M12 21c-4.418-4.418-7-8.15-7-11.5a7 7 0 1114 0c0 3.35-2.582 7.082-7 11.5z"
                />
                <circle cx="12" cy="9.5" r="2.5" strokeWidth={1.8} />
              </svg>
            </div>

            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                if (searchHistory.length > 0) {
                  setActiveDropdown('history');
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  setActiveDropdown('none');
                  handleApplyFilter();
                }
              }}
              placeholder="Nhập địa chỉ, đường, phường..."
              className="w-full h-11 pl-10 pr-8 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all font-normal"
            />

            {/* Nút ✕ xóa nhanh từ khóa */}
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  handleApplyFilter('');
                  inputRef.current?.focus();
                }}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                title="Xóa từ khóa"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Nút tìm kiếm icon kính lúp chuẩn Ảnh 1 — Chỉnh màu Teal (#0d9488) đồng bộ màu chủ đạo website */}
          <button
            type="button"
            onClick={() => {
              setActiveDropdown('none');
              handleApplyFilter();
            }}
            className="h-11 w-11 shrink-0 rounded-xl bg-brand hover:bg-brand-700 active:scale-95 text-white flex items-center justify-center shadow-sm shadow-brand/25 transition-all cursor-pointer"
            title="Tìm kiếm"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>

        {/* HÀNG 2: 3 nút ngang theo đúng bố cục Ảnh 1: [Bộ lọc] [Tiện ích ⌄] [Khoảng giá ⌄] */}
        <div className="mt-2.5 flex items-center gap-2">
          {/* Nút 1: Bộ lọc (Icon Sliders) */}
          <button
            type="button"
            onClick={() => setActiveDropdown(activeDropdown === 'filter' ? 'none' : 'filter')}
            className={`flex-1 h-10 px-2.5 sm:px-3 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none ${
              isFilterActive || activeDropdown === 'filter'
                ? 'border-brand text-brand bg-teal-50/50 font-semibold shadow-xs'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:border-slate-300'
            }`}
          >
            {/* Icon bộ lọc gạt ngang như Ảnh 1 */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M3 6h6m4 0h8M3 12h12m4 0h2M3 18h6m4 0h8M9 4v4m6 2v4m-6 2v4" />
            </svg>
            <span>Bộ lọc</span>
            {isFilterActive && <span className="w-1.5 h-1.5 rounded-full bg-brand" />}
          </button>

          {/* Nút 2: Tiện ích (Icon Bed + Chevron) */}
          <button
            type="button"
            onClick={() => setActiveDropdown(activeDropdown === 'amenities' ? 'none' : 'amenities')}
            className={`flex-1 h-10 px-2.5 sm:px-3 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none ${
              isAmenitiesActive || activeDropdown === 'amenities'
                ? 'border-brand text-brand bg-teal-50/50 font-semibold shadow-xs'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:border-slate-300'
            }`}
          >
            {/* Icon giường tiện ích như Ảnh 1 */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 6v13M21 10v9M3 14h18M6 14V9a2 2 0 012-2h3a2 2 0 012 2v5" />
            </svg>
            <span>Tiện ích</span>
            {activeAmenitiesCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-brand text-white text-[10px] font-bold flex items-center justify-center">
                {activeAmenitiesCount}
              </span>
            )}
            <svg
              className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
                activeDropdown === 'amenities' ? 'rotate-180 text-brand' : 'text-slate-500'
              }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Nút 3: Khoảng giá (Icon Tag + Chevron) — hiển thị nhãn khoảng giá linh hoạt */}
          <button
            type="button"
            onClick={() => setActiveDropdown(activeDropdown === 'price' ? 'none' : 'price')}
            className={`flex-1 h-10 px-2.5 sm:px-3 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none ${
              isPriceActive || activeDropdown === 'price'
                ? 'border-brand text-brand bg-teal-50/50 font-semibold shadow-xs'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:border-slate-300'
            }`}
          >
            {/* Icon thẻ giá như Ảnh 1 */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 7h.01M3 12.414l8.586 8.586a2 2 0 002.828 0l7.172-7.172a2 2 0 000-2.828L13 2.414A2 2 0 0011.586 2H4a2 2 0 00-2 2v7.586a2 2 0 00.586 1.414z" />
            </svg>
            <span className="truncate">
              {getPriceButtonLabel(minPrice, maxPrice)}
            </span>
            <svg
              className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
                activeDropdown === 'price' ? 'rotate-180 text-brand' : 'text-slate-500'
              }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* POPUP 1: LỊCH SỬ TÌM KIẾM (Hiển thị khi focus ô tìm kiếm) */}
      {activeDropdown === 'history' && isHistoryLoaded && searchHistory.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-3.5 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Lịch sử tìm kiếm</span>
            </div>
            <button
              type="button"
              onClick={handleClearAllHistory}
              className="text-[11px] font-medium text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
            >
              Xóa tất cả
            </button>
          </div>

          <div className="space-y-1 max-h-48 overflow-y-auto">
            {searchHistory.map((term) => (
              <div
                key={term}
                onClick={() => handleSelectHistoryItem(term)}
                className="flex items-center justify-between px-2.5 py-2 rounded-xl hover:bg-teal-50/50 text-xs font-medium text-slate-700 cursor-pointer group transition-colors"
              >
                <div className="flex items-center gap-2 truncate">
                  <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="truncate group-hover:text-brand">{term}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleRemoveHistoryItem(e, term)}
                  className="w-5 h-5 rounded-md flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-slate-100 transition-colors shrink-0 ml-1"
                  title="Xóa mục này"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* POPUP 2: BỘ LỌC NÂNG CAO (Khu vực, Loại phòng: Phòng trọ, Chung cư mini, Chung cư, Mặt bằng kinh doanh) */}
      {activeDropdown === 'filter' && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-4 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800">Bộ lọc tìm phòng</h3>
            <button
              type="button"
              onClick={() => setActiveDropdown('none')}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3">
            {/* Lọc theo Khu vực */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Khu vực (Hà Nội)
              </label>
              <select
                value={khuVuc}
                onChange={(e) => {
                  const val = e.target.value;
                  setKhuVuc(val);
                  handleApplyFilter(undefined, val);
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 text-xs sm:text-sm font-medium text-slate-700 hover:border-slate-300 focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none cursor-pointer transition-all"
              >
                <option value="all">Tất cả khu vực</option>
                {HANOI_DISTRICT_GROUPS.map((grp) => (
                  <option key={grp.districtSlug} value={grp.district}>
                    {grp.district}
                  </option>
                ))}
              </select>
            </div>

            {/* Lọc theo Loại phòng: Đã cập nhật Chung cư, Mặt bằng kinh doanh, loại bỏ Ở ghép */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Loại phòng
              </label>
              <select
                value={loaiPhong}
                onChange={(e) => {
                  const val = e.target.value;
                  setLoaiPhong(val);
                  handleApplyFilter(undefined, undefined, val);
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 text-xs sm:text-sm font-medium text-slate-700 hover:border-slate-300 focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none cursor-pointer transition-all"
              >
                {PROPERTY_TYPES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              Đặt lại
            </button>
            <button
              type="button"
              onClick={() => setActiveDropdown('none')}
              className="px-4 py-2 rounded-xl bg-brand hover:bg-brand-700 text-white text-xs font-bold shadow-sm shadow-brand/20 transition-all cursor-pointer"
            >
              Áp dụng
            </button>
          </div>
        </div>
      )}

      {/* POPUP 3: TIỆN ÍCH (Nuôi thú cưng, Sạc xe điện, Gác xép, Ban công, Thang máy, Không chung chủ) */}
      {activeDropdown === 'amenities' && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-4 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800">Tiện ích phòng</h3>
            <button
              type="button"
              onClick={() => setActiveDropdown('none')}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {AMENITY_LIST.map((item) => {
              const active = amenities[item.key];
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => toggleAmenity(item.key)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium text-left transition-all cursor-pointer ${
                    active
                      ? 'border-brand bg-teal-50 text-brand font-semibold shadow-xs'
                      : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-md flex items-center justify-center border text-[10px] ${
                      active ? 'bg-brand border-brand text-white' : 'border-slate-300 bg-white'
                    }`}
                  >
                    {active && '✓'}
                  </span>
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handleResetAmenities}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              Đặt lại
            </button>
            <button
              type="button"
              onClick={() => setActiveDropdown('none')}
              className="px-4 py-2 rounded-xl bg-brand hover:bg-brand-700 text-white text-xs font-bold shadow-sm shadow-brand/20 transition-all cursor-pointer"
            >
              Áp dụng
            </button>
          </div>
        </div>
      )}

      {/* POPUP 4: KHOẢNG GIÁ THUÊ DẠNG THANH KÉO TRƯỢT (DUAL RANGE SLIDER GIỐNG MỤC TÌM PHÒNG) */}
      {activeDropdown === 'price' && (
        <div className="absolute top-full left-0 right-0 sm:left-auto sm:right-0 mt-2 z-50 w-full sm:w-[360px] bg-white rounded-2xl shadow-xl border border-slate-200/90 p-4 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs sm:text-sm font-bold text-slate-800">
              Khoảng giá thuê
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-brand">
                {isPriceActive
                  ? `${formatPriceNumber(minPrice)} – ${
                      maxPrice >= MAX_PRICE_LIMIT ? 'Trên 30 triệu' : formatPriceNumber(maxPrice)
                    }`
                  : 'Tất cả mức giá'}
              </span>
              <button
                type="button"
                onClick={() => setActiveDropdown('none')}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Thanh kéo kép (Dual Range Slider) */}
          <div className="pt-5 pb-2">
            <div className="relative h-2 w-full rounded-full bg-slate-200">
              <div
                className="absolute h-2 rounded-full bg-brand transition-all duration-75"
                style={{
                  left: `${minPercent}%`,
                  width: `${Math.max(0, maxPercent - minPercent)}%`,
                }}
              />
              <input
                type="range"
                min={0}
                max={MAX_PRICE_LIMIT}
                step={PRICE_STEP}
                value={minPrice}
                onChange={(e) => {
                  const val = Math.min(Number(e.target.value), maxPrice - PRICE_STEP);
                  setMinPrice(val);
                }}
                className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 w-full appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-brand [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-none"
                aria-label="Giá tối thiểu"
              />
              <input
                type="range"
                min={0}
                max={MAX_PRICE_LIMIT}
                step={PRICE_STEP}
                value={maxPrice}
                onChange={(e) => {
                  const val = Math.max(Number(e.target.value), minPrice + PRICE_STEP);
                  setMaxPrice(val);
                }}
                className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 w-full appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-brand [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-none"
                aria-label="Giá tối đa"
              />
            </div>

            {/* Mốc hiển thị dưới thanh trượt */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 select-none">
              <span>0đ</span>
              <span>10 triệu</span>
              <span>20 triệu</span>
              <span>30+ triệu</span>
            </div>
          </div>

          {/* Các mốc giá gợi ý nhanh */}
          <div className="mt-2 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
            {[
              { label: 'Tất cả', min: 0, max: MAX_PRICE_LIMIT },
              { label: '< 3 triệu', min: 0, max: 3000000 },
              { label: '3 – 5 triệu', min: 3000000, max: 5000000 },
              { label: '5 – 10 triệu', min: 5000000, max: 10000000 },
              { label: '10 – 20 triệu', min: 10000000, max: 20000000 },
              { label: '> 20 triệu', min: 20000000, max: MAX_PRICE_LIMIT },
            ].map((preset) => {
              const isSelected = minPrice === preset.min && maxPrice === preset.max;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setMinPrice(preset.min);
                    setMaxPrice(preset.max);
                  }}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-brand bg-teal-50 text-brand font-semibold shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          {/* Nút hành động trong popover */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                setMinPrice(0);
                setMaxPrice(MAX_PRICE_LIMIT);
                handleApplyFilter(undefined, undefined, undefined, 0, MAX_PRICE_LIMIT);
              }}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Đặt lại
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveDropdown('none');
                handleApplyFilter(undefined, undefined, undefined, minPrice, maxPrice);
              }}
              className="px-4 py-2 rounded-xl bg-brand hover:bg-brand-700 text-white text-xs font-bold shadow-sm shadow-brand/20 transition-all cursor-pointer"
            >
              Áp dụng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
