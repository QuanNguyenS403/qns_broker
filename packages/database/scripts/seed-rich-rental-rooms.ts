import { PrismaClient, TransactionType, ListingStatus, VerificationStatus } from '@prisma/client';

const prisma = new PrismaClient();

const ROOM_PHOTOS = {
  gac_lung: [
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&auto=format&fit=crop&q=80',
  ],
  studio: [
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&auto=format&fit=crop&q=80',
  ],
  sleepbox: [
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&auto=format&fit=crop&q=80',
  ],
  can_ho: [
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200&auto=format&fit=crop&q=80',
  ],
};

async function main() {
  console.log('--- Bắt đầu cập nhật và bổ sung dữ liệu phòng trọ cho thuê ---');

  // 1. Lấy thông tin user chính (admin Đức Quân)
  const user = await prisma.user.findFirst({
    where: { phone: '0981753082' },
  }) ?? await prisma.user.findFirst();

  if (!user) {
    console.error('Không tìm thấy tài khoản người dùng để gán chủ tin');
    return;
  }

  // 2. Đảm bảo các địa bàn quận huyện phổ biến
  const hanoi = await prisma.location.upsert({
    where: { slug: 'ha-noi' },
    update: {},
    create: { level: 'province', name: 'Hà Nội', slug: 'ha-noi' },
  });

  const hcm = await prisma.location.upsert({
    where: { slug: 'ho-chi-minh' },
    update: {},
    create: { level: 'province', name: 'TP. Hồ Chí Minh', slug: 'ho-chi-minh' },
  });

  const locCauGiay = await prisma.location.upsert({
    where: { slug: 'ha-noi-cau-giay' },
    update: {},
    create: { level: 'district', name: 'Cầu Giấy', slug: 'ha-noi-cau-giay', parentId: hanoi.id },
  });

  const locHaiBaTrung = await prisma.location.upsert({
    where: { slug: 'ha-noi-hai-ba-trung' },
    update: {},
    create: { level: 'district', name: 'Hai Bà Trưng', slug: 'ha-noi-hai-ba-trung', parentId: hanoi.id },
  });

  const locThanhXuan = await prisma.location.upsert({
    where: { slug: 'ha-noi-thanh-xuan' },
    update: {},
    create: { level: 'district', name: 'Thanh Xuân', slug: 'ha-noi-thanh-xuan', parentId: hanoi.id },
  });

  const locDongDa = await prisma.location.upsert({
    where: { slug: 'ha-noi-dong-da' },
    update: {},
    create: { level: 'district', name: 'Đống Đa', slug: 'ha-noi-dong-da', parentId: hanoi.id },
  });

  const locQuan7 = await prisma.location.upsert({
    where: { slug: 'ho-chi-minh-quan-7' },
    update: {},
    create: { level: 'district', name: 'Quận 7', slug: 'ho-chi-minh-quan-7', parentId: hcm.id },
  });

  const locQuan1 = await prisma.location.upsert({
    where: { slug: 'ho-chi-minh-quan-1' },
    update: {},
    create: { level: 'district', name: 'Quận 1', slug: 'ho-chi-minh-quan-1', parentId: hcm.id },
  });

  const locBinhThanh = await prisma.location.upsert({
    where: { slug: 'ho-chi-minh-binh-thanh' },
    update: {},
    create: { level: 'district', name: 'Bình Thạnh', slug: 'ho-chi-minh-binh-thanh', parentId: hcm.id },
  });

  // 3. Danh sách tin phòng mẫu phong phú, đầy đủ thông tin chuẩn xác
  const RICH_ROOMS = [
    {
      id: BigInt(31),
      title: 'Phòng cao cấp gác lửng mới 100%, full nội thất Cầu Giấy',
      slug: 'phong-cao-cap-168008',
      propertyType: 'phong_tro',
      price: BigInt(4500000),
      depositAmount: BigInt(4500000),
      minLeaseMonths: 6,
      electricityPricePerKwh: 3800,
      waterPricePerM3: 25000,
      waterPriceFlat: null,
      areaM2: 28,
      bedrooms: 1,
      bathrooms: 1,
      legalStatus: 'hop_dong_6_thang',
      addressDetail: 'Số 18 Ngõ 165 Cầu Giấy, Phường Dịch Vọng, Quận Cầu Giấy, Hà Nội',
      locationId: locCauGiay.id,
      description: `Phòng trọ cao cấp gác lửng đúc kiên cố cao 2m, không chung chủ, giờ giấc tự do 100% bằng khóa vân tay.
- Tiện nghi trong phòng: Máy lạnh Inverter siêu tiết kiệm điện, bình nóng lạnh Ariston, tủ lạnh 2 cánh, gác lửng gỗ sồi, kệ bếp chậu rửa inox cao cấp, bàn học làm việc, tủ quần áo 3 cánh.
- Tòa nhà: Thang máy tốc độ cao, máy giặt chung miễn phí tầng thượng kèm sân phơi có mái che, camera an ninh giám sát 24/7 từng tầng, hầm để xe rộng rãi có sạc xe điện.
- Vị trí: Cách ĐH Quốc Gia Hà Nội, ĐH Sư Phạm, Học viện Báo chí chỉ 500m - 1km. Đi bộ 5 phút ra trạm Metro Nhổn - Cầu Giấy.
- Bảng chi phí rõ ràng: Điện 3.800 đ/kWh (đồng hồ riêng điện tử từng phòng), nước 25.000 đ/m3, dịch vụ chung (wifi cáp quang + thang máy + vệ sinh + máy giặt) 120.000 đ/người/tháng.`,
      amenities: {
        wifi: true,
        airConditioner: true,
        mezzanine: true,
        waterHeater: true,
        refrigerator: true,
        washingMachine: true,
        privateBathroom: true,
        balcony: true,
        parkingSpace: true,
        securityCamera: true,
        fingerprintLock: true,
        freeTime: true,
        elevator: true,
      },
      photos: ROOM_PHOTOS.gac_lung,
    },
    {
      id: BigInt(29),
      title: 'Studio ban công thoáng mát full đồ gần ĐH Bách Khoa — Kinh Tế Quốc Dân',
      slug: 'listing-b-168008',
      propertyType: 'can_ho_mini',
      price: BigInt(5200000),
      depositAmount: BigInt(5200000),
      minLeaseMonths: 12,
      electricityPricePerKwh: 3800,
      waterPricePerM3: 28000,
      waterPriceFlat: null,
      areaM2: 32,
      bedrooms: 1,
      bathrooms: 1,
      legalStatus: 'hop_dong_1_nam',
      addressDetail: 'Ngõ 622 Minh Khai, Phường Vĩnh Tuy, Quận Hai Bà Trưng, Hà Nội',
      locationId: locHaiBaTrung.id,
      description: `Căn hộ mini Studio thiết kế hiện đại, ban công riêng đón ánh sáng tự nhiên cả ngày, cây xanh thoáng mát.
- Trang bị nội thất đầy đủ: Giường đệm cao su non, tủ quần áo kịch trần, bàn trà, sofa bọc nỉ, điều hòa 2 chiều Daikin, bình nóng lạnh, khu vực bếp nấu có máy hút mùi và bếp từ đôi.
- An ninh & Tiện ích: Cửa khóa từ vân tay kèm mã số, camera an ninh 24/24, thang máy thẻ từ, internet cáp quang mesh phủ sóng toàn tòa nhà.
- Giao thông thuận tiện: Sát vách Time City, chỉ 7 phút di chuyển tới ĐH Bách Khoa, ĐH Xây Dựng, ĐH Kinh Tế Quốc Dân, ĐH Kinh Doanh và Công Nghệ.
- Chi phí minh bạch: Điện 3.800 đ/kWh, nước 28.000 đ/m3, internet + vệ sinh + thang máy khoán 150.000 đ/phòng/tháng. Hợp đồng ký trực tiếp, dẫn xem phòng miễn phí.`,
      amenities: {
        wifi: true,
        airConditioner: true,
        waterHeater: true,
        refrigerator: true,
        washingMachine: true,
        privateBathroom: true,
        balcony: true,
        parkingSpace: true,
        securityCamera: true,
        fingerprintLock: true,
        freeTime: true,
        elevator: true,
      },
      photos: ROOM_PHOTOS.studio,
    },
    {
      id: BigInt(30),
      title: 'Căn hộ dịch vụ 1 phòng ngủ tách bếp riêng Bình Thạnh sát Quận 1',
      slug: 'listing-other-168008',
      propertyType: 'can_ho_dich_vu',
      price: BigInt(6800000),
      depositAmount: BigInt(6800000),
      minLeaseMonths: 6,
      electricityPricePerKwh: 4000,
      waterPricePerM3: null,
      waterPriceFlat: 100000,
      areaM2: 35,
      bedrooms: 1,
      bathrooms: 1,
      legalStatus: 'hop_dong_6_thang',
      addressDetail: 'Đường Điện Biên Phủ, Phường 15, Quận Bình Thạnh, TP.HCM',
      locationId: locBinhThanh.id,
      description: `Căn hộ 1 phòng ngủ riêng biệt, phòng khách và khu bếp tách biệt hoàn toàn không lo ám mùi thức ăn.
- Đầy đủ tiện nghi chuẩn khách sạn: Tủ lạnh lớn 250L, lò vi sóng, bếp điện từ âm, máy giặt riêng trong phòng, smart TV 43 inch, máy lạnh riêng cho từng phòng ngủ và phòng khách.
- Dịch vụ đi kèm: Dọn dẹp vệ sinh phòng 1 lần/tuần miễn phí, thay drap giường 2 tuần/lần, internet tốc độ cao riêng từng phòng.
- Vị trí vàng: Ngay ngã tư Hàng Xanh, sang Quận 1 chỉ mất 3 phút xe máy. Rất gần ĐH HUTECH, ĐH Kinh Tế Tài Chính (UEF), ĐH Hồng Bàng.
- Chi phí rõ ràng: Điện 4.000 đ/kWh, nước 100.000 đ/người/tháng, miễn phí gửi 1 xe máy, miễn phí wifi và phí quản lý.`,
      amenities: {
        wifi: true,
        airConditioner: true,
        waterHeater: true,
        refrigerator: true,
        washingMachine: true,
        privateBathroom: true,
        balcony: true,
        parkingSpace: true,
        securityCamera: true,
        fingerprintLock: true,
        freeTime: true,
        elevator: true,
      },
      photos: ROOM_PHOTOS.can_ho,
    },
    {
      id: BigInt(34),
      title: 'Phòng trọ khép kín sinh viên giá rẻ gần ĐH Thủy Lợi & Công Đoàn',
      slug: 'listing-bao-toan-dau-moi-393720',
      propertyType: 'phong-tro-sinh-vien',
      price: BigInt(3200000),
      depositAmount: BigInt(3200000),
      minLeaseMonths: 6,
      electricityPricePerKwh: 3600,
      waterPricePerM3: 25000,
      waterPriceFlat: null,
      areaM2: 22,
      bedrooms: 1,
      bathrooms: 1,
      legalStatus: 'hop_dong_6_thang',
      addressDetail: 'Ngõ 95 Chùa Bộc, Phường Quang Trung, Quận Đống Đa, Hà Nội',
      locationId: locDongDa.id,
      description: `Phòng trọ sinh viên sạch sẽ, thoáng mát, khu dân trí cao yên tĩnh rất thích hợp cho việc học tập và nghỉ ngơi.
- Tiện nghi: Điều hòa mát lạnh, bình nóng lạnh đời mới, giường gỗ 1m6 kèm đệm, quạt trần, kệ bếp nấu ăn có bồn rửa, vệ sinh khép kín sạch sẽ.
- An ninh: Cổng khóa vân tay, có camera theo dõi lối đi và bãi để xe tầng 1, không chung chủ, giờ giấc đi lại hoàn toàn tự do.
- Vị trí: Đi bộ sang ĐH Thủy Lợi, ĐH Công Đoàn, Học viện Ngân Hàng chỉ 3 - 5 phút. Rất nhiều hàng quán ăn sinh viên và siêu thị tiện lợi xung quanh.
- Chi phí minh bạch: Điện 3.600 đ/kWh, nước 25.000 đ/m3, mạng internet 80.000 đ/phòng, rác vệ sinh 30.000 đ/người.`,
      amenities: {
        wifi: true,
        airConditioner: true,
        waterHeater: true,
        privateBathroom: true,
        parkingSpace: true,
        securityCamera: true,
        fingerprintLock: true,
        freeTime: true,
      },
      photos: ROOM_PHOTOS.gac_lung,
    },
    {
      id: BigInt(36),
      title: 'Ký túc xá Sleepbox cao cấp bao trọn gói điện nước Cầu Giấy',
      slug: 'listing-bao-toan-dau-moi-834414',
      propertyType: 'ky_tuc_xa',
      price: BigInt(1800000),
      depositAmount: BigInt(1800000),
      minLeaseMonths: 3,
      electricityPricePerKwh: 0,
      waterPricePerM3: 0,
      waterPriceFlat: 0,
      utilitiesIncluded: true,
      areaM2: 15,
      bedrooms: 1,
      bathrooms: 2,
      legalStatus: 'hop_dong_3_thang',
      addressDetail: 'Số 45 Trần Thái Tông, Phường Dịch Vọng Hậu, Quận Cầu Giấy, Hà Nội',
      locationId: locCauGiay.id,
      description: `Mô hình Sleepbox riêng tư cao cấp dành cho sinh viên và người đi làm, cam kết KHÔNG PHÁT SINH bất kỳ chi phí nào.
- Trọn gói tiền thuê đã bao gồm: Điện điều hòa 24/24, nước tắm nóng lạnh, wifi cáp quang tốc độ cao, nước uống tinh khiết nóng lạnh, máy giặt máy sấy quần áo.
- Không gian box riêng tư: Cửa lùa có khóa riêng, đệm êm ái, tủ để đồ cá nhân, bàn học gấp gọn, đèn đọc sách, ổ cắm điện, thanh treo rèm và quạt thông gió riêng từng box.
- Không gian chung: Bếp nấu ăn đầy đủ nồi niêu xoong chảo, tủ lạnh 4 cánh, phòng ăn rộng rãi, nhân viên dọn dẹp vệ sinh khu chung mỗi ngày 2 lần.
- Vị trí: Ngay trung tâm Cầu Giấy, gần ĐH Quốc Gia Hà Nội, ĐH Ngoại Ngữ, ĐH Sư Phạm, ĐH Thương Mại.`,
      amenities: {
        wifi: true,
        airConditioner: true,
        waterHeater: true,
        refrigerator: true,
        washingMachine: true,
        parkingSpace: true,
        securityCamera: true,
        fingerprintLock: true,
        freeTime: true,
      },
      photos: ROOM_PHOTOS.sleepbox,
    },
    {
      id: BigInt(38),
      title: 'Studio duplex gác lửng cao cấp ban công riêng gần ĐH Tôn Đức Thắng',
      slug: 'listing-bao-toan-dau-moi-852676',
      propertyType: 'studio',
      price: BigInt(4800000),
      depositAmount: BigInt(4800000),
      minLeaseMonths: 6,
      electricityPricePerKwh: 3800,
      waterPricePerM3: 20000,
      waterPriceFlat: null,
      areaM2: 30,
      bedrooms: 1,
      bathrooms: 1,
      legalStatus: 'hop_dong_6_thang',
      addressDetail: 'Đường Lê Văn Lương, Phường Tân Phong, Quận 7, TP.HCM',
      locationId: locQuan7.id,
      description: `Studio Duplex gác lửng đúc cao, ban công cửa kính lớn thoáng mát ngập tràn ánh nắng, view thoáng đãng không bị che khuất.
- Nội thất cao cấp chuẩn hình ảnh 100%: Máy lạnh Inverter, tủ lạnh 2 cánh đời mới, gác lửng đệm cao su êm ái, tủ đồ âm tường, kệ bếp nấu ăn có máy hút mùi, bàn làm việc và ghế xoay êm ái.
- Tiện ích chung: Thang máy, hầm giữ xe có bảo vệ trực 24/7, máy giặt và sân phơi rộng rãi trên sân thượng, khóa cổng vân tay hiện đại.
- Vị trí: Chỉ 400m sang trường ĐH Tôn Đức Thắng, 1km sang ĐH RMIT, 5 phút sang Lotte Mart Quận 7.
- Chi phí sinh hoạt: Điện 3.800 đ/kWh, nước 20.000 đ/m3, phí quản lý dịch vụ (wifi, thang máy, máy giặt, rác) 150.000 đ/phòng/tháng. Xem phòng trực tiếp mọi lúc.`,
      amenities: {
        wifi: true,
        airConditioner: true,
        mezzanine: true,
        waterHeater: true,
        refrigerator: true,
        washingMachine: true,
        privateBathroom: true,
        balcony: true,
        parkingSpace: true,
        securityCamera: true,
        fingerprintLock: true,
        freeTime: true,
        elevator: true,
      },
      photos: ROOM_PHOTOS.gac_lung,
    },
  ];

  for (const item of RICH_ROOMS) {
    const existing = await prisma.listing.findUnique({ where: { id: item.id } });
    const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // Hết hạn sau 90 ngày

    if (existing) {
      await prisma.listing.update({
        where: { id: item.id },
        data: {
          title: item.title,
          slug: item.slug,
          propertyType: item.propertyType,
          price: item.price,
          depositAmount: item.depositAmount,
          minLeaseMonths: item.minLeaseMonths,
          electricityPricePerKwh: item.electricityPricePerKwh,
          waterPricePerM3: item.waterPricePerM3,
          waterPriceFlat: item.waterPriceFlat,
          utilitiesIncluded: item.utilitiesIncluded ?? false,
          areaM2: item.areaM2,
          bedrooms: item.bedrooms,
          bathrooms: item.bathrooms,
          legalStatus: item.legalStatus,
          addressDetail: item.addressDetail,
          description: item.description,
          amenities: item.amenities,
          locationId: item.locationId,
          status: ListingStatus.active,
          verificationStatus: VerificationStatus.da_xac_thuc,
          verifiedAt: new Date(),
          publishedAt: new Date(),
          expiresAt: expiresAt,
        },
      });
      console.log(`Đã cập nhật tin id: ${item.id} - ${item.title}`);
    } else {
      await prisma.listing.create({
        data: {
          id: item.id,
          ownerId: user.id,
          title: item.title,
          slug: item.slug,
          propertyType: item.propertyType,
          price: item.price,
          depositAmount: item.depositAmount,
          minLeaseMonths: item.minLeaseMonths,
          electricityPricePerKwh: item.electricityPricePerKwh,
          waterPricePerM3: item.waterPricePerM3,
          waterPriceFlat: item.waterPriceFlat,
          utilitiesIncluded: item.utilitiesIncluded ?? false,
          areaM2: item.areaM2,
          bedrooms: item.bedrooms,
          bathrooms: item.bathrooms,
          legalStatus: item.legalStatus,
          addressDetail: item.addressDetail,
          description: item.description,
          amenities: item.amenities,
          locationId: item.locationId,
          status: ListingStatus.active,
          verificationStatus: VerificationStatus.da_xac_thuc,
          verifiedAt: new Date(),
          publishedAt: new Date(),
          expiresAt: expiresAt,
        },
      });
      console.log(`Đã tạo mới tin id: ${item.id} - ${item.title}`);
    }

    // Cập nhật ảnh cho tin
    await prisma.listingImage.deleteMany({ where: { listingId: item.id } });
    for (let idx = 0; idx < item.photos.length; idx++) {
      await prisma.listingImage.create({
        data: {
          listingId: item.id,
          imageUrl: item.photos[idx],
          sortOrder: idx,
        },
      });
    }
  }

  // Đảm bảo 2 tin mẫu gốc cũng có expiresAt dài hạn và ảnh đầy đủ
  await prisma.listing.updateMany({
    where: { id: { in: [BigInt(17), BigInt(18), BigInt(3), BigInt(4)] } },
    data: {
      status: ListingStatus.active,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('--- Hoàn tất cập nhật dữ liệu phòng trọ cho thuê thành công! ---');
}

main()
  .catch((e) => {
    console.error('Lỗi khi seed dữ liệu phòng trọ:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
