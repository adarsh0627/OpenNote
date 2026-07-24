import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "icons/*.png"],
      manifest: {
        name: "OpenNote",
        short_name: "OpenNote",
        description: "Buy and sell study notes — all in one place",
        theme_color: "#4f46e5",
        background_color: "#f8f7ff",
        display: "standalone",
        start_url: "/",
        orientation: "portrait-primary",
        icons: [
          {
            src: "/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable any",
          },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable any",
          },
        ],
      },
      workbox: {
        navigateFallback: "/index.html",
        runtimeCaching: [
          {
            // Cache Cloudinary thumbnails (public images only)
            urlPattern: /^https:\/\/res\.cloudinary\.com\/.+\/image\/upload\/.+/,
            handler: "CacheFirst",
            options: {
              cacheName: "thumbnails-v1",
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
        ],
        // Never cache API calls or signed Cloudinary download URLs
        navigateFallbackDenylist: [/^\/api\//, /cloudinary.*private/],
      },
    }),
  ],
});