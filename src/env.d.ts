/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
/// <reference types="@cloudflare/workers-types" />

interface Env {
  DB: D1Database;
  IMAGES_BUCKET: R2Bucket;
  R2_PUBLIC_URL: string;
  BETTER_AUTH_SECRET: string;
  RESEND_API_KEY: string;
}

// Augment the cloudflare:workers Env interface with our bindings
declare module 'cloudflare:workers' {
  interface Env {
    DB: D1Database;
    IMAGES_BUCKET: R2Bucket;
    R2_PUBLIC_URL: string;
    BETTER_AUTH_SECRET: string;
    RESEND_API_KEY: string;
  }
}
