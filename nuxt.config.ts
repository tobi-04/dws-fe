// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  ssr: false,

  vite: {
    plugins: [tailwindcss()],
  },
  css: ["./app/assets/css/main.css"],

  modules: [
    "@nuxt/eslint",
    "@nuxt/hints",
    "@nuxt/image",
    "@nuxt/scripts",
    "@nuxt/test-utils",
    "@nuxt/ui",
    "@pinia/nuxt",
  ],

  ui: {
    prefix: "Tobi",
    theme: {
      defaultVariants: {
        color: "info",
        size: "lg",
      },
    },
    colorMode: false,
  },

  runtimeConfig: {
    public: {
      apiBaseUrl:
        process.env.NUXT_PUBLIC_API_BASE_URL || "http://localhost:6888",
      wsUrl: process.env.NUXT_PUBLIC_WS_URL || "http://localhost:3003",
    },
  },
});
