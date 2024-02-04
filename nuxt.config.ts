// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: {enabled: true},
  modules: ['@nuxtjs/tailwindcss'],
  experimental: { payloadExtraction: true },
  app: {
    head: {
      link: [
        {rel: 'preconnect', href: 'https://fonts.googleapis.com'},
        {rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous'},
        {rel: 'preconnect', href: 'https://unpkg.com', crossorigin: 'anonymous'},

        {href: 'https://fonts.googleapis.com/css2?family=Poppins:wght@200;300;700&display=swap', rel: 'stylesheet'},
        {href: 'https://unpkg.com/tippy.js@5/dist/backdrop.css'},
      ]
    }
  }
})
