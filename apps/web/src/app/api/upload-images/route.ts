import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng chọn ít nhất 1 ảnh để tải lên' },
        { status: 400 }
      );
    }

    const batchId = `post-${Date.now()}`;
    const uploadDir = path.join(process.cwd(), 'public', 'user-uploads', 'listings', batchId);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const savedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file || typeof file.arrayBuffer !== 'function') continue;

      const buffer = Buffer.from(await file.arrayBuffer());
      const rawExt = path.extname(file.name || '').toLowerCase();
      const ext = ['.jpg', '.jpeg', '.png', '.webp'].includes(rawExt) ? rawExt : '.jpg';
      const fileName = `img-${i + 1}-${Date.now().toString(36)}${ext}`;
      const filePath = path.join(uploadDir, fileName);

      fs.writeFileSync(filePath, buffer);
      savedUrls.push(`/user-uploads/listings/${batchId}/${fileName}`);
    }

    return NextResponse.json({
      success: true,
      urls: savedUrls,
    });
  } catch (error) {
    console.error('Lỗi khi tải ảnh lên máy chủ:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi máy chủ khi tải ảnh lên' },
      { status: 500 }
    );
  }
}
