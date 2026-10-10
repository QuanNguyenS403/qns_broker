/**
 * auth-client.ts — fetch có gắn sẵn Bearer accessToken, tự động thử làm mới token khi hết hạn.
 *
 * PHÁT HIỆN QUA AUDIT ĐỘC LẬP (01/09/2026): backend đã có endpoint `POST /auth/refresh` (được
 * thêm ở đợt sửa trước) và `dang-nhap/page.tsx` đã lưu cả `accessToken` lẫn `refreshToken` vào
 * localStorage sau khi đăng nhập — NHƯNG không có bất kỳ đoạn code frontend nào thực sự GỌI
 * `/auth/refresh`. Với `JWT_ACCESS_EXPIRES_IN=15m` (mặc định trong .env.example), hậu quả là:
 * cứ sau 15 phút hoạt động, MỌI request cần xác thực (bấm hiện số điện thoại, đăng tin, kiểm
 * tra trạng thái đăng nhập ở Header...) đều nhận 401 — và `Header.tsx` coi 401 ở `/auth/me` là
 * "chưa đăng nhập" rồi tự xoá token — nghĩa là người dùng bị ĐĂNG XUẤT ÂM THẦM sau mỗi 15 phút
 * dù `refreshToken` (hạn 7 ngày) vẫn còn hoàn toàn hợp lệ. Đây là lỗi ảnh hưởng trải nghiệm
 * nghiêm trọng trên một trang có phiên duyệt web thường kéo dài hơn 15 phút.
 *
 * Hàm `authFetch` bên dưới thay thế mọi chỗ đang tự đọc localStorage + gọi fetch thủ công —
 * khi gặp 401, tự thử `/auth/refresh` MỘT lần bằng refreshToken đang lưu, cập nhật lại token
 * mới, rồi gọi lại request gốc; chỉ khi refresh cũng thất bại mới thực sự coi là hết phiên.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken') || localStorage.getItem('access_token');
}

export function getRefreshToken(): string | null {
  return typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
}

export function normalizeUserAccount(user: any): any {
  if (!user) return user;
  const rawEmail = String(user.email || '').trim().toLowerCase();
  const rawPhone = String(user.phone || '').replace(/\D/g, '');
  const isAdmin =
    rawEmail === 'ducquan16102006@gmail.com' ||
    rawEmail === 'admin@qns.com' ||
    rawEmail === 'contact@qns.com' ||
    rawPhone === '0981753082';

  if (isAdmin) {
    return {
      ...user,
      id: '1',
      fullName: 'Chủ nhà',
      email: rawEmail.includes('@') ? rawEmail : 'ducquan16102006@gmail.com',
      phone: '0981 753 082',
      role: 'admin',
    };
  }
  return user;
}

export function setTokens(accessToken: string, refreshToken: string, user?: any) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  localStorage.removeItem('access_token'); // Xóa key cũ để thống nhất 1 key duy nhất
  if (user) {
    try {
      const normalized = normalizeUserAccount(user);
      localStorage.setItem('user', JSON.stringify(normalized));
    } catch {}
  }
  window.dispatchEvent(new Event('storage'));
}

export function setCurrentUser(user: any) {
  if (typeof window === 'undefined') return;
  try {
    const normalized = normalizeUserAccount(user);
    localStorage.setItem('user', JSON.stringify(normalized));
  } catch {}
  window.dispatchEvent(new Event('storage'));
}

export function getCurrentUser(): any | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('user');
    return raw ? normalizeUserAccount(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

/** Giải mã Google ID token JWT an toàn phía client (hỗ trợ đầy đủ tiếng Việt UTF-8) */
export function parseGoogleJwt(token: string): {
  sub?: string;
  email?: string;
  name?: string;
  picture?: string;
  email_verified?: boolean;
} | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function clearTokens() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('access_token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  window.dispatchEvent(new Event('storage'));
}

export function isLoggedIn(): boolean {
  return !!getAccessToken();
}

/** Gọi /auth/refresh bằng refreshToken hiện có. Trả về accessToken mới, hoặc null nếu thất bại. */
async function tryRefreshToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    setTokens(data.accessToken, data.refreshToken);
    return data.accessToken as string;
  } catch {
    return null;
  }
}

