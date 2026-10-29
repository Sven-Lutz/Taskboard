import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves from /Taskboard/ — set base accordingly.
  // In dev (npm run dev) this is overridden to "/" via the env check.
  base: process.env.NODE_ENV === "production" ? "/Taskboard/" : "/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": `${import.meta.dirname}/src`,
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
  },
});
