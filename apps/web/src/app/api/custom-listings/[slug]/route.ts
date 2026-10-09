import { NextRequest, NextResponse } from 'next/server';
import { getCustomListingBySlugServer, deleteCustomListingServer } from '@/lib/custom-listings-server';

interface Params {
  params: { slug: string };
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const listing = getCustomListingBySlugServer(params.slug);
    if (!listing) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy phòng cho thuê' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, listing });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Lỗi máy chủ khi lấy thông tin phòng' },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const ok = deleteCustomListingServer(params.slug);
    return NextResponse.json({ success: ok });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Lỗi máy chủ khi xóa tin đăng' },
      { status: 500 }
    );
  }
}
