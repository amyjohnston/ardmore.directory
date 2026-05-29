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

declare namespace App {
  interface Locals {
    runtime: {
      env: Env;
    };
  }
}
