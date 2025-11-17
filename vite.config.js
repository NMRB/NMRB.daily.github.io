import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/NMRB.daily.github.io/",
  build: {
    rollupOptions: {
      // Copy 404.html to root of build output
      external: [],
    },
  },
  publicDir: 'public',
});
