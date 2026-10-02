'use client';

import { useState, useEffect } from 'react';
import { authFetch } from '@/lib/auth-client';
import { Listing } from '@/lib/api';

interface EditListingModalProps {
  listing: Listing | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function EditListingModal({ listing, isOpen, onClose, onSaved }: EditListingModalProps) {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [minLeaseMonths, setMinLeaseMonths] = useState('');
  const [areaM2, setAreaM2] = useState('');
  const [description, setDescription] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [electricityPricePerKwh, setElectricityPricePerKwh] = useState('');
  const [waterPricePerM3, setWaterPricePerM3] = useState('');
  const [waterPriceFlat, setWaterPriceFlat] = useState('');
  const [utilitiesIncluded, setUtilitiesIncluded] = useState(false);

  const [existingImages, setExistingImages] = useState<{ id?: string; imageUrl: string }[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviewUrls, setNewPreviewUrls] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (listing) {
      setTitle(listing.title || '');
      setPrice(listing.price || '');
      setDepositAmount(listing.depositAmount ? String(listing.depositAmount) : '');
      setMinLeaseMonths(listing.minLeaseMonths ? String(listing.minLeaseMonths) : '');
      setAreaM2(listing.areaM2 ? String(listing.areaM2) : '');
      setDescription(listing.description || '');
      setAddressDetail(listing.addressDetail || '');
      setElectricityPricePerKwh(listing.electricityPricePerKwh ? String(listing.electricityPricePerKwh) : '');
      setWaterPricePerM3(listing.waterPricePerM3 ? String(listing.waterPricePerM3) : '');
      setWaterPriceFlat(listing.waterPriceFlat ? String(listing.waterPriceFlat) : '');
      setUtilitiesIncluded(Boolean(listing.utilitiesIncluded));
      setExistingImages(listing.images || []);
      setNewFiles([]);
      setNewPreviewUrls([]);
      setError(null);
      setSuccessMsg(null);
    }
  }, [listing]);

  if (!isOpen || !listing) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const totalCount = existingImages.length + newFiles.length + files.length;
    if (totalCount > 20) {
      setError(`Tổng số lượng ảnh không được vượt quá 20 (hiện có ${existingImages.length + newFiles.length} ảnh)`);
      return;
    }
    setNewFiles((prev) => [...prev, ...files]);
    const urls = files.map((f) => URL.createObjectURL(f));
    setNewPreviewUrls((prev) => [...prev, ...urls]);
  };

  const handleRemoveNewFile = (index: number) => {
    if (newPreviewUrls[index]) {
      URL.revokeObjectURL(newPreviewUrls[index]);
    }
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteExistingImage = async (imageId?: string) => {
    if (!imageId) return;
    if (!confirm('Bạn có chắc muốn xóa ảnh này khỏi tin đăng?')) return;
    try {
      const res = await authFetch(`/listings/${listing.id}/images/${imageId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Không thể xóa ảnh');
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (err: any) {
      alert(err.message || 'Xóa ảnh thất bại');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      // 1. Cập nhật thông tin tin đăng qua PUT /listings/:id
      const payload: Record<string, any> = {
        title: title.trim(),
        price: Number(price),
        depositAmount: depositAmount ? Number(depositAmount) : undefined,
        minLeaseMonths: minLeaseMonths ? Number(minLeaseMonths) : undefined,
        areaM2: Number(areaM2),
        description: description.trim() || undefined,
        addressDetail: addressDetail.trim() || undefined,
        electricityPricePerKwh: electricityPricePerKwh ? Number(electricityPricePerKwh) : undefined,
        waterPricePerM3: waterPricePerM3 ? Number(waterPricePerM3) : undefined,
        waterPriceFlat: waterPriceFlat ? Number(waterPriceFlat) : undefined,
        utilitiesIncluded,
      };

      const res = await authFetch(`/listings/${listing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Cập nhật tin đăng thất bại');
      }

      // 2. Tải thêm ảnh mới nếu có
      if (newFiles.length > 0) {
        const formData = new FormData();
        newFiles.forEach((f) => formData.append('files', f));
        const imgRes = await authFetch(`/listings/${listing.id}/images`, {
          method: 'POST',
          body: formData,
        });
        if (!imgRes.ok) {
          const errData = await imgRes.json().catch(() => ({}));
          throw new Error(`Đã cập nhật thông tin, nhưng tải ảnh mới gặp lỗi: ${errData.message || 'Lỗi tải ảnh'}`);
        }
      }

      const msg = listing.status === 'rejected'
        ? 'Đã cập nhật tin đăng và gửi lại cho chuyên viên thẩm định duyệt'
        : 'Đã lưu thay đổi tin đăng thành công';
      setSuccessMsg(msg);
      setTimeout(() => {
        onSaved();
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi lưu tin đăng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-listing-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 md:p-8 shadow-2xl border border-surface-border my-auto">
        <div className="flex items-center justify-between pb-4 border-b border-surface-border">
          <div>
            <h2 id="edit-listing-title" className="text-xl font-bold text-slate-900">
              Chỉnh sửa thông tin phòng
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Mã tin: #{listing.id} — Trạng thái: {listing.status === 'rejected' ? 'Bị từ chối (Sửa để gửi duyệt lại)' : listing.status}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            aria-label="Đóng hộp thoại"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-600 font-medium">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 font-medium text-center">
            ✓ {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="edit-title" className="block text-xs font-semibold text-text-secondary mb-1">
              Tiêu đề tin đăng *
            </label>
            <input
              id="edit-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="edit-price" className="block text-xs font-semibold text-text-secondary mb-1">
                Giá thuê / tháng (VNĐ) *
              </label>
              <input
                id="edit-price"
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label htmlFor="edit-deposit" className="block text-xs font-semibold text-text-secondary mb-1">
                Tiền đặt cọc (VNĐ)
              </label>
              <input
                id="edit-deposit"
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="VD: 3500000"
                className="input-field"
              />
            </div>
            <div>
              <label htmlFor="edit-area" className="block text-xs font-semibold text-text-secondary mb-1">
                Diện tích (m²) *
              </label>
              <input
                id="edit-area"
                type="number"
                step="0.1"
                required
                value={areaM2}
                onChange={(e) => setAreaM2(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label htmlFor="edit-address" className="block text-xs font-semibold text-text-secondary mb-1">
              Địa chỉ chi tiết (Số nhà, ngõ/ngách, tên đường)
            </label>
            <input
              id="edit-address"
              type="text"
              value={addressDetail}
              onChange={(e) => setAddressDetail(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="edit-desc" className="block text-xs font-semibold text-text-secondary mb-1">
              Mô tả chi tiết phòng
            </label>
            <textarea
              id="edit-desc"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field resize-y"
            />
          </div>

          {/* Biểu phí điện nước */}
          <div className="rounded-xl border border-surface-border bg-slate-50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-800 tracking-wider">
                Biểu phí điện nước minh bạch
              </span>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-brand">
                <input
                  type="checkbox"
                  checked={utilitiesIncluded}
                  onChange={(e) => setUtilitiesIncluded(e.target.checked)}
                  className="rounded text-brand"
                />
                <span>Đã bao gồm điện nước</span>
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label htmlFor="edit-elec" className="block text-[11px] font-semibold text-text-secondary mb-1">
                  Điện (VNĐ/kWh)
                </label>
                <input
                  id="edit-elec"
                  type="number"
                  value={electricityPricePerKwh}
                  onChange={(e) => setElectricityPricePerKwh(e.target.value)}
                  placeholder="VD: 3500"
                  className="input-field"
                />
              </div>
              <div>
                <label htmlFor="edit-water-m3" className="block text-[11px] font-semibold text-text-secondary mb-1">
                  Nước (VNĐ/m³)
                </label>
                <input
                  id="edit-water-m3"
                  type="number"
                  value={waterPricePerM3}
                  onChange={(e) => setWaterPricePerM3(e.target.value)}
                  placeholder="VD: 25000"
                  className="input-field"
                />
              </div>
              <div>
                <label htmlFor="edit-water-flat" className="block text-[11px] font-semibold text-text-secondary mb-1">
                  Nước khoán (VNĐ/người)
                </label>
                <input
                  id="edit-water-flat"
                  type="number"
                  value={waterPriceFlat}
                  onChange={(e) => setWaterPriceFlat(e.target.value)}
                  placeholder="VD: 100000"
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Quản lý hình ảnh */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
              Hình ảnh thực tế của phòng (Tối đa 20 ảnh)
            </label>
            {existingImages.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mb-3">
                {existingImages.map((img, idx) => (
                  <div key={img.id || idx} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.imageUrl} alt={`Ảnh ${idx + 1}`} className="h-full w-full object-cover" />
                    {img.id && (
                      <button
                        type="button"
                        onClick={() => handleDeleteExistingImage(img.id)}
                        className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-600/90 text-white text-xs flex items-center justify-center hover:bg-red-700 shadow-sm"
                        title="Xóa ảnh này"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {newPreviewUrls.length > 0 && (
              <div className="mb-3">
                <p className="text-[11px] font-semibold text-brand mb-1">Ảnh mới chuẩn bị thêm:</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {newPreviewUrls.map((url, idx) => (
                    <div key={url} className="relative aspect-square rounded-xl overflow-hidden bg-teal-50 border border-teal-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Ảnh mới ${idx + 1}`} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveNewFile(idx)}
                        className="absolute top-1 right-1 h-6 w-6 rounded-full bg-slate-800/80 text-white text-xs flex items-center justify-center hover:bg-slate-900 shadow-sm"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:border-brand hover:text-brand transition-colors shadow-sm">
                <span>📷 Thêm ảnh mới</span>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <span className="text-[11px] text-text-muted">Định dạng JPG, PNG hoặc WEBP</span>
            </div>
          </div>

          <div className="pt-4 border-t border-surface-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-surface-border bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary py-2.5 px-5 text-xs font-bold"
            >
              {loading ? 'Đang lưu...' : listing.status === 'rejected' ? 'Lưu thay đổi & Gửi duyệt lại' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
