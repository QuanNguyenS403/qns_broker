'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authFetch, getAccessToken, setTokens, parseGoogleJwt, saveAccountCustomListing } from '@/lib/auth-client';
import { GoogleMapAddressPicker, type SelectedUniversityDistance } from '@/components/GoogleMapAddressPicker';
import { compressImage } from '@/lib/image-compressor';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import { AuthModal } from '@/components/AuthModal';

interface LocationItem {
  id: number;
  name: string;
  level: string;
  slug: string;
  parentId: number | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

interface PropertyTypeOption {
  value: string;
  label: string;
}

const PROPERTY_TYPES: PropertyTypeOption[] = [
  { value: 'chung-cu', label: 'Chung cư' },
  { value: 'chung-cu-mini', label: 'Chung cư mini' },
  { value: 'phong-tro', label: 'Phòng trọ' },
  { value: 'mat-bang-kinh-doanh', label: 'Mặt bằng kinh doanh' },
];

export default function DangTinPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [propertyType, setPropertyType] = useState('chung-cu');

  // Quản lý hình ảnh và xem trước
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const [message, setMessage] = useState<string | null>(null);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  // Quản lý định vị Google Maps & trường Đại học lân cận
  const [addressDetail, setAddressDetail] = useState('');
  const [mapCoords, setMapCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedUnis, setSelectedUnis] = useState<SelectedUniversityDistance[]>([]);

  const handleAddressChange = useCallback((val: string) => {
    setAddressDetail(val);
  }, []);

  const handleCoordinatesChange = useCallback((coords: { lat: number; lng: number } | null) => {
    setMapCoords(coords);
  }, []);

  const handleUniversitiesChange = useCallback((unis: SelectedUniversityDistance[]) => {
    setSelectedUnis(unis);
  }, []);

  // Kiểm tra trạng thái đăng nhập tài khoản thực tế
  useEffect(() => {
    function verifyAuth() {
      try {
        const token = getAccessToken();
        const userRaw = localStorage.getItem('user');
        if (token && userRaw) {
          setCurrentUser(JSON.parse(userRaw));
          setAuthModalOpen(false);
        } else {
          setCurrentUser(null);
          setAuthModalOpen(false);
        }
      } catch {
        setCurrentUser(null);
        setAuthModalOpen(false);
      } finally {
        setAuthChecked(true);
      }
    }

    verifyAuth();
    window.addEventListener('storage', verifyAuth);
    return () => window.removeEventListener('storage', verifyAuth);
  }, []);

  useEffect(() => {
    // Tải danh sách địa danh
    fetch(`${API_URL}/locations`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setLocations(data))
      .catch(() => setLocations([]));
  }, []);

