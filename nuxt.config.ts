// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/main.css'],
  postcss:{
    plugins:{
      tailwindcss: {},
      autoprefixer: {}
    },
  },
  // Ensure "build" is NOT referencing @prisma/client here
})