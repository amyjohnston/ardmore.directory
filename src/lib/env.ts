/// <reference types="@cloudflare/workers-types" />
import { env as _env } from 'cloudflare:workers';

// Re-export with our typed Env interface so every file
// gets correct autocomplete without module-augmentation fights.
export interface Env {
  DB: D1Database;
  IMAGES_BUCKET: R2Bucket;
  R2_PUBLIC_URL: string;
  BETTER_AUTH_SECRET: string;
  RESEND_API_KEY: string;
}

export const env = _env as unknown as Env;
