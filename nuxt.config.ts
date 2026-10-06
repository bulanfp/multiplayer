import type { Plugin } from "vite";

// Pixel builds its CSS in a PostCSS step that Vite only re-runs when a file it saw at
// startup changes. Styles in files added later went missing until `pnpm dev` restarted,
// so reload Pixel's stylesheet whenever a file is added under app/.
function pixelCssOnNewFiles(): Plugin {
  return {
    name: "multiplayer:pixel-css-on-new-files",
    apply: "serve",
    configureServer(server) {
      server.watcher.on("add", (file) => {
        if (!/[\\/]app[\\/].+\.(vue|ts)$/.test(file)) return;
        for (const mod of server.moduleGraph.idToModuleMap.values()) {
          if (mod.id?.includes("pixel3-nuxt/dist/runtime/pixel.css")) server.reloadModule(mod);
        }
      });
    }
  };
}

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@mekari/pixel3-nuxt", "@nuxt/eslint"],

  // Register components by filename only — no folder-prefix (DefaultPageContent not TemplateDefaultPageContent)
  components: [{ path: "~/components", pathPrefix: false }],

  vite: {
    plugins: [pixelCssOnNewFiles()],
    optimizeDeps: {
      include: ["@mekari/pixel3"]
    }
  },

  // TODO: Remove this once this issue fixed https://github.com/nuxt/nuxt/issues/35033
  experimental: {
    viteEnvironmentApi: true
  }
});
