import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), wasm(), topLevelAwait()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "next/navigation": path.resolve(__dirname, "./src/next-navigation-mock.ts"),
      "next/link": path.resolve(__dirname, "./src/next-link-mock.tsx"),
      "next/image": path.resolve(__dirname, "./src/next-image-mock.tsx"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    headers: {
      "Cross-Origin-Embedder-Policy": "credentialless",
      "Cross-Origin-Opener-Policy": "same-origin",
    },
  },
});