/**
 * fetch có Bearer token, tự retry 1 lần sau khi refresh nếu gặp 401.
 * Dùng thay cho fetch() thủ công ở MỌI nơi cần gọi API đã đăng nhập từ Client Component.
 */
export async function authFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const doFetch = (token: string | null) =>
    fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        ...(init.headers ?? {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

  let res = await doFetch(getAccessToken());

  if (res.status === 401) {
    const newToken = await tryRefreshToken();
    if (newToken) {
      res = await doFetch(newToken);
    } else {
      // refreshToken cũng không còn dùng được nữa (hết hạn 7 ngày, hoặc bị thu hồi) —
      // đây mới thực sự là lúc coi như hết phiên đăng nhập.
      clearTokens();
    }
  }

  return res;
}

/** Lấy storage key riêng biệt cho tin đăng của từng tài khoản (đồng bộ theo email) */
export function getUserListingStorageKey(user?: any): string {
  const u = normalizeUserAccount(user || getCurrentUser());
  if (!u) return 'qns_custom_listings_guest';
  const emailKey = u.email ? String(u.email).toLowerCase().replace(/[^a-zA-Z0-9_-]/g, '_') : '';
  const idKey = u.id ? String(u.id).replace(/[^a-zA-Z0-9_-]/g, '_') : '';
  // Ưu tiên key theo email để đồng bộ 100% giữa Google Sign-In và đăng nhập email/mật khẩu
  return `qns_custom_listings_acc_${emailKey || idKey || 'anon'}`;
}

/** Kiểm tra xem một tin đăng có thuộc về tài khoản người dùng cụ thể hay không */
export function isListingBelongToUser(item: any, user: any): boolean {
  if (!item || !user) return false;
  const u = normalizeUserAccount(user);
  const currentId = u.id ? String(u.id).trim() : '';
  const currentEmail = u.email ? String(u.email).toLowerCase().trim() : '';

  const itemOwnerId = String(item.ownerId || item.owner?.id || '').trim();
  const itemOwnerEmail = String(item.ownerEmail || item.owner?.email || '').toLowerCase().trim();

  // Khớp chính xác theo Email tài khoản (ưu tiên cao nhất để đồng bộ các phương thức đăng nhập)
  if (currentEmail && itemOwnerEmail && itemOwnerEmail === currentEmail) {
    return true;
  }

  // Khớp chính xác theo ID tài khoản
  if (currentId && itemOwnerId && itemOwnerId === currentId) {
    return true;
  }

  return false;
}

/** Lấy danh sách tin đăng chỉ thuộc về tài khoản hiện tại — cô lập tuyệt đối dữ liệu giữa các tài khoản */
export function getAccountCustomListings(user?: any): any[] {
  if (typeof window === 'undefined') return [];
  const u = normalizeUserAccount(user || getCurrentUser());
  if (!u) return [];

  const accountKey = getUserListingStorageKey(u);
  const result: any[] = [];
  const seenIds = new Set<string>();

  // Gom các key lưu trữ có thể có từ các phiên đăng nhập trước của cùng tài khoản
  const keysToCheck = [accountKey];
  if (u.id) {
    const idKey = `qns_custom_listings_acc_${String(u.id).replace(/[^a-zA-Z0-9_-]/g, '_')}`;
    if (!keysToCheck.includes(idKey)) keysToCheck.push(idKey);
  }
  if (u.role === 'admin' || u.email === 'ducquan16102006@gmail.com') {
    if (!keysToCheck.includes('qns_custom_listings_acc_1')) {
      keysToCheck.push('qns_custom_listings_acc_1');
    }
  }

  // 1. Đọc từ kho lưu trữ riêng của chính tài khoản này và các key liên kết
  for (const k of keysToCheck) {
    try {
      const rawAccount = localStorage.getItem(k);
      if (rawAccount) {
        const parsed = JSON.parse(rawAccount);
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            const idStr = String(item.id);
            if (!seenIds.has(idStr)) {
              seenIds.add(idStr);
              result.push(item);
            }
          }
        }
      }
    } catch {}
  }

  // 2. Kiểm tra kho chung và chỉ lấy các tin thực sự thuộc về tài khoản này (nếu chưa có trong kho riêng)
  try {
    const rawGlobal = localStorage.getItem('qns_custom_listings');
    if (rawGlobal) {
      const parsedGlobal = JSON.parse(rawGlobal);
      if (Array.isArray(parsedGlobal)) {
        for (const item of parsedGlobal) {
          if (isListingBelongToUser(item, u)) {
            const idStr = String(item.id);
            if (!seenIds.has(idStr)) {
              seenIds.add(idStr);
              result.push(item);
            }
          }
        }
      }
    }
  } catch {}

  // Tự động đồng bộ vào accountKey chuẩn
  if (result.length > 0) {
    try {
      localStorage.setItem(accountKey, JSON.stringify(result));
    } catch {}
  }

  return result;
}

