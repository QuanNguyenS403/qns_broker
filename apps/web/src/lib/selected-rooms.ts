'use client';

export interface SelectedRoomItem {
  id: string;
  title: string;
  slug?: string;
  price?: number | string;
  formattedPrice?: string;
  address?: string;
  coverImage?: string;
  selectedAt?: number;
}

const STORAGE_KEY = 'qns_selected_rooms';
const EVENT_NAME = 'qns_selected_rooms_change';

export function getSelectedRooms(): SelectedRoomItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveSelectedRooms(rooms: SelectedRoomItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
    window.dispatchEvent(new Event(EVENT_NAME));
  } catch (err) {
    console.error('Lỗi khi lưu phòng đã chọn:', err);
  }
}

export function addSelectedRoom(room: SelectedRoomItem): void {
  const current = getSelectedRooms();
  if (current.some((r) => String(r.id) === String(room.id))) return;
  const updated = [{ ...room, selectedAt: Date.now() }, ...current];
  saveSelectedRooms(updated);
}

export function removeSelectedRoom(id: string | number): void {
  const current = getSelectedRooms();
  const updated = current.filter((r) => String(r.id) !== String(id));
  saveSelectedRooms(updated);
}

export function clearSelectedRooms(): void {
  saveSelectedRooms([]);
}

export function isRoomSelected(id: string | number): boolean {
  const current = getSelectedRooms();
  return current.some((r) => String(r.id) === String(id));
}

export function subscribeSelectedRooms(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(EVENT_NAME, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(EVENT_NAME, callback);
    window.removeEventListener('storage', callback);
  };
}
