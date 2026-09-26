import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // bookshelfRenderer.js imports "three165" — map it to the installed three@0.165
      three165: fileURLToPath(new URL("node_modules/three", import.meta.url)),
    },
  },
});