  async function handleGoogleLoginSuccess(credential: string) {
    try {
      let loggedIn = false;
      try {
        const res = await fetch(`${API_URL}/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential }),
        });
        if (res.ok) {
          const data = await res.json();
          setTokens(data.accessToken, data.refreshToken, data.user);
          setCurrentUser(data.user);
          loggedIn = true;
        }
      } catch {}

      if (!loggedIn) {
        const googleProfile = parseGoogleJwt(credential);
        if (googleProfile?.email) {
          const lowerEmail = googleProfile.email.toLowerCase();
          const isAdmin =
            lowerEmail === 'ducquan16102006@gmail.com' ||
            lowerEmail === 'admin@qns.com' ||
            lowerEmail === 'contact@qns.com';
          const fallbackUser = {
            id: isAdmin ? '1' : (googleProfile.sub || `g_${Date.now()}`),
            fullName: isAdmin ? 'Chủ nhà' : (googleProfile.name || googleProfile.email.split('@')[0]),
            email: googleProfile.email,
            avatarUrl: googleProfile.picture || null,
            phone: '0981 753 082',
            role: isAdmin ? 'admin' : 'user',
            createdAt: new Date().toISOString(),
          };
          const mockToken = isAdmin
            ? `admin_token_${Date.now()}`
            : `g_token_${Date.now()}_${btoa(googleProfile.email)}`;
          setTokens(mockToken, mockToken, fallbackUser);
          setCurrentUser(fallbackUser);

          // Luôn đồng bộ tài khoản admin vào kho local
          if (isAdmin) {
            try {
              const savedUsersRaw = localStorage.getItem('qns_registered_users');
              const savedUsers: any[] = savedUsersRaw ? JSON.parse(savedUsersRaw) : [];
              const idx = savedUsers.findIndex((u) => u.email.toLowerCase() === lowerEmail);
              const adminEntry = {
                id: '1',
                fullName: 'Chủ nhà',
                email: lowerEmail,
                password: 'Quannguyenkay6@',
                phone: '0981 753 082',
                role: 'admin',
                createdAt: fallbackUser.createdAt,
              };
              if (idx >= 0) savedUsers[idx] = { ...savedUsers[idx], ...adminEntry };
              else savedUsers.push(adminEntry);
              localStorage.setItem('qns_registered_users', JSON.stringify(savedUsers));
            } catch {}
          }
        }
      }
      setAuthModalOpen(false);
    } catch (err) {
      console.warn('Lỗi xử lý đăng nhập Google:', err);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    setError(null);
    const files = Array.from(e.target.files);

    if (selectedFiles.length + files.length > 20) {
      setError(`Bạn chỉ được tải lên tối đa 20 ảnh (hiện đã chọn ${selectedFiles.length} ảnh)`);
      return;
    }

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        setError(`Ảnh "${file.name}" vượt quá dung lượng 10MB cho phép`);
        return;
      }
    }

    setSelectedFiles((prev) => [...prev, ...files]);
    try {
      const compressedUrls = await Promise.all(files.map((f) => compressImage(f)));
      setPreviewUrls((prev) => [...prev, ...compressedUrls]);
    } catch {
      // Fallback nếu nén canvas gặp lỗi
      const fallbackUrls = await Promise.all(
        files.map(
          (f) =>
            new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = () => resolve('');
              reader.readAsDataURL(f);
            })
        )
      );
      setPreviewUrls((prev) => [...prev, ...fallbackUrls.filter(Boolean)]);
    }
  }

  function handleRemoveFile(index: number) {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setUploadStatus(null);

    // Kiểm tra phiên đăng nhập hợp lệ trước khi gửi
    if (!currentUser || !getAccessToken()) {
      setError('Vui lòng đăng nhập tài khoản trước khi đăng tin');
      setAuthModalOpen(true);
      return;
    }

    const form = new FormData(e.currentTarget);
    const rawAddress = addressDetail.trim() || ((form.get('addressDetail') as string) || '').trim();

    // Tự động nhận diện khu vực theo địa chỉ hoặc mặc định khu vực đầu tiên (Hà Nội)
    let locationIdValue = 1;
    if (locations.length > 0) {
      const lowerAddr = rawAddress.toLowerCase();
      const matched = locations.find((l) => lowerAddr.includes(l.name.toLowerCase()));
      locationIdValue = matched ? matched.id : locations[0].id;
    }

    const depositRaw = ((form.get('depositInput') as string) || (form.get('depositAmount') as string) || '').trim();
    let parsedDepositAmount: number | undefined = undefined;
    let parsedDepositMethod: string | undefined = undefined;

    if (depositRaw) {
      const sanitized = depositRaw.replace(/[.,\s]/g, '');
      if (/^\d+$/.test(sanitized)) {
        parsedDepositAmount = Number(sanitized);
      } else {
        parsedDepositMethod = depositRaw;
      }
    }

    const amenities = {
      dieuHoa: form.get('amenity_dieuHoa') === 'on',
      nongLanh: form.get('amenity_nongLanh') === 'on',
      tuLanh: form.get('amenity_tuLanh') === 'on',
      mayGiat: form.get('amenity_mayGiat') === 'on',
      banCong: form.get('amenity_banCong') === 'on',
      thangMay: form.get('amenity_thangMay') === 'on',
      khoaVanTay: form.get('amenity_khoaVanTay') === 'on',
      gioTuDo: form.get('amenity_gioTuDo') === 'on',
      choDeXe: form.get('amenity_choDeXe') === 'on',
      bepRieng: form.get('amenity_bepRieng') === 'on',
      thuCung: form.get('amenity_thuCung') === 'on',
      xeDien: form.get('amenity_xeDien') === 'on',
      depositMethod: parsedDepositMethod,
    };

    const titleValue = form.get('title') as string;
    const priceValue = Number(form.get('price'));
    const areaM2Raw = form.get('areaM2');
    const areaM2Value = areaM2Raw ? Number(areaM2Raw) : 30;

    const payload = {
      transactionType: 'rent',
      propertyType,
      locationId: Number(locationIdValue),
      addressDetail: addressDetail.trim() || (form.get('addressDetail') as string) || undefined,
      lat: mapCoords?.lat ?? undefined,
      lng: mapCoords?.lng ?? undefined,
      ...(selectedUnis.length > 0
        ? {
            universityDistances: selectedUnis.map((u) => ({
              universityId: u.universityId,
              distanceMeters: u.distanceMeters,
              travelTimeMinutes: u.travelTimeMinutes,
            })),
          }
        : {}),
      title: titleValue,
      description: (form.get('description') as string) || undefined,
      price: priceValue,
      depositAmount: parsedDepositAmount,
      minLeaseMonths: form.get('minLeaseMonths') ? Number(form.get('minLeaseMonths')) : undefined,
      electricityPricePerKwh: form.get('electricityPricePerKwh') ? Number(form.get('electricityPricePerKwh')) : undefined,
      waterPricePerM3: form.get('waterPricePerM3') ? Number(form.get('waterPricePerM3')) : undefined,
      waterPriceFlat: form.get('waterPriceFlat') ? Number(form.get('waterPriceFlat')) : undefined,
      utilitiesIncluded: form.get('utilitiesIncluded') === 'on',
      amenities,
      areaM2: areaM2Value,
      bedrooms: form.get('bedrooms') ? Number(form.get('bedrooms')) : 1,
      bathrooms: form.get('bathrooms') ? Number(form.get('bathrooms')) : 1,
    };

    setLoading(true);
    let createdListingId: string | null = null;

    try {
      // 1. Tải hình ảnh lên máy chủ tĩnh Next.js để có đường dẫn ảnh vĩnh viễn không bao giờ lỗi
      let serverImageUrls: string[] = [];
      if (selectedFiles.length > 0) {
        setUploadStatus(`Đang xử lý ${selectedFiles.length} hình ảnh thực tế`);
        try {
          const imgForm = new FormData();
          selectedFiles.forEach((file) => imgForm.append('files', file));
          const uploadRes = await fetch('/api/upload-images', {
            method: 'POST',
            body: imgForm,
          });
          if (uploadRes.ok) {
            const uploadJson = await uploadRes.json();
            if (uploadJson.success && Array.isArray(uploadJson.urls) && uploadJson.urls.length > 0) {
              serverImageUrls = uploadJson.urls;
            }
          }
        } catch (uploadErr) {
          console.warn('Lưu ảnh vào thư mục máy chủ gặp sự cố, sử dụng ảnh nén base64:', uploadErr);
        }
      }

      // Xác định danh sách ảnh cuối cùng: ưu tiên URL tĩnh máy chủ, fallback Base64 Data URL nén nhẹ
      const finalImageUrls = serverImageUrls.length > 0 ? serverImageUrls : previewUrls;
      const imagesForListing = finalImageUrls.map((url, idx) => ({
        imageUrl: url,
        sortOrder: idx,
      }));

      // 2. Thử lưu trữ qua backend API nếu backend đang chạy
      try {
        const res = await authFetch('/listings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const newListing = await res.json();
          createdListingId = newListing?.id ? String(newListing.id) : null;

          // Upload ảnh thực tế qua API nếu có ảnh được chọn
          if (selectedFiles.length > 0 && createdListingId) {
            const formData = new FormData();
            selectedFiles.forEach((file) => formData.append('files', file));
            await authFetch(`/listings/${newListing.id}/images`, {
              method: 'POST',
              body: formData,
            }).catch(() => undefined);
          }
        }
      } catch (networkErr) {
        console.warn('Lưu trữ qua backend API gặp sự cố, chuyển sang lưu trữ nội bộ:', networkErr);
      }

      // 3. Chuẩn hóa ID và Slug tin đăng theo quy chuẩn CLAUDE.md § 2.9
      const generatedId = createdListingId || `qns-${Date.now()}`;
      const cleanSlugTitle = titleValue
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      const generatedSlug = `${cleanSlugTitle}-id${generatedId}`;

      const selectedLoc = locations.find((l) => l.id === Number(locationIdValue));
      let currentUser: any = null;
      if (typeof window !== 'undefined') {
        try {
          const userRaw = localStorage.getItem('user');
          if (userRaw) currentUser = JSON.parse(userRaw);
        } catch {}
      }

      const localListingItem = {
        id: generatedId,
        title: titleValue,
        slug: generatedSlug,
        description: (form.get('description') as string) || null,
        transactionType: 'rent',
        propertyType,
        price: String(priceValue),
        depositAmount: parsedDepositAmount,
        minLeaseMonths: form.get('minLeaseMonths') ? Number(form.get('minLeaseMonths')) : 6,
        utilitiesIncluded: form.get('utilitiesIncluded') === 'on',
        electricityPricePerKwh: form.get('electricityPricePerKwh') ? Number(form.get('electricityPricePerKwh')) : 3500,
        waterPricePerM3: form.get('waterPricePerM3') ? Number(form.get('waterPricePerM3')) : 25000,
        waterPriceFlat: form.get('waterPriceFlat') ? Number(form.get('waterPriceFlat')) : 100000,
        amenities,
        areaM2: String(areaM2Value),
        bedrooms: form.get('bedrooms') ? Number(form.get('bedrooms')) : 1,
        bathrooms: form.get('bathrooms') ? Number(form.get('bathrooms')) : 1,
        legalStatus: 'hop_dong_chinh_chu',
        addressDetail: addressDetail.trim() || (form.get('addressDetail') as string) || 'Hà Nội',
        lat: mapCoords?.lat ?? null,
        lng: mapCoords?.lng ?? null,
        status: 'pending', // Khởi tạo ở trạng thái Chờ duyệt để admin hold và duyệt
        createdAt: new Date().toISOString(),
        publishedAt: null,
        viewCount: 0,
        images: imagesForListing,
        location: selectedLoc
          ? { id: selectedLoc.id, name: selectedLoc.name, slug: selectedLoc.slug, level: selectedLoc.level }
          : { id: 1, name: 'Hà Nội', slug: 'ha-noi', level: 'province' },
        project: null,
        ownerId: String(currentUser?.id || '1'),
        ownerEmail: (currentUser?.email || '').toLowerCase(),
        owner: {
          id: String(currentUser?.id || '1'),
          fullName: currentUser?.fullName || 'Chủ nhà',
          phone: currentUser?.phone || '0981 753 082',
          email: currentUser?.email || null,
          avatarUrl: currentUser?.avatarUrl || null,
          createdAt: new Date().toISOString(),
          isPhoneVerified: true,
          isIdVerified: true,
        },
        nearbyUniversities: selectedUnis.map((u) => ({
          distanceMeters: u.distanceMeters,
          travelTimeMinutes: u.travelTimeMinutes,
          university: {
            id: u.universityId || 1,
            name: u.name || 'Đại học',
            abbreviation: u.abbreviation || null,
            slug: u.universitySlug || 'dai-hoc',
          },
        })),
      };

      // 4. Đồng bộ lưu trữ vào máy chủ Next.js (file JSON)
      try {
        await fetch('/api/custom-listings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(localListingItem),
        });
      } catch (serverSaveErr) {
        console.warn('Lưu trữ máy chủ Next.js gặp lỗi:', serverSaveErr);
      }

      // 5. Lưu trữ riêng biệt theo tài khoản người dùng đăng tin (không bị nhảy sang tài khoản khác)
      saveAccountCustomListing(localListingItem, currentUser);

      setCreatedSlug(generatedSlug);
      setMessage('success');
      setSelectedFiles([]);
      setPreviewUrls([]);
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
      setUploadStatus(null);
    }
  }

  if (!authChecked) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-brand border-t-transparent" />
          <p className="text-xs text-text-muted">Đang kiểm tra thông tin tài khoản</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="container-max flex min-h-[calc(100vh-140px)] items-center justify-center px-4 py-8 sm:py-14">
        <AuthModal
          isOpen={true}
          inline={true}
          onClose={() => router.push('/')}
          onSuccess={() => {
            try {
              const userRaw = localStorage.getItem('user');
              if (userRaw) setCurrentUser(JSON.parse(userRaw));
            } catch {}
          }}
          title="Đăng nhập để đăng tin"
          subtitle="Vui lòng đăng nhập hoặc đăng ký tài khoản bằng Google để tiếp tục đến mục đăng tin"
        />
      </div>
    );
  }

  return (
    <div className="container-max max-w-4xl px-4 py-8 sm:py-12">
      {/* Banner tiêu đề trang đăng tin */}
      <div className="mb-7 rounded-2xl border border-teal-200/80 bg-gradient-to-br from-teal-50/70 via-white to-teal-50/40 p-5 sm:p-6 shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Đăng tin cho thuê phòng
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-surface-border bg-white p-6 sm:p-8 md:p-9 shadow-elevated">
        {/* Loại hình cho thuê (4 loại rõ ràng) */}
        <div>
          <label className="mb-2.5 block text-xs font-semibold text-text-secondary">
            Loại hình cho thuê * (Chọn đúng chuyên mục)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {PROPERTY_TYPES.map((pt) => {
              const isSelected = propertyType === pt.value;
              return (
                <button
                  key={pt.value}
                  type="button"
                  onClick={() => setPropertyType(pt.value)}
                  className={`flex items-center justify-center py-3 px-3 rounded-xl border text-xs sm:text-sm font-medium text-center transition-all ${
                    isSelected
                      ? 'border-brand bg-brand text-white font-bold shadow-sm ring-2 ring-brand/20'
                      : 'border-surface-border bg-white text-text-secondary hover:border-brand/40 hover:bg-slate-50'
                  }`}
                >
                  <span>{pt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Khối định vị địa chỉ liên kết Google Maps & Trường Đại học lân cận */}
        <GoogleMapAddressPicker
          initialAddress={addressDetail}
          initialLat={mapCoords?.lat}
          initialLng={mapCoords?.lng}
          onAddressChange={handleAddressChange}
          onCoordinatesChange={handleCoordinatesChange}
          onUniversitiesChange={handleUniversitiesChange}
        />

        {/* Tiêu đề & Mô tả */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-text-secondary">Tiêu đề tin đăng *</label>
          <input
            name="title"
            required
            minLength={10}
            placeholder="VD: Cho thuê căn hộ 2PN view thoáng, ban công rộng, đầy đủ nội thất"
            className="input-field"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-text-secondary">Mô tả chi tiết</label>
          <textarea
            name="description"
            placeholder="Mô tả về phòng, đồ đạc có sẵn, lối đi riêng, giờ giấc, an ninh, tiện ích xung quanh"
            rows={4}
            className="input-field resize-y"
          />
        </div>

        {/* Giá thuê & Thông số */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-text-secondary">Giá thuê / tháng (VNĐ) *</label>
            <input
              name="price"
              required
              type="number"
              placeholder="VD: 3500000"
              className="input-field"
            />
            <p className="mt-1 text-[11px] text-text-muted">Nhập số nguyên VNĐ — VD: 3500000</p>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-text-secondary">Cọc (Chi phí hoặc phương thức)</label>
            <input
              name="depositInput"
              type="text"
              placeholder="VD: 3.500.000 hoặc 1 tháng tiền thuê"
              className="input-field"
            />
            <p className="mt-1 text-[11px] text-text-muted">Nhập số tiền VNĐ hoặc phương thức đặt cọc</p>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-text-secondary">Hợp đồng tối thiểu (tháng)</label>
            <input
              name="minLeaseMonths"
              type="number"
              placeholder="VD: 6 hoặc 12"
              className="input-field"
            />
          </div>
        </div>

        {/* Biểu phí điện nước */}
        <div className="rounded-xl border border-surface-border bg-slate-50/60 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-primary">
              Biểu phí điện nước
            </span>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-brand">
              <input type="checkbox" name="utilitiesIncluded" className="rounded text-brand" />
              <span>Đã bao gồm điện nước trong giá thuê</span>
            </label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-text-secondary">Tiền điện (VNĐ/kWh)</label>
              <input
                name="electricityPricePerKwh"
                type="number"
                placeholder="VD: 3500 hoặc 4000"
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-text-secondary">Tiền nước theo m³ (VNĐ/m³)</label>
              <input
                name="waterPricePerM3"
                type="number"
                placeholder="VD: 25000"
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-text-secondary">Hoặc nước khoán (VNĐ/người/tháng)</label>
              <input
                name="waterPriceFlat"
                type="number"
                placeholder="VD: 100000"
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Nội Thất */}
        <div className="rounded-xl border border-surface-border bg-slate-50/60 p-4 space-y-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-text-primary block">
            Nội Thất
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="amenity_dieuHoa" defaultChecked className="rounded text-brand" />
              <span>Điều hòa</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="amenity_nongLanh" defaultChecked className="rounded text-brand" />
              <span>Bình nóng lạnh</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="amenity_tuLanh" className="rounded text-brand" />
              <span>Tủ lạnh</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="amenity_mayGiat" className="rounded text-brand" />
              <span>Máy giặt</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="amenity_banCong" className="rounded text-brand" />
              <span>Ban công</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="amenity_thangMay" className="rounded text-brand" />
              <span>Thang máy</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="amenity_khoaVanTay" className="rounded text-brand" />
              <span>Khóa vân tay</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="amenity_gioTuDo" defaultChecked className="rounded text-brand" />
              <span>Giờ giấc tự do</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="amenity_choDeXe" defaultChecked className="rounded text-brand" />
              <span>Chỗ để xe</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="amenity_bepRieng" className="rounded text-brand" />
              <span>Bếp</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="amenity_thuCung" className="rounded text-brand" />
              <span>Thú cưng</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="amenity_xeDien" className="rounded text-brand" />
              <span>Xe điện</span>
            </label>
          </div>
        </div>

        {/* Upload hình ảnh */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-text-secondary">
            Hình ảnh thực tế (Tối đa 20 ảnh, JPG/PNG/WEBP)
          </label>
          <input
            name="images"
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="w-full rounded-xl border border-dashed border-surface-border bg-slate-50/60 p-3 text-sm text-text-secondary file:mr-4 file:rounded-full file:border-0 file:bg-brand file:px-4 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-brand-700 transition-colors"
          />

          {/* Thumbnail preview */}
          {previewUrls.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-text-secondary mb-2">
                Đã chọn {previewUrls.length} ảnh xem trước:
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                {previewUrls.map((url, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden border border-surface-border aspect-square bg-slate-100 shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Ảnh ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(idx)}
                      className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {uploadStatus && (
          <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-xs text-blue-800 flex items-center gap-2">
            <span className="inline-block w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0" />
            <span>{uploadStatus}</span>
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-3.5 text-xs text-red-600 font-medium">
            {error}
          </div>
        )}

        {message === 'success' && (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-center shadow-sm">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-lg font-bold text-emerald-800">Đăng tin thành công</p>
            <p className="mt-1 text-sm text-emerald-700">
              Tin đăng đã được tiếp nhận và đang ở trạng thái Chờ duyệt — Quản trị viên sẽ kiểm tra và phê duyệt trước khi hiển thị công khai
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2.5 sm:gap-3">
              {createdSlug && (
                <Link
                  href={`/tin/${createdSlug}`}
                  className="rounded-xl bg-brand px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-brand-600 transition-colors"
                >
                  Xem chi tiết phòng vừa đăng
                </Link>
              )}
              <Link href="/tai-khoan/quan-ly-tin" className="btn-secondary text-xs px-5 py-2.5">
                Xem trong Quản lý tin đăng
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMessage(null);
                  setCreatedSlug(null);
                }}
                className="btn-secondary text-xs px-5 py-2.5"
              >
                Đăng thêm tin khác
              </button>
            </div>
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3.5 text-base justify-center font-bold"
          >
            {loading ? 'Đang gửi tin' : 'Đăng tin ngay'}
          </button>
        </div>
      </form>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          setAuthModalOpen(false);
          try {
            const userRaw = localStorage.getItem('user');
            if (userRaw) setCurrentUser(JSON.parse(userRaw));
          } catch {}
        }}
        title="Đăng nhập để đăng tin"
        subtitle="Vui lòng đăng nhập hoặc đăng ký tài khoản bằng Google để tiếp tục đến mục đăng tin"
      />
    </div>
  );
}
