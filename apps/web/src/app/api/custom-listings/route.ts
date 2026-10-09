import { NextRequest, NextResponse } from 'next/server';
import { getCustomListingsServer, saveCustomListingServer } from '@/lib/custom-listings-server';

export async function GET() {
  try {
    const listings = getCustomListingsServer();
    return NextResponse.json({ success: true, items: listings });
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
