import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

export async function POST(request: Request) {
  try {
    ensureUploadDir();

    const contentType = request.headers.get('content-type') || '';

    // 1. Multipart Form Data (standard mobile file input / FormData)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json({ error: 'No file provided in form data' }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const origName = file.name || 'upload.mp4';
      const ext = path.extname(origName) || (file.type.includes('image') ? '.jpg' : '.mp4');
      const safeExt = ext.toLowerCase().replace(/[^a-z0-9.]/g, '');
      const uniqueName = `kre8tor_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${safeExt}`;
      const filePath = path.join(UPLOAD_DIR, uniqueName);

      await fs.promises.writeFile(filePath, buffer);

      const mediaType = file.type.startsWith('image/') ? 'photo' : 'video';
      const fileUrl = `/api/media/${uniqueName}`;

      return NextResponse.json({
        success: true,
        url: fileUrl,
        filename: uniqueName,
        size: buffer.length,
        mediaType,
      });
    }

    // 2. Base64 JSON fallback
    if (contentType.includes('application/json')) {
      const { base64Data, filename, mimeType } = await request.json();

      if (!base64Data) {
        return NextResponse.json({ error: 'No base64 data provided' }, { status: 400 });
      }

      // Remove data URL prefix if present: "data:image/jpeg;base64,..."
      const cleaned = base64Data.replace(/^data:[^;]+;base64,/, '');
      const buffer = Buffer.from(cleaned, 'base64');

      const ext = filename ? path.extname(filename) : mimeType?.includes('image') ? '.jpg' : '.mp4';
      const safeExt = (ext || '.mp4').toLowerCase().replace(/[^a-z0-9.]/g, '');
      const uniqueName = `kre8tor_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${safeExt}`;
      const filePath = path.join(UPLOAD_DIR, uniqueName);

      await fs.promises.writeFile(filePath, buffer);

      const mediaType = (mimeType || '').startsWith('image/') ? 'photo' : 'video';
      const fileUrl = `/api/media/${uniqueName}`;

      return NextResponse.json({
        success: true,
        url: fileUrl,
        filename: uniqueName,
        size: buffer.length,
        mediaType,
      });
    }

    return NextResponse.json({ error: 'Unsupported Content-Type' }, { status: 415 });
  } catch (error: any) {
    console.error('Upload handler error:', error);
    return NextResponse.json({ error: error?.message || 'File upload failed' }, { status: 500 });
  }
}
