// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@mekari/pixel3-nuxt", "@nuxt/eslint"],

  // Register components by filename only — no folder-prefix (DefaultPageContent not TemplateDefaultPageContent)
  components: [{ path: "~/components", pathPrefix: false }],

  vite: {
    optimizeDeps: {
      include: ["@mekari/pixel3"]
    }
  },

  // TODO: Remove this once this issue fixed https://github.com/nuxt/nuxt/issues/35033
  experimental: {
    viteEnvironmentApi: true
  }
});
