import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  site: 'https://ardmore.directory',
  adapter: cloudflare(),
  integrations: [sitemap()],
});