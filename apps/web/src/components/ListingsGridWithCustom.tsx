'use client';

import { useEffect, useState } from 'react';
import { Listing } from '@/lib/api';
import { ListingCard } from './ListingCard';

interface Props {
  initialListings: Listing[];
}

export function ListingsGridWithCustom({ initialListings }: Props) {
  const [customListings, setCustomListings] = useState<Listing[]>([]);

  useEffect(() => {
    function loadCustomListings() {
      try {
        const raw = localStorage.getItem('qns_custom_listings');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            setCustomListings(parsed);
          }
        }
      } catch (err) {
        console.warn('Lỗi đọc danh sách tin tự đăng:', err);
      }
    }

    loadCustomListings();
    window.addEventListener('qns_listings_updated', loadCustomListings);
    return () => window.removeEventListener('qns_listings_updated', loadCustomListings);
  }, []);

  // Đưa các tin do chủ sàn vừa đăng lên vị trí đầu tiên
  const customSlugs = new Set(customListings.map((l) => l.slug));
  const merged = [...customListings, ...initialListings.filter((l) => !customSlugs.has(l.slug))];

  return (
    <div className="mt-6 sm:mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-6">
      {merged.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
