export default defineNuxtConfig({
  modules: [
    '@nuxt/ui', 
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt'
  ],

  routeRules : {
    '/**': { ssr: false },
  },

  piniaPersistedstate: {
    cookieOptions: {
      sameSite: "strict"
    }
  },

  ui: {
    global: true,
    icons: ['vscode-icons','material-symbols','ri'],
  },

  app : {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
    },
},

  pinia: {
    storesDirs: ['./stores/**']
  },

  compatibilityDate: '2024-07-17'
})