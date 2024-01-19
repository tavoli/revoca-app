<template>
  <div id="swagger-ui"></div>
</template>

<script lang="tsx" setup>
  declare global {
    interface Window {
      ui: any;
      SwaggerUIBundle: any;
      SwaggerUIStandalonePreset: any;
    }
  }

  useHead({
    script: [
      {
        src: "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.11.1/swagger-ui-bundle.min.js",
        type: "text/javascript",
      },
      {
        src: "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.11.1/swagger-ui-standalone-preset.min.js",
        type: "text/javascript",
      },
      {
        src: "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.11.1/swagger-ui.min.css",
        type: "text/javascript",
      },
    ],
    link: [
      {
        rel: "stylesheet",
        href: "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.11.1/swagger-ui.min.css",
      },
      {
        rel: "stylesheet",
        href: "./swagger-ui-dark.css",
      },
    ],
  });

  onMounted(() => {
    const SwaggerUIBundle = window.SwaggerUIBundle;
    const SwaggerUIStandalonePreset = window.SwaggerUIStandalonePreset;

    const config = useRuntimeConfig();
    const domain = config.app.baseURL === '/' ? 'http://localhost:3000' : `https://${config.app.baseURL}`;
    
    const ui = SwaggerUIBundle({
      url: `${domain}/api/docs`,
      dom_id: "#swagger-ui",
      deepLinking: true,
      presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
      layout: "StandaloneLayout",
    });

    window.ui = ui;
  });
</script>
