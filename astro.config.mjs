// @ts-check
import { defineConfig } from "astro/config";
import db from "@astrojs/db";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: vercel(),
  integrations: [db()],
  vite: {
    plugins: [tailwindcss()],
    build: {
      // Astro inlines bundled <script> chunks smaller than this limit directly
      // into the HTML, which a `script-src 'self'` policy blocks. Force every
      // script out to its own file; other assets keep the default behaviour.
      assetsInlineLimit: (filePath) => (filePath.endsWith('.js') ? false : undefined),
    },
  },
});
