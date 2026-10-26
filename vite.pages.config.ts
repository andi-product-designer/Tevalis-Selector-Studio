import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

// A separate static build keeps the existing Lovable/Cloudflare build intact.
// GitHub Pages serves the contents of dist/client under the repository name.
export default defineConfig({
  base: process.env["PAGES_BASE_PATH"] || "/Tevalis-Selector-Studio/",
  plugins: [
    tsConfigPaths(),
    tailwindcss(),
    tanstackStart({
      server: { entry: "server" },
      prerender: {
        enabled: true,
        autoSubfolderIndex: true,
        autoStaticPathsDiscovery: true,
        crawlLinks: true,
        failOnError: true,
      },
    }),
    react(),
  ],
});
