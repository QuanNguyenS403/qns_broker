'use client';

import { useState, useEffect, useCallback } from 'react';

interface PropertyGalleryProps {
  images: { imageUrl: string; sortOrder: number }[];
  title: string;
}

export function PropertyGallery({ images = [], title }: PropertyGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const hasImages = images && images.length > 0;
  const safeActiveIndex = hasImages ? Math.min(activeIndex, images.length - 1) : 0;
  const activeImage = hasImages ? (images[safeActiveIndex] ?? images[0]) : null;

  const handlePrev = useCallback(() => {
    if (!hasImages) return;
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  }, [hasImages, images.length]);

  const handleNext = useCallback(() => {
    if (!hasImages) return;
    setActiveIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  }, [hasImages, images.length]);

  // Điều hướng bằng phím mũi tên và Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape') setIsFullscreen(false);
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext]);

  function handleTouchStart(e: React.TouchEvent) {
    setTouchStartX(e.touches[0].clientX);
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    setTouchStartX(null);
  }

  if (!hasImages || !activeImage) {
    return (
      <div className="overflow-hidden rounded-2xl bg-slate-100 p-2 shadow-card">
        <div className="aspect-video w-full flex items-center justify-center bg-slate-50 rounded-xl">
          <svg className="h-16 w-16 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 21h18M3.75 3h16.5M4.5 3v18m15-18v18" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl bg-white p-2 shadow-card space-y-2">
        {/* Ảnh chính có hỗ trợ vuốt chạm trên mobile và phóng to khi click */}
        <div
          className="group relative aspect-video w-full overflow-hidden rounded-xl bg-slate-100 touch-pan-y select-none cursor-pointer"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={() => setIsFullscreen(true)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activeImage.imageUrl}
            alt={`${title} - ảnh ${safeActiveIndex + 1}`}
            decoding="async"
            className="h-full w-full object-cover transition-all duration-200"
            style={{ willChange: 'transform', transform: 'translateZ(0)' }}
          />

          {/* Nút Xem toàn màn hình */}
          <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm opacity-80 group-hover:opacity-100 transition-opacity">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
            </svg>
            <span>Phóng to</span>
          </div>

          {/* Nút Previous / Next */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Xem ảnh trước"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm opacity-80 md:opacity-0 transition-opacity duration-150 md:group-hover:opacity-100 hover:bg-black/80 active:scale-95"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <button
                type="button"
                aria-label="Xem ảnh tiếp theo"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm opacity-80 md:opacity-0 transition-opacity duration-150 md:group-hover:opacity-100 hover:bg-black/80 active:scale-95"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </>
          )}

          {/* Chỉ số ảnh badge */}
          {images.length > 1 && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 21h18M3.75 3h16.5M4.5 3v18m15-18v18" />
              </svg>
              <span>{safeActiveIndex + 1} / {images.length}</span>
            </div>
          )}
        </div>

        {/* Dải thumbnail tương tác với aria-label */}
        {images.length > 1 && (
          <div className="grid grid-cols-5 gap-1.5">
            {images.slice(0, 5).map((img, idx) => (
              <button
                key={img.imageUrl}
                type="button"
                aria-label={`Chọn ảnh số ${idx + 1}`}
                onClick={() => {
                  if (idx === 4 && images.length > 5) {
                    setIsFullscreen(true);
                  } else {
                    setActiveIndex(idx);
                  }
                }}
                className={`relative aspect-square overflow-hidden rounded-lg transition-all active:scale-95 ${
                  idx === safeActiveIndex
                    ? 'ring-2 ring-brand ring-offset-1 opacity-100'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.imageUrl}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
                {idx === 4 && images.length > 5 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs font-bold text-white">
                    +{images.length - 5}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal phóng to xem toàn màn hình (F47) */}
      {isFullscreen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Xem ảnh phóng to"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 p-4 animate-fade-in backdrop-blur-md"
          onClick={() => setIsFullscreen(false)}
        >
          {/* Nút đóng */}
          <button
            type="button"
            aria-label="Đóng xem ảnh toàn màn hình"
            onClick={() => setIsFullscreen(false)}
            className="absolute top-5 right-5 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Vùng ảnh chính phóng to */}
          <div
            className="relative flex items-center justify-center max-w-5xl max-h-[80vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeImage.imageUrl}
              alt={`${title} - ảnh ${safeActiveIndex + 1}`}
              className="max-h-[80vh] max-w-full object-contain rounded-xl shadow-2xl"
            />

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Xem ảnh trước"
                  onClick={handlePrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-all active:scale-95"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="Xem ảnh tiếp theo"
                  onClick={handleNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-all active:scale-95"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Dải thumbnail bên dưới modal */}
          {images.length > 1 && (
            <div
              className="mt-4 flex max-w-4xl gap-2 overflow-x-auto p-2"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((img, idx) => (
                <button
                  key={img.imageUrl}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg transition-all ${
                    idx === safeActiveIndex ? 'ring-2 ring-brand opacity-100 scale-105' : 'opacity-50 hover:opacity-100'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.imageUrl} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
