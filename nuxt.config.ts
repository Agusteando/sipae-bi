export default defineNuxtConfig({
  srcDir: ".",

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

  experimental: {
    parser: "acorn",
  },

  // ✅ Force Nitro to copy jiti's lazily-required babel runtime into .output
  nitro: {
    externals: {
      traceInclude: [
        "node_modules/jiti/dist/babel.cjs"
      ]
    }
  },

  runtimeConfig: {
    dbHost: process.env.DB_HOST,
    dbUser: process.env.DB_USER,
    dbPassword: process.env.DB_PASSWORD,
    dbName: process.env.DB_NAME,
    botBaseUrl: process.env.BOT_BASE_URL || "https://bot.casitaapps.com",
  },
});
