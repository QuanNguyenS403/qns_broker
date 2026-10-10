import fs from 'fs';
import path from 'path';
import type { Listing } from './api';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'custom-listings.json');

function ensureDataFile() {
  try {
    const dir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE_PATH)) {
      fs.writeFileSync(DATA_FILE_PATH, '[]', 'utf-8');
    }
  } catch (err) {
    console.warn('Lỗi kiểm tra tệp lưu trữ custom-listings.json:', err);
  }
}

export function getCustomListingsServer(): Listing[] {
  try {
    ensureDataFile();
    if (!fs.existsSync(DATA_FILE_PATH)) return [];
    const content = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => {
      const rawOwner = item?.owner?.fullName || '';
      if (!rawOwner || /qns broker|dẫn xem|đức quân|môi giới/i.test(rawOwner)) {
        return {
          ...item,
          owner: {
            ...(item?.owner || {}),
            fullName: 'Chủ nhà',
          },
        };
      }
      return item;
    });
  } catch (err) {
    console.warn('Lỗi đọc custom listings từ máy chủ:', err);
    return [];
  }
}

export function getCustomListingBySlugServer(slugOrId: string): Listing | null {
  if (!slugOrId) return null;
  const list = getCustomListingsServer();
  if (list.length === 0) return null;

  const normalizedInput = slugOrId.trim().toLowerCase();

  // 1. Tìm chính xác theo slug
  const exactSlug = list.find((item) => item.slug?.toLowerCase() === normalizedInput);
  if (exactSlug) return exactSlug;

  // 2. Tìm chính xác theo id
  const exactId = list.find((item) => String(item.id).toLowerCase() === normalizedInput);
  if (exactId) return exactId;

  // 3. Tìm theo id trích xuất từ slug (dạng -id{id})
  const idMatch = normalizedInput.match(/-id([a-zA-Z0-9_-]+)$/);
  if (idMatch) {
    const extractedId = idMatch[1].toLowerCase();
    const matchExtracted = list.find((item) => {
      const itemId = String(item.id).toLowerCase();
      return itemId === extractedId || item.slug?.toLowerCase().endsWith(`-id${extractedId}`);
    });
    if (matchExtracted) return matchExtracted;
  }

  // 4. Tìm theo một phần slug
  const partialMatch = list.find((item) => {
    const itemSlug = item.slug?.toLowerCase() || '';
    return itemSlug.includes(normalizedInput) || normalizedInput.includes(itemSlug);
  });
  if (partialMatch) return partialMatch;

  return null;
}

export function saveCustomListingServer(listing: any): Listing {
  try {
    ensureDataFile();
    const normalizedListing = {
      ...listing,
      owner: {
        ...(listing?.owner || {}),
        fullName: 'Chủ nhà',
      },
    };
    const list = getCustomListingsServer();
    const existingIndex = list.findIndex(
      (item) => String(item.id) === String(normalizedListing.id) || item.slug === normalizedListing.slug
    );

    let updatedList: Listing[];
    if (existingIndex >= 0) {
      updatedList = [...list];
      updatedList[existingIndex] = { ...updatedList[existingIndex], ...normalizedListing };
    } else {
      updatedList = [normalizedListing, ...list];
    }

    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(updatedList, null, 2), 'utf-8');
    return normalizedListing;
  } catch (err) {
    console.warn('Lỗi lưu custom listing vào máy chủ:', err);
    return listing;
  }
}

export function updateCustomListingStatusServer(idOrSlug: string, status: string): boolean {
  try {
    ensureDataFile();
    const list = getCustomListingsServer();
    const targetIndex = list.findIndex(
      (item) => String(item.id) === String(idOrSlug) || item.slug === idOrSlug
    );
    if (targetIndex < 0) return false;
    list[targetIndex] = {
      ...list[targetIndex],
      status,
    };
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(list, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.warn('Lỗi cập nhật trạng thái custom listing trên máy chủ:', err);
    return false;
  }
}

export function getCustomListingsByOwnerServer(ownerId?: string, ownerEmail?: string): Listing[] {
  const list = getCustomListingsServer();
  const cleanOwnerId = ownerId ? String(ownerId) : '';
  const cleanEmail = ownerEmail ? ownerEmail.toLowerCase().trim() : '';

  if (!cleanOwnerId && !cleanEmail) return [];

  return list.filter((item: any) => {
    const itemOwnerId = String(item.ownerId || item.owner?.id || '');
    const itemOwnerEmail = String(item.ownerEmail || item.owner?.email || '').toLowerCase().trim();

    if (cleanOwnerId && itemOwnerId && itemOwnerId === cleanOwnerId) return true;
    if (cleanEmail && itemOwnerEmail && itemOwnerEmail === cleanEmail) return true;
    return false;
  });
}

export function getPublicCustomListingsServer(): Listing[] {
  const list = getCustomListingsServer();
  // Khách tìm phòng CHỈ thấy tin active, TUYỆT ĐỐI không hiển thị tin đã cho thuê (rented) hoặc đã gỡ (removed)
  return list.filter((item) => item.status === 'active');
}

export function deleteCustomListingServer(id: string): boolean {
  try {
    ensureDataFile();
    const list = getCustomListingsServer();
    const filtered = list.filter((item) => String(item.id) !== String(id));
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(filtered, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.warn('Lỗi xóa custom listing trên máy chủ:', err);
    return false;
  }
}