/** Lưu tin đăng mới vào đúng tài khoản hiện tại */
export function saveAccountCustomListing(item: any, user?: any) {
  if (typeof window === 'undefined') return;
  const u = user || getCurrentUser();
  if (!u) return;

  const enrichedItem = {
    ...item,
    ownerId: String(u.id || item.ownerId || '1'),
    ownerEmail: (u.email || item.ownerEmail || '').toLowerCase(),
    owner: {
      ...(item.owner || {}),
      id: String(u.id || item.owner?.id || '1'),
      email: u.email || item.owner?.email || null,
      fullName: u.fullName || item.owner?.fullName || 'Chủ nhà',
      phone: u.phone || item.owner?.phone || '0981 753 082',
    },
  };

  // 1. Lưu vào kho riêng của tài khoản
  const accountKey = getUserListingStorageKey(u);
  try {
    const currentList = getAccountCustomListings(u);
    const existingIndex = currentList.findIndex((it) => String(it.id) === String(enrichedItem.id));
    let nextList: any[];
    if (existingIndex >= 0) {
      nextList = [...currentList];
      nextList[existingIndex] = enrichedItem;
    } else {
      nextList = [enrichedItem, ...currentList];
    }
    localStorage.setItem(accountKey, JSON.stringify(nextList));
  } catch {}

  // 2. Đồng bộ vào kho chung (với đầy đủ ownerId/ownerEmail) để các trang công khai biết đến nếu active
  try {
    const rawGlobal = localStorage.getItem('qns_custom_listings');
    const globalList: any[] = rawGlobal ? JSON.parse(rawGlobal) : [];
    const existingIdx = globalList.findIndex((it) => String(it.id) === String(enrichedItem.id));
    let nextGlobal: any[];
    if (existingIdx >= 0) {
      nextGlobal = [...globalList];
      nextGlobal[existingIdx] = enrichedItem;
    } else {
      nextGlobal = [enrichedItem, ...globalList];
    }
    localStorage.setItem('qns_custom_listings', JSON.stringify(nextGlobal));
  } catch {}

  window.dispatchEvent(new Event('qns_listings_updated'));
}

/** Cập nhật trạng thái tin đăng (ví dụ rented, removed) trong kho riêng và kho chung */
export function updateAccountListingStatus(listingId: string, status: string, user?: any) {
  if (typeof window === 'undefined') return;
  const u = user || getCurrentUser();

  // 1. Cập nhật kho riêng của tài khoản
  if (u) {
    const accountKey = getUserListingStorageKey(u);
    try {
      const currentList = getAccountCustomListings(u);
      const updated = currentList.map((it) =>
        String(it.id) === String(listingId) ? { ...it, status } : it
      );
      localStorage.setItem(accountKey, JSON.stringify(updated));
    } catch {}
  }

  // 2. Cập nhật kho chung
  try {
    const rawGlobal = localStorage.getItem('qns_custom_listings');
    if (rawGlobal) {
      const globalList = JSON.parse(rawGlobal);
      if (Array.isArray(globalList)) {
        const updatedGlobal = globalList.map((it) =>
          String(it.id) === String(listingId) ? { ...it, status } : it
        );
        localStorage.setItem('qns_custom_listings', JSON.stringify(updatedGlobal));
      }
    }
  } catch {}

  window.dispatchEvent(new Event('qns_listings_updated'));
}
