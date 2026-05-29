/// <reference types="@cloudflare/workers-types" />
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../db/schema';

export function createAuth(d1: D1Database, secret: string) {
  const db = drizzle(d1, { schema });

  return betterAuth({
    secret,
    database: drizzleAdapter(db, {
      provider: 'sqlite',
    }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false, // Phase 2: enable with Resend
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7,        // 7 days
      updateAge: 60 * 60 * 24,             // refresh if older than 1 day
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;
