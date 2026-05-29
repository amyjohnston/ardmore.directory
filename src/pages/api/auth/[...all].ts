import type { APIRoute } from 'astro';
import { createAuth } from '../../../lib/auth';

export const prerender = false;

// Forwards every /api/auth/* request to better-auth's handler.
// better-auth registers routes for sign-up, sign-in, sign-out,
// session refresh, and more automatically.
const handler: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env ?? {};
  const secret = env.BETTER_AUTH_SECRET ?? 'dev-secret-change-in-production';
  const auth = createAuth(env.DB, secret);
  return auth.handler(request);
};

export const GET  = handler;
export const POST = handler;
