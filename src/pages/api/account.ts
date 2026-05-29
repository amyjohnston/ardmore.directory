import type { APIRoute } from 'astro';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { createAuth } from '../../lib/auth';
import { businesses } from '../../db/schema';
import { env } from '../../lib/env';

export const prerender = false;

function json(body: object, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// DELETE — delete the account, listing, and R2 image
export const DELETE: APIRoute = async ({ request }) => {
  if (!env.DB) return json({ error: 'Not configured.' }, 500);

  const auth = createAuth(env.DB, env.BETTER_AUTH_SECRET ?? 'dev-secret', env.RESEND_API_KEY);
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) return json({ error: 'Unauthorised' }, 401);

  const db = drizzle(env.DB);

  // Delete the user's listing and its R2 image first
  const [listing] = await db
    .select()
    .from(businesses)
    .where(eq(businesses.userId, session.user.id))
    .limit(1);

  if (listing) {
    if (listing.imageUrl && env.IMAGES_BUCKET && env.R2_PUBLIC_URL) {
      const key = listing.imageUrl.replace(env.R2_PUBLIC_URL.replace(/\/$/, '') + '/', '');
      await env.IMAGES_BUCKET.delete(key).catch(() => {});
    }
    await db.delete(businesses).where(eq(businesses.userId, session.user.id));
  }

  // Delete the user via better-auth (cascades to sessions & accounts)
  await auth.api.deleteUser({ headers: request.headers, body: {} });

  return json({ success: true });
};
