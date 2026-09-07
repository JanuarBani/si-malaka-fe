import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  server: {
    port: 3000,
    host: true,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      "/media": {
        // tambahkan ini
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
    },
  },
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt"],
      manifest: {
        name: "SI-PETARUNG MALAKA",
        short_name: "SI-PETARUNG",
        description: "Sistem Informasi Penataan Ruang Kabupaten Malaka",
        theme_color: "#1d4ed8",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          {
            src: "/icons/icon.svg",
            sizes: "192x192 512x512",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico,txt,json}"],
        runtimeCaching: [
          {
            urlPattern: /\/api\/gis\/kecamatan\/geojson/,
            handler: "NetworkFirst",
            options: {
              cacheName: "kecamatan-geojson",
              expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
          {
            urlPattern: /\/api\/gis\/desa\/geojson/,
            handler: "NetworkFirst",
            options: {
              cacheName: "desa-geojson",
              expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
          {
            urlPattern: /\/api\/gis\/zonasi\/geojson/,
            handler: "NetworkFirst",
            options: {
              cacheName: "zonasi-geojson",
              expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
          // Bisa tambahkan endpoint kecil lain yang sering diakses
        ],
      },
    }),
  ],
});
