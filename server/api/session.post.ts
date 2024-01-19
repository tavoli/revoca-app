import { nanoid } from "nanoid";
import { z } from 'zod'

const sessionQuerySchema = z.object({
  username: z.string().min(3).max(20),
})

/**
 * @openapi
 *
 * /session:
 *   post:
 *     summary: Create a new session
 *     description: Create a new session
 *
 *     requestBody:
 *       description: The session to create
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Session'
 *
 *   responses:
 *     200:
 *       description: The session was successfully created
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Token'
 *
 *     400:
 *       description: The request was malformed
 *
 *     500:
 *       description: An internal server error occurred
 *
 * components:
 *  schemas:
 *    Session:
 *      type: object
 *      properties:
 *        username:
 *          type: string
 *          description: The username of the user
 *          example: 'johndoe'
 *          minLength: 3
 *          maxLength: 20
 *
 *    Token:
 *      type: string
 *      description: The JWT token
 *      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
 */

export default defineEventHandler(async (event) => {
  const result = await readValidatedBody(event, (body) => sessionQuerySchema.safeParse(body))

  if (!result.success) {
    setResponseStatus(event, 400);
    return result.error.issues;
  }

  try {
    const user = {
      id: nanoid(8),
      username: result.data.username,
    };

    const existingUser = await getUserByUsername(user.username);

    const tokenPayload = existingUser || user;

    const token = jwt.createToken(tokenPayload);

    if (!existingUser) {
      await insertUser(user);
    }

    setResponseStatus(event, 200);
    return { token };
  } catch (error) {
    console.error(error);
    setResponseStatus(event, 500);
    return 'Internal server error';
  }
});
