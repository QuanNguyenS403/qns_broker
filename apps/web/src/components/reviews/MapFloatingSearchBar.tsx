'use client';

import { useState, useEffect } from 'react';
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

export function MapFloatingSearchBar({ onSearch, totalFilteredCount }: MapFloatingSearchBarProps) {
  const [query, setQuery] = useState('');
  const [khuVuc, setKhuVuc] = useState('all');
  const [loaiPhong, setLoaiPhong] = useState('all');
  const [giaThue, setGiaThue] = useState('all');

  const [amenities, setAmenities] = useState({
    petsAllowed: false,
    electricVehicle: false,
    mezzanine: false,
    balcony: false,
    elevator: false,
    freeTime: false,
  });

  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);

  useEffect(() => {
    setSearchHistory(getSearchHistory());
    setIsHistoryLoaded(true);
  }, []);

  const handleApplyFilter = (customQuery?: string) => {
    const finalQuery = customQuery !== undefined ? customQuery : query;
    if (finalQuery.trim()) {
      const updated = addSearchHistory(finalQuery.trim());
      setSearchHistory(updated);
    }
    onSearch({
      query: finalQuery,
      khuVuc,
      loaiPhong,
      giaThue,
      amenities,
    });
  };

  const handleSelectHistoryItem = (term: string) => {
    setQuery(term);
    handleApplyFilter(term);
  };

  const handleRemoveHistoryItem = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    const updated = removeSearchHistory(term);
    setSearchHistory(updated);
  };

  const handleClearAllHistory = () => {
    clearSearchHistory();
    setSearchHistory([]);
  };

  const toggleAmenity = (key: keyof typeof amenities) => {
    const next = { ...amenities, [key]: !amenities[key] };
    setAmenities(next);
    onSearch({
      query,
      khuVuc,
      loaiPhong,
      giaThue,
      amenities: next,
    });
  };

  return (
    <div className="w-full rounded-2xl sm:rounded-3xl bg-white/95 backdrop-blur-md p-4 sm:p-5 md:p-6 shadow-xl border border-slate-200/80 transition-all">
      {/* Tiêu đề & Mô tả từ Ảnh 2 */}
      <div className="mb-3.5 sm:mb-4">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Tìm phòng
        </h2>
        <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
          Tìm kiếm nhanh theo khu vực, trường học, mức giá và nhu cầu của bạn
        </p>
      </div>

      {/* Dãy điều khiển tìm kiếm chính (Ảnh 2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 sm:gap-3 items-center">
        {/* Ô nhập từ khóa địa chỉ / tên đường */}
        <div className="relative sm:col-span-2 lg:col-span-4">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleApplyFilter();
              }
            }}
            placeholder="Tìm theo khu vực, tên đường, loại phòng..."
            className="w-full pl-10 pr-9 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-slate-50/60 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                handleApplyFilter('');
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              title="Xóa từ khóa"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Dropdown Khu vực */}
        <div className="sm:col-span-1 lg:col-span-2">
          <select
            value={khuVuc}
            onChange={(e) => {
              const val = e.target.value;
              setKhuVuc(val);
              onSearch({
                query,
                khuVuc: val,
                loaiPhong,
                giaThue,
                amenities,
              });
            }}
            className="w-full px-3 sm:px-3.5 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-slate-50/60 text-xs sm:text-sm font-medium text-slate-700 hover:border-slate-300 focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all outline-none cursor-pointer"
          >
            <option value="all">Khu vực</option>
            {HANOI_DISTRICT_GROUPS.map((grp) => (
              <option key={grp.districtSlug} value={grp.district}>
                {grp.district}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown Loại phòng */}
        <div className="sm:col-span-1 lg:col-span-2">
          <select
            value={loaiPhong}
            onChange={(e) => {
              const val = e.target.value;
              setLoaiPhong(val);
              onSearch({
                query,
                khuVuc,
                loaiPhong: val,
                giaThue,
                amenities,
              });
            }}
            className="w-full px-3 sm:px-3.5 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-slate-50/60 text-xs sm:text-sm font-medium text-slate-700 hover:border-slate-300 focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all outline-none cursor-pointer"
          >
            <option value="all">Loại phòng</option>
            <option value="phong_tro">Phòng trọ</option>
            <option value="chung_cu_mini">Chung cư mini</option>
            <option value="can_ho">Căn hộ</option>
            <option value="nha_nguyen_can">Nhà nguyên căn</option>
            <option value="o_ghep">Ở ghép</option>
          </select>
        </div>

        {/* Dropdown Giá thuê */}
        <div className="sm:col-span-1 lg:col-span-2">
          <select
            value={giaThue}
            onChange={(e) => {
              const val = e.target.value;
              setGiaThue(val);
              onSearch({
                query,
                khuVuc,
                loaiPhong,
                giaThue: val,
                amenities,
              });
            }}
            className="w-full px-3 sm:px-3.5 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-slate-50/60 text-xs sm:text-sm font-medium text-slate-700 hover:border-slate-300 focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all outline-none cursor-pointer"
          >
            <option value="all">Giá thuê</option>
            <option value="under_3m">Dưới 3 triệu</option>
            <option value="3m_5m">Từ 3 - 5 triệu</option>
            <option value="5m_8m">Từ 5 - 8 triệu</option>
            <option value="above_8m">Trên 8 triệu</option>
          </select>
        </div>

        {/* Nút Tìm phòng */}
        <div className="sm:col-span-1 lg:col-span-2">
          <button
            type="button"
            onClick={() => handleApplyFilter()}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 sm:py-3 px-4 rounded-xl bg-brand hover:bg-brand-700 active:scale-[0.98] text-white text-xs sm:text-sm font-bold shadow-md shadow-brand/20 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>Tìm phòng</span>
          </button>
        </div>
      </div>

      {/* Dãy Bộ lọc thêm (Ảnh 2) */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 mr-1 shrink-0">
          Bộ lọc thêm:
        </span>

        <button
          type="button"
          onClick={() => toggleAmenity('petsAllowed')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            amenities.petsAllowed
              ? 'bg-brand text-white shadow-xs font-semibold'
              : 'bg-slate-100/80 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <span>Nuôi thú cưng</span>
        </button>

        <button
          type="button"
          onClick={() => toggleAmenity('electricVehicle')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            amenities.electricVehicle
              ? 'bg-brand text-white shadow-xs font-semibold'
              : 'bg-slate-100/80 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <span>Sạc xe điện</span>
        </button>

        <button
          type="button"
          onClick={() => toggleAmenity('mezzanine')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            amenities.mezzanine
              ? 'bg-brand text-white shadow-xs font-semibold'
              : 'bg-slate-100/80 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <span>Có gác xép</span>
        </button>

        <button
          type="button"
          onClick={() => toggleAmenity('balcony')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            amenities.balcony
              ? 'bg-brand text-white shadow-xs font-semibold'
              : 'bg-slate-100/80 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <span>Ban công</span>
        </button>

        <button
          type="button"
          onClick={() => toggleAmenity('elevator')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            amenities.elevator
              ? 'bg-brand text-white shadow-xs font-semibold'
              : 'bg-slate-100/80 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <span>Thang máy</span>
        </button>

        <button
          type="button"
          onClick={() => toggleAmenity('freeTime')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            amenities.freeTime
              ? 'bg-brand text-white shadow-xs font-semibold'
              : 'bg-slate-100/80 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <span>Không chung chủ</span>
        </button>
      </div>

      {/* Dãy Lịch sử tìm kiếm (Ảnh 1 + Yêu cầu đề bài) */}
      {isHistoryLoaded && searchHistory.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-1.5 sm:gap-2">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 mr-1 shrink-0">
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Lịch sử:</span>
          </div>

          {searchHistory.map((term) => (
            <div
              key={term}
              onClick={() => handleSelectHistoryItem(term)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200/60 text-slate-700 text-xs font-medium cursor-pointer transition-all active:scale-95 group"
            >
              <svg className="w-3 h-3 text-slate-400 group-hover:text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="truncate max-w-[140px] sm:max-w-[200px]">{term}</span>
              <button
                type="button"
                onClick={(e) => handleRemoveHistoryItem(e, term)}
                className="w-4 h-4 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-slate-200 transition-colors ml-0.5"
                title="Xóa mục tìm kiếm này"
              >
                ✕
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={handleClearAllHistory}
            className="text-[11px] font-medium text-slate-400 hover:text-rose-600 hover:underline px-1.5 py-0.5 transition-colors"
          >
            Xóa tất cả
          </button>
        </div>
      )}
    </div>
  );
}
