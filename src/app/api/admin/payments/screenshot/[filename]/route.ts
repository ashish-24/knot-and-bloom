import { NextResponse } from 'next/server';
import { getAdminFromSession } from '@/lib/auth';
import fs from 'fs/promises';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: { filename: string } }
) {
  const admin = await getAdminFromSession();
  if (!admin) {
    return new NextResponse('Unauthorized access to payment screenshot.', { status: 401 });
  }

  try {
    const filename = path.basename(params.filename);
    const filePath = path.join(process.cwd(), 'uploads', 'screenshots', filename);

    const fileBuffer = await fs.readFile(filePath);
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'image/png';
    if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    if (ext === '.webp') contentType = 'image/webp';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (err) {
    return new NextResponse('File not found', { status: 404 });
  }
}
