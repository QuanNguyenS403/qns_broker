import { NextRequest, NextResponse } from 'next/server';
import {
  getCustomListingsServer,
  getCustomListingsByOwnerServer,
  getPublicCustomListingsServer,
  saveCustomListingServer,
  updateCustomListingStatusServer,
  deleteCustomListingServer,
} from '@/lib/custom-listings-server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ownerId = searchParams.get('ownerId');
    const ownerEmail = searchParams.get('ownerEmail');
    const scope = searchParams.get('scope'); // 'all' (admin) | 'mine' (chủ nhà) | 'public' (khách tìm phòng)

    let items;
    if (ownerId || ownerEmail) {
      items = getCustomListingsByOwnerServer(ownerId || undefined, ownerEmail || undefined);
    } else if (scope === 'all') {
      items = getCustomListingsServer();
    } else {
      // Mặc định cho khách thuê: chỉ trả về tin active, tự động loại bỏ tin đã cho thuê (rented)
      items = getPublicCustomListingsServer();
    }

    return NextResponse.json({ success: true, items });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Không thể tải danh sách tin tự đăng' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    if (!data || !data.title) {
      return NextResponse.json(
        { success: false, message: 'Dữ liệu tin đăng không hợp lệ' },
        { status: 400 }
      );
    }

    const saved = saveCustomListingServer(data);
    return NextResponse.json({ success: true, listing: saved });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Lỗi máy chủ khi lưu tin đăng' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;
    if (!id || !status) {
      return NextResponse.json(
        { success: false, message: 'Thiếu mã tin hoặc trạng thái cần cập nhật' },
        { status: 400 }
      );
    }

    const ok = updateCustomListingStatusServer(id, status);
    if (!ok) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy tin đăng để cập nhật' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Cập nhật trạng thái tin thành công' });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Lỗi máy chủ khi cập nhật trạng thái tin' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, message: 'Thiếu mã tin cần xóa' }, { status: 400 });
    }
    const ok = deleteCustomListingServer(id);
    return NextResponse.json({ success: ok, message: 'Đã xóa tin đăng vĩnh viễn' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Lỗi máy chủ khi xóa tin' }, { status: 500 });
  }
}
