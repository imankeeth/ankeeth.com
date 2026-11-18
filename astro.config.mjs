import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://ankeeth.com',
  output: 'static',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
  integrations: [sitemap({ filter: (url) => !['/posts/', '/og/'].some((prefix) => new URL(url).pathname.startsWith(prefix)) })],
});
