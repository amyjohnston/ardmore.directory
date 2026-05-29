/// <reference types="@cloudflare/workers-types" />
import type { APIRoute } from 'astro';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { createAuth } from '../../lib/auth';
import { businesses } from '../../db/schema';

export const prerender = false;

function json(body: object, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function getSession(request: Request, locals: App.Locals) {
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return null;
  const auth = createAuth(env.DB, env.BETTER_AUTH_SECRET ?? 'dev-secret', env.RESEND_API_KEY);
  return auth.api.getSession({ headers: request.headers });
}

// GET — fetch the current user's listing
export const GET: APIRoute = async ({ request, locals }) => {
  const session = await getSession(request, locals);
  if (!session?.user) return json({ error: 'Unauthorised' }, 401);

  const env = (locals as any).runtime?.env ?? {};
  const db = drizzle(env.DB);
  const [listing] = await db
    .select()
    .from(businesses)
    .where(eq(businesses.userId, session.user.id))
    .limit(1);

  return json({ listing: listing ?? null });
};

// POST — create a new listing for the current user
export const POST: APIRoute = async ({ request, locals }) => {
  const session = await getSession(request, locals);
  if (!session?.user) return json({ error: 'Unauthorised' }, 401);

  const env = (locals as any).runtime?.env ?? {};
  const db = drizzle(env.DB);

  // One listing per user
  const [existing] = await db
    .select({ id: businesses.id })
    .from(businesses)
    .where(eq(businesses.userId, session.user.id))
    .limit(1);
  if (existing) return json({ error: 'You already have a listing. Use PATCH to update it.' }, 409);

  const body = await request.json() as Record<string, string>;
  if (!body.name?.trim() || !body.category?.trim()) {
    return json({ error: 'Business name and category are required.' }, 400);
  }

  const now = new Date();
  const id = `biz_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  await db.insert(businesses).values({
    id,
    userId: session.user.id,
    name:     body.name.trim(),
    category: body.category.trim(),
    phone:    body.phone?.trim()    || null,
    email:    body.email?.trim()    || null,
    address:  body.address?.trim()  || null,
    website:  body.website?.trim()  || null,
    facebook: body.facebook?.trim() || null,
    imageUrl: body.imageUrl?.trim() || null,
    createdAt: now,
    updatedAt: now,
  });

  const [listing] = await db.select().from(businesses).where(eq(businesses.id, id));
  return json({ listing }, 201);
};

// PATCH — update the current user's listing
export const PATCH: APIRoute = async ({ request, locals }) => {
  const session = await getSession(request, locals);
  if (!session?.user) return json({ error: 'Unauthorised' }, 401);

  const env = (locals as any).runtime?.env ?? {};
  const db = drizzle(env.DB);

  const [existing] = await db
    .select()
    .from(businesses)
    .where(eq(businesses.userId, session.user.id))
    .limit(1);
  if (!existing) return json({ error: 'No listing found.' }, 404);

  const body = await request.json() as Record<string, string>;
  if (body.name !== undefined && !body.name.trim()) {
    return json({ error: 'Business name cannot be empty.' }, 400);
  }

  await db.update(businesses).set({
    name:      body.name?.trim()     ?? existing.name,
    category:  body.category?.trim() ?? existing.category,
    phone:     body.phone    !== undefined ? (body.phone.trim()    || null) : existing.phone,
    email:     body.email    !== undefined ? (body.email.trim()    || null) : existing.email,
    address:   body.address  !== undefined ? (body.address.trim()  || null) : existing.address,
    website:   body.website  !== undefined ? (body.website.trim()  || null) : existing.website,
    facebook:  body.facebook !== undefined ? (body.facebook.trim() || null) : existing.facebook,
    imageUrl:  body.imageUrl !== undefined ? (body.imageUrl.trim() || null) : existing.imageUrl,
    updatedAt: new Date(),
  }).where(eq(businesses.id, existing.id));

  const [listing] = await db.select().from(businesses).where(eq(businesses.id, existing.id));
  return json({ listing });
};

// DELETE — remove the current user's listing
export const DELETE: APIRoute = async ({ request, locals }) => {
  const session = await getSession(request, locals);
  if (!session?.user) return json({ error: 'Unauthorised' }, 401);

  const env = (locals as any).runtime?.env ?? {};
  const db = drizzle(env.DB);

  const [existing] = await db
    .select()
    .from(businesses)
    .where(eq(businesses.userId, session.user.id))
    .limit(1);
  if (!existing) return json({ error: 'No listing found.' }, 404);

  // Delete the R2 image if one was uploaded
  if (existing.imageUrl && env.IMAGES_BUCKET && env.R2_PUBLIC_URL) {
    const key = existing.imageUrl.replace(env.R2_PUBLIC_URL.replace(/\/$/, '') + '/', '');
    await env.IMAGES_BUCKET.delete(key).catch(() => {});
  }

  await db.delete(businesses).where(eq(businesses.id, existing.id));
  return json({ success: true });
};
