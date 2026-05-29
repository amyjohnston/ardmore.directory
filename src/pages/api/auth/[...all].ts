import type { APIRoute } from 'astro';
import { createAuth } from '../../../lib/auth';
import { env } from '../../../lib/env';

export const prerender = false;

// Forwards every /api/auth/* request to better-auth's handler.
const handler: APIRoute = async ({ request }) => {
  const secret = env.BETTER_AUTH_SECRET ?? 'dev-secret-change-in-production';
  const auth = createAuth(env.DB, secret, env.RESEND_API_KEY);
  return auth.handler(request);
};

export const GET  = handler;
export const POST = handler;
