'use client';

import { useEffect, useState } from 'react';
import { Listing } from '@/lib/api';
import { ListingCard } from './ListingCard';
import { healCustomListingsInLocalStorage, sanitizeListingImages } from '@/lib/image-compressor';

interface Props {
  initialListings: Listing[];
}

export function ListingsGridWithCustom({ initialListings }: Props) {
  const [customListings, setCustomListings] = useState<Listing[]>([]);
  const [rentedSlugs, setRentedSlugs] = useState<Set<string>>(new Set());

  useEffect(() => {
    function loadCustomListings() {
      try {
        healCustomListingsInLocalStorage();
        const raw = localStorage.getItem('qns_custom_listings');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            // Tập hợp các tin đã cho thuê (rented) hoặc đã gỡ (removed) để loại bỏ hoàn toàn
            const inactive = new Set<string>();
            const activeList: Listing[] = [];

            for (const item of parsed) {
              const itemSlug = item.slug ? String(item.slug).toLowerCase() : '';
              const itemId = item.id ? String(item.id).toLowerCase() : '';
              const st = (item.status || 'pending').toLowerCase();

              if (st === 'rented' || st === 'removed' || st === 'rejected') {
                if (itemSlug) inactive.add(itemSlug);
                if (itemId) inactive.add(itemId);
              } else if (st === 'active') {
                activeList.push({
                  ...item,
                  images: sanitizeListingImages(item.images),
                });
              }
            }

            setRentedSlugs(inactive);
            setCustomListings(activeList);
            return;
          }
        }
        setCustomListings([]);
        setRentedSlugs(new Set());
      } catch (err) {
        console.warn('Lỗi đọc danh sách tin tự đăng:', err);
      }
    }

    loadCustomListings();
    window.addEventListener('qns_listings_updated', loadCustomListings);
    return () => window.removeEventListener('qns_listings_updated', loadCustomListings);
  }, []);

  // Chỉ hiển thị các tin còn phòng (active), tự động loại bỏ triệt để phòng đã cho thuê
  const customSlugs = new Set(customListings.map((l) => l.slug?.toLowerCase()));
  const validInitial = initialListings.filter((l) => {
    const slugKey = l.slug?.toLowerCase() || '';
    const idKey = String(l.id).toLowerCase();
    const st = (l.status || 'active').toLowerCase();

    // Loại bỏ nếu đã cho thuê hoặc đã gỡ
    if (st === 'rented' || st === 'removed') return false;
    if (rentedSlugs.has(slugKey) || rentedSlugs.has(idKey)) return false;
    return !customSlugs.has(slugKey);
  });

  const merged = [...customListings, ...validInitial];

  return (
    <div className="mt-6 sm:mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-6">
      {merged.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
