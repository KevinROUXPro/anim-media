import { readFile } from 'node:fs/promises';
import path from 'node:path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Keep this route for existing bookmarks while serving the canonical public asset.
async function readLogo() {
  return readFile(path.join(process.cwd(), 'public/logo.png'));
}

export async function GET() {
  try {
    const image = await readLogo();
    return new Response(new Uint8Array(image), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=0, must-revalidate',
      },
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    return new Response(null, { status: 404, headers: { 'Cache-Control': 'no-store' } });
  }
}
