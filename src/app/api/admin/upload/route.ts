import { NextResponse } from 'next/server';
import { getAdminFromSession } from '@/lib/auth';
import { validateImageUpload, saveUploadedPublicProductImage } from '@/lib/security';

export async function POST(request: Request) {
  const admin = await getAdminFromSession();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No image file uploaded.' }, { status: 400 });
    }

    const validation = validateImageUpload(file);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const imageUrl = await saveUploadedPublicProductImage(file);

    return NextResponse.json({
      success: true,
      imageUrl,
    });
  } catch (error: any) {
    console.error('Error uploading product image:', error);
    return NextResponse.json({ error: 'Server error processing file upload.' }, { status: 500 });
  }
}
