import path from 'path';
import crypto from 'crypto';
import fs from 'fs/promises';

const ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const ALLOWED_EXTENSIONS = ['.jpeg', '.jpg', '.png', '.webp'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB limit

export function validateImageUpload(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: 'File size exceeds maximum limit of 10MB.' };
  }

  if (!ALLOWED_IMAGE_MIMES.includes(file.type.toLowerCase())) {
    return { valid: false, error: 'Invalid file type. Only JPG, PNG, and WebP images are allowed.' };
  }

  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return { valid: false, error: 'Invalid file extension.' };
  }

  return { valid: true };
}

export function generateRandomFilename(originalFilename: string): string {
  const ext = path.extname(originalFilename).toLowerCase() || '.png';
  const randomHex = crypto.randomBytes(16).toString('hex');
  const timestamp = Date.now();
  return `${timestamp}-${randomHex}${ext}`;
}

/**
 * Upload to ImgBB Free Cloud Storage (No Credit Card Required)
 */
async function uploadToImgBB(file: File): Promise<string | null> {
  const apiKey = process.env.IMGBB_API_KEY;
  if (!apiKey) return null;

  try {
    const arrayBuffer = await file.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');

    const formData = new URLSearchParams();
    formData.append('image', base64Image);

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });

    const data = await res.json();
    if (data.success && data.data?.url) {
      return data.data.url;
    }
  } catch (err) {
    console.warn('[ImgBB Free Cloud Upload Notice]:', err);
  }
  return null;
}

/**
 * Save private file (e.g. payment screenshot) to Cloud Storage or Local Fallback
 */
export async function saveUploadedPrivateFile(file: File, subDir = 'screenshots'): Promise<string> {
  // 1. Try ImgBB Free Cloud Upload (No Credit Card)
  const imgbbUrl = await uploadToImgBB(file);
  if (imgbbUrl) return imgbbUrl;

  // 2. Try Cloudinary Free Cloud Upload (No Credit Card)
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;
  if (cloudName && uploadPreset) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url) {
        return data.secure_url;
      }
    } catch (err) {
      console.warn('[Cloud Storage Warning] Cloud upload failed, falling back to storage:', err);
    }
  }

  // 3. Local File System Fallback (100% Free, No Credit Card)
  const uploadDir = path.join(process.cwd(), 'uploads', subDir);
  await fs.mkdir(uploadDir, { recursive: true });

  const filename = generateRandomFilename(file.name);
  const filePath = path.join(uploadDir, filename);

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  await fs.writeFile(filePath, buffer);

  return `/api/admin/payments/screenshot/${filename}`;
}

/**
 * Save public product image to Cloud Storage or Local Fallback
 */
export async function saveUploadedPublicProductImage(file: File): Promise<string> {
  // 1. Try ImgBB Free Cloud Upload (No Credit Card Required)
  const imgbbUrl = await uploadToImgBB(file);
  if (imgbbUrl) return imgbbUrl;

  // 2. Try Cloudinary Free Upload (No Credit Card Required)
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;
  if (cloudName && uploadPreset) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url) {
        return data.secure_url;
      }
    } catch (err) {
      console.warn('[Cloud Storage Warning] Cloudinary upload failed, using local storage:', err);
    }
  }

  // 3. Local File System Fallback (100% Free, No Credit Card)
  const uploadDir = path.join(process.cwd(), 'uploads', 'products');
  await fs.mkdir(uploadDir, { recursive: true });

  const filename = generateRandomFilename(file.name);
  const filePath = path.join(uploadDir, filename);

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  await fs.writeFile(filePath, buffer);

  return `/api/products/image/${filename}`;
}
