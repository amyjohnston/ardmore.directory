import type { APIRoute } from 'astro';
import { env } from '../../lib/env';

export const prerender = false;

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export const POST: APIRoute = async ({ request }) => {
  const json = (body: object, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });

  try {
    const formData = await request.formData();
    const file = formData.get('image');

    if (!(file instanceof File)) {
      return json({ error: 'No image provided.' }, 400);
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return json({ error: 'Only JPG, PNG, or WebP images are accepted.' }, 400);
    }
    if (file.size > MAX_BYTES) {
      return json({ error: 'Image must be 5 MB or smaller.' }, 400);
    }

    const bucket = env.IMAGES_BUCKET;
    if (!bucket) {
      return json({ error: 'Image storage is not configured. Please try again later.' }, 500);
    }

    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    const key = `submissions/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    await bucket.put(key, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type },
    });

    const baseUrl = env.R2_PUBLIC_URL?.replace(/\/$/, '');
    const url = baseUrl ? `${baseUrl}/${key}` : key;

    return json({ url });
  } catch (err) {
    console.error('Image upload error:', err);
    return json({ error: 'Upload failed. Please try again.' }, 500);
  }
};
