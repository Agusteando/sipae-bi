export default defineNuxtConfig({
  /**
   * This is the switch that decides where Nuxt looks for `app.vue`, `pages/`, etc.
   * If your project ended up with a different srcDir, Nuxt will ignore root `app.vue`.
   * For your setup, force Nuxt to use the repository root.
   */
  srcDir: ".",

  /**
   * Be explicit about directory locations to avoid Nuxt resolving to `src/` or `app/`
   * depending on template / prior config.
   */
  dir: {
    pages: "pages",
    layouts: "layouts",
    middleware: "middleware",
    plugins: "plugins",
    assets: "assets",
    public: "public",
  },

  ssr: true,

  typescript: {
    strict: true,
    shim: false,
  },

  runtimeConfig: {
    dbHost: process.env.DB_HOST,
    dbUser: process.env.DB_USER,
    dbPassword: process.env.DB_PASSWORD,
    dbName: process.env.DB_NAME,
    botBaseUrl: process.env.BOT_BASE_URL || "https://bot.casitaapps.com",
  },
});