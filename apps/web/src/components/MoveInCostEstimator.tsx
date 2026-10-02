'use client';

import { useState } from 'react';

interface MoveInCostEstimatorProps {
  initialRentPrice: number | string;
  depositAmount?: number | string | null;
  electricityPricePerKwh?: number | null;
  waterPricePerM3?: number | null;
  waterPriceFlat?: number | null;
  utilitiesIncluded?: boolean;
  parkingFee?: number | string | null;
  internetFee?: number | string | null;
  serviceFee?: number | string | null;
}

export function MoveInCostEstimator({
  initialRentPrice,
  depositAmount,
  electricityPricePerKwh,
  waterPricePerM3,
  waterPriceFlat,
  utilitiesIncluded = false,
  parkingFee,
  internetFee,
  serviceFee,
}: MoveInCostEstimatorProps) {
  const rent = typeof initialRentPrice === 'string' ? Number(initialRentPrice) || 0 : initialRentPrice;

  // F03 / F04: Phân biệt rõ cọc 0đ, có cọc cụ thể hay chưa khai báo
  const isDepositDeclared = depositAmount !== undefined && depositAmount !== null && depositAmount !== '';
  const parsedDeposit = isDepositDeclared ? Number(depositAmount) : NaN;
  const hasExactDeposit = !isNaN(parsedDeposit);
  const initialDeposit = hasExactDeposit ? Math.max(0, parsedDeposit) : rent;

  const [customDeposit, setCustomDeposit] = useState<number>(initialDeposit);
  const [electricityKwh, setElectricityKwh] = useState<number>(80);
  const [waterAmount, setWaterAmount] = useState<number>(waterPriceFlat ? 1 : 4);
  const [customInternet, setCustomInternet] = useState<number>(
    internetFee != null && !isNaN(Number(internetFee)) ? Number(internetFee) : 100000
  );
  const [customParking, setCustomParking] = useState<number>(
    parkingFee != null && !isNaN(Number(parkingFee)) ? Number(parkingFee) : 0
  );

  const hasElecRate = electricityPricePerKwh != null && Number(electricityPricePerKwh) >= 0;
  const effectiveElecRate = hasElecRate ? Number(electricityPricePerKwh) : 3500;
  const elecCost = utilitiesIncluded ? 0 : effectiveElecRate * electricityKwh;

  const hasWaterRate = (waterPriceFlat != null && Number(waterPriceFlat) >= 0) || (waterPricePerM3 != null && Number(waterPricePerM3) >= 0);
  const effectiveWaterRate = waterPriceFlat != null ? Number(waterPriceFlat) : (waterPricePerM3 != null ? Number(waterPricePerM3) : 18000);
  const waterCost = utilitiesIncluded
    ? 0
    : waterPriceFlat != null
      ? effectiveWaterRate * Math.max(1, waterAmount)
      : effectiveWaterRate * waterAmount;

  // Dự trù chi phí sinh hoạt hàng tháng
  const monthlyLivingEstimate = elecCost + waterCost + customInternet + customParking;
  const totalMonthlyCost = rent + monthlyLivingEstimate;

  // Tiền cần chuẩn bị lúc ký (Cọc + Tiền thuê tháng đầu)
  const initialSignPayment = customDeposit + rent;

  return (
    <div id="move-in-estimator" className="rounded-2xl border border-teal-200 bg-white p-6 shadow-card scroll-mt-28">
      <div className="flex items-center justify-between gap-3 border-b border-surface-border pb-4">
        <div>
          <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand/10 text-brand text-sm">
              💰
            </span>
            Ước tính chi phí minh bạch
          </h3>
          <p className="mt-0.5 text-xs text-text-muted">
            Tách biệt khoản trả khi ký hợp đồng và dự trù chi phí sinh hoạt hàng tháng
          </p>
        </div>
        {utilitiesIncluded && (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
            ✓ Đã bao gồm điện nước
          </span>
        )}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Cột trái: Điều chỉnh thông số sinh hoạt */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-medium text-text-secondary mb-1.5">
              <span>Tiền đặt cọc</span>
              <span className="font-bold text-text-primary">
                {customDeposit.toLocaleString('vi-VN')} đ
                {hasExactDeposit && customDeposit === initialDeposit && (
                  <span className="ml-1 text-[11px] font-normal text-emerald-600">(Chủ nhà yêu cầu)</span>
                )}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: hasExactDeposit && initialDeposit === rent ? 'Theo yêu cầu (1T)' : 'Cọc 1 tháng', val: rent },
                { label: 'Cọc 2 tháng', val: rent * 2 },
                { label: 'Không cọc', val: 0 },
              ].map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCustomDeposit(item.val)}
                  className={`rounded-lg py-1.5 text-xs font-medium transition-colors border ${
                    customDeposit === item.val
                      ? 'border-brand bg-brand/10 text-brand font-semibold'
                      : 'border-surface-border bg-surface hover:bg-surface-muted text-text-secondary'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {!utilitiesIncluded && (
            <>
              <div>
                <div className="flex justify-between text-xs font-medium text-text-secondary mb-1">
                  <span>
                    Ước tính số điện ({effectiveElecRate.toLocaleString('vi-VN')} đ/kWh
                    {!hasElecRate && ' - giá tham khảo'})
                  </span>
                  <span className="font-semibold text-text-primary">
                    {electricityKwh} kWh (~{elecCost.toLocaleString('vi-VN')} đ)
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="300"
                  step="10"
                  value={electricityKwh}
                  onChange={(e) => setElectricityKwh(Number(e.target.value))}
                  className="w-full accent-brand cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-text-muted">
                  <span>Ít (20 kWh)</span>
                  <span>Trung bình (80 kWh)</span>
                  <span>Dùng nhiều (200+ kWh)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-text-secondary mb-1">
                  <span>
                    Ước tính nước ({waterPriceFlat != null
                      ? `${Number(waterPriceFlat).toLocaleString('vi-VN')} đ/người/tháng`
                      : `${effectiveWaterRate.toLocaleString('vi-VN')} đ/m³${!hasWaterRate ? ' - giá tham khảo' : ''}`})
                  </span>
                  <span className="font-semibold text-text-primary">
                    {waterPriceFlat != null ? `${waterAmount} người` : `${waterAmount} m³`} (~{waterCost.toLocaleString('vi-VN')} đ)
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max={waterPriceFlat != null ? 6 : 20}
                  step="1"
                  value={waterAmount}
                  onChange={(e) => setWaterAmount(Number(e.target.value))}
                  className="w-full accent-brand cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-text-muted">
                  <span>{waterPriceFlat != null ? '1 người ở' : 'Tiết kiệm (2-4 m³)'}</span>
                  <span>{waterPriceFlat != null ? '2-3 người' : 'Trung bình (6-8 m³)'}</span>
                  <span>{waterPriceFlat != null ? '4+ người' : 'Nhiều (15+ m³)'}</span>
                </div>
              </div>
            </>
          )}

          <div>
            <div className="flex justify-between text-xs font-medium text-text-secondary mb-1">
              <span>Internet / Wifi</span>
              <span className="font-semibold text-text-primary">{customInternet.toLocaleString('vi-VN')} đ</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[0, 50000, 100000, 150000].map((fee) => (
                <button
                  key={fee}
                  type="button"
                  onClick={() => setCustomInternet(fee)}
                  className={`rounded-lg py-1.5 text-xs font-medium transition-colors border ${
                    customInternet === fee
                      ? 'border-brand bg-brand/10 text-brand font-semibold'
                      : 'border-surface-border bg-surface hover:bg-surface-muted text-text-secondary'
                  }`}
                >
                  {fee === 0 ? 'Miễn phí' : `${fee.toLocaleString('vi-VN')} đ`}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium text-text-secondary mb-1">
              <span>Phí gửi xe máy</span>
              <span className="font-semibold text-text-primary">{customParking.toLocaleString('vi-VN')} đ</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[0, 100000, 150000, 200000].map((fee) => (
                <button
                  key={fee}
                  type="button"
                  onClick={() => setCustomParking(fee)}
                  className={`rounded-lg py-1.5 text-xs font-medium transition-colors border ${
                    customParking === fee
                      ? 'border-brand bg-brand/10 text-brand font-semibold'
                      : 'border-surface-border bg-surface hover:bg-surface-muted text-text-secondary'
                  }`}
                >
                  {fee === 0 ? 'Không gửi' : `${fee.toLocaleString('vi-VN')} đ`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cột phải: Bảng kết quả tổng hợp 2 tầng minh bạch */}
        <div className="rounded-xl bg-gradient-to-br from-teal-50 to-emerald-50/50 border border-teal-200 p-5 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Tầng 1: Khoản trả khi ký */}
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-teal-800">
                1. Khoản thanh toán khi ký hợp đồng
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-brand tracking-tight">
                  {initialSignPayment.toLocaleString('vi-VN')}
                </span>
                <span className="text-sm font-semibold text-brand-800">VNĐ</span>
              </div>
              <div className="mt-2 space-y-1.5 text-xs">
                <div className="flex justify-between text-text-secondary">
                  <span>• Tiền đặt cọc (hoàn lại khi trả phòng):</span>
                  <span className="font-semibold text-text-primary">{customDeposit.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>• Tiền thuê tháng đầu tiên:</span>
                  <span className="font-semibold text-text-primary">{rent.toLocaleString('vi-VN')} đ</span>
                </div>
              </div>
            </div>

            {/* Tầng 2: Dự trù hàng tháng */}
            <div className="border-t border-teal-200/80 pt-3">
              <span className="text-xs uppercase tracking-wider font-bold text-teal-800">
                2. Tổng chi phí ước tính hằng tháng
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-slate-800 tracking-tight">
                  ~{totalMonthlyCost.toLocaleString('vi-VN')}
                </span>
                <span className="text-sm font-semibold text-slate-600">VNĐ/tháng</span>
              </div>
              <div className="mt-2 space-y-1.5 text-xs text-text-secondary">
                <div className="flex justify-between">
                  <span>• Tiền thuê phòng:</span>
                  <span className="font-medium text-text-primary">{rent.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between">
                  <span>• Tiền điện dự kiến:</span>
                  <span className="font-medium text-text-primary">{elecCost.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between">
                  <span>• Tiền nước dự kiến:</span>
                  <span className="font-medium text-text-primary">{waterCost.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between">
                  <span>• Internet & xe máy:</span>
                  <span className="font-medium text-text-primary">{(customInternet + customParking).toLocaleString('vi-VN')} đ</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-teal-200/80 text-[11px] text-text-muted">
            Lưu ý: Tiền thuê và tiền cọc được thanh toán trực tiếp cho bên cho thuê khi ký hợp đồng, chuyên viên Đức Quân hỗ trợ kiểm tra pháp lý miễn phí
          </div>
        </div>
      </div>
    </div>
  );
}
