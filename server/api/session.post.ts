import { nanoid } from "nanoid";
import { z } from 'zod'

const sessionQuerySchema = z.object({
  username: z.string().min(3).max(20),
})

export default defineEventHandler(async (event) => {
  const result = await readValidatedBody(event, (body) => sessionQuerySchema.safeParse(body))

  if (!result.success) {
    return {
      statusCode: 400,
      body: result.error.issues,
    }
  }

  try {
    const user = {
      id: nanoid(8),
      username: result.data.username,
    };

    const existingUser = await getUserByUsername(user.username);

    const tokenPayload = existingUser || user;

    const token = jwt.createToken(tokenPayload);

    setCookie(event, 'session', token, jwt.cookieConfig);

    if (!existingUser) {
      await insertUser(user);
    }
      
    return {
      statusCode: 200,
      body: { message: 'success' },
    };
  } catch (error) {
    console.error(error);

    return {
      statusCode: 500,
      body: { message: 'error' },
    };
  }
});
