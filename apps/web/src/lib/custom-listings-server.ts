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
    return Array.isArray(parsed) ? parsed : [];
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
    const list = getCustomListingsServer();
    const existingIndex = list.findIndex(
      (item) => String(item.id) === String(listing.id) || item.slug === listing.slug
    );

    let updatedList: Listing[];
    if (existingIndex >= 0) {
      updatedList = [...list];
      updatedList[existingIndex] = { ...updatedList[existingIndex], ...listing };
    } else {
      updatedList = [listing, ...list];
    }

    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(updatedList, null, 2), 'utf-8');
    return listing;
  } catch (err) {
    console.warn('Lỗi lưu custom listing vào máy chủ:', err);
    return listing;
  }
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
