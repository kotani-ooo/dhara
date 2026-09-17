import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { thirdPartyNotices } from "./scripts/third-party-notices.mjs";

export default defineConfig({
  base: process.env.BASE_PATH || "/",
  build: {
    outDir: "dist/client",
  },
  optimizeDeps: {
    include: ["react", "react-dom/client"],
  },
  plugins: [react(), thirdPartyNotices()],
});
