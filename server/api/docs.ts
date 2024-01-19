import swaggerJSDoc from "swagger-jsdoc";

export default defineEventHandler(() => {
  const swaggerDefinition = {
    openapi: "3.0.0",
    info: {
      title: "Revoca API",
      version: "1.0.0",
    },
    servers: [{ url: "/api" }],
    schemes:
      process.env.SWAGGER_SCHEMA_HTTPS === "true"
        ? ["https"]
        : ["http", "https"],
    components: {
      securitySchemes: {
        HeaderAuth: {
          type: "apiKey",
          in: "header",
          name: "Authorization",
        }
      },
    },
    security: {
      CookieAuth: [],
    },
  };

  const options = {
    swaggerDefinition,
    apis: ["./server/api/**/*.ts"],
  };

  return swaggerJSDoc(options);
});
