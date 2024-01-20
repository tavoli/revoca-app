import swaggerJSDoc from "swagger-jsdoc";

/**
 * @openapi
 *
 * components:
 *   schemas:
 *     ValidationIssues:
 *      type: array
 *      items:
 *        type: object
 *        properties:
 *          code:
 *            type: string
 *            description: The validation issue code
 *          expected:
 *            type: string
 *            description: The expected value
 *          received:
 *            type: string
 *            description: The received value
 *          path:
 *            type: array
 *            items:
 *              type: string
 *              description: The path to the value
 *
 *     Unauthorized:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: The error message
 *           example: "Unauthorized"
 *
 *     NotFound:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: The error message
 *           example: "Not found"
 *
 *     InternalServerError:
 *      type: object
 *      properties:
 *        error:
 *          type: string
 *          description: The error message
 *          example: "An internal server error occurred"
 *
 *     Ok:
 *       type: object
 *       properties:
 *         ok:
 *           type: boolean
 *           description: The ok status
 *           example: true
 */

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
